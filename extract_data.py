import pandas as pd
import json
import os
import re

data_dir = 'data'
files = {
    "Dillerlar.xlsx": "Диллерлар",
    "Mijozlar bilan qayta ishlassh bo`limi.xlsx": "Мижозлар билан қайта ишлаш",
    "UAT.xlsx": "UAT Савдо",
    "operatorlar.xlsx": "Операторлар"
}

def map_product_type(row):
    # Try 'Интересующий продукт.1' first
    p1 = str(row.get('Интересующий продукт.1', '')).upper()
    note = str(row.get('Примечание 1', '')).upper()
    
    if 'ТЯГАЧ' in p1 or 'ТЯГАЧ' in note: return 'TYAGACH'
    if 'САМОСВАЛ' in p1 or 'САМОСВАЛ' in note: return 'SAMOSVAL'
    if 'БОРТОВОЙ' in p1 or 'БОРТОВОЙ' in note: return 'BORTOVOY'
    if 'ФУРГОН' in p1 or 'ФУРГОН' in note: return 'FURGON'
    if any(k in p1 or k in note for k in ['КРАН', 'СПЕЦ', 'ВОДОВОЗ', 'ЛОМОВОЗ', 'МАНИПУЛЯТОР']): return 'SPEC'
    
    # Defaults from 'Интересующий продукт.1' if simple
    if 'САМОСВАЛ' in p1: return 'SAMOSVAL'
    if 'ТЯГАЧ' in p1: return 'TYAGACH'
    
    return 'BOSHQA'

all_records = []

for file, dept in files.items():
    path = os.path.join(data_dir, file)
    if os.path.exists(path):
        try:
            df = pd.read_excel(path)
            mapped_df = pd.DataFrame()
            
            # Date
            date_col = 'Дата создания' if 'Дата создания' in df.columns else None
            if date_col:
                mapped_df['date'] = pd.to_datetime(df[date_col], format='%d.%m.%Y %H:%M:%S', errors='coerce')
            
            # Budget
            budget_col = 'Бюджет' if 'Бюджет' in df.columns else None
            if budget_col:
                mapped_df['budget'] = pd.to_numeric(df[budget_col], errors='coerce').fillna(0)
            else:
                mapped_df['budget'] = 0
            
            # Status
            status_col = 'Этап сделки' if 'Этап сделки' in df.columns else None
            if status_col:
                mapped_df['status'] = df[status_col].fillna('Yangi')
            
            # Responsible / Dealer
            resp_col = 'Ответственный' if 'Ответственный' in df.columns else None
            if resp_col:
                mapped_df['responsible'] = df[resp_col].fillna('Noma’lum')
            
            # Region
            reg_col = 'Регион / Город' if 'Регион / Город' in df.columns else None
            if reg_col:
                mapped_df['region'] = df[reg_col].fillna('Boshqa')
            else:
                mapped_df['region'] = 'Boshqa'
            
            # Product Type mapping
            mapped_df['product_type'] = df.apply(map_product_type, axis=1)
            
            mapped_df['department'] = dept
            
            mapped_df = mapped_df.dropna(subset=['date'])
            mapped_df['date'] = mapped_df['date'].dt.strftime('%Y-%m-%d')
            
            all_records.extend(mapped_df.to_dict(orient='records'))
            print(f"Processed {len(mapped_df)} records from {file}")
            
        except Exception as e:
            print(f"Error processing {file}: {e}")

os.makedirs('src/data', exist_ok=True)
with open('src/data/dashboard_data.json', 'w', encoding='utf-8') as f:
    json.dump(all_records, f, ensure_ascii=False, indent=2)

print(f"Total records saved: {len(all_records)}")
