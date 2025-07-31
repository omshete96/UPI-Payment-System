import { getConnection } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const conn = await getConnection();
    
    // Get all users for dropdown population
    const [users] = await conn.execute(
      `SELECT id, name, mobile, email, bank_name, account_number, balance, upi_id, created_at 
       FROM users 
       ORDER BY name`
    );

    res.status(200).json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
}
