#pragma once
// Small, dense teaching implementations. Rows are samples, columns are features.
// PCA uses sample covariance (n-1); fit_scaler defaults to population variance (n).
#include <algorithm>
#include <cmath>
#include <cctype>
#include <cstddef>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <numeric>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

namespace roz {
using Vector = std::vector<double>;
using Matrix = std::vector<Vector>;
inline void require(bool ok, const std::string& message) { if (!ok) throw std::invalid_argument(message); }
inline std::size_t dimensions(const Matrix& X, std::size_t minimum_rows = 1) {
    require(X.size() >= minimum_rows && !X.front().empty(), "Not enough rows or features.");
    const auto d = X.front().size();
    for (const auto& row : X) { require(row.size() == d, "Rows have different lengths."); for (double x : row) require(std::isfinite(x), "Use finite numbers."); }
    return d;
}
inline double dot(const Vector& a, const Vector& b) {
    require(a.size() == b.size(), "Vector lengths differ.");
    return std::inner_product(a.begin(), a.end(), b.begin(), 0.0);
}
inline Vector matvec(const Matrix& A, const Vector& v) {
    dimensions(A); Vector result; for (const auto& row : A) result.push_back(dot(row, v)); return result;
}
inline Vector mean(const Matrix& X) {
    const auto d = dimensions(X); Vector mu(d, 0.0);
    for (const auto& x : X) for (std::size_t j = 0; j < d; ++j) mu[j] += x[j] / double(X.size());
    return mu;
}
inline Matrix centered(const Matrix& X, const Vector& mu) {
    require(dimensions(X) == mu.size(), "Mean dimension differs."); Matrix A = X;
    for (auto& row : A) for (std::size_t j = 0; j < mu.size(); ++j) row[j] -= mu[j]; return A;
}
inline Matrix covariance(const Matrix& X) {
    const auto d = dimensions(X, 2); const auto A = centered(X, mean(X)); Matrix C(d, Vector(d, 0.0));
    for (const auto& row : A) for (std::size_t j = 0; j < d; ++j) for (std::size_t k = 0; k < d; ++k) C[j][k] += row[j] * row[k] / double(X.size() - 1);
    return C;
}
struct Eigen { Vector values; Matrix directions; }; // directions are unit eigenvectors, one per row
inline Eigen symmetric_eigen(Matrix A) {
    const auto d = dimensions(A); require(A.size() == d, "Eigenproblem must be square.");
    double scale = 0.0;
    for (std::size_t i = 0; i < d; ++i) for (std::size_t j = 0; j < d; ++j) { scale = std::max(scale, std::abs(A[i][j])); require(std::abs(A[i][j] - A[j][i]) < 1e-10 * std::max(1.0, std::abs(A[i][j])), "Matrix must be symmetric."); }
    Matrix V(d, Vector(d, 0.0)); for (std::size_t i = 0; i < d; ++i) V[i][i] = 1.0;
    const double tolerance = std::max(scale, 1e-300) * 1e-13;
    bool converged = d == 1 || scale == 0.0;
    for (int sweep = 0; sweep < 100 && !converged; ++sweep) {
        double largest = 0.0;
        for (std::size_t p = 0; p < d; ++p) for (std::size_t q = p + 1; q < d; ++q) {
            const double apq = A[p][q]; largest = std::max(largest, std::abs(apq)); if (std::abs(apq) <= tolerance) continue;
            const double tau = (A[q][q] - A[p][p]) / (2.0 * apq);
            const double t = std::copysign(1.0, tau) / (std::abs(tau) + std::hypot(1.0, tau));
            const double c = 1.0 / std::hypot(1.0, t), s = t * c;
            A[p][p] -= t * apq; A[q][q] += t * apq; A[p][q] = A[q][p] = 0.0;
            for (std::size_t k = 0; k < d; ++k) {
                if (k != p && k != q) { const double x = A[k][p], y = A[k][q]; A[k][p] = A[p][k] = c*x - s*y; A[k][q] = A[q][k] = s*x + c*y; }
                const double x = V[k][p], y = V[k][q]; V[k][p] = c*x - s*y; V[k][q] = s*x + c*y;
            }
        }
        converged = largest <= tolerance;
    }
    require(converged, "Jacobi eigenvalue iteration did not converge.");
    std::vector<std::size_t> order(d); std::iota(order.begin(), order.end(), 0);
    std::stable_sort(order.begin(), order.end(), [&](auto i, auto j) { return A[i][i] > A[j][j]; });
    Eigen result;
    for (auto j : order) {
        Vector u(d); for (std::size_t i = 0; i < d; ++i) u[i] = V[i][j];
        const auto pivot = std::max_element(u.begin(), u.end(), [](double a, double b) { return std::abs(a) < std::abs(b); });
        if (*pivot < 0.0) for (auto& value : u) value = -value;
        result.values.push_back(A[j][j]); result.directions.push_back(u);
    }
    return result;
}
struct Pca {
    Vector mu, variances; Matrix directions; std::size_t k;
    Matrix transform(const Matrix& X) const {
        const auto A = centered(X, mu); Matrix Z(A.size(), Vector(k));
        for (std::size_t i = 0; i < A.size(); ++i) for (std::size_t j = 0; j < k; ++j) Z[i][j] = dot(A[i], directions[j]); return Z;
    }
    Matrix inverse_transform(const Matrix& Z) const {
        Matrix X(Z.size(), mu);
        for (std::size_t i = 0; i < Z.size(); ++i) { require(Z[i].size() == k, "Score dimension differs."); for (std::size_t j = 0; j < k; ++j) for (std::size_t f = 0; f < mu.size(); ++f) X[i][f] += Z[i][j] * directions[j][f]; } return X;
    }
    double retained_fraction() const {
        const double total = std::accumulate(variances.begin(), variances.end(), 0.0);
        return total > 0.0 ? std::accumulate(variances.begin(), variances.begin() + k, 0.0) / total : std::numeric_limits<double>::quiet_NaN();
    }
};
inline Pca fit_pca(const Matrix& X_train, std::size_t k) {
    const auto d = dimensions(X_train, 2); require(k <= d, "Too many PCA components.");
    auto E = symmetric_eigen(covariance(X_train));
    for (auto& value : E.values) value = std::max(0.0, value);
    return {mean(X_train), E.values, E.directions, k};
}
inline Pca fit_pca_variance(const Matrix& X_train, double fraction) {
    require(fraction > 0.0 && fraction < 1.0, "Use a variance fraction between 0 and 1.");
    auto model = fit_pca(X_train, dimensions(X_train));
    require(std::accumulate(model.variances.begin(), model.variances.end(), 0.0) > 0.0, "Variance fraction is undefined for constant data.");
    model.k = 1; while (model.k < model.variances.size() && model.retained_fraction() <= fraction) ++model.k;
    return model; // strict > matches scikit-learn PCA(n_components=fraction)
}
struct Scaler {
    Vector mu, scale;
    Matrix transform(const Matrix& X) const { auto A = centered(X, mu); for (auto& row : A) for (std::size_t j = 0; j < mu.size(); ++j) row[j] /= scale[j]; return A; }
};
inline Scaler fit_scaler(const Matrix& X_train, int ddof = 0) {
    const auto d = dimensions(X_train); require(ddof >= 0 && X_train.size() > std::size_t(ddof), "Invalid variance divisor.");
    Scaler model{mean(X_train), Vector(d, 0.0)};
    for (const auto& row : centered(X_train, model.mu)) for (std::size_t j = 0; j < d; ++j) model.scale[j] += row[j]*row[j] / double(X_train.size() - ddof);
    for (auto& value : model.scale) value = value > 0.0 ? std::sqrt(value) : 1.0; return model;
}
inline double squared_distance(const Vector& a, const Vector& b) { require(a.size() == b.size(), "Distance dimensions differ."); double sum = 0; for (std::size_t j = 0; j < a.size(); ++j) sum += (a[j]-b[j])*(a[j]-b[j]); return sum; }
inline double mse(const Matrix& X, const Matrix& X_hat) { const auto d = dimensions(X); require(X.size() == X_hat.size(), "Reconstruction rows differ."); double sum = 0; for (std::size_t i = 0; i < X.size(); ++i) sum += squared_distance(X[i], X_hat[i]); return sum / double(X.size()*d); }
inline std::vector<int> dbscan(const Matrix& X, double epsilon, std::size_t min_samples) {
    dimensions(X); require(std::isfinite(epsilon) && epsilon > 0 && min_samples > 0, "Invalid DBSCAN parameters.");
    const int unseen = -2, noise = -1; std::vector<int> labels(X.size(), unseen); int cluster = 0;
    auto neighbours = [&](std::size_t i) { std::vector<std::size_t> result; for (std::size_t j = 0; j < X.size(); ++j) if (squared_distance(X[i],X[j]) <= epsilon*epsilon) result.push_back(j); return result; };
    for (std::size_t i = 0; i < X.size(); ++i) {
        if (labels[i] != unseen) continue; auto seeds = neighbours(i);
        if (seeds.size() < min_samples) { labels[i] = noise; continue; }
        labels[i] = cluster; std::vector<bool> queued(X.size(), false); for (auto j : seeds) queued[j] = true;
        for (std::size_t next = 0; next < seeds.size(); ++next) {
            const auto j = seeds[next]; if (labels[j] == noise) labels[j] = cluster;
            if (labels[j] != unseen) continue; labels[j] = cluster;
            const auto around = neighbours(j); if (around.size() < min_samples) continue;
            for (auto q : around) if (!queued[q]) { queued[q] = true; seeds.push_back(q); }
        }
        ++cluster;
    }
    return labels;
}
struct Kmeans { Matrix centres; std::vector<int> labels; };
inline Kmeans kmeans(const Matrix& X, Matrix centres, int iterations = 100) {
    require(dimensions(X) == dimensions(centres), "Centre dimensions differ."); require(iterations > 0 && centres.size() <= X.size(), "Invalid K-means parameters.");
    std::vector<int> labels(X.size(), -1);
    for (int step = 0; step < iterations; ++step) {
        auto previous = labels;
        for (std::size_t i = 0; i < X.size(); ++i) { double best = std::numeric_limits<double>::infinity(); for (std::size_t j = 0; j < centres.size(); ++j) { const double distance = squared_distance(X[i],centres[j]); if (distance < best) { best = distance; labels[i] = int(j); } } }
        Matrix sums(centres.size(), Vector(X.front().size(), 0.0)); std::vector<std::size_t> count(centres.size(), 0);
        for (std::size_t i = 0; i < X.size(); ++i) { ++count[labels[i]]; for (std::size_t f = 0; f < X[i].size(); ++f) sums[labels[i]][f] += X[i][f]; }
        for (std::size_t j = 0; j < centres.size(); ++j) if (count[j]) for (std::size_t f = 0; f < centres[j].size(); ++f) centres[j][f] = sums[j][f] / double(count[j]);
        if (labels == previous) break; // an empty cluster keeps its previous centre
    }
    return {centres, labels};
}
inline int predict_1nn(const Matrix& X_train, const std::vector<int>& y_train, const Vector& query) {
    dimensions(X_train); require(X_train.size() == y_train.size(), "Label count differs.");
    double best = std::numeric_limits<double>::infinity(); int label = 0;
    for (std::size_t i = 0; i < X_train.size(); ++i) { const double distance = squared_distance(X_train[i],query); if (distance < best) { best = distance; label = y_train[i]; } } return label;
}
inline Vector fisher_direction(const Matrix& X, const std::vector<int>& y, double ridge = 1e-6) {
    const auto d = dimensions(X); require(X.size() == y.size() && ridge >= 0.0, "Invalid LDA arguments."); Matrix groups[2];
    for (std::size_t i = 0; i < X.size(); ++i) { require(y[i] == 0 || y[i] == 1, "This Fisher example uses labels 0 and 1."); groups[y[i]].push_back(X[i]); }
    const auto m0 = mean(groups[0]), m1 = mean(groups[1]); Matrix S(d, Vector(d+1, 0.0));
    for (int c = 0; c < 2; ++c) for (const auto& row : centered(groups[c], c == 0 ? m0 : m1)) for (std::size_t j = 0; j < d; ++j) for (std::size_t k = 0; k < d; ++k) S[j][k] += row[j]*row[k];
    for (std::size_t j = 0; j < d; ++j) { S[j][j] += ridge; S[j][d] = m1[j]-m0[j]; }
    for (std::size_t p = 0; p < d; ++p) { std::size_t pivot = p; for (std::size_t i = p+1; i < d; ++i) if (std::abs(S[i][p]) > std::abs(S[pivot][p])) pivot = i; require(std::abs(S[pivot][p]) > 1e-15, "Singular LDA scatter: use positive ridge."); std::swap(S[p],S[pivot]); const double scale = S[p][p]; for (std::size_t k = p; k <= d; ++k) S[p][k] /= scale; for (std::size_t i = 0; i < d; ++i) if (i != p) { const double value = S[i][p]; for (std::size_t k = p; k <= d; ++k) S[i][k] -= value*S[p][k]; } }
    Vector w(d); for (std::size_t j = 0; j < d; ++j) w[j] = S[j][d]; const double length = std::sqrt(dot(w,w)); require(length > 0.0, "Class means coincide: no nonzero Fisher direction."); for (auto& x : w) x /= length; return w;
}
inline Matrix load_csv(const std::string& filename) {
    std::ifstream file(filename); require(bool(file), "Cannot open CSV: " + filename); Matrix X; std::string line; bool first = true;
    while (std::getline(file,line)) { if (line.empty()) continue; std::stringstream stream(line); std::string cell; Vector row; bool numeric = true;
        while (std::getline(stream,cell,',')) { try { std::size_t end = 0; const double value = std::stod(cell,&end); while (end < cell.size() && std::isspace(static_cast<unsigned char>(cell[end]))) ++end; if (end != cell.size() || !std::isfinite(value)) numeric = false; row.push_back(value); } catch (...) { numeric = false; } }
        if (!numeric && first) { first = false; continue; } require(numeric && !row.empty(), "Malformed numeric CSV row in " + filename); X.push_back(row); first = false;
    }
    dimensions(X); return X;
}
inline void json_number(std::ostream& out, double value) { if (std::isfinite(value)) out << std::setprecision(17) << value; else out << "null"; }
inline void json_vector(std::ostream& out, const Vector& v) { out << '['; for (std::size_t i = 0; i < v.size(); ++i) { if (i) out << ','; json_number(out,v[i]); } out << ']'; }
inline void json_matrix(std::ostream& out, const Matrix& X) { out << '['; for (std::size_t i = 0; i < X.size(); ++i) { if (i) out << ','; json_vector(out,X[i]); } out << ']'; }
inline Vector as_numbers(const std::vector<int>& values) { return Vector(values.begin(),values.end()); }
} // namespace roz
