USE raffle_platform;

-- Senhas: admin-rifa, maria-rifa e joao-rifa
INSERT INTO users (name, email, phone, password_hash, role) VALUES
  ('Equipe Rifa Online', 'admin@rifaonline.dev', '11999990000', '$2b$10$s.c/wmVlsH.9N9f32qTxy.VGJrKoAes.Px9p8amdJebAcGSZrxmZ2', 'admin'),
  ('Maria Souza', 'maria@email.com', '11988887777', '$2b$10$1DH.7puFNog.YwO3f5x2Xu3fXCVPET.JCMMwQNLCtMuU9LRhGWrt2', 'customer'),
  ('João Lima', 'joao@email.com', '11977776666', '$2b$10$PTaDtlFRNTPDCnPgBPpXDeDugRjGgPiY/Qt4MDtozdoN2kY9mu.EO', 'customer');

INSERT INTO raffles (title, description, prize, ticket_price, total_tickets, draw_date, status) VALUES
  ('Rifa do iPhone', 'Um iPhone novo, lacrado, com nota fiscal. O sorteio é ao vivo no Instagram assim que todos os números forem vendidos.', 'iPhone 16 Pro 256 GB', 5.00, 100, '2026-12-20', 'open'),
  ('Rifa da Moto', 'Moto zero quilômetro com documentação paga e emplacamento incluso. Entrega na concessionária mais perto do ganhador.', 'Honda CG 160 Start', 10.00, 200, '2027-01-30', 'open'),
  ('Rifa do Pix', 'Mil reais direto na conta do ganhador, transferidos na hora do sorteio.', 'R$ 1.000 no Pix', 2.00, 50, '2026-10-10', 'drawn');

INSERT INTO tickets (raffle_id, user_id, number, status) VALUES
  (1, 2, 7, 'paid'),
  (1, 2, 13, 'reserved'),
  (1, 3, 21, 'paid'),
  (1, 3, 42, 'paid'),
  (2, 2, 100, 'paid'),
  (2, 3, 150, 'reserved'),
  (3, 2, 5, 'paid'),
  (3, 3, 18, 'paid'),
  (3, 3, 33, 'paid');

UPDATE raffles SET winner_ticket_id = 8 WHERE id = 3;
