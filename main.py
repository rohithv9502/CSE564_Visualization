from flask import Flask, render_template, jsonify
import pandas as pd
import numpy as np
import json

app = Flask(__name__)




@app.route('/', methods=["GET"])
def main_app():
    return render_template('index.html')




@app.route('/stateAccidentData',methods=["GET"])
def state_accidents_data():
    df = pd.read_csv('US_Accidents_1000.csv')
    x = df.iloc[0:, :].values
    columns = df.columns.values[1:3]
    accidents = df.to_dict(orient='records')
    accident_coordinates=df[['Start_Lat','Start_Lng','City','Severity']]
    return json.dumps(accident_coordinates.to_dict(orient='records'))


@app.route('/stateGeoStat',methods=['GET'])
def get_geo_data():
    f = open('us-states.json', )
    data = json.load(f)

    f.close()
    return jsonify(data)


@app.route('/states',methods=['GET'])
def get_states():
    df = pd.read_csv('US_Accidents_1000.csv')
    x = df.iloc[0:, :].values
    accidents = df.to_dict(orient='records')
    # print("Accidents",accidents)
    f = open('states-symbols.json', )
    data = json.load(f)
    f.close()
    states_dict={}
    for index, row in df.iterrows():
        state=data[row['State']]
        if(state in states_dict):
            count=states_dict[state]
            states_dict[state]=count+1
        else:
            states_dict[state]=1
    return jsonify(states_dict)


if __name__ == "__main__":
    app.run(debug=True)
