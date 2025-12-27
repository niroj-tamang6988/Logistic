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

const AdminDashboard = () => {
  const { showToast, ToastComponent } = useToast();
  const [parcels, setParcels] = useState({});
  const [riders, setRiders] = useState([]);
  const [stats, setStats] = useState([]);
  const [users, setUsers] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const [dailyFinancialData, setDailyFinancialData] = useState([]);
  const [vendorReport, setVendorReport] = useState([]);
  const [riderReports, setRiderReports] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [riderDaybook, setRiderDaybook] = useState([]);
  const [riderDailyStatus, setRiderDailyStatus] = useState([]);
  const [activeTab, setActiveTab] = useState('parcels');
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingParcel, setEditingParcel] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [vendorPaymentSummary, setVendorPaymentSummary] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    vendor_id: '',
    amount: '',
    notes: ''
  });


  useEffect(() => {
    fetchParcels();
    fetchRiders();
    fetchStats();
    fetchUsers();
    fetchFinancialData();
    fetchDailyFinancialData();
    fetchVendorReport();
    fetchRiderReports();
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPaymentHistory();
      fetchVendorPaymentSummary();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        setProfile({ name: user.name, email: user.email || '' });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
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

  const fetchRiders = async () => {
    try {
      const response = await fetch('https://logistic-backend-v3.vercel.app/api/riders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setRiders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching riders:', error);
      setRiders([]);
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

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://logistic-backend-v3.vercel.app/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
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

  const fetchVendorReport = async () => {
    try {
      console.log('Fetching vendor report...');
      const response = await fetch('https://logistic-backend-v3.vercel.app/api/vendor-report', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      console.log('Vendor report data:', data);
      setVendorReport(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching vendor report:', error);
      setVendorReport([]);
    }
  };

  const fetchRiderReports = async () => {
    try {
      const response = await fetch('https://logistic-backend-v3.vercel.app/api/rider-reports', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setRiderReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching rider reports:', error);
      setRiderReports([]);
    }
  };

  const fetchRiderDaybook = async (riderId) => {
    try {
      const response = await fetch(`https://logistic-backend-v3.vercel.app/api/rider-daybook-details/${riderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setRiderDaybook(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching rider daybook:', error);
      setRiderDaybook([]);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch('https://logistic-backend-v3.vercel.app/api/payment-history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setPaymentHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setPaymentHistory([]);
    }
  };

  const fetchVendorPaymentSummary = async () => {
    try {
      const response = await fetch('https://logistic-backend-v3.vercel.app/api/vendor-payment-summary', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      console.log('Vendor payment summary response:', data);
      setVendorPaymentSummary(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching vendor payment summary:', error);
      setVendorPaymentSummary([]);
    }
  };

  const addPayment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://logistic-backend-v3.vercel.app/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentForm)
      });
      
      if (response.ok) {
        setPaymentForm({ vendor_id: '', amount: '', notes: '' });
        setShowPaymentForm(false);
        fetchPaymentHistory();
        fetchVendorPaymentSummary();
        showToast('Payment recorded successfully!');
      } else {
        showToast('Error recording payment', 'error');
      }
    } catch (error) {
      showToast('Error recording payment', 'error');
    }
  };

  const fetchRiderDailyStatus = async (riderId) => {
    try {
      const response = await fetch(`https://logistic-backend-v3.vercel.app/api/rider-daily-status/${riderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setRiderDailyStatus(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching rider daily status:', error);
      setRiderDailyStatus([]);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`https://logistic-backend-v3.vercel.app/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        fetchUsers();
        showToast('User deleted successfully!');
      } else {
        showToast('Error deleting user', 'error');
      }
    } catch (error) {
      showToast('Error deleting user', 'error');
    }
  };

  const approveUser = async (userId) => {
    try {
      const response = await fetch(`https://logistic-backend-v3.vercel.app/api/users/${userId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        fetchUsers();
        showToast('User approved successfully!');
      } else {
        showToast('Error approving user', 'error');
      }
    } catch (error) {
      showToast('Error approving user', 'error');
    }
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



  const assignRider = async (parcelId, riderId) => {
    try {
      const response = await fetch(`https://logistic-backend-v3.vercel.app/api/parcels/${parcelId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rider_id: riderId })
      });
      
      if (response.ok) {
        setEditingParcel(null);
        fetchParcels(searchTerm);
        fetchStats();
        showToast('Parcel updated successfully!');
      } else {
        showToast('Error updating parcel', 'error');
      }
    } catch (error) {
      showToast('Error updating parcel', 'error');
    }
  };

  const getStatCount = (status) => {
    const stat = stats.find(s => s.status === status);
    return stat ? stat.count : 0;
  };

  const styles = {
    container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', minHeight: '100vh' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
    statCard: { background: 'linear-gradient(135deg, #343a40 0%, #495057 100%)', color: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', textAlign: 'center' },
    button: { padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '1rem', marginRight: '1rem' },
    table: { width: '100%', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e9ecef' },
    th: { background: 'linear-gradient(135deg, #343a40 0%, #495057 100%)', color: 'white', padding: '1rem', textAlign: 'left', borderBottom: 'none' },
    td: { padding: '1rem', borderBottom: '1px solid #e9ecef' },
    select: { padding: '0.5rem', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#f8f9fa' }
  };

  return (
    <div style={styles.container}>
      {ToastComponent}
      <h1>Admin Dashboard</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('parcels')} 
          style={{...styles.button, background: activeTab === 'parcels' ? '#007bff' : '#6c757d', marginRight: '1rem'}}
        >
          Parcel Management
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          style={{...styles.button, background: activeTab === 'users' ? '#007bff' : '#6c757d', marginRight: '1rem'}}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('financial')} 
          style={{...styles.button, background: activeTab === 'financial' ? '#007bff' : '#6c757d', marginRight: '1rem'}}
        >
          Financial Reports
        </button>
        <button 
          onClick={() => setActiveTab('vendors')} 
          style={{...styles.button, background: activeTab === 'vendors' ? '#007bff' : '#6c757d', marginRight: '1rem'}}
        >
          Vendor Reports
        </button>
        <button 
          onClick={() => setActiveTab('riderReports')} 
          style={{...styles.button, background: activeTab === 'riderReports' ? '#007bff' : '#6c757d', marginRight: '1rem'}}
        >
          Rider Reports
        </button>

        <button 
          onClick={() => setActiveTab('payments')} 
          style={{...styles.button, background: activeTab === 'payments' ? '#007bff' : '#6c757d', marginRight: '1rem'}}
        >
          Payment History
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          style={{...styles.button, background: activeTab === 'profile' ? '#007bff' : '#6c757d'}}
        >
          My Profile
        </button>
      </div>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3>{getStatCount('pending') + getStatCount('assigned') + getStatCount('delivered') + getStatCount('not_delivered')}</h3>
          <p>Total Parcels</p>
        </div>
        <div style={styles.statCard}>
          <h3>{getStatCount('pending')}</h3>
          <p>Unassigned</p>
        </div>
        <div style={styles.statCard}>
          <h3>{getStatCount('assigned')}</h3>
          <p>Assigned</p>
        </div>
        <div style={styles.statCard}>
          <h3>{getStatCount('delivered')}</h3>
          <p>Delivered</p>
        </div>
      </div>

      {activeTab === 'parcels' && (
      <>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by vendor, recipient, phone, or address..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            fetchParcels(e.target.value);
          }}
          style={{...styles.select, maxWidth: '400px', padding: '0.75rem'}}
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
                <h4 style={{ margin: 0 }}>{formatDateKey(date)}</h4>
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
                    <th style={styles.th}>Vendor</th>
                    <th style={styles.th}>Recipient</th>
                    <th style={styles.th}>Address</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>COD Amount</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Rider</th>
                    <th style={styles.th}>Comment</th>
                    <th style={styles.th}>Action</th>
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
                      <td style={styles.td}>{parcel.vendor_name}</td>
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
                      <td style={styles.td}>
                        {editingParcel === parcel.id ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select 
                              style={styles.select}
                              defaultValue={parcel.assigned_rider_id || ''}
                              onChange={(e) => assignRider(parcel.id, e.target.value)}
                            >
                              <option value="">Unassign</option>
                              {riders.map(rider => (
                                <option key={rider.id} value={rider.id}>{rider.name}</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => setEditingParcel(null)}
                              style={{...styles.select, background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer'}}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {parcel.status === 'pending' && (
                              <select 
                                style={styles.select}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    assignRider(parcel.id, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                              >
                                <option value="">Select Rider</option>
                                {riders.map(rider => (
                                  <option key={rider.id} value={rider.id}>{rider.name}</option>
                                ))}
                              </select>
                            )}
                            {(parcel.status === 'assigned' || parcel.status === 'delivered' || parcel.status === 'not_delivered') && (
                              <button 
                                onClick={() => setEditingParcel(parcel.id)}
                                style={{...styles.select, background: '#007bff', color: 'white', border: 'none', cursor: 'pointer'}}
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )}
                      </td>
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
      
      {activeTab === 'users' && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={styles.td}>{user.id}</td>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: user.role === 'vendor' ? '#d1ecf1' : '#d4edda',
                    color: user.role === 'vendor' ? '#0c5460' : '#155724'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: user.is_approved ? '#d4edda' : '#f8d7da',
                    color: user.is_approved ? '#155724' : '#721c24'
                  }}>
                    {user.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td style={styles.td}>{new Date(user.created_at).toLocaleDateString()}</td>
                <td style={styles.td}>
                  {!user.is_approved && (
                    <button 
                      onClick={() => approveUser(user.id)}
                      style={{...styles.select, background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', marginRight: '0.5rem'}}
                    >
                      Approve
                    </button>
                  )}
                  <button 
                    onClick={() => deleteUser(user.id)}
                    style={{...styles.select, background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer'}}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {activeTab === 'financial' && (
        <div>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3>NPR {formatCurrency(getTotalCOD())}</h3>
              <p>Total System COD</p>
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
              <h3>NPR {formatCurrency(getFinancialData('not_delivered'))}</h3>
              <p>Failed Delivery COD</p>
            </div>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Total Parcels</th>
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
                                item.status === 'not_delivered' ? '#f8d7da' : '#fff3cd',
                      color: item.status === 'delivered' ? '#155724' : 
                             item.status === 'not_delivered' ? '#721c24' : '#856404'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={styles.td}>{item.count}</td>
                  <td style={styles.td}>NPR {formatCurrency(item.total_cod || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Daily COD Report - Vendor & Status Wise</h3>
          <div>
            {Object.entries(
              dailyFinancialData.reduce((acc, item) => {
                const date = item.date || 'No Date';
                if (!acc[date]) acc[date] = [];
                acc[date].push(item);
                return acc;
              }, {})
            ).map(([date, vendors]) => {
              const dateTotal = vendors.reduce((sum, v) => sum + parseFloat(v.total_cod || 0), 0);
              const parcelTotal = vendors.reduce((sum, v) => sum + parseInt(v.count || 0), 0);
              return (
                <div key={date} style={{ marginBottom: '2rem' }}>
                  <div style={{ background: '#343a40', color: 'white', padding: '1rem', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between' }}>
                    <h4>{date !== 'No Date' ? new Date(date).toLocaleDateString() : 'No Date'}</h4>
                    <div>
                      <span style={{ marginRight: '2rem' }}>Total Parcels: {parcelTotal}</span>
                      <span>Total COD: NPR {formatCurrency(dateTotal)}</span>
                    </div>
                  </div>
                  <table style={{...styles.table, marginTop: 0, borderRadius: '0 0 8px 8px'}}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Vendor</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Parcels</th>
                        <th style={styles.th}>COD Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.map((item, index) => (
                        <tr key={index}>
                          <td style={styles.td}>{item.vendor_name}</td>
                          <td style={styles.td}>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              background: item.status === 'delivered' ? '#d4edda' : 
                                        item.status === 'not_delivered' ? '#f8d7da' : '#fff3cd',
                              color: item.status === 'delivered' ? '#155724' : 
                                     item.status === 'not_delivered' ? '#721c24' : '#856404'
                            }}>
                              {item.status}
                            </span>
                          </td>
                          <td style={styles.td}>{item.count}</td>
                          <td style={styles.td}>NPR {formatCurrency(item.total_cod || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {activeTab === 'vendors' && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Date-wise Vendor Reports</h3>
          {Object.entries(
            vendorReport.reduce((acc, item) => {
              const date = item.date || 'No Date';
              if (!acc[date]) acc[date] = [];
              acc[date].push(item);
              return acc;
            }, {})
          ).map(([date, vendors]) => {
            const dateTotal = vendors.reduce((sum, v) => sum + parseFloat(v.total_cod || 0), 0);
            const parcelTotal = vendors.reduce((sum, v) => sum + parseInt(v.total_parcels || 0), 0);
            return (
              <div key={date} style={{ marginBottom: '2rem' }}>
                <div style={{ background: '#343a40', color: 'white', padding: '1rem', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between' }}>
                  <h4>{date !== 'No Date' ? new Date(date).toLocaleDateString() : 'No Date'}</h4>
                  <div>
                    <span style={{ marginRight: '2rem' }}>Total Parcels: {parcelTotal}</span>
                    <span>Total COD: NPR {formatCurrency(dateTotal)}</span>
                  </div>
                </div>
                <table style={{...styles.table, marginTop: 0, borderRadius: '0 0 8px 8px'}}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Vendor Name</th>
                      <th style={styles.th}>Parcels</th>
                      <th style={styles.th}>COD Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((vendor, index) => (
                      <tr key={index}>
                        <td style={styles.td}>{vendor.vendor_name}</td>
                        <td style={styles.td}>{vendor.total_parcels}</td>
                        <td style={styles.td}>NPR {formatCurrency(vendor.total_cod)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
      

      
      {activeTab === 'riderReports' && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Rider Reports & Details</h3>
          
          {riderReports.map(rider => (
            <div key={rider.id} style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4>{rider.rider_name}</h4>
                <button 
                  onClick={() => {
                    if (selectedRider === rider.id) {
                      setSelectedRider(null);
                      setRiderDaybook([]);
                      setRiderDailyStatus([]);
                    } else {
                      setSelectedRider(rider.id);
                      fetchRiderDaybook(rider.id);
                      fetchRiderDailyStatus(rider.id);
                    }
                  }}
                  style={{...styles.button, background: selectedRider === rider.id ? '#dc3545' : '#007bff', padding: '0.5rem 1rem'}}
                >
                  {selectedRider === rider.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <strong>Email:</strong> {rider.email}
                </div>
                <div>
                  <strong>Citizenship:</strong> {rider.citizenship_no || 'Not provided'}
                </div>
                <div>
                  <strong>Bike No:</strong> {rider.bike_no || 'Not provided'}
                </div>
                <div>
                  <strong>License:</strong> {rider.license_no || 'Not provided'}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
                  <strong style={{ fontSize: '1.2rem', color: '#007bff' }}>{formatCurrency(rider.total_km)} KM</strong>
                  <div>Total Distance</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
                  <strong style={{ fontSize: '1.2rem', color: '#28a745' }}>{rider.total_parcels}</strong>
                  <div>Total Parcels</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
                  <strong style={{ fontSize: '1.2rem', color: '#6c757d' }}>{rider.working_days}</strong>
                  <div>Working Days</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
                  <strong style={{ fontSize: '1.2rem', color: '#17a2b8' }}>NPR {formatCurrency(rider.total_cod)}</strong>
                  <div>Total COD</div>
                </div>
              </div>
              
              <div style={{ marginTop: '1rem' }}>
                <h5>Delivery Status Breakdown</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '4px', border: '1px solid #c3e6cb' }}>
                    <div style={{ fontWeight: 'bold', color: '#155724' }}>Delivered</div>
                    <div>{rider.delivered_parcels} parcels</div>
                    <div>NPR {formatCurrency(rider.delivered_cod)}</div>
                  </div>
                  <div style={{ padding: '1rem', background: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
                    <div style={{ fontWeight: 'bold', color: '#856404' }}>In Progress</div>
                    <div>{rider.assigned_parcels} parcels</div>
                    <div>NPR {formatCurrency(rider.assigned_cod)}</div>
                  </div>
                  <div style={{ padding: '1rem', background: '#f8d7da', borderRadius: '4px', border: '1px solid #f5c6cb' }}>
                    <div style={{ fontWeight: 'bold', color: '#721c24' }}>Not Delivered</div>
                    <div>{rider.not_delivered_parcels} parcels</div>
                    <div>NPR {formatCurrency(rider.not_delivered_cod)}</div>
                  </div>
                </div>
              </div>
              
              {selectedRider === rider.id && (
                <div style={{ marginTop: '2rem' }}>
                  <h5>Daily Status Breakdown</h5>
                  <div>
                    {Object.entries(
                      riderDailyStatus.reduce((acc, item) => {
                        const date = item.date || 'No Date';
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(item);
                        return acc;
                      }, {})
                    ).map(([date, statuses]) => {
                      const dateTotal = statuses.reduce((sum, s) => sum + parseFloat(s.total_cod || 0), 0);
                      const parcelTotal = statuses.reduce((sum, s) => sum + parseInt(s.count || 0), 0);
                      return (
                        <div key={date} style={{ marginBottom: '1rem' }}>
                          <div style={{ background: '#495057', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{date !== 'No Date' ? new Date(date).toLocaleDateString() : 'No Date'}</span>
                            <span>{parcelTotal} parcels, NPR {formatCurrency(dateTotal)}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', padding: '0.5rem', background: '#f8f9fa', borderRadius: '0 0 4px 4px' }}>
                            {statuses.map((status, index) => (
                              <div key={index} style={{ 
                                padding: '0.5rem', 
                                borderRadius: '4px',
                                background: status.status === 'delivered' ? '#d4edda' : 
                                          status.status === 'not_delivered' ? '#f8d7da' : '#fff3cd',
                                color: status.status === 'delivered' ? '#155724' : 
                                       status.status === 'not_delivered' ? '#721c24' : '#856404',
                                textAlign: 'center',
                                fontSize: '0.9rem'
                              }}>
                                <div style={{ fontWeight: 'bold' }}>{status.status}</div>
                                <div>{status.count} parcels</div>
                                <div>NPR {formatCurrency(status.total_cod)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <h5 style={{ marginTop: '2rem' }}>Daily Entries</h5>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>KM</th>
                        <th style={styles.th}>Parcels</th>
                        <th style={styles.th}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {riderDaybook.map((entry, index) => (
                        <tr key={index}>
                          <td style={styles.td}>{new Date(entry.date).toLocaleDateString()}</td>
                          <td style={styles.td}>{formatCurrency(entry.total_km)} KM</td>
                          <td style={styles.td}>{entry.parcels_delivered}</td>
                          <td style={styles.td}>NPR {formatCurrency(entry.fuel_cost)}</td>
                          <td style={styles.td}>{entry.notes || '-'}</td>
                        </tr>
                      ))}
                      {riderDaybook.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{...styles.td, textAlign: 'center', color: '#6c757d'}}>
                            No daybook entries found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
          
          {riderReports.length === 0 && (
            <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
              No rider data found.
            </div>
          )}
        </div>
      )}
      

      
      {activeTab === 'payments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3>Payment Management</h3>
            <button 
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              style={{...styles.button, background: '#28a745'}}
            >
              {showPaymentForm ? 'Cancel' : 'Add Payment'}
            </button>
          </div>
          
          {showPaymentForm && (
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
              <h4>Record Payment</h4>
              <form onSubmit={addPayment} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <select
                  value={paymentForm.vendor_id}
                  onChange={(e) => setPaymentForm({...paymentForm, vendor_id: e.target.value})}
                  style={styles.select}
                  required
                >
                  <option value="">Select Vendor</option>
                  {users.filter(u => u.role === 'vendor').map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
                
                <input
                  type="number"
                  step="0.01"
                  placeholder="Payment Amount (NPR)"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  style={styles.select}
                  required
                />
                
                <textarea
                  placeholder="Notes (optional)"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  style={{...styles.select, gridColumn: 'span 2', minHeight: '60px'}}
                />
                
                <button type="submit" style={{...styles.button, background: '#28a745'}}>
                  Record Payment
                </button>
              </form>
            </div>
          )}
          
          <h4>Vendor Payment Summary</h4>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Vendor</th>
                <th style={styles.th}>Total Parcels</th>
                <th style={styles.th}>Total Delivered</th>
                <th style={styles.th}>Total Paid</th>
                <th style={styles.th}>Pending Amount</th>
              </tr>
            </thead>
            <tbody>
              {vendorPaymentSummary.map(vendor => (
                <tr key={vendor.vendor_id}>
                  <td style={styles.td}>{vendor.vendor_name}</td>
                  <td style={styles.td}>{vendor.total_parcels || 0}</td>
                  <td style={styles.td}>NPR {formatCurrency(vendor.total_delivered_amount)}</td>
                  <td style={styles.td}>NPR {formatCurrency(vendor.total_paid_amount)}</td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: parseFloat(vendor.pending_amount) > 0 ? '#f8d7da' : '#d4edda',
                      color: parseFloat(vendor.pending_amount) > 0 ? '#721c24' : '#155724'
                    }}>
                      NPR {formatCurrency(vendor.pending_amount)}
                    </span>
                  </td>
                </tr>
              ))}
              {vendorPaymentSummary.length === 0 && (
                <tr>
                  <td colSpan="5" style={{...styles.td, textAlign: 'center', color: '#6c757d'}}>
                    No vendor data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <h4 style={{ marginTop: '2rem' }}>Payment History</h4>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Vendor</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map(payment => (
                <tr key={payment.id}>
                  <td style={styles.td}>{new Date(payment.created_at).toLocaleDateString()}</td>
                  <td style={styles.td}>{payment.vendor_name}</td>
                  <td style={styles.td}>NPR {formatCurrency(payment.amount)}</td>
                  <td style={styles.td}>{payment.notes || '-'}</td>
                </tr>
              ))}
              {paymentHistory.length === 0 && (
                <tr>
                  <td colSpan="4" style={{...styles.td, textAlign: 'center', color: '#6c757d'}}>
                    No payment history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {activeTab === 'profile' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3>My Profile</h3>
            <button 
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              style={{...styles.button, background: '#007bff'}}
            >
              {isEditingProfile ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
          
          {!isEditingProfile ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <strong>Name:</strong>
                <div style={{ padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px', marginTop: '0.25rem' }}>
                  {profile.name}
                </div>
              </div>
              <div>
                <strong>Email:</strong>
                <div style={{ padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px', marginTop: '0.25rem' }}>
                  {profile.email || 'Not provided'}
                </div>
              </div>
              <div>
                <strong>Role:</strong>
                <div style={{ padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px', marginTop: '0.25rem' }}>
                  Administrator
                </div>
              </div>
              <div>
                <strong>System Access:</strong>
                <div style={{ padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px', marginTop: '0.25rem' }}>
                  Full Access
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setIsEditingProfile(false); showToast('Profile updated!'); }} style={{ maxWidth: '500px' }}>
              <input
                type="text"
                placeholder="Name"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                style={{...styles.select, width: '100%', padding: '0.75rem', margin: '0.5rem 0'}}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                style={{...styles.select, width: '100%', padding: '0.75rem', margin: '0.5rem 0'}}
              />
              <button type="submit" style={{...styles.button, background: '#28a745'}}>
                Save Changes
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;