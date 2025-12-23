import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';

// Convert date key (YYYY-MM-DD) to readable format
const formatDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Proper Nepali date converter
const toNepaliDate = (adDate) => {
  try {
    const date = new Date(adDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Basic conversion: Add 56-57 years to get BS year
    let bsYear = year + 56;
    if (month >= 4) bsYear += 1; // After April, add extra year
    
    // Month conversion (approximate)
    let bsMonth = month + 8;
    if (bsMonth > 12) bsMonth -= 12;
    
    // Day adjustment
    let bsDay = day;
    if (bsDay > 30) bsDay = 30; // Most BS months have 30 days
    
    return `${bsYear}/${String(bsMonth).padStart(2, '0')}/${String(bsDay).padStart(2, '0')}`;
  } catch (error) {
    return 'N/A';
  }
};

const VendorDashboard = () => {
  const { showToast, ToastComponent } = useToast();
  const [parcels, setParcels] = useState([]);
  const [stats, setStats] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const [dailyFinancialData, setDailyFinancialData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('parcels');
  const [formData, setFormData] = useState({
    recipient_name: '',
    recipient_address: '',
    recipient_phone: '',
    cod_amount: ''
  });
  const [searchTerm, setSearchTerm] = useState('');



  useEffect(() => {
    fetchParcels();
    fetchStats();
    fetchFinancialData();
    fetchDailyFinancialData();

  }, [activeTab]);

  useEffect(() => {
    fetchParcels();
    fetchStats();
    fetchFinancialData();
    fetchDailyFinancialData();
  }, []);

  // Update stats calculation for grouped data
  const getAllParcels = () => {
    return Object.values(parcels).flat();
  };





  const fetchParcels = async (search = '') => {
    try {
      const url = search ? 
        `https://logistic-backend-v3.vercel.app/api/parcels?search=${encodeURIComponent(search)}` :
        'https://logistic-backend-v3.vercel.app/api/parcels';
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setParcels(data || {});
    } catch (error) {
      console.error('Error fetching parcels:', error);
      setParcels({});
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('https://logistic-backend-v3.vercel.app/api/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStats(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats([]);
    }
  };

  const fetchFinancialData = async () => {
    try {
      const response = await fetch('https://logistic-backend-v3.vercel.app/api/financial-report', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setFinancialData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setFinancialData([]);
    }
  };

  const fetchDailyFinancialData = async () => {
    try {
      const response = await fetch('https://logistic-backend-v3.vercel.app/api/financial-report-daily', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setDailyFinancialData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching daily financial data:', error);
      setDailyFinancialData([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://logistic-backend-v3.vercel.app/api/parcels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setFormData({ recipient_name: '', recipient_address: '', recipient_phone: '', cod_amount: '' });
        setShowForm(false);
        fetchParcels();
        fetchStats();
        fetchFinancialData();
        fetchDailyFinancialData();
        showToast('Parcel placed successfully!');
      } else {
        showToast('Error placing parcel', 'error');
      }
    } catch (error) {
      showToast('Error placing parcel', 'error');
    }
  };

  const getStatCount = (status) => {
    const stat = stats.find(s => s.status === status);
    return stat ? stat.count : 0;
  };

  const getFinancialData = (status) => {
    const data = financialData.find(f => f.status === status);
    return data ? parseFloat(data.total_cod || 0) : 0;
  };

  const getTotalCOD = () => {
    return financialData.reduce((total, item) => total + parseFloat(item.total_cod || 0), 0);
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  };

  const styles = {
    container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', minHeight: '100vh' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
    statCard: { background: 'linear-gradient(135deg, #343a40 0%, #495057 100%)', color: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', textAlign: 'center' },
    button: { padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '1rem', marginRight: '1rem' },
    form: { background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '2rem', border: '1px solid #e9ecef' },
    input: { width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#f8f9fa' },
    table: { width: '100%', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e9ecef' },
    th: { background: 'linear-gradient(135deg, #343a40 0%, #495057 100%)', color: 'white', padding: '1rem', textAlign: 'left', borderBottom: 'none' },
    td: { padding: '1rem', borderBottom: '1px solid #e9ecef' }
  };

  return (
    <div style={styles.container} className="mobile-container">
      {ToastComponent}
      <h1> Dashboard</h1>
      
      <div style={{ marginBottom: '2rem' }} className="mobile-tabs">
        <button 
          onClick={() => setActiveTab('parcels')} 
          style={{...styles.button, background: activeTab === 'parcels' ? '#007bff' : '#6c757d', marginRight: '1rem'}}
        >
          Parcel Management
        </button>
        <button 
          onClick={() => setActiveTab('financial')} 
          style={{...styles.button, background: activeTab === 'financial' ? '#007bff' : '#6c757d'}}
        >
          Financial Reports
        </button>
      </div>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3>{getStatCount('placed') + getStatCount('assigned') + getStatCount('delivered') + getStatCount('not_delivered')}</h3>
          <p>Total Parcels</p>
        </div>
        <div style={styles.statCard}>
          <h3>{getStatCount('delivered')}</h3>
          <p>Delivered</p>
        </div>
        <div style={styles.statCard}>
          <h3>{getStatCount('not_delivered')}</h3>
          <p>Not Delivered</p>
        </div>
        <div style={styles.statCard}>
          <h3>{getStatCount('placed') + getStatCount('assigned')}</h3>
          <p>In Progress</p>
        </div>
      </div>

      {activeTab === 'parcels' && (
      <>
      <button onClick={() => setShowForm(!showForm)} style={styles.button} className="animated-button mobile-button">
        {showForm ? 'Cancel' : 'Place New Parcel'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form} className="animated-form mobile-form">
          <h3>Place New Parcel</h3>
          <input
            type="text"
            placeholder="Recipient Name"
            value={formData.recipient_name}
            onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
            style={styles.input}
            required
          />
          <textarea
            placeholder="Recipient Address"
            value={formData.recipient_address}
            onChange={(e) => setFormData({...formData, recipient_address: e.target.value})}
            style={{...styles.input, minHeight: '80px'}}
            required
          />
          <input
            type="tel"
            placeholder="Recipient Phone"
            value={formData.recipient_phone}
            onChange={(e) => setFormData({...formData, recipient_phone: e.target.value})}
            style={styles.input}
            required
          />
          <input
            type="number"
            placeholder="COD Amount (NPR)"
            value={formData.cod_amount}
            onChange={(e) => setFormData({...formData, cod_amount: e.target.value})}
            style={styles.input}
            min="0"
            step="0.01"
          />
          <button type="submit" style={styles.button} className="animated-button mobile-button">Place Parcel</button>
        </form>
      )}

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by recipient name, phone, or address..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            fetchParcels(e.target.value);
          }}
          style={{...styles.input, marginBottom: 0, maxWidth: '400px'}}
        />
        {searchTerm && (
          <button 
            onClick={() => {
              setSearchTerm('');
              fetchParcels();
            }}
            style={{...styles.button, background: '#dc3545'}}
          >
            Clear
          </button>
        )}
      </div>

      {Object.keys(parcels).length === 0 ? (
        <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
          No parcels found.
        </div>
      ) : (
        Object.entries(parcels).map(([date, dateParcels]) => {
          const parcelCount = dateParcels.length;
          const totalCOD = dateParcels.reduce((sum, p) => sum + parseFloat(p.cod_amount || 0), 0);
          
          return (
            <div key={date} style={{ marginBottom: '2rem' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #343a40 0%, #495057 100%)', 
                color: 'white', 
                padding: '1rem', 
                borderRadius: '8px 8px 0 0', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h4 style={{ margin: 0 }}>{toNepaliDate(dateParcels[0].created_at)} ({formatDateKey(date)})</h4>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <span>Parcels: {parcelCount}</span>
                  <span>Total COD: NPR {formatCurrency(totalCOD)}</span>
                </div>
              </div>
              
              <table style={{...styles.table, marginTop: 0, borderRadius: '0 0 8px 8px'}}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}>Recipient</th>
                    <th style={styles.th}>Address</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>COD Amount</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Rider</th>
                    <th style={styles.th}>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {dateParcels.map(parcel => (
                    <tr key={parcel.id}>
                      <td style={styles.td}>{parcel.id}</td>
                      <td style={styles.td}>
                        {new Date(parcel.created_at).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </td>
                      <td style={styles.td}>{parcel.recipient_name}</td>
                      <td style={styles.td}>{parcel.address}</td>
                      <td style={styles.td}>{parcel.recipient_phone}</td>
                      <td style={styles.td}>NPR {formatCurrency(parcel.cod_amount)}</td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          background: parcel.status === 'delivered' ? '#d4edda' : 
                                    parcel.status === 'not_delivered' ? '#f8d7da' : '#fff3cd',
                          color: parcel.status === 'delivered' ? '#155724' : 
                                 parcel.status === 'not_delivered' ? '#721c24' : '#856404'
                        }}>
                          {parcel.status}
                        </span>
                      </td>
                      <td style={styles.td}>{parcel.rider_name || 'Not assigned'}</td>
                      <td style={styles.td}>{parcel.rider_comment || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
      </>
      )}
      
      {activeTab === 'financial' && (
        <div>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3>NPR {formatCurrency(getTotalCOD())}</h3>
              <p>Total COD Amount</p>
            </div>
            <div style={styles.statCard}>
              <h3>NPR {formatCurrency(getFinancialData('delivered'))}</h3>
              <p>Delivered COD</p>
            </div>
            <div style={styles.statCard}>
              <h3>NPR {formatCurrency(getFinancialData('pending') + getFinancialData('assigned'))}</h3>
              <p>Pending COD</p>
            </div>
            <div style={styles.statCard}>
              <h3>NPR {formatCurrency(getFinancialData('not delivered'))}</h3>
              <p>Failed Delivery COD</p>
            </div>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Parcel Count</th>
                <th style={styles.th}>Total COD Amount</th>
              </tr>
            </thead>
            <tbody>
              {financialData.map(item => (
                <tr key={item.status}>
                  <td style={styles.td}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: item.status === 'delivered' ? '#d4edda' : 
                                item.status === 'not delivered' ? '#f8d7da' : '#fff3cd',
                      color: item.status === 'delivered' ? '#155724' : 
                             item.status === 'not delivered' ? '#721c24' : '#856404'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={styles.td}>{item.count}</td>
                  <td style={styles.td}>NPR {item.total_cod || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Daily COD Report</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Parcel Count</th>
                <th style={styles.th}>COD Amount</th>
              </tr>
            </thead>
            <tbody>
              {dailyFinancialData.map((item, index) => (
                <tr key={index}>
                  <td style={styles.td}>{toNepaliDate(item.date)}</td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: item.status === 'delivered' ? '#d4edda' : 
                                item.status === 'not delivered' ? '#f8d7da' : '#fff3cd',
                      color: item.status === 'delivered' ? '#155724' : 
                             item.status === 'not delivered' ? '#721c24' : '#856404'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={styles.td}>{item.count}</td>
                  <td style={styles.td}>NPR {item.total_cod || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;