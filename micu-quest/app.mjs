import { VERSION, DRUGS, ROOMS, QuestSession, defaultDilutions, validateDilutions, format, formatAnswer, parseAnswer } from './core.mjs?v=3.4.0';

const $ = id => document.getElementById(id);
const game = $('game'), view = $('view');
// New defaults revision starts every browser with the exhibition owner's settings.
// Subsequent user edits persist within this revision; calculator storage is untouched.
const STORE = 'micu-quest:settings:v3.1';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let settings = { dilutions: defaultDilutions(), speed: 26, sound: false };
try {
  const saved = JSON.parse(localStorage.getItem(STORE));
  if (saved) settings = { dilutions: validateDilutions(saved.dilutions), speed: [0, 14, 26, 42].includes(saved.speed) ? saved.speed : 26, sound: saved.sound === true };
} catch { /* Invalid/blocked storage falls back safely without touching calculator storage. */ }
const session = new QuestSession(settings.dilutions);
const completedRecords = new Map();
let typing = false, typeFrame = 0, fullText = '', typeGeneration = 0;
let transitioning = false, lastAdvance = 0, toastTimer = 0, audio = null;
let reactionTimer = 0;
const escapeHTML = str => String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const checkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5L20 6"/></svg>';
const arrow = '<span aria-hidden="true">↗</span>';
const bedNo = n => String(n + 1).padStart(2, '0');
function art(kind, className = '', label = '') {
  const boxes = { doctor: '0 0 640 752', nurse: '640 0 626 752', 'map-doctor': '220 795 280 440', 'map-nurse': '780 800 300 435' };
  return `<svg class="pixel-art ${className}" viewBox="${boxes[kind]}" ${label ? `role="img" aria-label="${escapeHTML(label)}"` : 'aria-hidden="true"'}><image href="./assets/characters-v3.png" width="1266" height="1243"/></svg>`;
}
$('actors').innerHTML = `${art('map-doctor', 'map-doctor')}<span class="talk-bubble">···</span>${art('map-nurse', 'map-nurse')}`;
function saveSettings() {
  try { localStorage.setItem(STORE, JSON.stringify(settings)); return true; }
  catch { toast('현재 게임에 적용했어요. 이 브라우저에서는 설정을 저장할 수 없어요.'); return false; }
}
function toast(message) {
  clearTimeout(toastTimer); $('toast').textContent = message; $('toast').classList.add('show');
  toastTimer = setTimeout(() => $('toast').classList.remove('show'), 3600);
}
async function sound(kind = 'click') {
  if (!settings.sound) return false;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state !== 'running') await audio.resume();
    if (!settings.sound || audio.state !== 'running') return false;
    const notes = kind === 'success' ? [523, 659, 784] : kind === 'wrong' ? [196, 164] : [540];
    notes.forEach((frequency, i) => {
      const oscillator = audio.createOscillator(), gain = audio.createGain(), at = audio.currentTime + i * .09;
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(.055, at + .012); gain.gain.exponentialRampToValueAtTime(.0001, at + .14);
      oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(at); oscillator.stop(at + .15);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
    return true;
  } catch { return false; /* Audio must never block game progression. */ }
}
function updateSoundButton() {
  $('sound-toggle').setAttribute('aria-pressed', String(settings.sound));
  $('sound-toggle').setAttribute('aria-label', settings.sound ? '효과음 끄기' : '효과음 켜기');
  $('sound-toggle').innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z${settings.sound ? 'M17 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14' : 'M17 9l4 6m0-6-4 6'}"/></svg><span class="sound-label">소리 ${settings.sound ? '켬' : '끔'}</span>`;
}
function stopTyping() {
  cancelAnimationFrame(typeFrame); typeGeneration++; typing = false;
}
function completeTyping() {
  if (!typing) return false;
  stopTyping(); const speech = $('speech'); if (speech) { speech.textContent = fullText; speech.classList.remove('typing'); }
  $('speech-announcement')?.replaceChildren(document.createTextNode(fullText));
  return true;
}
function startTyping(text) {
  stopTyping(); fullText = text;
  const speech = $('speech'); if (!speech) return;
  if (!settings.speed || reducedMotion.matches) { speech.textContent = text; $('speech-announcement').textContent = text; return; }
  typing = true; speech.textContent = ''; speech.classList.add('typing');
  const generation = typeGeneration, chars = Array.from(text); let start = 0;
  const tick = now => {
    if (generation !== typeGeneration || !speech.isConnected) return;
    if (!start) start = now;
    const count = Math.min(chars.length, Math.floor((now - start) / settings.speed) + 1);
    speech.textContent = chars.slice(0, count).join('');
    if (count === chars.length) { typing = false; speech.classList.remove('typing'); $('speech-announcement').textContent = text; }
    else typeFrame = requestAnimationFrame(tick);
  };
  typeFrame = requestAnimationFrame(tick);
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function transition(change, label = '') {
  if (transitioning) return;
  transitioning = true; stopTyping(); game.setAttribute('aria-busy', 'true'); view.inert = true;
  $('transition-label').textContent = label;
  $('transition').classList.add('active');
  try {
    await wait(reducedMotion.matches ? 0 : 260);
    change(); render();
    await wait(reducedMotion.matches ? 0 : 100);
    $('transition').classList.remove('active');
    await wait(reducedMotion.matches ? 0 : 300);
  } finally {
    transitioning = false; game.removeAttribute('aria-busy'); view.inert = false;
    const focus = view.querySelector('[data-autofocus], h1, h2');
    if (focus) { if (!focus.hasAttribute('tabindex')) focus.tabIndex = -1; focus.focus({preventScroll:true}); }
  }
}
function setView(name) {
  game.dataset.view = name;
  window.scrollTo(0, 0);
  if (session.roomId !== null) game.dataset.room = String(session.roomId); else delete game.dataset.room;
  $('bed-marker').textContent = session.roomId === null ? '' : bedNo(session.roomId);
  $('shift-label').innerHTML = session.roomId === null ? 'SHIFT 01 <i></i> READY' : `ROOM ${bedNo(session.roomId)} <i></i> ${session.stepIndex + 1}/${session.room.steps.length}`;
  $('scene-caption').hidden = !['home', 'select'].includes(name);
}
function homeView() {
  setView('home');
  view.innerHTML = `<div class="home-copy entrance"><span class="eyebrow light"><span class="tiny-cross"></span> YOUR FIRST SHIFT / 첫 번째 근무</span><h1>MICU<br><em>QUEST</em><span class="title-dot">.</span></h1><p class="home-korean">작은 계산,<br>커다란 연결.</p><p class="home-description">픽셀 중환자실에서 만나는 세 명의 환자.<br>의사와 대화하고, 당신의 계산으로 미션을 완성하세요.</p></div><div class="home-bottom entrance"><div class="home-facts"><span><b>03</b>개의 병실</span><i></i><span><b>07</b>개의 미션</span><i></i><span>시간 제한 없이<br><strong>나만의 페이스로</strong></span></div><button class="btn primary start-btn" data-action="start" data-autofocus type="button">근무 시작하기 <span aria-hidden="true">→</span></button></div><span class="art-credit">YOU ARE PART OF THE TEAM</span>`;
}
function selectView() {
  setView('select');
  view.innerHTML = `<div class="ward-hotspots" aria-label="침상에서 환자 선택">${ROOMS.map(r => `<button type="button" class="bed-hotspot" data-room="${r.id}" aria-label="${bedNo(r.id)}번 침상 ${r.title}"><span>${bedNo(r.id)}</span><i aria-hidden="true">▼</i></button>`).join('')}</div><div class="selection-heading entrance"><span class="eyebrow light">PATIENT SELECT / 환자 선택</span><h1>어느 병실부터 가볼까요?</h1><p>침상이나 아래 카드를 눌러 주세요.</p></div><div class="room-grid entrance">${ROOMS.map(r => `<button type="button" class="room-card ${r.color}" data-room="${r.id}" aria-label="${bedNo(r.id)}호실 ${r.title}"><div class="room-top"><span class="room-number">ROOM <b>${bedNo(r.id)}</b></span><span class="room-badge">${r.badge}</span></div><div class="room-card-body"><h2>${r.title}</h2><p>${r.subtitle}</p><span class="room-drugs">${r.summary}</span></div><div class="room-card-footer"><span>${r.steps.length}개의 계산 미션</span><span class="room-enter">병실 입장 ${arrow}</span></div></button>`).join('')}</div><div class="selection-bottom"><p>같은 처방도, 단위를 한 번 더 확인하기.</p><button class="btn glass" type="button" data-action="random">랜덤 배정 <span aria-hidden="true">↗</span></button></div>`;
}
function chapter() {
  const room = session.room;
  return `<div class="chapter-tag entrance"><span class="chapter-number">${bedNo(room.id)}</span><div><span class="eyebrow">${room.badge} / MISSION ${session.stepIndex + 1}</span><h2>${room.title}</h2></div><div class="mission-dots" aria-label="${room.steps.length}개 중 ${session.stepIndex + 1}번째 미션">${room.steps.map((_, i) => `<i class="${i < session.stepIndex ? 'done' : i === session.stepIndex ? 'current' : ''}"></i>`).join('')}</div></div><div class="vital-chip"><div class="vital-wave" aria-hidden="true"><svg viewBox="0 0 100 25"><path d="M0 15h20l5-5 5 10 8-18 8 23 7-10h47"/></svg></div><span>${room.vitals[0]} <b>${room.vitals[1]}</b> <small>${room.vitals[2]}</small></span></div>`;
}
function conversationView(correct = false) {
  setView(correct ? 'correct' : 'intro');
  const { room, step } = session, result = session.result;
  view.innerHTML = `${chapter()}<div class="story-panel entrance ${correct ? 'celebrate' : ''}"><div class="portrait">${art('doctor', 'portrait-art', '담당 의사 픽셀 초상화')}<div class="nameplate"><span class="live-dot"></span><b>담당 의사</b><small>중환자의학과</small></div></div><div class="dialog-box"><div class="dialog-heading"><span class="eyebrow">${correct ? 'MISSION CLEAR' : '담당 의사 · 처방 확인'}</span><span class="dialog-count">${correct ? '확인했습니다.' : `${session.lineIndex + 1} / ${step.lines.length}`}</span></div>${correct ? `<div class="success-answer">${checkIcon}<b>${formatAnswer(result.answer)}</b><span>mL/hr</span></div>` : ''}<p class="speech" id="speech" aria-hidden="true"></p><p class="sr-only" id="speech-announcement" aria-live="polite"></p>${correct ? `<details class="solution"><summary>계산 풀이 확인</summary><p>${result.formula} = <b>${formatAnswer(result.answer)} mL/hr</b></p><p>${result.explanation}</p></details>` : ''}<div class="dialog-footer"><span>${correct ? '한 번 더 확인하는 습관, 계속 이어가요.' : '타이핑 중 누르면 대사가 한 번에 표시돼요.'}</span><button class="btn ${correct ? 'primary' : 'dark'} next-btn" data-action="next" type="button" data-autofocus>${correct ? session.stepIndex + 1 === room.steps.length ? '병실 미션 완료' : '다음 처방으로' : '▼ 다음'}</button></div></div></div>${correct ? '<div class="confetti" aria-hidden="true">' + Array.from({length:16}, (_,i) => `<i style="--i:${i}"></i>`).join('') + '</div>' : ''}`;
  startTyping(correct ? step.success : step.lines[session.lineIndex]);
}
function missionView() {
  setView('mission');
  const { room, step } = session, result = session.result;
  view.innerHTML = `${chapter()}<div class="mission-layout entrance"><section class="order-card panel"><div class="mini-guide">${art('doctor', '', '담당 의사')}<div><span class="eyebrow">CALCULATION MISSION</span><p>펌프 속도 확인 부탁드립니다.</p></div><span class="step-chip">${session.stepIndex + 1} / ${room.steps.length}</span></div><h2 class="drug-title">${DRUGS[step.drug].name}<small>${step.label}</small></h2><dl class="prescription"><div><dt>환자</dt><dd>${room.patient}</dd></div><div><dt>체중</dt><dd>${room.weight} <span>kg</span></dd></div><div class="rx-dose"><dt>처방 용량</dt><dd>${format(step.dose)} <span>${step.doseUnit}</span></dd></div><div><dt>희석액</dt><dd>${result.mixLabel}</dd></div></dl><p class="clinical-note">${step.note}</p><div class="example-note"><span class="tiny-cross"></span><div><b>교육용 예시 농도</b><span>병원 표준 농도는 미확정입니다. 실제 투약에 사용하지 마세요.</span></div></div><div class="hint-row"><button class="text-btn" type="button" data-action="hint">계산 힌트 <span aria-hidden="true">+</span></button><span id="hint-count">0 / 3</span></div><div id="hint-text" class="hint-text" aria-live="polite" hidden></div></section><form class="calc-card panel" id="answer-form" novalidate><div class="calc-heading"><label for="answer-value">펌프 주입 속도</label><button class="text-btn" data-action="clear" type="button">지우기</button></div><div class="answer-field"><input id="answer-value" name="answer" type="text" inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" maxlength="16" placeholder="0.0" aria-describedby="rounding-note answer-feedback" aria-label="주입 속도 mL/hr"><span>mL/hr</span></div><p id="rounding-note" class="rounding-note">소수 둘째 자리에서 반올림 → 첫째 자리까지 · 끝자리 0 생략 가능</p><div class="keypad" aria-label="숫자 키패드">${['7','8','9','4','5','6','1','2','3','.','0','backspace'].map(key => `<button type="button" data-key="${key}" aria-label="${key === 'backspace' ? '한 자리 지우기' : key === '.' ? '소수점' : key}">${key === 'backspace' ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h12v14H9l-7-7zM12 9l5 6m0-6-5 6"/></svg>' : key}</button>`).join('')}</div><div id="answer-feedback" class="answer-feedback" role="status" aria-live="polite">숫자를 입력하고 제출해 주세요.</div><button class="btn primary submit-btn" type="submit">정답 제출 <span aria-hidden="true">→</span></button></form></div><div id="wrong-reaction" class="wrong-reaction" role="status" hidden>${art('doctor')}<p>선생님, 주입 속도 다시 확인해 주세요.<br>처방 단위와 희석 농도부터 같이 보죠.</p></div>`;
  const input = $('answer-value');
  // Custom keypad avoids iOS keyboard covering the game; physical typing remains available.
  if (matchMedia('(pointer: coarse)').matches) { input.inputMode = 'none'; input.readOnly = true; }
}
function completeView(all = false) {
  setView(all ? 'allcomplete' : 'complete');
  const room = session.room;
  const records = all ? [...completedRecords.values()].flat() : session.records;
  view.innerHTML = `<section class="completion-panel entrance"><div class="complete-portrait">${art('nurse', '', '담당 간호사 픽셀 초상화')}</div><div class="completion-content"><span class="eyebrow">${all ? 'ALL MISSIONS COMPLETE' : `ROOM ${bedNo(room.id)} / COMPLETE`}</span><div class="clear-stamp">${checkIcon}<span>SHIFT<br>CLEAR</span></div><h1>${all ? '오늘의 근무, 무사히 완료!' : '이 병실의 미션을 마쳤어요.'}</h1><p class="completion-message">${all ? '세 명의 환자, 일곱 번의 꼼꼼한 계산.<br>함께해 줘서 고마워요. 당신의 다음 근무도 응원할게요.' : `${room.title}<br>단위를 살피고, 계산하고, 다시 확인하는 한 걸음.`}</p><div class="completion-stats"><span><b>${records.length}</b>완료 미션</span><span><b>${records.filter(r=>r.attempts===1).length}</b>첫 시도 성공</span><span><b>${session.completed.size}<small>/ 3</small></b>완료 병실</span></div><details class="record-details"><summary>나의 계산 기록</summary><ul>${records.map(r=>`<li><span>${DRUGS[r.drug].name}<small>${r.label}</small></span><b>${formatAnswer(r.answer)} <small>mL/hr</small></b></li>`).join('')}</ul></details><div class="completion-actions">${all ? '<button type="button" class="btn primary" data-action="new-player" data-autofocus>다음 참가자 시작 →</button><button type="button" class="btn secondary" data-action="select">병실 다시 둘러보기</button>' : `<button type="button" class="btn primary" data-action="${session.completed.size === 3 ? 'allcomplete' : 'select'}" data-autofocus>${session.completed.size === 3 ? '전체 미션 결과 보기' : '다음 환자 선택'} →</button><button type="button" class="btn secondary" data-action="next-visitor">다음 참가자 시작</button><button type="button" class="btn secondary" data-action="replay">이 병실 다시 도전</button>`}</div><p class="completion-note">교육용 예시 농도 기준 · 실제 처방 판단을 평가하는 게임이 아닙니다.</p></div></section>`;
}
function render() {
  stopTyping(); clearTimeout(reactionTimer);
  ({ home: homeView, select: selectView, intro: () => conversationView(), mission: missionView, correct: () => conversationView(true), complete: () => completeView(), allcomplete: () => completeView(true) }[session.phase] || homeView)();
}
function chooseRoom(id) { sound(); transition(() => session.choose(id), `${bedNo(id)}호실 · ${ROOMS[id].title}`); }
function next() {
  if (transitioning || !['intro','correct'].includes(session.phase)) return;
  // The first click completes typing; only a subsequent click can advance the story.
  if (completeTyping()) { sound(); lastAdvance = performance.now(); return; }
  if (performance.now() - lastAdvance < 180) return;
  lastAdvance = performance.now(); sound();
  const before = session.phase, index = session.stepIndex;
  session.advance();
  if (session.phase === 'complete') completedRecords.set(session.roomId, session.records.map(r => ({...r})));
  if (before !== session.phase || index !== session.stepIndex) transition(() => {}, session.phase === 'mission' ? 'CALCULATION MISSION' : session.phase === 'complete' ? 'ROOM CLEAR' : '새로운 처방');
  else { const speech = $('speech'); $('speech-announcement').textContent = ''; $('view').querySelector('.dialog-count').textContent = `${session.lineIndex + 1} / ${session.step.lines.length}`; if (speech) startTyping(session.step.lines[session.lineIndex]); }
}
function submitAnswer() {
  if (transitioning || session.phase !== 'mission') return;
  const input = $('answer-value'), feedback = $('answer-feedback');
  const result = session.submit(input.value);
  if (result.status === 'invalid') { feedback.textContent = '0보다 큰 숫자를 입력해 주세요.'; feedback.dataset.state = 'error'; input.setAttribute('aria-invalid','true'); sound('wrong'); return; }
  if (result.status === 'incorrect') {
    feedback.textContent = '처방 용량·희석 농도·시간 단위를 다시 확인해 주세요.'; feedback.dataset.state = 'error'; input.setAttribute('aria-invalid','true');
    const card = $('answer-form'); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    $('wrong-reaction').hidden = false; clearTimeout(reactionTimer); reactionTimer = setTimeout(() => { const reaction = $('wrong-reaction'); if (reaction) reaction.hidden = true; }, 3200);
    sound('wrong'); return;
  }
  if (result.status === 'correct') { input.blur(); sound('success'); transition(() => {}, 'MISSION CLEAR'); }
}
function keyInput(key) {
  if (transitioning || session.phase !== 'mission') return;
  const input = $('answer-value'); let value = input.value;
  if (key === 'backspace') value = value.slice(0,-1);
  else if (key === '.') { if (value.includes('.')) return; value = value ? value + '.' : '0.'; }
  else if (/^\d$/.test(key)) { if (value.length >= 16) return; value = value === '0' ? key : value + key; }
  input.value = value; input.removeAttribute('aria-invalid'); sound();
}
function showSettings() {
  completeTyping();
  const active = ['intro','mission','correct'].includes(session.phase);
  const dialog = $('settings-dialog');
  dialog.innerHTML = `<form id="settings-form" novalidate><div class="modal-heading"><button class="modal-close icon-btn" type="button" data-action="close-settings" aria-label="설정 닫기">×</button><span class="eyebrow">GAME SETTINGS / v${VERSION}</span><h2 id="settings-title">나의 근무 설정</h2><p>모든 농도는 <b>교육용 예시</b>입니다. 병원 표준 농도는 미확정이며,<br class="desktop-only"> 최종 혼합액의 부피를 기준으로 계산합니다.</p></div><div class="preference-row"><label for="type-speed">대사 표시 속도</label><select id="type-speed" name="speed"><option value="42">천천히</option><option value="26">보통</option><option value="14">빠르게</option><option value="0">즉시 표시</option></select></div><div class="mix-heading"><h3>교육용 희석 농도</h3><button type="button" class="text-btn" data-action="default-mixes" ${active ? 'disabled' : ''}>예시값으로 복원</button></div>${active ? '<p class="settings-lock">진행 중에는 농도를 바꿀 수 없어요. 병실 미션을 마치거나 시작 화면으로 돌아가면 변경할 수 있어요.</p>' : ''}<div class="mix-table"><div class="mix-table-head"><span>약물명</span><span>약물량</span><span>최종 부피</span></div>${Object.entries(DRUGS).map(([key,d])=>`<div class="mix-row"><label for="mix-${key}-amount">${d.name}</label><div><input id="mix-${key}-amount" name="${key}-amount" type="text" inputmode="decimal" value="${format(settings.dilutions[key].amount)}" aria-label="${d.name} 약물량 ${d.unit}" ${active ? 'disabled' : ''}><span>${d.unit}</span></div><div><input id="mix-${key}-volume" name="${key}-volume" type="text" inputmode="decimal" value="${format(settings.dilutions[key].volume)}" aria-label="${d.name} 최종 부피 mL" ${active ? 'disabled' : ''}><span>mL</span></div></div>`).join('')}</div><p id="settings-error" class="settings-error" role="alert"></p><p class="settings-footnote">이 브라우저에만 저장됩니다. 농도를 변경하면 문제·정답·힌트가 함께 바뀝니다.<br>각 숫자는 유효숫자 12자리까지 입력할 수 있습니다. 실제 환자 처방이나 개인정보를 입력하지 마세요.</p><div class="modal-actions"><button class="btn secondary" type="button" data-action="close-settings">취소</button><button class="btn primary" type="submit">설정 저장</button></div></form>`;
  $('type-speed').value = String(settings.speed);
  dialog.showModal();
}
function submitSettings() {
  const form = $('settings-form'), active = ['intro','mission','correct'].includes(session.phase);
  try {
    const dilutions = active ? settings.dilutions : Object.fromEntries(Object.keys(DRUGS).map(key => [key, { amount: parseAnswer(form.elements[`${key}-amount`].value), volume: parseAnswer(form.elements[`${key}-volume`].value) }]));
    const validated = validateDilutions(dilutions);
    // Prevent educational settings that would round a positive rate to zero.
    const trial = new QuestSession(validated);
    for (const r of ROOMS) { trial.choose(r.id); for (let i=0;i<r.steps.length;i++) { trial.stepIndex = i; if (!Number.isFinite(trial.result.raw) || trial.result.answer <= 0 || trial.result.answer >= 1e12) throw new Error('주입 속도를 소수 첫째 자리로 표현할 수 있도록 농도를 조정해 주세요.'); } }
    settings.dilutions = validated; settings.speed = Number(form.elements.speed.value); session.dilutions = validateDilutions(validated);
    const saved = saveSettings(); $('settings-dialog').close(); if (saved) toast('설정을 저장했어요. 다음 계산부터 적용됩니다.');
  } catch (error) { $('settings-error').textContent = error.message; }
}
async function handleAction(action) {
  if (transitioning) return;
  if (action === 'next') { next(); return; }
  if (action === 'sound') {
    settings.sound = !settings.sound; updateSoundButton(); saveSettings();
    if (settings.sound) {
      const played = await sound('success');
      if (!settings.sound) return;
      if (played) toast('효과음을 켰어요. 클릭·정답·오답에 소리가 나요.');
      else { settings.sound = false; updateSoundButton(); saveSettings(); toast('소리를 시작하지 못했어요. 소리 버튼을 다시 눌러 주세요.'); }
    } else toast('효과음을 껐어요.');
    return;
  }
  sound();
  switch(action) {
    case 'start': case 'select': transition(() => { session.phase = 'select'; session.roomId = null; }, 'PATIENT SELECT'); break;
    case 'random': { const pool = ROOMS; chooseRoom(pool[Math.floor(Math.random() * pool.length)].id); break; }
    case 'hint': { const hint = session.hint(); if (hint) { $('hint-text').hidden = false; $('hint-text').textContent = hint; $('hint-count').textContent = `${Math.min(session.hintsUsed,3)} / 3`; } break; }
    case 'clear': $('answer-value').value = ''; $('answer-value').removeAttribute('aria-invalid'); break;
    case 'settings': showSettings(); break;
    case 'close-settings': $('settings-dialog').close(); break;
    case 'default-mixes': { if (['intro','mission','correct'].includes(session.phase)) break; const defaults = defaultDilutions(); for (const [key,value] of Object.entries(defaults)) { $(`mix-${key}-amount`).value = value.amount; $(`mix-${key}-volume`).value = value.volume; } break; }
    case 'home': if (['intro','mission','correct'].includes(session.phase)) { completeTyping(); $('leave-dialog').showModal(); } else transition(()=>session.reset(),'MICU QUEST'); break;
    case 'cancel-leave': $('leave-dialog').close(); break;
    case 'confirm-leave': $('leave-dialog').close(); transition(()=>session.reset(),'MICU QUEST'); break;
    case 'replay': chooseRoom(session.roomId); break;
    case 'allcomplete': transition(()=>{session.phase='allcomplete';},'ALL MISSIONS COMPLETE'); break;
    case 'next-visitor': transition(()=>{session.completed.clear(); completedRecords.clear(); session.reset(); session.phase='select';},'다음 참가자의 환자를 선택해 주세요'); break;
    case 'new-player': transition(()=>{session.completed.clear(); completedRecords.clear(); session.reset();},'새로운 근무를 시작합니다'); break;
  }
}
document.addEventListener('click', event => {
  const action = event.target.closest('[data-action]');
  if (action) { handleAction(action.dataset.action); return; }
  const room = event.target.closest('[data-room]'); if (room && session.phase === 'select') { chooseRoom(Number(room.dataset.room)); return; }
  const key = event.target.closest('[data-key]'); if (key) keyInput(key.dataset.key);
});
document.addEventListener('submit', event => { if (event.target.id === 'answer-form') { event.preventDefault(); submitAnswer(); } else if (event.target.id === 'settings-form') { event.preventDefault(); submitSettings(); } });
document.addEventListener('keydown', event => {
  if (event.repeat || event.isComposing || $('settings-dialog').open || $('leave-dialog').open || transitioning) return;
  const editing = /INPUT|TEXTAREA|SELECT/.test(event.target.tagName);
  if (['intro','correct'].includes(session.phase) && ['Enter',' '].includes(event.key) && !editing && !event.target.closest('summary') && (!event.target.closest('button') || event.target.closest('[data-action="next"]'))) { event.preventDefault(); next(); }
  else if (session.phase === 'mission' && (!editing || event.target.readOnly)) {
    if (/^\d$/.test(event.key) || event.key === '.') { event.preventDefault(); keyInput(event.key); }
    else if (event.key === 'Backspace') { event.preventDefault(); keyInput('backspace'); }
    else if (event.key === 'Enter' && !event.target.closest('button')) { event.preventDefault(); submitAnswer(); }
  }
});
// iOS dialogs can change viewport sizes; dvh and safe-area CSS handle the visible game.
updateSoundButton(); render();
