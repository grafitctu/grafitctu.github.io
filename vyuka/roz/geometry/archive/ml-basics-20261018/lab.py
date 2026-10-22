"""NI-ROZ / ANI-ROZ: a reproducible nine-method pattern-recognition lab.

compare uses training and validation data. final evaluates one declared choice
on the reserved image-level test split. These are teaching safeguards, not a
security mechanism: the public toy dataset and its labels remain accessible.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import platform
from pathlib import Path
from time import perf_counter

import numpy as np
import scipy
import sklearn
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.cluster import KMeans
from sklearn.datasets import load_digits
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import (
    accuracy_score, adjusted_rand_score, balanced_accuracy_score,
    confusion_matrix, f1_score, mean_absolute_error, mean_squared_error,
)
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from threadpoolctl import threadpool_limits


def compute_features(images: np.ndarray, mode: str = "pixels") -> np.ndarray:
    """Student entry point. Each row describes one image, not one pixel.

    Try a new descriptor here. Keep its definition independent of labels.
    Parameters learned from data belong in fit(), using training data only.
    """
    images = np.asarray(images, dtype=float).reshape(-1, 8, 8)
    if mode == "mean":
        return images.mean(axis=(1, 2)).reshape(-1, 1)
    if mode == "quadrants":
        return np.column_stack([
            images[:, :4, :4].mean(axis=(1, 2)),
            images[:, :4, 4:].mean(axis=(1, 2)),
            images[:, 4:, :4].mean(axis=(1, 2)),
            images[:, 4:, 4:].mean(axis=(1, 2)),
        ])
    if mode == "pixels":
        return images.reshape(-1, 64)
    raise ValueError(f"Unknown feature mode: {mode}")


class FeatureMap(TransformerMixin, BaseEstimator):
    def __init__(self, mode: str = "pixels"):
        self.mode = mode

    def fit(self, X, y=None):
        self.n_features_in_ = np.asarray(X).shape[1]
        return self

    def transform(self, X):
        return compute_features(X, self.mode)


def classifiers(seed: int = 42) -> dict:
    def scaled(estimator):
        return make_pipeline(StandardScaler(), estimator)

    return {
        "dummy": DummyClassifier(strategy="most_frequent"),
        "logreg": scaled(LogisticRegression(C=1.0, max_iter=2000)),
        "tree": DecisionTreeClassifier(max_depth=8, random_state=seed),
        "forest": RandomForestClassifier(
            n_estimators=120, max_features="sqrt", random_state=seed, n_jobs=1),
        "svm": scaled(SVC(C=3.0, kernel="rbf", gamma="scale")),
        "knn": scaled(KNeighborsClassifier(n_neighbors=3, n_jobs=1)),
        "bayes": scaled(GaussianNB()),
        "boosting": GradientBoostingClassifier(
            n_estimators=60, learning_rate=0.1, max_depth=2, random_state=seed),
    }


LABELS = {
    "dummy": "Dummy", "logreg": "Logistic regression", "tree": "Decision tree",
    "forest": "Random forest", "svm": "SVM (RBF)", "knn": "k-NN",
    "bayes": "Gaussian naive Bayes", "boosting": "Gradient boosting",
}


def environment() -> dict:
    return {"python": platform.python_version(), "numpy": np.__version__,
            "scipy": scipy.__version__, "sklearn": sklearn.__version__}


def source_hash() -> str:
    return hashlib.sha256(Path(__file__).read_bytes()).hexdigest()


def dataset_hash(X, y) -> str:
    digest = hashlib.sha256()
    digest.update(np.asarray(X, dtype="<f8").tobytes())
    digest.update(np.asarray(y, dtype="<i8").tobytes())
    return digest.hexdigest()


def split_indices(y, seed: int = 42) -> dict[str, np.ndarray]:
    development, test = train_test_split(
        np.arange(len(y)), test_size=0.2, random_state=seed, stratify=y)
    train, validation = train_test_split(
        development, test_size=0.25, random_state=seed, stratify=y[development])
    assert not (set(train) & set(validation) or set(train) & set(test)
                or set(validation) & set(test))
    assert len(train) + len(validation) + len(test) == len(y)
    return {"train": train, "validation": validation, "test": test}


def classification_scores(y, predicted) -> dict:
    return {
        "accuracy": float(accuracy_score(y, predicted)),
        "macro_f1": float(f1_score(y, predicted, average="macro", zero_division=0)),
        "balanced_accuracy": float(balanced_accuracy_score(y, predicted)),
    }


def save_json(path: Path, value) -> None:
    payload = json.dumps(value, indent=2, ensure_ascii=False, allow_nan=False)
    with path.open("x", encoding="utf-8") as stream:
        stream.write(payload + "\n")


def compare(output: str | Path, seed: int = 42) -> dict:
    output = Path(output)
    output.mkdir(parents=True, exist_ok=False)
    data = load_digits()
    X, y = data.data, data.target
    splits = split_indices(y, seed)
    tr, va = splits["train"], splits["validation"]
    rows, predictions = [], {}
    models = classifiers(seed)

    print(f"Digits: {X.shape}; train={len(tr)}, validation={len(va)}, "
          f"reserved test={len(splits['test'])}", flush=True)
    with threadpool_limits(limits=1):
        for model_id, model in models.items():
            print(f"[compare] {LABELS[model_id]}", flush=True)
            started = perf_counter()
            model.fit(X[tr], y[tr])
            fit_seconds = perf_counter() - started
            train_score = classification_scores(y[tr], model.predict(X[tr]))
            started = perf_counter()
            pred = model.predict(X[va])
            predict_seconds = perf_counter() - started
            validation_score = classification_scores(y[va], pred)
            predictions[model_id] = pred
            rows.append({"id": model_id, "name": LABELS[model_id],
                         "train": train_score, "validation": validation_score,
                         "fit_seconds": fit_seconds, "predict_seconds": predict_seconds,
                         "configuration": repr(model)})

        # One classifier and one fixed k; only the feature representation changes.
        feature_rows = []
        for mode in ("mean", "quadrants", "pixels"):
            model = make_pipeline(FeatureMap(mode), StandardScaler(),
                                  KNeighborsClassifier(n_neighbors=3, n_jobs=1))
            model.fit(X[tr], y[tr])
            feature_rows.append({"mode": mode, "dimensions": compute_features(X[:1], mode).shape[1],
                                 **classification_scores(y[va], model.predict(X[va]))})

        # Units: select a nonconstant coordinate using training variance only.
        changed_pixel = int(np.argmax(X[tr].var(axis=0)))
        changed = X.copy()
        changed[:, changed_pixel] *= 1000.0
        scaling_rows = []
        for units, values in (("original", X), ("one_pixel_x1000", changed)):
            for scaled in (False, True):
                estimator = KNeighborsClassifier(n_neighbors=3, n_jobs=1)
                model = make_pipeline(StandardScaler(), estimator) if scaled else estimator
                model.fit(values[tr], y[tr])
                scaling_rows.append({"units": units, "scaled": scaled,
                                     **classification_scores(y[va], model.predict(values[va]))})

        capacity_rows = []
        for depth in (1, 3, 8, None):
            model = DecisionTreeClassifier(max_depth=depth, random_state=seed)
            model.fit(X[tr], y[tr])
            capacity_rows.append({"max_depth": depth, "leaves": int(model.get_n_leaves()),
                                  "train": classification_scores(y[tr], model.predict(X[tr])),
                                  "validation": classification_scores(y[va], model.predict(X[va]))})

        # Known K=10 is an explicit teaching input, not discovered from images.
        scaler = StandardScaler().fit(X[tr])
        clusters = KMeans(n_clusters=10, n_init=10, random_state=seed)
        clusters.fit(scaler.transform(X[tr]))
        cluster_ids = clusters.predict(scaler.transform(X[va]))
        permutation = np.random.default_rng(seed + 1).permutation(10)
        cluster_report = {
            "k": 10, "known_k": True, "fit_uses_labels": False,
            "validation_ari": float(adjusted_rand_score(y[va], cluster_ids)),
            "permuted_ari": float(adjusted_rand_score(y[va], permutation[cluster_ids])),
            "meaningless_raw_accuracy": float(accuracy_score(y[va], cluster_ids)),
            "permuted_raw_accuracy": float(accuracy_score(y[va], permutation[cluster_ids])),
            "permutation": permutation.tolist(),
            "center_images": scaler.inverse_transform(clusters.cluster_centers_).reshape(10, 8, 8).tolist(),
        }

        # A separate, explicitly synthetic regression exercise.
        rng = np.random.default_rng(seed)
        x = rng.uniform(-3, 3, size=(240, 1))
        target = 0.8 * x[:, 0] ** 2 - 0.7 * x[:, 0] + rng.normal(0, 0.6, 240)
        rtr, rva = train_test_split(np.arange(240), test_size=1/3, random_state=seed)
        regression_rows = []
        curve_x = np.linspace(-3, 3, 150).reshape(-1, 1)
        curves = {}
        for name, model in (
            ("linear", LinearRegression()),
            ("quadratic_features", make_pipeline(PolynomialFeatures(2, include_bias=False), LinearRegression())),
        ):
            model.fit(x[rtr], target[rtr])
            prediction = model.predict(x[rva])
            regression_rows.append({"features": name,
                                    "mae": float(mean_absolute_error(target[rva], prediction)),
                                    "rmse": float(np.sqrt(mean_squared_error(target[rva], prediction)))})
            curves[name] = model.predict(curve_x).tolist()

    # Select using validation only; the test outcomes have not been computed.
    ranked = sorted((r for r in rows if r["id"] != "dummy"),
                    key=lambda r: (-r["validation"]["macro_f1"],
                                   -r["validation"]["accuracy"], r["id"]))
    winner = ranked[0]["id"]
    errors = np.flatnonzero(predictions[winner] != y[va])[:8]
    error_examples = [{"dataset_index": int(va[i]), "true": int(y[va[i]]),
                       "predicted": int(predictions[winner][i]),
                       "pixels": X[va[i]].reshape(8, 8).tolist()} for i in errors]
    summary = {
        "protocol": "image-level stratified train/validation/test; a single teaching split",
        "source_sha256": source_hash(), "dataset_sha256": dataset_hash(X, y),
        "environment": environment(), "seed": seed,
        "dataset": {"name": "sklearn load_digits", "samples": len(y), "classes": 10,
                    "image_shape": [8, 8], "feature_count": 64,
                    "writer_independent_test": False},
        "split_sizes": {key: len(value) for key, value in splits.items()},
        "splits": {key: value.tolist() for key, value in splits.items()},
        "classifiers": rows, "selected_by_validation": winner,
        "feature_study": feature_rows, "scaling_study": scaling_rows,
        "scaled_pixel_index": changed_pixel, "capacity_study": capacity_rows,
        "clustering": cluster_report,
        "regression": {"synthetic": True, "training_samples": len(rtr),
                       "validation_samples": len(rva), "scores": regression_rows,
                       "x_validation": x[rva, 0].tolist(), "y_validation": target[rva].tolist(),
                       "curve_x": curve_x[:, 0].tolist(), "curves": curves},
        "validation_confusion_matrix": confusion_matrix(y[va], predictions[winner], labels=np.arange(10)).tolist(),
        "validation_error_examples": error_examples,
        "test_evaluated": False,
    }
    save_json(output / "comparison.json", summary)
    import csv
    with (output / "comparison.csv").open("x", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=["model", "train_accuracy", "validation_accuracy",
                                                    "validation_macro_f1", "fit_seconds"])
        writer.writeheader()
        for row in rows:
            writer.writerow({"model": row["id"], "train_accuracy": row["train"]["accuracy"],
                             "validation_accuracy": row["validation"]["accuracy"],
                             "validation_macro_f1": row["validation"]["macro_f1"],
                             "fit_seconds": row["fit_seconds"]})
    print(f"[compare] Saved {output / 'comparison.json'}. "
          f"Validation choice: {winner}. Test NOT evaluated.", flush=True)
    return summary


def final(output: str | Path, model_id: str | None = None, reason: str = "validation macro-F1") -> dict:
    output = Path(output)
    summary = json.loads((output / "comparison.json").read_text(encoding="utf-8"))
    if summary["source_sha256"] != source_hash():
        raise ValueError("lab.py changed. Run compare in a new output directory first.")
    if summary["environment"] != environment():
        raise ValueError("Environment changed. Run compare in a new output directory first.")
    if (output / "final.json").exists():
        raise FileExistsError("This experiment already has a final result. Keep it; do not tune on its test scores.")
    model_id = model_id or summary["selected_by_validation"]
    if model_id not in classifiers(summary["seed"]) or model_id == "dummy":
        raise ValueError("Choose one of the seven studied classifiers.")
    lock = {"model": model_id, "reason": reason, "source_sha256": source_hash()}
    choice_path = output / "final-choice.json"
    if choice_path.exists():
        if json.loads(choice_path.read_text(encoding="utf-8")) != lock:
            raise ValueError("The final choice is already recorded and differs from this request.")
    else:
        save_json(choice_path, lock)
    X, y = load_digits(return_X_y=True)
    if dataset_hash(X, y) != summary["dataset_sha256"]:
        raise ValueError("Dataset changed.")
    development = np.array(summary["splits"]["train"] + summary["splits"]["validation"])
    test = np.array(summary["splits"]["test"])
    model = classifiers(summary["seed"])[model_id]
    print(f"[final] Declared model: {model_id}. Fit on {len(development)} development images.", flush=True)
    with threadpool_limits(limits=1):
        model.fit(X[development], y[development])
        predicted = model.predict(X[test])
    report = {"model": model_id, "reason": reason, "test_samples": len(test),
              "source_sha256": source_hash(), "environment": environment(),
              "scores": classification_scores(y[test], predicted),
              "confusion_matrix": confusion_matrix(y[test], predicted, labels=np.arange(10)).tolist(),
              "scope": "one image-level toy-data split; no writer-generalization or universal-ranking claim"}
    save_json(output / "final.json", report)
    print(json.dumps(report["scores"], indent=2), flush=True)
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="phase", required=True)
    dev_parser = sub.add_parser("compare", help="training and validation experiments only")
    dev_parser.add_argument("--out", default="results/run01")
    dev_parser.add_argument("--seed", type=int, default=42)
    final_parser = sub.add_parser("final", help="evaluate one declared choice on the reserved test split")
    final_parser.add_argument("--out", default="results/run01")
    final_parser.add_argument("--model", choices=[key for key in LABELS if key != "dummy"])
    final_parser.add_argument("--reason", default="validation macro-F1")
    args = parser.parse_args()
    try:
        if args.phase == "compare":
            compare(args.out, args.seed)
        else:
            final(args.out, args.model, args.reason)
    except (FileExistsError, ValueError, FileNotFoundError) as error:
        parser.exit(2, f"ERROR: {error}\n")


if __name__ == "__main__":
    main()
