import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreatePost({ userId }) {
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  async function submitPost(e) {
    e.preventDefault();

    if (!userId) {
      alert("User not logged in");
      return;
    }

    const formData = new FormData();
    formData.append("POST_TITLE", title);
    formData.append("POST_CONTENTS", contents);
    if (image) {
      formData.append("POST_IMAGE", image);
    }
    formData.append("POST_AUTHOR", userId);

    try {
      const res = await fetch("/api/create", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert("Error creating post: " + JSON.stringify(errorData));
        return;
      }

      const data = await res.json();
      console.log("Post created:", data);

      // Redirect to the new post page or posts list
      navigate(`/posts/${data.post_id}`);
    } catch (err) {
      console.error("Failed to create post", err);
      alert("Failed to create post");
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Create New Blog Post</h2>
      <form onSubmit={submitPost}>
        <div>
          <label>Title:</label>
          <br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Contents:</label>
          <br />
          <textarea
            value={contents}
            onChange={(e) => setContents(e.target.value)}
            rows={10}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label>Image (optional):</label>
          <br />
          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <button type="submit" style={{ marginTop: 20, padding: "10px 20px" }}>
          Create Post
        </button>
      </form>
    </div>
  );
}

export default CreatePost;