def predict():
    import sys
    import os
    import pandas as pd
    import xgboost as xgb
    import numpy as np
    from cryptocmd import CmcScraper
    # sys.exit()

    # initialise scraper without time interval
    scraper = CmcScraper(sys.argv[2])

    # get raw data as list of list
    headers, data = scraper.get_data()

    # get data in a json format
    xrp_json_data = scraper.get_data("json")

    # Pandas dataFrame for the same data
    df = scraper.get_dataframe()

    fileName = sys.argv[2] + "Model.json"
    trainedModel = xgb.Booster()
    trainedModel.load_model("./Machine_Learning/{}".format(fileName))
    
    predictTest = {"Open": df.loc[[0]]["Open"][0], "High": df.loc[[0]]["High"][0], "Low": df.loc[[0]]["Low"][0], 
                    "Close": df.loc[[0]]["Close"][0], "Volume": df.loc[[0]]["Volume"][0], "MarketCap": df.loc[[0]]["Market Cap"][0]}
    dfTest = pd.DataFrame(predictTest, index = [0])
    dtest = xgb.DMatrix(dfTest)
    print(trainedModel.predict(dtest)[0])
    # sys.stdout.write("{}".format(trainedModel.predict(dtest)[0]))
    sys.stdout.flush()

if __name__ == '__main__':
    predict()