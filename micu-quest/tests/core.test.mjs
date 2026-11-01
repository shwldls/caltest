import test from 'node:test';
import assert from 'node:assert/strict';
import { DRUGS, ROOMS, QuestSession, calculate, defaultDilutions, format, formatAnswer, parseAnswer, roundAnswer, validateDilutions } from '../core.mjs';

const expected = [[20,4.5],[10,33.3,16.7],[7,4.2]];
test('all seven preserved prescriptions produce independently verified rates', () => {
  const mix = defaultDilutions();
  for (const [r,room] of ROOMS.entries()) for (const [i,step] of room.steps.entries()) {
    assert.equal(calculate(room,step,mix).answer, expected[r][i], `${room.title} / ${DRUGS[step.drug].name}`);
  }
});
test('mass conversion, weight and time bases are not interchangeable', () => {
  const mix = defaultDilutions();
  assert.equal(calculate(ROOMS[0],ROOMS[0].steps[0],mix).concentration,30);
  assert.equal(calculate(ROOMS[2],ROOMS[2].steps[0],mix).hourlyDose,28);
  assert.equal(calculate(ROOMS[2],ROOMS[2].steps[1],mix).hourlyDose,210);
  assert.equal(calculate(ROOMS[1],ROOMS[1].steps[0],mix).hourlyDose,10);
});
test('custom dilution propagates to rate, displayed mixture, hints and explanation', () => {
  const mix=defaultDilutions(); mix.norepi={amount:8,volume:100};
  const out=calculate(ROOMS[0],ROOMS[0].steps[0],mix);
  assert.equal(out.answer,7.5); assert.equal(out.mixLabel,'8 mg / 최종 100 mL');
  assert.match(out.hints[2],/8000 ÷ 100/); assert.match(out.explanation,/농도 약 80 mcg\/mL/);
  mix.amio={amount:450,volume:250};
  assert.equal(calculate(ROOMS[1],ROOMS[1].steps[1],mix).answer,33.3);
});
test('custom mixture values remain visible and rounding works at decimal ties', () => {
  const mix = defaultDilutions();
  mix.vaso = { amount: 0.00001, volume: 100 };
  const out = calculate(ROOMS[0], ROOMS[0].steps[1], validateDilutions(mix));
  assert.equal(out.mixLabel, '0.00001 units / 최종 100 mL');
  assert.match(out.explanation, /농도 약 0\.0000001 units\/mL/);
  assert.equal(format(0.00001), '0.00001');
  for (const [raw, rounded] of [[1.24,1.2],[1.25,1.3],[16.65,16.7],[9.95,10],[0.05,0.1],[0.04,0]]) assert.equal(roundAnswer(raw), rounded);
  assert.equal(formatAnswer(20), '20.0');
  assert.equal(formatAnswer(33.3), '33.3');
  mix.vaso.amount = 0.1234567890123;
  assert.throws(() => validateDilutions(mix), /유효숫자 12자리/);
});
test('unsafe and malformed input cannot turn into a positive submitted answer', () => {
  for(const v of ['', ' ', '0', '-5', 'NaN', 'Infinity', '1e3', '0x10', '1,2', '2.3.4', 'abc', null, undefined]) assert.equal(parseAnswer(v),null,String(v));
  assert.equal(parseAnswer('37.50'),37.5); assert.equal(parseAnswer('.5'),.5);
  for(const value of [0,-1,Infinity,NaN,1000001,'4',null]) {
    const mix=defaultDilutions();mix.norepi.amount=value;
    assert.throws(()=>validateDilutions(mix));
  }
  assert.throws(()=>validateDilutions({}));
});
test('every room can progress through dialogue, wrong answer, retry, all prescriptions and completion', () => {
  const quest=new QuestSession();
  for(const [r,room] of ROOMS.entries()) {
    quest.choose(r);
    for(const [i,step] of room.steps.entries()) {
      assert.equal(quest.phase,'intro'); assert.equal(quest.stepIndex,i);
      assert.equal(quest.submit(expected[r][i]).status,'inactive');
      for(let line=0;line<step.lines.length;line++) { assert.equal(quest.lineIndex,line);quest.advance(); }
      assert.equal(quest.phase,'mission');
      assert.equal(quest.submit('').status,'invalid'); assert.equal(quest.attempts,0);
      assert.equal(quest.submit('999').status,'incorrect'); assert.equal(quest.phase,'mission');
      assert.ok(quest.hint()); assert.equal(quest.hintsUsed,1);
      assert.equal(quest.submit(String(expected[r][i])).status,'correct'); assert.equal(quest.records.length,i+1);
      assert.equal(quest.submit(String(expected[r][i])).status,'inactive'); assert.equal(quest.records.length,i+1);
      quest.advance();
    }
    assert.equal(quest.phase,'complete'); assert.ok(quest.completed.has(r));
  }
  assert.equal(quest.completed.size,3);
  quest.reset();assert.equal(quest.phase,'home');assert.equal(quest.roomId,null);assert.equal(quest.completed.size,3);
});
test('answers require the rate rounded to one decimal, allowing equivalent trailing zeros', () => {
  const q=new QuestSession();q.choose(1);q.stepIndex=1;q.phase='mission';
  for (const input of ['33.33','33.34','33.4','33.299']) assert.equal(q.submit(input).status,'incorrect');
  assert.equal(q.submit('33.3').status,'correct');
  const q2=new QuestSession();q2.choose(0);q2.phase='mission';
  assert.equal(q2.submit('20').status,'correct');
  q2.choose(0);q2.phase='mission';
  assert.equal(q2.submit('20.0').status,'correct');
  const q3=new QuestSession();q3.choose(1);q3.stepIndex=2;q3.phase='mission';
  assert.equal(q3.submit('16.6').status,'incorrect');
  assert.equal(q3.submit('16.70').status,'correct');
});
test('replay clears per-room attempts and hints without losing completed-room collection', () => {
  const q=new QuestSession();q.completed.add(2);q.choose(0);q.phase='mission';q.hint();q.submit('5');q.choose(0);
  assert.equal(q.attempts,0);assert.equal(q.hintsUsed,0);assert.equal(q.records.length,0);assert.ok(q.completed.has(2));
  assert.throws(()=>q.choose(-1));assert.throws(()=>q.choose(3));assert.throws(()=>q.choose(1.5));
});
