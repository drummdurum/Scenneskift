const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const BrugerDB = require('../models/BrugerDB');

// Login side
router.get('/login', (req, res) => {
  res.render('login', { fejl: null });
});

// Login handling
router.post('/login', async (req, res) => {
  const { brugernavn, password } = req.body;
  
  console.log('🔐 Login forsøg:', brugernavn);
  
  try {
    // Brug database
    console.log('📊 Søger i database efter bruger:', brugernavn);
    const result = await pool.query(
      'SELECT * FROM brugere WHERE brugernavn = $1',
      [brugernavn]
    );
    const bruger = result.rows[0];
    
    console.log('🔍 Fundet bruger:', bruger ? 'Ja' : 'Nej');
    if (bruger) {
      console.log('👤 Bruger info:', { 
        id: bruger.id, 
        brugernavn: bruger.brugernavn, 
        rolle: bruger.rolle, 
        aktiv: bruger.aktiv 
      });
    }
    
    if (!bruger) {
      console.log('❌ Bruger ikke fundet');
      return res.render('login', { fejl: 'Ugyldig brugernavn eller adgangskode' });
    }

    if (!bruger.aktiv) {
      console.log('❌ Bruger er ikke aktiv');
      return res.render('login', { fejl: 'Din konto er deaktiveret. Kontakt admin.' });
    }
    
    console.log('🔒 Tjekker password...');
    const passwordMatch = await bcrypt.compare(password, bruger.password);
    console.log('🔓 Password match:', passwordMatch);
    
    if (passwordMatch) {
      console.log('✅ Login success! Opretter session...');
      req.session.bruger = {
        id: bruger.id,
        brugernavn: bruger.brugernavn,
        rolle: bruger.rolle,
        navn: bruger.navn,
        teaternavn: bruger.teaternavn,
        email: bruger.email,
        lokation: bruger.lokation
      };
      
      console.log('📝 Session oprettet:', req.session.bruger);
      
      // Gem session før redirect
      req.session.save((err) => {
        if (err) {
          console.error('❌ Fejl ved gemning af session:', err);
          return res.render('login', { fejl: 'Der opstod en fejl. Prøv igen.' });
        }
        
        console.log('💾 Session gemt succesfuldt');
        
        if (bruger.rolle === 'admin') {
          console.log('➡️  Redirecter til /admin');
          res.redirect('/admin');
        } else {
          console.log('➡️  Redirecter til /dashboard');
          res.redirect('/dashboard');
        }
      });
    } else {
      console.log('❌ Forkert password');
      res.render('login', { fejl: 'Ugyldig brugernavn eller adgangskode' });
    }
  } catch (error) {
    console.error('❌ Database fejl ved login:', error);
    return res.render('login', { fejl: 'Der opstod en fejl. Prøv igen.' });
  }
});

// Registrer side
router.get('/registrer', (req, res) => {
  res.render('registrer', { fejl: null, success: null });
});

// Registrer handling
router.post('/registrer', async (req, res) => {
  const { brugernavn, password, navn, teaternavn, lokation, email } = req.body;
  
  try {
    // Tjek om brugernavnet allerede findes
    const existing = await pool.query(
      'SELECT * FROM brugere WHERE brugernavn = $1',
      [brugernavn]
    );
    
    if (existing.rows.length > 0) {
      return res.render('registrer', { 
        fejl: 'Brugernavn er allerede taget', 
        success: null 
      });
    }
    
    // Tjek om emailen allerede findes
    const existingEmail = await pool.query(
      'SELECT * FROM brugere WHERE email = $1',
      [email]
    );
    
    if (existingEmail.rows.length > 0) {
      return res.render('registrer', { 
        fejl: 'Email er allerede i brug', 
        success: null 
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.query(
      `INSERT INTO brugere (brugernavn, password, rolle, aktiv, navn, type, teaternavn, lokation, email, favoritter)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        brugernavn,
        hashedPassword,
        'teater',
        false, // Skal godkendes af admin
        navn,
        'teater',
        teaternavn || navn,
        lokation,
        email,
        [] // PostgreSQL array format for favoritter
      ]
    );
    
    res.render('registrer', { 
      fejl: null, 
      success: 'Teater-profil oprettet! Vent på godkendelse fra admin.' 
    });
  } catch (error) {
    console.error('❌ Fejl ved registrering:', error);
    res.render('registrer', { 
      fejl: 'Der opstod en fejl. Prøv igen.', 
      success: null 
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
