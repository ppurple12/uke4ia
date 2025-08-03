import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../styles/posts.css';
import { useAuth } from '../components/AuthContext';

function BlogPostList({ }) {
  const { userId, admin } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const limit = 3; // posts per page

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        // Fetch posts for current page
        const res = await fetch(`/api/?page=${page}&limit=${limit}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setPosts(data.posts || data);

        // Fetch total post count
        const countRes = await fetch(`/api/count`);
        if (!countRes.ok) throw new Error(`Count fetch error: ${countRes.status}`);
        const countData = await countRes.json();
        setTotalCount(countData.totalCount);

        // Determine if there's more pages
        setHasMore(page * limit < countData.totalCount);
      } catch (err) {
        console.error("Failed to load posts", err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [page]);

  const totalPages = Math.ceil(totalCount / limit);

  const handleNext = () => {
    if (hasMore) setPage((prev) => prev + 1);
  };

  const handleBack = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  return (
    
    <div className="blog-post-list-container">
      <div className="header-bar">
        <div></div> {/* empty div to take left space */}
        {admin && (
          <Link to="/add_post">
            <button>Add New Post</button>
          </Link>
        )}
      </div>


      {loading && <p>Loading posts...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && posts.length === 0 && <p>No posts found.</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {posts.map((post) => (
          <li key={post.POST_ID} style={{ marginBottom: "1rem" }}>
            <Link to={`/posts/${post.POST_ID}`} className="blog-post-item" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <h3>{post.POST_TITLE}</h3>
              <p className="date">{post.POST_DATE}</p>
              <p className="preview">{post.POST_CONTENTS.slice(0, 100)}...</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="pagination-container">
        <button onClick={handleBack} disabled={page === 1}>
          ← Back
        </button>

        <span>
          Page {page} of {totalPages || 1}
        </span>

        <button onClick={handleNext} disabled={!hasMore}>
          Next →
        </button>
      </div>
    </div>
  );
}

export default BlogPostList;