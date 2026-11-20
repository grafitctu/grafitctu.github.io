#include <array>
#include <iostream>
#include <vector>

using Trial = std::array<int, 2>;
struct Counts { int passed_pad, accepted; };

// BEGIN example
Counts evaluate(const std::vector<Trial>& trials, int match_threshold,
                int pad_threshold, bool require_pad) {
    Counts count{};
    for (auto [match, pad] : trials) {
        const bool passes_pad = pad >= pad_threshold;
        if (passes_pad) ++count.passed_pad;
        if (match >= match_threshold && (!require_pad || passes_pad)) ++count.accepted;
    }
    return count;
}
// END example

int main() {
    // Invented pairs of scores (match, PAD) for the classroom.
    const std::vector<Trial> bona_fide{{80,85},{95,91},{70,68},{84,49},{89,64},{58,77},{63,72},{78,58}};
    const std::vector<Trial> simulated{{91,13},{85,34},{75,46},{62,53},{54,32},{70,68},{87,24},{39,61}};
    const auto a = evaluate(bona_fide, 65, 55, true);
    const auto b = evaluate(simulated, 65, 55, true);
    std::cout << "BPCER count: " << bona_fide.size() - a.passed_pad << " " << bona_fide.size() << "\n"
        << "APCER count: " << b.passed_pad << " " << simulated.size() << "\n"
        << "Bona fide accepted: " << a.accepted << " " << bona_fide.size() << "\n"
        << "Simulated accepted: " << b.accepted << " " << simulated.size() << "\n";
}
