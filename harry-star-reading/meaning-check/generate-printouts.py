"""Regenerate the seven one-page vocabulary tables from the site's word data."""
import json
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import Table, TableStyle

HERE = Path(__file__).resolve().parent

def load_js(name):
    text = (HERE / name).read_text(encoding="utf-8")
    return json.loads(text[text.index("{"):text.rindex("}") + 1])

def generate(output):
    data, meanings = load_js("data.js"), load_js("short-meanings.js")
    output.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(output), pagesize=letter)
    pdf.setTitle("Harry's Vocabulary - Seven Printable Sets")
    pdf.setAuthor("Marco Learning Hub")
    ink = colors.HexColor("#234a40")
    for section in data["sections"]:
        number = section["number"]
        pdf.setFillColor(ink)
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(42, 748, "HARRY - WORD MEANINGS")
        pdf.setFont("Helvetica-Bold", 26)
        pdf.drawString(42, 714, f"Set {number}")
        pdf.setFont("Helvetica", 13)
        pdf.drawString(126, 716, f"{section['count']} words")
        pdf.setFillColor(colors.black)
        pdf.setFont("Helvetica", 10.5)
        pdf.drawString(42, 688, "Cover the meanings. Say or write a simple meaning for each word.")
        pdf.setFont("Helvetica", 10)
        pdf.drawString(42, 666, "Name: ____________________________")
        pdf.drawRightString(570, 666, "Date: __________________")
        rows = [["Word", "Simple meaning"]] + [
            [w["word"], meanings[w["id"]].replace("\u2019", "'")]
            for w in data["words"] if w["section"] == number
        ]
        table = Table(rows, colWidths=[220, 308], rowHeights=[28] + [32] * (len(rows) - 1))
        table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 11),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#edf2ee")),
            ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (1, 1), (1, -1), "Helvetica"),
            ("FONTSIZE", (0, 1), (-1, -1), 14),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
            ("GRID", (0, 0), (-1, -1), .6, colors.HexColor("#899d92")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        _, height = table.wrap(528, 600)
        table.drawOn(pdf, 42, 646 - height)
        pdf.setFont("Helvetica", 9)
        pdf.setFillColor(ink)
        pdf.drawString(42, 628 - height, "Close meanings are welcome.")
        pdf.drawRightString(570, 628 - height, f"Set {number} of {len(data['sections'])}")
        pdf.showPage()
    pdf.save()

if __name__ == "__main__":
    import sys
    generate(Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "printouts/harry-vocabulary-all-sets.pdf")
