import pandas as pd

# ==========================================
# 1. SETUP & DATA LOADING
# ==========================================

def load_data():
    """Loads the event dataset and prints the first few rows."""
    file_path = "event_dataset_v2_distinct.csv"
    
    try:
        print(f"Attempting to load data from '{file_path}'...")
        df = pd.read_csv(file_path)
        
        print("\nData loaded successfully! Here is a preview of the first 5 rows:")
        print("-" * 50)
        print(df.head())
        print("-" * 50)
        
        return df
        
    except FileNotFoundError:
        print(f"Error: Could not find the file '{file_path}'.")
        print("Please ensure the dataset is in the same directory as this script.")
        return None

if __name__ == "__main__":
    # Execute the data loading function
    raw_df = load_data()