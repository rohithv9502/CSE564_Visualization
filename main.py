import csv
from collections import defaultdict

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
    df = pd.read_csv('map_New.csv')
    accident_coordinates = df[['Start_Lat', 'Start_Lng', 'County','State_Name','count']]
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


@app.route('/getDataSun')
def getDataSun():
    df = pd.read_csv("Sunburst_data.csv")
    stateSymbol = request.args.get('stateSymbol', type=str)
    # sun data

    dfk = df.groupby(['Sunrise_Sunset', 'Severity'])['count'].sum().reset_index(name="accidents")
    dfk.to_csv("states_accidents.csv")
    if stateSymbol == 'All':
        # dictionary
        results = defaultdict(lambda: defaultdict(dict))
        with open('states_accidents.csv') as csv_file:
            for val in csv.DictReader(csv_file):
                results[val['Sunrise_Sunset']][val['Severity']] = (float(val['accidents']))

        output = {'name': 'TOTAL', 'children': []}

        for k1, v1 in results.items():
            children1 = []
            for k2, v2 in v1.items():
                children1.append({'name': k2, 'size': float(v2)})

            output['children'].append({
                'name': k1,
                'children': children1

            })

        sundata = json.dumps(output)
        print("output",output)
        return sundata
    else:
        dfy = dfbystatesun(stateSymbol)
        dfk1 = dfy.groupby(['Sunrise_Sunset', 'Severity'])['count'].sum().reset_index(name="accidents")
        dfk1.to_csv("state_accidents.csv")
        results1 = defaultdict(lambda: defaultdict(dict))

        # nested dictionary
        with open('state_accidents.csv') as csv_file:
            for val in csv.DictReader(csv_file):
                results1[val['Sunrise_Sunset']][val['Severity']] = (float(val['accidents']))

        # json object
        output1 = {'name': 'TOTAL', 'children': []}

        for k1, v1 in results1.items():
            children2 = []
            for k2, v2 in v1.items():
                children2.append({'name': k2, 'size': float(v2)})

            output1['children'].append({
                'name': k1,
                'children': children2

            })
        sundata1 = json.dumps(output1)
        return sundata1


def dfbystatesun(stateSymbol):
    print("stateSymbol",stateSymbol)
    df = pd.read_csv("Sunburst_data.csv")
    print("Sunburst data",df)
    dfc1= df[df['State'] ==stateSymbol]
    print("dfc1",dfc1)
    return dfc1

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
