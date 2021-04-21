from flask import Flask, render_template
import sys, os
from python.plots import bar_chart,pcp_plot

app = Flask(__name__)


@app.route('/', methods=["GET"])
def main_app():
    statewise_accidents=bar_chart()
    return render_template('index.html',statewise_accidents=statewise_accidents)


@app.route('/get-full-data',methods=['GET'])
def get_unfiltered_data():
    data=pcp_plot()
    #print(data)
    return data


if __name__ == "__main__":
    app.run(debug=True)
