// Original educational prescriptions; dilutions are NOT confirmed hospital standards.
// All volumes are FINAL solution volumes, not diluent volumes.
export const VERSION = '3.3.0';
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
    { drug: 'norepi', label: '첫 승압제', dose: 10, doseUnit: 'mcg/min', note: '중심정맥관 미확보 · 말초정맥 투여 상황', lines: ['안녕하세요. 오늘 함께 근무하게 된 담당 의사예요. 첫 환자를 같이 만나 볼까요?', '담관염으로 인한 패혈성 쇼크 환자가 올라왔어요. 68세 남자, 체중은 68 kg이고 MAP은 58 mmHg예요.', '중심정맥관은 아직 확보되지 않았어요. 말초정맥으로 Norepinephrine 10 mcg/min을 시작하는 처방입니다.', '교육용 희석 농도를 확인하고, 펌프에 설정할 시간당 주입 속도를 계산해 주세요. 서두르지 않아도 괜찮아요.'], success: '맞아요. 단위와 시간 기준을 정확히 맞췄네요. 다음 처방도 함께 확인해 볼까요?' },
    { drug: 'vaso', label: '추가 처방', dose: 0.03, doseUnit: 'units/min', note: '시나리오의 추가 승압제 처방', lines: ['이번에는 Vasopressin이 추가 처방됐어요.', '처방 용량은 0.03 units/min이에요. 앞선 약물과 용량 단위가 다르니, units를 기준으로 계산해 주세요.'], success: '정확해요. mcg와 units를 혼동하지 않고 계산했어요. 첫 병실의 미션을 모두 마쳤습니다.' },
  ] },
  { id: 1, title: '심장수술 후 부정맥', subtitle: '시간에 따라 달라지는 처방', patient: '80 kg 남자 · CABG POD 2', weight: 80, badge: 'RHYTHM', color: 'peach', vitals: ['HR', '150', '/min · AF'], summary: 'Herben → Amiodarone', steps: [
    { drug: 'dilt', label: '초기 처방', dose: 10, doseUnit: 'mg/hr', note: 'CABG POD 2 · AF RVR · HR 150/min', lines: ['이번 환자는 CABG 수술 후 2일째인 남자 환자예요. 체중은 80 kg입니다.', '심전도가 AF RVR로 바뀌었고 심박수는 150회/분이에요. 시나리오에서 Herben 지속주입 처방이 시작됐어요.', '처방은 10 mg/hr예요. 교육용 희석 농도를 확인하고, 시간당 주입 속도를 계산해 주세요.'], success: '좋아요. 이번 처방은 이미 시간당 용량이라, 분에서 시간으로 바꾸지 않아도 되죠.' },
    { drug: 'amio', label: '처음 6시간', dose: 1, doseUnit: 'mg/min', note: '혈압 85/50 mmHg · Herben 중단 · Amiodarone 변경', lines: ['환자의 혈압이 85/50 mmHg로 떨어져 Herben을 중단했어요. 새 처방은 Amiodarone입니다.', '이번 계산은 초기 부하 투여 이후, 1 mg/min으로 처음 6시간 동안 유지하는 구간이에요. 현재 표시된 희석 농도로 계산해 주세요.'], success: '맞아요. 분당 처방을 시간당 속도로 바꿨어요. 이제 6시간 이후의 처방으로 넘어갈게요.' },
    { drug: 'amio', label: '6시간 이후', dose: 0.5, doseUnit: 'mg/min', note: '6시간 이후 · 다음 18시간 유지 처방', lines: ['6시간이 지났어요. 같은 희석액으로 주입 용량을 감량하는 처방이 나왔어요.', '다음 18시간 동안 0.5 mg/min으로 유지합니다. 변경된 시간당 주입 속도를 계산해 주세요.'], success: '정확해요. 같은 농도에서 처방 용량이 절반이 되면 주입 속도도 절반이 되죠. 이 병실의 미션을 모두 마쳤어요.' },
  ] },
  { id: 2, title: '인공호흡기 진정', subtitle: '체중과 시간을 함께 살피기', patient: '70 kg 남자 · 폐렴 · 기관삽관', weight: 70, badge: 'COMFORT', color: 'lilac', vitals: ['WT', '70', 'kg · VENT'], summary: 'Precedex → Remifentanil', steps: [
    { drug: 'dex', label: '진정제 처방', dose: 0.4, doseUnit: 'mcg/kg/hr', note: '폐렴으로 기관삽관 · 체중 70 kg', lines: ['폐렴으로 기관삽관한 남자 환자가 입실했어요. 체중은 70 kg이에요.', '진정제 Precedex의 처방은 0.4 mcg/kg/hr예요. 환자의 체중을 반영해서 시간당 주입 속도를 계산해 주세요.'], success: '맞아요. 체중은 곱하고, hr 기준은 그대로 사용했어요. 이번에는 진통제 처방을 확인해 봅시다.' },
    { drug: 'remi', label: '진통제 처방', dose: 0.05, doseUnit: 'mcg/kg/min', note: '기관삽관 상태 · 체중 70 kg', lines: ['진통제 Remifentanil도 함께 투여하는 처방이에요.', '처방은 0.05 mcg/kg/min입니다. 이번에는 체중뿐 아니라, 분과 시간 그리고 mg와 mcg 변환도 확인해 주세요.'], success: '잘했어요. 체중, 용량 단위, 시간까지 모두 맞췄어요. 마지막 계산도 성공입니다.' },
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
    } else if (this.phase === 'correct') {
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
    if (value !== this.result.answer) return { status: 'incorrect' };
    this.records.push({ drug: this.step.drug, label: this.step.label, answer: this.result.answer, attempts: this.attempts, hints: this.hintsUsed });
    this.phase = 'correct';
    return { status: 'correct' };
  }
  hint() { if (this.phase !== 'mission') return null; return this.result.hints[Math.min(this.hintsUsed++, 2)]; }
  reset() { this.phase = 'home'; this.roomId = null; this.stepIndex = 0; this.records = []; }
}
