#pragma once
#include "recognition.hpp"
#include "third_party/libsvm/svm.h"
#include <memory>

namespace roz {
struct FreeSvm { void operator()(svm_model* p) const { if (p) svm_free_and_destroy_model(&p); } };
class Svm {
    // A trained LIBSVM model points into the training rows: keep them alive.
    std::vector<std::vector<svm_node>> nodes_;
    std::vector<svm_node*> pointers_;
    Vector labels_;
    std::size_t d_;
    std::unique_ptr<svm_model,FreeSvm> model_;
public:
    Svm(const Matrix& X_train, const std::vector<int>& y_train, const std::string& kernel, double C, double gamma) : d_(dimensions(X_train)) {
        require(X_train.size() == y_train.size(), "Training label count differs."); require(kernel == "linear" || kernel == "rbf", "Use linear or rbf.");
        require(std::isfinite(C) && C > 0.0 && std::isfinite(gamma) && gamma > 0.0, "C and gamma must be finite and positive.");
        require(*std::min_element(y_train.begin(),y_train.end()) != *std::max_element(y_train.begin(),y_train.end()), "SVM needs two or more classes.");
        nodes_.resize(X_train.size()); labels_ = as_numbers(y_train);
        for (std::size_t i = 0; i < X_train.size(); ++i) { for (std::size_t j = 0; j < d_; ++j) nodes_[i].push_back({int(j+1),X_train[i][j]}); nodes_[i].push_back({-1,0.0}); pointers_.push_back(nodes_[i].data()); }
        svm_problem problem{}; problem.l = int(X_train.size()); problem.x = pointers_.data(); problem.y = labels_.data();
        svm_parameter parameters{}; parameters.svm_type = C_SVC; parameters.kernel_type = kernel == "linear" ? LINEAR : RBF;
        parameters.degree = 3; parameters.gamma = gamma; parameters.C = C; parameters.cache_size = 100; parameters.eps = 1e-3; parameters.shrinking = 1;
        if (const char* error = svm_check_parameter(&problem,&parameters)) throw std::invalid_argument(error);
        svm_set_print_string_function([](const char*) {});
        model_.reset(svm_train(&problem,&parameters)); require(bool(model_), "SVM training failed.");
    }
    std::vector<int> predict(const Matrix& X) const {
        require(dimensions(X) == d_, "Prediction dimension differs."); std::vector<int> labels;
        for (const auto& row : X) { std::vector<svm_node> nodes; for (std::size_t j = 0; j < row.size(); ++j) nodes.push_back({int(j+1),row[j]}); nodes.push_back({-1,0.0}); labels.push_back(int(svm_predict(model_.get(),nodes.data()))); } return labels;
    }
};
inline Svm fit_svm(const Matrix& X_train, const std::vector<int>& y_train, const std::string& kernel = "rbf", double C = 1.0, double gamma = 1.0) { return Svm(X_train,y_train,kernel,C,gamma); }
} // namespace roz
