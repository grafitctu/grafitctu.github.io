#include "recognition.hpp"
#include <filesystem>
using namespace roz;
int main(int argc, char** argv) {
    try {
        std::string dataset = "cloud", directory = "../data"; double angle = 0.0, y_scale = 1.0, epsilon = .18; int min_samples = 6; bool standardize = false;
        for (int i = 1; i < argc; ++i) { const std::string option = argv[i]; if (option == "--standardize") { standardize = true; continue; } require(i+1 < argc,"Missing value for " + option); const std::string value = argv[++i];
            if (option == "--dataset") dataset = value; else if (option == "--data") directory = value; else if (option == "--angle") angle = std::stod(value); else if (option == "--y-scale") y_scale = std::stod(value); else if (option == "--epsilon") epsilon = std::stod(value); else if (option == "--min-samples") min_samples = std::stoi(value); else throw std::invalid_argument("Unknown option " + option);
        }
        require(dataset == "cloud" || dataset == "isotropic" || dataset == "outlier" || dataset == "classes", "Unknown dataset.");
        require(std::isfinite(angle) && std::isfinite(y_scale) && y_scale > 0 && min_samples > 0,"Invalid parameters.");
        auto X = load_csv((std::filesystem::path(directory)/(dataset+".csv")).string()); for (auto& row : X) row[1] *= y_scale;
        if (standardize) X = fit_scaler(X,1).transform(X); // same ddof=1 as the existing Python companion
        const auto A = centered(X,mean(X)); const double radians = angle * std::acos(-1.0) / 180.0; const Vector u{std::cos(radians),std::sin(radians)};
        double variance = 0, total_squared_error = 0;
        for (const auto& row : A) { const double z = dot(row,u); variance += z*z / double(X.size()-1); Vector projected{z*u[0],z*u[1]}; total_squared_error += squared_distance(row,projected); }
        const auto C = covariance(X); const auto pca = fit_pca(X,2); const double total = C[0][0]+C[1][1];
        const auto labels = dbscan(load_csv((std::filesystem::path(directory)/"moons.csv").string()),epsilon,std::size_t(min_samples));
        const int clusters = *std::max_element(labels.begin(),labels.end())+1; const auto noise = std::count(labels.begin(),labels.end(),-1);
        std::cout << std::setprecision(17) << "{\"samples\":" << X.size() << ",\"sample_variance\":" << variance << ",\"retained_fraction\":";
        json_number(std::cout,total > 0 ? variance/total : std::numeric_limits<double>::quiet_NaN());
        std::cout << ",\"reconstruction_mse\":" << total_squared_error / double(X.size()) << ",\"covariance\":"; json_matrix(std::cout,C);
        std::cout << ",\"pca_variances\":"; json_vector(std::cout,pca.variances);
        std::cout << ",\"dbscan\":{\"clusters\":" << clusters << ",\"noise\":" << noise << ",\"labels\":"; json_vector(std::cout,as_numbers(labels)); std::cout << "}}\n";
    } catch (const std::exception& e) { std::cerr << e.what() << '\n'; return 1; }
}
