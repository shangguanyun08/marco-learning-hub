"""Verify vocabulary, session, source-crop, and final atlas integrity."""

from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ILLUSTRATIONS = ROOT / "illustrations"
BACKGROUND = np.array([247, 248, 245], dtype=np.float32)
PADDING = 8
EXPECTED_SESSION_SIZES = [*([50] * 13), 10, 50, 50, 50, 50, 14]
LEGACY_WORDS_SHA256 = "46653f1cbb28d56d4a8493b748cdecc0674e7de45c34ca584eb0816b31104c22"
LEGACY_ATLAS_HASHES = {
    "atlas/session-01.webp": "25bfbb01c4d2dd8fe78d0be75d4b25bc0481aca7eb1045e14968f037468d932b",
    "atlas/session-02.webp": "68962ce0307ac50576b8591c578fa1cd72ba4515a62b921521a938aea7e3ee6f",
    "atlas/session-03.webp": "33d52a8e22e3c8188b5b0a7c42a22e2a1bedfecb5fccddf842bc1591de535bb8",
    "atlas/session-04.webp": "77e12907ce023acc343d8b956c80b44d65ed994058a2d422af4f93bbeac741a1",
    "atlas/session-05.webp": "30c73466e728da2870cdfe03ddf3c6bc108842e810b3c0ac99ea5ac7df239257",
    "atlas/session-06.webp": "744e4c712e2298fe16bc9030047a2561d04ceb926063a5a7db0c90311643b4e3",
    "atlas/session-07.webp": "500b4ddb9e9e3498454cf39d98c8181c0ee335f379ec7edad50b565f36fd6296",
    "atlas/session-08.webp": "f24b5dff16ab15324cac9dfe653663335eb34c73f52e45588de4e073ab7dc2d2",
    "atlas/session-09.webp": "d08cecad1f41c31c0583e9ec43e8fe50dba961d9f46365419eeddcafc14fad35",
    "atlas/session-10.webp": "1b3fb3de72e08ce878508e0f229d2514bde0f4a37f78f984d1271529c2658d75",
    "atlas/session-11.webp": "3fb684d997aa34ee7e6cc096557ec0d27dd1a3d507c0d1d90e6e944726173934",
    "atlas/session-12.webp": "c9a240fc2e090f5234010e359de160af8fcc0a1f1d15d7de60ba76d7baee2124",
    "atlas/session-13.webp": "c7ec1ce77529a73825d5acdba70e1d5613e5ceeb7772efe171d4a68be3908aa1",
    "atlas/session-14.webp": "b05a1a7e68551662f438623f92e2208b31352edca4c1b301414120af91ea5b6f",
}


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


def normalized_word(value: object) -> str:
    plain = unicodedata.normalize("NFKD", str(value))
    plain = "".join(character for character in plain if not unicodedata.combining(character))
    return re.sub(r"[^a-z0-9]+", " ", plain.casefold()).strip()


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

    if len(words) != 874 or len(entries) != 874 or len(atlas_records) != 19:
        raise RuntimeError("Expected 874 words, 874 mappings, and 19 atlases")
    if len({str(word["id"]) for word in words}) != len(words):
        raise RuntimeError("Vocabulary IDs are not unique")
    if len({normalized_word(word["word"]) for word in words}) != len(words):
        raise RuntimeError("Vocabulary spellings are not unique after normalization")
    legacy_snapshot = json.dumps(
        words[:660], ensure_ascii=False, separators=(",", ":")
    ).encode("utf-8")
    if hashlib.sha256(legacy_snapshot).hexdigest() != LEGACY_WORDS_SHA256:
        raise RuntimeError("The original 660-word snapshot changed")

    session_counts = Counter(int(entry["session"]) for entry in entries)
    if [session_counts[number] for number in range(1, 20)] != EXPECTED_SESSION_SIZES:
        raise RuntimeError(f"Unexpected session sizes: {session_counts}")

    atlases: dict[str, np.ndarray] = {}
    atlas_meta: dict[str, dict[str, object]] = {}
    for record in atlas_records:
        file_name = str(record["file"])
        path = ILLUSTRATIONS / file_name
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest != record["sha256"]:
            raise RuntimeError(f"Atlas hash mismatch: {path.name}")
        if file_name in LEGACY_ATLAS_HASHES and digest != LEGACY_ATLAS_HASHES[file_name]:
            raise RuntimeError(f"Legacy atlas changed: {path.name}")
        expected_size = (int(record["width"]), int(record["height"]))
        cell_size = tuple(int(value) for value in record["cell"])
        rows = int(record["rows"])
        if expected_size != (cell_size[0] * 5, cell_size[1] * rows):
            raise RuntimeError(f"Inconsistent atlas metadata: {path.name}")
        with Image.open(path) as image:
            image.load()
            if image.size != expected_size or image.mode != "RGB":
                raise RuntimeError(f"Invalid atlas geometry: {path.name} {image.size} {image.mode}")
            atlases[file_name] = np.asarray(image).copy()
        atlas_meta[file_name] = record

    sources: dict[str, Image.Image] = {}
    cell_hashes: set[str] = set()
    maximum_mae = 0.0
    maximum_edge_mae = 0.0

    for index, (word, entry) in enumerate(zip(words, entries, strict=True)):
        session = int(entry["session"])
        position = int(entry["position"])
        atlas_name = str(entry["atlas"])
        record = atlas_meta.get(atlas_name)
        if not record:
            raise RuntimeError(f"Unknown atlas for {word['id']}: {atlas_name}")
        cell_size = tuple(int(value) for value in record["cell"])
        row, column = divmod(position - 1, 5)
        expected_viewport = [column * cell_size[0], row * cell_size[1], *cell_size]
        if (
            entry["id"] != word["id"]
            or entry["word"] != word["word"]
            or entry["viewport"] != expected_viewport
            or position < 1
            or position > session_counts[session]
        ):
            raise RuntimeError(f"Mapping mismatch at word {index + 1}: {word['id']}")
        if session == 14 and cell_size != (200, 300):
            raise RuntimeError("Session 14 must retain portrait cells")
        if session != 14 and cell_size != (200, 150):
            raise RuntimeError(f"Session {session} must use landscape cells")

        left, top, width, height = entry["viewport"]
        cell = atlases[atlas_name][top : top + height, left : left + width]
        source_name = str(entry["source"])
        if source_name not in sources:
            sources[source_name] = Image.open(ILLUSTRATIONS / source_name).convert("RGBA")
        source = sources[source_name]
        crop = [int(value) for value in entry["sourceCrop"]]
        if not (
            len(crop) == 4
            and 0 <= crop[0] < crop[2] <= source.width
            and 0 <= crop[1] < crop[3] <= source.height
        ):
            raise RuntimeError(f"Invalid source crop for {word['id']}: {crop}")
        reference = np.asarray(expected_cell(source, crop, cell_size)).astype(np.int16)
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

    for source in sources.values():
        source.close()
    print(
        "Verified 874/874 mappings, 874 unique cells, 19 decoded atlases; "
        f"max source MAE {maximum_mae:.3f}, max edge MAE {maximum_edge_mae:.3f}."
    )


if __name__ == "__main__":
    main()
