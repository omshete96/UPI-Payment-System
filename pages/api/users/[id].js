import { getConnection } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const conn = await getConnection();
    
    // Get user details
    const [users] = await conn.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Get transaction history
    const [transactions] = await conn.execute(
      `SELECT t.*, 
              sender.name as sender_name, sender.mobile as sender_mobile,
              receiver.name as receiver_name, receiver.mobile as receiver_mobile
       FROM transactions t
       JOIN users sender ON t.sender_id = sender.id
       JOIN users receiver ON t.receiver_id = receiver.id
       WHERE t.sender_id = ? OR t.receiver_id = ?
       ORDER BY t.created_at DESC
       LIMIT 20`,
      [id, id]
    );

    res.status(200).json({
      user,
      transactions
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user details' });
  }
}