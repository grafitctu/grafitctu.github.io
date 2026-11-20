# NI-ROZ / ANI-ROZ — Python

Česky: rozbalte celý ZIP a příkazy spouštějte z této složky.
English: extract the entire ZIP and run commands from this folder.

python -m pip install -r requirements.txt
python lab.py attention
python lab.py basis

Modes: linear, relu, affine, softmax, basis, gradient, network, attention.
The optional CSV filename is the second command-line argument.

Mini ZIPs run their named example. The shared project defaults to attention.
All programs print numerical results as JSON in the terminal.
Všechny programy vypíší číselné výsledky jako JSON do terminálu.

Only training rows fit the scaler, bend locations and coefficients.
Scaling uses population standard deviation, as in the browser.
The basis fit minimizes sum squared errors + ridge times the squared non-intercept coefficients.
Text weights are authored teaching values, not pretrained GPT-2 weights.

Data and licence: DATA-SOURCE.md.
Slides: https://grafitctu.github.io/vyuka/roz/line-to-llm/
