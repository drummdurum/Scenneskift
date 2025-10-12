const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { pool } = require('../db');

// Alle routes bruger authMiddleware
router.use(authMiddleware);

// Browse andre teatres rekvisitter
router.get('/', async (req, res) => {
  try {
    const fraDato = req.query.fraDato;
    const tilDato = req.query.tilDato;
    
    // Hent alle synlige produkter fra andre teatre
    const produkterResult = await pool.query(
      'SELECT * FROM produkter WHERE skjult = false AND ejer_bruger_id != $1 ORDER BY id',
      [req.session.bruger.id]
    );
    
    // Hent alle brugere for teater information
    const brugereResult = await pool.query('SELECT * FROM brugere');
    const brugere = brugereResult.rows;
    
    // Hent brugerens egne favoritter
    const brugerResult = await pool.query(
      'SELECT favoritter FROM brugere WHERE id = $1',
      [req.session.bruger.id]
    );
    const favoritter = brugerResult.rows[0]?.favoritter || [];
    
    // Hent brugerens forestillingsperioder fra forestillingsperioder tabel
    const perioderResult = await pool.query(
      'SELECT * FROM forestillingsperioder WHERE bruger_id = $1 ORDER BY fra_dato',
      [req.session.bruger.id]
    );
    const forestillingsperioder = perioderResult.rows;
    
    // Hent alle reservationer hvis der søges med datoer
    let alleReservationer = [];
    if (fraDato && tilDato) {
      const reservationerResult = await pool.query('SELECT * FROM reservationer');
      alleReservationer = reservationerResult.rows;
    }
    
    // Tilføj teater information og tilgængelighed til hvert produkt
    const produkterMedTeater = produkterResult.rows.map(p => {
      const ejer = brugere.find(b => b.id === p.ejer_bruger_id);
      
      let erLedig = true;
      
      if (fraDato && tilDato) {
        const søgFra = new Date(fraDato);
        const søgTil = new Date(tilDato);
        
        // Tjek om produktet har reservationer der overlapper med søgeperioden (fra reservationer tabel)
        const produktReservationer = alleReservationer.filter(r => r.produkt_id === p.id);
        const harKonflikt = produktReservationer.some(res => {
          const resFra = new Date(res.fra_dato);
          const resTil = new Date(res.til_dato);
          return (søgFra <= resTil && søgTil >= resFra);
        });
        
        // Tjek om ejeren har en forestillingsperiode der overlapper
        const forestillingsperioder = ejer?.forestillingsperioder || [];
        const ejerOptaget = forestillingsperioder.some(periode => {
          const periodeFra = new Date(periode.fraDato);
          const periodeTil = new Date(periode.tilDato);
          return (søgFra <= periodeTil && søgTil >= periodeFra);
        });
        
        erLedig = !harKonflikt && !ejerOptaget;
      }
      
      return {
        ...p,
        teaterNavn: ejer ? ejer.teaternavn : 'Ukendt',
        teaterLokation: ejer ? ejer.lokation : 'Ukendt',
        erLedig: erLedig
      };
    });
    
    res.render('browse', { 
      bruger: req.session.bruger, 
      produkter: produkterMedTeater,
      favoritter: favoritter,
      forestillingsperioder: forestillingsperioder,
      søgFraDato: fraDato || '',
      søgTilDato: tilDato || ''
    });
  } catch (error) {
    console.error('❌ Fejl ved browse:', error);
    res.render('browse', { 
      bruger: req.session.bruger, 
      produkter: [],
      favoritter: [],
      forestillingsperioder: [],
      søgFraDato: '',
      søgTilDato: ''
    });
  }
});

// Tilføj/fjern favorit - FIX: ændret til at håndtere både /favorit/:id og /browse/favorit/:id
router.post('/:id', async (req, res) => {
  try {
    const produktId = parseInt(req.params.id);
    
    // Hent brugerens nuværende favoritter
    const result = await pool.query(
      'SELECT favoritter FROM brugere WHERE id = $1',
      [req.session.bruger.id]
    );
    
    let favoritter = result.rows[0]?.favoritter || [];
    
    const index = favoritter.indexOf(produktId);
    if (index > -1) {
      favoritter.splice(index, 1); // Fjern favorit
    } else {
      favoritter.push(produktId); // Tilføj favorit
    }
    
    // Opdater i database med array format
    await pool.query(
      'UPDATE brugere SET favoritter = $1 WHERE id = $2',
      [favoritter, req.session.bruger.id]
    );
    
    res.redirect('/browse');
  } catch (error) {
    console.error('❌ Fejl ved opdatering af favoritter:', error);
    res.redirect('/browse');
  }
});

module.exports = router;
