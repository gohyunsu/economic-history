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

Node.js 22 이상에서 `npm install`과 `npm run build`를 실행한다. 생성된 `guide/main.tex`를 XeLaTeX로 두 번 컴파일하고 `guide/main.pdf`를 `docs/study-guide.pdf`로 복사한 뒤 `npm run check`를 실행한다. 본문을 수정했다면 사이트와 PDF를 함께 다시 생성한다.

새 슬라이드를 편집할 때에는 원본 PDF의 페이지별 텍스트를 저장소 밖의 `.research/{날짜}-layout.txt`에 추출해 `tools/audit_alignment.py`로 이미지·제목·해설을 일대일로 대조한다. 제목 인덱스는 `tools/refresh_titles.py`로 갱신한다.

원본 강의·읽기 자료는 이 공개 저장소에 포함하지 않는다. 슬라이드별 이미지와 학습을 위한 재구성 해설을 게시한다.
