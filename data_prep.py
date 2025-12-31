import pandas as pd

df = pd.read_csv('pokedex.csv')

result = df.dtypes

df ['japanese_name'] = df['japanese_name'].apply(lambda s: str(s).split('(')[0])

df.to_csv('pokedex.csv')