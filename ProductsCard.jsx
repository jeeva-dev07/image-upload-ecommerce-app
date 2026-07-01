import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const BASE_URL = "http://127.0.0.1:5000";

function ProductsCard({ product }) {
  const { addToCart } = useCart();

  if (!product) return null;

  // ✅ SAFE IMAGE HANDLER
  const getImage = () => {
    if (!product.image_url) {
      return "https://dummyimage.com/300x200/ddd/000&text=No+Image";
    }

    if (product.image_url.startsWith("http")) {
      return product.image_url;
    }

    return `${BASE_URL}${product.image_url}`;
  };

  const imageUrl = getImage();

  return (
    <div style={styles.card}>
      <img
        src={imageUrl}
        alt={product.name}
        style={styles.image}
        loading="lazy"
        onError={(e) => {
          // ✅ IMPORTANT: stop infinite loop
          e.currentTarget.onerror = null;
          e.currentTarget.src =
            "https://dummyimage.com/300x200/ddd/000&text=No+Image";
        }}
      />

      <div style={styles.content}>
        <h3 style={styles.title}>{product.name}</h3>

        <p style={styles.desc}>
          {product.description || "No description"}
        </p>

        <p style={styles.category}>
          📂 {product.category || "Uncategorized"}
        </p>

        <p style={styles.price}>
          ₹{Number(product.price || 0).toLocaleString()}
        </p>

        <button
          style={styles.btn}
          onClick={() => addToCart(product, 1)}
        >
          Add To Cart
        </button>

        <Link to={`/products/${product.id}`} style={styles.link}>
          View Details →
        </Link>
      </div>
    </div>
  );
}

export default ProductsCard;

const styles = {
  card: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: "0.3s",
  },

  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    display: "block",
  },

  content: {
    padding: "12px",
  },

  title: {
    margin: "0 0 6px 0",
    fontSize: "16px",
  },

  desc: {
    fontSize: "13px",
    color: "#555",
    height: "35px",
    overflow: "hidden",
  },

  category: {
    fontSize: "12px",
    color: "#777",
    marginTop: "5px",
  },

  price: {
    fontWeight: "bold",
    color: "green",
    marginTop: "5px",
  },

  btn: {
    marginTop: "10px",
    width: "100%",
    padding: "8px",
    border: "none",
    borderRadius: "6px",
    background: "#3498db",
    color: "white",
    cursor: "pointer",
  },

  link: {
    display: "block",
    marginTop: "10px",
    fontSize: "12px",
    color: "#333",
    textDecoration: "none",
  },
};