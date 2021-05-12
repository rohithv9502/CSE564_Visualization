from flask import Flask, render_template, jsonify
import sys, os

from flask import request
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

from python.plots import bar_chart, pcp_plot, county_bar_chart
import pandas as pd
import numpy as np
import json

app = Flask(__name__)

data_files = os.path.join(os.path.dirname(__file__), "/data/")


@app.route('/', methods=["GET"])
def main_app():
    statewise_accidents = bar_chart()
    # print("statewise_accidents",statewise_accidents)
    return render_template('index.html', statewise_accidents=statewise_accidents)


@app.route('/stateAccidentData', methods=["GET"])
def state_accidents_data():
    df = pd.read_csv('US_Accidents_New.csv')
    accident_coordinates = df[['Start_Lat', 'Start_Lng', 'City', 'Severity','State_Name']]
    return json.dumps(accident_coordinates.to_dict(orient='records'))


def get_state_from_symbol(state):
    f = open('states-symbols.json', )
    data = json.load(f)
    f.close()
    return data[state]


@app.route('/stateGeoStat', methods=['GET'])
def get_geo_data():
    f = open('us-states.json', )
    data = json.load(f)

    f.close()
    return jsonify(data)


@app.route('/states', methods=['GET'])
def get_states():
    df = pd.read_csv('US_Accidents.csv')
    x = df.iloc[0:, :].values
    accidents = df.to_dict(orient='records')
    # print("Accidents",accidents)
    f = open('states-symbols.json', )
    data = json.load(f)
    f.close()
    states_dict = {}
    for index, row in df.iterrows():
        state_sym = row['State']
        state = data[row['State']]
        if (state in states_dict):
            count = states_dict[state]
            states_dict[state] = count + 1
        else:
            states_dict[state] = 1
            states_dict[state+"_sym"] = state_sym
    return jsonify(states_dict)


@app.route('/get-full-data', methods=['GET'])
def get_unfiltered_data():
    data = pcp_plot()
    # print(data)
    return data


@app.route('/getbiplotforstate',methods=["GET"])
def getbiplotforstate():
    state_name=request.args.get('state')
    df = pd.read_csv('US_Accidents_New.csv')
    df = df[(df['State_Name'] == state_name)]
    return PCA_data(df)


@app.route("/biplotdata", methods=["GET"])
def biplotdata():
    df = pd.read_csv('US_Accidents.csv')
    return PCA_data(df)




def PCA_data(df):
    df = df[['Temperature(F)', 'Humidity(%)', 'Pressure(in)', 'Visibility(mi)', 'Wind_Speed(mph)',
             'Precipitation(in)']]
    x = df
    columns = df.columns.values[:]
    n = 4
    print("x", x)
    census_data = df.to_dict(orient='records')
    x = StandardScaler().fit_transform(x)
    census_data = json.dumps(census_data, indent=2)
    pca = PCA(n_components=n)
    principalComponents = pca.fit_transform(x)
    eigenVectors = pca.components_
    eigenValues = pca.explained_variance_
    principalDf = pd.DataFrame(data=principalComponents)

    eigenValueSum = np.sum(eigenValues)
    eigenValuesPerCent = np.zeros(n)
    cummulativeSum = np.zeros(n)
    cumSum = 0
    for i in range(n):
        eigenValuesPerCent[i] = eigenValues[i] / eigenValueSum * 100
        cumSum = cumSum + eigenValuesPerCent[i]
        cummulativeSum[i] = cumSum
    PCA1 = eigenVectors[0]
    PCA2 = eigenVectors[1]

    n = PCA1.size

    rows, cols = x.shape

    data_points = np.zeros((rows, 2))

    x = StandardScaler().fit_transform(x)

    for i in range(rows):
        xsum = 0
        ysum = 0
        for j in range(cols):
            xsum = xsum + x[i][j] * PCA1[j]
            ysum = ysum + x[i][j] * PCA2[j]
        data_points[i][0] = xsum
        data_points[i][1] = ysum

    eigen = {'PCA1': eigenVectors[0].tolist(), 'PCA2': eigenVectors[1].tolist(), 'columns': columns.tolist()}
    print(eigen)
    return jsonify(eigen)


@app.route("/countybar",methods=["GET"])
def county_map():
    state_sym=request.args.get('state_sym')
    print("State_Symbol",state_sym)
    counties_accidents = county_bar_chart(state_sym)
    return counties_accidents

if __name__ == "__main__":
    app.run(debug=True)
