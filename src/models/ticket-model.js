import { pool } from '../config/db.js';

function toTicket(row) {
  return {
    id: row.id,
    raffleId: row.raffle_id,
    userId: row.user_id,
    number: row.number,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
  return rows[0] ? toTicket(rows[0]) : undefined;
}

export async function findTakenNumbers(raffleId) {
  const [rows] = await pool.query(
    'SELECT number FROM tickets WHERE raffle_id = ? ORDER BY number',
    [raffleId]
  );

  return rows.map((row) => row.number);
}

export async function findHighestNumber(raffleId) {
  const [rows] = await pool.query(
    'SELECT MAX(number) AS highest FROM tickets WHERE raffle_id = ?',
    [raffleId]
  );

  return rows[0].highest ?? 0;
}

export async function findByRaffle(raffleId) {
  const [rows] = await pool.query(
    `SELECT t.id, t.number, t.status, t.created_at,
            u.id AS user_id, u.name, u.email, u.phone
     FROM tickets t
     INNER JOIN users u ON u.id = t.user_id
     WHERE t.raffle_id = ?
     ORDER BY t.number`,
    [raffleId]
  );

  return rows.map((row) => ({
    id: row.id,
    number: row.number,
    status: row.status,
    createdAt: row.created_at,
    buyer: { id: row.user_id, name: row.name, email: row.email, phone: row.phone },
  }));
}

export async function findByUser(userId) {
  const [rows] = await pool.query(
    `SELECT t.id, t.number, t.status, t.created_at,
            r.id AS raffle_id, r.title, r.status AS raffle_status, r.draw_date, r.winner_ticket_id
     FROM tickets t
     INNER JOIN raffles r ON r.id = t.raffle_id
     WHERE t.user_id = ?
     ORDER BY r.draw_date, t.number`,
    [userId]
  );

  return rows.map((row) => ({
    id: row.id,
    number: row.number,
    status: row.status,
    isWinner: row.winner_ticket_id === row.id,
    createdAt: row.created_at,
    raffle: {
      id: row.raffle_id,
      title: row.title,
      status: row.raffle_status,
      drawDate: row.draw_date,
    },
  }));
}

export async function findPaidIds(raffleId) {
  const [rows] = await pool.query(
    "SELECT id FROM tickets WHERE raffle_id = ? AND status = 'paid'",
    [raffleId]
  );

  return rows.map((row) => row.id);
}

export async function findWinner(ticketId) {
  const [rows] = await pool.query(
    `SELECT t.id, t.number, u.name
     FROM tickets t
     INNER JOIN users u ON u.id = t.user_id
     WHERE t.id = ?`,
    [ticketId]
  );

  return rows[0]
    ? { ticketId: rows[0].id, number: rows[0].number, name: rows[0].name }
    : null;
}

export async function create({ raffleId, userId, number }) {
  const [result] = await pool.query(
    'INSERT INTO tickets (raffle_id, user_id, number) VALUES (?, ?, ?)',
    [raffleId, userId, number]
  );

  return findById(result.insertId);
}

export async function markAsPaid(id) {
  const [result] = await pool.query(
    "UPDATE tickets SET status = 'paid' WHERE id = ?",
    [id]
  );

  return result.affectedRows > 0;
}
