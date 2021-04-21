from flask import Flask, render_template, jsonify
import pandas as pd
import numpy as np
import json
df = pd.read_csv('US_Accidents_1000.csv')
x = df.iloc[0:, :].values
accidents = df.to_dict(orient='records')
#print("Accidents",accidents)
f = open('states-symbols.json', )
data = json.load(f)
f.close()
states={}
for index, row in df.iterrows():
    print(data[row['State']])
    states.append(set(data[row['State']]))
print(states)

