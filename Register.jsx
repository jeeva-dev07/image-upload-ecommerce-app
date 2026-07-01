import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await API.post("/register", {
        name,
        email,
        password,
      });

      alert("Registered Successfully 🎉");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Register Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>📝 Register</h1>

        <form onSubmit={handleRegister}>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            style={styles.input}
            required
          />

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
            <p style={styles.error}>
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              ...styles.btn,
              opacity: loading ? 0.6 : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
            disabled={loading}
          >
            {loading
              ? "Registering..."
              : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
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

  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
  },

  btn: {
    width: "100%",
    padding: "10px",
    background: "#2ecc71",
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