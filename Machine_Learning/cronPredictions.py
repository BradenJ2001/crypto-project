import sys
import os
import pandas as pd
import xgboost as xgb
import numpy as np
from cryptocmd import CmcScraper
from dotenv import load_dotenv
import sqlite3
from datetime import date

def cronJob():
    load_dotenv()
    DB = os.getenv('DB')
    databasePath = os.path.join(os.getcwd(), "crypto-project/Database", DB)
    
    #print(databasePath)
    connection = sqlite3.connect(databasePath)
    cursor = connection.cursor()
    
    coins = ["btc", "eth", "doge"]
    predictions = []
    highestPrices = []
    # todayDate = date.today().strftime("%Y-%m-%d")

    for coin in coins:
        scraper = CmcScraper(coin)

        # get raw data as list of list
        headers, data = scraper.get_data()

        # Pandas dataFrame for the same data
        df = scraper.get_dataframe()

        fileName = coin + "Model.json"
        trainedModel = xgb.Booster()
        trainedModel.load_model("~/crypto-project/Machine_Learning/{}".format(fileName))

        predictTest = {"Open": df.loc[[0]]["Open"][0], "High": df.loc[[0]]["High"][0], "Low": df.loc[[0]]["Low"][0], 
                        "Close": df.loc[[0]]["Close"][0], "Volume": df.loc[[0]]["Volume"][0], "MarketCap": df.loc[[0]]["Market Cap"][0]}
        
        dfTest = pd.DataFrame(predictTest, index = [0])
        dtest = xgb.DMatrix(dfTest)
        prediction = trainedModel.predict(dtest)[0]
        
        prediction = np.float64(prediction)
        
        print("PREDICTION 1:", type(prediction))
        print("PREDICTION 2:", type(df.loc[0].High))
        # To be stores in DB
        predictions.append((coin, df.loc[0].Date.strftime("%Y-%m-%d"), prediction))
        highestPrices.append((coin, df.loc[0].Date.strftime("%Y-%m-%d"), df.loc[0].High))

    # cache predictions in database
    cursor.executemany("INSERT or IGNORE INTO Cache Values (?, ?, ?)", predictions)
    print(predictions)
    connection.commit()

    # Store the highest price of yesterday
    cursor.executemany("INSERT or IGNORE INTO Coin_Prices Values (?, ?, ?)", highestPrices)
    print(highestPrices)
    connection.commit()

    # close connection
    connection.close()

if __name__ == '__main__':
    cronJob()