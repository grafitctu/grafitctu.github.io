#include "recognition.hpp"
using namespace roz;
int main(int argc, char** argv) {
    try {
        const Matrix X = argc > 1 ? load_csv(argv[1]) : Matrix{{1,1},{2,2},{3,2},{4,3}};
        const auto model = fit_pca(X,dimensions(X));
        std::cout << "{\"mean\":"; json_vector(std::cout,model.mu);
        std::cout << ",\"covariance\":"; json_matrix(std::cout,covariance(X));
        std::cout << ",\"eigenvalues\":"; json_vector(std::cout,model.variances);
        std::cout << ",\"directions_as_rows\":"; json_matrix(std::cout,model.directions);
        std::cout << ",\"reconstructions\":[";
        for (std::size_t k = 0; k <= dimensions(X); ++k) { auto p = model; p.k = k; const auto reconstruction = p.inverse_transform(p.transform(X)); if (k) std::cout << ','; std::cout << "{\"k\":" << k << ",\"mse\":" << std::setprecision(17) << mse(X,reconstruction) << ",\"retained\":"; json_number(std::cout,p.retained_fraction()); std::cout << '}'; }
        std::cout << "]}\n";
    } catch (const std::exception& e) { std::cerr << e.what() << '\n'; return 1; }
}
