# BEGIN example
def evaluate(trials, match_threshold, pad_threshold, require_pad=True):
    passed_pad = accepted = 0
    for match, pad in trials:
        passes_pad = pad >= pad_threshold
        passed_pad += passes_pad
        accepted += match >= match_threshold and (not require_pad or passes_pad)
    return passed_pad, accepted
# END example


if __name__ == "__main__":
    # Invented pairs of scores (match, PAD) for the classroom.
    bona_fide = [(80, 85), (95, 91), (70, 68), (84, 49), (89, 64), (58, 77), (63, 72), (78, 58)]
    simulated = [(91, 13), (85, 34), (75, 46), (62, 53), (54, 32), (70, 68), (87, 24), (39, 61)]
    passed_a, accepted_a = evaluate(bona_fide, 65, 55)
    passed_b, accepted_b = evaluate(simulated, 65, 55)
    print("BPCER count:", len(bona_fide) - passed_a, len(bona_fide))
    print("APCER count:", passed_b, len(simulated))
    print("Bona fide accepted:", accepted_a, len(bona_fide))
    print("Simulated accepted:", accepted_b, len(simulated))
