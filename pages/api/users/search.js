import { getConnection } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.query;

  try {
    const conn = await getConnection();
    
    // If no query provided, return all users (for dropdown population)
    // If query provided, search by name or mobile number
    let sqlQuery, params;
    
    if (!query || query.trim() === '') {
      sqlQuery = `SELECT id, name, mobile, email, bank_name, account_number, balance, upi_id, created_at 
                  FROM users 
                  ORDER BY name`;
      params = [];
    } else {
      sqlQuery = `SELECT id, name, mobile, email, bank_name, account_number, balance, upi_id, created_at 
                  FROM users 
                  WHERE name LIKE ? OR mobile LIKE ?
                  ORDER BY name`;
      params = [`%${query}%`, `%${query}%`];
    }

    const [users] = await conn.execute(sqlQuery, params);
    res.status(200).json(users);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
}
