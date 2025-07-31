import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Transaction() {
  const router = useRouter();
  const { receiverId, receiverName } = router.query;
  
  const [formData, setFormData] = useState({
    senderId: '1', // Default sender (in real app, this would come from auth)
    receiverId: receiverId || '',
    amount: '',
    description: ''
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
    if (receiverId) {
      setFormData(prev => ({ ...prev, receiverId }));
    }
  }, [receiverId]);

  const fetchUsers = async () => {
    try {
      // Try multiple approaches to load users
      console.log('Fetching users...');
      
      // First try the search endpoint without query (returns all users)
      let response = await fetch('/api/users/search');
      let data = await response.json();
      
      if (response.ok && data.length > 0) {
        setUsers(data);
        console.log('Users loaded successfully:', data.length);
        return;
      }
      
      // If that fails, try the all endpoint
      response = await fetch('/api/users/all');
      data = await response.json();
      
      if (response.ok) {
        setUsers(data);
        console.log('Users loaded from /all endpoint:', data.length);
      } else {
        console.error('Failed to fetch users:', data.error);
        setError('Failed to load users. Please make sure the database is initialized.');
      }
    } catch (err) {
      console.error('Network error fetching users:', err);
      setError('Network error loading users. Please check your connection and try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Transaction completed successfully! 🎉');
        setFormData({
          senderId: '1',
          receiverId: '',
          amount: '',
          description: ''
        });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedReceiver = users.find(user => user.id === parseInt(formData.receiverId));

  return (
    <div className="container">
      <div className="navbar">
        <Link href="/">🏠 Home</Link>
        <Link href="/search">🔍 Search Users</Link>
        <Link href="/transaction">💸 Send Money</Link>
      </div>

      <div className="card">
        <h1>💸 Send Money</h1>
        
        {error && (
          <div className="error">
            {error}
            <div style={{marginTop: '12px'}}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setError('');
                  fetchUsers();
                }}
                style={{fontSize: '14px', padding: '8px 16px'}}
              >
                🔄 Retry Loading Users
              </button>
              <p style={{fontSize: '14px', marginTop: '8px', color: '#666'}}>
                💡 Make sure to initialize the database first by visiting: 
                <a href="/api/database/init" target="_blank" style={{color: '#667eea', textDecoration: 'underline'}}>
                  /api/database/init
                </a>
              </p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{marginTop: '24px'}}>
          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
              👤 Send To:
            </label>
            <select
              className="input"
              value={formData.receiverId}
              onChange={(e) => setFormData({...formData, receiverId: e.target.value})}
              required
              style={{cursor: 'pointer'}}
            >
              <option value="">
                {users.length === 0 ? 'Loading users...' : 'Select recipient...'}
              </option>
              {users.filter(user => user.id !== parseInt(formData.senderId)).map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.mobile} ({user.bank_name})
                </option>
              ))}
            </select>
            {users.length === 0 && !error && (
              <div style={{color: '#666', fontSize: '14px', marginTop: '8px'}}>
                💡 Loading available recipients...
              </div>
            )}
            {users.length > 0 && (
              <div style={{color: '#28a745', fontSize: '14px', marginTop: '8px'}}>
                ✅ {users.filter(user => user.id !== parseInt(formData.senderId)).length} recipients available
              </div>
            )}
          </div>

          {selectedReceiver && (
            <div className="user-card" style={{marginBottom: '20px'}}>
              <h3>📋 Recipient Details</h3>
              <p><strong>👤 Name:</strong> {selectedReceiver.name}</p>
              <p><strong>📱 Mobile:</strong> {selectedReceiver.mobile}</p>
              <p><strong>🏦 Bank:</strong> {selectedReceiver.bank_name}</p>
              <p><strong>🆔 UPI ID:</strong> {selectedReceiver.upi_id}</p>
            </div>
          )}

          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
              💰 Amount (₹):
            </label>
            <input
              type="number"
              className="input"
              placeholder="Enter amount..."
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              min="1"
              step="0.01"
              required
            />
          </div>

          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>
              💬 Description (Optional):
            </label>
            <textarea
              className="input"
              placeholder="What's this payment for?"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
            />
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <button 
            type="submit" 
            className="btn" 
            disabled={loading || !formData.receiverId || !formData.amount || users.length === 0}
          >
            {loading ? 'Processing...' : `Send ₹${formData.amount || '0'}`}
          </button>
          
          {users.length === 0 && !error && (
            <div style={{textAlign: 'center', marginTop: '16px', color: '#666'}}>
              🔄 Loading users, please wait...
            </div>
          )}
        </form>

        {receiverName && (
          <div style={{marginTop: '16px', textAlign: 'center', color: '#666'}}>
            💡 Sending money to {receiverName}
          </div>
        )}
      </div>
    </div>
  );
}
