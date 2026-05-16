import pandas as pd
import os

data_dir = 'data'
files = [
    "Dillerlar.xlsx",
    "Mijozlar bilan qayta ishlassh bo`limi.xlsx",
    "UAT.xlsx",
    "operatorlar.xlsx"
]

for file in files:
    path = os.path.join(data_dir, file)
    if os.path.exists(path):
        df = pd.read_excel(path)
        print(f"--- {file} ---")
        # Check potential category columns
        potential = ['Примечание 1', 'Интересующий продукт.1', 'Тип клиента', 'Ответственный']
        for col in potential:
            if col in df.columns:
                print(f"Column: {col}")
                print(df[col].value_counts().head(10))
                print()
