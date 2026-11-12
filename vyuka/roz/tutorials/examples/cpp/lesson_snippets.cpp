#include "svm_model.hpp"
using namespace roz;

// BEGIN matvec
Vector matrix_times_vector(const Matrix& A, const Vector& v) {
    Vector w(A.size(), 0.0);
    for (std::size_t i = 0; i < A.size(); ++i)
        for (std::size_t j = 0; j < v.size(); ++j)
            w[i] += A[i][j] * v[j];
    return w;
}
// END matvec

// BEGIN pca-experiment
Matrix pca_experiment(const Matrix& X_train, const Matrix& X_validation) {
    // Learn the mean and directions from training data only.
    auto pca = fit_pca_variance(X_train, 0.95);
    Matrix Z_train = pca.transform(X_train);
    Matrix Z_validation = pca.transform(X_validation);
    Matrix X_reconstructed = pca.inverse_transform(Z_validation);
    return X_reconstructed;
}
// END pca-experiment

// BEGIN pca-fit
Pca learn_pca(const Matrix& X_train, std::size_t k) {
    // fit_pca computes sample covariance, eigenvectors and eigenvalues.
    // Its readable implementation is in recognition.hpp.
    Pca model = fit_pca(X_train, k);
    return model; // mean, unit directions, variances, component count
}
// END pca-fit

// BEGIN pca-reconstruct
Matrix reconstruct(const Pca& fitted_model, const Matrix& X, std::size_t k) {
    Pca model = fitted_model; // reuse the fitted mean and directions
    require(k <= model.directions.size(), "Too many components.");
    model.k = k;
    Matrix Z = model.transform(X);
    return model.inverse_transform(Z); // k=0 returns the training mean
}
// END pca-reconstruct

// BEGIN projection
Vector project_on_axis(const Matrix& X, double angle_degrees) {
    Vector mu = mean(X);
    Matrix A = centered(X, mu);
    double theta = angle_degrees * std::acos(-1.0) / 180.0;
    Vector u{std::cos(theta), std::sin(theta)}; // unit direction
    Vector scores;
    for (const auto& x : A) scores.push_back(dot(x, u));
    return scores;
}
// END projection

// BEGIN dbscan
std::vector<int> find_clusters(const Matrix& X) {
    double epsilon = 0.18;
    std::size_t min_samples = 6; // the point itself counts
    std::vector<int> labels = dbscan(X, epsilon, min_samples);
    return labels; // -1 means noise; nonnegative values identify clusters
}
// END dbscan

// BEGIN feature-map
Matrix add_radial_feature(const Matrix& X) {
    Matrix mapped;
    for (const auto& x : X) {
        double radius_squared = x[0]*x[0] + x[1]*x[1];
        mapped.push_back({x[0], x[1], radius_squared});
    }
    return mapped; // an explicit feature map, not an RBF kernel
}
// END feature-map

// BEGIN kmeans
Kmeans find_kmeans(const Matrix& X) {
    Matrix initial_centres{X.front(), X.back()};
    Kmeans result = kmeans(X, initial_centres, 100);
    return result; // centres and labels; empty clusters keep their centres
}
// END kmeans

// BEGIN svm-fitting
std::vector<int> classify(const Matrix& X_train, const std::vector<int>& y_train,
                          const Matrix& X_validation) {
    double C = 1.0, gamma = 1.0;
    auto model = fit_svm(X_train, y_train, "rbf", C, gamma);
    return model.predict(X_validation); // LIBSVM trains the actual SVM
}
// END svm-fitting

// BEGIN lda
Vector learn_fisher_direction(const Matrix& X_train, const std::vector<int>& y_train) {
    // Binary Fisher LDA: solve (within-class scatter + ridge*I) w = mu1-mu0.
    double ridge = 1e-6;
    return fisher_direction(X_train, y_train, ridge); // unit-length direction
}
// END lda

// BEGIN pipeline
std::vector<int> training_pipeline(const Matrix& X_train, const std::vector<int>& y_train,
                                   const Matrix& X_validation) {
    auto scaler = fit_scaler(X_train); // divisor n, like StandardScaler
    Matrix A_train = scaler.transform(X_train);
    Matrix A_validation = scaler.transform(X_validation);
    auto pca = fit_pca_variance(A_train, 0.95); // sample covariance uses n-1
    Matrix Z_train = pca.transform(A_train);
    Matrix Z_validation = pca.transform(A_validation);
    auto model = fit_svm(Z_train, y_train, "rbf", 1.0, 1.0);
    return model.predict(Z_validation); // no fitting on validation or test
}
// END pipeline

int main() {
    const Matrix X{{1,1},{2,2},{3,2},{4,3}}; const std::vector<int> y{0,0,1,1};
    const auto pca = learn_pca(X,1);
    std::cout << "{\"Av\":"; json_vector(std::cout,matrix_times_vector({{2,1},{0,1}},{1,2}));
    std::cout << ",\"reconstruction_mse\":" << std::setprecision(17) << mse(X,reconstruct(pca,X,1));
    std::cout << ",\"scores\":"; json_vector(std::cout,project_on_axis(X,35));
    std::cout << ",\"dbscan\":"; json_vector(std::cout,as_numbers(find_clusters(X)));
    std::cout << ",\"kmeans\":"; json_vector(std::cout,as_numbers(find_kmeans(X).labels));
    std::cout << ",\"fisher\":"; json_vector(std::cout,learn_fisher_direction(X,y));
    std::cout << ",\"svm\":"; json_vector(std::cout,as_numbers(classify(X,y,X)));
    std::cout << ",\"pipeline\":"; json_vector(std::cout,as_numbers(training_pipeline(X,y,X)));
    std::cout << ",\"feature_map\":"; json_matrix(std::cout,add_radial_feature(X));
    std::cout << ",\"pca_experiment_mse\":" << mse(X,pca_experiment(X,X)) << "}\n";
}
