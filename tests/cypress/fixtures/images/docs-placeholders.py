"""Placeholder landscapes for the documentation screenshots (pure Python, no dependency)."""
import sys, random, zlib, struct, math
out = sys.argv[1]

def png(path, w, h, rows):
    raw = b''.join(b'\x00' + bytes(r) for r in rows)
    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
                + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))

def ridge(w, h, base, amp, rnd):
    xs, ys = [], []
    x = -w * 0.1
    while x < w * 1.2:
        xs.append(x); ys.append(h * (base + rnd.uniform(-amp, amp)))
        x += w / 12 * rnd.uniform(0.6, 1.4)
    line = []
    j = 0
    for px in range(w):
        while xs[j + 1] < px: j += 1
        t = (px - xs[j]) / (xs[j + 1] - xs[j])
        line.append(ys[j] + (ys[j + 1] - ys[j]) * t)
    return line

def landscape(name, w, h, top, bot, ridges, seed, sun=None):
    rnd = random.Random(seed)
    lines = [(ridge(w, h, b, a, rnd), c) for b, a, c in ridges]
    rows = []
    for y in range(h):
        t = y / (h - 1)
        sky = [top[i] + (bot[i] - top[i]) * t for i in range(3)]
        row = []
        for x in range(w):
            c = sky
            if sun:
                d = math.hypot(x - sun[0] * w, y - sun[1] * h) - sun[2]
                if d < 1:
                    k = min(1, 1 - d) if d > 0 else 1
                    c = [c[i] + (sun[3][i] - c[i]) * k for i in range(3)]
            for line, col in lines:
                d = y - line[x]
                if d > 0:
                    k = min(1, d)
                    c = [c[i] + (col[i] - c[i]) * k for i in range(3)]
            
            row += [int(v) for v in c]
        rows.append(row)
    png(f'{out}/{name}', w, h, rows)
    print(name, w, h)

landscape('docs-slide-1.png', 1600, 640, (38, 70, 110), (120, 160, 190), [(0.55, 0.10, (70, 95, 125)), (0.70, 0.08, (45, 70, 95)), (0.85, 0.05, (25, 45, 62))], 1, (0.78, 0.25, 60, (235, 225, 190)))
landscape('docs-slide-2.png', 1600, 640, (95, 60, 80), (225, 150, 110), [(0.55, 0.10, (120, 75, 90)), (0.70, 0.08, (80, 50, 70)), (0.85, 0.05, (45, 30, 48))], 2, (0.25, 0.38, 70, (250, 215, 160)))
landscape('docs-slide-3.png', 1600, 640, (30, 80, 80), (140, 190, 170), [(0.55, 0.10, (60, 115, 105)), (0.70, 0.08, (35, 85, 78)), (0.85, 0.05, (20, 55, 52))], 3)
landscape('docs-card.png', 800, 420, (60, 110, 160), (175, 205, 225), [(0.55, 0.12, (95, 125, 150)), (0.72, 0.08, (60, 90, 110)), (0.88, 0.05, (40, 75, 60))], 4, (0.75, 0.28, 34, (250, 240, 205)))
landscape('docs-figure.png', 800, 600, (50, 95, 150), (190, 210, 225), [(0.50, 0.12, (110, 135, 160)), (0.68, 0.09, (70, 100, 120)), (0.86, 0.05, (45, 85, 65))], 5, (0.3, 0.22, 40, (250, 240, 205)))
landscape('docs-square.png', 300, 300, (60, 110, 160), (175, 205, 225), [(0.55, 0.14, (95, 125, 150)), (0.78, 0.08, (45, 80, 70))], 6)
landscape('docs-wide.png', 600, 300, (60, 110, 160), (175, 205, 225), [(0.55, 0.14, (95, 125, 150)), (0.78, 0.08, (45, 80, 70))], 7)
landscape('docs-card-2.png', 800, 420, (95, 60, 80), (225, 150, 110), [(0.55, 0.12, (120, 75, 90)), (0.72, 0.08, (80, 50, 70)), (0.88, 0.05, (45, 30, 48))], 8, (0.28, 0.34, 30, (250, 215, 160)))
landscape('docs-card-3.png', 800, 420, (30, 80, 80), (140, 190, 170), [(0.52, 0.13, (60, 115, 105)), (0.72, 0.08, (35, 85, 78)), (0.88, 0.05, (20, 55, 52))], 9)
