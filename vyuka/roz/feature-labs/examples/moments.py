# BEGIN example
def moments(pixels, areas=False):
    mass = len(pixels)
    if not mass:
        raise ValueError("The mask is empty")
    cx, cy = (sum(column) / mass for column in zip(*pixels))
    centered = [(x - cx, y - cy) for x, y in pixels]
    correction = mass / 12 if areas else 0
    mu20 = sum(x * x for x, _ in centered) + correction
    mu02 = sum(y * y for _, y in centered) + correction
    mu11 = sum(x * y for x, y in centered)
    eta20, eta02, eta11 = (m / mass**2 for m in (mu20, mu02, mu11))
    phi1 = eta20 + eta02
    phi2 = (eta20 - eta02) ** 2 + 4 * eta11**2
    return mass, (cx, cy), (mu20, mu02, mu11), (phi1, phi2)
# END example


if __name__ == "__main__":
    mask = [(0, 0), (0, 1), (0, 2), (0, 3), (1, 3), (2, 3)]
    mass, centroid, mu, phi = moments(mask)
    print("mass centroid:", mass, *centroid)
    print("mu20 mu02 mu11:", *mu)
    print("phi1 phi2:", *phi)
