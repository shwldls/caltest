import test from 'node:test';
import assert from 'node:assert/strict';
import { GameAudio, DEFAULT_VOLUMES, normalizeVolumes } from '../audio.mjs';

function harness() {
  const contexts = [], intervals = new Map(), timeouts = new Map(); let id = 0;
  const timers = {
    setInterval(fn) { intervals.set(++id, fn); return id; },
    clearInterval(key) { intervals.delete(key); },
    setTimeout(fn) { timeouts.set(++id, fn); return id; },
    clearTimeout(key) { timeouts.delete(key); },
  };
  class Context {
    constructor() { this.state = 'suspended'; this.currentTime = 0; this.destination = {}; contexts.push(this); }
    async resume() { this.state = 'running'; }
    async close() { this.state = 'closed'; }
    createOscillator() {
      return { frequency: {}, connect() {}, disconnect() {}, start() {}, stop() {} };
    }
    createGain() {
      return { gain: { value: 0, setValueAtTime(value) { this.value = value; }, exponentialRampToValueAtTime() {}, setTargetAtTime(value) { this.value = value; } }, connect() {}, disconnect() {} };
    }
  }
  return { audio: new GameAudio({ Context, timers }), contexts, intervals, timeouts };
}
const preferences = { sound: true, bgm: true, voice: true };

test('enabling preferences never autoplays; first gesture starts one quiet music loop', async () => {
  const { audio, contexts, intervals } = harness();
  audio.configure(preferences);
  assert.equal(contexts.length, 0);
  assert.equal(intervals.size, 0);
  assert.equal(await audio.play(), true);
  assert.equal(contexts.length, 1);
  assert.equal(intervals.size, 1);
  const music = [...audio.voices].filter(v => v.group === 'music').length;
  assert.ok(music > 0);
  await audio.play('success');
  assert.equal(intervals.size, 1, 'Repeated clicks must not stack the music');
  audio.configure({ ...preferences, bgm: false });
  assert.equal(intervals.size, 0);
  assert.ok([...audio.voices].every(v => v.group !== 'music'));
  assert.ok([...audio.voices].some(v => v.group === 'effect'));
});

test('dialogue blips ignore punctuation, throttle long frames and stop independently', async () => {
  const { audio } = harness();
  audio.configure({ ...preferences, bgm: false }); await audio.play();
  audio.dialogue(' ,…!');
  assert.equal([...audio.voices].filter(v => v.group === 'voice').length, 0);
  audio.dialogue('선'); audio.dialogue('생님');
  assert.equal([...audio.voices].filter(v => v.group === 'voice').length, 1);
  audio.context.currentTime = .1; audio.dialogue('안녕하세요');
  assert.equal([...audio.voices].filter(v => v.group === 'voice').length, 2, 'Missed letters emit one blip, never a burst');
  audio.stopVoices('voice');
  assert.equal([...audio.voices].filter(v => v.group === 'voice').length, 0);
  assert.ok([...audio.voices].some(v => v.group === 'effect'));
  audio.configure({ ...preferences, voice: false }); audio.dialogue('안');
  assert.equal([...audio.voices].filter(v => v.group === 'voice').length, 0);
});

test('master mute cancels queued music and all tones; background release allows fresh gesture recovery', async () => {
  const { audio, contexts, intervals } = harness();
  audio.configure(preferences); await audio.play(); audio.dialogue('말');
  audio.configure({ ...preferences, sound: false });
  assert.equal(intervals.size, 0); assert.equal(audio.voices.size, 0);
  assert.equal(contexts[0].state, 'closed'); assert.equal(await audio.play(), false);
  audio.configure(preferences); await audio.play();
  assert.equal(contexts.length, 2);
  audio.release();
  assert.equal(intervals.size, 0); assert.equal(audio.voices.size, 0);
  await audio.play();
  assert.equal(contexts.length, 3); assert.equal(intervals.size, 1);
});

test('a stalled Safari resume times out and never blocks subsequent audio attempts', async () => {
  const { audio, contexts, timeouts } = harness();
  audio.configure(preferences);
  // Supply a suspended context whose resume promise never settles.
  const Context = audio.Context;
  audio.context = new Context(); audio.context.resume = () => new Promise(() => {});
  const pending = audio.play();
  for (const callback of timeouts.values()) callback();
  assert.equal(await pending, false);
  assert.equal(timeouts.size, 0); assert.equal(audio.context, null);
  assert.equal(contexts[0].state, 'closed');
  assert.equal(await audio.play(), true);
});

test('muting while resume is pending cannot start late music or effects', async () => {
  const { audio, intervals } = harness();
  audio.configure(preferences);
  const Context = audio.Context; audio.context = new Context();
  let resume;
  audio.context.resume = () => new Promise(resolve => { resume = resolve; });
  const pending = audio.play();
  audio.configure({ ...preferences, sound: false }); resume();
  assert.equal(await pending, false);
  assert.equal(intervals.size, 0); assert.equal(audio.voices.size, 0);
});


test('independent volume levels update already playing channels without stacking music', async () => {
  const { audio, intervals } = harness();
  audio.configure(preferences); await audio.play('success'); await audio.play('wrong'); await audio.play(); audio.dialogue('음');
  const musicChannel = audio.channels.get('music');
  assert.equal(musicChannel.gain.value, 1, 'New controls preserve the previous default level');
  audio.configure({ ...preferences, volumes: { ...DEFAULT_VOLUMES, music: 100, voice: 80, click: 25, success: 100, wrong: 0 } });
  assert.equal(audio.channels.get('music'), musicChannel, 'Sustaining notes use the same live channel');
  assert.equal(musicChannel.gain.value, 4);
  assert.equal(audio.channels.get('voice').gain.value, 2);
  assert.equal(audio.channels.get('click').gain.value, .5);
  assert.equal(audio.channels.get('success').gain.value, 2);
  assert.equal(audio.channels.get('wrong').gain.value, 0);
  assert.equal(intervals.size, 1);
  audio.stopVoices('effect'); await audio.play('wrong');
  assert.equal([...audio.voices].filter(v => v.group === 'effect').length, 0, 'Zero-level effects remain silent');
  audio.configure({ ...preferences, volumes: { ...DEFAULT_VOLUMES, music: 0, voice: 0 } });
  assert.equal(intervals.size, 0); audio.dialogue('음');
  assert.ok([...audio.voices].every(v => v.group !== 'music' && v.group !== 'voice'));
});

test('invalid stored levels fall back safely while zero and maximum values survive reload', () => {
  assert.deepEqual(normalizeVolumes(), DEFAULT_VOLUMES);
  const saved = JSON.parse(JSON.stringify({ music: 100, voice: 0, click: -5, success: 1000, wrong: 'loud' }));
  assert.deepEqual(normalizeVolumes(saved), { music: 100, voice: 0, click: 0, success: 100, wrong: 50 });
  assert.equal(normalizeVolumes({ music: NaN }).music, DEFAULT_VOLUMES.music);
});
