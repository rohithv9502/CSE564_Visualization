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
    # data_files = os.path.join(os.path.dirname(__file__), "../data/")
    df = pd.read_csv(data_files + "data_10000.csv")
    states = pd.read_json(data_files + "states.json", orient="index")[0]
    rows = df.shape[0]
    # print(df.head(1), df.columns)
    statewise_map = {}
    for i in range(rows):
        state_sym = df['State'][i]
        state = states[state_sym]
        if state in statewise_map:
            statewise_map[state] += 1
        else:
            statewise_map[state] = 1
    print(statewise_map)
    return json.dumps(statewise_map)


def pcp_plot():
    df = pd.read_csv(data_files + "data_10000.csv")
    filter_cat_columns(df)
    df = df.fillna(0)
    labelled_data = k_means(df.to_json())
    file = pd.read_csv(data_files + "data_10000.csv")
    print(filter_unique_cols(file))
    file['label'] = labelled_data[:, -1:]
    file = file.fillna(0)
    filter_bool(file)
    print(file)
    return json.dumps(list(file.T.to_dict().values()))


def k_means(data):
    pdData = pd.read_json(data)
    dnum = pdData.to_numpy()
    # print(dnum)
    scalar = StandardScaler()
    dnum = scalar.fit_transform(dnum)
    kmeans = KMeans(n_clusters=4, random_state=0).fit(dnum)
    X = []
    Y = []
    for i in range(10):
        x = i + 3
        X.append(x)
        kmeans = KMeans(n_clusters=x, random_state=0).fit(dnum)
        Y.append(kmeans.inertia_)
    print(X,Y)
    #plt.plot(np.array(X), np.array(Y))
    #plt.show()

    pdData['label'] = kmeans.labels_

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
        if ukeys > threshold and dtype == "object":
            df.drop(columns=col_names[i], inplace=True)


def filter_bool(file):
    col_names = file.columns
    rows, cols = file.shape
    for i in range(cols):
        dtype = file[col_names[i]].dtype
        if (dtype == 'bool'):
            file.drop(columns=col_names[i], inplace=True)
