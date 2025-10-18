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
const debugRoutes = require('./routes/debug');

// Public routes
app.get('/', (req, res) => {
  res.render('index', { 
    bruger: req.session.bruger,
    title: 'Forside - Udlejning af Teaterrekvisitter',
    description: 'SceneSkift - Din platform for udlejning af teaterrekvisitter og sceneudstyr. Find alt hvad du har brug for til din næste forestilling.',
    path: '/',
    currentPage: 'home'
  });
});

// Redirect for opret-produkt (backward compatibility)
app.get('/opret-produkt', (req, res) => {
  res.redirect('/dashboard/opret-produkt');
});

app.post('/opret-produkt', (req, res) => {
  res.redirect(307, '/dashboard/opret-produkt');
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
app.use('/debug-brugere', debugRoutes);                // /debug-brugere (KUN development)

// SEO routes
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    const { pool } = require('./db');
    
    // Hent alle produkter til sitemap
    const produkterResult = await pool.query('SELECT id, updated_at FROM produkter ORDER BY id');
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://scenneskift.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://scenneskift.com/produkter</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://scenneskift.com/browse</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://scenneskift.com/konsultation</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

    // Tilføj alle produkter
    produkterResult.rows.forEach(produkt => {
      const lastmod = produkt.updated_at ? new Date(produkt.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      sitemap += `
  <url>
    <loc>https://scenneskift.com/produkter/${produkt.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    res.type('application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Fejl ved generering af sitemap:', error);
    res.status(500).send('Fejl ved generering af sitemap');
  }
});

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
