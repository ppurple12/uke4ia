import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../components/AuthContext";
import '../styles/concert.css';

export default function BlogPostDetails() {
  const { postId } = useParams();
  const { admin } = useAuth();

  const [post, setPost] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    axios.get(`/api/blogposts/${postId}`).then(res => {
      setPost(res.data);
      setFormData(res.data);
    });
  }, [postId]);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData(prev => ({ ...prev, POST_IMAGE: file }));
    };
    reader.readAsDataURL(file);
  }

  async function saveChanges() {
    const data = new FormData();
    data.append("POST_TITLE", formData.POST_TITLE);
    data.append("POST_CONTENTS", formData.POST_CONTENTS);
    if (formData.POST_IMAGE instanceof File) {
      data.append("POST_IMAGE", formData.POST_IMAGE);
    }

    try {
      const res = await axios.put(`/api/blogposts/${postId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPost(res.data);
      setFormData(res.data);
      setEditMode(false);
      setImagePreview(null);
    } catch (err) {
      alert("Failed to save changes.");
    }
  }

  if (!post) return <p>Loading...</p>;

  return (
    <div className="blog-detail-container">
      {admin && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          {editMode && (
            <button onClick={() => setEditMode(false)} style={{ background: "#ccc" }}>
              Cancel
            </button>
          )}
          <button onClick={() => (editMode ? saveChanges() : setEditMode(true))}>
            {editMode ? "Save" : "Edit"}
          </button>
        </div>
      )}

      <h1 className="blog-title">
        {editMode ? (
          <input
            type="text"
            name="POST_TITLE"
            value={formData.POST_TITLE || ""}
            onChange={handleInputChange}
          />
        ) : (
          post.POST_TITLE
        )}
      </h1>

      <p className="blog-date">
        {new Date(post.POST_DATE).toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="blog-contents">
        {editMode ? (
          <textarea
            name="POST_CONTENTS"
            value={formData.POST_CONTENTS || ""}
            onChange={handleInputChange}
            rows={10}
            style={{ width: "100%" }}
          />
        ) : (
          <p>{post.POST_CONTENTS}</p>
        )}
      </div>

      {editMode && (
        <>
          <label>Change Image:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxHeight: 300 }} />}
        </>
      )}

      {!editMode && post.POST_IMAGE && (
        <img
        src={post.POST_IMAGE ? `/uploads/${post.POST_IMAGE}` : undefined}
        alt={post.POST_TITLE}
        style={{ maxWidth: "100%", marginTop: "1rem" }}
        />
      )}

      <div style={{ marginTop: "2rem" }}>
        <Link to="/">← Back to blog posts</Link>
      </div>
    </div>
  );
}