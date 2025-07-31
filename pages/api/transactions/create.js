import { getConnection } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { senderId, receiverId, amount, description } = req.body;

  if (!senderId || !receiverId || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than 0' });
  }

  try {
    const conn = await getConnection();
    
    // Start transaction
    await conn.execute('START TRANSACTION');

    // Check sender balance
    const [senderResult] = await conn.execute(
      'SELECT balance FROM users WHERE id = ?',
      [senderId]
    );

    if (senderResult.length === 0) {
      await conn.execute('ROLLBACK');
      return res.status(404).json({ error: 'Sender not found' });
    }

    const senderBalance = parseFloat(senderResult[0].balance);
    if (senderBalance < parseFloat(amount)) {
      await conn.execute('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Check if receiver exists
    const [receiverResult] = await conn.execute(
      'SELECT id FROM users WHERE id = ?',
      [receiverId]
    );

    if (receiverResult.length === 0) {
      await conn.execute('ROLLBACK');
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Update balances
    await conn.execute(
      'UPDATE users SET balance = balance - ? WHERE id = ?',
      [amount, senderId]
    );

    await conn.execute(
      'UPDATE users SET balance = balance + ? WHERE id = ?',
      [amount, receiverId]
    );

    // Insert transaction record
    const [result] = await conn.execute(
      `INSERT INTO transactions (sender_id, receiver_id, amount, description, transaction_type, status) 
       VALUES (?, ?, ?, ?, 'SENT', 'SUCCESS')`,
      [senderId, receiverId, amount, description || '']
    );

    await conn.execute('COMMIT');

    res.status(200).json({
      message: 'Transaction successful',
      transactionId: result.insertId
    });

  } catch (error) {
    await conn.execute('ROLLBACK');
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Transaction failed' });
  }
}
