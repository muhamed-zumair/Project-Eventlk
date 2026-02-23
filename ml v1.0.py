import pandas as pd

# ==========================================
# 1. SETUP & DATA PROCESSING
# ==========================================

def load_and_clean_data():
    """Loads the event dataset and prints the first few rows."""
    file_path = "event_dataset_v2_distinct.csv"
    
    try:
        print(f"Attempting to load data from '{file_path}'...")
        df = pd.read_csv(file_path)
        print(f" Data loaded successfully. Initial shape: {df.shape}")
        
        print("\nData loaded successfully! Here is a preview of the first 5 rows:")
        print("-" * 50)
        print(df.head())
        print("-" * 50)
        
        return df
        
    except FileNotFoundError:
        print(f"Error: Could not find the file '{file_path}'.")
        print("Please ensure the dataset is in the same directory as this script.")
        return None

        # --- Data Cleaning ---
        print("\nCleaning data...")

        # Define columns that must be numbers
        numeric_cols = ['headcount', 'budget']

        # Convert to numeric, forcing errors to NaN (Not a Number)
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Drop rows where budget or headcount became NaN
        df = df.dropna(subset=numeric_cols)

        # Filter out impossible events (must have at least 1 person)
        df = df[df['headcount'] > 0]

        print(f" Data cleaned. Final shape: {df.shape}")
        print("\nPreview of cleaned numeric columns:")
        print(df[['headcount', 'budget']].head())

        return df

if __name__ == "__main__":
    # Execute the data loading and cleaning function
    cleaned_df = load_and_clean_data()