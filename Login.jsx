import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await axios.post(
      "http://127.0.0.1:5000/api/login",
      {
        email,
        password,
      }
    );

    const user = res.data.user;

    login(user);
    localStorage.setItem("user", JSON.stringify(user));

    alert("Login Successful 🎉");

    if (user.role === "admin") {
      navigate("/admin/products");
    } else {
      navigate("/");
    }
  } catch (err) {
    console.log(err.response);
    console.log(err.response?.data);

    setError(
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Login Failed"
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            style={styles.input}
            required
          />

          {error && (
            <p style={styles.error}>{error}</p>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

/* ================= STYLES ================= */

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #74ebd5, #ACB6E5)",
    fontFamily: "Arial",
  },

  card: {
    width: "340px",
    padding: "25px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow:
      "0 10px 25px rgba(0,0,0,0.15)",
    textAlign: "center",
  },

  title: {
    marginBottom: "15px",
    color: "#333",
  },

  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
    fontSize: "14px",
  },

  button: {
    width: "100%",
    padding: "10px",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
  },

  error: {
    color: "red",
    fontSize: "13px",
    marginBottom: "8px",
  },
};