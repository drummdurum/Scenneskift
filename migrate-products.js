// Migration script - Kopiér produkter fra JSON til PostgreSQL database
require('dotenv').config();
const fs = require('fs');
const { pool } = require('./db');

async function migrateProducts() {
  console.log('🚀 Starter migration af produkter fra JSON til database...\n');

  try {
    // Læs produkter fra JSON fil
    const produkterJSON = JSON.parse(fs.readFileSync('./data/produkter.json', 'utf8'));
    console.log(`📦 Fandt ${produkterJSON.length} produkter i JSON fil\n`);

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      let produkterOprettet = 0;
      let reservationerOprettet = 0;

      for (const produkt of produkterJSON) {
        console.log(`\n📝 Migrerer: "${produkt.navn}"...`);

        // Tjek om produktet allerede eksisterer
        const existing = await client.query(
          'SELECT id FROM produkter WHERE id = $1',
          [produkt.id]
        );

        if (existing.rows.length > 0) {
          console.log(`   ⏭️  Springer over (eksisterer allerede)`);
          continue;
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
          produkt.ejerBrugerId,
          produkt.skjult,
          produkt.kategori?.størrelse,
          produkt.kategori?.æra,
          produkt.kategori?.type
        ]);

        const nyProduktId = result.rows[0].id;
        produkterOprettet++;
        console.log(`   ✅ Produkt oprettet med ID: ${nyProduktId}`);

        // Indsæt reservationer hvis der er nogen
        if (produkt.reservationer && produkt.reservationer.length > 0) {
          console.log(`   📅 Indsætter ${produkt.reservationer.length} reservationer...`);
          
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
          console.log(`   ✅ Reservationer indsat`);
        }
      }

      await client.query('COMMIT');
      
      console.log('\n\n✅ ════════════════════════════════════════');
      console.log('✅ MIGRATION FULDFØRT!');
      console.log('✅ ════════════════════════════════════════');
      console.log(`📦 Produkter migreret: ${produkterOprettet}`);
      console.log(`📅 Reservationer migreret: ${reservationerOprettet}`);
      console.log('\n💡 Du kan nu slette JSON filerne hvis du vil!\n');

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('\n❌ Fejl under migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Kør migration
migrateProducts();
