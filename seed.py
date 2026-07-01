import mysql.connector
from werkzeug.security import generate_password_hash

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="velmurugan2002",
        database="ecommerce_db"
    )

db = get_db()
cursor = db.cursor()

print("Clearing old data...")

cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
cursor.execute("DELETE FROM order_items")
cursor.execute("DELETE FROM orders")
cursor.execute("DELETE FROM products")
cursor.execute("DELETE FROM users")      # <-- Indha line add pannunga
cursor.execute("DELETE FROM categories")
cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

print("Inserting categories...")

categories = [
    ("Electronics",),
    ("Fashion",),
    ("Home",),
    ("Books",),
    ("Sports",)
]

cursor.executemany(
    "INSERT INTO categories(name) VALUES(%s)",
    categories
)

cursor.execute("SELECT id,name FROM categories")
cats = cursor.fetchall()

cat_map = {name: cid for cid, name in cats}

print(cat_map)
print("Inserting users...")

users = [
    (
        "Admin",
        "admin@gmail.com",
        generate_password_hash("admin123"),
        "admin"
    ),
    (
        "User",
        "user@gmail.com",
        generate_password_hash("user123"),
        "customer"
    )
]

cursor.executemany("""
INSERT INTO users (name, email, password, role)
VALUES (%s, %s, %s, %s)
""", users)

db.commit()

products = [

    ("Gaming Laptop",
     "RTX 4060 Gaming Laptop",
     85000,
     "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
     15,
     cat_map["Electronics"]),

    ("Mobile",
     "Android Smartphone",
     20000,
     "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
     25,
     cat_map["Electronics"]),

    ("Headphones",
     "Wireless Headphones",
     3000,
     "https://images.unsplash.com/photo-1518441902117-f0a3a2f92c58",
     50,
     cat_map["Electronics"]),

    ("iPhone 16",
     "Apple Smartphone",
     80000,
     "https://images.unsplash.com/photo-1592750475338-74b7b21085ab",
     20,
     cat_map["Electronics"]),

    ("T-Shirt",
     "Cotton T-Shirt",
     500,
     "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
     100,
     cat_map["Fashion"]),

    ("Jeans",
     "Blue Denim Jeans",
     1200,
     "https://images.unsplash.com/photo-1541099649105-f69ad21f3246",
     60,
     cat_map["Fashion"]),

    ("Shoes",
     "Running Shoes",
     2500,
     "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
     40,
     cat_map["Fashion"]),

    ("Sofa",
     "3-Seater Sofa",
     15000,
     "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
     5,
     cat_map["Home"]),

    ("Chair",
     "Office Chair",
     3500,
     "https://images.unsplash.com/photo-1582582429416-7d3b0b2a5c3d",
     20,
     cat_map["Home"]),

    ("Table",
     "Wooden Table",
     5000,
     "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
     15,
     cat_map["Home"]),

    ("Programming Book",
     "Coding Basics",
     300,
     "https://images.unsplash.com/photo-1532012197267-da84d127e765",
     200,
     cat_map["Books"]),

    ("Flask Guide",
     "Python Flask Book",
     450,
     "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
     150,
     cat_map["Books"]),

    ("React Handbook",
     "Frontend Guide",
     500,
     "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
     180,
     cat_map["Books"]),

    ("Cricket Bat",
     "Professional Bat",
     1200,
     "https://images.unsplash.com/photo-1593341646782-e0b495cff86d",
     30,
     cat_map["Sports"]),

    ("Football",
     "FIFA Standard Ball",
     900,
     "https://images.unsplash.com/photo-1521412644187-c49fa049e84d",
     50,
     cat_map["Sports"]),

    ("Tennis Racket",
     "Lightweight Racket",
     2500,
     "https://images.unsplash.com/photo-1595435742656-5272d0b3fa82",
     25,
     cat_map["Sports"]),
]

cursor.executemany("""
INSERT INTO products
(name, description, price, image_url, stock, category_id)
VALUES (%s,%s,%s,%s,%s,%s)
""", products)

db.commit()

print("Seed Completed Successfully")

cursor.close()
db.close()