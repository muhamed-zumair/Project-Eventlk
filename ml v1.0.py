import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder

# ==========================================
# 1. SETUP & DATA LOADING (Commit 1)
# ==========================================
def load_data():
    file_path = "event_dataset_v2_distinct.csv"
    try:
        df = pd.read_csv(file_path)
        print("✅ Step 1: Data loaded.")
        return df
    except FileNotFoundError:
        print(f"❌ Error: '{file_path}' not found.")
        return None

# ==========================================
# 2. DATA CLEANING & FEATURE ENG (Commits 2 & 3)
# ==========================================
def clean_and_feature_eng(df):
    if df is None: return None
    
    # Convert numeric columns
    numeric_cols = ['headcount', 'budget']
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Drop invalid data
    df = df.dropna(subset=numeric_cols)
    df = df[df['headcount'] > 0]
    
    # Create budget_per_head feature
    df['budget_per_head'] = df['budget'] / df['headcount']
    
    print(f"✅ Steps 2 & 3: Cleaning and Feature Engineering complete.")
    return df

# ==========================================
# 3. TARGET VARIABLE PARSING (Commit 4)
# ==========================================
def parse_targets(df):
    if df is None: return None, None

    def parse_string(s):
        d = {}
        if pd.isna(s): return d
        for item in s.split(','):
            if ':' in item:
                k, v = item.split(':')
                d['alloc_' + k.strip().lower()] = float(v)
        return d
    
    y_alloc = df['budgetallocation'].apply(parse_string).apply(pd.Series).fillna(0)
    print("✅ Step 4: Budget allocation targets parsed.")
    return df, y_alloc

# ==========================================
# 4. CATEGORICAL ENCODING (Commit 5)
# ==========================================
def prepare_final_features(df):
    """Encodes categorical data into a numeric feature matrix (X)."""
    if df is None: return None, None
    
    # Columns to transform from text to numbers
    encode_cols = ['eventtype', 'eventcategory', 'venuecategory']
    
    # Initialize OneHotEncoder
    # handle_unknown='ignore' allows the model to handle new categories in the future
    encoder = OneHotEncoder(sparse_output=False, drop='first', handle_unknown='ignore')
    
    # Perform the transformation
    X_encoded = encoder.fit_transform(df[encode_cols])
    
    # Combine original numeric features with the new encoded columns
    numeric_features = ['headcount', 'budget', 'budget_per_head']
    X_final = np.hstack([df[numeric_features].values, X_encoded])
    
    print(f"✅ Step 5: Encoding complete. Final Feature Matrix (X) shape: {X_final.shape}")
    return X_final, encoder

# ==========================================
# MAIN EXECUTION
# ==========================================
if __name__ == "__main__":
    df_raw = load_data()
    df_cleaned = clean_and_feature_eng(df_raw)
    df_with_targets, y_targets = parse_targets(df_cleaned)
    X_matrix, encoder_obj = prepare_final_features(df_with_targets)
    
    if X_matrix is not None:
        print("\n--- Model Preparation Summary ---")
        print(f"Total Samples: {X_matrix.shape[0]}")
        print(f"Total Features: {X_matrix.shape[1]}")
        print(f"Target Categories: {list(y_targets.columns)}")