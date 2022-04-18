import twint
import pandas as pd
import sqlite3
import os
from dotenv import load_dotenv
from datetime import date
from datetime import timedelta

# Get database
load_dotenv()
DB = os.getenv('DB')

twitter_users = ["elonmusk", "cz_binance", "watcherguru", "bitcoinmagazine"]
coins = ["bitcoin", "dogecoin", "ethereum", "BTC", "ETH", "DOGE"]

# Database Connection
sqliteConnection = sqlite3.connect(f"../Database/{DB}")
cursor = sqliteConnection.cursor()
print("Database created and Successfully Connected to SQLite")

sqlite_select_Query = "select sqlite_version();"
cursor.execute(sqlite_select_Query)
record = cursor.fetchall()
print("SQLite Database Version is: ", record)

c = twint.Config()

for user in twitter_users:
    for coin in coins:
        c.Username = user                              #user
        c.Custom["tweet"] = ["id","username","date","tweet"] # user
        c.Search = coin                               # coin
        c.Limit = 1
        c.Since = date.isoformat(date.today() - timedelta(days = 1)) # tweets today
        c.Store_csv = True
        c.Hide_output = True
        c.Pandas = True
        c.Output = "tweets.csv"

        twint.run.Search(c)

        # Create dataframe
        df = pd.read_csv('tweets.csv')

        # Remove diplicate tweets
        df.drop_duplicates(subset=['id'], inplace = True)
        df.to_csv("tweets.csv", index = False)

        # Create dictionary for easy access and manipulation
        tweets = df.to_dict("records") #main list of tweets

        if (coin == "BTC"):
            coin = "bitcoin"
        elif (coin == "ETH"):
            coin = "ethereum"
        elif (coin == "DOGE"):
            coin = "dogecoin"

        for i in range(len(tweets)):
            cursor.execute("""INSERT OR IGNORE INTO tweets(id,username,date,tweet,coin) 
                        VALUES (?,?,?,?,?)""", (tweets[i].get("id"),tweets[i].get("username"),tweets[i].get("date"),tweets[i].get("tweet"),coin))
            record = cursor.fetchall()
            sqliteConnection.commit()
            print(tweets[i])
       
        #print(df)
        #print(tweet_list)

# Clearing list of tweets
df.drop(df.index, inplace=True)
df.to_csv("tweets.csv", encoding='utf-8', index=False)

# Close database
cursor.close()
sqliteConnection.close()   

# loop
    # insert
    # update: look for outdated tweets
    #           delete outdated tweets
