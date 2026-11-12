"""Runnable Python counterparts of the C++ snippets in the ROZ tutorials."""
import json
import numpy as np
from sklearn.cluster import DBSCAN, KMeans
from sklearn.decomposition import PCA
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC


# BEGIN matvec
def matrix_times_vector(A, v):
    A = np.asarray(A, dtype=float)
    v = np.asarray(v, dtype=float)
    return A @ v
# END matvec


# BEGIN pca-experiment
def pca_experiment(X_train, X_validation):
    # Learn the mean and directions from training data only.
    pca = PCA(n_components=0.95, svd_solver="full")
    Z_train = pca.fit_transform(X_train)
    Z_validation = pca.transform(X_validation)
    X_reconstructed = pca.inverse_transform(Z_validation)
    return X_reconstructed
# END pca-experiment


# BEGIN pca-fit
def learn_pca(X_train, k):
    return PCA(n_components=k, svd_solver="full").fit(X_train)
# END pca-fit


# BEGIN pca-reconstruct
def reconstruct(fitted_model, X, k):
    directions = fitted_model.components_[:k]
    scores = (X - fitted_model.mean_) @ directions.T
    return fitted_model.mean_ + scores @ directions
# END pca-reconstruct


# BEGIN projection
def project_on_axis(X, angle_degrees):
    mu = X.mean(axis=0)
    centered = X - mu
    theta = np.deg2rad(angle_degrees)
    u = np.array([np.cos(theta), np.sin(theta)])
    return centered @ u
# END projection


# BEGIN dbscan
def find_clusters(X):
    return DBSCAN(eps=0.18, min_samples=6).fit_predict(X)
    # min_samples includes the point itself; -1 means noise.
# END dbscan


# BEGIN feature-map
def add_radial_feature(X):
    radius_squared = np.sum(X * X, axis=1)
    return np.c_[X, radius_squared]  # explicit map, not an RBF kernel
# END feature-map


# BEGIN kmeans
def find_kmeans(X):
    initial_centres = X[[0, -1]]
    model = KMeans(n_clusters=2, init=initial_centres, n_init=1,
                   max_iter=100, algorithm="lloyd")
    return model.fit_predict(X)
# END kmeans


# BEGIN svm-fitting
def classify(X_train, y_train, X_validation):
    model = SVC(kernel="rbf", C=1.0, gamma=1.0)
    model.fit(X_train, y_train)
    return model.predict(X_validation)
# END svm-fitting


# BEGIN lda
def learn_fisher_direction(X_train, y_train):
    groups = [X_train[y_train == label] for label in (0, 1)]
    means = [group.mean(axis=0) for group in groups]
    scatter = sum((group - mu).T @ (group - mu)
                  for group, mu in zip(groups, means))
    ridge = 1e-6
    w = np.linalg.solve(scatter + ridge * np.eye(X_train.shape[1]),
                        means[1] - means[0])
    return w / np.linalg.norm(w)
# END lda


# BEGIN pipeline
def training_pipeline(X_train, y_train, X_validation):
    model = make_pipeline(
        StandardScaler(),  # variance divisor n
        PCA(n_components=0.95, svd_solver="full"),  # divisor n-1
        SVC(kernel="rbf", C=1.0, gamma=1.0),
    )
    model.fit(X_train, y_train)
    return model.predict(X_validation)
# END pipeline


if __name__ == "__main__":
    X = np.array([[1., 1.], [2., 2.], [3., 2.], [4., 3.]])
    y = np.array([0, 0, 1, 1])
    model = learn_pca(X, 2)
    print(json.dumps({
        "Av": matrix_times_vector([[2, 1], [0, 1]], [1, 2]).tolist(),
        "reconstruction_mse": float(np.mean((X - reconstruct(model, X, 1))**2)),
        "scores": project_on_axis(X, 35).tolist(),
        "dbscan": find_clusters(X).tolist(),
        "kmeans": find_kmeans(X).tolist(),
        "fisher": learn_fisher_direction(X, y).tolist(),
        "svm": classify(X, y, X).tolist(),
        "pipeline": training_pipeline(X, y, X).tolist(),
        "feature_map": add_radial_feature(X).tolist(),
        "pca_experiment_mse": float(np.mean((X - pca_experiment(X, X))**2)),
    }, indent=2))
