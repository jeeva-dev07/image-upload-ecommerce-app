from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
import os
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder="static")

UPLOAD_FOLDER = "static/uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
MAX_FILE_SIZE = 2 * 1024 * 1024

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
CORS(app)


# ================= DB =================

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="velmurugan2002",
        database="ecommerce_db"
    )
def allowed_file(filename):
    return (
        "." in filename and
        filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )

# ================= HOME =================

@app.route("/")
def home():
    return jsonify({"message": "E-Commerce Backend Running"})

# ================= REGISTER =================

@app.route("/api/register", methods=["POST"])
def register():
    try:
        data = request.json

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM users WHERE email=%s",
            (email,)
        )

        if cursor.fetchone():
            return jsonify({
                "message": "Email already exists"
            }), 400
        hashed = generate_password_hash(password)

        cursor = db.cursor()

        cursor.execute("""
            INSERT INTO users
            (name,email,password,role)
            VALUES (%s,%s,%s,%s)
        """, (
            name,
            email,
            hashed,
            "customer"
        ))

        db.commit()

        cursor.close()
        db.close()

        return jsonify({
            "message": "Registered Successfully"
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

# ================= LOGIN =================

@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.json

        email = data.get("email")
        password = data.get("password")

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM users WHERE email=%s",
            (email,)
        )

        user = cursor.fetchone()

        cursor.close()
        db.close()

        if not user:
            return jsonify({
                "message": "User not found"
            }), 401

        if not check_password_hash(
           user["password"],
             password
): 

            return jsonify({
                "message": "Invalid password"
            }), 401

        return jsonify({
            "message": "Login Success",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

# ================= CATEGORIES =================

@app.route("/api/categories")
def get_categories():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM categories"
        )

        data = cursor.fetchall()

        cursor.close()
        db.close()

        return jsonify(data)

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

# ================= PRODUCTS =================

@app.route("/api/products")
def get_products():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                p.*,
                c.name AS category
            FROM products p
            LEFT JOIN categories c
            ON p.category_id = c.id
        """)

        products = cursor.fetchall()

        cursor.close()
        db.close()

        return jsonify(products)

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500
    

# ================= PRODUCT DETAIL =================

@app.route("/api/products/<int:id>")
def get_product(id):
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT p.*, c.name AS category
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id=%s
        """, (id,))

        product = cursor.fetchone()

        cursor.close()
        db.close()

        if not product:
            return jsonify({"message": "Product Not Found"}), 404

        return jsonify(product)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= PLACE ORDER =================
@app.route("/api/orders", methods=["POST"])
def create_order():
    try:
        data = request.json

        user_id = data.get("user_id")
        items = data.get("items", [])
        address = data.get("address")

        if not user_id:
            return jsonify({"message": "User required"}), 401

        if not address:
            return jsonify({"message": "Address required"}), 400

        if not items:
            return jsonify({"message": "Cart empty"}), 400

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        total = 0

        for item in items:

            product_id = item.get("product_id")
            quantity = item.get("quantity")

            cursor.execute(
                "SELECT * FROM products WHERE id=%s",
                (product_id,)
            )

            product = cursor.fetchone()

            if not product:
                return jsonify({
                    "message": "Product not found"
                }), 404

            if product["stock"] < quantity:
                return jsonify({
                    "message": f"{product['name']} out of stock"
                }), 400

            total += float(product["price"]) * quantity

        cursor = db.cursor()

        cursor.execute("""
            INSERT INTO orders
            (user_id,total_amount,address,status)
            VALUES (%s,%s,%s,%s)
        """, (
            user_id,
            total,
            address,
            "Pending"
        ))

        order_id = cursor.lastrowid

        for item in items:

            product_id = item.get("product_id")
            quantity = item.get("quantity")

            cursor.execute(
                "SELECT price FROM products WHERE id=%s",
                (product_id,)
            )

            price = cursor.fetchone()[0]

            cursor.execute("""
                INSERT INTO order_items
                (order_id,product_id,quantity,unit_price)
                VALUES (%s,%s,%s,%s)
            """, (
                order_id,
                product_id,
                quantity,
                price
            ))

            cursor.execute("""
                UPDATE products
                SET stock = stock - %s
                WHERE id=%s
            """, (
                quantity,
                product_id
            ))

        db.commit()

        cursor.close()
        db.close()

        return jsonify({
            "message": "Order placed successfully",
            "order_id": order_id
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


# ================= MY ORDERS =================

@app.route("/api/orders/my/<int:user_id>")
def my_orders(user_id):
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT *
            FROM orders
            WHERE user_id=%s
            ORDER BY id DESC
        """, (user_id,))

        orders = cursor.fetchall()

        for order in orders:

            cursor.execute("""
                SELECT
                    oi.*,
                    p.name
                FROM order_items oi
                JOIN products p
                ON p.id = oi.product_id
                WHERE oi.order_id=%s
            """, (order["id"],))

            order["items"] = cursor.fetchall()

        cursor.close()
        db.close()

        return jsonify(orders)

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


# ================= ADMIN ORDERS =================

@app.route("/api/admin/orders")
def get_all_orders():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                o.id,
                IFNULL(u.name, 'Unknown') AS customer_name,
                o.total_amount,
                o.status,
                o.address,
                o.ordered_at
            FROM orders o
            LEFT JOIN users u
            ON o.user_id = u.id
            ORDER BY o.id DESC
        """)

        orders = cursor.fetchall()

        cursor.close()
        db.close()

        return jsonify(orders)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= UPDATE ORDER STATUS =================

@app.route("/api/admin/orders/<int:id>", methods=["PUT"])
def update_order_status(id):
    try:
        data = request.json

        status = data.get("status")

        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute("""
            UPDATE orders
            SET status=%s
            WHERE id=%s
        """, (
            status,
            id
        ))

        db.commit()

        cursor.close()
        db.close()

        return jsonify({
            "message": "Status Updated"
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500
    

# ================= UPLOAD IMAGE =================
@app.route("/api/upload", methods=["POST"])
def upload_image():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["image"]

        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400

        ext = file.filename.rsplit(".", 1)[1].lower()
        unique_name = f"{uuid.uuid4().hex}.{ext}"

        filepath = os.path.join(app.config["UPLOAD_FOLDER"], unique_name)
        file.save(filepath)

        # ✅ FIXED FULL URL (IMPORTANT)
        image_url = f"/static/uploads/{unique_name}"

        return jsonify({"image_url": image_url}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================= SERVE IMAGE =================
@app.route("/static/uploads/<path:filename>")
def serve_uploaded_file(filename):
    return send_from_directory(
        os.path.join(app.root_path, "static/uploads"),
        filename
    )

# ================= ADMIN ADD PRODUCT =================
@app.route("/api/admin/products", methods=["POST"])
def add_product():
    try:
        data = request.json

        name = data.get("name")
        description = data.get("description")
        price = data.get("price")
        image_url = data.get("image_url")
        stock = data.get("stock")
        category_id = data.get("category_id")

        if not all([name, price, stock, category_id]):
            return jsonify({"message": "Missing fields"}), 400

        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute(
            "SELECT id FROM categories WHERE id=%s",
            (category_id,)
        )

        if not cursor.fetchone():
            return jsonify({"message": "Invalid category_id"}), 400

        cursor.execute("""
            INSERT INTO products
            (name, description, price, image_url, stock, category_id)
            VALUES (%s,%s,%s,%s,%s,%s)
        """, (name, description, price, image_url, stock, category_id))

        db.commit()
        cursor.close()
        db.close()

        return jsonify({"message": "Product Added Successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= ADMIN UPDATE PRODUCT =================
@app.route("/api/admin/products/<int:id>", methods=["PUT"])
def update_product(id):
    try:
        data = request.json

        name = data.get("name")
        description = data.get("description")
        price = data.get("price")
        image_url = data.get("image_url")
        stock = data.get("stock")
        category_id = data.get("category_id")

        if not all([name, price, stock, category_id]):
            return jsonify({"message": "Missing fields"}), 400

        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute("""
            UPDATE products
            SET name=%s,
                description=%s,
                price=%s,
                image_url=%s,
                stock=%s,
                category_id=%s
            WHERE id=%s
        """, (
            name, description, price,
            image_url, stock,
            category_id, id
        ))

        db.commit()
        cursor.close()
        db.close()

        return jsonify({"message": "Product Updated Successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= ADMIN DELETE PRODUCT =================
@app.route("/api/admin/products/<int:id>", methods=["DELETE"])
def delete_product(id):
    try:
        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute(
            "DELETE FROM products WHERE id=%s",
            (id,)
        )

        db.commit()
        cursor.close()
        db.close()

        return jsonify({"message": "Product Deleted"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == "__main__":
    app.run(debug=True)