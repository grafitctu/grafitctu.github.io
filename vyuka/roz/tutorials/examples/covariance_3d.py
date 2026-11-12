"""Three feature columns -> a 3 by 3 sample covariance matrix (divisor n-1)."""
import json
import sys
from pathlib import Path
import numpy as np


# BEGIN covariance-3d
def sample_covariance(X):
    X = np.asarray(X, dtype=float)  # rows = samples, columns = features
    if X.ndim != 2 or len(X) < 2 or not np.isfinite(X).all():
        raise ValueError("Use at least two finite samples.")
    centered = X - X.mean(axis=0)
    return centered.T @ centered / (len(X) - 1)
# END covariance-3d


if __name__ == "__main__":
    filename = Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).parent / "data/toy-3d.csv"
    X = np.loadtxt(filename, delimiter=",", skiprows=1, ndmin=2)
    if X.shape[1] != 3:
        raise ValueError("Use three feature columns: x1,x2,x3. All three columns are features.")
    C = sample_covariance(X)
    values, vectors = np.linalg.eigh(C)
    order = np.argsort(values)[::-1]
    print(json.dumps({"n": len(X), "mean": X.mean(axis=0).tolist(),
                      "centered": (X-X.mean(axis=0)).tolist(), "covariance": C.tolist(),
                      "eigenvalues": np.maximum(values[order], 0).tolist(),
                      "directions_as_rows": vectors[:, order].T.tolist()}, indent=2))
