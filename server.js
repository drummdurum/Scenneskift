const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'teater-hemmelighed-2025';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy - vigtigt for Railway
if (NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Database setup
const { pool, initializeDatabase } = require('./db');
console.log('📊 Bruger PostgreSQL database');

// Session setup
console.log('🗄️  Konfigurerer PostgreSQL session store...');
const pgSession = require('connect-pg-simple')(session);
const sessionConfig = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: NODE_ENV === 'production',
  cookie: { 
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dage
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax'
  },
  store: new pgSession({
    pool: pool,
    createTableIfMissing: true,
    tableName: 'session'
  })
};
console.log('✅ Session store konfigureret');

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionConfig));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const browseRoutes = require('./routes/browse');
const favoritRoutes = require('./routes/favoritter');
const periodsRoutes = require('./routes/periods');
const consultationRoutes = require('./routes/consultation');
const tilkoebRoutes = require('./routes/tilkoeb');

// Public routes
app.get('/', (req, res) => {
  res.render('index', { bruger: req.session.bruger });
});

// Mount routes
app.use('/', authRoutes);                              // /login, /logout, /registrer
app.use('/produkter', productRoutes);                  // /produkter, /produkter/:id
app.use('/produkt', productRoutes);                    // /produkt/:id (alias)
app.use('/dashboard', dashboardRoutes);                // /dashboard, /dashboard/opret-produkt
app.use('/admin', adminRoutes);                        // /admin/*
app.use('/browse', browseRoutes);                      // /browse
app.use('/favorit', browseRoutes);                     // /favorit/:id (toggle favorit)
app.use('/favoritter', favoritRoutes);                 // /favoritter (vis favoritter)
app.use('/forestillingsperioder', periodsRoutes);      // /forestillingsperioder
app.use('/konsultation', consultationRoutes);          // /konsultation
app.use('/tilkoeb', tilkoebRoutes);                    // /tilkoeb

// Start server
async function startServer() {
  try {
    // Initialiser database
    if (initializeDatabase) {
      await initializeDatabase();
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Serveren kører på port ${PORT}`);
      console.log(`📦 Environment: ${NODE_ENV}`);
      if (NODE_ENV === 'development') {
        console.log(`🌐 Lokal URL: http://localhost:${PORT}`);
        console.log('👑 Admin login: brugernavn=admin, password=admin123');
      }
    });
  } catch (error) {
    console.error('❌ Fejl ved start af server:', error);
    process.exit(1);
  }
}

startServer();
