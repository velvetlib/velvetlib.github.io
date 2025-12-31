from flask import Flask, render_template, jsonify
import pandas as pd
import random
import os

app = Flask(__name__, static_folder="static", template_folder="templates")

# CONFIG: list the 5 categories in the order you want them revealed.
# These must match CSV headers. The first one will be visible at game start.
CATEGORIES = ["japanese_name", "catch_rate", "height_m", "weight_kg", "type_1"]

# The column that contains the correct answer (what the player types to guess).
ANSWER_COLUMN = "name"

# Path to the CSV file (local to the server)
CSV_PATH = os.path.join(os.path.dirname(__file__), "pokedex.csv")

# Load CSV into memory once on startup. If you want dynamic reload, re-read on each request.
def load_data():
    df = pd.read_csv(CSV_PATH)
    # drop rows with missing answer or missing category fields
    needed = [ANSWER_COLUMN] + CATEGORIES
    df = df.dropna(subset=needed)
    # convert to dicts
    records = df[needed].to_dict(orient="records")
    return records

DATA = load_data()

@app.route("/")
def index():
    return render_template("index.html", categories=CATEGORIES, answer_col=ANSWER_COLUMN)

@app.route("/random")
def random_row():
    if not DATA:
        return jsonify({"error": "No data available"}), 500
    row = random.choice(DATA)
    # return the row as JSON
    return jsonify(row)

@app.route("/names")
def names():
    valid_names = [row[ANSWER_COLUMN] for row in DATA]
    return jsonify(valid_names)

if __name__ == "__main__":
    app.run(debug=True)
