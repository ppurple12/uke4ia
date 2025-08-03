import React, { useState } from 'react';
import '../styles/login.css';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/users/login', {
        
        MEMBER_NAME: name,
        PASSWORD: password
      });
      login(res.data.user_id, res.data.is_admin);
      navigate('/');
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>



          <div className="input-row">
            <input
              type="name"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="password"
              placeholder="Secret Code"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

        <button type="submit" className="submit-button">
          Login
        </button>
      </form>
    </div>
  );
}
