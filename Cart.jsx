import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { cartItems, removeFromCart, addToCart, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  return (
    <div style={styles.page}>
      <h1>🛒 Your Cart</h1>

      {cartItems.length === 0 ? (
        <h3>Cart Empty</h3>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item.id} style={styles.card}>
              <img
  src={
    item.image_url.startsWith("/static")
      ? `http://127.0.0.1:5000${item.image_url}`
      : item.image_url
  }
  alt={item.name}
  style={styles.img}
/>

              <div>
                <h3>{item.name}</h3>
                <p>Price: ₹{item.price}</p>

                {/* ➕ ➖ QUANTITY */}
                <div style={styles.qtyBox}>
                  <button
                    onClick={() => addToCart(item, -1)}
                    style={styles.qtyBtn}
                    disabled={item.qty <= 1}
                  >
                    ➖
                  </button>

                  <span style={{ margin: "0 10px" }}>
                    {item.qty}
                  </span>

                  <button
                    onClick={() => addToCart(item, 1)}
                    style={styles.qtyBtn}
                  >
                    ➕
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  style={styles.removeBtn}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* TOTAL */}
          <h2>Total: ₹{total}</h2>

          {/* PLACE ORDER */}
          <button
            onClick={() => navigate("/checkout")}
            style={styles.orderBtn}
          >
            Place Order
          </button>

          <button onClick={clearCart} style={styles.clearBtn}>
            Clear Cart
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;

/* STYLES */
const styles = {
  page: { padding: "20px" },

  card: {
    display: "flex",
    gap: "10px",
    padding: "10px",
    border: "1px solid #ddd",
    marginBottom: "10px",
    borderRadius: "10px",
  },

  img: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
  },

  qtyBox: {
    display: "flex",
    alignItems: "center",
    marginTop: "5px",
  },

  qtyBtn: {
    padding: "5px 10px",
    cursor: "pointer",
  },

  removeBtn: {
    background: "red",
    color: "white",
    border: "none",
    padding: "5px 10px",
    marginTop: "8px",
  },

  orderBtn: {
    background: "green",
    color: "white",
    border: "none",
    padding: "10px 15px",
    marginTop: "10px",
    marginRight: "10px",
  },

  clearBtn: {
    background: "gray",
    color: "white",
    border: "none",
    padding: "10px 15px",
  },
};