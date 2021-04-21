from flask import Flask, render_template, jsonify
import pandas as pd
import numpy as np

app = Flask(__name__)

import json


@app.route('/', methods=["GET"])
def main_app():
    return render_template('index.html')




@app.route('/stateAccidentData',methods=["GET"])
def state_accidents_data():
    df = pd.read_csv('US_Accidents_10000.csv')
    x = df.iloc[0:, :].values
    columns = df.columns.values[:]
    accidents = df.to_dict(orient='records')
    return jsonify(json.dumps(accidents))


@app.route('/stateGeoStat',methods=['GET'])
def get_geo_data():
    f = open('us-states.json', )
    data = json.load(f)

    f.close()
    return jsonify(data)


@app.route('/stateSymbols',methods=['GET'])
def get_state_symbols():
    f = open('states-symbols.json', )
    data = json.load(f)

    f.close()
    #print(data)
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
