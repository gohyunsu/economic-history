"""Use Poppler text layout to improve titles after preparing slide images."""
from pathlib import Path
import json
import re
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root.parent / 'slides'
target = root / 'content' / 'slide-index.json'
index = json.loads(target.read_text(encoding='utf-8'))
for lecture in index:
    data = subprocess.check_output(['pdftotext', '-layout', '-enc', 'UTF-8', str(source / (lecture['date'] + '.pdf')), '-'])
    pages = data.decode('utf-8-sig', errors='replace').split('\f')
    for slide, page in zip(lecture['slides'], pages):
        lines = [re.sub(r'\s+', ' ', line).strip() for line in page.splitlines()]
        lines = [line for line in lines if line]
        if lines:
            title = re.sub(r'\s+\d{1,3}$', '', lines[0]).strip()
            if title:
                slide['title'] = title[:100]
target.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding='utf-8')
