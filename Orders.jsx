import { useEffect, useState } from "react";
import API from "../api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    API.get(`/orders/my/${user.id}`)
      .then((res) => {
        setOrders(res.data || []);
      })
      .catch((err) => {
        console.log("Orders API Error:", err);
        setOrders([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>📦 My Orders</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p style={styles.empty}>
          No Orders Found 😢
        </p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={styles.card}
          >
            <h3>
              Order #{order.id}
            </h3>

            <p>
              <strong>Status:</strong>{" "}
              <span style={styles.status}>
                {order.status}
              </span>
            </p>

            <p>
              <strong>Total:</strong> ₹
              {order.total_amount}
            </p>

            <p>
              <strong>Address:</strong>{" "}
              {order.address}
            </p>

            <p>
              <strong>Time:</strong>{" "}
              {new Date(
                order.ordered_at
              ).toLocaleString()}
            </p>

            {order.items &&
              order.items.length > 0 && (
                <>
                  <hr />
                  <h4>Products</h4>

                  {order.items.map(
                    (item) => (
                      <div
                        key={item.id}
                        style={{
                          marginBottom:
                            "8px",
                        }}
                      >
                        <p>
                          {item.name}
                        </p>

                        <p>
                          Qty:{" "}
                          {
                            item.quantity
                          }
                        </p>

                        <p>
                          Price: ₹
                          {
                            item.unit_price
                          }
                        </p>
                      </div>
                    )
                  )}
                </>
              )}
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;

const styles = {
  page: {
    padding: "20px",
    background: "#f5f6fa",
    minHeight: "100vh",
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
  },

  card: {
    background: "#fff",
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "10px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.1)",
  },

  status: {
    background: "#dff9fb",
    padding: "3px 8px",
    borderRadius: "5px",
  },

  empty: {
    textAlign: "center",
    color: "gray",
  },
};