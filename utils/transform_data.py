
import pandas as pd
import json
import random
import numpy as np
from datetime import datetime, timedelta

# Paths
INPUT_CSV = "/Users/ishaanupponi/.cache/kagglehub/datasets/mlg-ulb/creditcardfraud/versions/3/creditcard.csv"
OUTPUT_CUSTOMERS = "/Users/ishaanupponi/Documents/My projects/pre-delinquency-engine/data/customers_real.json"
OUTPUT_TXNS = "/Users/ishaanupponi/Documents/My projects/pre-delinquency-engine/data/transactions_real.json"

print(f"Reading {INPUT_CSV}...")
df = pd.read_csv(INPUT_CSV)

# 1. Sample the data (Take a mix of Fraud and Legit to ensure we have interesting cases)
fraud_df = df[df['Class'] == 1]
legit_df = df[df['Class'] == 0].sample(n=5000, random_state=42)
sampled_df = pd.concat([fraud_df, legit_df]).sample(frac=1, random_state=42).reset_index(drop=True)

print(f"Sampled {len(sampled_df)} transactions (Fraud: {len(fraud_df)})")

# 2. Generate Synthetic Customer Profiles
NUM_CUSTOMERS = 100
customers = []
customer_ids = [f"CUST-2024-{random.randint(10000, 99999)}" for _ in range(NUM_CUSTOMERS)]

# Assign transactions to customers
sampled_df['CustomerId'] = np.random.choice(customer_ids, size=len(sampled_df))

# 3. Enrich Transactions with Semantic Meaning
# The dataset has 'Time', 'Amount', 'Class', 'V1'...'V28'
# We will map 'Amount' to real values, and use 'V' columns to determine 'Category' and 'Merchant'

MERCHANTS = {
    'GROCERY': ['Whole Foods', 'Trader Joe\'s', 'Walmart', 'Kroger'],
    'DINING': ['Uber Eats', 'Starbucks', 'Chipotle', 'Local Bistro'],
    'UTILITIES': ['Electric Co', 'Water Dept', 'Comcast', 'Verizon'],
    'ENTERTAINMENT': ['Netflix', 'Spotify', 'Cinema City', 'Steam Games'],
    'TRAVEL': ['Uber', 'Delta Air', 'Airbnb', 'Shell Station'],
    'LUXURY': ['Gucci', 'Apple Store', 'Nordstrom', 'Rolex'],
    'HEALTH': ['CVS Pharmacy', 'City Hospital', 'GNC', 'Planet Fitness']
}

def map_category(row):
    # Use V1-V3 components to deterministically pick a category
    # This preserves the "pattern" of the data (similar mathematical vectors will get similar categories)
    val = (row['V1'] + row['V2'] + row['V3'])
    
    if row['Class'] == 1: return 'GAMBLING' if val > 0 else 'UNKNOWN_TRANSFER' # Fraud patterns
    
    if row['Amount'] < 20: return 'DINING'
    if row['Amount'] > 500: return 'LUXURY'
    
    if val > 3: return 'TRAVEL'
    if val > 1: return 'ENTERTAINMENT'
    if val > -1: return 'GROCERY'
    if val > -3: return 'HEALTH'
    return 'UTILITIES'

def get_merchant(category):
    if category in MERCHANTS:
        return random.choice(MERCHANTS[category])
    return "Unknown Merchant"

enriched_transactions = []

for _, row in sampled_df.iterrows():
    category = map_category(row)
    
    # Convert 'Time' (seconds from start) to a real date in 2024
    # Dataset spans 2 days. We will stretch it to 30 days to look like a month history
    seconds = row['Time']
    base_date = datetime(2026, 1, 15)
    txn_date = base_date + timedelta(seconds=seconds * 15) # Stretch time factor
    
    enriched_transactions.append({
        "id": f"TXN-{random.randint(100000, 999999)}",
        "customerId": row['CustomerId'],
        "date": txn_date.strftime("%Y-%m-%d"),
        "amount": round(row['Amount'], 2),
        "merchant": get_merchant(category),
        "category": category,
        "isFraud": bool(row['Class'] == 1),
        "vector": [row['V1'], row['V2'], row['V3']] # Keep some vectors for visualization
    })

# 4. Aggregate Customer Metadata
cust_data = []

risk_buckets = ['LOW', 'MEDIUM', 'HIGH']

for cid in customer_ids:
    txns = [t for t in enriched_transactions if t['customerId'] == cid]
    total_spend = sum(t['amount'] for t in txns)
    has_fraud = any(t['isFraud'] for t in txns)
    
    # Calculate synthetic risk score based on the REAL data distribution
    # If they have fraud transactions -> High Risk
    # If they have high variability -> Medium Risk
    
    risk_score = random.randint(10, 40) # Base low risk
    if has_fraud: 
        risk_score = random.randint(85, 99)
    elif total_spend > 5000:
        risk_score += 20
        
    risk_level = 'LOW'
    if risk_score > 80: risk_level = 'HIGH'
    elif risk_score > 50: risk_level = 'MEDIUM'
    
    cust_data.append({
        "id": cid,
        "name": f"Customer {cid[-4:]}", # Placeholder name
        "riskScore": risk_score,
        "riskLevel": risk_level,
        "totalSpend": round(total_spend, 2),
        "transactionCount": len(txns),
        "salaryDay": random.randint(1, 28),
        "estimatedIncome": round(random.uniform(3000, 9000), -2),
        "lastActive": max([t['date'] for t in txns]) if txns else "2026-01-01"
    })

# Save to files
with open(OUTPUT_CUSTOMERS, 'w') as f:
    json.dump(cust_data, f, indent=2)
    
with open(OUTPUT_TXNS, 'w') as f:
    json.dump(enriched_transactions, f, indent=2)

print("Data transformation complete.")
