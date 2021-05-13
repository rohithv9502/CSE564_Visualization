from flask import Flask, render_template, jsonify
import pandas as pd
import numpy as np
import json



def get_state_from_symbol(state):
    f = open('states-symbols.json', )
    data = json.load(f)
    f.close()
    return data[state]

df = pd.read_csv("map.csv")
state_names=[]
for ind in df.index:
    state_names.append(get_state_from_symbol(df['State'][ind]))


df["State_Name"] = state_names
df.to_csv("map_New.csv", index=False)


#get_state_from_symbol("AZ")