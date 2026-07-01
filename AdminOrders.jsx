import { useEffect, useState } from "react";
import API from "../../api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  // GET ALL ORDERS
  const fetchOrders = () => {
    API.get("/admin/orders")
      .then((res) => setOrders(res.data))
      .catch((err) => console.log("Fetch Error:", err));
  };

  // UPDATE STATUS
  const updateStatus = async (orderId, status) => {
    try {
      await API.put(`/admin/orders/${orderId}`, {
        status,
      });

      // instant UI update
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status } : o
        )
      );

      alert("Status Updated ✅");
    } catch (err) {
      console.log("Update Error:", err);
      alert("Update Failed ❌");
    }
  };

  return (
    <div style={{ padding: "20px", background: "#f5f6fa", minHeight: "100vh" }}>
      <h1>📦 Admin Orders</h1>

      {orders.length === 0 ? (
        <p>No Orders Found</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "15px",
              background: "#fff",
            }}
          >
            <h3>Order #{order.id}</h3>

            <p>
              <strong>Customer:</strong> {order.customer_name}
            </p>

            <p>
              <strong>Amount:</strong> ₹{order.total_amount}
            </p>

            <p>
              <strong>Address:</strong> {order.address}
            </p>

            <p>
              <strong>Ordered At:</strong>{" "}
              {new Date(order.ordered_at).toLocaleString()}
            </p>

            <div>
              <strong>Status:</strong>

              <select
                value={order.status}
                onChange={(e) =>
                  updateStatus(order.id, e.target.value)
                }
                style={{
                  marginLeft: "10px",
                  padding: "5px",
                }}
              >
                <option value="Pending">Pending</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminOrders;