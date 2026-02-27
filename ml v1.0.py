import pandas as pd
import numpy as np

# ==========================================
# 1. SETUP & DATA LOADING 
# ==========================================

def load_data():
    """Loads the event dataset and returns a DataFrame."""
    file_path = "event_dataset_v2_distinct.csv"
    try:
        df = pd.read_csv(file_path)
        print("✅ Step 1: Data loaded successfully.")
        return df
    except FileNotFoundError:
        print(f"❌ Error: Could not find '{file_path}'.")
        return None

# ==========================================
# 2. DATA CLEANING & PREP 
# ==========================================

def clean_data(df):
    """Handles numeric conversion and missing values."""
    if df is None: return None
    
    numeric_cols = ['headcount', 'budget']
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Drop missing values and invalid headcounts
    df = df.dropna(subset=numeric_cols)
    df = df[df['headcount'] > 0]
    
    print(f"✅ Step 2: Cleaning complete. {len(df)} rows remaining.")
    return df

# ==========================================
# 3. FEATURE ENGINEERING 
# ==========================================

def add_features(df):
    """Calculates specific metrics like cost per head."""
    if df is None: return None
    
    df['budget_per_head'] = df['budget'] / df['headcount']
    
    print("✅ Step 3: Features engineered (budget_per_head).")
    return df

# ==========================================
# 4. TARGET VARIABLE PARSING 
# ==========================================

def parse_budget_allocation(df):
    """Parses the 'budgetallocation' string into separate numeric targets."""
    if df is None: return None

    def parse_string(s):
        d = {}
        if pd.isna(s): return d
        # Logic: "Venue:40,Catering:30" -> {'alloc_venue': 40.0, 'alloc_catering': 30.0}
        for item in s.split(','):
            if ':' in item:
                k, v = item.split(':')
                d['alloc_' + k.strip().lower()] = float(v)
        return d
    
    # Expand the dictionary into new columns
    alloc_df = df['budgetallocation'].apply(parse_string).apply(pd.Series).fillna(0)
    
    print("✅ Step 4: Budget allocation targets parsed.")
    print(f"Categories found: {list(alloc_df.columns)}")
    
    return df, alloc_df

# ==========================================
# EXECUTION FLOW
# ==========================================

if __name__ == "__main__":
    # Progressive pipeline execution
    raw_data = load_data()
    cleaned_data = clean_data(raw_data)
    featured_data = add_features(cleaned_data)
    final_df, targets = parse_budget_allocation(featured_data)
    
    if final_df is not None:
        print("\n--- Final Data Preview ---")
        print(final_df[['headcount', 'budget', 'budget_per_head']].head())