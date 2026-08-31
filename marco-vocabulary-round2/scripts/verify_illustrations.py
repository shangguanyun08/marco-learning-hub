"""Verify every word-to-atlas mapping and every rebuilt illustration cell."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ILLUSTRATIONS = ROOT / "illustrations"
BACKGROUND = np.array([247, 248, 245], dtype=np.float32)
PADDING = 8


def load_words() -> list[dict[str, object]]:
    source = (ROOT / "data.js").read_text(encoding="utf-8")
    match = re.fullmatch(
        r"\s*//[^\n]*\nwindow\.MARCO_R2_WORDS=(\[.*\]);\s*",
        source,
        flags=re.DOTALL,
    )
    if not match:
        raise RuntimeError("Could not read data.js")
    return json.loads(match.group(1))


def expected_cell(source: Image.Image, crop: list[int], size: tuple[int, int]) -> Image.Image:
    panel = source.crop(tuple(crop))
    background = Image.new("RGBA", panel.size, (*BACKGROUND.astype(int), 255))
    background.alpha_composite(panel)
    fitted = background.convert("RGB")
    fitted.thumbnail(
        (size[0] - PADDING * 2, size[1] - PADDING * 2),
        Image.Resampling.LANCZOS,
    )
    cell = Image.new("RGB", size, tuple(BACKGROUND.astype(int)))
    cell.paste(fitted, ((size[0] - fitted.width) // 2, (size[1] - fitted.height) // 2))
    return cell


def main() -> None:
    words = load_words()
    manifest = json.loads((ILLUSTRATIONS / "manifest.json").read_text(encoding="utf-8"))
    entries = manifest["images"]
    atlas_records = manifest["atlases"]

    if len(words) != 660 or len(entries) != 660 or len(atlas_records) != 14:
        raise RuntimeError("Expected 660 words, 660 mappings, and 14 atlases")
    if len({str(word["id"]) for word in words}) != 660:
        raise RuntimeError("Vocabulary IDs are not unique")

    atlases: dict[str, np.ndarray] = {}
    for record in atlas_records:
        path = ILLUSTRATIONS / str(record["file"])
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest != record["sha256"]:
            raise RuntimeError(f"Atlas hash mismatch: {path.name}")
        with Image.open(path) as image:
            image.load()
            expected_size = (1000, 600) if record["session"] == 14 else (1000, 1500)
            if image.size != expected_size or image.mode != "RGB":
                raise RuntimeError(f"Invalid atlas geometry: {path.name} {image.size} {image.mode}")
            atlases[str(record["file"])] = np.asarray(image).copy()

    sources = {
        f"session-{session}.webp": Image.open(
            ILLUSTRATIONS / f"session-{session}.webp"
        ).convert("RGBA")
        for session in range(1, 15)
    }
    cell_hashes: set[str] = set()
    maximum_mae = 0.0
    maximum_edge_mae = 0.0

    for index, (word, entry) in enumerate(zip(words, entries, strict=True)):
        session = index // 50 + 1
        position = index % 50 + 1
        row, column = divmod(position - 1, 5)
        cell_size = (200, 300) if session == 14 else (200, 150)
        expected_viewport = [column * 200, row * cell_size[1], *cell_size]
        expected_atlas = f"atlas/session-{session:02}.webp"

        if (
            entry["id"] != word["id"]
            or entry["word"] != word["word"]
            or entry["session"] != session
            or entry["position"] != position
            or entry["atlas"] != expected_atlas
            or entry["viewport"] != expected_viewport
        ):
            raise RuntimeError(f"Mapping mismatch at word {index + 1}: {word['id']}")

        left, top, width, height = entry["viewport"]
        cell = atlases[expected_atlas][top : top + height, left : left + width]
        reference = np.asarray(
            expected_cell(sources[str(entry["source"])], entry["sourceCrop"], cell_size)
        ).astype(np.int16)
        mae = float(np.abs(cell.astype(np.int16) - reference).mean())
        maximum_mae = max(maximum_mae, mae)
        if mae > 5:
            raise RuntimeError(f"Cell/source mismatch for {word['id']}: MAE {mae:.3f}")

        edge = np.concatenate(
            [
                cell[:6].reshape(-1, 3),
                cell[-6:].reshape(-1, 3),
                cell[:, :6].reshape(-1, 3),
                cell[:, -6:].reshape(-1, 3),
            ]
        )
        edge_mae = float(np.abs(edge.astype(np.float32) - BACKGROUND).mean())
        maximum_edge_mae = max(maximum_edge_mae, edge_mae)
        if edge_mae > 2.5:
            raise RuntimeError(f"Unsafe atlas edge for {word['id']}: MAE {edge_mae:.3f}")

        cell_hash = hashlib.sha256(cell.tobytes()).hexdigest()
        if cell_hash in cell_hashes:
            raise RuntimeError(f"Duplicate illustration cell for {word['id']}")
        cell_hashes.add(cell_hash)

    print(
        "Verified 660/660 mappings, 660 unique cells, 14 decoded atlases; "
        f"max source MAE {maximum_mae:.3f}, max edge MAE {maximum_edge_mae:.3f}."
    )


if __name__ == "__main__":
    main()
