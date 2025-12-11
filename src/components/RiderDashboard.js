import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';

// Simple Nepali date converter
const toNepaliDate = (adDate) => {
  try {
    const date = new Date(adDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Convert to Bikram Sambat (approximate)
    const bsYear = year + 56;
    let bsMonth = month + 8;
    
    if (bsMonth > 12) {
      bsMonth -= 12;
    }
    
    return `${bsYear}/${String(bsMonth).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
  } catch (error) {
    return 'N/A';
  }
};

const RiderDashboard = () => {
  const { showToast, ToastComponent } = useToast();
  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  };
  const [parcels, setParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState('delivered');
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('parcels');
  const [profile, setProfile] = useState({
    citizenship_no: '',
    bike_no: '',
    license_no: '',
    photo_url: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [daybook, setDaybook] = useState([]);
  const [daybookSummary, setDaybookSummary] = useState({});
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    total_km: '',
    parcels_delivered: '',
    fuel_cost: '',
    notes: ''
  });
  const [editingEntry, setEditingEntry] = useState(null);
  const [daybookView, setDaybookView] = useState('daily');

  useEffect(() => {
    fetchParcels();
    fetchProfile();
    if (activeTab === 'daybook') {
      fetchDaybook();
      fetchDaybookSummary();
      fetchMonthlyReport();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchParcels();
    fetchProfile();
  }, []);

  const fetchParcels = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/parcels', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setParcels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching parcels:', error);
      setParcels([]);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/rider-profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.citizenship_no) {
        setProfile(data);
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setIsEditing(true);
    }
  };

  const fetchDaybook = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/rider-daybook', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setDaybook(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching daybook:', error);
      setDaybook([]);
    }
  };

  const fetchDaybookSummary = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/rider-daybook-summary', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setDaybookSummary(data);
    } catch (error) {
      console.error('Error fetching daybook summary:', error);
      setDaybookSummary({});
    }
  };

  const fetchMonthlyReport = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/rider-daybook-monthly', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setMonthlyReport(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      setMonthlyReport([]);
    }
  };

  const toNepaliMonth = (year, month) => {
    const bsYear = year + 56;
    let bsMonth = month + 8;
    if (bsMonth > 12) {
      bsMonth -= 12;
    }
    const nepaliMonths = ['बैशाख', 'जेठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन', 'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'];
    return `${nepaliMonths[bsMonth - 1]} ${bsYear}`;
  };

  const saveDaybookEntry = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/rider-daybook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newEntry)
      });
      
      if (response.ok) {
        setNewEntry({
          date: new Date().toISOString().split('T')[0],
          total_km: '',
          parcels_delivered: '',
          fuel_cost: '',
          notes: ''
        });
        setEditingEntry(null);
        fetchDaybook();
        fetchDaybookSummary();
        fetchMonthlyReport();
        showToast('Daybook entry saved successfully!');
      } else {
        showToast('Error saving daybook entry', 'error');
      }
    } catch (error) {
      showToast('Error saving daybook entry', 'error');
    }
  };

  const editDaybookEntry = (entry) => {
    setNewEntry({
      date: entry.date,
      total_km: entry.total_km,
      parcels_delivered: entry.parcels_delivered,
      fuel_cost: entry.fuel_cost,
      notes: entry.notes || ''
    });
    setEditingEntry(entry.id);
  };

  const uploadPhoto = async () => {
    if (!selectedFile) return null;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('photo', selectedFile);
    
    try {
      const response = await fetch('http://localhost:5001/api/upload-photo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.photo_url;
      } else {
        showToast('Error uploading photo', 'error');
        return null;
      }
    } catch (error) {
      showToast('Error uploading photo', 'error');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    
    let profileData = { ...profile };
    
    // Upload photo if selected
    if (selectedFile) {
      const photoUrl = await uploadPhoto();
      if (photoUrl) {
        profileData.photo_url = photoUrl;
      } else {
        return; // Stop if photo upload failed
      }
    }
    
    try {
      const response = await fetch('http://localhost:5001/api/rider-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (response.ok) {
        setProfile(profileData);
        setSelectedFile(null);
        setIsEditing(false);
        showToast('Profile saved successfully!');
      } else {
        showToast('Error saving profile', 'error');
      }
    } catch (error) {
      showToast('Error saving profile', 'error');
    }
  };

  const updateDeliveryStatus = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5001/api/parcels/${selectedParcel.id}/delivery`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: deliveryStatus,
          delivery_comment: comment
        })
      });
      
      if (response.ok) {
        setSelectedParcel(null);
        setComment('');
        setDeliveryStatus('delivered');
        fetchParcels();
        showToast('Delivery status updated successfully!');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Error updating delivery status', 'error');
      }
    } catch (error) {
      console.error('Update error:', error);
      showToast('Network error updating delivery status', 'error');
    }
  };

  const styles = {
    container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
    statCard: { background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' },
    table: { width: '100%', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    th: { background: '#f8f9fa', padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' },
    td: { padding: '1rem', borderBottom: '1px solid #eee' },
    button: { padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', minHeight: '100vh' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
    statCard: { background: 'linear-gradient(135deg, #343a40 0%, #495057 100%)', color: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', textAlign: 'center' },
    table: { width: '100%', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e9ecef' },
    th: { background: 'linear-gradient(135deg, #343a40 0%, #495057 100%)', color: 'white', padding: '1rem', textAlign: 'left', borderBottom: 'none' },
    td: { padding: '1rem', borderBottom: '1px solid #e9ecef' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '2rem', borderRadius: '8px', width: '500px', maxWidth: '90vw' },
    input: { width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#f8f9fa' },
    textarea: { width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #ced4da', borderRadius: '4px', minHeight: '100px', backgroundColor: '#f8f9fa' }
  };

  const assignedParcels = parcels.filter(p => p.status === 'assigned');
  const deliveredParcels = parcels.filter(p => p.status === 'delivered');
  const notDeliveredParcels = parcels.filter(p => p.status === 'not_delivered');

  return (
    <div style={styles.container}>
      {ToastComponent}
      <h1>Rider Dashboard</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('parcels')} 
          style={{...styles.button, background: activeTab === 'parcels' ? '#007bff' : '#6c757d', marginRight: '1rem'}}
        >
          My Parcels
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          style={{...styles.button, background: activeTab === 'profile' ? '#007bff' : '#6c757d', marginRight: '1rem'}}
        >
          My Profile
        </button>
        <button 
          onClick={() => setActiveTab('daybook')} 
          style={{...styles.button, background: activeTab === 'daybook' ? '#007bff' : '#6c757d'}}
        >
          Day Book
        </button>
      </div>
      
      {activeTab === 'parcels' && (
      <>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3>{parcels.length}</h3>
          <p>Total Assigned</p>
        </div>
        <div style={styles.statCard}>
          <h3>{assignedParcels.length}</h3>
          <p>Pending Delivery</p>
        </div>
        <div style={styles.statCard}>
          <h3>{deliveredParcels.length}</h3>
          <p>Delivered</p>
        </div>
        <div style={styles.statCard}>
          <h3>{notDeliveredParcels.length}</h3>
          <p>Not Delivered</p>
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Vendor</th>
            <th style={styles.th}>Recipient</th>
            <th style={styles.th}>Address</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>COD Amount</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Comment</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {parcels.map(parcel => (
            <tr key={parcel.id}>
              <td style={styles.td}>{parcel.id}</td>
              <td style={styles.td}>{toNepaliDate(parcel.created_at)}</td>
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
              <td style={styles.td}>{parcel.rider_comment || '-'}</td>
              <td style={styles.td}>
                {(parcel.status === 'assigned' || parcel.status === 'delivered' || parcel.status === 'not_delivered') && (
                  <button 
                    onClick={() => {
                      setSelectedParcel(parcel);
                      setDeliveryStatus(parcel.status);
                      setComment(parcel.rider_comment || '');
                    }}
                    style={styles.button}
                  >
                    {parcel.status === 'assigned' ? 'Update Status' : 'Edit Status'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedParcel && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Update Delivery Status</h3>
            <p><strong>Parcel ID:</strong> {selectedParcel.id}</p>
            <p><strong>Recipient:</strong> {selectedParcel.recipient_name}</p>
            
            <form onSubmit={updateDeliveryStatus}>
              <label>
                <strong>Delivery Status:</strong>
                <select 
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value)}
                  style={styles.input}
                >
                  <option value="delivered">Delivered</option>
                  <option value="not_delivered">Not Delivered</option>
                </select>
              </label>
              
              <label>
                <strong>Comment:</strong>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={deliveryStatus === 'delivered' ? 'Optional delivery notes...' : 'Please explain why delivery failed...'}
                  style={styles.textarea}
                  required={deliveryStatus === 'not_delivered'}
                />
              </label>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" style={{...styles.button, background: '#28a745'}}>
                  Update Status
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setSelectedParcel(null);
                    setComment('');
                    setDeliveryStatus('delivered');
                  }}
                  style={{...styles.button, background: '#6c757d'}}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
      )}
      
      {activeTab === 'profile' && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3>My Profile</h3>
            {!isEditing && profile.citizenship_no && (
              <button 
                onClick={() => setIsEditing(true)}
                style={{...styles.button, background: '#007bff'}}
              >
                Edit Profile
              </button>
            )}
          </div>
          
          {!isEditing && profile.citizenship_no ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Citizenship Number:</strong>
                    <div style={{ padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px', marginTop: '0.25rem' }}>
                      {profile.citizenship_no}
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Bike Number:</strong>
                    <div style={{ padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px', marginTop: '0.25rem' }}>
                      {profile.bike_no}
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>License Number:</strong>
                    <div style={{ padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px', marginTop: '0.25rem' }}>
                      {profile.license_no}
                    </div>
                  </div>
                </div>
                <div>
                  <strong>Profile Photo:</strong>
                  <div style={{ marginTop: '0.5rem' }}>
                    {profile.photo_url ? (
                      <img 
                        src={`http://localhost:5001${profile.photo_url}`} 
                        alt="Profile" 
                        style={{ width: '150px', height: '150px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #ddd' }}
                      />
                    ) : (
                      <div style={{ width: '150px', height: '150px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #ddd' }}>
                        No Photo
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={saveProfile}>
              <input
                type="text"
                placeholder="Citizenship Number"
                value={profile.citizenship_no}
                onChange={(e) => setProfile({...profile, citizenship_no: e.target.value})}
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Bike Number"
                value={profile.bike_no}
                onChange={(e) => setProfile({...profile, bike_no: e.target.value})}
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="License Number"
                value={profile.license_no}
                onChange={(e) => setProfile({...profile, license_no: e.target.value})}
                style={styles.input}
                required
              />
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Profile Photo:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={styles.input}
                />
                {profile.photo_url && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img 
                      src={`http://localhost:5001${profile.photo_url}`} 
                      alt="Current profile" 
                      style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="submit" 
                  style={{...styles.button, background: '#28a745'}} 
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Save Profile'}
                </button>
                {profile.citizenship_no && (
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedFile(null);
                    }}
                    style={{...styles.button, background: '#6c757d'}}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}
      
      {activeTab === 'daybook' && (
        <div>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3>{formatCurrency(daybookSummary.total_km || 0)} KM</h3>
              <p>Total Distance</p>
            </div>
            <div style={styles.statCard}>
              <h3>{daybookSummary.total_parcels || 0}</h3>
              <p>Total Deliveries</p>
            </div>
            <div style={styles.statCard}>
              <h3>NPR {formatCurrency(daybookSummary.total_fuel_cost || 0)}</h3>
              <p>Total Fuel Cost</p>
            </div>
            <div style={styles.statCard}>
              <h3>{daybookSummary.total_days || 0}</h3>
              <p>Working Days</p>
            </div>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <button 
              onClick={() => setDaybookView('daily')} 
              style={{...styles.button, background: daybookView === 'daily' ? '#007bff' : '#6c757d', marginRight: '1rem'}}
            >
              Daily Entries
            </button>
            <button 
              onClick={() => setDaybookView('monthly')} 
              style={{...styles.button, background: daybookView === 'monthly' ? '#007bff' : '#6c757d'}}
            >
              Monthly Report
            </button>
          </div>
          
          {daybookView === 'daily' && (
          <>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
            <h3>{editingEntry ? 'Edit Entry' : 'Add New Entry'}</h3>
            <form onSubmit={saveDaybookEntry} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <input
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                style={styles.input}
                required
              />
              <input
                type="number"
                step="0.1"
                placeholder="Total KM"
                value={newEntry.total_km}
                onChange={(e) => setNewEntry({...newEntry, total_km: e.target.value})}
                style={styles.input}
                required
              />
              <input
                type="number"
                placeholder="Parcels Delivered"
                value={newEntry.parcels_delivered}
                onChange={(e) => setNewEntry({...newEntry, parcels_delivered: e.target.value})}
                style={styles.input}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Fuel Cost (NPR)"
                value={newEntry.fuel_cost}
                onChange={(e) => setNewEntry({...newEntry, fuel_cost: e.target.value})}
                style={styles.input}
              />
              <textarea
                placeholder="Notes (optional)"
                value={newEntry.notes}
                onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                style={{...styles.input, gridColumn: 'span 2', minHeight: '60px'}}
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" style={{...styles.button, background: '#28a745'}}>
                  {editingEntry ? 'Update Entry' : 'Save Entry'}
                </button>
                {editingEntry && (
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingEntry(null);
                      setNewEntry({
                        date: new Date().toISOString().split('T')[0],
                        total_km: '',
                        parcels_delivered: '',
                        fuel_cost: '',
                        notes: ''
                      });
                    }}
                    style={{...styles.button, background: '#6c757d'}}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Total KM</th>
                <th style={styles.th}>Parcels Delivered</th>
                <th style={styles.th}>Fuel Cost</th>
                <th style={styles.th}>Notes</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {daybook.map(entry => (
                <tr key={entry.id}>
                  <td style={styles.td}>{toNepaliDate(entry.date)}</td>
                  <td style={styles.td}>{formatCurrency(entry.total_km)} KM</td>
                  <td style={styles.td}>{entry.parcels_delivered}</td>
                  <td style={styles.td}>NPR {formatCurrency(entry.fuel_cost)}</td>
                  <td style={styles.td}>{entry.notes || '-'}</td>
                  <td style={styles.td}>
                    <button 
                      onClick={() => editDaybookEntry(entry)}
                      style={styles.button}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {daybook.length === 0 && (
                <tr>
                  <td colSpan="6" style={{...styles.td, textAlign: 'center', color: '#6c757d'}}>
                    No entries found. Add your first entry above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </>
          )}
          
          {daybookView === 'monthly' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h3>Monthly Summary Report</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Month (Nepali)</th>
                  <th style={styles.th}>Total KM</th>
                  <th style={styles.th}>Total Parcels</th>
                  <th style={styles.th}>Total Fuel Cost</th>
                  <th style={styles.th}>Working Days</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReport.map((report, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{toNepaliMonth(report.year, report.month)}</td>
                    <td style={styles.td}>{formatCurrency(report.total_km)} KM</td>
                    <td style={styles.td}>{report.total_parcels}</td>
                    <td style={styles.td}>NPR {formatCurrency(report.total_fuel_cost)}</td>
                    <td style={styles.td}>{report.working_days} days</td>
                  </tr>
                ))}
                {monthlyReport.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{...styles.td, textAlign: 'center', color: '#6c757d'}}>
                      No monthly data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;