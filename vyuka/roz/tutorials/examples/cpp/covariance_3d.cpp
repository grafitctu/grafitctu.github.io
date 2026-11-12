#include "recognition.hpp"
using namespace roz;

// BEGIN covariance-3d
Matrix sample_covariance(const Matrix& X) {
    const std::size_t d = dimensions(X, 2); // rows = samples, columns = features
    const Vector mu = mean(X);
    Matrix C(d, Vector(d, 0.0));
    for (const auto& x : X)
        for (std::size_t i = 0; i < d; ++i)
            for (std::size_t j = 0; j < d; ++j)
                C[i][j] += (x[i] - mu[i]) * (x[j] - mu[j]);
    for (auto& row : C)
        for (double& value : row) value /= double(X.size() - 1);
    return C; // d features give a d by d sample covariance matrix
}
// END covariance-3d

int main(int argc, char** argv) {
    try {
        const Matrix X=argc>1?load_csv(argv[1]):Matrix{{1,1,4},{2,2,1},{3,2,3},{4,3,2}};
        require(dimensions(X)==3, "Use three feature columns: x1,x2,x3. All three columns are features.");
        const Vector mu=mean(X); const Matrix C=sample_covariance(X); auto E=symmetric_eigen(C);
        for(auto& value:E.values)value=std::max(0.0,value);
        std::cout << std::setprecision(17) << "{\"n\":" << X.size() << ",\"mean\":"; json_vector(std::cout,mu);
        std::cout << ",\"centered\":"; json_matrix(std::cout,centered(X,mu));
        std::cout << ",\"covariance\":"; json_matrix(std::cout,C);
        std::cout << ",\"eigenvalues\":"; json_vector(std::cout,E.values);
        std::cout << ",\"directions_as_rows\":"; json_matrix(std::cout,E.directions);std::cout << "}\n";
    }catch(const std::exception& e){std::cerr << e.what() << '\n';return 1;}
}
