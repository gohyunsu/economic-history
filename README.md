# 경제사

2026년 2학기 경제사를 위한 슬라이드별 학습 가이드. 경제사 연구의 방법, 인구, 농업, 공업을 다섯 강의와 여덟 읽기 가이드로 연결한다.

**사이트:** <https://gohyunsu.github.io/economic-history/>

## 구성

| 위치 | 내용 |
| --- | --- |
| `content/lectures/` | 슬라이드 314장의 한국어 해설 |
| `content/readings/` | 주차별 읽기 자료 8건의 상세 가이드 |
| `docs/assets/slides/` | 각 슬라이드에 대응하는 웹 이미지 |
| `docs/` | GitHub Pages 정적 사이트와 PDF 가이드 |
| `guide/main.tex` | 독립형 LaTeX 가이드 원고 |
| `tools/` | 변환, 사이트 생성, 검사 스크립트 |

## 빌드

Node.js 22 이상에서 `npm install`, `npm run build`, `npm run check` 순서로 실행한다. `guide/main.tex`는 XeLaTeX로 두 번 컴파일한 뒤 `guide/main.pdf`를 `docs/study-guide.pdf`로 복사한다. 슬라이드 이미지와 본문을 수정했다면 PDF를 다시 컴파일하고 검사를 반복한다.

원본 강의·읽기 자료는 이 공개 저장소에 포함하지 않는다. 슬라이드별 이미지와 학습을 위한 재구성 해설을 게시한다.
