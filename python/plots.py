from flask import Flask, render_template
import sys, os
import pandas as pd
import json
import ssl
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import numpy as np

ssl._create_default_https_context = ssl._create_unverified_context
data_files = os.path.join(os.path.dirname(__file__), "../data/")


def bar_chart():
    # print("path in plotly",data_files)
    df = pd.read_csv(data_files + "grouped.csv")
    # print(pd.read_json(data_files + "states-symbols.json", orient="index"))
    states = pd.read_json(data_files + "states-symbols.json", orient="index")[0]
    rows = df.shape[0]
    # print(df.head(1), df.columns)
    statewise_map = {}
    for i in range(rows):
        state_sym = df['State'][i]
        count = int(df['count'][i])
        state = states[state_sym]
        if state in statewise_map:
            statewise_map[state] += count
        else:
            statewise_map[state] = count
    statewise_map = sorted(statewise_map.items(), key=lambda item: item[1], reverse=True)


    state_map = {}
    for i in range(len(statewise_map)):
        state_map[statewise_map[i][0]] = statewise_map[i][1]
    print(state_map)
    return json.dumps(state_map)


def county_bar_chart(state_sym):
    df = pd.read_csv(data_files + "grouped.csv")
    print("bool", df['State'] == state_sym)
    df = df[df['State'] == state_sym]
    df = df.reset_index(drop=True)
    print("df", df)
    rows = df.shape[0]
    print("rows", rows)
    countywise_map = {}
    for i in range(rows):
        county = df['County'][i]
        count = int(df['count'][i])
        if county in countywise_map:
            countywise_map[county] += count
        else:
            countywise_map[county] = count
    countywise_map = sorted(countywise_map.items(), key=lambda item: item[1], reverse=True)[:50]

    county_map = {}
    for i in range(len(countywise_map)):
        county_map[countywise_map[i][0]] = countywise_map[i][1]

    return json.dumps(county_map)


def pcp_plot():
    file = pd.read_csv(data_files + "pcp.csv")
    # print(filter_unique_cols(file))
    # file['label'] = labelled_data[:, -1:]
    file = file.fillna(0)
    filter_bool(file)
    # print(file.columns.tolist(), len(file))
    f = open('states-symbols.json', )
    data = json.load(f)
    f.close()
    for index, row in file.iterrows():
        file.State[index] = data[row['State']]
    file = file[
        ['Precipitation(in)', 'Wind_Speed(mph)', 'Visibility(mi)', 'Temperature(F)', 'Humidity(%)', 'Pressure(in)',
         'Wind_Chill(F)', 'Severity', 'State']]
    return json.dumps(list(file.T.to_dict().values()))


def k_means(data):
    pdData = pd.read_json(data)
    dnum = pdData.to_numpy()
    # print(dnum)
    scalar = StandardScaler()
    dnum = scalar.fit_transform(dnum)
    kmeans = KMeans(n_clusters=4, random_state=0).fit(dnum)
    # print(kmeans.inertia_)
    pdData['label'] = kmeans.labels_
    X = []
    Y = []
    for i in range(10):
        x = i + 3
        X.append(x)
        kmeans = KMeans(n_clusters=x, random_state=0).fit(dnum)
        Y.append(kmeans.inertia_)
    # print(X, Y)
    # plt.plot(np.array(X), np.array(Y))
    # plt.show()

    return pdData.values


def filter_cat_columns(file):
    threshold = 10
    col_names = file.columns
    rows, cols = file.shape
    for i in range(cols):
        dtype = file[col_names[i]].dtype
        ukeys = file[col_names[i]].unique().shape[0]
        # print(col_names[i],file[col_names[i]].dtype,file[col_names[i]].unique().shape[0])
        if not ((dtype == 'float64' or dtype == 'int64') and (ukeys >= threshold)):
            file.drop(columns=col_names[i], inplace=True)
        elif (dtype == 'bool'):
            file.drop(columns=col_names[i], inplace=True)
    return file


def filter_unique_cols(df):
    threshold = 12
    col_names = df.columns
    rows, cols = df.shape
    for i in range(cols):
        dtype = df[col_names[i]].dtype
        ukeys = df[col_names[i]].unique().shape[0]
        # print(col_names[i],file[col_names[i]].dtype,file[col_names[i]].unique().shape[0])
        if ukeys > threshold and dtype == "object" and col_names[i] != 'State':
            df.drop(columns=col_names[i], inplace=True)


def filter_bool(file):
    col_names = file.columns
    rows, cols = file.shape
    for i in range(cols):
        dtype = file[col_names[i]].dtype
        if (dtype == 'bool'):
            file.drop(columns=col_names[i], inplace=True)
