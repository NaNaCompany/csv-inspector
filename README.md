# CSV 인코딩 구조 점검

파일 바이트를 유지하면서 인코딩 후보 미리보기, 구분자 추정/지정, 엄격한 CSV 문법 검사, 레코드별 열 수 진단, 정규화 CSV와 오류 목록 내보내기를 제공하는 정적 앱입니다. `dist/index.html`이 진입점이며 설치·빌드·서버 API가 필요 없습니다.

## 지원 범위

- 한국어 `/`, 영어 `/en/`, 스페인어 `/es/`, 중국어 간체 `/zh/`, 일본어 `/ja/`, 독일어 `/de/` 및 각 경로의 수동 언어 메뉴.
- 로컬 파일과 직접 붙여넣기/편집. UTF-8, EUC-KR/CP949, UTF-16 LE/BE, Windows-1252 후보. WHATWG TextDecoder의 fatal 모드로 잘못된 바이트열을 거부합니다.
- 쉼표·세미콜론·탭·파이프. 자동 구분자는 첫 레코드의 인용부호 밖 구분자 수를 이용한 추정이므로 수동 확인이 필요합니다.
- 인용된 구분자, `""` 이스케이프, 셀 내부 CRLF/LF. 따옴표 오류는 물리적 원문 줄 번호와 함께 표시하고 출력을 중지합니다.
- 레코드 시작 줄과 기준 열 수를 대조합니다. 첫 레코드도 레코드 수에 포함합니다. 열 수 불일치 행을 자르거나 채우지 않습니다.
- 숫자·날짜·큰 정수·선행 0을 문자열 그대로 유지합니다. 결과는 쉼표 구분 UTF-8 BOM·CRLF로 저장합니다. 수식 보호는 선택적이며 켜면 `= + - @` 앞에 작은따옴표를 추가합니다.
- 원본 파일 다운로드는 최초 선택 바이트를 그대로 내보내며 편집한 원문으로 대체하지 않습니다. 예제/초기화 시 원본 보관을 해제합니다.

## 한계

- 파일 최대 2 MiB. 텍스트 최대 2,097,152 UTF-16 코드 단위, 10,000레코드, 200열, 200,000셀.
- 미리보기 최대 100레코드·셀당 160자. 내보내기는 전체 셀 텍스트를 보존합니다. 열 수 문제 목록은 화면 20건, 오류 CSV는 전체입니다.
- 자동 인코딩 판정은 없습니다. 디코딩 성공이 올바른 인코딩의 증거가 아니므로 후보 비교와 사용자의 선택이 필요합니다. 원문 U+FFFD는 경고합니다.
- 오류 CSV는 열 수 불일치 레코드의 번호·시작 줄·실제/기준 열 수를 제공합니다. CSV 문법 오류는 구조를 신뢰할 수 없어 다운로드하지 않습니다.
- 새로고침 또는 언어 경로 이동 시 입력은 사라집니다. 저장·업로드·원격 요청·데이터 번역 기능이 없습니다.
- 브라우저 시각·실제 상호작용 QA는 미수행. 소스·fixture 검증 완료 상태입니다.

## 검증

2026-10-26 실행. RTK proxy와 번들 Node를 사용했습니다. `$rtk`와 `$node`는 환경별 실행 파일의 절대 경로를 가리킵니다. 개인 경로를 산출물에 포함하지 않도록 기호로 표시합니다.

```powershell
& $rtk proxy $node --check dist/app.js
& $rtk proxy $node --test test.mjs
```

문법 검사 exit 0. Node test 9개 통과, 실패 0. 인용된 쉼표·이스케이프·멀티라인 CRLF·빈 셀, 따옴표 오류 줄 번호, 빈 레코드·끝 개행, 구분자 추정, 열 불일치 물리적 줄 번호, 선행 0·큰 정수·날짜·수식 round trip, 손상 UTF-8·불완전 UTF-16 거부, 한국어 EUC-KR fixture, 입력/열/레코드 상한, 6개 언어 경로와 번역 키를 검증했습니다.

`build_locales.py`는 개발 시 정적 경로를 생성합니다. 배포된 `dist/`는 빌드 없이 동작하며 모든 로직과 언어 사전이 자체 포함됩니다.

## 출처

- RFC 4180: https://www.rfc-editor.org/rfc/rfc4180
- WHATWG Encoding Standard: https://encoding.spec.whatwg.org/

UI·코드·예제는 자체 제작했습니다. 외부 폰트·이미지·라이브러리·광고·추적 코드가 없습니다.

## Public GitHub Pages release

Launch: https://nanalab.kr/csv-inspector/

Korean is at the root. English, Spanish, Chinese, Japanese and German use `/en/`, `/es/`, `/zh/`, `/ja/`, `/de/`.
GitHub Pages serves `main` → `/docs` using the branch build. No project CNAME is used.

Build: `node scripts/build-public.mjs`. The `dist/` snapshot and its original generators/tests are preserved as the application source. The public build adds metadata, six-locale sitemaps, original JPEG cards, More Apps styling and the existing NaNa publisher integrations. It does not upload selected user files.

Publisher integrations: AdSense, Google Tag Manager, Google Analytics and Cloudflare Web Analytics, with the same publisher settings as the NaNa Lab homepage. These scripts can make network requests independently of local file processing.

Original JPEG cards are rendered from original text and geometry using an installed system font; no font files are redistributed. Existing source references and third-party notices remain applicable.
