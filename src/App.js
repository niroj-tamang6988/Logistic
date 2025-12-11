import React, { useState, useEffect } from 'react';
import './styles.css';
import Login from './components/Login';
import VendorDashboard from './components/VendorDashboard';
import AdminDashboard from './components/AdminDashboard';
import RiderDashboard from './components/RiderDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [riderProfile, setRiderProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (parsedUser.role === 'rider') {
        fetchRiderProfile(token);
      }
    }
  }, []);

  const fetchRiderProfile = async (token) => {
    try {
      const response = await fetch(`https://logistic-backend-eight.vercel.app/api/rider-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.photo_url) {
        setRiderProfile(data);
      }
    } catch (error) {
      console.error('Error fetching rider profile:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <div style={{ minHeight: '100vh' }} className="animated-card">
      <nav style={{ background: 'linear-gradient(135deg, #343a40 0%, #495057 100%)', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }} className="animated-card mobile-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img 
            src="/logo_rn.jpeg" 
            alt="Logo" 
            style={{ width: '110px', height: '60px', objectFit: 'cover' }}
          />
          
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user.role === 'rider' && riderProfile?.photo_url ? (
              <img 
                src={`https://logistic-backend-eight.vercel.app${riderProfile.photo_url}`} 
                alt="Profile" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }}
              />
            ) : (
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                {user.name?.charAt(0) || 'U'}
              </div>
            )}
            <span style={{ fontSize: '0.9rem' }}>Welcome, {user.name}</span>
          </div>
          <button onClick={logout} style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }} className="animated-button">
            Logout
          </button>
        </div>
      </nav>
      
      {user.role === 'vendor' && <VendorDashboard />}
      {user.role === 'admin' && <AdminDashboard />}
      {user.role === 'rider' && <RiderDashboard />}
    </div>
  );
}

export default App;