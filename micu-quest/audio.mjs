// Original, locally synthesized score and dialogue blips. No sampled game audio.
const MELODY = [
  [64,0,67,0,71,69,67,0], [62,0,64,0,67,0,0,0],
  [69,0,72,0,71,0,67,0], [64,0,62,0,60,0,0,0],
  [65,0,69,0,72,71,69,0], [67,0,64,0,62,0,0,0],
  [62,0,67,0,69,0,71,0], [67,0,64,0,60,0,0,0],
].flat();
const CHORDS = [[48,55,59],[45,52,55],[53,60,64],[48,55,59],[53,60,64],[45,52,55],[43,50,55],[48,55,59]];
const frequency = midi => 440 * 2 ** ((midi - 69) / 12);
const EIGHTH = 60 / 84 / 2;
export const DEFAULT_VOLUMES = Object.freeze({ music: 25, voice: 40, click: 50, success: 50, wrong: 50 });
export function normalizeVolumes(input) {
  return Object.fromEntries(Object.entries(DEFAULT_VOLUMES).map(([key, fallback]) => [key,
    Number.isFinite(input?.[key]) ? Math.round(Math.max(0, Math.min(100, input[key]))) : fallback,
  ]));
}

export class GameAudio {
  constructor({ Context = globalThis.AudioContext || globalThis.webkitAudioContext, timers = globalThis } = {}) {
    this.Context = Context; this.timers = timers;
    this.context = null; this.enabled = false; this.bgm = true; this.voice = true;
    this.volumes = normalizeVolumes(); this.channels = new Map();
    this.voices = new Set(); this.musicTimer = null; this.lastBlip = -Infinity; this.blipIndex = 0;
  }
  configure({ sound, bgm, voice, volumes }) {
    this.enabled = sound; this.bgm = bgm; this.voice = voice;
    this.volumes = normalizeVolumes(volumes);
    for (const [key, node] of this.channels) {
      node.gain.setTargetAtTime(this.volumes[key] / DEFAULT_VOLUMES[key], this.context.currentTime, .025);
    }
    if (!sound) this.release();
    else if (!bgm || this.volumes.music === 0) this.stopMusic();
    else if (this.context?.state === 'running') this.startMusic();
    if (!voice || this.volumes.voice === 0) this.stopVoices('voice');
  }
  // Called from a tap/key gesture; typing frames never try to unlock autoplay.
  async play(kind = 'click') {
    if (!this.enabled || !this.Context) return false;
    let context;
    try {
      if (!this.context || this.context.state === 'closed') this.context = new this.Context();
      context = this.context;
      if (context.state !== 'running') {
        let timeout;
        try {
          await Promise.race([context.resume(), new Promise((_, reject) => {
            timeout = this.timers.setTimeout(() => reject(new Error('Audio resume timed out')), 2000);
          })]);
        } finally { this.timers.clearTimeout(timeout); }
      }
      if (!this.enabled || this.context !== context || context.state !== 'running') return false;
      if (this.bgm) this.startMusic();
      if (kind === 'music') return true;
      if (kind === 'voice') { this.lastBlip = -Infinity; this.dialogue('아'); return true; }
      const channel = ['success','wrong'].includes(kind) ? kind : 'click';
      if (this.volumes[channel] === 0) return true;
      const notes = kind === 'success' ? [523,659,784] : kind === 'wrong' ? [196,164] : [540];
      notes.forEach((pitch, i) => this.tone(pitch, context.currentTime + i * .09, .15, .055, 'sine', 'effect', channel));
      return true;
    } catch {
      if (this.context === context) this.release();
      return false; // A browser audio failure must never hold up a mission.
    }
  }
  tone(pitch, at, duration, volume, wave, group, channel = group) {
    const context = this.context;
    if (!this.channels.has(channel)) {
      const bus = context.createGain();
      bus.gain.setValueAtTime(this.volumes[channel] / DEFAULT_VOLUMES[channel], context.currentTime);
      bus.connect(context.destination); this.channels.set(channel, bus);
    }
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = wave; oscillator.frequency.value = pitch;
    gain.gain.setValueAtTime(.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + Math.min(.012, duration / 4));
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    oscillator.connect(gain); gain.connect(this.channels.get(channel));
    const entry = { oscillator, gain, group, channel };
    this.voices.add(entry);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); this.voices.delete(entry); };
    oscillator.start(at); oscillator.stop(at + duration + .01);
  }
  dialogue(characters) {
    const context = this.context;
    if (!this.enabled || !this.voice || this.volumes.voice === 0 || context?.state !== 'running' || !/[\p{L}\p{N}]/u.test(characters)) return;
    // At most one soft voice blip per 75 ms, including on slower devices.
    if (context.currentTime - this.lastBlip < .075) return;
    this.lastBlip = context.currentTime;
    const pitches = [196,220,207.65,185,220,196];
    this.tone(pitches[this.blipIndex++ % pitches.length], context.currentTime, .032, .022, 'triangle', 'voice');
  }
  stopVoices(group) {
    for (const entry of [...this.voices]) {
      if (entry.group !== group) continue;
      entry.oscillator.onended = null;
      try { entry.oscillator.stop(); } catch { /* Already ended. */ }
      entry.oscillator.disconnect(); entry.gain.disconnect(); this.voices.delete(entry);
    }
  }
  startMusic() {
    if (this.musicTimer !== null || !this.enabled || !this.bgm || this.volumes.music === 0 || this.context?.state !== 'running') return;
    this.musicStep = 0; this.nextNote = this.context.currentTime + .06;
    const schedule = () => {
      if (this.context?.state !== 'running' || !this.enabled || !this.bgm) { this.stopMusic(); return; }
      // Do not replay missed bars after the browser has throttled its timers.
      if (this.nextNote < this.context.currentTime) this.nextNote = this.context.currentTime + .03;
      while (this.nextNote < this.context.currentTime + .25) {
        const step = this.musicStep % MELODY.length, note = MELODY[step];
        if (note) this.tone(frequency(note), this.nextNote, EIGHTH * 1.4, .014, 'triangle', 'music');
        if (step % 8 === 0) {
          CHORDS[step / 8].forEach(n => this.tone(frequency(n), this.nextNote, EIGHTH * 7.5, .004, 'sine', 'music'));
        }
        this.musicStep++; this.nextNote += EIGHTH;
      }
    };
    schedule();
    this.musicTimer = this.timers.setInterval(schedule, 100);
  }
  stopMusic() {
    if (this.musicTimer !== null) this.timers.clearInterval(this.musicTimer);
    this.musicTimer = null; this.stopVoices('music');
  }
  release() {
    this.stopMusic(); this.stopVoices('voice'); this.stopVoices('effect');
    for (const node of this.channels.values()) node.disconnect();
    this.channels.clear();
    const context = this.context; this.context = null; this.lastBlip = -Infinity;
    if (context && context.state !== 'closed') {
      try { Promise.resolve(context.close()).catch(() => {}); } catch { /* Browser is already tearing down. */ }
    }
  }
}
