"""Create a private side-by-side audit of slide titles and guide headings.

Run after extracting each source PDF with `pdftotext -layout` into the
workspace's `.research/{date}-layout.txt`. The report stays outside the
public repository.
"""

from pathlib import Path
import csv
import re

ROOT = Path(__file__).resolve().parents[1]
RESEARCH = ROOT.parent / ".research"
RESEARCH.mkdir(exist_ok=True)
DATES = ("260902", "260909", "260916", "260923", "260930")

rows = []
for date in DATES:
    notes = (ROOT / "content" / "lectures" / f"{date}.md").read_text(encoding="utf-8")
    heads = list(re.finditer(r"^## 슬라이드 (\d+) · (.*)$", notes, re.MULTILINE))
    pages = (RESEARCH / f"{date}-layout.txt").read_text(encoding="utf-8").split("\f")
    if pages and not pages[-1].strip():
        pages.pop()
    if len(heads) != len(pages):
        raise ValueError(f"{date}: {len(heads)} guide entries, {len(pages)} PDF pages")
    for n, (head, page) in enumerate(zip(heads, pages), 1):
        lines = [re.sub(r"\s+", " ", line).strip() for line in page.splitlines()]
        lines = [line for line in lines if line]
        rows.append((date, n, head.group(2), lines[0] if lines else "", " / ".join(lines[1:4])))

with (RESEARCH / "slide-audit.tsv").open("w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f, delimiter="\t")
    writer.writerow(("date", "number", "guide_title", "slide_title", "slide_excerpt"))
    writer.writerows(rows)
print(f"Audited {len(rows)} slide-title pairs")
