#include <array>
#include <iomanip>
#include <iostream>
#include <stdexcept>
#include <vector>

using Point = std::array<double, 2>;
struct Moments {
    Point centroid, phi;
    double m00, mu20, mu02, mu11;
};

// BEGIN example
Moments moments(const std::vector<Point>& pixels, bool areas = false) {
    if (pixels.empty()) throw std::invalid_argument("The mask is empty");
    Moments report{};
    report.m00 = static_cast<double>(pixels.size());
    for (auto [x, y] : pixels) {
        report.centroid[0] += x / report.m00;
        report.centroid[1] += y / report.m00;
    }
    for (auto [x, y] : pixels) {
        const double dx = x - report.centroid[0], dy = y - report.centroid[1];
        report.mu20 += dx * dx;
        report.mu02 += dy * dy;
        report.mu11 += dx * dy;
    }
    if (areas) {
        // Integrate over unit squares instead of summing over pixel centres.
        report.mu20 += report.m00 / 12;
        report.mu02 += report.m00 / 12;
    }
    const double mass_squared = report.m00 * report.m00;
    const double eta20 = report.mu20 / mass_squared;
    const double eta02 = report.mu02 / mass_squared;
    const double eta11 = report.mu11 / mass_squared;
    report.phi = {eta20 + eta02, (eta20 - eta02) * (eta20 - eta02) + 4 * eta11 * eta11};
    return report;
}
// END example

int main() {
    const std::vector<Point> mask{{0,0},{0,1},{0,2},{0,3},{1,3},{2,3}};
    const auto m = moments(mask);
    std::cout << std::setprecision(12)
        << "mass centroid: " << m.m00 << " " << m.centroid[0] << " " << m.centroid[1] << "\n"
        << "mu20 mu02 mu11: " << m.mu20 << " " << m.mu02 << " " << m.mu11 << "\n"
        << "phi1 phi2: " << m.phi[0] << " " << m.phi[1] << "\n";
}
