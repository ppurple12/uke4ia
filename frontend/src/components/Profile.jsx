import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CircleUserRound } from "lucide-react";
import '../styles/profile.css';
import axios from "axios";
import { useAuth } from '../components/AuthContext';


const Profile = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { userId, logout } = useAuth(); // ✅ get userId from auth context
  const [initials, setInitials] = useState("");

  useEffect(() => {
    if (userId > 0) {
      axios.get(`/api/profile/${userId}`)
        .then(res => {
          const { initials } = res.data;
          setInitials(initials || ""); // fallback just in case
        })
        .catch(err => {
          console.error("Failed to load user profile:", err);
        });
    }
  }, [userId]);
  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="profile-container" ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} className="profile-button">
        <div className="avatar-circle">{initials || <CircleUserRound />}</div>
      </button>

      {open && (
        <div className="profile-dropdown">
          {userId == 0 ? (
            <Link to="/login">Log In</Link>
          ) : (
            <>
              <Link to="/" onClick={logout}>Log Out</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile; 