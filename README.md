# 경제사

2026년 2학기 경제사를 위한 슬라이드별 학습 가이드. 경제사 연구의 방법, 인구, 농업, 공업, 상업을 여섯 강의와 여덟 읽기 가이드로 연결한다.

**사이트:** <https://gohyunsu.github.io/economic-history/>

## 구성

| 위치 | 내용 |
| --- | --- |
| `content/lectures/` | 슬라이드 395장의 한국어 해설 |
| `content/readings/` | 주차별 읽기 자료 8건의 상세 가이드 |
| `docs/assets/slides/` | 각 슬라이드에 대응하는 웹 이미지 |
| `docs/assets/original-text/` | 텍스트 읽기 자료 4편의 PDF 쪽별 원문 텍스트 |
| `docs/` | GitHub Pages 정적 사이트와 PDF 가이드 |
| `guide/main.tex` | 독립형 LaTeX 가이드 원고 |
| `tools/` | 변환, 사이트 생성, 검사 스크립트 |

## 빌드

Node.js 22 이상에서 `npm install`과 `npm run build`를 실행하면 사이트와 `guide/main.tex`가 갱신된다. PDF 배포본은 LaTeX 원고를 컴파일한 결과를 `docs/study-guide.pdf`에 반영한다. `npm run check`는 페이지, 슬라이드 이미지, 원문 텍스트의 쪽수, 내부 링크와 배포용 PDF의 존재를 검사한다.

강의·읽기 자료의 보충 질문은 `:::question 질문`으로 시작하고 `:::`으로 닫는다. 읽기 자료의 질문은 관련 단락 뒤에 배치하며, 사이트에서는 슬라이드와 같은 펼쳐 보기 창으로 표시한다. 읽기 페이지의 단락 목차는 `##` 제목에서 자동 생성된다. LaTeX에서는 질문 제목과 답변이 본문에 이어진다.

텍스트 읽기 자료에는 원문 텍스트 창이 있다. 이미지로 스캔된 PDF는 OCR하고 글자 선택이 가능한 PDF는 텍스트 레이어를 추출한다. 쪽별 텍스트를 `docs/assets/original-text/`에 두며, 읽기 페이지에서 원문 창을 열면 자동으로 불러온다. 원문 PDF 파일 자체는 저장소에 포함하지 않는다. 창에서는 PDF 쪽별 이동, 텍스트 선택, 전체 쪽 검색을 할 수 있다.

새 슬라이드를 편집할 때에는 원본 PDF의 페이지별 텍스트를 저장소 밖의 `.research/{날짜}-layout.txt`에 추출해 `tools/audit_alignment.py`로 이미지·제목·해설을 일대일로 대조한다. 제목 인덱스는 `tools/refresh_titles.py`로 갱신한다.

원본 강의·읽기 자료는 이 공개 저장소에 포함하지 않는다. 슬라이드별 이미지와 학습을 위한 재구성 해설을 게시한다.
