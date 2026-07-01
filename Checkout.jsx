import { useState } from "react";
import { useCart } from "../context/CartContext";
import API from "../api";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const { cartItems, clearCart } = useCart();
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  const placeOrder = async () => {
    try {
      if (!user) {
        alert("Please Login First");
        navigate("/login");
        return;
      }

      if (!address.trim()) {
        alert("Please Enter Address");
        return;
      }

      if (cartItems.length === 0) {
        alert("Cart Empty");
        return;
      }

      const payload = {
        user_id: user.id,
        address: address,
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.qty,
        })),
      };

      console.log("ORDER PAYLOAD:", payload);

      const res = await API.post("/orders", payload);

      alert(
        `Order Placed Successfully 🎉 Order ID: ${res.data.order_id}`
      );

      clearCart();
      navigate("/orders");
    } catch (err) {
      console.log(
        "ORDER ERROR:",
        err.response?.data || err.message
      );

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Order Failed"
      );
    }
  };

  return (
    <div style={styles.page}>
      <h1>🧾 Checkout</h1>

      <div style={styles.box}>
        <h3>👤 Customer Details</h3>

        <p>
          <strong>Name:</strong> {user?.name || "Guest"}
        </p>

        <p>
          <strong>Email:</strong> {user?.email || "-"}
        </p>
      </div>

      <div style={styles.box}>
        <h3>🛒 Order Summary</h3>

        {cartItems.length === 0 ? (
          <p>Cart Empty</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} style={styles.item}>
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
                <h4>{item.name}</h4>

                <p>Qty: {item.qty}</p>

                <p>Price: ₹{item.price}</p>

                <p>
                  Total: ₹
                  {Number(item.price) * item.qty}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={styles.box}>
        <h3>📍 Delivery Address</h3>

        <textarea
          placeholder="Enter Full Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.totalBox}>
        <h2>💰 Grand Total: ₹{total}</h2>
      </div>

      <button
        onClick={placeOrder}
        style={styles.btn}
      >
        Place Order
      </button>
    </div>
  );
}

export default Checkout;

const styles = {
  page: {
    padding: "20px",
    maxWidth: "900px",
    margin: "auto",
    fontFamily: "Arial",
  },

  box: {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },

  item: {
    display: "flex",
    gap: "15px",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },

  img: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "8px",
  },

  input: {
    width: "100%",
    height: "100px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },

  totalBox: {
    marginBottom: "15px",
  },

  btn: {
    width: "100%",
    background: "green",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
};