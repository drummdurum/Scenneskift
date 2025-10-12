const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'teater-hemmelighed-2025';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dage
    httpOnly: true,
    secure: NODE_ENV === 'production' // Sæt til true i produktion (HTTPS)
  }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Sørg for at data mappen eksisterer
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data', { recursive: true });
}

// Initialiser data filer hvis de ikke eksisterer
const initializeDataFiles = () => {
  // Standard brugere
  const defaultBrugere = [
    {
      "id": 1,
      "brugernavn": "admin",
      "password": "$2a$10$1puYu9yUU4tWb8AivGy43OT3kpaN1A/f9zUxGbrR0uW/ov.HJkr8G",
      "rolle": "admin",
      "aktiv": true,
      "navn": "Administrator",
      "type": "admin",
      "teaternavn": "SceneSkift Hovedkontor",
      "lokation": "Aarhus",
      "favoritter": [],
      "forestillingsperioder": [],
      "points": 500
    },
    {
      "id": 2,
      "brugernavn": "drumm",
      "password": "$2a$10$iSpgYMrRH60b.cuUIIoLjuiAnlK4IvD7RADc3LfTWGNQJlWfCwSuW",
      "rolle": "teater",
      "aktiv": true,
      "navn": "sebastian",
      "type": "teater",
      "teaternavn": "Det Kongelige Teater",
      "lokation": "København",
      "favoritter": [],
      "forestillingsperioder": [],
      "points": 250
    }
  ];

  // Standard produkter
  const defaultProdukter = [
    {
      "id": 1,
      "navn": "Venetiansk Maske",
      "beskrivelse": "Elegant håndlavet venetiansk maske med guld ornamentik. Perfekt til maskeradescener.",
      "pris": "350 kr/dag",
      "billede": "/images/maske.jpg",
      "ejerBrugerId": 2,
      "skjult": false,
      "kategori": {
        "størrelse": "Lille",
        "æra": "Renaissance",
        "type": "Kostume tilbehør"
      },
      "reservationer": []
    }
  ];

  if (!fs.existsSync('./data/brugere.json')) {
    fs.writeFileSync('./data/brugere.json', JSON.stringify(defaultBrugere, null, 2));
    console.log('✅ Initialiserede brugere.json med standard data');
  }

  if (!fs.existsSync('./data/produkter.json')) {
    fs.writeFileSync('./data/produkter.json', JSON.stringify(defaultProdukter, null, 2));
    console.log('✅ Initialiserede produkter.json med standard data');
  }
};

// Initialiser data ved opstart
initializeDataFiles();

// Helper functions
const læsBrugere = () => {
  try {
    const data = fs.readFileSync('./data/brugere.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Fejl ved læsning af brugere:', error);
    return [];
  }
};

const gemBrugere = (brugere) => {
  try {
    fs.writeFileSync('./data/brugere.json', JSON.stringify(brugere, null, 2));
  } catch (error) {
    console.error('Fejl ved gemning af brugere:', error);
  }
};

const læsProdukter = () => {
  try {
    const data = fs.readFileSync('./data/produkter.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Fejl ved læsning af produkter:', error);
    return [];
  }
};

const gemProdukter = (produkter) => {
  try {
    fs.writeFileSync('./data/produkter.json', JSON.stringify(produkter, null, 2));
  } catch (error) {
    console.error('Fejl ved gemning af produkter:', error);
  }
};

// Middleware til at tjekke om bruger er logget ind
const authMiddleware = (req, res, next) => {
  if (req.session.bruger) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Middleware til at tjekke om bruger er admin
const adminMiddleware = (req, res, next) => {
  if (req.session.bruger && req.session.bruger.rolle === 'admin') {
    next();
  } else {
    res.status(403).send('Adgang nægtet');
  }
};

// Public routes
app.get('/', (req, res) => {
  res.render('index', { bruger: req.session.bruger });
});

app.get('/produkter', (req, res) => {
  const produkter = læsProdukter();
  // Filtrer produkter - vis kun synlige produkter (ikke skjulte)
  const synligeProdukter = produkter.filter(p => !p.skjult);
  res.render('produkter', { produkter: synligeProdukter, bruger: req.session.bruger });
});

// Produkt detalje side
app.get('/produkt/:id', (req, res) => {
  const produkter = læsProdukter();
  const produkt = produkter.find(p => p.id === parseInt(req.params.id));
  
  if (!produkt) {
    return res.status(404).send('Produkt ikke fundet');
  }
  
  res.render('produkt-detalje', { produkt, bruger: req.session.bruger, fejl: null, success: null });
});

// Reserver produkt
app.post('/produkt/:id/reserver', authMiddleware, (req, res) => {
  const { fraDato, tilDato } = req.body;
  const produkter = læsProdukter();
  const produkt = produkter.find(p => p.id === parseInt(req.params.id));
  
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
  if (!produkt.reservationer) {
    produkt.reservationer = [];
  }

  const harKonflikt = produkt.reservationer.some(res => {
    const resfra = new Date(res.fraDato);
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
  produkt.reservationer.push({
    fraDato,
    tilDato,
    bruger: req.session.bruger.brugernavn,
    teaternavn: req.session.bruger.teaternavn
  });

  gemProdukter(produkter);

  // Hent opdateret produkt
  const opdateretProdukter = læsProdukter();
  const opdateretProdukt = opdateretProdukter.find(p => p.id === parseInt(req.params.id));

  res.render('produkt-detalje', { 
    produkt: opdateretProdukt, 
    bruger: req.session.bruger, 
    fejl: null, 
    success: 'Produkt reserveret!' 
  });
});

// Login routes
app.get('/login', (req, res) => {
  res.render('login', { fejl: null });
});

app.post('/login', async (req, res) => {
  const { brugernavn, password } = req.body;
  const brugere = læsBrugere();
  
  const bruger = brugere.find(b => b.brugernavn === brugernavn);
  
  if (!bruger) {
    return res.render('login', { fejl: 'Ugyldig brugernavn eller adgangskode' });
  }

  if (!bruger.aktiv) {
    return res.render('login', { fejl: 'Din konto er deaktiveret. Kontakt admin.' });
  }
  
  const passwordMatch = await bcrypt.compare(password, bruger.password);
  
  if (passwordMatch) {
    req.session.bruger = {
      id: bruger.id,
      brugernavn: bruger.brugernavn,
      rolle: bruger.rolle,
      navn: bruger.navn
    };
    
    if (bruger.rolle === 'admin') {
      res.redirect('/admin');
    } else {
      res.redirect('/dashboard');
    }
  } else {
    res.render('login', { fejl: 'Ugyldig brugernavn eller adgangskode' });
  }
});

app.get('/registrer', (req, res) => {
  res.render('registrer', { fejl: null, success: null });
});

app.post('/registrer', async (req, res) => {
  const { brugernavn, password, navn, teaternavn, lokation } = req.body;
  const brugere = læsBrugere();
  
  if (brugere.find(b => b.brugernavn === brugernavn)) {
    return res.render('registrer', { fejl: 'Brugernavn er allerede taget', success: null });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const nyBruger = {
    id: brugere.length + 1,
    brugernavn,
    password: hashedPassword,
    rolle: 'teater',
    aktiv: false, // Skal godkendes af admin
    navn,
    type: 'teater',
    teaternavn: teaternavn || navn,
    lokation: lokation,
    favoritter: [],
    forestillingsperioder: []
  };
  
  brugere.push(nyBruger);
  gemBrugere(brugere);
  
  res.render('registrer', { 
    fejl: null, 
    success: 'Teater-profil oprettet! Vent på godkendelse fra admin.' 
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Protected routes - Dashboard for godkendte brugere
app.get('/dashboard', authMiddleware, (req, res) => {
  const produkter = læsProdukter();
  // Vis kun brugerens egne produkter
  const mineProdukter = produkter.filter(p => p.ejerBrugerId === req.session.bruger.id);
  res.render('dashboard', { bruger: req.session.bruger, produkter: mineProdukter });
});

app.get('/opret-produkt', authMiddleware, (req, res) => {
  res.render('opret-produkt', { bruger: req.session.bruger, fejl: null, success: null });
});

app.post('/opret-produkt', authMiddleware, (req, res) => {
  const { navn, beskrivelse, pris, billede, størrelse, æra, type } = req.body;
  const produkter = læsProdukter();
  
  const nytProdukt = {
    id: produkter.length + 1,
    navn,
    beskrivelse,
    pris,
    billede: billede || '/images/placeholder.jpg',
    ejerBrugerId: req.session.bruger.id,
    skjult: false,
    kategori: {
      størrelse: størrelse,
      æra: æra,
      type: type
    },
    reservationer: []
  };
  
  produkter.push(nytProdukt);
  gemProdukter(produkter);
  
  res.render('opret-produkt', { 
    bruger: req.session.bruger, 
    fejl: null, 
    success: 'Produkt oprettet!' 
  });
});

// Admin routes
app.get('/admin', adminMiddleware, (req, res) => {
  const brugere = læsBrugere();
  const produkter = læsProdukter();
  res.render('admin', { bruger: req.session.bruger, brugere, produkter });
});

app.post('/admin/godkend/:id', adminMiddleware, (req, res) => {
  const brugere = læsBrugere();
  const bruger = brugere.find(b => b.id === parseInt(req.params.id));
  
  if (bruger) {
    bruger.aktiv = true;
    gemBrugere(brugere);
  }
  
  res.redirect('/admin');
});

app.post('/admin/deaktiver/:id', adminMiddleware, (req, res) => {
  const brugere = læsBrugere();
  const bruger = brugere.find(b => b.id === parseInt(req.params.id));
  
  if (bruger && bruger.rolle !== 'admin') {
    bruger.aktiv = false;
    gemBrugere(brugere);
  }
  
  res.redirect('/admin');
});

app.post('/admin/slet-produkt/:id', adminMiddleware, (req, res) => {
  let produkter = læsProdukter();
  produkter = produkter.filter(p => p.id !== parseInt(req.params.id));
  gemProdukter(produkter);
  res.redirect('/admin');
});

// Route til at skjule/vise produkter (for teater-brugere)
app.post('/produkt/:id/skjul', authMiddleware, (req, res) => {
  const produkter = læsProdukter();
  const produkt = produkter.find(p => p.id === parseInt(req.params.id));
  
  // Tjek at brugeren ejer produktet
  if (produkt && produkt.ejerBrugerId === req.session.bruger.id) {
    produkt.skjult = !produkt.skjult; // Toggle skjult status
    gemProdukter(produkter);
  }
  
  res.redirect('/dashboard');
});

// Browse andre teatres rekvisitter
app.get('/browse', authMiddleware, (req, res) => {
  const produkter = læsProdukter();
  const brugere = læsBrugere();
  const bruger = brugere.find(b => b.id === req.session.bruger.id);
  
  // Filtrer: vis kun synlige produkter fra andre teatre
  let andreProdukter = produkter.filter(p => 
    !p.skjult && p.ejerBrugerId !== req.session.bruger.id
  );
  
  // Hvis der er valgt en periode, filtrer på tilgængelighed
  const fraDato = req.query.fraDato;
  const tilDato = req.query.tilDato;
  
  // Tilføj teater information og tilgængelighed til hvert produkt
  const produkterMedTeater = andreProdukter.map(p => {
    const ejer = brugere.find(b => b.id === p.ejerBrugerId);
    
    let erLedig = true;
    
    if (fraDato && tilDato) {
      const søgFra = new Date(fraDato);
      const søgTil = new Date(tilDato);
      
      // Tjek om produktet har reservationer der overlapper med søgeperioden
      const harKonflikt = p.reservationer.some(res => {
        const resFra = new Date(res.fraDato);
        const resTil = new Date(res.tilDato);
        return (søgFra <= resTil && søgTil >= resFra);
      });
      
      // Tjek om ejeren har en forestillingsperiode der overlapper
      const ejerOptaget = ejer?.forestillingsperioder?.some(periode => {
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
    favoritter: bruger.favoritter || [],
    søgFraDato: fraDato || '',
    søgTilDato: tilDato || ''
  });
});

// Tilføj/fjern favorit
app.post('/favorit/:id', authMiddleware, (req, res) => {
  const brugere = læsBrugere();
  const bruger = brugere.find(b => b.id === req.session.bruger.id);
  const produktId = parseInt(req.params.id);
  
  if (!bruger.favoritter) {
    bruger.favoritter = [];
  }
  
  const index = bruger.favoritter.indexOf(produktId);
  if (index > -1) {
    bruger.favoritter.splice(index, 1); // Fjern favorit
  } else {
    bruger.favoritter.push(produktId); // Tilføj favorit
  }
  
  gemBrugere(brugere);
  res.redirect('/browse');
});

// Mine favoritter
app.get('/favoritter', authMiddleware, (req, res) => {
  const produkter = læsProdukter();
  const brugere = læsBrugere();
  const bruger = brugere.find(b => b.id === req.session.bruger.id);
  
  const favoritProdukter = produkter.filter(p => 
    bruger.favoritter && bruger.favoritter.includes(p.id)
  );
  
  // Tilføj teater information
  const produkterMedTeater = favoritProdukter.map(p => {
    const ejer = brugere.find(b => b.id === p.ejerBrugerId);
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
});

// Forestillingsperioder
app.get('/forestillingsperioder', authMiddleware, (req, res) => {
  const brugere = læsBrugere();
  const bruger = brugere.find(b => b.id === req.session.bruger.id);
  
  res.render('forestillingsperioder', { 
    bruger: req.session.bruger,
    perioder: bruger.forestillingsperioder || []
  });
});

app.post('/forestillingsperioder', authMiddleware, (req, res) => {
  const { titel, fraDato, tilDato } = req.body;
  const brugere = læsBrugere();
  const bruger = brugere.find(b => b.id === req.session.bruger.id);
  
  if (!bruger.forestillingsperioder) {
    bruger.forestillingsperioder = [];
  }
  
  bruger.forestillingsperioder.push({
    id: Date.now(),
    titel,
    fraDato,
    tilDato
  });
  
  gemBrugere(brugere);
  
  // IKKE længere automatisk skjul produkter - brugeren styrer det manuelt
  
  res.redirect('/forestillingsperioder');
});

app.post('/forestillingsperioder/slet/:id', authMiddleware, (req, res) => {
  const brugere = læsBrugere();
  const bruger = brugere.find(b => b.id === req.session.bruger.id);
  
  bruger.forestillingsperioder = bruger.forestillingsperioder.filter(
    p => p.id !== parseInt(req.params.id)
  );
  
  gemBrugere(brugere);
  res.redirect('/forestillingsperioder');
});

// Konsultation booking
app.get('/konsultation', authMiddleware, (req, res) => {
  res.render('konsultation', { 
    bruger: req.session.bruger,
    success: null,
    fejl: null
  });
});

app.post('/konsultation', authMiddleware, (req, res) => {
  const { dato, tidspunkt, beskrivelse } = req.body;
  
  if (!dato || !tidspunkt || !beskrivelse) {
    return res.render('konsultation', {
      bruger: req.session.bruger,
      success: null,
      fejl: 'Udfyld venligst alle felter'
    });
  }
  
  const brugere = læsBrugere();
  const bruger = brugere.find(b => b.id === req.session.bruger.id);
  
  if (!bruger.konsultationer) {
    bruger.konsultationer = [];
  }
  
  bruger.konsultationer.push({
    id: Date.now(),
    dato,
    tidspunkt,
    beskrivelse,
    status: 'afventer',
    oprettet: new Date().toISOString()
  });
  
  gemBrugere(brugere);
  
  res.render('konsultation', {
    bruger: req.session.bruger,
    success: 'Din konsultation er booket! Vi kontakter dig snart.',
    fejl: null
  });
});

// Tilkøb (Add-ons) page
app.get('/tilkoeb', authMiddleware, (req, res) => {
  res.render('tilkøb', { 
    bruger: req.session.bruger
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveren kører på port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  if (NODE_ENV === 'development') {
    console.log(`Lokal URL: http://localhost:${PORT}`);
    console.log('Admin login: brugernavn=admin, password=admin123');
  }
});
