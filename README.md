# 윤호진 · 박선영 모바일 청첩장

2027년 3월 6일 오후 1시 40분, 창원컨벤션센터(CECO) 3층 단독홀에서 열리는 결혼식 초대장입니다.

## 미리보기

https://hj37.github.io/hj37-wedding-letter/

## 사진 저장과 배포

사진 원본은 저장소에 넣지 않습니다. 원본은 내 PC의 `photos/originals/`에 두고, 암호화한 파일만 `photos/encrypted/`에 저장해 커밋합니다. `.gitignore`가 원본 폴더와 `.env.local`을 제외합니다.

1. 청첩장 저장소를 내려받고, 원본 사진을 `photos/originals/`에 복사합니다. 예: `photos/originals/hero-photo.jpg`.
2. `.env.local`에 `WEDDING_PHOTOS_PASSPHRASE=긴_암호문구`를 저장합니다. 암호문구는 저장소에 올리지 말고 안전한 곳에 보관합니다.
3. Node.js 20.6 이상에서 `node --env-file=.env.local scripts/encrypt-photos.mjs`를 실행합니다. AES-256-GCM 암호문이 `photos/encrypted/hero-photo.jpg.enc`로 생성됩니다.
4. GitHub 저장소의 **Settings → Secrets and variables → Actions → New repository secret**에서 이름을 `WEDDING_PHOTOS_PASSPHRASE`로 지정하고 같은 암호문구를 저장합니다.
5. `photos/encrypted/*.enc`와 사이트 변경을 `develop`에 커밋합니다. Actions가 배포 직전에 `scripts/decrypt-photos.mjs`로 사진을 복호화해 Pages 산출물에만 넣습니다.

사진 경로 예시: `photos/originals/hero-photo.jpg` → `photos/encrypted/hero-photo.jpg.enc` → 배포 사이트 `images/hero-photo.jpg`.

GitHub 저장소에는 암호문만 남고 원본 사진은 로컬에 남습니다. GitHub Pages에 올라간 사진은 방문자 누구나 볼 수 있고 내려받을 수 있습니다. 암호화는 공개 저장소에서 원본 사진을 감추기 위한 것이며, Pages 사진을 비밀번호로 보호하지는 않습니다.

`images/hero-photo-slot.svg`와 `images/gallery-slot-*.svg`는 실제 사진이 연결되지 않은 자리에 쓰는 시안입니다. 추가 사진도 같은 방식으로 `photos/originals/`에 두고 암호화합니다.

## 배경음악

사용 허가를 확인한 음원이 준비되면 `script.js`의 `BGM_SRC`를 설정합니다. 기존 템플릿의 음원은 저작권을 확인하기 전까지 배포하지 않습니다.

## 하객 미니미

하객이 고른 미니미는 Supabase `wedding_guest_minimis` 테이블에 저장되어 다른 방문자에게도 표시됩니다. RLS 정책은 공개 읽기와 추가만 허용하고 수정·삭제는 막습니다. 브라우저에는 공개용 anon 키만 둡니다.

## 배포

`develop` 브랜치에 push하면 GitHub Actions가 GitHub Pages에 배포합니다. 주소는 배포할 때마다 바뀌지 않습니다. 암호화 사진을 추가하기 전에 Actions secret을 등록해야 실제 사진이 공개됩니다.
