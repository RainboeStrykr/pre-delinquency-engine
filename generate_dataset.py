
import pandas as pd
import numpy as np
import random
from faker import Faker
import datetime
import os

# -----------------------------------------------------------------------------
# CONFIGURATION
# -----------------------------------------------------------------------------
NUM_CUSTOMERS = 1000  # Generate 1,000 customers for the demo
DAYS_HISTORY = 180    # 6 months of history
START_DATE = datetime.date(2025, 9, 1)

# Archetype distribution
ARCHETYPES = {
    'STABLE_PRIME': 0.60,      # Low risk, good savings
    'LIQUIDITY_SHOCK': 0.10,   # Sudden salary delay/loss
    'OVERSPENDING': 0.10,      # Gradual increase in discretionary spend
    'SAVINGS_DEPLETION': 0.10, # Steady balance decline
    'INCOME_INSTABILITY': 0.10 # Volatile income
}

# Macroeconomic Shock (Day 120-150)
MACRO_SHOCK_START = 120
MACRO_SHOCK_END = 150
MACRO_PROB_INCREASE = 0.20

SEED = 42
fake = Faker()
Faker.seed(SEED)
np.random.seed(SEED)
random.seed(SEED)

# -----------------------------------------------------------------------------
# HELPER FUNCTIONS
# -----------------------------------------------------------------------------

def generate_customers(num):
    customers = []
    archetype_keys = list(ARCHETYPES.keys())
    archetype_probs = list(ARCHETYPES.values())
    
    for i in range(num):
        cust_id = 1000 + i
        archetype = np.random.choice(archetype_keys, p=archetype_probs)
        
        # Base Income
        if archetype == 'STABLE_PRIME':
            income = np.random.normal(85000, 15000)
            savings_ratio = np.random.uniform(0.2, 0.4)
        elif archetype == 'INCOME_INSTABILITY':
            income = np.random.normal(45000, 20000) # Lower, more volatile later
            savings_ratio = np.random.uniform(0.05, 0.15)
        else:
            income = np.random.normal(60000, 12000)
            savings_ratio = np.random.uniform(0.1, 0.2)
            
        income = max(30000, income)
        
        # EMI (Debt Burden)
        emi_ratio = np.random.uniform(0.2, 0.45) 
        if archetype == 'OVERSPENDING': 
             emi_ratio += 0.1 # Takes on more debt
             
        emi = income * emi_ratio
        
        # Baseline Spend (Non-EMI)
        disposable = income - emi
        baseline_spend = disposable * (1 - savings_ratio)
        
        customers.append({
            'customer_id': cust_id,
            'archetype': archetype,
            'monthly_salary': round(income, 2),
            'emi_amount': round(emi, 2),
            'emi_due_day': np.random.randint(1, 10), # Typically early month
            'credit_limit': round(income * np.random.choice([3, 5, 10]), -3),
            'baseline_spend': round(baseline_spend, 2),
            'baseline_savings_bal': round(income * np.random.uniform(1, 6), 2), # 1-6 months runway
            'salary_day': np.random.randint(28, 31) # End of month usually
        })
        
    return pd.DataFrame(customers)

def simulate_daily_activity(customers):
    daily_records = []
    transactions = []
    
    date_range = [START_DATE + datetime.timedelta(days=x) for x in range(DAYS_HISTORY)]
    
    print(f"Simulating {len(customers)} customers over {DAYS_HISTORY} days...")

    txn_id_counter = 1000000

    for idx, cust in customers.iterrows():
        # State variables
        balance = cust['baseline_savings_bal']
        current_daily_spend_mean = cust['baseline_spend'] / 30
        
        # Track triggers
        days_since_salary = 0
        shock_active = False
        defaulted = False
        
        for day_idx, date in enumerate(date_range):
            if defaulted: continue # Stop simulating after default
            
            # 1. Macro Shock check
            macro_factor = 1.0
            if MACRO_SHOCK_START <= day_idx <= MACRO_SHOCK_END:
                if np.random.random() < MACRO_PROB_INCREASE:
                    macro_factor = 1.2 # Increasing pressure
            
            # 2. Income (Salary)
            credit_today = 0
            salary_flag = 0
            
            # Determine if salary day (handling delays)
            is_salary_day = (date.day == cust['salary_day']) or (date.day == 28 and cust['salary_day'] > 28)
            
            actual_pay_day = is_salary_day
            
            # Archetype: Liquidity Shock (Salary Delay)
            if cust['archetype'] == 'LIQUIDITY_SHOCK' and day_idx > (DAYS_HISTORY - 60):
                # Start delaying salary in last 2 months
                if is_salary_day:
                    actual_pay_day = False # Delay it
                    # Credit it 7 days later
                    # Logic simplified: We handle credits on specific days
            
            # Simple Salary Logic with noise
            if is_salary_day:
                # Volatility
                salary_amt = cust['monthly_salary']
                if cust['archetype'] == 'INCOME_INSTABILITY':
                    salary_amt *= np.random.uniform(0.8, 1.2)
                    if np.random.random() < 0.2: # 20% chance of missed/late
                         salary_amt = 0 
                
                # Liquidity Shock - Delay logic (credit later) - for now just skip strict delay simulation for perf
                if cust['archetype'] == 'LIQUIDITY_SHOCK' and day_idx > (DAYS_HISTORY - 45):
                     if np.random.random() < 0.8: salary_amt = 0 # Missed/Delayed salary shock
                     
                if salary_amt > 0:
                    balance += salary_amt
                    credit_today += salary_amt
                    salary_flag = 1
                    transactions.append({
                        'transaction_id': txn_id_counter,
                        'customer_id': cust['customer_id'],
                        'date': date,
                        'category': 'Salary',
                        'amount': round(salary_amt, 2),
                        'balance_after': round(balance, 2),
                        'type': 'credit'
                    })
                    txn_id_counter += 1

            # 3. EMI Deduction
            emi_flag = 0
            if date.day == cust['emi_due_day']:
                deduct = True
                # Defaults
                if balance < cust['emi_amount']:
                    # Bounce
                    # If high risk archetype -> Default Event
                    if cust['archetype'] != 'STABLE_PRIME':
                        # Default condition
                        if np.random.random() < 0.7: # High chance to fail if no balance
                             defaulted = True
                             deduct = False
                             # Log bounce
                             transactions.append({
                                'transaction_id': txn_id_counter,
                                'customer_id': cust['customer_id'],
                                'date': date,
                                'category': 'EMI_Bounce',
                                'amount': 0,
                                'balance_after': round(balance, 2),
                                'type': 'fail'
                            })
                             txn_id_counter += 1
                
                if deduct:
                    balance -= cust['emi_amount']
                    emi_flag = 1
                    transactions.append({
                        'transaction_id': txn_id_counter,
                        'customer_id': cust['customer_id'],
                        'date': date,
                        'category': 'EMI',
                        'amount': round(-cust['emi_amount'], 2),
                        'balance_after': round(balance, 2),
                        'type': 'debit'
                    })
                    txn_id_counter += 1

            # 4. Spending Behavior
            # Drift Logic: Overspending archetype increases spend
            if cust['archetype'] == 'OVERSPENDING' and day_idx > (DAYS_HISTORY - 90):
                 # Increase spend 1% every week (approx)
                 current_daily_spend_mean *= 1.002 # Daily compound
            
            # Savings Depletion Logic: Withdrawals
            atm_amt = 0
            if cust['archetype'] == 'SAVINGS_DEPLETION' and day_idx > (DAYS_HISTORY - 60):
                 if np.random.random() < 0.2: # Frequent ATM
                      atm_amt = np.random.choice([1000, 2000, 5000, 10000])
                      balance -= atm_amt
                      transactions.append({
                        'transaction_id': txn_id_counter,
                        'customer_id': cust['customer_id'],
                        'date': date,
                        'category': 'ATM',
                        'amount': round(-atm_amt, 2),
                        'balance_after': round(balance, 2),
                        'type': 'debit'
                    })
                      txn_id_counter += 1

            # Normal Spend (Groceries, etc)
            # Poisson or Normal distribution for number of txns
            num_txns = np.random.poisson(1.5) # Avg 1.5 txns per day
            daily_spend = 0
            
            for _ in range(num_txns):
                amt = abs(np.random.normal(current_daily_spend_mean/1.5, current_daily_spend_mean/3))
                amt = max(10, amt) 
                
                cat = np.random.choice(['Groceries', 'Dining', 'Shopping', 'Utilities', 'Digital Services'])
                if cust['archetype'] == 'OVERSPENDING': 
                     if np.random.random() < 0.3: cat = 'Sailing/Luxury' # Drift signal
                
                balance -= amt
                daily_spend += amt
                transactions.append({
                    'transaction_id': txn_id_counter,
                    'customer_id': cust['customer_id'],
                    'date': date,
                    'category': cat,
                    'amount': round(-amt, 2),
                    'balance_after': round(balance, 2),
                    'type': 'debit'
                })
                txn_id_counter += 1
            
            # Record Daily State
            daily_records.append({
                'customer_id': cust['customer_id'],
                'date': date,
                'closing_balance': round(balance, 2),
                'daily_spend': round(daily_spend + atm_amt, 2),
                'daily_income': round(credit_today, 2),
                'salary_flag': salary_flag,
                'emi_flag': emi_flag,
                'risk_state': 'HIGH' if defaulted or balance < 0 else ('MED' if balance < cust['emi_amount'] else 'LOW')
            })

    return pd.DataFrame(daily_records), pd.DataFrame(transactions)

# -----------------------------------------------------------------------------
# EXECUTION
# -----------------------------------------------------------------------------

print("Generating Customers...")
df_customers = generate_customers(NUM_CUSTOMERS)

print("Simulating Activity...")
df_daily, df_transactions = simulate_daily_activity(df_customers)

# Add Derived Metrics (Rolling)
print("Calculating Advanced Metrics...")
df_daily['rolling_30d_balance'] = df_daily.groupby('customer_id')['closing_balance'].transform(lambda x: x.rolling(30).mean())

# Export
print("Exporting CSVs...")
df_customers.to_csv('customers.csv', index=False)
df_daily.to_csv('daily_accounts.csv', index=False)
df_transactions.to_csv('transactions.csv', index=False)

print("Formatting for internal UI usage (JSON)...")
# Convert to the format our UI expects (customers_real.json / transactions_real.json)
# UI expects: id, name, ..., transactions array in transactions_real.json

ui_customers = df_customers.rename(columns={
    'customer_id': 'id',
    'monthly_salary': 'estimatedIncome',
    'baseline_spend': 'totalSpend' # Proxy
})

# Add risk scores based on archetype
risk_map = {
    'STABLE_PRIME': {'score': 30, 'level': 'LOW'},
    'LIQUIDITY_SHOCK': {'score': 85, 'level': 'HIGH'},
    'OVERSPENDING': {'score': 75, 'level': 'HIGH'},
    'SAVINGS_DEPLETION': {'score': 65, 'level': 'MEDIUM'},
    'INCOME_INSTABILITY': {'score': 55, 'level': 'MEDIUM'}
}

ui_customers['riskScore'] = ui_customers['archetype'].map(lambda x: risk_map[x]['score'])
ui_customers['riskLevel'] = ui_customers['archetype'].map(lambda x: risk_map[x]['level'])

ui_customers.to_json('data/customers_real.json', orient='records', indent=2)

# Transactions JSON
# UI Expects: customerId, date, amount, category, merchant(fake)
# My simulation outputs transaction_id, customer_id, date, category, amount
ui_transactions = df_transactions.rename(columns={'customer_id': 'customerId'})
ui_transactions['date'] = ui_transactions['date'].astype(str) # ISO string
ui_transactions['merchant'] = 'Simulated Merchant' # Placeholder, my enriched data script will fix this later if needed

ui_transactions.to_json('data/transactions_real.json', orient='records', indent=2)

print("DONE. Dataset generated.")
print(f"Customers: {len(df_customers)}")
print(f"Transactions: {len(df_transactions)}")
