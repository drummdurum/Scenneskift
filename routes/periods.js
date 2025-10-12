const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { pool } = require('../db');

// Alle routes bruger authMiddleware
router.use(authMiddleware);

// Vis forestillingsperioder
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT forestillingsperioder FROM brugere WHERE id = $1',
      [req.session.bruger.id]
    );
    
    const perioder = result.rows[0]?.forestillingsperioder || [];
    
    res.render('forestillingsperioder', { 
      bruger: req.session.bruger,
      perioder: perioder
    });
  } catch (error) {
    console.error('❌ Fejl ved hentning af forestillingsperioder:', error);
    res.render('forestillingsperioder', { 
      bruger: req.session.bruger,
      perioder: []
    });
  }
});

// Tilføj forestillingsperiode
router.post('/', async (req, res) => {
  const { titel, fraDato, tilDato } = req.body;
  
  try {
    // Hent nuværende perioder
    const result = await pool.query(
      'SELECT forestillingsperioder FROM brugere WHERE id = $1',
      [req.session.bruger.id]
    );
    
    let perioder = result.rows[0]?.forestillingsperioder || [];
    
    // Tilføj ny periode
    perioder.push({
      id: Date.now(),
      titel,
      fraDato,
      tilDato
    });
    
    // Opdater i database
    await pool.query(
      'UPDATE brugere SET forestillingsperioder = $1 WHERE id = $2',
      [JSON.stringify(perioder), req.session.bruger.id]
    );
    
    res.redirect('/forestillingsperioder');
  } catch (error) {
    console.error('❌ Fejl ved tilføjelse af forestillingsperiode:', error);
    res.redirect('/forestillingsperioder');
  }
});

// Slet forestillingsperiode
router.post('/slet/:id', async (req, res) => {
  try {
    const periodeId = parseInt(req.params.id);
    
    // Hent nuværende perioder
    const result = await pool.query(
      'SELECT forestillingsperioder FROM brugere WHERE id = $1',
      [req.session.bruger.id]
    );
    
    let perioder = result.rows[0]?.forestillingsperioder || [];
    
    // Filtrer væk den slettede periode
    perioder = perioder.filter(p => p.id !== periodeId);
    
    // Opdater i database
    await pool.query(
      'UPDATE brugere SET forestillingsperioder = $1 WHERE id = $2',
      [JSON.stringify(perioder), req.session.bruger.id]
    );
    
    res.redirect('/forestillingsperioder');
  } catch (error) {
    console.error('❌ Fejl ved sletning af forestillingsperiode:', error);
    res.redirect('/forestillingsperioder');
  }
});

module.exports = router;
