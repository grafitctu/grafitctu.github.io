# BEGIN example
def co_occurrence(image, levels, dx, dy, symmetric=False):
    height, width = len(image), len(image[0])
    counts = [[0] * levels for _ in range(levels)]
    for y, row in enumerate(image):
        for x, value in enumerate(row):
            xx, yy = x + dx, y + dy
            if 0 <= xx < width and 0 <= yy < height:
                i = value * levels // 256
                j = image[yy][xx] * levels // 256
                counts[i][j] += 1
                if symmetric:
                    counts[j][i] += 1
    return counts


def describe(counts):
    total = sum(map(sum, counts))
    if not total:
        raise ValueError("Need at least one pair")
    contrast = homogeneity = asm_value = 0.0
    for i, row in enumerate(counts):
        for j, count in enumerate(row):
            p = count / total
            gap = (i - j) ** 2
            contrast += gap * p
            homogeneity += p / (1 + gap)
            asm_value += p * p
    return contrast, homogeneity, asm_value
# END example


if __name__ == "__main__":
    image = [[0, 255, 0, 255, 0, 255] for _ in range(6)]
    counts = co_occurrence(image, levels=2, dx=1, dy=0)
    print("C00 C01 C10 C11:", *counts[0], *counts[1])
    print("contrast homogeneity ASM:", *describe(counts))
