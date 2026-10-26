import { pool } from '../config/db.js';

const SELECT_RAFFLE = `
  SELECT r.*, COUNT(t.id) AS sold_tickets
  FROM raffles r
  LEFT JOIN tickets t ON t.raffle_id = r.id
`;

function toRaffle(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    prize: row.prize,
    ticketPrice: Number(row.ticket_price),
    totalTickets: row.total_tickets,
    soldTickets: Number(row.sold_tickets),
    drawDate: row.draw_date,
    imageUrl: row.image_url,
    status: row.status,
    winnerTicketId: row.winner_ticket_id,
    createdAt: row.created_at,
  };
}

export async function findAll({ status, search }) {
  let sql = `${SELECT_RAFFLE} WHERE 1=1`;
  const params = [];

  if (status) {
    sql += ' AND r.status = ?';
    params.push(status);
  }

  if (search) {
    sql += ' AND (r.title LIKE ? OR r.prize LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ' GROUP BY r.id ORDER BY r.draw_date';

  const [rows] = await pool.query(sql, params);
  return rows.map(toRaffle);
}

export async function findById(id) {
  const [rows] = await pool.query(`${SELECT_RAFFLE} WHERE r.id = ? GROUP BY r.id`, [id]);
  return rows[0] ? toRaffle(rows[0]) : undefined;
}

export async function create(raffle) {
  const [result] = await pool.query(
    `INSERT INTO raffles
       (title, description, prize, ticket_price, total_tickets, draw_date, image_url, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      raffle.title,
      raffle.description,
      raffle.prize,
      raffle.ticketPrice,
      raffle.totalTickets,
      raffle.drawDate,
      raffle.imageUrl,
      raffle.status,
    ]
  );

  return findById(result.insertId);
}

export async function update(id, raffle) {
  const [result] = await pool.query(
    `UPDATE raffles
     SET title = ?, description = ?, prize = ?, ticket_price = ?,
         total_tickets = ?, draw_date = ?, image_url = ?, status = ?
     WHERE id = ?`,
    [
      raffle.title,
      raffle.description,
      raffle.prize,
      raffle.ticketPrice,
      raffle.totalTickets,
      raffle.drawDate,
      raffle.imageUrl,
      raffle.status,
      id,
    ]
  );

  return result.affectedRows > 0;
}

export async function remove(id) {
  const [result] = await pool.query('DELETE FROM raffles WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// O "status <> 'drawn'" garante que dois sorteios disparados ao mesmo tempo
// não escolham dois ganhadores: só o primeiro UPDATE encontra a linha.
export async function markAsDrawn(id, winnerTicketId) {
  const [result] = await pool.query(
    "UPDATE raffles SET status = 'drawn', winner_ticket_id = ? WHERE id = ? AND status <> 'drawn'",
    [winnerTicketId, id]
  );

  return result.affectedRows > 0;
}
