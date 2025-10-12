// Database helper functions for brugere
const { pool } = require('./db');

const BrugerDB = {
  // Find alle brugere
  async findAll() {
    const result = await pool.query('SELECT * FROM brugere ORDER BY id');
    return result.rows;
  },

  // Find bruger by ID
  async findById(id) {
    const result = await pool.query('SELECT * FROM brugere WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Find bruger by brugernavn
  async findByBrugernavn(brugernavn) {
    const result = await pool.query('SELECT * FROM brugere WHERE brugernavn = $1', [brugernavn]);
    return result.rows[0];
  },

  // Opret ny bruger
  async create(brugerData) {
    const result = await pool.query(`
      INSERT INTO brugere (
        brugernavn, password, rolle, aktiv, navn, type, teaternavn, lokation, points, favoritter
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      brugerData.brugernavn,
      brugerData.password,
      brugerData.rolle,
      brugerData.aktiv || false,
      brugerData.navn,
      brugerData.type,
      brugerData.teaternavn,
      brugerData.lokation,
      brugerData.points || 0,
      brugerData.favoritter || []
    ]);
    return result.rows[0];
  },

  // Opdater bruger
  async update(id, brugerData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(brugerData).forEach(key => {
      fields.push(`${key} = $${paramCount}`);
      values.push(brugerData[key]);
      paramCount++;
    });

    values.push(id);
    const result = await pool.query(
      `UPDATE brugere SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  // Tilføj favorit
  async addFavorit(brugerId, produktId) {
    await pool.query(`
      UPDATE brugere 
      SET favoritter = array_append(favoritter, $1)
      WHERE id = $2 AND NOT ($1 = ANY(favoritter))
    `, [produktId, brugerId]);
  },

  // Fjern favorit
  async removeFavorit(brugerId, produktId) {
    await pool.query(`
      UPDATE brugere 
      SET favoritter = array_remove(favoritter, $1)
      WHERE id = $2
    `, [produktId, brugerId]);
  },

  // Tilføj forestillingsperiode
  async addForestillingsperiode(brugerId, periode) {
    const result = await pool.query(`
      INSERT INTO forestillingsperioder (bruger_id, titel, fra_dato, til_dato)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [brugerId, periode.titel, periode.fraDato, periode.tilDato]);
    return result.rows[0];
  },

  // Hent forestillingsperioder
  async getForestillingsperioder(brugerId) {
    const result = await pool.query(
      'SELECT * FROM forestillingsperioder WHERE bruger_id = $1 ORDER BY fra_dato',
      [brugerId]
    );
    return result.rows;
  },

  // Slet forestillingsperiode
  async deleteForestillingsperiode(periodeId) {
    await pool.query('DELETE FROM forestillingsperioder WHERE id = $1', [periodeId]);
  }
};

module.exports = BrugerDB;
