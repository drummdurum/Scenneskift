// Database helper functions for produkter
const { pool } = require('../db');

const ProduktDB = {
  // Find alle produkter
  async findAll() {
    const result = await pool.query(`
      SELECT p.*, b.teaternavn as ejer_teaternavn 
      FROM produkter p
      LEFT JOIN brugere b ON p.ejer_bruger_id = b.id
      ORDER BY p.id
    `);
    return result.rows;
  },

  // Find produkt by ID
  async findById(id) {
    const result = await pool.query(`
      SELECT p.*, b.teaternavn as ejer_teaternavn 
      FROM produkter p
      LEFT JOIN brugere b ON p.ejer_bruger_id = b.id
      WHERE p.id = $1
    `, [id]);
    return result.rows[0];
  },

  // Opret nyt produkt
  async create(produktData) {
    const result = await pool.query(`
      INSERT INTO produkter (
        titel, kategori, pris_pr_dag, beskrivelse, antal_på_lager, 
        billede_url, ejer_bruger_id, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      produktData.titel,
      produktData.kategori,
      produktData.prisPrDag,
      produktData.beskrivelse,
      produktData.antalPåLager,
      produktData.billedeUrl,
      produktData.ejerBrugerId,
      produktData.tags || []
    ]);
    return result.rows[0];
  },

  // Opdater produkt
  async update(id, produktData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(produktData).forEach(key => {
      fields.push(`${key} = $${paramCount}`);
      values.push(produktData[key]);
      paramCount++;
    });

    values.push(id);
    const result = await pool.query(
      `UPDATE produkter SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  // Slet produkt
  async delete(id) {
    await pool.query('DELETE FROM produkter WHERE id = $1', [id]);
  },

  // Søg produkter
  async search(query) {
    const result = await pool.query(`
      SELECT p.*, b.teaternavn as ejer_teaternavn 
      FROM produkter p
      LEFT JOIN brugere b ON p.ejer_bruger_id = b.id
      WHERE 
        p.titel ILIKE $1 OR 
        p.beskrivelse ILIKE $1 OR
        EXISTS (SELECT 1 FROM unnest(p.tags) tag WHERE tag ILIKE $1)
      ORDER BY p.id
    `, [`%${query}%`]);
    return result.rows;
  },

  // Find produkter by kategori
  async findByKategori(kategori) {
    const result = await pool.query(`
      SELECT p.*, b.teaternavn as ejer_teaternavn 
      FROM produkter p
      LEFT JOIN brugere b ON p.ejer_bruger_id = b.id
      WHERE p.kategori = $1
      ORDER BY p.id
    `, [kategori]);
    return result.rows;
  },

  // Find produkter by ejer
  async findByEjer(ejerId) {
    const result = await pool.query(`
      SELECT p.*, b.teaternavn as ejer_teaternavn 
      FROM produkter p
      LEFT JOIN brugere b ON p.ejer_bruger_id = b.id
      WHERE p.ejer_bruger_id = $1
      ORDER BY p.id
    `, [ejerId]);
    return result.rows;
  },

  // Hent reservationer for produkt
  async getReservationer(produktId) {
    const result = await pool.query(`
      SELECT r.*, b.teaternavn 
      FROM reservationer r
      LEFT JOIN brugere b ON r.bruger_id = b.id
      WHERE r.produkt_id = $1
      ORDER BY r.fra_dato
    `, [produktId]);
    return result.rows;
  },

  // Opret reservation
  async createReservation(reservationData) {
    const result = await pool.query(`
      INSERT INTO reservationer (produkt_id, bruger_id, fra_dato, til_dato, antal, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      reservationData.produktId,
      reservationData.brugerId,
      reservationData.fraDato,
      reservationData.tilDato,
      reservationData.antal,
      reservationData.status || 'pending'
    ]);
    return result.rows[0];
  }
};

module.exports = ProduktDB;
