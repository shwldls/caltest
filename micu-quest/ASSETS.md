# 그래픽 리소스

게임에 실제 래스터 PNG 리소스를 포함했습니다. 이모지나 기존 SVG 인물 그림으로 캐릭터를 대신하지 않습니다. 캐릭터 PNG 아틀라스를 inline SVG의 viewBox로 표시해 각 인물과 초상화를 독립적으로 배치하며, CSS로 idle·등장·정답 애니메이션을 적용합니다.

| 파일 | 내용 | 제작 |
|---|---|---|
| assets/ward.png | 3개 병상, 환자, 모니터, 인공호흡기, 수액펌프, 간호 스테이션, 커튼, 약품장, 카트 | built-in image_gen |
| assets/characters.png | 의사·간호사 초상화 및 전신 스프라이트, 투명 배경 | built-in image_gen, 근무복 색상 편집 |
| assets/favicon.svg | 심전도 모양 앱 아이콘 | 코드 작성 |

원래의 ward.svg와 doctor.svg는 새 게임에서 사용하지 않습니다. 실제 임상 사진은 근무복 색상 참고에만 사용했으며 저장소에 포함하지 않습니다.

## 아트 디렉션 / 최종 프롬프트 명세

배경: detailed 16-bit SNES-era pixel JRPG intensive care ward, wide 16:9 orthographic front/high-angle perspective, hard square pixel clusters, navy / pale slate / mint / muted teal / warm ivory, three adult patients in hospital beds, ECG monitors, ventilators with blue circuits, IV bags and syringe pumps, curtains, gas outlets, medical cabinets, nurse station, crash cart and stool, warm evening light, empty central walkway; no interface, labels, standing staff, emoji, photorealism or smooth vectors. 기존 첨부 픽셀 게임 이미지를 스타일 참고로 사용.

캐릭터: transparent 2×2 pixel sprite atlas, top-left friendly Korean male ICU physician waist-up with white coat, blue shirt, dark tie and stethoscope; top-right friendly female ICU nurse waist-up with dark low ponytail and ID badge; bottom row matching full-body chibi map sprites. Crisp square 16-bit pixel shading, separate figures, no text or UI.

최종 색상 편집: preserve physician, faces, hair, skin, badge, exact poses, sizes and placements; change only both nurse figures' scrub fabric from royal blue to the photo-reference subdued gray-mint / dusty blue-green, approximately base #8FAEB5, highlights #B4CCCD and shadows #5C7E89. Preserve transparency and pixel clusters. Reference photograph supplies clothing color only, not identity or clinical data.
