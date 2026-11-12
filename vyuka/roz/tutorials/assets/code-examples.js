window.RozCodeExamples = {
  "matvec": {
    "cpp": "Vector matrix_times_vector(const Matrix& A, const Vector& v) {\n    Vector w(A.size(), 0.0);\n    for (std::size_t i = 0; i < A.size(); ++i)\n        for (std::size_t j = 0; j < v.size(); ++j)\n            w[i] += A[i][j] * v[j];\n    return w;\n}",
    "python": "def matrix_times_vector(A, v):\n    A = np.asarray(A, dtype=float)\n    v = np.asarray(v, dtype=float)\n    return A @ v",
    "downloads": {
      "cpp": "packages/matvec-cpp.zip",
      "python": "packages/matvec-python.zip"
    }
  },
  "pca-experiment": {
    "cpp": "Matrix pca_experiment(const Matrix& X_train, const Matrix& X_validation) {\n    // Learn the mean and directions from training data only.\n    auto pca = fit_pca_variance(X_train, 0.95);\n    Matrix Z_train = pca.transform(X_train);\n    Matrix Z_validation = pca.transform(X_validation);\n    Matrix X_reconstructed = pca.inverse_transform(Z_validation);\n    return X_reconstructed;\n}",
    "python": "def pca_experiment(X_train, X_validation):\n    # Learn the mean and directions from training data only.\n    pca = PCA(n_components=0.95, svd_solver=\"full\")\n    Z_train = pca.fit_transform(X_train)\n    Z_validation = pca.transform(X_validation)\n    X_reconstructed = pca.inverse_transform(Z_validation)\n    return X_reconstructed",
    "downloads": {
      "cpp": "packages/pca-experiment-cpp.zip",
      "python": "packages/pca-experiment-python.zip"
    }
  },
  "pca-fit": {
    "cpp": "Pca learn_pca(const Matrix& X_train, std::size_t k) {\n    // fit_pca computes sample covariance, eigenvectors and eigenvalues.\n    // Its readable implementation is in recognition.hpp.\n    Pca model = fit_pca(X_train, k);\n    return model; // mean, unit directions, variances, component count\n}",
    "python": "def learn_pca(X_train, k):\n    return PCA(n_components=k, svd_solver=\"full\").fit(X_train)",
    "downloads": {
      "cpp": "packages/pca-fit-cpp.zip",
      "python": "packages/pca-fit-python.zip"
    }
  },
  "pca-reconstruct": {
    "cpp": "Matrix reconstruct(const Pca& fitted_model, const Matrix& X, std::size_t k) {\n    Pca model = fitted_model; // reuse the fitted mean and directions\n    require(k <= model.directions.size(), \"Too many components.\");\n    model.k = k;\n    Matrix Z = model.transform(X);\n    return model.inverse_transform(Z); // k=0 returns the training mean\n}",
    "python": "def reconstruct(fitted_model, X, k):\n    directions = fitted_model.components_[:k]\n    scores = (X - fitted_model.mean_) @ directions.T\n    return fitted_model.mean_ + scores @ directions",
    "downloads": {
      "cpp": "packages/pca-reconstruct-cpp.zip",
      "python": "packages/pca-reconstruct-python.zip"
    }
  },
  "projection": {
    "cpp": "Vector project_on_axis(const Matrix& X, double angle_degrees) {\n    Vector mu = mean(X);\n    Matrix A = centered(X, mu);\n    double theta = angle_degrees * std::acos(-1.0) / 180.0;\n    Vector u{std::cos(theta), std::sin(theta)}; // unit direction\n    Vector scores;\n    for (const auto& x : A) scores.push_back(dot(x, u));\n    return scores;\n}",
    "python": "def project_on_axis(X, angle_degrees):\n    mu = X.mean(axis=0)\n    centered = X - mu\n    theta = np.deg2rad(angle_degrees)\n    u = np.array([np.cos(theta), np.sin(theta)])\n    return centered @ u",
    "downloads": {
      "cpp": "packages/projection-cpp.zip",
      "python": "packages/projection-python.zip"
    }
  },
  "dbscan": {
    "cpp": "std::vector<int> find_clusters(const Matrix& X) {\n    double epsilon = 0.18;\n    std::size_t min_samples = 6; // the point itself counts\n    std::vector<int> labels = dbscan(X, epsilon, min_samples);\n    return labels; // -1 means noise; nonnegative values identify clusters\n}",
    "python": "def find_clusters(X):\n    return DBSCAN(eps=0.18, min_samples=6).fit_predict(X)\n    # min_samples includes the point itself; -1 means noise.",
    "downloads": {
      "cpp": "packages/dbscan-cpp.zip",
      "python": "packages/dbscan-python.zip"
    }
  },
  "feature-map": {
    "cpp": "Matrix add_radial_feature(const Matrix& X) {\n    Matrix mapped;\n    for (const auto& x : X) {\n        double radius_squared = x[0]*x[0] + x[1]*x[1];\n        mapped.push_back({x[0], x[1], radius_squared});\n    }\n    return mapped; // an explicit feature map, not an RBF kernel\n}",
    "python": "def add_radial_feature(X):\n    radius_squared = np.sum(X * X, axis=1)\n    return np.c_[X, radius_squared]  # explicit map, not an RBF kernel",
    "downloads": {
      "cpp": "packages/feature-map-cpp.zip",
      "python": "packages/feature-map-python.zip"
    }
  },
  "kmeans": {
    "cpp": "Kmeans find_kmeans(const Matrix& X) {\n    Matrix initial_centres{X.front(), X.back()};\n    Kmeans result = kmeans(X, initial_centres, 100);\n    return result; // centres and labels; empty clusters keep their centres\n}",
    "python": "def find_kmeans(X):\n    initial_centres = X[[0, -1]]\n    model = KMeans(n_clusters=2, init=initial_centres, n_init=1,\n                   max_iter=100, algorithm=\"lloyd\")\n    return model.fit_predict(X)",
    "downloads": {
      "cpp": "packages/kmeans-cpp.zip",
      "python": "packages/kmeans-python.zip"
    }
  },
  "svm-fitting": {
    "cpp": "std::vector<int> classify(const Matrix& X_train, const std::vector<int>& y_train,\n                          const Matrix& X_validation) {\n    double C = 1.0, gamma = 1.0;\n    auto model = fit_svm(X_train, y_train, \"rbf\", C, gamma);\n    return model.predict(X_validation); // LIBSVM trains the actual SVM\n}",
    "python": "def classify(X_train, y_train, X_validation):\n    model = SVC(kernel=\"rbf\", C=1.0, gamma=1.0)\n    model.fit(X_train, y_train)\n    return model.predict(X_validation)",
    "downloads": {
      "cpp": "packages/svm-fitting-cpp.zip",
      "python": "packages/svm-fitting-python.zip"
    }
  },
  "lda": {
    "cpp": "Vector learn_fisher_direction(const Matrix& X_train, const std::vector<int>& y_train) {\n    // Binary Fisher LDA: solve (within-class scatter + ridge*I) w = mu1-mu0.\n    double ridge = 1e-6;\n    return fisher_direction(X_train, y_train, ridge); // unit-length direction\n}",
    "python": "def learn_fisher_direction(X_train, y_train):\n    groups = [X_train[y_train == label] for label in (0, 1)]\n    means = [group.mean(axis=0) for group in groups]\n    scatter = sum((group - mu).T @ (group - mu)\n                  for group, mu in zip(groups, means))\n    ridge = 1e-6\n    w = np.linalg.solve(scatter + ridge * np.eye(X_train.shape[1]),\n                        means[1] - means[0])\n    return w / np.linalg.norm(w)",
    "downloads": {
      "cpp": "packages/lda-cpp.zip",
      "python": "packages/lda-python.zip"
    }
  },
  "pipeline": {
    "cpp": "std::vector<int> training_pipeline(const Matrix& X_train, const std::vector<int>& y_train,\n                                   const Matrix& X_validation) {\n    auto scaler = fit_scaler(X_train); // divisor n, like StandardScaler\n    Matrix A_train = scaler.transform(X_train);\n    Matrix A_validation = scaler.transform(X_validation);\n    auto pca = fit_pca_variance(A_train, 0.95); // sample covariance uses n-1\n    Matrix Z_train = pca.transform(A_train);\n    Matrix Z_validation = pca.transform(A_validation);\n    auto model = fit_svm(Z_train, y_train, \"rbf\", 1.0, 1.0);\n    return model.predict(Z_validation); // no fitting on validation or test\n}",
    "python": "def training_pipeline(X_train, y_train, X_validation):\n    model = make_pipeline(\n        StandardScaler(),  # variance divisor n\n        PCA(n_components=0.95, svd_solver=\"full\"),  # divisor n-1\n        SVC(kernel=\"rbf\", C=1.0, gamma=1.0),\n    )\n    model.fit(X_train, y_train)\n    return model.predict(X_validation)",
    "downloads": {
      "cpp": "packages/pipeline-cpp.zip",
      "python": "packages/pipeline-python.zip"
    }
  }
};
