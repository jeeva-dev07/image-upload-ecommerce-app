import { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";

const BASE_URL = "http://localhost:5000";

function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { toasts, showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
    category_id: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);

  // ================= LOAD CATEGORIES =================
  useEffect(() => {
    API.get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => showToast("Category Load Failed", "error"));
  }, []);

  // ================= LOAD PRODUCT (EDIT) =================
  useEffect(() => {
    if (!isEdit) return;

    API.get(`/products/${id}`)
      .then((res) => {
        const p = res.data;

        setForm({
          name: p.name || "",
          description: p.description || "",
          price: p.price || "",
          stock: p.stock || "",
          image_url: p.image_url || "",
          category_id: p.category_id ? String(p.category_id) : "",
        });

        // 🔥 FIXED IMAGE PREVIEW
        if (p.image_url) {
          setPreview(
            p.image_url.startsWith("http")
              ? p.image_url
              : `${BASE_URL}${p.image_url}`
          );
        }
      })
      .catch(() => showToast("Product Load Failed", "error"));
  }, [id]);

  // ================= INPUT =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= IMAGE CHANGE =================
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let image_url = form.image_url;

      // Upload image if new file
      if (file) {
        const formData = new FormData();
        formData.append("image", file);

        showToast("Uploading Image...", "success");

        const uploadRes = await API.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        image_url = uploadRes.data.image_url;
        showToast("Image Uploaded", "success");
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        image_url,
        category_id: parseInt(form.category_id, 10),
      };

      if (isEdit) {
        await API.put(`/admin/products/${id}`, payload);
        showToast("Product Updated", "success");
      } else {
        await API.post("/admin/products", payload);
        showToast("Product Added", "success");
      }

      setTimeout(() => navigate("/admin/products"), 1000);
    } catch (err) {
      showToast(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Operation Failed",
        "error"
      );
    }
  };

  return (
    <>
      <div style={styles.page}>
        <div style={styles.card}>
          <h1>{isEdit ? "✏️ Edit Product" : "➕ Add Product"}</h1>

          <form onSubmit={handleSubmit}>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product Name"
              style={styles.input}
              required
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              style={styles.textarea}
              required
            />

            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              style={styles.input}
              required
            />

            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="Stock"
              style={styles.input}
              required
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={styles.input}
            />

            {/* 🔥 IMAGE PREVIEW FIXED */}
            {preview && (
              <img
                src={preview}
                alt="Preview"
                width="150"
                style={{
                  display: "block",
                  marginBottom: "12px",
                  borderRadius: "8px",
                }}
              />
            )}

            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button type="submit" style={styles.button}>
              {isEdit ? "Update Product" : "Add Product"}
            </button>
          </form>
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </>
  );
}

export default ProductForm;
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f9",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px",
  },

  card: {
    width: "500px",
    background: "#fff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    height: "100px",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    resize: "vertical",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "12px",
    background: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
};