const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const ProduktDB = require('../models/ProduktDB');

// Vis alle produkter (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM produkter WHERE skjult = false ORDER BY id'
    );
    res.render('produkter', { 
      produkter: result.rows, 
      bruger: req.session.bruger 
    });
  } catch (error) {
    console.error('❌ Fejl ved hentning af produkter:', error);
    res.render('produkter', { produkter: [], bruger: req.session.bruger });
  }
});

// Vis produkt detaljer
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM produkter WHERE id = $1',
      [parseInt(req.params.id)]
    );
    
    const produkt = result.rows[0];
    
    if (!produkt) {
      return res.status(404).send('Produkt ikke fundet');
    }
    
    res.render('produkt-detalje', { 
      produkt, 
      bruger: req.session.bruger, 
      fejl: null, 
      success: null 
    });
  } catch (error) {
    console.error('❌ Fejl ved hentning af produkt:', error);
    res.status(500).send('Der opstod en fejl');
  }
});

// Reserver produkt
router.post('/:id/reserver', async (req, res) => {
  if (!req.session.bruger) {
    return res.redirect('/login');
  }
  
  const { fraDato, tilDato } = req.body;
  const produktId = parseInt(req.params.id);
  
  try {
    const result = await pool.query(
      'SELECT * FROM produkter WHERE id = $1',
      [produktId]
    );
    
    const produkt = result.rows[0];
    
    if (!produkt) {
      return res.status(404).send('Produkt ikke fundet');
    }

    // Tjek om datoer er gyldige
    const fra = new Date(fraDato);
    const til = new Date(tilDato);
    
    if (fra >= til) {
      return res.render('produkt-detalje', { 
        produkt, 
        bruger: req.session.bruger, 
        fejl: 'Til-dato skal være efter fra-dato', 
        success: null 
      });
    }

    // Tjek om produktet allerede er reserveret i denne periode
    const reservationer = produkt.reservationer || [];
    
    const harKonflikt = reservationer.some(res => {
      const resFra = new Date(res.fraDato);
      const resTil = new Date(res.tilDato);
      return (fra <= resTil && til >= resFra);
    });

    if (harKonflikt) {
      return res.render('produkt-detalje', { 
        produkt, 
        bruger: req.session.bruger, 
        fejl: 'Produktet er allerede reserveret i denne periode', 
        success: null 
      });
    }

    // Tilføj reservation
    const nyReservation = {
      fraDato,
      tilDato,
      bruger: req.session.bruger.brugernavn,
      teaternavn: req.session.bruger.teaternavn
    };
    
    reservationer.push(nyReservation);
    
    await pool.query(
      'UPDATE produkter SET reservationer = $1 WHERE id = $2',
      [JSON.stringify(reservationer), produktId]
    );

    // Hent opdateret produkt
    const opdateretResult = await pool.query(
      'SELECT * FROM produkter WHERE id = $1',
      [produktId]
    );

    res.render('produkt-detalje', { 
      produkt: opdateretResult.rows[0], 
      bruger: req.session.bruger, 
      fejl: null, 
      success: 'Produkt reserveret!' 
    });
  } catch (error) {
    console.error('❌ Fejl ved reservation:', error);
    res.status(500).send('Der opstod en fejl');
  }
});

// Skjul/vis produkt (toggle)
router.post('/:id/skjul', async (req, res) => {
  if (!req.session.bruger) {
    return res.redirect('/login');
  }
  
  try {
    const produktId = parseInt(req.params.id);
    const result = await pool.query(
      'SELECT * FROM produkter WHERE id = $1',
      [produktId]
    );
    
    const produkt = result.rows[0];
    
    // Tjek at brugeren ejer produktet
    if (produkt && produkt.ejer_bruger_id === req.session.bruger.id) {
      await pool.query(
        'UPDATE produkter SET skjult = NOT skjult WHERE id = $1',
        [produktId]
      );
    }
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('❌ Fejl ved skjul/vis produkt:', error);
    res.redirect('/dashboard');
  }
});

module.exports = router;
