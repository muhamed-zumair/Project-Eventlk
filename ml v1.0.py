import streamlit as st
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder

# ==========================================
# 1. SETUP & DATA PREP (Cached)
# ==========================================
st.set_page_config(page_title="EventLK Planner", page_icon="📅", layout="wide")

@st.cache_resource
def load_and_prep_data():
    """Loads, cleans, and encodes the dataset in a single cached run."""
    # Load Data
    file_path = "event_dataset_v2_distinct.csv"
    try:
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        return None, None, None, None, None, None

    # Clean & Prep
    numeric_cols = ['headcount', 'budget']
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    df = df.dropna(subset=numeric_cols)
    df = df[df['headcount'] > 0]
    
    # Feature Engineering
    df['budget_per_head'] = df['budget'] / df['headcount']
    numeric_features = ['headcount', 'budget', 'budget_per_head']

    # Parse Budget Allocation
    def parse_alloc(s):
        d = {}
        if pd.isna(s): return d
        for item in s.split(','):
            if ':' in item:
                k, v = item.split(':')
                d['alloc_' + k.strip().lower()] = float(v)
        return d
    
    alloc_df = df['budgetallocation'].apply(parse_alloc).apply(pd.Series).fillna(0)
    
    # Encoders
    encode_cols = ['eventtype', 'eventcategory', 'venuecategory']
    encoder = OneHotEncoder(sparse_output=False, drop='first', handle_unknown='ignore')
    X_encoded = encoder.fit_transform(df[encode_cols])
    
    # Prepare matrices
    X = np.hstack([df[numeric_features].values, X_encoded])
    y_venue = df['venue'].astype(str)
    y_alloc = alloc_df
    
    return X, y_venue, y_alloc, encoder, alloc_df.columns, df

# Run the cached backend logic
X_matrix, y_v, y_a, encoder_obj, alloc_cols, raw_df = load_and_prep_data()

# ==========================================
# 2. SIDEBAR - USER INPUTS (New in Commit 10)
# ==========================================
with st.sidebar:
    st.write("🔧 Sidebar layout initialized. Inputs coming soon!")

# ==========================================
# 3. MAIN DASHBOARD
# ==========================================
st.title("🎉 EventLK: AI Event Planner")
st.markdown("### Intelligent Venue & Budget Recommendation System")

if X_matrix is not None:
    st.success(f"✅ Data processing complete! Ready to train on {X_matrix.shape[0]} samples.")
else:
    st.error("❌ Data file not found. Please ensure 'event_dataset_v2_distinct.csv' is in the folder.")