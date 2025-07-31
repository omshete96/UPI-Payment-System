import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Profile() {
  const router = useRouter();
  const { id } = router.query;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchUserData();
    }
  }, [id]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/users/${id}`);
      const data = await response.json();

      if (response.ok) {
        setUserData(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div style={{textAlign: 'center'}}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  const { user, transactions } = userData;

  return (
    <div className="container">
      <div className="navbar">
        <Link href="/">🏠 Home</Link>
        <Link href="/search">🔍 Search Users</Link>
        <Link href="/transaction">💸 Send Money</Link>
      </div>

      <div className="card">
        <h1>👤 User Profile</h1>
        
        <div className="user-card" style={{marginTop: '24px'}}>
          <h2>📋 Personal Information</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px'}}>
            <div>
              <p><strong>👤 Name:</strong> {user.name}</p>
              <p><strong>📱 Mobile:</strong> {user.mobile}</p>
              <p><strong>📧 Email:</strong> {user.email}</p>
            </div>
            <div>
              <p><strong>🏦 Bank:</strong> {user.bank_name}</p>
              <p><strong>🔢 Account:</strong> {user.account_number}</p>
              <p><strong>💰 Balance:</strong> ₹{parseFloat(user.balance).toLocaleString()}</p>
              <p><strong>🆔 UPI ID:</strong> {user.upi_id}</p>
            </div>
          </div>
          
          <div style={{marginTop: '16px'}}>
            <Link href={`/transaction?receiverId=${user.id}&receiverName=${user.name}`}>
              <button className="btn">Send Money to {user.name}</button>
            </Link>
          </div>
        </div>

        <div className="card" style={{marginTop: '24px'}}>
          <h2>📊 Transaction History</h2>
          
          {transactions.length === 0 ? (
            <p style={{textAlign: 'center', color: '#666', marginTop: '24px'}}>
              No transactions found
            </p>
          ) : (
            <div style={{marginTop: '16px'}}>
              {transactions.map(transaction => {
                const isSent = transaction.sender_id === parseInt(id);
                const otherParty = isSent ? transaction.receiver_name : transaction.sender_name;
                const otherMobile = isSent ? transaction.receiver_mobile : transaction.sender_mobile;
                
                return (
                  <div 
                    key={transaction.id} 
                    className={`transaction-item ${isSent ? 'sent' : ''}`}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div>
                        <h4>
                          {isSent ? '📤 Sent to' : '📥 Received from'} {otherParty}
                        </h4>
                        <p style={{color: '#666'}}>📱 {otherMobile}</p>
                        {transaction.description && (
                          <p style={{color: '#666'}}>💬 {transaction.description}</p>
                        )}
                        <p style={{color: '#666', fontSize: '14px'}}>
                          📅 {new Date(transaction.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <div style={{
                          fontSize: '18px', 
                          fontWeight: 'bold',
                          color: isSent ? '#dc3545' : '#28a745'
                        }}>
                          {isSent ? '-' : '+'}₹{parseFloat(transaction.amount).toLocaleString()}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: transaction.status === 'SUCCESS' ? '#28a745' : '#dc3545'
                        }}>
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}