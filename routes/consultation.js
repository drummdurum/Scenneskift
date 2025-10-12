const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { pool } = require('../db');

// Alle routes bruger authMiddleware
router.use(authMiddleware);

// Vis konsultation side
router.get('/', (req, res) => {
  res.render('konsultation', { 
    bruger: req.session.bruger,
    success: null,
    fejl: null
  });
});

// Book konsultation
router.post('/', async (req, res) => {
  const { dato, tidspunkt, beskrivelse } = req.body;
  
  if (!dato || !tidspunkt || !beskrivelse) {
    return res.render('konsultation', {
      bruger: req.session.bruger,
      success: null,
      fejl: 'Udfyld venligst alle felter'
    });
  }
  
  try {
    // Hent brugerens nuværende konsultationer
    const result = await pool.query(
      'SELECT konsultationer FROM brugere WHERE id = $1',
      [req.session.bruger.id]
    );
    
    let konsultationer = result.rows[0]?.konsultationer || [];
    
    // Tilføj ny konsultation
    konsultationer.push({
      id: Date.now(),
      dato,
      tidspunkt,
      beskrivelse,
      status: 'afventer',
      oprettet: new Date().toISOString()
    });
    
    // Opdater i database
    await pool.query(
      'UPDATE brugere SET konsultationer = $1 WHERE id = $2',
      [JSON.stringify(konsultationer), req.session.bruger.id]
    );
    
    res.render('konsultation', {
      bruger: req.session.bruger,
      success: 'Din konsultation er booket! Vi kontakter dig snart.',
      fejl: null
    });
  } catch (error) {
    console.error('❌ Fejl ved booking af konsultation:', error);
    res.render('konsultation', {
      bruger: req.session.bruger,
      success: null,
      fejl: 'Der opstod en fejl. Prøv igen.'
    });
  }
});

module.exports = router;
