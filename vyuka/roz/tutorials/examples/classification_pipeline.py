"""Train-only scaling + PCA + SVM, matching the C++ companion.

python classification_pipeline.py data/blobs_train.csv data/blobs_test.csv rbf 1 1
The last CSV column contains the binary class label. Choose parameters on
validation data; pass the final test only after all choices are fixed.
"""
import json
import sys
import numpy as np
from sklearn.decomposition import PCA
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC


def main():
    if len(sys.argv) < 3:
        raise SystemExit("Usage: classification_pipeline.py train.csv test.csv [linear|rbf] [C] [gamma]")
    train = np.loadtxt(sys.argv[1], delimiter=",", skiprows=1)
    test = np.loadtxt(sys.argv[2], delimiter=",", skiprows=1)
    kernel = sys.argv[3] if len(sys.argv) > 3 else "rbf"
    c = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
    gamma = float(sys.argv[5]) if len(sys.argv) > 5 else 1.0
    model = make_pipeline(StandardScaler(), PCA(n_components=0.95, svd_solver="full"),
                          SVC(kernel=kernel, C=c, gamma=gamma, tol=1e-3))
    model.fit(train[:, :-1], train[:, -1].astype(int))
    predicted = model.predict(test[:, :-1])
    print(json.dumps({"pca_components": int(model.named_steps["pca"].n_components_),
                      "accuracy": float(np.mean(predicted == test[:, -1])),
                      "predictions": predicted.tolist()}, indent=2))


if __name__ == "__main__":
    main()
