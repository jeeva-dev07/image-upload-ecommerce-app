import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { useCart } from "../context/CartContext";

const BASE_URL = "http://127.0.0.1:5000";

function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  let filteredProducts = [...products];

  if (search) {
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (category) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category === category
    );
  }

  if (sort === "low") {
    filteredProducts.sort((a, b) => Number(a.price) - Number(b.price));
  }

  if (sort === "high") {
    filteredProducts.sort((a, b) => Number(b.price) - Number(a.price));
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🛒 ShopMart</h1>

      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search Products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={styles.select}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Home">Home</option>
          <option value="Books">Books</option>
          <option value="Sports">Sports</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={styles.select}
        >
          <option value="">Sort By Price</option>
          <option value="low">Low → High</option>
          <option value="high">High → Low</option>
        </select>
      </div>

      <div style={styles.grid}>
        {filteredProducts.map((p) => {
          const imageUrl = p.image_url
            ? p.image_url.startsWith("http")
              ? p.image_url
              : `${BASE_URL}${p.image_url}`
            : "";

          return (
            <div key={p.id} style={styles.card}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={p.name}
                  style={styles.image}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div style={styles.noImage}>No Image</div>
              )}

              <div style={styles.content}>
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <p>
                  <strong>Category:</strong> {p.category}
                </p>
                <p style={styles.price}>₹{p.price}</p>
                <p>
                  <strong>Stock:</strong> {p.stock}
                </p>

                <button
                  style={styles.btn}
                  onClick={() => addToCart(p, 1)}
                >
                  Add To Cart
                </button>

                <Link to={`/products/${p.id}`} style={styles.link}>
                  View Product
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home;

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

  filters: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  input: {
    padding: "10px",
    width: "220px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },

  select: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
    gap: "20px",
  },

  card: {
    background: "#fff",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },

  image: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
  },

  noImage: {
    height: "220px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eee",
    color: "#666",
    fontWeight: "bold",
  },

  content: {
    padding: "15px",
  },

  price: {
    color: "green",
    fontWeight: "bold",
    fontSize: "18px",
  },

  btn: {
    width: "100%",
    padding: "10px",
    background: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },

  link: {
    display: "block",
    marginTop: "10px",
    textAlign: "center",
    textDecoration: "none",
    color: "#3498db",
    fontWeight: "bold",
  },
};