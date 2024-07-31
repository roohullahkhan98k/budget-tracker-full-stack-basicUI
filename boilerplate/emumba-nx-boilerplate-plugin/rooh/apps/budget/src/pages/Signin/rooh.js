import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa'; 

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // this is for clearing the previos error
    try {
      const response = await axios.post('http://localhost:8000/api/auth/signin', {
        email,
        password
      });
      localStorage.setItem('token', response.data.token); // for saving the jwt tocken to the local storage
      navigate('/main'); //navigation to main
    } catch (error) {
      setError(error.response ? error.response.data.message : 'An error occurred');
    }
  };

  const handleSignUpRedirect = () => {
    navigate('/Signup'); 
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
          <h2>Sign In</h2>
          {error && <p style={errorStyle}>{error}</p>}
          <form onSubmit={handleSubmit}>
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
            <button type="submit" style={buttonStyle}>Sign In</button>
          </form>
          <p style={signupPromptStyle}>
            Don't have an account? <button onClick={handleSignUpRedirect} style={signupLinkStyle}>Sign Up</button>
          </p>
        </div>
      </div>
    </div>
  );
}

//css
const mainContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: '#f4f4f4', // Light gray background for the whole page
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
};

const logoContainerStyle = {
  display: 'flex',
  alignItems: 'center',
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

const signupPromptStyle = {
  marginTop: '15px',
  fontSize: '14px',
};

const signupLinkStyle = {
  color: '#007bff',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  textDecoration: 'underline',
};

export default SignIn;
