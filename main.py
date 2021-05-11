from flask import Flask, render_template, jsonify
import sys, os

from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

from python.plots import bar_chart, pcp_plot
import pandas as pd
import numpy as np
import json

app = Flask(__name__)

data_files = os.path.join(os.path.dirname(__file__), "/data/")

@app.route('/', methods=["GET"])
def main_app():
    statewise_accidents = bar_chart()
    return render_template('index.html', statewise_accidents=statewise_accidents)


@app.route('/stateAccidentData', methods=["GET"])
def state_accidents_data():
    df = pd.read_csv('US_Accidents_10000.csv')
    accident_coordinates = df[['Start_Lat', 'Start_Lng', 'City', 'Severity']]
    #print("Accidentd",accident_coordinates)
    #print(json.dumps(accident_coordinates.to_dict(orient='records')))
    return json.dumps(accident_coordinates.to_dict(orient='records'))


@app.route('/stateGeoStat', methods=['GET'])
def get_geo_data():
    f = open('us-states.json', )
    data = json.load(f)

    f.close()
    return jsonify(data)


@app.route('/states', methods=['GET'])
def get_states():
    df = pd.read_csv('US_Accidents_10000.csv')
    x = df.iloc[0:, :].values
    accidents = df.to_dict(orient='records')
    # print("Accidents",accidents)
    f = open('states-symbols.json', )
    data = json.load(f)
    f.close()
    states_dict = {}
    for index, row in df.iterrows():
        state = data[row['State']]
        if (state in states_dict):
            count = states_dict[state]
            states_dict[state] = count + 1
        else:
            states_dict[state] = 1
    return jsonify(states_dict)


@app.route('/get-full-data', methods=['GET'])
def get_unfiltered_data():
    data = pcp_plot()
    # print(data)
    return data

@app.route("/biplotdata",methods=["GET"])
def biplotdata():
    df = pd.read_csv('Processed_100000_1.csv')
    df =df[['Temperature(F)','Wind_Chill(F)','Humidity(%)','Pressure(in)','Visibility(mi)','Wind_Speed(mph)','Precipitation(in)']]
    x=df
    columns = df.columns.values[:]
    n = 4
    print("x",x)
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


    eigen = {'PCA1': eigenVectors[0].tolist(), 'PCA2': eigenVectors[1].tolist(),'datapoints':data_points.tolist(),'columns':columns.tolist()}
    return jsonify(eigen)


if __name__ == "__main__":
    app.run(debug=True)
