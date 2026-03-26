import pandas as pd

# Load datasets
kb = pd.read_csv("data/knowledge_base.csv")
poll = pd.read_csv("data/pollutants.csv")
micro = pd.read_csv("data/microbes.csv")

# Print outputs
print("=== Knowledge Base ===")
print(kb.head())

print("\n=== Pollutants ===")
print(poll.head())

print("\n=== Microbes ===")
print(micro.head())
