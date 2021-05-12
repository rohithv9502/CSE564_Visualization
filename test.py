from flask import Flask, render_template, jsonify
import pandas as pd
import numpy as np
import json



def get_state_from_symbol(state):
    f = open('states-symbols.json', )
    data = json.load(f)
    f.close()
    return data[state]

def get_data_from_data_frame(state_Name):
    df = pd.read_csv('US_Accidents_New.csv')
    df=df[(df['State_Name']==state_Name)]
    print(df)
    df = df[['Temperature(F)', 'Wind_Chill(F)', 'Humidity(%)', 'Pressure(in)', 'Visibility(mi)', 'Wind_Speed(mph)',
             'Precipitation(in)']]


get_data_from_data_frame("California")

#get_state_from_symbol("AZ")