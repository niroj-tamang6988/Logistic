import React, { useState } from 'react';

const Login = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'vendor'
  });
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? 'https://logistic-backend-eight.vercel.app/api/login' : 'https://logistic-backend-eight.vercel.app/api/register';
      const data = isLogin ? { email: formData.email, password: formData.password } : formData;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          setUser(result.user);
        } else {
          alert('Registration successful! Please login.');
          setIsLogin(true);
        }
      } else {
        alert(result.message || 'An error occurred');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', padding: '1rem' },
    form: { background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', width: '100%', maxWidth: '400px', border: '1px solid #e9ecef' },
    input: { width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#f8f9fa', fontSize: '1rem' },
    button: { width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #343a40 0%, #495057 100%)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' },
    link: { color: '#495057', cursor: 'pointer', textDecoration: 'underline' }
  };

  return (
    <div style={styles.container} className="animated-card">
      <form onSubmit={handleSubmit} style={styles.form} className="animated-form mobile-form">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img 
            src="/logo_rn.jpeg" 
            alt="Logo" 
            style={{ width: '200px', height: '110px', objectFit: 'cover', marginBottom: '1rem' }}
          />
          
          <p style={{ margin: '0.5rem 0 0 0', color: '#6c757d', fontSize: '0.9rem' }}>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>
        
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={styles.input}
            required
          />
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          style={styles.input}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => {
            const password = e.target.value;
            setFormData({...formData, password});
            if (!isLogin) {
              setPasswordValidation({
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /\d/.test(password),
                special: /[@#$%^&*!]/.test(password)
              });
            }
          }}
          style={styles.input}
          required
        />
        
        {!isLogin && formData.password && (
          <div style={{ margin: '0.5rem 0', fontSize: '0.85rem' }}>
            <div style={{ color: passwordValidation.length ? '#28a745' : '#dc3545' }}>
              ✓ At least 8 characters
            </div>
            <div style={{ color: passwordValidation.uppercase ? '#28a745' : '#dc3545' }}>
              ✓ One uppercase letter
            </div>
            <div style={{ color: passwordValidation.lowercase ? '#28a745' : '#dc3545' }}>
              ✓ One lowercase letter
            </div>
            <div style={{ color: passwordValidation.number ? '#28a745' : '#dc3545' }}>
              ✓ One number
            </div>
            <div style={{ color: passwordValidation.special ? '#28a745' : '#dc3545' }}>
              ✓ One special character (@, #, $, %, ^, &, *, !)
            </div>
          </div>
        )}
        
        {!isLogin && (
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            style={styles.input}
          >
            <option value="vendor">Vendor</option>
            <option value="rider">Rider</option>
          </select>
        )}
        
        <button type="submit" style={styles.button} className="animated-button mobile-button">
          {isLogin ? 'Login' : 'Register'}
        </button>
        
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} style={styles.link}>
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;