# MICU QUEST 3.0.0 그래픽

실제 래스터 리소스를 게임에 포함합니다. 캐릭터는 PNG 아틀라스에서 SVG viewBox로 각 초상화와 전신 스프라이트 영역을 표시합니다. SVG로 인물을 새로 그리거나 이모지를 사용하지 않습니다. CSS의 idle, 등장, 성공 점프, 오답 흔들림으로 상태에 반응합니다.

| 파일 | 내용 | 출처 |
|---|---|---|
| assets/ward-v3.jpg | 1536×864, 3개 환자 침상·모니터·인공호흡기·수액펌프·간호 스테이션 | 이번 요청에 첨부된 병실 레퍼런스 원본을 그대로 포함 |
| assets/characters-v3.png | 1266×1243 RGBA, 의사·간호사 초상화와 전신 2×2 아틀라스 | 이번 요청의 캐릭터 레퍼런스에서 built-in image_gen으로 흰 배경만 투명화 |
| assets/favicon.svg | 심전도 모양 앱 아이콘 | 기존 게임 아이콘 유지 |

이전 ward.png, characters.png, ward.svg, doctor.svg는 이전 버전 호환을 위해 보관하지만 v3 UI에서 참조하지 않습니다.

## 이번 캐릭터 편집 프롬프트

Use case: background-extraction. Asset type: production sprite atlas for an actual 16-bit pixel RPG game. Edit target: the attached 2x2 character atlas. Remove ONLY the flat white background to genuine alpha transparency. Keep the white doctor's coat opaque. Preserve all four characters, exact identity, poses, colors, pixel clusters, outlines, scale and placement on the original 1266x1243 canvas. Top-left physician waist-up, top-right nurse waist-up, bottom-left matching doctor full body, bottom-right matching nurse full body. Do not redraw, rearrange, add text or UI, blur, or add shadows. This will be used as a real sprite texture in the game; ensure clean transparent negative space around every character.

내장 image_gen을 사용했으며 CLI/API fallback은 사용하지 않았습니다. PNG의 크기와 RGBA 알파 범위 0–255를 확인했습니다.

## v3.5 오리지널 합성 오디오

`audio.mjs`에 직접 작곡한 84 BPM, 8마디 반복 멜로디와 화음을 포함합니다. 작은 triangle/sine 파형 배경음, 짧은 triangle 대사음, 기존 클릭·정답·오답 효과음을 Web Audio로 합성합니다. 외부 음원·언더테일 녹음·샘플·원작 멜로디를 포함하지 않습니다.
