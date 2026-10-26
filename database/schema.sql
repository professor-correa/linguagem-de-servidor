SET NAMES utf8mb4;

DROP DATABASE IF EXISTS raffle_platform;
CREATE DATABASE raffle_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE raffle_platform;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password_hash CHAR(60) NOT NULL,
  role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- O token de verdade fica só com o cliente. Aqui guardamos o hash dele,
-- então quem tiver acesso ao banco não consegue se passar por ninguém.
CREATE TABLE sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE raffles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  prize VARCHAR(150) NOT NULL,
  ticket_price DECIMAL(10, 2) NOT NULL,
  total_tickets INT NOT NULL,
  draw_date DATE NOT NULL,
  image_url VARCHAR(500) NULL,
  status ENUM('open', 'closed', 'drawn') NOT NULL DEFAULT 'open',
  winner_ticket_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- A chave única (raffle_id, number) é o que impede dois compradores
-- de ficarem com o mesmo número na mesma rifa.
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  raffle_id INT NOT NULL,
  user_id INT NOT NULL,
  number INT NOT NULL,
  status ENUM('reserved', 'paid') NOT NULL DEFAULT 'reserved',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_raffle_number (raffle_id, number),
  FOREIGN KEY (raffle_id) REFERENCES raffles(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Rifas e números apontam um para o outro, por isso essa chave
-- só pode ser criada depois que as duas tabelas existem.
ALTER TABLE raffles
  ADD FOREIGN KEY (winner_ticket_id) REFERENCES tickets(id);
