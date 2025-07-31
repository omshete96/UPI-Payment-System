import { initDatabase } from '../../../lib/db';

export default async function handler(req, res) {
  try {
    await initDatabase();
    res.status(200).json({ message: 'Database initialized successfully!' });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
}