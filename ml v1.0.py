import streamlit as st
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder

# ==========================================
# 1. SETUP & DATA LOADING (Cached)
# ==========================================
st.set_page_config(page_title="EventLK Planner", page_icon="📅", layout="wide")

@st.cache_resource
def run_data_pipeline():
    """Loads, cleans, engineers features, and encodes data in one cached pass."""

    # 1. Load Data
    file_path = "event_dataset_v2_distinct.csv"
    try:
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        # Update: Return 6 Nones to match the new return signature
        return None, None, None, None, None, None

    # 2. Clean & Prep
    numeric_cols = ['headcount', 'budget']
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    df = df.dropna(subset=numeric_cols)
    df = df[df['headcount'] > 0]

    # 3. Feature Engineering
    df['budget_per_head'] = df['budget'] / df['headcount']
    numeric_features = ['headcount', 'budget', 'budget_per_head']

    # 4. Parse Budget Allocation
    def parse_alloc(s):
        d = {}
        if pd.isna(s): return d
        for item in s.split(','):
            if ':' in item:
                k, v = item.split(':')
                d['alloc_' + k.strip().lower()] = float(v)
        return d

    alloc_df = df['budgetallocation'].apply(parse_alloc).apply(pd.Series).fillna(0)

    # 5. Encoders
    encode_cols = ['eventtype', 'eventcategory', 'venuecategory']
    encoder = OneHotEncoder(sparse_output=False, drop='first', handle_unknown='ignore')
    X_encoded = encoder.fit_transform(df[encode_cols])

    # 6. Prepare Final Matrices & Targets
    X_matrix = np.hstack([df[numeric_features].values, X_encoded])
    y_venue = df['venue'].astype(str)    # The classification target
    y_alloc = alloc_df                   # The regression targets

    # Output everything needed for the UI and ML models
    return X_matrix, y_venue, y_alloc, encoder, alloc_df.columns, df

# ==========================================
# 2. MAIN DASHBOARD UI
# ==========================================

st.title("🎉 EventLK: AI Event Planner")
st.markdown("### Intelligent Venue & Budget Recommendation System")

st.write("Initializing backend data pipeline...")

# Run the CACHED backend logic (Unpacking 6 variables)
X_matrix, y_venue, y_alloc, encoder_obj, alloc_cols, raw_df = run_data_pipeline()

# Show basic UI feedback based on data loading success
if X_matrix is not None:
    st.success(f"✅ Data processing complete! Model is ready to be trained on {X_matrix.shape[0]} samples.")
    st.info(f"Loaded {len(alloc_cols)} budget allocation categories.")
else:
    st.error("❌ Failed to load or process data. Please check the dataset file.")

