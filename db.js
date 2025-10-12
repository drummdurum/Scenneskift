const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create brugere table
    await client.query(`
      CREATE TABLE IF NOT EXISTS brugere (
        id SERIAL PRIMARY KEY,
        brugernavn VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rolle VARCHAR(50) NOT NULL,
        aktiv BOOLEAN DEFAULT false,
        navn VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        teaternavn VARCHAR(255),
        lokation VARCHAR(255),
        favoritter INTEGER[] DEFAULT '{}',
        points INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create produkter table
    await client.query(`
      CREATE TABLE IF NOT EXISTS produkter (
        id SERIAL PRIMARY KEY,
        navn VARCHAR(255) NOT NULL,
        beskrivelse TEXT,
        pris VARCHAR(100),
        billede VARCHAR(500),
        ejer_bruger_id INTEGER REFERENCES brugere(id),
        skjult BOOLEAN DEFAULT false,
        kategori_størrelse VARCHAR(50),
        kategori_æra VARCHAR(100),
        kategori_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create reservationer table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reservationer (
        id SERIAL PRIMARY KEY,
        produkt_id INTEGER REFERENCES produkter(id) ON DELETE CASCADE,
        bruger VARCHAR(255) NOT NULL,
        teaternavn VARCHAR(255),
        fra_dato DATE NOT NULL,
        til_dato DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create forestillingsperioder table
    await client.query(`
      CREATE TABLE IF NOT EXISTS forestillingsperioder (
        id SERIAL PRIMARY KEY,
        bruger_id INTEGER REFERENCES brugere(id) ON DELETE CASCADE,
        titel VARCHAR(255) NOT NULL,
        fra_dato DATE NOT NULL,
        til_dato DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database tabeller initialiseret');

    // Check if admin user exists, if not create it
    console.log('🔍 Tjekker om admin bruger eksisterer...');
    const adminCheck = await client.query(
      'SELECT id FROM brugere WHERE brugernavn = $1',
      ['admin']
    );

    console.log(`Found ${adminCheck.rows.length} admin users`);

    if (adminCheck.rows.length === 0) {
      console.log('⏳ Opretter admin bruger...');
      const bcrypt = require('bcryptjs');
      const adminPassword = await bcrypt.hash('admin123', 10);
      
      await client.query(`
        INSERT INTO brugere (brugernavn, password, rolle, aktiv, navn, type, teaternavn, lokation, points)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, ['admin', adminPassword, 'admin', true, 'Administrator', 'admin', 'SceneSkift Hovedkontor', 'Aarhus', 500]);

      console.log('✅ Admin bruger oprettet (admin/admin123)');
    } else {
      console.log('ℹ️  Admin bruger eksisterer allerede');
    }

    // Check if drumm user exists
    console.log('🔍 Tjekker om drumm bruger eksisterer...');
    const drummCheck = await client.query(
      'SELECT id FROM brugere WHERE brugernavn = $1',
      ['drumm']
    );

    console.log(`Found ${drummCheck.rows.length} drumm users`);

    if (drummCheck.rows.length === 0) {
      console.log('⏳ Opretter drumm bruger...');
      const bcrypt = require('bcryptjs');
      const drummPassword = await bcrypt.hash('drumm123', 10);
      
      await client.query(`
        INSERT INTO brugere (brugernavn, password, rolle, aktiv, navn, type, teaternavn, lokation, points)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, ['drumm', drummPassword, 'teater', true, 'Sebastian', 'teater', 'Det Kongelige Teater', 'København', 250]);

      console.log('✅ Drumm bruger oprettet (drumm/drumm123)');
    } else {
      console.log('ℹ️  Drumm bruger eksisterer allerede');
    }

  } catch (err) {
    console.error('Fejl ved initialisering af database:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, initializeDatabase };
