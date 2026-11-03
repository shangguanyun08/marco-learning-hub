"""Regenerate vocabulary tables: 30, 30, then 34 words on the final page."""
import json
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import Table, TableStyle

HERE = Path(__file__).resolve().parent
WORDS_PER_PAGE = 30

def load_js(name):
    text = (HERE / name).read_text(encoding="utf-8")
    return json.loads(text[text.index("{"):text.rindex("}") + 1])

def generate(output):
    data, meanings = load_js("data.js"), load_js("short-meanings.js")
    output.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(output), pagesize=letter)
    pdf.setTitle("Harry's Vocabulary - 30 Words Per Page")
    pdf.setAuthor("Marco Learning Hub")
    ink = colors.HexColor("#234a40")
    pages = [data["words"][i:i + WORDS_PER_PAGE] for i in range(0, len(data["words"]), WORDS_PER_PAGE)]
    if len(pages) > 1 and len(pages[-1]) < WORDS_PER_PAGE:
        tail = pages.pop()
        pages[-1].extend(tail)
    for page_number, words in enumerate(pages, 1):
        sets = list(dict.fromkeys(w["section"] for w in words))
        label = f"Set {sets[0]}" if len(sets) == 1 else f"Sets {sets[0]}-{sets[-1]}"
        pdf.setFillColor(ink)
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(42, 748, "HARRY - WORD MEANINGS")
        pdf.setFont("Helvetica-Bold", 24)
        pdf.drawString(42, 716, label)
        pdf.setFont("Helvetica", 12)
        pdf.drawString(225, 718, f"{len(words)} words")
        pdf.setFillColor(colors.black)
        pdf.setFont("Helvetica", 10)
        pdf.drawString(42, 691, "Cover the meanings. Say or write a simple meaning for each word.")
        pdf.setFont("Helvetica", 9)
        pdf.drawString(42, 671, "Name: ____________________________")
        pdf.drawRightString(570, 671, "Date: __________________")
        rows = [["Word", "Simple meaning"]] + [[w["word"], meanings[w["id"]].replace("\u2019", "'")] for w in words]
        table = Table(rows, colWidths=[227, 301], rowHeights=[20] + [17] * len(words))
        table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#edf2ee")),
            ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (1, 1), (1, -1), "Helvetica"),
            ("FONTSIZE", (0, 1), (-1, -1), 11),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
            ("GRID", (0, 0), (-1, -1), .6, colors.HexColor("#899d92")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ]))
        _, height = table.wrap(528, 600)
        table.drawOn(pdf, 42, 652 - height)
        pdf.setFont("Helvetica", 8)
        pdf.setFillColor(ink)
        pdf.drawString(42, 636 - height, "Close meanings are welcome.")
        pdf.drawRightString(570, 636 - height, f"Page {page_number} of {len(pages)}")
        pdf.showPage()
    pdf.save()

if __name__ == "__main__":
    import sys
    generate(Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "printouts/harry-vocabulary-all-sets.pdf")
