# MICU QUEST

병원 부서 전시회용 픽셀 RPG / 비주얼 노벨 약물 계산 시뮬레이션입니다.

- 공개 게임: https://shwldls.github.io/caltest/micu-quest/
- 기존 약물계산기: https://shwldls.github.io/caltest/ (별도 Flutter 앱, 수정하지 않음)
- 설치·계정·개인정보 입력이 필요 없는 정적 HTML/CSS/JavaScript 게임

## 플레이

근무 시작 → 병실 직접 선택/랜덤 배정 → 의사 설명 → 주입 속도 계산 → 정답 반응 → 후속 처방 → 병실 완료 → 다음 환자 → 전체 완료.

`▼ 다음`을 누르면 타이핑 중인 대사를 완성하고, 다시 누르면 다음 대사로 진행합니다. PC에서는 Enter 또는 Space도 사용할 수 있습니다. 계산 중에는 숫자 입력, 화면 키패드, Enter 제출을 지원합니다. iPhone처럼 터치 입력을 사용하는 기기에서는 화면 키패드를 사용해 시스템 키보드가 게임을 가리지 않게 합니다.

오답은 다시 계산할 수 있고, 힌트는 농도 → 시간/체중 → 계산식 순서로 제공됩니다. 완료 기록은 현재 게임 세션에만 유지하며, 전체 완료 후 `다음 참가자 시작`으로 초기화합니다.

## 유지한 시나리오

| 병실 | 처방 | 교육용 예시 희석액(최종 부피) | 기본 정답(mL/hr) |
|---|---|---|---:|
| 01 패혈성 쇼크 | Norepinephrine 10 mcg/min | 4 mg / 250 mL | 37.5 |
| 01 추가 처방 | Vasopressin 0.03 units/min | 20 units / 100 mL | 9 |
| 02 CABG POD 2 / AF RVR | Herben 10 mg/hr | 100 mg / 100 mL | 10 |
| 02 약물 변경 / 처음 6시간 | Amiodarone 1 mg/min | 900 mg / 500 mL | 33.33 |
| 02 이후 18시간 | Amiodarone 0.5 mg/min | 900 mg / 500 mL | 16.67 |
| 03 기관삽관 / 70 kg | Precedex 0.4 mcg/kg/hr | 200 mcg / 50 mL | 7 |
| 03 진통제 / 70 kg | Remifentanil 0.05 mcg/kg/min | 2 mg / 50 mL | 5.25 |

원본의 세 가지 임상 상황, 체중, 일곱 계산 처방을 유지했습니다. Amiodarone 대사에는 계산 대상이 초기 부하 투여 이후 구간임을 명확히 했습니다. 계산 학습용 가상 처방이며 치료 선택이나 투여 적절성을 평가하는 시뮬레이터가 아닙니다. 실제 환자에게 적용하지 마세요.

**병원 표준 농도는 미확정입니다.** 모든 희석 농도를 교육용 예시로 명시합니다. 상단 설정에서 여섯 약물의 약물량과 최종 부피를 변경할 수 있습니다. 단위는 고정해 mg/mcg/units 입력 혼동을 줄이며, 처방 단위로 변환한 농도에서 문제·정답·힌트를 함께 계산합니다. 입력 숫자는 각각 유효숫자 12자리 이하여야 합니다. 부피는 희석제 부피가 아닌 **약물을 포함한 최종 부피**입니다.

정답은 소수 둘째 자리로 반올림합니다. 37.50과 37.5를 모두 허용하고, 33.3처럼 요구 정밀도와 다른 값은 정답으로 처리하지 않습니다. 진행 중인 병실에서는 농도를 잠가 계산 도중 문제가 바뀌지 않게 합니다. 농도와 표시 속도는 `micu-quest:settings:v2` 이름으로 해당 브라우저에만 저장하며 기존 계산기의 저장 공간을 건드리지 않습니다.

공식 의약품 라벨 참고(시나리오 전체의 임상 적절성 또는 병원 표준 농도를 승인하는 근거가 아님):
- [DailyMed Amiodarone](https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d8d04647-8e25-4127-8ecf-360ce1991c2f&version=6)
- [DailyMed Precedex](https://dailymed.nlm.nih.gov/dailymed/fda/fdaDrugXsl.cfm?setid=548a88c0-afda-427e-75ac-5af0cfa2224c)

## 구현과 배포

- `core.mjs`: 원본 시나리오, 단위 변환, 농도 설정 검증, 정답 판정, 상태 전이
- `app.mjs`: 타이핑, 대화/계산 UI, 키패드, 애니메이션, 설정, 선택 가능한 효과음
- `styles.css`: PC 16:9 / 모바일 전용 레이아웃, safe-area, dvh, reduced-motion
- `assets/ward.png`, `assets/characters.png`: 실제 래스터 픽셀 배경 및 투명 캐릭터 아틀라스
- 외부 CDN·폰트·서비스 호출 없이 실행되며, 이미지 생성 기능은 런타임에 필요하지 않습니다.

기존 `.github/workflows/deploy.yml`은 Flutter 앱 검증·빌드 후 `micu-quest/`를 복사해 gh-pages에 함께 배포합니다. 이 게임 변경으로 `lib/`, `web/`, 기존 계산기 테스트, 배포 설정은 변경하지 않습니다.

검증: `node --test micu-quest/tests/core.test.mjs`.

실제 브라우저 QA와 검증 한계는 [QA.md](./QA.md), 그래픽 제작 내역은 [ASSETS.md](./ASSETS.md)를 참고하세요.
