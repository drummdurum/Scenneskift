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

    // Migrer produkter fra JSON hvis de findes
    await migrateProductsFromJSON(client);

  } catch (err) {
    console.error('Fejl ved initialisering af database:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Migrer produkter fra JSON fil til database
async function migrateProductsFromJSON(client) {
  try {
    const fs = require('fs');
    const path = require('path');
    const jsonPath = path.join(__dirname, 'data', 'produkter.json');
    
    // Tjek om JSON fil eksisterer
    if (!fs.existsSync(jsonPath)) {
      console.log('ℹ️  Ingen produkter.json fil fundet - springer migration over');
      return;
    }

    console.log('📦 Tjekker for produkter i JSON fil...');
    const produkterJSON = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    if (produkterJSON.length === 0) {
      console.log('ℹ️  Ingen produkter at migrere');
      return;
    }

    console.log(`📦 Fandt ${produkterJSON.length} produkter i JSON fil`);
    
    // Hent bruger ID mapping (JSON ID -> Database ID)
    const brugerMapping = {};
    const brugere = await client.query('SELECT id, brugernavn FROM brugere');
    brugere.rows.forEach(b => {
      // Map baseret på brugernavn
      if (b.brugernavn === 'admin') brugerMapping[1] = b.id;
      if (b.brugernavn === 'drumm') brugerMapping[2] = b.id;
      if (b.brugernavn === 'julie') brugerMapping[3] = b.id;
    });

    console.log('🔗 Bruger ID mapping:', brugerMapping);
    
    let produkterOprettet = 0;
    let reservationerOprettet = 0;

    for (const produkt of produkterJSON) {
      // Map ejer bruger ID
      const ejerBrugerId = brugerMapping[produkt.ejerBrugerId];
      
      if (!ejerBrugerId) {
        console.log(`⏭️  Springer "${produkt.navn}" over - ejer findes ikke (ejerBrugerId: ${produkt.ejerBrugerId})`);
        continue;
      }

      // Tjek om produktet allerede eksisterer (baseret på navn og ejer)
      const existing = await client.query(
        'SELECT id FROM produkter WHERE navn = $1 AND ejer_bruger_id = $2',
        [produkt.navn, ejerBrugerId]
      );

      if (existing.rows.length > 0) {
        continue; // Spring over hvis eksisterer
      }

      // Indsæt produkt
      const result = await client.query(`
        INSERT INTO produkter (
          navn, beskrivelse, pris, billede, ejer_bruger_id, skjult,
          kategori_størrelse, kategori_æra, kategori_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [
        produkt.navn,
        produkt.beskrivelse,
        produkt.pris,
        produkt.billede,
        ejerBrugerId,
        produkt.skjult,
        produkt.kategori?.størrelse,
        produkt.kategori?.æra,
        produkt.kategori?.type
      ]);

      const nyProduktId = result.rows[0].id;
      produkterOprettet++;

      // Indsæt reservationer hvis der er nogen
      if (produkt.reservationer && produkt.reservationer.length > 0) {
        for (const res of produkt.reservationer) {
          await client.query(`
            INSERT INTO reservationer (
              produkt_id, bruger, teaternavn, fra_dato, til_dato
            ) VALUES ($1, $2, $3, $4, $5)
          `, [
            nyProduktId,
            res.bruger,
            res.teaternavn,
            res.fraDato,
            res.tilDato
          ]);
          reservationerOprettet++;
        }
      }
    }

    if (produkterOprettet > 0) {
      console.log(`✅ Produkter migreret: ${produkterOprettet}`);
      console.log(`✅ Reservationer migreret: ${reservationerOprettet}`);
    } else {
      console.log('ℹ️  Alle produkter eksisterer allerede i databasen');
    }

  } catch (error) {
    console.error('⚠️  Fejl ved migration af produkter (fortsætter alligevel):', error.message);
    // Fortsæt selv om migration fejler
  }
}

module.exports = { pool, initializeDatabase };
