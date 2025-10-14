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
    
    // Hent kommende reservationer for brugerens produkter
    const reservationerResult = await pool.query(`
      SELECT r.*, p.navn as produkt_navn, p.billede as produkt_billede, 
             b.teaternavn as lejer_teaternavn, b.lokation as lejer_lokation
      FROM reservationer r
      JOIN produkter p ON r.produkt_id = p.id
      JOIN brugere b ON r.bruger_id = b.id
      WHERE p.ejer_bruger_id = $1 
        AND r.til_dato >= CURRENT_DATE
      ORDER BY r.fra_dato ASC
    `, [req.session.bruger.id]);
    
    res.render('dashboard', { 
      bruger: req.session.bruger, 
      produkter: result.rows,
      reservationer: reservationerResult.rows
    });
  } catch (error) {
    console.error('❌ Fejl ved hentning af brugerens produkter:', error);
    res.render('dashboard', { 
      bruger: req.session.bruger, 
      produkter: [],
      reservationer: []
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
  const { navn, beskrivelse, pris, billede, størrelse, æra, type, maa_renoveres } = req.body;
  
  try {
    await pool.query(
      `INSERT INTO produkter (navn, beskrivelse, pris, billede, ejer_bruger_id, skjult, kategori, reservationer, maa_renoveres)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        navn,
        beskrivelse,
        pris,
        billede || '/images/placeholder.jpg',
        req.session.bruger.id,
        false,
        JSON.stringify({ størrelse, æra, type }),
        JSON.stringify([]),
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
