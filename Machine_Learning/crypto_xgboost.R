library(tidyverse)
library(lubridate)
library(xgboost)
library(mlr)
library(janitor)
library(fastDummies)
library(ggplot2)
library(ggpubr)
library(Rcpp)
library(caret)

## what are the most important features for predicting crypto prices?
## try xgboost model 
df <- read.csv("C:\\Users\\Fadya\\Downloads\\bitcoin_Pandas.csv", header = T)
df$Date <- as_date(df$Date, format = "%Y-%m-%d")

view(df)

df.wide <- df

### Split into training/testing
sample_size = floor(0.8*nrow(df.wide)) # Random 80% data for training
set.seed(100)
picked <- sample(seq_len(nrow(df.wide)),size = sample_size)

df.train <- df.wide[picked, ]
df.test <- df.wide[-picked, ] # The rest of the data for testing, 20%

df.train.x <- df.train %>% select(-c(1:5), -c(12:12)) %>% scale() %>%  as.matrix()
df.train.y <- df.train %>% select(Price_After_1_Day) %>% as.matrix()

df.test.x <- df.test %>% select(-c(1:5), -c(12:12)) %>% scale() %>% as.matrix()
df.test.x <- df.test.x[ , colSums(is.na(df.test.x)) == 0]
df.test.y <- df.test %>% select(Price_After_1_Day) %>% as.matrix()

dtrain <- xgb.DMatrix(data = df.train.x, label = df.train.y)
dtest <- xgb.DMatrix(data = df.test.x, label = df.test.y)

# default parameters
params <- list(booster = "gbtree", objective = "reg:squarederror", eta=0.3, gamma=0, max_depth=6, min_child_weight=1, subsample=1, colsample_bytree=1)

# calculate best nround
xgbcv <- xgb.cv( params = params, data = dtrain, nrounds = 100, nfold = 5, showsd = T, stratified = T, print_every_n = 10, early_stop_round = 20, maximize = F)
xgbcv ##best test_rmse at iteration = 60

# first default model
xgb1 <- xgb.train (params = params, data = dtrain, nrounds = 40, watchlist = list(val=dtest,train=dtrain), print_every_n = 10, early_stop_round = 10, maximize = F , eval_metric = "rmse")
xgbpred <- predict (xgb1,dtest)
sqrt(mean((df.test.y - xgbpred)^2))
rmseBefore <- sqrt(mean((df.test.y - xgbpred)^2))

# feature importances
mat <- xgb.importance (model = xgb1)
xgb.plot.importance (importance_matrix = mat[1:20])

graphs[[1]] <- mat[1:20] %>% ggplot(aes(x = reorder(Feature, Gain), y = Gain)) +
  geom_bar(stat="identity") + 
  theme(axis.text.x = element_text(angle = 90, hjust = 1)) +
  labs(title = sprintf("%s Before Hypertuning", format(as.Date(unique(df$day)), "%m/%d/%Y")), x = "Features", y = "Information Gain") +
  coord_flip()

###### can we improve it?
#convert characters to factors (mlr does not accept)
df.train.2 <- df.train %>% select(-c(1:5)) %>% as.data.frame() %>% mutate_at(-1, ~(scale(.) %>%  as.vector))
df.train.2 <- df.train.2[ , colSums(is.na(df.train.2)) == 0]

df.test.2 <- df.test %>% select(-c(1:5)) %>% as.data.frame() %>% mutate_at(-1, ~(scale(.) %>%  as.vector))
df.test.2  <- df.test.2 [ , colSums(is.na(df.test.2 )) == 0]

colnames(df.train.2) <- janitor::make_clean_names(colnames(df.train.2)) %>% as.factor()
colnames(df.test.2) <- janitor::make_clean_names(colnames(df.test.2)) %>% as.factor()

#create tasks
traintask <- makeRegrTask(data = df.train.2,target = "price_after_1_day")
testtask <- makeRegrTask (data = df.test.2,target = "price_after_1_day")

#create learner
lrn <- makeLearner("regr.xgboost",predict.type = "response")
lrn$par.vals <- list( objective="reg:squarederror", eval_metric="error", nrounds=100L, eta=0.1)

#set parameter space
params <- makeParamSet(makeDiscreteParam("booster",values = c("gbtree")), makeIntegerParam("max_depth",lower = 3L,upper = 10L), makeNumericParam("min_child_weight",lower = 1L,upper = 10L), makeNumericParam("subsample",lower = 0.5,upper = 1), makeNumericParam("colsample_bytree",lower = 0.5,upper = 1))

#set resampling strategy
rdesc <- makeResampleDesc("CV",iters=5L)

#search strategy 
ctrl <- makeTuneControlRandom(maxit = 10L)

#parameter tuning
mytune <- tuneParams(learner = lrn, task = traintask, resampling = rdesc, measures = rmse, par.set = params, control = ctrl, show.info = T)
#Result: booster=gbtree; max_depth=4; min_child_weight=4.94; subsample=0.697; colsample_bytree=0.901 : rmse.test.rmse=0.3324771

#set hyperparameters, 
params <- list(booster = "gbtree", objective = "reg:squarederror", eta=0.1, gamma=0, max_depth=6, min_child_weight=1.04, subsample=0.763, colsample_bytree=0.898)

#train model
# calculate best nround
xgbcv <- xgb.cv( params = params, data = dtrain, nrounds = 300, nfold = 5, showsd = T, stratified = T, print_every_n = 10, early_stop_round = 20, maximize = F)
xgbcv ##best test_rmse at iteration = 99
print(xgbcv, n=300)

# first default model
xgb2 <- xgb.train (params = params, data = dtrain, nrounds = 65, watchlist = list(val=dtest,train=dtrain), print_every_n = 10, early_stop_round = 10, maximize = F , eval_metric = "rmse")
xgbpred <- predict (xgb2,dtest)
sqrt(mean((df.test.y - xgbpred)^2))
rmseAfter <- sqrt(mean((df.test.y - xgbpred)^2))

# u <- union(xgbpred, df.test.y)
# t <- table(factor(xgbpred, u), factor(df.test.y, u))
# confusionMatrix(t)

# Important Features
mat <- xgb.importance (model = xgb2)
xgb.plot.importance (importance_matrix = mat[1:20])

graphs[[2]] <- mat[1:20] %>% ggplot(aes(x = reorder(Feature, Gain), y = Gain)) +
  geom_bar(stat="identity") + 
  theme(axis.text.x = element_text(angle = 90, hjust = 1)) +
  labs(title = sprintf("%s After Hypertuning", format(as.Date(unique(df.long$day)), "%m/%d/%Y")), x = "Features", y = "Information Gain") +
  coord_flip()

# png(file.path(graphs_path, paste0(format(as.Date(unique(df.long$day)), "%m-%d-%Y"), ".png")), width=1164, height=791, res = 100, type = "cairo-png")
# print(ggarrange(graphs[[1]], graphs[[2]]))
# dev.off()
