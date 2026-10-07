# 윤호진 · 박선영 모바일 청첩장

2027년 3월 6일 오후 1시 40분, 창원 세코 더 그레이드 웨딩홀에서 열리는 결혼식 초대장입니다.

## 미리보기

https://hj37.github.io/hj37-wedding-letter/

## 사진과 음원

- `images/hero-photo-slot.svg`, `images/gallery-slot-*.svg`는 사진 업로드 전 시안입니다. 공개해도 괜찮은 사진을 받은 뒤 이 파일들을 교체합니다.
- 배경음악은 사용 허가를 확인한 음원이 준비되면 `script.js`의 `BGM_SRC`를 설정합니다.
- 기존 템플릿의 음원은 저작권 확인 전까지 공개 배포에 포함하지 않습니다.

## 하객 미니미

하객이 고른 미니미는 Supabase `wedding_guest_minimis` 테이블에 저장되어 다른 방문자에게도 표시됩니다. 표의 RLS 정책은 읽기와 추가만 허용하고 수정·삭제는 막습니다. 키는 브라우저 공개용 anon 키만 사용합니다.

## 배포

`develop` 브랜치에 push하면 GitHub Actions가 GitHub Pages로 배포합니다. 페이지 주소는 고정이며, 이후 배포마다 바뀌지 않습니다.
