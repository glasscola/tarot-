# GitHub Pages 배포

이 저장소는 별도 빌드가 없는 정적 사이트입니다. 사이트 파일은 저장소 루트에 있으며 `.nojekyll`로 Jekyll 처리를 생략합니다.

## 처음 설정할 때

1. [저장소](https://github.com/glasscola/tarot-)의 **Settings → Pages**를 엽니다.
2. **Build and deployment → Source**에서 **Deploy from a branch**를 선택합니다.
3. **Branch**를 **main**, 폴더를 **/(root)**로 선택하고 **Save**를 누릅니다.
4. **Actions** 탭에서 Pages 배포 실행이 성공했는지 확인합니다.
5. [https://glasscola.github.io/tarot-/](https://glasscola.github.io/tarot-/)을 엽니다. 첫 게시에는 잠시 시간이 걸릴 수 있습니다.

무료 GitHub Pages는 공개 저장소에서 사용할 수 있습니다. 공개 여부나 계정 정책이 바뀌면 Pages 지원 조건도 확인하세요. [GitHub 공식 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

이 저장소의 `.github/workflows/check.yml`은 코드 검증용입니다. 사이트 게시는 위의 브랜치 설정으로 GitHub Pages가 처리합니다.

## 수정 내용을 반영할 때

1. `index.html`, `styles.css`, `app.js`, `cards.js`, `engine.js` 또는 `assets/`를 수정합니다.
2. `npm test`로 엔진을 확인하고, 로컬 HTTP 서버에서 모바일·PC 화면을 살펴봅니다.
3. 수정 내용을 커밋하고 `main`에 푸시합니다. Pages 배포가 자동으로 실행됩니다.
4. Actions의 배포 성공과 실제 사이트를 확인합니다. 이전 화면이 남으면 브라우저를 새로고침하세요.

배포 주소에는 `/tarot-/` 경로가 붙습니다. 자산과 모듈은 `./assets/...`, `./engine.js` 같은 상대경로를 유지하세요. `/assets/...`처럼 도메인 루트부터 시작하는 경로는 이 사이트에서 깨질 수 있습니다.

## 기록·공유 확인

- 기록은 각 브라우저의 로컬 저장소에 보관됩니다. 다른 기기나 시크릿 모드에서는 같은 기록이 보이지 않습니다.
- `localhost`, 파일 주소, 배포 주소는 서로 다른 저장 공간입니다. 주소를 바꾸기 전 필요한 결과는 복사해 두세요.
- 브라우저 데이터 삭제 시 로컬 기록도 지워질 수 있습니다.
- 모바일의 공유 메뉴와 클립보드 기능은 브라우저 지원과 보안 환경에 영향을 받습니다. 배포 사이트의 HTTPS 주소에서 확인하세요.

## 게시가 되지 않을 때

- Pages 설정이 `main`과 `/(root)`인지 확인합니다.
- `index.html`과 `assets/`가 저장소 루트에 있는지 확인합니다. 파일 이름의 대소문자도 맞아야 합니다.
- Actions 탭에서 가장 최근 **pages build and deployment** 실행의 실패 단계를 확인합니다.
- 카드 이미지가 빠졌다면 해당 이미지 파일과 [assets/sources.json](assets/sources.json)의 경로를 함께 확인합니다.

[GitHub 공식 게시 소스 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
