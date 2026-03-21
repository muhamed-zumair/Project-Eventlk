import streamlit as st
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor

# ==========================================
# 1. SETUP & MODEL TRAINING (Cached)
# ==========================================
st.set_page_config(page_title="EventLK Planner", page_icon="📅", layout="wide")

@st.cache_resource
def load_and_prep_data():
    """Loads, cleans, encodes, and trains models in a single cached run."""
    # Load Data
    file_path = "event_dataset_v2_distinct.csv"
    try:
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        return None, None, None, None, None

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
    
    # Initialize & Train Models
    rf_v = RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42)
    rf_v.fit(X, y_venue)
    
    rf_a = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42)
    rf_a.fit(X, y_alloc)
    
    return rf_v, rf_a, encoder, alloc_df.columns, df

# Run the cached backend logic and unpack models
rf_venue, rf_alloc, encoder, alloc_cols, raw_df = load_and_prep_data()

# ==========================================
# 2. SIDEBAR - USER INPUTS
# ==========================================
with st.sidebar:
    st.header("📝 Event Details")
    st.write("Tweaking these values changes the prediction instantly.")
    
    # Inputs
    headcount = st.slider("👥 Headcount", 10, 1000, 150, step=10)
    budget = st.number_input("💰 Total Budget (LKR)", min_value=10000, value=150000, step=5000)
    
    st.markdown("---")
    st.subheader("Preferences")
    
    event_type_display = st.selectbox("Event Type", 
                                      ["Workshop / Training", "Hackathon", "Meetup", "Conference", "Panel Discussion", "Networking"])
    
    venue_pref_display = st.selectbox("Venue Style", 
                                      ["Any", "Auditorium (University/Govt)", "Coworking Space (Startup)", "Exhibition Hall", "Studio", "Open Space"])

    # Map display names to model keys
    type_map = {
        "Workshop / Training": ("aiworkshop", "workshopstraining"),
        "Hackathon": ("codehack", "competitionshackathons"),
        "Meetup": ("devmeetup", "meetupscommunity"),
        "Conference": ("techconf", "conferencesexpos"),
        "Panel Discussion": ("aipanel", "talkspanels"),
        "Networking": ("networknight", "careernetworking")
    }
    
    venue_map = {
        "Any": "auditorium", # Default fallback
        "Auditorium (University/Govt)": "auditorium",
        "Coworking Space (Startup)": "coworkingspace",
        "Exhibition Hall": "exhibitionhall",
        "Studio": "studio",
        "Open Space": "openspace"
    }

    # Derived Calculations
    bph = budget / headcount
    st.metric(label="Calculated Cost Per Head", value=f"LKR {bph:,.2f}")
    
    predict_btn = st.button("🚀 Generate Plan", type="primary")

# ==========================================
# 3. MAIN DASHBOARD
# ==========================================
st.title("🎉 EventLK: AI Event Planner")
st.markdown("### Intelligent Venue & Budget Recommendation System")

if rf_venue is None:
    st.error("❌ Data file not found. Please ensure 'event_dataset_v2_distinct.csv' is in the folder.")
else:
    # Logic to map user selections to model categories
    e_type, e_cat = type_map[event_type_display]
    v_cat = venue_map[venue_pref_display]
    
    # 1. Prepare Input Vector
    input_nums = np.array([[headcount, budget, bph]])
    
    input_cats = pd.DataFrame([[e_type, e_cat, v_cat]], columns=['eventtype', 'eventcategory', 'venuecategory'])
    input_encoded = encoder.transform(input_cats)
    
    final_input = np.hstack([input_nums, input_encoded])
    
    # 2. Predict
    venue_pred = rf_venue.predict(final_input)[0]
    alloc_pred = rf_alloc.predict(final_input)[0]
    
    # --- Display Venue Result ---
    st.markdown("---")
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("📍 Recommended Venue")
        st.success(f"**{venue_pred}**")
        st.caption(f"Based on {headcount} people and LKR {bph:.0f}/head budget.")

    with col2:
        st.subheader("💵 Est. Total Cost")
        st.info(f"**LKR {budget:,.2f}**")

    # --- Display Budget Breakdown ---
    st.markdown("---")
    st.subheader("📊 Suggested Budget Allocation")