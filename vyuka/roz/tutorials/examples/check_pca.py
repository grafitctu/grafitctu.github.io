"""Reproduce the four-point example independently with NumPy.

Run: python check_pca.py
The presentation itself has no Python or NumPy dependency.
"""

from pathlib import Path
import numpy as np

X = np.loadtxt(Path(__file__).with_name("data.csv"), delimiter=",", skiprows=1, usecols=(1, 2))
mean = X.mean(axis=0)
centered = X - mean
covariance = np.cov(X, rowvar=False, ddof=1)
eigenvalues, eigenvectors = np.linalg.eigh(covariance)
order = np.argsort(eigenvalues)[::-1]
eigenvalues = eigenvalues[order]
eigenvectors = eigenvectors[:, order]

print("Mean:", mean)
print("Sample covariance:\n", covariance)
print("Eigenvalues (descending):", eigenvalues)
print("Unit eigenvectors (columns):\n", eigenvectors)
print("C U - U diag(lambda):\n", covariance @ eigenvectors - eigenvectors * eigenvalues)
print("Eigenvector signs may differ from the presentation; the axes are equivalent.")
for k in range(3):
    basis = eigenvectors[:, :k]
    scores = centered @ basis
    reconstruction = mean + scores @ basis.T
    mse = float(np.mean((X - reconstruction) ** 2))
    retained = float(eigenvalues[:k].sum() / eigenvalues.sum())
    print(f"k={k}: retained_variance={retained:.12f}, MSE={mse:.12f}")

np.testing.assert_allclose(mean, [2.5, 2.0])
np.testing.assert_allclose(covariance, [[5 / 3, 1], [1, 2 / 3]])
np.testing.assert_allclose(covariance @ eigenvectors, eigenvectors * eigenvalues, atol=1e-12)
