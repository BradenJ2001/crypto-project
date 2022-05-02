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
coins = ["bitcoin", "dogecoin", "ethereum", "BTC", "ETH", "DOGE", "#bitcoin", "#dogecoin", "#ethereum", "#BTC", "#ETH", "#DOGE"]

# Output Path
csv_path = os.path.join(os.getcwd(), "crypto-project/Twitter", "tweets.csv")

# Database Connection
print("PATH", os.getcwd())
databasePath = os.path.join(os.getcwd(), "crypto-project/Database", DB)
print(databasePath)   
sqliteConnection = sqlite3.connect(databasePath)

cursor = sqliteConnection.cursor()
print("Database created and Successfully Connected to SQLite")

sqlite_select_Query = "select sqlite_version();"
cursor.execute(sqlite_select_Query)
record = cursor.fetchall()

print("SQLite Database Version is: ", record)

# delete old tweets
cursor.execute("DELETE FROM TWEETS;")
record = cursor.fetchall()
sqliteConnection.commit()

c = twint.Config()

date_yesterday = date.isoformat(date.today() - timedelta(days = 2)) # tweets yesterday
date_today = date.isoformat(date.today())                           # tweets today

for user in twitter_users:
    for coin in coins:
        c.Username = user                                    # user
        c.Custom["tweet"] = ["id","username","date","tweet"] # Heading
        c.Search = coin                                      # coin
        c.Limit = 1
        c.Since = date_yesterday  # tweets today/yesterday
        c.Store_csv = True
        #c.Hide_output = True
        c.Pandas = True
        c.Output = csv_path

        twint.run.Search(c)

        # Create dataframe
        df = pd.read_csv(csv_path)

        # Remove diplicate tweets
        df.drop_duplicates(subset=['id'], inplace = True)
        df.to_csv(csv_path, index = False)

# Create dictionary for easy access and manipulation
tweets = df.to_dict("records") #main list of tweets
for i in range(len(tweets)):
    
    cursor.execute("""INSERT or IGNORE INTO tweets(id,username,date,tweet) 
                      VALUES (?,?,?,?)""", (tweets[i].get("id"),tweets[i].get("username"),tweets[i].get("date"),tweets[i].get("tweet")))
    record = cursor.fetchall()
    sqliteConnection.commit()
    #print(tweets[i])

# Clearing list of tweets
df.drop(df.index, inplace=True)
df.to_csv(csv_path, encoding='utf-8', index=False)

# Close database
cursor.close()
sqliteConnection.close()   

# loop
    # insert
    # update: look for outdated tweets
    #           delete outdated tweets
