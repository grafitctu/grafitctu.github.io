from math import atan2, cos, hypot, sin, sqrt


# BEGIN example
def fit_pca(samples):
    if len(samples) < 2:
        raise ValueError("Need at least two samples")
    mean = tuple(sum(column) / len(samples) for column in zip(*samples))
    dx = [x - mean[0] for x, _ in samples]
    dy = [y - mean[1] for _, y in samples]
    n = len(samples) - 1
    c11 = sum(x * x for x in dx) / n
    c12 = sum(x * y for x, y in zip(dx, dy)) / n
    c22 = sum(y * y for y in dy) / n
    radius = hypot(c11 - c22, 2 * c12)
    angle = atan2(2 * c12, c11 - c22) / 2 if radius else 0
    values = ((c11 + c22 + radius) / 2, (c11 + c22 - radius) / 2)
    first, second = (cos(angle), sin(angle)), (-sin(angle), cos(angle))
    return mean, (c11, c12, c22), values, first, second


def score(x, mean, axis):
    return sum((v - m) * a for v, m, a in zip(x, mean, axis))


def reconstruct_one(x, mean, first):
    z = score(x, mean, first)
    return tuple(m + z * a for m, a in zip(mean, first))
# END example


if __name__ == "__main__":
    samples = [(1, 1), (2, 3), (3, 2), (4, 4)]
    mean, covariance, values, first, _ = fit_pca(samples)
    print("C11 C12 C22:", *covariance)
    print("lambda1 lambda2:", *values)
    print("PC1:", *first)
    print("B reconstructed with k=1:", *reconstruct_one(samples[1], mean, first))
    print("Mahalanobis at Euclidean distance 2:", *(2 / sqrt(v) for v in values))
