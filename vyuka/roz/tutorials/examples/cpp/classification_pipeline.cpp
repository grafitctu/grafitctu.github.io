#include "svm_model.hpp"
using namespace roz;
int main(int argc, char** argv) {
    try {
        require(argc >= 3,"Usage: classification_pipeline train.csv test.csv [linear|rbf] [C] [gamma]");
        Matrix X_train = load_csv(argv[1]), X_test = load_csv(argv[2]); std::vector<int> y_train, y_test;
        for (auto& row : X_train) { require(row.back() == 0 || row.back() == 1,"Use binary 0/1 labels in the last CSV column."); y_train.push_back(int(row.back())); row.pop_back(); }
        for (auto& row : X_test) { require(row.back() == 0 || row.back() == 1,"Use binary 0/1 labels in the last CSV column."); y_test.push_back(int(row.back())); row.pop_back(); }
        const std::string kernel = argc > 3 ? argv[3] : "rbf"; const double C = argc > 4 ? std::stod(argv[4]) : 1.0, gamma = argc > 5 ? std::stod(argv[5]) : 1.0;
        const auto scaler = fit_scaler(X_train); const auto scaled_train = scaler.transform(X_train), scaled_test = scaler.transform(X_test);
        const auto pca = fit_pca_variance(scaled_train,.95); const auto Z_train = pca.transform(scaled_train), Z_test = pca.transform(scaled_test);
        const auto model = fit_svm(Z_train,y_train,kernel,C,gamma); const auto predicted = model.predict(Z_test);
        std::size_t correct = 0; for (std::size_t i = 0; i < predicted.size(); ++i) if (predicted[i] == y_test[i]) ++correct;
        std::cout << "{\"pca_components\":" << pca.k << ",\"accuracy\":" << std::setprecision(17) << double(correct)/double(predicted.size()) << ",\"predictions\":"; json_vector(std::cout,as_numbers(predicted)); std::cout << "}\n";
    } catch (const std::exception& e) { std::cerr << e.what() << '\n'; return 1; }
}
