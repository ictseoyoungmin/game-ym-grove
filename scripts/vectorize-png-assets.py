#!/usr/bin/env python3
import binascii
import struct
import zlib
from collections import defaultdict
from pathlib import Path

TARGET_SIZE = 192
COLOR_STEP = 8

ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "public" / "assets"
YM_ROOT = ASSET_ROOT / "ym"

ASSET_MAP = {
    "core-brand.svg": "primary.png",
    "ai-agents.svg": "agent.png",
    "ml-deep-learning.svg": "deeplearning.png",
    "jepa-vision.svg": "deeplearning.png",
    "security.svg": "security.png",
    "data-analytics.svg": "data_analystic.png",
    "cloud-infra.svg": "cloud_infra.png",
    "gaming-rl.svg": "gaming.png",
    "research.svg": "data_analystic.png",
    "education.svg": "education.png",
    "premium-pro.svg": "premium.png",
    "sustainability.svg": "primary.png",
    "api-integrations.svg": "api.png",
    "tools-utilities.svg": "api.png",
}


def paeth(a, b, c):
    p = a + b - c
    pa = abs(p - a)
    pb = abs(p - b)
    pc = abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    if pb <= pc:
        return b
    return c


def read_png(path):
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path} is not a PNG")

    pos = 8
    idat = bytearray()
    width = height = color_type = bit_depth = None

    while pos < len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        chunk_type = data[pos + 4 : pos + 8]
        chunk = data[pos + 8 : pos + 8 + length]
        crc = data[pos + 8 + length : pos + 12 + length]
        expected_crc = struct.pack(">I", binascii.crc32(chunk_type + chunk) & 0xFFFFFFFF)
        if crc != expected_crc:
            raise ValueError(f"CRC mismatch in {path} chunk {chunk_type!r}")

        if chunk_type == b"IHDR":
            width, height, bit_depth, color_type, compression, png_filter, interlace = struct.unpack(
                ">IIBBBBB", chunk
            )
            if bit_depth != 8 or color_type not in (2, 6) or compression or png_filter or interlace:
                raise ValueError(f"Unsupported PNG format: {path}")
        elif chunk_type == b"IDAT":
            idat.extend(chunk)
        elif chunk_type == b"IEND":
            break

        pos += 12 + length

    channels = 4 if color_type == 6 else 3
    raw = zlib.decompress(bytes(idat))
    stride = width * channels
    rows = []
    offset = 0
    previous = [0] * stride

    for _ in range(height):
        filter_type = raw[offset]
        offset += 1
        row = list(raw[offset : offset + stride])
        offset += stride

        for i, value in enumerate(row):
            left = row[i - channels] if i >= channels else 0
            up = previous[i]
            up_left = previous[i - channels] if i >= channels else 0

            if filter_type == 1:
                row[i] = (value + left) & 0xFF
            elif filter_type == 2:
                row[i] = (value + up) & 0xFF
            elif filter_type == 3:
                row[i] = (value + ((left + up) // 2)) & 0xFF
            elif filter_type == 4:
                row[i] = (value + paeth(left, up, up_left)) & 0xFF
            elif filter_type != 0:
                raise ValueError(f"Unsupported PNG filter {filter_type}")

        rows.append(row)
        previous = row

    return width, height, channels, rows


def quantize(value):
    return max(0, min(255, round(value / COLOR_STEP) * COLOR_STEP))


def sample_image(width, height, channels, rows):
    sampled = []
    for ty in range(TARGET_SIZE):
        y0 = ty * height // TARGET_SIZE
        y1 = max(y0 + 1, (ty + 1) * height // TARGET_SIZE)
        sampled_row = []

        for tx in range(TARGET_SIZE):
            x0 = tx * width // TARGET_SIZE
            x1 = max(x0 + 1, (tx + 1) * width // TARGET_SIZE)
            count = 0
            totals = [0, 0, 0]

            for sy in range(y0, y1):
                row = rows[sy]
                for sx in range(x0, x1):
                    index = sx * channels
                    if channels == 4:
                        alpha = row[index + 3] / 255
                        totals[0] += round(row[index] * alpha + 255 * (1 - alpha))
                        totals[1] += round(row[index + 1] * alpha + 255 * (1 - alpha))
                        totals[2] += round(row[index + 2] * alpha + 255 * (1 - alpha))
                    else:
                        totals[0] += row[index]
                        totals[1] += row[index + 1]
                        totals[2] += row[index + 2]
                    count += 1

            sampled_row.append(tuple(quantize(total // count) for total in totals))

        sampled.append(sampled_row)

    return sampled


def rgb_to_hex(rgb):
    return "#{:02x}{:02x}{:02x}".format(*rgb)


def color_sort_key(rgb):
    r, g, b = rgb
    return (r + g + b, r, g, b)


def build_svg(sampled, source_name):
    paths = defaultdict(list)

    for y, row in enumerate(sampled):
        x = 0
        while x < TARGET_SIZE:
            color = row[x]
            start = x
            while x < TARGET_SIZE and row[x] == color:
                x += 1
            paths[color].append(f"M{start} {y}h{x - start}v1H{start}z")

    lines = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" role="img">',
        f"  <desc>Generated vector SVG from {source_name}</desc>",
    ]

    for color in sorted(paths, key=color_sort_key):
        lines.append(f'  <path fill="{rgb_to_hex(color)}" d="{"".join(paths[color])}"/>')

    lines.append("</svg>")
    return "\n".join(lines) + "\n"


def main():
    YM_ROOT.mkdir(parents=True, exist_ok=True)
    for svg_name, png_name in ASSET_MAP.items():
        png_path = ASSET_ROOT / png_name
        svg_path = YM_ROOT / svg_name
        width, height, channels, rows = read_png(png_path)
        sampled = sample_image(width, height, channels, rows)
        svg_path.write_text(build_svg(sampled, png_name), encoding="utf-8")
        print(f"generated {svg_path.relative_to(ROOT)} from {png_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
