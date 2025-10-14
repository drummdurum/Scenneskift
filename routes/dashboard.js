const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { pool } = require('../db');

// Alle routes bruger authMiddleware
router.use(authMiddleware);

// Dashboard
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM produkter WHERE ejer_bruger_id = $1 ORDER BY id',
      [req.session.bruger.id]
    );
    
    // Tilføj reservationer til hvert produkt
    const produkter = await Promise.all(result.rows.map(async (produkt) => {
      const resResult = await pool.query(
        'SELECT * FROM reservationer WHERE produkt_id = $1 ORDER BY fra_dato',
        [produkt.id]
      );
      return {
        ...produkt,
        reservationer: resResult.rows
      };
    }));
    
    // Hent kommende reservationer for brugerens produkter (udlejet til andre)
    const reservationerResult = await pool.query(`
      SELECT r.*, p.navn as produkt_navn, p.billede as produkt_billede, 
             r.teaternavn as lejer_teaternavn
      FROM reservationer r
      JOIN produkter p ON r.produkt_id = p.id
      WHERE p.ejer_bruger_id = $1 
        AND r.til_dato >= CURRENT_DATE
      ORDER BY r.fra_dato ASC
    `, [req.session.bruger.id]);
    
    // Hent brugerens egne reservationer (produkter de har lejet)
    const mineReservationerResult = await pool.query(`
      SELECT r.*, p.navn as produkt_navn, p.billede as produkt_billede, 
             p.lokation as produkt_lokation,
             b.teaternavn as ejer_teaternavn, b.lokation as ejer_lokation
      FROM reservationer r
      JOIN produkter p ON r.produkt_id = p.id
      JOIN brugere b ON p.ejer_bruger_id = b.id
      WHERE r.teaternavn = $1
        AND r.til_dato >= CURRENT_DATE
      ORDER BY r.til_dato ASC
    `, [req.session.bruger.teaternavn]);
    
    console.log('🔍 Søger efter reservationer for:', req.session.bruger.teaternavn);
    console.log('📦 Fandt reservationer:', mineReservationerResult.rows.length);
    
    res.render('dashboard', { 
      bruger: req.session.bruger, 
      produkter: produkter,
      reservationer: reservationerResult.rows,
      mineReservationer: mineReservationerResult.rows
    });
  } catch (error) {
    console.error('❌ Fejl ved hentning af brugerens produkter:', error);
    res.render('dashboard', { 
      bruger: req.session.bruger, 
      produkter: [],
      reservationer: [],
      mineReservationer: []
    });
  }
});

// Vis opret produkt formular
router.get('/opret-produkt', (req, res) => {
  res.render('opret-produkt', { 
    bruger: req.session.bruger, 
    fejl: null, 
    success: null 
  });
});

// Opret nyt produkt
router.post('/opret-produkt', async (req, res) => {
  const { navn, beskrivelse, lokation, billede, størrelse, æra, type, maa_renoveres } = req.body;
  
  try {
    await pool.query(
      `INSERT INTO produkter (navn, beskrivelse, lokation, billede, ejer_bruger_id, skjult, kategori_størrelse, kategori_æra, kategori_type, maa_renoveres)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        navn,
        beskrivelse,
        lokation,
        billede || '/images/placeholder.jpg',
        req.session.bruger.id,
        false,
        størrelse || null,
        æra || null,
        type || null,
        maa_renoveres === 'true'
      ]
    );
    
    res.render('opret-produkt', { 
      bruger: req.session.bruger, 
      fejl: null, 
      success: 'Produkt oprettet!' 
    });
  } catch (error) {
    console.error('❌ Fejl ved oprettelse af produkt:', error);
    res.render('opret-produkt', { 
      bruger: req.session.bruger, 
      fejl: 'Der opstod en fejl. Prøv igen.', 
      success: null 
    });
  }
});

module.exports = router;
