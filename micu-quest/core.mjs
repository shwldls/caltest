// Original educational prescriptions; dilutions are NOT confirmed hospital standards.
// All volumes are FINAL solution volumes, not diluent volumes.
export const VERSION = '3.8.0';
export const DRUGS = Object.freeze({
  norepi: { name: 'Norepinephrine', amount: 6, unit: 'mg', volume: 200 },
  vaso: { name: 'Vasopressin', amount: 40, unit: 'units', volume: 100 },
  dilt: { name: 'Herben (Diltiazem)', amount: 100, unit: 'mg', volume: 100 },
  amio: { name: 'Amiodarone', amount: 900, unit: 'mg', volume: 500 },
  dex: { name: 'Precedex', amount: 400, unit: 'mcg', volume: 100 },
  remi: { name: 'Remifentanil', amount: 2, unit: 'mg', volume: 40 },
});
export const ROOMS = [
  { id: 0, title: '패혈성 쇼크', subtitle: '혈압을 지키는 첫 번째 계산', patient: '68세 남자 · 담관염', weight: 68, badge: 'CIRCULATION', color: 'mint', vitals: ['MAP', '58', 'mmHg'], summary: 'Norepinephrine → Vasopressin', steps: [
    { drug: 'norepi', label: '첫 승압제', dose: 10, doseUnit: 'mcg/min', note: '중심정맥관 미확보 · 말초정맥 투여 상황', lines: ["선생님, 1번 환자 같이 봐주세요. 담관염으로 패혈성 쇼크가 온 68세 남자분이고, 체중은 68 kg입니다.", "지금 MAP이 58 mmHg예요. Norepinephrine 10 mcg/min으로 시작하겠습니다.", "중심정맥관은 아직 없어서 우선 말초 라인으로 투여할 예정이에요.", "준비된 희석액 농도 확인해서 펌프 속도를 맞춰주세요. 시간당 몇 mL 들어가면 될까요?"], retry: ["선생님, 처방은 mcg/min이고 펌프는 mL/hr예요. 분당 용량부터 시간당으로 바꿔보죠.", "희석액의 mg를 mcg로 바꾼 뒤, 1 mL에 들어가는 양을 다시 확인해 주세요."], success: "네, 속도 확인했습니다. 처방과 라인 확인하고, 시작 후 혈압 변화 같이 보겠습니다." },
    { drug: 'vaso', label: '추가 처방', dose: 0.03, doseUnit: 'units/min', note: '시나리오의 추가 승압제 처방', lines: ["선생님, 1번 환자 Vasopressin도 추가하겠습니다.", "용량은 0.03 units/min입니다. 준비된 Vasopressin 농도로 몇 mL/hr인지 확인해 주세요."], retry: ["선생님, 이번 처방은 units 기준이에요. Norepinephrine과 단위를 혼동하지 않았는지 확인해 주세요.", "분당 0.03 units에 60을 곱한 다음, 희석액의 units/mL로 나눠보죠."], success: "네, 맞습니다. 추가 처방까지 확인됐어요. 혈압 추이는 계속 같이 보겠습니다." },
  ] },
  { id: 1, title: '심장수술 후 부정맥', subtitle: '시간에 따라 달라지는 처방', patient: '80 kg 남자 · CABG POD 2', weight: 80, badge: 'RHYTHM', color: 'peach', vitals: ['HR', '150', '/min · AF'], summary: 'Herben → Amiodarone', steps: [
    { drug: 'dilt', label: '초기 처방', dose: 10, doseUnit: 'mg/hr', note: 'CABG POD 2 · AF RVR · HR 150/min', lines: ["선생님, 2번 환자 모니터 같이 봐주세요. CABG 수술 후 2일째인 남자분이고, 체중은 80 kg입니다.", "리듬이 AF로 바뀌었고 심박수가 150회/분이에요. Herben 지속주입 처방하겠습니다.", "용량은 10 mg/hr입니다. 준비된 희석액으로 몇 mL/hr인지 확인해서 알려주세요."], retry: ["선생님, Herben은 이미 mg/hr 처방이에요. 분에서 시간으로 바꾸는 계산이 들어갔는지 확인해 주세요.", "이번에는 시간당 10 mg을 희석액의 mg/mL로 나눠보죠. 준비된 농도부터 다시 맞춰보겠습니다."], success: "네, 속도 확인했습니다. 시작하고 혈압이랑 심박수 변화 같이 보겠습니다." },
    { drug: 'amio', label: '처음 6시간', dose: 1, doseUnit: 'mg/min', note: '혈압 85/50 mmHg · Herben 중단 · Amiodarone 변경', lines: ["선생님, 2번 환자 혈압이 85/50 mmHg까지 떨어졌어요. Herben은 중단하고 Amiodarone으로 변경하겠습니다.", "초기 부하 투여는 끝났고, 이제 1 mg/min으로 6시간 유지하는 처방입니다.", "지금 준비된 Amiodarone 농도로 유지 주입 속도 확인해 주세요."], retry: ["선생님, Amiodarone은 1 mg/min 처방이에요. 시간당 용량으로 바꾸는 부분부터 다시 보죠.", "희석액 1 mL에 몇 mg이 들어가는지 확인한 다음, 시간당 용량을 그 농도로 나눠주세요."], success: "네, 확인했습니다. 이 속도로 6시간 유지하고, 이후에는 감량 처방 다시 확인해 주세요." },
    { drug: 'amio', label: '6시간 이후', dose: 0.5, doseUnit: 'mg/min', note: '6시간 이후 · 다음 18시간 유지 처방', lines: ["선생님, Amiodarone 1 mg/min으로 유지한 지 6시간 됐습니다. 이제 용량 줄이겠습니다.", "같은 희석액으로 0.5 mg/min, 다음 18시간 유지할게요.", "변경된 처방 기준으로 펌프 속도 다시 확인해 주세요."], retry: ["선생님, 이번 처방은 0.5 mg/min이에요. 앞선 1 mg/min 처방으로 계산하지 않았는지 확인해 주세요.", "같은 희석액을 사용합니다. 먼저 시간당 용량을 구한 뒤 농도로 나누고, 마지막에 반올림해 주세요."], success: "네, 변경할 속도 확인됐습니다. 펌프 설정 바꾸기 전에 처방 한 번 더 맞춰보죠." },
  ] },
  { id: 2, title: '인공호흡기 진정', subtitle: '체중과 시간을 함께 살피기', patient: '70 kg 남자 · 폐렴 · 기관삽관', weight: 70, badge: 'COMFORT', color: 'lilac', vitals: ['WT', '70', 'kg · VENT'], summary: 'Precedex → Remifentanil', steps: [
    { drug: 'dex', label: '진정제 처방', dose: 0.4, doseUnit: 'mcg/kg/hr', note: '폐렴으로 기관삽관 · 체중 70 kg', lines: ["선생님, 3번 환자는 폐렴으로 기관삽관하고 인공호흡기 적용 중입니다. 체중은 70 kg이에요.", "진정제는 Precedex 0.4 mcg/kg/hr로 처방하겠습니다.", "체중 70 kg과 준비된 농도로 주입 속도 확인해 주세요. 펌프는 몇 mL/hr에 맞추면 될까요?"], retry: ["선생님, 체중 70 kg이 계산에 반영됐는지 먼저 확인해 주세요.", "이번 처방은 mcg/kg/hr예요. 체중은 곱하되, 60을 곱하는 계산은 필요하지 않습니다."], success: "네, 확인했습니다. 진정제 속도는 그렇게 맞추고, 진통제 처방도 이어서 확인하겠습니다." },
    { drug: 'remi', label: '진통제 처방', dose: 0.05, doseUnit: 'mcg/kg/min', note: '기관삽관 상태 · 체중 70 kg', lines: ["선생님, 같은 환자 Remifentanil도 함께 들어갈 예정이에요.", "용량은 0.05 mcg/kg/min이고, 체중은 70 kg으로 계산해 주세요.", "준비된 희석액 기준으로 펌프 속도 확인 부탁드립니다."], retry: ["선생님, 체중 70 kg과 분당 처방을 함께 확인해 주세요. 시간당 용량으로 환산해야 합니다.", "희석액은 mg, 처방은 mcg 기준이에요. mg를 mcg로 바꾸는 부분도 같이 확인해 보죠."], success: "네, 진통제 속도도 확인했습니다. 진정제와 진통제 처방 모두 확인됐네요. 수고하셨습니다." },
  ] },
];
// Retain meaningful digits for custom concentrations, including values below
// 0.0001. Rounding all display values to four decimal places could otherwise
// show a different mixture from the one used for the calculation.
const numberFormatter = new Intl.NumberFormat('en-US', { useGrouping: false, maximumSignificantDigits: 12 });
export const format = n => numberFormatter.format(n);
export const roundAnswer = n => Math.round((n + Number.EPSILON * Math.abs(n) * 4) * 10) / 10;
export const formatAnswer = n => n.toFixed(1);
export function defaultDilutions() { return Object.fromEntries(Object.entries(DRUGS).map(([key, d]) => [key, { amount: d.amount, volume: d.volume }])); }
export function validateDilutions(input) {
  const result = defaultDilutions();
  for (const key of Object.keys(DRUGS)) {
    const item = input?.[key];
    if (!item || !Number.isFinite(item.amount) || !Number.isFinite(item.volume) || item.amount <= 0 || item.volume <= 0 || item.amount > 1000000 || item.volume > 1000000) throw new Error('모든 약물량과 최종 부피에 0보다 크고 1,000,000 이하인 숫자를 입력해 주세요.');
    if ([item.amount, item.volume].some(n => Number(n.toPrecision(12)) !== n)) throw new Error('약물량과 최종 부피는 각각 유효숫자 12자리 이하로 입력해 주세요.');
    result[key] = { amount: item.amount, volume: item.volume };
  }
  return result;
}
export function calculate(room, step, dilutions) {
  const drug = DRUGS[step.drug], mix = dilutions[step.drug];
  const massFactor = drug.unit === 'mg' && step.doseUnit.startsWith('mcg') ? 1000 : 1;
  const concentration = mix.amount * massFactor / mix.volume;
  const weighted = step.doseUnit.includes('/kg') ? room.weight : 1;
  const minutes = step.doseUnit.endsWith('/min') ? 60 : 1;
  const hourlyDose = step.dose * weighted * minutes;
  const raw = hourlyDose / concentration;
  const unit = step.doseUnit.split('/')[0];
  const numerator = [format(step.dose), ...(weighted !== 1 ? [format(weighted)] : []), ...(minutes !== 1 ? ['60'] : [])].join(' × ');
  return { raw, answer: roundAnswer(raw), concentration, unit, hourlyDose,
    mixLabel: `${format(mix.amount)} ${drug.unit} / 최종 ${format(mix.volume)} mL`,
    formula: `(${numerator}) ÷ (${format(mix.amount * massFactor)} ÷ ${format(mix.volume)})`,
    explanation: `${format(mix.amount)} ${drug.unit}${massFactor === 1000 ? ` = ${format(mix.amount * 1000)} mcg` : ''} → 농도 약 ${format(concentration)} ${unit}/mL. 시간당 용량 ${format(hourlyDose)} ${unit}/hr ÷ 농도 = ${formatAnswer(roundAnswer(raw))} mL/hr.`,
    hints: [`먼저 희석액의 농도를 ${unit}/mL 단위로 구해 보세요.${massFactor === 1000 ? ' 1 mg = 1,000 mcg예요.' : ''}`, `${weighted !== 1 ? `체중 ${room.weight} kg을 곱하고, ` : ''}${minutes !== 1 ? '분당 용량에 60을 곱해 시간당 용량으로 바꾸세요.' : '이미 시간당 처방이므로 60을 곱하지 않아요.'}`, `주입 속도 = ${numerator} ÷ (${format(mix.amount * massFactor)} ÷ ${format(mix.volume)})`],
  };
}
export function parseAnswer(input) {
  const text = String(input).trim();
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return null;
  const n = Number(text);
  return Number.isFinite(n) && n > 0 ? n : null;
}
export class QuestSession {
  constructor(dilutions = defaultDilutions()) {
    this.dilutions = validateDilutions(dilutions);
    this.phase = 'home'; this.roomId = null; this.stepIndex = 0; this.lineIndex = 0;
    this.attempts = 0; this.hintsUsed = 0; this.records = []; this.completed = new Set();
  }
  get room() { return ROOMS[this.roomId]; }
  get step() { return this.room?.steps[this.stepIndex]; }
  get result() { return calculate(this.room, this.step, this.dilutions); }
  choose(id) {
    if (!Number.isInteger(id) || !ROOMS[id]) throw new Error('존재하지 않는 병실입니다.');
    this.roomId = id; this.stepIndex = 0; this.lineIndex = 0; this.attempts = 0; this.hintsUsed = 0;
    this.records = []; this.phase = 'intro';
  }
  advance() {
    if (this.phase === 'intro') {
      if (this.lineIndex + 1 < this.step.lines.length) this.lineIndex++;
      else this.phase = 'mission';
    } else if (['correct', 'review'].includes(this.phase)) {
      if (this.stepIndex + 1 < this.room.steps.length) {
        this.stepIndex++; this.lineIndex = 0; this.attempts = 0; this.hintsUsed = 0; this.phase = 'intro';
      } else { this.completed.add(this.roomId); this.phase = 'complete'; }
    }
    return this.phase;
  }
  submit(input) {
    if (this.phase !== 'mission') return { status: 'inactive' };
    const value = parseAnswer(input);
    if (value === null) return { status: 'invalid' };
    this.attempts++;
    const correct = value === this.result.answer;
    if (!correct && this.attempts < 3) return { status: 'incorrect' };
    const status = correct ? 'correct' : 'review';
    this.records.push({ drug: this.step.drug, label: this.step.label, answer: this.result.answer, submitted: value, outcome: status, attempts: this.attempts, hints: this.hintsUsed });
    this.phase = status;
    return { status };
  }
  hint() { if (this.phase !== 'mission') return null; return this.result.hints[Math.min(this.hintsUsed++, 2)]; }
  reset() { this.phase = 'home'; this.roomId = null; this.stepIndex = 0; this.records = []; }
}
