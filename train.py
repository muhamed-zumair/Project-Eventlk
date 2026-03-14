import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder

print("🚀 Starting Model Training Process...")

# ==========================================
# 1. LOAD DATA
# ==========================================
print("Loading dataset...")
try:
    df = pd.read_csv("event_dataset_v2_distinct.csv")
except FileNotFoundError:
    print("❌ Error: 'event_dataset_v2_distinct.csv' not found. Please ensure it is in the same folder.")
    exit()

# ==========================================
# 2. CLEAN & PREPROCESS
# ==========================================
print("Cleaning data and engineering features...")
df['headcount'] = pd.to_numeric(df['headcount'], errors='coerce')
df['budget'] = pd.to_numeric(df['budget'], errors='coerce')
df = df.dropna(subset=['headcount', 'budget'])
df = df[df['headcount'] > 0]

df['budget_per_head'] = df['budget'] / df['headcount']
numeric_features = ['headcount', 'budget', 'budget_per_head']

# Parse Budget Allocation logic
def parse_alloc(s):
    d = {}
    if pd.isna(s):
        return d
    for item in s.split(','):
        if ':' in item:
            k, v = item.split(':')
            d['alloc_' + k.strip().lower()] = float(v)
    return d

alloc_df = df['budgetallocation'].apply(parse_alloc).apply(pd.Series).fillna(0)

# Encode Categorical Data
encode_cols = ['eventtype', 'eventcategory', 'venuecategory']
encoder = OneHotEncoder(sparse_output=False, drop='first', handle_unknown='ignore')
X_encoded = encoder.fit_transform(df[encode_cols])

# Prepare Features (X) and Targets (y)
X = np.hstack([df[numeric_features].values, X_encoded])
y_venue = df['venue'].astype(str)
y_alloc = alloc_df

# ==========================================
# 3. TRAIN MODELS
# ==========================================
print("Training Random Forest Classifier (Venue Prediction)...")
rf_v = RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42)
rf_v.fit(X, y_venue)

print("Training Random Forest Regressor (Budget Allocation)...")
rf_a = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42)
rf_a.fit(X, y_alloc)

# ==========================================
# 4. SAVE ARTIFACTS
# ==========================================
print("💾 Saving models to disk...")
joblib.dump(rf_v, 'rf_venue_model.pkl')
joblib.dump(rf_a, 'rf_alloc_model.pkl')
joblib.dump(encoder, 'category_encoder.pkl')
joblib.dump(alloc_df.columns, 'alloc_cols.pkl')

print("✅ Success! All 4 .pkl files have been generated.")
