import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '**********', 
  database: 'upi_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let connection;

export async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection(dbConfig);
  }
  return connection;
}

export async function initDatabase() {
  const conn = await getConnection();
  
  // Create users table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      mobile VARCHAR(15) UNIQUE NOT NULL,
      email VARCHAR(100),
      bank_name VARCHAR(50) NOT NULL,
      account_number VARCHAR(20) NOT NULL,
      balance DECIMAL(10,2) DEFAULT 0.00,
      upi_id VARCHAR(50) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create transactions table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sender_id INT NOT NULL,
      receiver_id INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      description TEXT,
      transaction_type ENUM('SENT', 'RECEIVED') NOT NULL,
      status ENUM('SUCCESS', 'FAILED', 'PENDING') DEFAULT 'SUCCESS',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id)
    )
  `);

  // Insert sample users
  const sampleUsers = [
    ['Rahul Sharma', '9876543210', 'rahul@gmail.com', 'HDFC Bank', 'HDFC123456789', 10000.00, 'rahul@paytm'],
    ['Priya Patel', '9876543211', 'priya@gmail.com', 'SBI', 'SBI987654321', 15000.00, 'priya@phonepe'],
    ['Amit Kumar', '9876543212', 'amit@gmail.com', 'ICICI Bank', 'ICICI456789123', 8000.00, 'amit@gpay'],
    ['Sneha Singh', '9876543213', 'sneha@gmail.com', 'Axis Bank', 'AXIS789123456', 12000.00, 'sneha@paytm'],
    ['Vikash Yadav', '9876543214', 'vikash@gmail.com', 'Kotak Bank', 'KOTAK123789456', 20000.00, 'vikash@phonepe']
  ];

  for (const user of sampleUsers) {
    try {
      await conn.execute(
        'INSERT IGNORE INTO users (name, mobile, email, bank_name, account_number, balance, upi_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        user
      );
    } catch (error) {
      console.log('User already exists:', user[0]);
    }
  }

  console.log('Database initialized successfully!');
}
