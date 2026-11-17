# Auto MPG data

R. Quinlan (1993). Auto MPG [Dataset]. UCI Machine Learning Repository.
https://doi.org/10.24432/C5859H
Licence: Creative Commons Attribution 4.0 International.
https://creativecommons.org/licenses/by/4.0/

Source archive: https://archive.ics.uci.edu/static/public/9/auto+mpg.zip
SHA-256: 5fc1507522b73b8050d3aa45df51eefe1b666ae5f428a5f1347b6483339f1003

Selection: retain the 392 rows with known horsepower. Select 50 with Python random.Random(17).sample. The first 30 sampled rows form training, the next 10 validation, and the last 10 testing. The CSV freezes those assignments and preserves the original 1-based row IDs.

Columns: row_id,horsepower,mpg,split,car_name. Higher mpg means more miles travelled per gallon. Only horsepower enters the regression models.

The selection and split are authored for this class. They do not reproduce the source video's unknown selection of 50 cars.
