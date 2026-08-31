"""Extract the generated vocabulary contact sheets into exact card images."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SHEETS = ROOT / "illustrations"
OUTPUT = SHEETS / "panels"


def centered_crop_box(
    width: int,
    height: int,
    columns: int,
    rows: int,
    column: int,
    row: int,
) -> tuple[int, int, int, int]:
    """Return a panel box that excludes the thin contact-sheet dividers."""
    left = round(column * width / columns)
    right = round((column + 1) * width / columns)
    top = round(row * height / rows)
    bottom = round((row + 1) * height / rows)

    crop_width, crop_height = (310, 465) if rows == 2 else (196, 147)

    center_x = (left + right) / 2
    center_y = (top + bottom) / 2
    crop_left = round(center_x - crop_width / 2)
    crop_top = round(center_y - crop_height / 2)
    return crop_left, crop_top, crop_left + crop_width, crop_top + crop_height


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    panel_number = 1

    for session in range(1, 15):
        rows = 2 if session == 14 else 10
        sheet_path = SHEETS / f"session-{session}.webp"
        with Image.open(sheet_path) as sheet:
            sheet = sheet.convert("RGB")
            for row in range(rows):
                for column in range(5):
                    box = centered_crop_box(
                        sheet.width,
                        sheet.height,
                        columns=5,
                        rows=rows,
                        column=column,
                        row=row,
                    )
                    panel = sheet.crop(box)
                    panel.save(
                        OUTPUT / f"panel-{panel_number:03d}.webp",
                        "WEBP",
                        quality=96,
                        method=6,
                    )
                    panel_number += 1

    expected = 660
    actual = panel_number - 1
    if actual != expected:
        raise RuntimeError(f"Expected {expected} panels, created {actual}")
    print(f"Created {actual} panels in {OUTPUT}")


if __name__ == "__main__":
    main()
