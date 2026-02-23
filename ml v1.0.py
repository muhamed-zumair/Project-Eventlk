import pandas as pd

# ==========================================
# 1. SETUP & DATA PROCESSING
# ==========================================

def load_and_clean_data():
    """Loads, cleans, and engineers features for the event dataset."""
    file_path = "event_dataset_v2_distinct.csv"
    
    try:
        print(f"Attempting to load data from '{file_path}'...")
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        print(f"❌ Error: Could not find the file '{file_path}'.")
        return None

    print(f"Rows before cleaning: {len(df)}")

    # --- COMMIT 2: Data Cleaning ---
    # Ensure headcount and budget are numeric (coercing errors to NaN)
    numeric_cols = ['headcount', 'budget']
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Drop rows where headcount or budget are NaN
    df = df.dropna(subset=numeric_cols)
    
    # Keep only valid headcounts
    df = df[df['headcount'] > 0]
    
    print(f"Rows after cleaning: {len(df)}")

    # --- COMMIT 3: Feature Engineering ---
    # Calculate cost per head
    df['budget_per_head'] = df['budget'] / df['headcount']
    
    # Let's verify our new feature
    print("\n✅ Features engineered successfully! Here is a preview of the numeric columns:")
    print("-" * 50)
    print(df[['headcount', 'budget', 'budget_per_head']].head())
    print("-" * 50)
    
    return df

if __name__ == "__main__":
    processed_df = load_and_clean_data()