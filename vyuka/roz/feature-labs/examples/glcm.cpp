#include <iomanip>
#include <iostream>
#include <numeric>
#include <stdexcept>
#include <vector>

using Grid = std::vector<std::vector<int>>;
struct Features {
    double contrast, homogeneity, asm_value;
};

// BEGIN example
Grid co_occurrence(const Grid& image, int levels, int dx, int dy, bool symmetric) {
    const int height = static_cast<int>(image.size());
    const int width = static_cast<int>(image.at(0).size());
    Grid counts(levels, std::vector<int>(levels, 0));
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            const int xx = x + dx, yy = y + dy;
            if (xx < 0 || xx >= width || yy < 0 || yy >= height) continue;
            const int i = image[y][x] * levels / 256;
            const int j = image[yy][xx] * levels / 256;
            ++counts[i][j];
            if (symmetric) ++counts[j][i];
        }
    }
    return counts;
}

Features describe(const Grid& counts) {
    int total = 0;
    for (const auto& row : counts) total += std::accumulate(row.begin(), row.end(), 0);
    if (total == 0) throw std::invalid_argument("Need at least one pair");
    Features features{};
    const int levels = static_cast<int>(counts.size());
    for (int i = 0; i < levels; ++i) {
        for (int j = 0; j < levels; ++j) {
            const double p = static_cast<double>(counts[i][j]) / total;
            const int gap = (i - j) * (i - j);
            features.contrast += gap * p;
            features.homogeneity += p / (1 + gap);
            features.asm_value += p * p;
        }
    }
    return features;
}
// END example

int main() {
    // Replace these pixel rows to use another 6 by 6 patch.
    Grid image(6, {0,255,0,255,0,255});
    const auto counts = co_occurrence(image, 2, 1, 0, false);
    const auto f = describe(counts);
    std::cout << std::setprecision(12)
        << "C00 C01 C10 C11: " << counts[0][0] << " " << counts[0][1] << " "
        << counts[1][0] << " " << counts[1][1] << "\n"
        << "contrast homogeneity ASM: " << f.contrast << " " << f.homogeneity << " " << f.asm_value << "\n";
}
