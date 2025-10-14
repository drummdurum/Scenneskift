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
    const produktId = parseInt(req.params.id);
    
    // Hent produkt
    const result = await pool.query(
      'SELECT * FROM produkter WHERE id = $1',
      [produktId]
    );
    
    const produkt = result.rows[0];
    
    if (!produkt) {
      return res.status(404).send('Produkt ikke fundet');
    }
    
    // Hent ejer information (kan være null hvis bruger er slettet)
    let ejer = null;
    if (produkt.ejer_bruger_id) {
      const ejerResult = await pool.query(
        'SELECT id, teaternavn, email, lokation FROM brugere WHERE id = $1',
        [produkt.ejer_bruger_id]
      );
      ejer = ejerResult.rows[0] || null;
    }
    
    // Hent reservationer for dette produkt fra reservationer tabel
    const reservationerResult = await pool.query(
      'SELECT * FROM reservationer WHERE produkt_id = $1 ORDER BY fra_dato',
      [produktId]
    );
    
    // Tilføj reservationer til produkt objekt med korrekt format
    produkt.reservationer = reservationerResult.rows.map(r => ({
      fraDato: r.fra_dato,
      tilDato: r.til_dato,
      bruger: r.bruger,
      teaternavn: r.teaternavn
    }));
    
    res.render('produkt-detalje', { 
      produkt, 
      ejer: ejer || {},
      bruger: req.session.bruger, 
      fejl: null, 
      success: null 
    });
  } catch (error) {
    console.error('❌ Fejl ved hentning af produkt:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
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
      // Hent ejer information
      let ejer = null;
      if (produkt.ejer_bruger_id) {
        const ejerResult = await pool.query(
          'SELECT id, teaternavn, email, lokation FROM brugere WHERE id = $1',
          [produkt.ejer_bruger_id]
        );
        ejer = ejerResult.rows[0] || null;
      }
      
      return res.render('produkt-detalje', { 
        produkt, 
        ejer: ejer || {},
        bruger: req.session.bruger, 
        fejl: 'Til-dato skal være efter fra-dato', 
        success: null 
      });
    }

    // Tjek om produktet allerede er reserveret i denne periode (fra reservationer tabel)
    const konfliktCheck = await pool.query(
      `SELECT * FROM reservationer 
       WHERE produkt_id = $1 
       AND (
         (fra_dato <= $2 AND til_dato >= $2) OR
         (fra_dato <= $3 AND til_dato >= $3) OR
         (fra_dato >= $2 AND til_dato <= $3)
       )`,
      [produktId, fraDato, tilDato]
    );

    if (konfliktCheck.rows.length > 0) {
      // Hent ejer information
      let ejer = null;
      if (produkt.ejer_bruger_id) {
        const ejerResult = await pool.query(
          'SELECT id, teaternavn, email, lokation FROM brugere WHERE id = $1',
          [produkt.ejer_bruger_id]
        );
        ejer = ejerResult.rows[0] || null;
      }
      
      return res.render('produkt-detalje', { 
        produkt, 
        ejer: ejer || {},
        bruger: req.session.bruger, 
        fejl: 'Produktet er allerede reserveret i denne periode', 
        success: null 
      });
    }

    // Tilføj reservation til reservationer tabel
    await pool.query(
      `INSERT INTO reservationer (produkt_id, bruger, teaternavn, fra_dato, til_dato)
       VALUES ($1, $2, $3, $4, $5)`,
      [produktId, req.session.bruger.brugernavn, req.session.bruger.teaternavn, fraDato, tilDato]
    );

    // Hent opdateret produkt med reservationer
    const opdateretResult = await pool.query(
      'SELECT * FROM produkter WHERE id = $1',
      [produktId]
    );
    
    const opdateretProdukt = opdateretResult.rows[0];
    
    // Hent reservationer for dette produkt
    const reservationerResult = await pool.query(
      'SELECT * FROM reservationer WHERE produkt_id = $1 ORDER BY fra_dato',
      [produktId]
    );
    
    // Tilføj reservationer til produkt objekt
    opdateretProdukt.reservationer = reservationerResult.rows.map(r => ({
      fraDato: r.fra_dato,
      tilDato: r.til_dato,
      bruger: r.bruger,
      teaternavn: r.teaternavn
    }));

    // Hent ejer information
    let ejer = null;
    if (opdateretProdukt.ejer_bruger_id) {
      const ejerResult = await pool.query(
        'SELECT id, teaternavn, email, lokation FROM brugere WHERE id = $1',
        [opdateretProdukt.ejer_bruger_id]
      );
      ejer = ejerResult.rows[0] || null;
    }

    res.render('produkt-detalje', { 
      produkt: opdateretProdukt, 
      ejer: ejer || {},
      bruger: req.session.bruger, 
      fejl: null, 
      success: 'Produkt reserveret!' 
    });
  } catch (error) {
    console.error('❌ Fejl ved reservation:', error);
    console.error('Error details:', error.message);
    
    // Hent produktet igen for at vise fejl
    try {
      const result = await pool.query(
        'SELECT * FROM produkter WHERE id = $1',
        [produktId]
      );
      
      const produkt = result.rows[0];
      
      // Hent ejer information
      let ejer = null;
      if (produkt.ejer_bruger_id) {
        const ejerResult = await pool.query(
          'SELECT id, teaternavn, email, lokation FROM brugere WHERE id = $1',
          [produkt.ejer_bruger_id]
        );
        ejer = ejerResult.rows[0] || null;
      }
      
      // Hent reservationer
      const reservationerResult = await pool.query(
        'SELECT * FROM reservationer WHERE produkt_id = $1 ORDER BY fra_dato',
        [produktId]
      );
      
      produkt.reservationer = reservationerResult.rows.map(r => ({
        fraDato: r.fra_dato,
        tilDato: r.til_dato,
        bruger: r.bruger,
        teaternavn: r.teaternavn
      }));
      
      res.render('produkt-detalje', { 
        produkt: produkt, 
        ejer: ejer || {},
        bruger: req.session.bruger, 
        fejl: 'Der opstod en fejl ved reservation. Prøv igen.', 
        success: null 
      });
    } catch (innerError) {
      console.error('❌ Fejl ved hentning af produkt efter fejl:', innerError);
      res.status(500).send('Der opstod en fejl');
    }
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

// Send kontakt/forespørgsel om produkt
router.post('/:id/kontakt', async (req, res) => {
  if (!req.session.bruger) {
    return res.redirect('/login');
  }

  const produktId = parseInt(req.params.id);
  const { emne, besked } = req.body;

  try {
    // Hent produkt og ejer info
    const produktResult = await pool.query(
      'SELECT p.*, b.email as ejer_email, b.teaternavn as ejer_teaternavn FROM produkter p JOIN brugere b ON p.ejer_bruger_id = b.id WHERE p.id = $1',
      [produktId]
    );

    const produkt = produktResult.rows[0];

    if (!produkt) {
      return res.status(404).send('Produkt ikke fundet');
    }

    // I en rigtig app ville du sende en email her
    // For nu logger vi bare beskeden
    console.log('📧 Forespørgsel sendt:');
    console.log('Til:', produkt.ejer_email, '(' + produkt.ejer_teaternavn + ')');
    console.log('Fra:', req.session.bruger.email || 'Ingen email', '(' + req.session.bruger.teaternavn + ')');
    console.log('Emne:', emne);
    console.log('Besked:', besked);
    console.log('---');

    // Hent ejer information for at vise siden igen
    const ejerResult = await pool.query(
      'SELECT id, teaternavn, email, lokation FROM brugere WHERE id = $1',
      [produkt.ejer_bruger_id]
    );
    const ejer = ejerResult.rows[0];

    // Hent reservationer
    const reservationerResult = await pool.query(
      'SELECT * FROM reservationer WHERE produkt_id = $1 ORDER BY fra_dato',
      [produktId]
    );

    produkt.reservationer = reservationerResult.rows.map(r => ({
      fraDato: r.fra_dato,
      tilDato: r.til_dato,
      bruger: r.bruger,
      teaternavn: r.teaternavn
    }));

    res.render('produkt-detalje', {
      produkt,
      ejer,
      bruger: req.session.bruger,
      fejl: null,
      success: 'Din forespørgsel er sendt til ' + produkt.ejer_teaternavn + '! De vil kontakte dig på din email.'
    });
  } catch (error) {
    console.error('❌ Fejl ved afsendelse af forespørgsel:', error);
    res.status(500).send('Der opstod en fejl');
  }
});

module.exports = router;
