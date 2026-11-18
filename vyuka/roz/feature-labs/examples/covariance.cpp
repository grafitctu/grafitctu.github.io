#include <array>
#include <cmath>
#include <iomanip>
#include <iostream>
#include <stdexcept>
#include <vector>

using Point = std::array<double, 2>;
struct PCA {
    Point mean, values, first, second;
    double c11, c12, c22;
};

// BEGIN example
PCA fit_pca(const std::vector<Point>& samples) {
    if (samples.size() < 2) throw std::invalid_argument("Need at least two samples");
    PCA fit{};
    for (auto [x, y] : samples) {
        fit.mean[0] += x / samples.size();
        fit.mean[1] += y / samples.size();
    }
    for (auto [x, y] : samples) {
        const double dx = x - fit.mean[0], dy = y - fit.mean[1];
        fit.c11 += dx * dx;
        fit.c12 += dx * dy;
        fit.c22 += dy * dy;
    }
    const double divisor = static_cast<double>(samples.size() - 1);
    fit.c11 /= divisor;
    fit.c12 /= divisor;
    fit.c22 /= divisor;
    const double radius = std::hypot(fit.c11 - fit.c22, 2 * fit.c12);
    const double angle = radius == 0 ? 0 : std::atan2(2 * fit.c12, fit.c11 - fit.c22) / 2;
    fit.values = {(fit.c11 + fit.c22 + radius) / 2, (fit.c11 + fit.c22 - radius) / 2};
    fit.first = {std::cos(angle), std::sin(angle)};
    fit.second = {-fit.first[1], fit.first[0]};
    return fit;
}

double score(Point x, Point mean, Point axis) {
    return (x[0] - mean[0]) * axis[0] + (x[1] - mean[1]) * axis[1];
}

Point reconstruct_one(Point x, const PCA& fit) {
    const double z = score(x, fit.mean, fit.first);
    return {fit.mean[0] + z * fit.first[0], fit.mean[1] + z * fit.first[1]};
}
// END example

int main() {
    const std::vector<Point> samples{{1,1}, {2,3}, {3,2}, {4,4}};
    const auto fit = fit_pca(samples);
    const auto b = reconstruct_one(samples[1], fit);
    const double distance1 = 2 / std::sqrt(fit.values[0]);
    const double distance2 = 2 / std::sqrt(fit.values[1]);
    std::cout << std::setprecision(12)
        << "C11 C12 C22: " << fit.c11 << " " << fit.c12 << " " << fit.c22 << "\n"
        << "lambda1 lambda2: " << fit.values[0] << " " << fit.values[1] << "\n"
        << "PC1: " << fit.first[0] << " " << fit.first[1] << "\n"
        << "B reconstructed with k=1: " << b[0] << " " << b[1] << "\n"
        << "Mahalanobis at Euclidean distance 2: " << distance1 << " " << distance2 << "\n";
}
