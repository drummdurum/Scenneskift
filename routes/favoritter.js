const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { pool } = require('../db');

// Auth middleware for alle routes
router.use(authMiddleware);

// Vis favoritter - monteret på /favoritter, så route er '/'
router.get('/', async (req, res) => {
  try {
    // Hent brugerens favoritter
    const brugerResult = await pool.query(
      'SELECT favoritter FROM brugere WHERE id = $1',
      [req.session.bruger.id]
    );
    
    const favoritter = brugerResult.rows[0]?.favoritter || [];
    
    console.log('🔍 Bruger favoritter array:', favoritter);
    console.log('🔍 Antal favoritter:', favoritter.length);
    
    if (favoritter.length === 0) {
      return res.render('favoritter', { 
        bruger: req.session.bruger, 
        produkter: [] 
      });
    }
    
    // Hent favoritprodukter - brug = ANY for PostgreSQL array
    const produkterResult = await pool.query(
      'SELECT * FROM produkter WHERE id = ANY($1::int[])',
      [favoritter]
    );
    
    console.log('🔍 Fundet favorit produkter:', produkterResult.rows.length);
    console.log('🔍 Produkt IDs:', produkterResult.rows.map(p => p.id));
    
    // Hent alle brugere for teater information
    const brugereResult = await pool.query('SELECT * FROM brugere');
    const brugere = brugereResult.rows;
    
    // Tilføj teater information
    const produkterMedTeater = produkterResult.rows.map(p => {
      const ejer = brugere.find(b => b.id === p.ejer_bruger_id);
      return {
        ...p,
        teaterNavn: ejer ? ejer.teaternavn : 'Ukendt',
        teaterLokation: ejer ? ejer.lokation : 'Ukendt'
      };
    });
    
    res.render('favoritter', { 
      bruger: req.session.bruger, 
      produkter: produkterMedTeater 
    });
  } catch (error) {
    console.error('❌ Fejl ved hentning af favoritter:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    res.render('favoritter', { 
      bruger: req.session.bruger, 
      produkter: [] 
    });
  }
});

module.exports = router;
