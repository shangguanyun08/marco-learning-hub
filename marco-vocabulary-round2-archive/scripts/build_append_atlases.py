"""Build exact 200x150 atlas cells from the new fixed-grid source sheets."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "illustrations"
GENERATED = Path("/workspace/scratch/388c4de98e7b/r2-generated-assets")
BACKGROUND = (247, 248, 245, 255)
PADDING = 8


def fit_cell(source: Image.Image) -> Image.Image:
    panel = source.convert("RGBA")
    background = Image.new("RGBA", panel.size, BACKGROUND)
    background.alpha_composite(panel)
    fitted = background.convert("RGB")
    fitted.thumbnail((200 - PADDING * 2, 150 - PADDING * 2), Image.Resampling.LANCZOS)
    cell = Image.new("RGB", (200, 150), BACKGROUND[:3])
    cell.paste(fitted, ((200 - fitted.width) // 2, (150 - fitted.height) // 2))
    return cell


def separator_runs(score: list[float], threshold: float = 0.96) -> list[tuple[int, int]]:
    runs: list[tuple[int, int]] = []
    start = None
    for index, value in enumerate(score):
        if value >= threshold and start is None:
            start = index
        if (value < threshold or index == len(score) - 1) and start is not None:
            end = index if value < threshold else index + 1
            runs.append((start, end))
            start = None
    return runs


def grid_bounds(image: Image.Image, columns: int, rows: int) -> tuple[list[int], list[int]]:
    pixels = __import__("numpy").asarray(image.convert("RGB"))
    light = __import__("numpy").all(pixels > 242, axis=2)
    x_runs = separator_runs(light.mean(axis=0).tolist())
    y_runs = separator_runs(light.mean(axis=1).tolist())
    if len(x_runs) < columns + 1 or len(y_runs) < rows + 1:
        return (
            [round(index * image.width / columns) for index in range(columns + 1)],
            [round(index * image.height / rows) for index in range(rows + 1)],
        )
    x_runs = x_runs[: columns + 1]
    y_runs = y_runs[: rows + 1]
    x_bounds = [x_runs[0][1]] + [run[0] for run in x_runs[1:]]
    y_bounds = [y_runs[0][1]] + [run[0] for run in y_runs[1:]]
    return x_bounds, y_bounds


def main() -> None:
    metadata = json.loads(Path("/workspace/scratch/388c4de98e7b/r2-missing-metadata.json").read_text())
    append_records = json.loads(Path("/workspace/scratch/388c4de98e7b/r2-append-records.json").read_text())
    source_records = json.loads(Path("/workspace/scratch/388c4de98e7b/r2-missing-source.json").read_text())
    if len(metadata) != 214 or len(source_records) != 214:
        raise RuntimeError("Expected 214 source records")

    manifest_path = ART / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if len(manifest["images"]) == 874 and len(manifest["atlases"]) == 19:
        # Allow a safe rebuild after an interrupted asset conversion.
        manifest["images"] = manifest["images"][:660]
        manifest["atlases"] = manifest["atlases"][:14]
    if len(manifest["images"]) != 660 or len(manifest["atlases"]) != 14:
        raise RuntimeError("Expected the untouched 660-word manifest")

    new_entries: list[dict[str, object]] = []
    new_atlases: list[dict[str, object]] = []
    for session in range(15, 20):
        start = (session - 15) * 50
        count = min(50, len(metadata) - start)
        rows = (count + 4) // 5
        atlas = Image.new("RGB", (1000, rows * 150), BACKGROUND[:3])
        sheets: dict[int, tuple[Image.Image, list[int], list[int]]] = {}
        for sheet_index in range((count + 7) // 8):
            sheet_path = GENERATED / f"session-{session}" / f"sheet-{sheet_index + 1:02}.png"
            if not sheet_path.exists():
                raise RuntimeError(f"Missing generated sheet: {sheet_path}")
            sheet = Image.open(sheet_path).convert("RGB")
            if sheet.width < 400 or sheet.height < 600:
                raise RuntimeError(f"Unexpected sheet size: {sheet_path} {sheet.size}")
            x_bounds, y_bounds = grid_bounds(sheet, 2, 4)
            sheets[sheet_index] = (sheet, x_bounds, y_bounds)
            source_rel = f"generated/session-{session}-sheet-{sheet_index + 1:02}.webp"
            source_path = ART / source_rel
            source_path.parent.mkdir(parents=True, exist_ok=True)
            sheet.save(source_path, "WEBP", quality=90, method=6)

        for offset in range(count):
            global_index = start + offset
            sheet_index, panel_index = divmod(offset, 8)
            sheet, x_bounds, y_bounds = sheets[sheet_index]
            row, col = divmod(panel_index, 2)
            left, right = x_bounds[col], x_bounds[col + 1]
            top, bottom = y_bounds[row], y_bounds[row + 1]
            panel = sheet.crop((left, top, right, bottom))
            source_rel = f"generated/session-{session}-sheet-{sheet_index + 1:02}.webp"
            cell = fit_cell(panel)
            atlas_row, atlas_col = divmod(offset, 5)
            atlas.paste(cell, (atlas_col * 200, atlas_row * 150))
            record = append_records[global_index]
            source_record = source_records[global_index]
            new_entries.append({
                "id": record["id"],
                "word": record["word"],
                "session": session,
                "position": offset + 1,
                "atlas": f"atlas/session-{session:02}.webp",
                "viewport": [atlas_col * 200, atlas_row * 150, 200, 150],
                "source": source_rel,
                "sourceCrop": [left, top, right, bottom],
                "sourceSize": [right - left, bottom - top],
                "sourceRecordId": source_record["id"],
            })
        for sheet, _, _ in sheets.values():
            sheet.close()
        atlas_path = ART / f"atlas/session-{session:02}.webp"
        atlas.save(atlas_path, "WEBP", quality=90, method=6)
        new_atlases.append({
            "session": session,
            "file": f"atlas/session-{session:02}.webp",
            "width": 1000,
            "height": rows * 150,
            "cell": [200, 150],
            "rows": rows,
            "sha256": hashlib.sha256(atlas_path.read_bytes()).hexdigest(),
        })

    manifest["version"] = 4
    manifest["totalWords"] = 874
    manifest["sessionCount"] = 19
    manifest["atlases"].extend(new_atlases)
    manifest["images"].extend(new_entries)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    art_js = ROOT / "art.js"
    art_js.write_text("// Explicit word-to-atlas artwork map.\nwindow.MARCO_R2_ART=" + json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"Built {len(new_entries)} new atlas mappings across {len(new_atlases)} sessions.")


if __name__ == "__main__":
    main()
