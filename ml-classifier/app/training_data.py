from typing import List, Tuple, Dict

def get_categories() -> List[str]:
    """Get list of available categories"""
    return [
        "Groceries",
        "Dining & Restaurants",
        "Transportation",
        "Shopping",
        "Entertainment",
        "Bills & Utilities",
        "Healthcare",
        "Travel",
        "Gas & Fuel",
        "Home & Garden",
        "Personal Care",
        "Education",
        "Insurance",
        "Income",
        "Transfer",
        "Other"
    ]

def get_training_data() -> Tuple[List[Dict], List[str]]:
    """
    Generate training data for the classifier
    
    Returns:
        transactions: List of transaction dictionaries
        categories: List of corresponding category labels
    """
    
    # Training data: (description, amount, merchant) -> category
    training_samples = [
        # Groceries
        ({"description": "WALMART GROCERY #1234", "amount": 87.42, "merchant": "Walmart"}, "Groceries"),
        ({"description": "WHOLE FOODS MARKET", "amount": 52.18, "merchant": "Whole Foods"}, "Groceries"),
        ({"description": "TRADER JOES #123", "amount": 45.67, "merchant": "Trader Joes"}, "Groceries"),
        ({"description": "SAFEWAY STORE 2345", "amount": 93.22, "merchant": "Safeway"}, "Groceries"),
        ({"description": "KROGER #0456", "amount": 68.90, "merchant": "Kroger"}, "Groceries"),
        ({"description": "TARGET GROCERY", "amount": 71.34, "merchant": "Target"}, "Groceries"),
        ({"description": "ALDI STORES", "amount": 42.15, "merchant": "Aldi"}, "Groceries"),
        ({"description": "COSTCO WHOLESALE", "amount": 156.78, "merchant": "Costco"}, "Groceries"),
        
        # Dining & Restaurants
        ({"description": "STARBUCKS COFFEE #1234", "amount": 5.75, "merchant": "Starbucks"}, "Dining & Restaurants"),
        ({"description": "CHIPOTLE MEXICAN GRILL", "amount": 12.45, "merchant": "Chipotle"}, "Dining & Restaurants"),
        ({"description": "MCDONALDS F12345", "amount": 8.32, "merchant": "McDonalds"}, "Dining & Restaurants"),
        ({"description": "OLIVE GARDEN #789", "amount": 45.60, "merchant": "Olive Garden"}, "Dining & Restaurants"),
        ({"description": "PANERA BREAD", "amount": 15.23, "merchant": "Panera"}, "Dining & Restaurants"),
        ({"description": "DOMINOS PIZZA", "amount": 22.50, "merchant": "Dominos"}, "Dining & Restaurants"),
        ({"description": "SUBWAY SANDWICH", "amount": 9.45, "merchant": "Subway"}, "Dining & Restaurants"),
        ({"description": "TACO BELL #456", "amount": 11.20, "merchant": "Taco Bell"}, "Dining & Restaurants"),
        ({"description": "DUNKIN DONUTS", "amount": 6.89, "merchant": "Dunkin"}, "Dining & Restaurants"),
        
        # Transportation
        ({"description": "UBER TRIP", "amount": 23.45, "merchant": "Uber"}, "Transportation"),
        ({"description": "LYFT RIDE", "amount": 18.90, "merchant": "Lyft"}, "Transportation"),
        ({"description": "METRO TRANSIT PASS", "amount": 90.00, "merchant": "Metro"}, "Transportation"),
        ({"description": "PARKING METER", "amount": 5.00, "merchant": ""}, "Transportation"),
        ({"description": "CAR WASH EXPRESS", "amount": 15.00, "merchant": "Car Wash"}, "Transportation"),
        ({"description": "PUBLIC TRANSIT", "amount": 2.75, "merchant": ""}, "Transportation"),
        
        # Gas & Fuel
        ({"description": "SHELL OIL STATION", "amount": 45.60, "merchant": "Shell"}, "Gas & Fuel"),
        ({"description": "CHEVRON #12345", "amount": 52.30, "merchant": "Chevron"}, "Gas & Fuel"),
        ({"description": "BP GAS STATION", "amount": 48.75, "merchant": "BP"}, "Gas & Fuel"),
        ({"description": "EXXONMOBIL", "amount": 41.20, "merchant": "Exxon"}, "Gas & Fuel"),
        ({"description": "ARCO STATION", "amount": 38.90, "merchant": "Arco"}, "Gas & Fuel"),
        
        # Shopping
        ({"description": "AMAZON.COM PURCHASE", "amount": 67.89, "merchant": "Amazon"}, "Shopping"),
        ({"description": "TARGET STORE #1234", "amount": 85.42, "merchant": "Target"}, "Shopping"),
        ({"description": "BESTBUY.COM", "amount": 234.99, "merchant": "Best Buy"}, "Shopping"),
        ({"description": "MACY'S #456", "amount": 95.67, "merchant": "Macys"}, "Shopping"),
        ({"description": "HOME DEPOT #789", "amount": 143.21, "merchant": "Home Depot"}, "Shopping"),
        ({"description": "NIKE STORE", "amount": 89.99, "merchant": "Nike"}, "Shopping"),
        ({"description": "OLD NAVY", "amount": 54.32, "merchant": "Old Navy"}, "Shopping"),
        
        # Entertainment
        ({"description": "NETFLIX SUBSCRIPTION", "amount": 15.99, "merchant": "Netflix"}, "Entertainment"),
        ({"description": "SPOTIFY PREMIUM", "amount": 9.99, "merchant": "Spotify"}, "Entertainment"),
        ({"description": "AMC THEATERS #123", "amount": 28.50, "merchant": "AMC"}, "Entertainment"),
        ({"description": "STEAM GAMES", "amount": 59.99, "merchant": "Steam"}, "Entertainment"),
        ({"description": "PLAYSTATION NETWORK", "amount": 19.99, "merchant": "PlayStation"}, "Entertainment"),
        ({"description": "HULU STREAMING", "amount": 12.99, "merchant": "Hulu"}, "Entertainment"),
        
        # Bills & Utilities
        ({"description": "PG&E UTILITY BILL", "amount": 145.67, "merchant": "PG&E"}, "Bills & Utilities"),
        ({"description": "COMCAST CABLE", "amount": 89.99, "merchant": "Comcast"}, "Bills & Utilities"),
        ({"description": "VERIZON WIRELESS", "amount": 75.00, "merchant": "Verizon"}, "Bills & Utilities"),
        ({"description": "AT&T PHONE SERVICE", "amount": 65.43, "merchant": "AT&T"}, "Bills & Utilities"),
        ({"description": "WATER UTILITY PAYMENT", "amount": 45.23, "merchant": ""}, "Bills & Utilities"),
        ({"description": "ELECTRIC COMPANY", "amount": 123.45, "merchant": ""}, "Bills & Utilities"),
        
        # Healthcare
        ({"description": "WALGREENS PHARMACY", "amount": 25.60, "merchant": "Walgreens"}, "Healthcare"),
        ({"description": "CVS PHARMACY #456", "amount": 18.90, "merchant": "CVS"}, "Healthcare"),
        ({"description": "DENTIST OFFICE COPAY", "amount": 50.00, "merchant": ""}, "Healthcare"),
        ({"description": "DR SMITH MEDICAL", "amount": 35.00, "merchant": ""}, "Healthcare"),
        ({"description": "LABORATORY TESTS", "amount": 125.00, "merchant": ""}, "Healthcare"),
        
        # Travel
        ({"description": "UNITED AIRLINES", "amount": 345.60, "merchant": "United"}, "Travel"),
        ({"description": "MARRIOTT HOTEL", "amount": 189.99, "merchant": "Marriott"}, "Travel"),
        ({"description": "AIRBNB RESERVATION", "amount": 256.78, "merchant": "Airbnb"}, "Travel"),
        ({"description": "HERTZ CAR RENTAL", "amount": 156.34, "merchant": "Hertz"}, "Travel"),
        ({"description": "DELTA AIR LINES", "amount": 412.50, "merchant": "Delta"}, "Travel"),
        
        # Home & Garden
        ({"description": "LOWES #1234", "amount": 87.65, "merchant": "Lowes"}, "Home & Garden"),
        ({"description": "IKEA STORE", "amount": 234.56, "merchant": "IKEA"}, "Home & Garden"),
        ({"description": "BED BATH & BEYOND", "amount": 67.89, "merchant": "Bed Bath Beyond"}, "Home & Garden"),
        ({"description": "GARDENING SUPPLIES", "amount": 45.23, "merchant": ""}, "Home & Garden"),
        
        # Personal Care
        ({"description": "SUPERCUTS HAIRCUT", "amount": 25.00, "merchant": "Supercuts"}, "Personal Care"),
        ({"description": "SALON SERVICES", "amount": 85.00, "merchant": ""}, "Personal Care"),
        ({"description": "SPA TREATMENT", "amount": 120.00, "merchant": ""}, "Personal Care"),
        ({"description": "ULTA BEAUTY", "amount": 45.67, "merchant": "Ulta"}, "Personal Care"),
        
        # Education
        ({"description": "COURSERA COURSE", "amount": 49.99, "merchant": "Coursera"}, "Education"),
        ({"description": "UDEMY LEARNING", "amount": 29.99, "merchant": "Udemy"}, "Education"),
        ({"description": "COLLEGE TEXTBOOKS", "amount": 156.78, "merchant": ""}, "Education"),
        ({"description": "TUITION PAYMENT", "amount": 2500.00, "merchant": ""}, "Education"),
        
        # Insurance
        ({"description": "GEICO INSURANCE", "amount": 145.67, "merchant": "Geico"}, "Insurance"),
        ({"description": "STATE FARM AUTO", "amount": 178.90, "merchant": "State Farm"}, "Insurance"),
        ({"description": "HEALTH INSURANCE PREMIUM", "amount": 456.78, "merchant": ""}, "Insurance"),
        
        # Income
        ({"description": "PAYROLL DEPOSIT", "amount": 3450.00, "merchant": ""}, "Income"),
        ({"description": "DIRECT DEPOSIT SALARY", "amount": 2890.50, "merchant": ""}, "Income"),
        ({"description": "FREELANCE PAYMENT", "amount": 850.00, "merchant": ""}, "Income"),
        ({"description": "CASH DEPOSIT", "amount": 200.00, "merchant": ""}, "Income"),
        
        # Transfer
        ({"description": "TRANSFER TO SAVINGS", "amount": 500.00, "merchant": ""}, "Transfer"),
        ({"description": "VENMO TRANSFER", "amount": 50.00, "merchant": "Venmo"}, "Transfer"),
        ({"description": "PAYPAL TRANSFER", "amount": 75.00, "merchant": "PayPal"}, "Transfer"),
        ({"description": "ZELLE PAYMENT", "amount": 100.00, "merchant": "Zelle"}, "Transfer"),
    ]
    
    # Separate into transactions and categories
    transactions = [t[0] for t in training_samples]
    categories = [t[1] for t in training_samples]
    
    return transactions, categories
