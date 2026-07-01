import { useEffect, useState } from "react";
import API from "../../api";
import { Link } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      console.log("Products:", res.data);
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await API.delete(`/admin/products/${id}`);
      fetchProducts();
      alert("Product Deleted Successfully");
    } catch (err) {
      console.log(err);
      alert("Delete Failed");
    }
  };

  let filteredProducts = [...products];

  if (search) {
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (category !== "All") {
    filteredProducts = filteredProducts.filter(
      (p) => p.category === category
    );
  }

  if (sort === "low") {
    filteredProducts.sort(
      (a, b) => Number(a.price) - Number(b.price)
    );
  }

  if (sort === "high") {
    filteredProducts.sort(
      (a, b) => Number(b.price) - Number(a.price)
    );
  }

  return (
    <div style={styles.page}>
      <h1>🛠 Admin Products</h1>

      <Link to="/admin/products/add" style={styles.addBtn}>
        ➕ Add Product
      </Link>

      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search Product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={styles.select}
        >
          <option value="All">All</option>
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
          <option value="">Sort By</option>
          <option value="low">Price Low → High</option>
          <option value="high">Price High → Low</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <h3>No Products Found</h3>
      ) : (
        filteredProducts.map((p) => (
          <div key={p.id} style={styles.card}>
           <img
  src={
    p.image_url
      ? p.image_url.startsWith("http")
        ? p.image_url
        : `${BASE_URL}${p.image_url}`
      : ""
  }
  alt={p.name}
  style={styles.image}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-size='14' fill='%23666'%3ENo Image%3C/text%3E%3C/svg%3E";
  }}
/>

            <div style={{ flex: 1 }}>
              <h3>{p.name}</h3>

              <p>
                <strong>Category:</strong> {p.category}
              </p>

              <p>
                <strong>Price:</strong> ₹{p.price}
              </p>

              <p>
                <strong>Stock:</strong> {p.stock}
              </p>

              <div style={styles.buttonRow}>
                <Link to={`/admin/products/edit/${p.id}`}>
                  <button style={styles.editBtn}>Edit</button>
                </Link>

                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteProduct(p.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminProducts;

const styles = {
  page: {
    padding: "20px",
  },

  addBtn: {
    display: "inline-block",
    marginBottom: "20px",
    textDecoration: "none",
    background: "#3498db",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "6px",
  },

  filters: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  input: {
    padding: "10px",
    width: "250px",
  },

  select: {
    padding: "10px",
  },

  card: {
    display: "flex",
    gap: "20px",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    marginBottom: "15px",
    alignItems: "center",
    background: "#fff",
  },

  image: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },

  editBtn: {
    padding: "8px 14px",
    background: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  deleteBtn: {
    padding: "8px 14px",
    background: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};