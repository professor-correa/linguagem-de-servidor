import { pool } from '../config/db.js';
import { toUser } from './user-model.js';

export async function create(userId, tokenHash, days) {
  await pool.query(
    'INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))',
    [userId, tokenHash, days]
  );
}

export async function findUserByTokenHash(tokenHash) {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at
     FROM sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > NOW()`,
    [tokenHash]
  );

  return rows[0] ? toUser(rows[0]) : null;
}

export async function remove(tokenHash) {
  await pool.query('DELETE FROM sessions WHERE token_hash = ?', [tokenHash]);
}
