"""Create a local slide index and publishable page images from course PDFs.

Usage: python tools/prepare_sources.py [SOURCE_DIRECTORY]
The PDFs and extracted text stay outside this repository. Only individual
WebP page images and a compact title index are written inside it.
"""

from pathlib import Path
from tempfile import TemporaryDirectory
import json
import re
import subprocess
import sys

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT.parent / 'slides'
RESEARCH = ROOT.parent / '.research'
DEST = ROOT / 'docs' / 'assets' / 'slides'
INDEX_FILE = ROOT / 'content' / 'slide-index.json'
POPPLER = Path(r'C:\Users\hsmai\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe')
RESEARCH.mkdir(parents=True, exist_ok=True)
DEST.mkdir(parents=True, exist_ok=True)
existing = json.loads(INDEX_FILE.read_text(encoding='utf-8')) if INDEX_FILE.exists() else []
existing_titles = {(course['date'], slide['number']): slide['title'] for course in existing for slide in course['slides']}

def clean_title(text: str, fallback: str) -> str:
    lines = [re.sub(r'\s+', ' ', line).strip(' •\t') for line in text.splitlines()]
    lines = [line for line in lines if line]
    if not lines:
        return fallback
    title = re.split(r'[•\n]', lines[0])[0].strip()
    title = re.sub(r'\s+\d{1,3}$', '', title).strip()
    return title[:90] if title else fallback

index = []
private_text = {}
for pdf in sorted(SOURCE.glob('*.pdf')):
    date = pdf.stem[2:] if re.fullmatch(r'20\d{6}', pdf.stem) else pdf.stem
    if date in private_text:
        raise ValueError(f'Duplicate lecture date after normalization: {date}')
    pages = PdfReader(str(pdf)).pages
    guide_path = ROOT / 'content' / 'lectures' / f'{date}.md'
    guide_titles = {}
    if len(pdf.stem) == 8 and guide_path.exists():
        guide_titles = {int(n): title for n, title in re.findall(r'^## 슬라이드 (\d+) · (.+)$', guide_path.read_text(encoding='utf-8'), re.M)}
    course = {'date': date, 'count': len(pages), 'slides': []}
    private_text[date] = []
    for number, page in enumerate(pages, 1):
        text = page.extract_text(extraction_mode='layout') or ''
        private_text[date].append(text)
        title = guide_titles.get(number) or existing_titles.get((date, number)) or clean_title(text, f'자료 {number}')
        course['slides'].append({'number': number, 'title': title})
    index.append(course)
    target = DEST / date
    target.mkdir(parents=True, exist_ok=True)
    if len(list(target.glob('*.webp'))) == len(pages):
        print(f'{date}: {len(pages)} page images already rendered', flush=True)
        continue
    with TemporaryDirectory(prefix=f'econ-history-{date}-') as temp:
        prefix = Path(temp) / 'page'
        subprocess.run([str(POPPLER), '-jpeg', '-jpegopt', 'quality=90', '-scale-to-x', '1500', '-scale-to-y', '-1', str(pdf), str(prefix)], check=True)
        files = sorted(Path(temp).glob('page-*.jpg'), key=lambda p: int(p.stem.rsplit('-', 1)[1]))
        if len(files) != len(pages):
            raise RuntimeError(f'{pdf.name}: {len(files)} rendered vs {len(pages)} pages')
        for number, file in enumerate(files, 1):
            with Image.open(file) as image:
                image.convert('RGB').save(target / f'{number:03d}.webp', 'WEBP', quality=85, method=5)
    print(f'{date}: rendered {len(pages)} page images', flush=True)

(ROOT / 'content').mkdir(exist_ok=True)
index.sort(key=lambda course: course['date'])
INDEX_FILE.write_bytes(json.dumps(index, ensure_ascii=False, indent=2).encode('utf-8'))
(RESEARCH / 'slide-text.json').write_bytes(json.dumps(private_text, ensure_ascii=False).encode('utf-8'))
print('Slide index and private text ready.', flush=True)
