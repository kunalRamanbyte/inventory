import pandas as pd
import os

data = {
    'Name': ['Sony PS5', 'iPhone 15', 'Logitech Mouse', 'Gaming Chair'],
    'Description': ['Next-gen console', 'Latest smartphone', 'Wireless mouse', 'Ergonomic chair'],
    'Price': [499.99, 999.00, 49.50, 250.00],
    'Quantity': [10, 25, 100, 15]
}

df = pd.DataFrame(data)
output_path = r'c:\Users\Admin\Desktop\Create 1st project\sample_inventory.xlsx'
df.to_excel(output_path, index=False)
print(f"Sample file created at {output_path}")
