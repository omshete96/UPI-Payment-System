import { useState } from 'react';
import Link from 'next/link';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/users/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="navbar">
        <Link href="/">🏠 Home</Link>
        <Link href="/search">🔍 Search Users</Link>
        <Link href="/transaction">💸 Send Money</Link>
      </div>

      <div className="card">
        <h1>🔍 Search Users</h1>
        
        <form onSubmit={handleSearch} style={{marginTop: '24px'}}>
          <input
            type="text"
            className="input"
            placeholder="Enter name or mobile number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        <div style={{marginTop: '24px'}}>
          {users.map(user => (
            <div key={user.id} className="user-card">
              <h3>👤 {user.name}</h3>
              <p><strong>📱 Mobile:</strong> {user.mobile}</p>
              <p><strong>🏦 Bank:</strong> {user.bank_name}</p>
              <p><strong>💰 Balance:</strong> ₹{parseFloat(user.balance).toLocaleString()}</p>
              <p><strong>🆔 UPI ID:</strong> {user.upi_id}</p>
              
              <div style={{marginTop: '16px'}}>
                <Link href={`/profile?id=${user.id}`}>
                  <button className="btn" style={{marginRight: '12px'}}>
                    View Details
                  </button>
                </Link>
                <Link href={`/transaction?receiverId=${user.id}&receiverName=${user.name}`}>
                  <button className="btn btn-secondary">
                    Send Money
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && searchQuery && !loading && (
          <div style={{textAlign: 'center', marginTop: '32px', color: '#666'}}>
            No users found for "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
