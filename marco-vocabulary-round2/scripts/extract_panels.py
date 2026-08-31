"""Rebuild every vocabulary sheet with perfectly uniform, verified cells.

The generated contact sheets look like grids, but several sheets (especially
Session 1) have uneven row heights. Splitting them with equal-size arithmetic
therefore cuts two illustrations into the same card. This script measures the
actual separator bands, removes those bands, and places every complete panel on
a fixed-size atlas cell. The browser then selects the cell with an exact SVG
viewBox rather than fragile background-position percentages.
"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SHEETS = ROOT / "illustrations"
OUTPUT = SHEETS / "atlas"
MANIFEST = SHEETS / "manifest.json"
DATA = ROOT / "data.js"
BACKGROUND = (247, 248, 245, 255)
LANDSCAPE_CELL = (200, 150)
PORTRAIT_CELL = (200, 300)
# Keep meaningful artwork away from atlas boundaries so browser and WebP
# resampling can only ever encounter the neutral cell edge, not a neighbour.
CELL_PADDING = 8


def load_words() -> list[dict[str, object]]:
    """Load the JSON payload assigned to window.MARCO_R2_WORDS."""
    source = DATA.read_text(encoding="utf-8")
    match = re.fullmatch(
        r"\s*//[^\n]*\nwindow\.MARCO_R2_WORDS=(\[.*\]);\s*",
        source,
        flags=re.DOTALL,
    )
    if not match:
        raise RuntimeError("Could not read the vocabulary payload from data.js")
    words = json.loads(match.group(1))
    if len(words) != 660:
        raise RuntimeError(f"Expected 660 words, found {len(words)}")
    return words


def robust_z(values: np.ndarray) -> np.ndarray:
    median = np.median(values)
    deviation = np.median(np.abs(values - median))
    return (values - median) / max(1.4826 * deviation, 1e-6)


def axis_statistics(
    rgba: np.ndarray, axis: str
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    rgb = rgba[:, :, :3].astype(np.float32)
    alpha = rgba[:, :, 3].astype(np.float32)
    if axis == "y":
        gradient = np.abs(np.diff(rgb, axis=0)).mean(axis=(1, 2))
        rgb_mean = rgb.mean(axis=(1, 2))
        rgb_std = rgb.std(axis=(1, 2))
        alpha_mean = alpha.mean(axis=1)
    elif axis == "x":
        gradient = np.abs(np.diff(rgb, axis=1)).mean(axis=(0, 2))
        rgb_mean = rgb.mean(axis=(0, 2))
        rgb_std = rgb.std(axis=(0, 2))
        alpha_mean = alpha.mean(axis=0)
    else:
        raise ValueError(f"Unknown axis: {axis}")
    return gradient, rgb_mean, rgb_std, alpha_mean


def pick_seam_edges(
    gradient: np.ndarray,
    alpha_mean: np.ndarray,
    cells: int,
) -> list[int]:
    """Find the strongest well-separated grid transitions on one axis."""
    length = len(alpha_mean)
    average_cell = length / cells
    minimum_separation = average_cell * 0.55
    edge_margin = average_cell * 0.15

    # Opaque sheets are identified by their divider gradients. Sheets whose
    # dividers carry accidental transparency get an additional alpha signal.
    score = np.maximum(robust_z(gradient), 0)
    score += 1.5 * np.maximum(robust_z(-alpha_mean[:-1]), 0)

    selected: list[int] = []
    for candidate in np.argsort(score)[::-1]:
        position = int(candidate)
        if not edge_margin < position < length - edge_margin:
            continue
        if all(abs(position - prior) >= minimum_separation for prior in selected):
            selected.append(position)
            if len(selected) == cells - 1:
                break

    selected.sort()
    if len(selected) != cells - 1:
        raise RuntimeError(f"Expected {cells - 1} seams, found {selected}")
    return selected


def contiguous_runs(mask: np.ndarray, offset: int) -> list[tuple[int, int]]:
    """Return true runs as absolute, half-open coordinate pairs."""
    runs: list[tuple[int, int]] = []
    start: int | None = None
    for index, value in enumerate(mask):
        if value and start is None:
            start = index
        if start is not None and (not value or index == len(mask) - 1):
            end = index + 1 if value and index == len(mask) - 1 else index
            runs.append((start + offset, end + offset))
            start = None
    return runs


def separator_band(
    edge: int,
    rgb_mean: np.ndarray,
    rgb_std: np.ndarray,
    alpha_mean: np.ndarray,
) -> tuple[int, int]:
    """Expand a detected transition to the complete divider band."""
    window_start = max(0, edge - 12)
    window_end = min(len(alpha_mean), edge + 13)
    local_alpha = alpha_mean[window_start:window_end]
    local_mean = rgb_mean[window_start:window_end]
    local_std = rgb_std[window_start:window_end]

    transparent = local_alpha < 128
    bright_uniform = (local_mean > 185) & (local_std < 35)
    masks = [transparent, bright_uniform] if transparent.any() else [bright_uniform]

    candidates: list[tuple[int, int]] = []
    for mask in masks:
        candidates.extend(
            run
            for run in contiguous_runs(mask, window_start)
            if run[1] - run[0] >= 2
        )

    if not candidates:
        # A conservative fallback still removes a narrow divider instead of
        # leaking a neighboring illustration into the card.
        return max(0, edge - 3), min(len(alpha_mean), edge + 5)

    def run_score(run: tuple[int, int]) -> tuple[float, float]:
        start, end = run
        distance = 0 if start <= edge < end else min(abs(edge - start), abs(edge - end))
        return (distance, -(end - start))

    return min(candidates, key=run_score)


def measured_intervals(
    rgba: np.ndarray,
    axis: str,
    cells: int,
) -> tuple[list[tuple[int, int]], list[tuple[int, int]]]:
    gradient, rgb_mean, rgb_std, alpha_mean = axis_statistics(rgba, axis)
    edges = pick_seam_edges(gradient, alpha_mean, cells)
    bands = [separator_band(edge, rgb_mean, rgb_std, alpha_mean) for edge in edges]

    length = len(alpha_mean)
    outer_inset = 4
    intervals: list[tuple[int, int]] = []
    start = outer_inset
    for band_start, band_end in bands:
        intervals.append((start + 1, band_start - 1))
        start = band_end
    intervals.append((start + 1, length - outer_inset - 1))

    average_cell = length / cells
    for start, end in intervals:
        size = end - start
        if not average_cell * 0.55 <= size <= average_cell * 1.35:
            raise RuntimeError(
                f"Suspicious {axis}-axis panel size {size}; intervals={intervals}, bands={bands}"
            )
    return intervals, bands


def flatten(panel: Image.Image) -> Image.Image:
    background = Image.new("RGBA", panel.size, BACKGROUND)
    background.alpha_composite(panel.convert("RGBA"))
    return background.convert("RGB")


def fit_on_cell(panel: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Contain a complete panel on an opaque, fixed-ratio atlas cell."""
    cell = Image.new("RGB", size, BACKGROUND[:3])
    fitted = panel.copy()
    fitted.thumbnail(
        (size[0] - CELL_PADDING * 2, size[1] - CELL_PADDING * 2),
        Image.Resampling.LANCZOS,
    )
    left = (size[0] - fitted.width) // 2
    top = (size[1] - fitted.height) // 2
    cell.paste(fitted, (left, top))
    return cell


def save_atlas(atlas: Image.Image, output_path: Path) -> None:
    """Encode to a verified temporary file, then replace the live asset."""
    for attempt in range(1, 4):
        temporary = output_path.with_name(f".{output_path.stem}-{attempt}.webp")
        atlas.save(temporary, "WEBP", quality=90, method=6)
        try:
            if temporary.stat().st_size == 0:
                raise RuntimeError("encoder produced an empty file")
            with Image.open(temporary) as verification:
                verification.load()
                if verification.size != atlas.size or verification.mode != "RGB":
                    raise RuntimeError(
                        f"unexpected atlas {verification.size} {verification.mode}"
                    )
        except Exception:
            temporary.unlink(missing_ok=True)
            if attempt == 3:
                raise
            continue
        temporary.replace(output_path)
        return


def main() -> None:
    words = load_words()
    word_ids = [str(word["id"]) for word in words]
    if len(set(word_ids)) != len(word_ids):
        raise RuntimeError("Vocabulary IDs are duplicated")

    OUTPUT.mkdir(parents=True, exist_ok=True)
    manifest: list[dict[str, object]] = []
    atlases: list[dict[str, object]] = []
    word_index = 0

    for session in range(1, 15):
        rows = 2 if session == 14 else 10
        sheet_path = SHEETS / f"session-{session}.webp"
        with Image.open(sheet_path) as source:
            sheet = source.convert("RGBA")
            rgba = np.asarray(sheet)
            x_intervals, x_bands = measured_intervals(rgba, "x", 5)
            y_intervals, y_bands = measured_intervals(rgba, "y", rows)
            cell_size = PORTRAIT_CELL if session == 14 else LANDSCAPE_CELL
            atlas = Image.new(
                "RGB",
                (cell_size[0] * 5, cell_size[1] * rows),
                BACKGROUND[:3],
            )
            atlas_name = f"session-{session:02}.webp"

            print(
                f"Session {session:02}: x={x_intervals}, y={y_intervals}; "
                f"removed x seams={x_bands}, y seams={y_bands}"
            )

            for row, (top, bottom) in enumerate(y_intervals):
                for column, (left, right) in enumerate(x_intervals):
                    word = words[word_index]
                    panel = flatten(sheet.crop((left, top, right, bottom)))
                    cell = fit_on_cell(panel, cell_size)
                    atlas_left = column * cell_size[0]
                    atlas_top = row * cell_size[1]
                    atlas.paste(cell, (atlas_left, atlas_top))
                    manifest.append(
                        {
                            "id": word["id"],
                            "word": word["word"],
                            "session": session,
                            "position": row * 5 + column + 1,
                            "atlas": f"atlas/{atlas_name}",
                            "viewport": [
                                atlas_left,
                                atlas_top,
                                cell_size[0],
                                cell_size[1],
                            ],
                            "source": sheet_path.name,
                            "sourceCrop": [left, top, right, bottom],
                            "sourceSize": [panel.width, panel.height],
                        }
                    )
                    word_index += 1

            output_path = OUTPUT / atlas_name
            save_atlas(atlas, output_path)
            atlases.append(
                {
                    "session": session,
                    "file": f"atlas/{atlas_name}",
                    "width": atlas.width,
                    "height": atlas.height,
                    "cell": list(cell_size),
                    "rows": rows,
                    "sha256": hashlib.sha256(output_path.read_bytes()).hexdigest(),
                }
            )

    if word_index != 660 or len(manifest) != 660:
        raise RuntimeError(f"Expected 660 panels, created {word_index}")

    MANIFEST.write_text(
        json.dumps(
            {"version": 3, "count": 660, "atlases": atlases, "images": manifest},
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Created {len(atlases)} uniform atlases containing {word_index} exact panels")


if __name__ == "__main__":
    main()
