import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa'; 

function SignUp() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/auth/signup', {
        email,
        name,
        password,
        budgetLimit
      });
      localStorage.setItem('token', response.data.token); 
      navigate('/', { replace: true }); 
    } catch (error) {
      setError(error.response ? error.response.data.message : 'An error occurred');
    }
  };

  return (
    <div style={mainContainerStyle}>
      <header style={headerStyle}>
        <div style={logoContainerStyle}>
          <img src="my-logo" alt="App Logo" style={logoStyle} />
        </div>
        <div style={profileIconContainerStyle}>
          <FaUser size={24} />
        </div>
      </header>
      <div style={formContainerStyle}>
        <div style={formContentStyle}>
          <h2>Sign Up</h2>
          {error && <p style={errorStyle}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div style={inputGroupStyle}>
              <label htmlFor="name">First Name:</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="password">Password:</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="budgetLimit">Budget Limit:</label>
              <input
                id="budgetLimit"
                type="number"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <button type="submit" style={buttonStyle}>Sign Up</button>
            <p style={alreadyHaveAccountStyle}>
              Already have an account? <a href="/signin">Sign In</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

const mainContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: '#f4f4f4', 
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  padding: '10px 20px',
  backgroundColor: '#fff', 
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', 
};

const profileIconContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  order: 2, 
};

const logoContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  order: 1, 
};

const logoStyle = {
  height: '40px', 
};

const formContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
  width: '100%',
  padding: '10px', 
  boxSizing: 'border-box',
};

const formContentStyle = {
  width: '100%',
  maxWidth: '600px', 
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#fff',
};

const inputGroupStyle = {
  marginBottom: '15px',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #ddd',
};

const buttonStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#007bff',
  color: '#fff',
  fontSize: '16px',
  cursor: 'pointer',
};

const errorStyle = {
  color: 'red',
  marginBottom: '15px',
};

const alreadyHaveAccountStyle = {
  marginTop: '10px',
  textAlign: 'center',
};

export default SignUp;
