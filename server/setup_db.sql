-- Run this in MySQL to set up the database
CREATE DATABASE IF NOT EXISTS travel_portal;
USE travel_portal;

CREATE TABLE IF NOT EXISTS bookings (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(150) NOT NULL,
  email        VARCHAR(150) NOT NULL,
  phone        VARCHAR(30)  NOT NULL,
  company      VARCHAR(150),
  service      VARCHAR(50)  NOT NULL,
  vehicle      VARCHAR(50),
  pickup       TEXT         NOT NULL,
  dropoff      TEXT         NOT NULL,
  booking_date DATE         NOT NULL,
  booking_time TIME         NOT NULL,
  notes        TEXT,
  status       ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
