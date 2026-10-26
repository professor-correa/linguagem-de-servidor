import { pool } from '../config/db.js';

export function toUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    createdAt: row.created_at,
  };
}

export async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] ? toUser(rows[0]) : undefined;
}

// Única consulta que devolve o hash da senha. Ela serve só para o login
// e nunca deve chegar a uma resposta da API.
export async function findCredentialsByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, password_hash FROM users WHERE email = ?',
    [email]
  );

  return rows[0] ? { id: rows[0].id, passwordHash: rows[0].password_hash } : undefined;
}

export async function create({ name, email, phone, passwordHash }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
    [name, email, phone, passwordHash]
  );

  return findById(result.insertId);
}
