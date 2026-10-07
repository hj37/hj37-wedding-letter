# 윤호진 · 박선영 모바일 청첩장

2027년 3월 6일 오후 1시 40분, 창원 세코 더 그레이드 웨딩홀에서 열리는 결혼식 초대장입니다.

## 미리보기

https://hj37.github.io/hj37-wedding-letter/

## 사진과 음원

- 사진 원본은 로컬의 `photos/originals/`에 두세요. 이 폴더는 저장소에 커밋하지 않습니다.
- Windows PowerShell에서 `scripts/encrypt-photos.ps1`을 실행하면 GPG가 JPG, JPEG, PNG, WebP를 암호화해 `photos/encrypted/*.gpg`에 저장합니다. 암호화할 때 모든 사진에 같은 강한 암호를 입력하세요.
- GitHub 저장소의 **Settings → Secrets and variables → Actions**에서 `WEDDING_PHOTOS_PASSPHRASE`라는 Repository secret을 만들고 같은 암호를 입력합니다. 암호문 파일만 커밋하면 Actions가 Pages 배포 직전에 `dist/images/`로 복호화합니다.
- 예: `photos/originals/hero-photo.jpg` → `photos/encrypted/hero-photo.jpg.gpg` → 배포 사이트의 `images/hero-photo.jpg`. 실제 사진을 추가할 때 청첩장 이미지 경로도 이 파일명으로 연결합니다.
- GitHub Pages에 복호화된 사진을 배포하면 방문자는 사진을 보고 저장할 수 있습니다. 이 방식은 공개 저장소의 원본 파일을 암호문으로 보관하는 용도입니다.
- `images/hero-photo-slot.svg`, `images/gallery-slot-*.svg`는 사진 업로드 전 시안입니다.
- 배경음악은 사용 허가를 확인한 음원이 준비되면 `script.js`의 `BGM_SRC`를 설정합니다.
- 기존 템플릿의 음원은 저작권 확인 전까지 공개 배포에 포함하지 않습니다.

## 하객 미니미

하객이 고른 미니미는 Supabase `wedding_guest_minimis` 테이블에 저장되어 다른 방문자에게도 표시됩니다. 표의 RLS 정책은 읽기와 추가만 허용하고 수정·삭제는 막습니다. 키는 브라우저 공개용 anon 키만 사용합니다.

## 배포

`develop` 브랜치에 push하면 GitHub Actions가 GitHub Pages로 배포합니다. 페이지 주소는 고정이며, 이후 배포마다 바뀌지 않습니다.
