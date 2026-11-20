"""Readable numerical companions. The text model uses hand-authored teaching weights."""
import csv
import json
from pathlib import Path
import sys
import numpy as np

# BEGIN linear
def linear(x, m, b):
    return m*x + b
# END linear

# BEGIN relu
def relu(z):
    return np.maximum(0, z)

def neuron(x, w, b):
    return relu(w*x + b)
# END relu

# BEGIN affine
def affine_relu(W, x, b):
    return relu(np.asarray(W) @ x + b)
# END affine

# BEGIN softmax
def softmax(logits, temperature=1.0):
    logits = np.asarray(logits, dtype=float)
    if temperature <= 0 or not np.isfinite(logits.max()):
        raise ValueError("Use a positive temperature and at least one unmasked score.")
    p = np.exp((logits-logits.max())/temperature)
    return p/p.sum()
# END softmax

def load_cars(filename):
    with Path(filename).open(encoding="utf-8", newline="") as f:
        return [{**r, "horsepower": float(r["horsepower"]), "mpg": float(r["mpg"])} for r in csv.DictReader(f)]

def training(rows):
    train = [r for r in rows if r["split"] == "train"]
    x = np.array([r["horsepower"] for r in train])
    y = np.array([r["mpg"] for r in train])
    return x, y, x.mean(), x.std(ddof=0)

# BEGIN basis
def fit_basis(rows, k, ridge):
    x, y, mean, sd = training(rows)
    z = (x-mean)/sd
    knots = np.linspace(z.min(), z.max(), k+2)[1:-1]
    Phi = np.column_stack([np.ones(len(z)), z, relu(z[:, None]-knots)])
    penalty = np.eye(k+2)*ridge
    penalty[0, 0] = 0  # do not penalize the intercept
    beta = np.linalg.solve(Phi.T @ Phi + penalty, Phi.T @ y)
    return {"mean": mean, "sd": sd, "knots": knots, "beta": beta}
# END basis

def predict(model, hp):
    z = (hp-model["mean"])/model["sd"]
    return np.r_[1, z, relu(z-model["knots"])] @ model["beta"]

# BEGIN gradient
def line_gradient(rows, w, b):
    x, y, mean, sd = training(rows)
    z, yc = (x-mean)/sd, y-y.mean()
    errors = w*z+b-yc
    return {"loss": np.mean(errors**2), "dw": 2*np.mean(errors*z),
            "db": 2*np.mean(errors)}
# END gradient

# BEGIN network
def forward(x, activation="relu"):
    W1 = np.array([[-1.4], [-.7], [.4], [.8], [1.2]])
    b1, b2 = np.array([-.8, .2, .6, -.4, .3]), np.array([.1, -.2, .3, -.1, .2])
    W2 = np.array([[(((i+1)*7+(j+1)*3) % 11-5)/6 for j in range(5)] for i in range(5)])
    W3 = np.array([.6, -.4, .8, -.7, .5])
    sigma = (lambda z: z) if activation == "identity" else np.tanh if activation == "tanh" else relu
    z1 = W1 @ [x] + b1
    h1 = sigma(z1)
    z2 = W2 @ h1 + b2
    h2 = sigma(z2)
    return {"h1": h1, "h2": h2, "y": W3 @ h2 + .1, "parameters": 46}
# END network

WQ = np.array([[1.4, .2, -.4], [.4, 1.6, .2], [-.6, .4, 1.2]])
WK = np.array([[1.2, -.2, .8], [.2, 1.4, -.4], [.4, .2, 1.8]])
WV = np.array([[1, 0, .2], [-.1, .8, .1], [0, .3, .7]])
WOUT = np.array([[.7, 1.3, .4], [-.4, .5, .9], [.2, -.6, 1.1], [-.8, .2, .1], [1.2, -.7, -.4]])
BOUT = np.array([1.2, .4, -.2, -.8, -.4])

# BEGIN attention
def attend(H, query, causal=True, temperature=1.0):
    H = np.asarray(H, dtype=float)  # samples/tokens in rows
    Q, K, V = H @ WQ.T, H @ WK.T, H @ WV.T
    scores = K @ Q[query] / np.sqrt(3)
    if causal:
        scores[np.arange(len(H)) > query] = -np.inf
    alpha = softmax(scores, temperature)
    return {"Q": Q, "K": K, "V": V, "scores": scores,
            "alpha": alpha, "context": alpha @ V}
# END attention

def run_demo(mode, filename=None):
    if mode == "linear": return {"prediction": linear(120, -.12, 40)}
    if mode == "relu": return {"z": -1.2*.8+.6, "activation": neuron(.8, -1.2, .6)}
    if mode == "affine": return {"h": affine_relu([[1,.5,0],[-.5,1,.2],[.3,-.2,.8]], [1,2,-1], [0,.2,-.1])}
    if mode == "softmax": return {"probabilities": softmax([1000,1001,999])}
    if mode == "network": return forward(.8)
    if mode == "attention":
        H = np.array([[.2,.1,-.1],[.8,0,.2],[.1,.3,0],[1,-.2,.4],[0,.9,.5],[.2,.1,.3]])
        for p in range(len(H)): H[p] += [.03*p, .02*(p % 2), -.01*p]
        result = attend(H, 5)
        result["logits"] = WOUT @ result["context"] + BOUT
        result["probabilities"] = softmax(result["logits"])
        return result
    rows = load_cars(filename or Path(__file__).parent / "data/auto-mpg-50.csv")
    if mode == "basis":
        model = fit_basis(rows, 5, .01)
        return {"knots": model["knots"], "beta": model["beta"], "predictions": [predict(model, r["horsepower"]) for r in rows]}
    if mode == "gradient":
        w, b, losses = 0., 4., []
        for _ in range(50):
            g = line_gradient(rows, w, b); losses.append(g["loss"])
            w -= .1*g["dw"]; b -= .1*g["db"]
        return {"w": w, "b": b, "losses": losses}
    raise ValueError("Choose linear, relu, affine, softmax, network, attention, basis or gradient.")

def json_value(x):
    if isinstance(x, np.ndarray): return json_value(x.tolist())
    if isinstance(x, dict): return {k: json_value(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)): return [json_value(v) for v in x]
    if isinstance(x, (float, np.floating)): return float(x) if np.isfinite(x) else None
    if isinstance(x, np.integer): return int(x)
    return x

if __name__ == "__main__":
    print(json.dumps(json_value(run_demo(sys.argv[1] if len(sys.argv)>1 else "attention", sys.argv[2] if len(sys.argv)>2 else None)), indent=2, allow_nan=False))
