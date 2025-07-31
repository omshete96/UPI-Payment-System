import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <div className="navbar">
        <Link href="/">🏠 Home</Link>
        <Link href="/search">🔍 Search Users</Link>
        <Link href="/transaction">💸 Send Money</Link>
      </div>
      
      <div className="card">
        <h1 style={{textAlign: 'center', color: '#333', marginBottom: '24px'}}>
          🏦 UPI Payment System
        </h1>
        
        <div style={{textAlign: 'center'}}>
          <h2 style={{color: '#555', marginBottom: '32px'}}>
            Send money instantly across different banks
          </h2>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '32px'}}>
            <div className="card" style={{background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'}}>
              <h3>🔍 Find Users</h3>
              <p>Search users by name or mobile number to view their details and transaction history.</p>
              <Link href="/search">
                <button className="btn" style={{marginTop: '16px'}}>Search Now</button>
              </Link>
            </div>
            
            <div className="card" style={{background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'}}>
              <h3>💸 Send Money</h3>
              <p>Transfer money instantly between different banks like HDFC, SBI, ICICI, and more.</p>
              <Link href="/transaction">
                <button className="btn" style={{marginTop: '16px'}}>Send Money</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}