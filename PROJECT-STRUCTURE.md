# 📁 Projekt Struktur - Efter Refaktorering

## 🌳 Fil Hierarki

```
AI ballade/
│
├── 🚀 SERVER FILER
│   ├── server-new.js              # Ny clean server (90 linjer) ⭐ BRUG DENNE
│   ├── server.js                  # Nuværende server (kan erstattes)
│   ├── server_old.js              # Backup af gamle server
│   └── server.js.backup           # Endnu en backup
│
├── 🗄️ DATABASE
│   ├── db.js                      # PostgreSQL connection & initialization
│   └── migrate-products.js        # Migration script
│
├── 🔐 MIDDLEWARE
│   └── auth.js                    # authMiddleware & adminMiddleware
│
├── 🛣️ ROUTES
│   ├── auth.js                    # Login, logout, registrering
│   ├── products.js                # Produkter, detaljer, reservationer
│   ├── dashboard.js               # Dashboard, opret produkt
│   ├── admin.js                   # Admin panel funktioner
│   ├── browse.js                  # Browse, favoritter
│   ├── periods.js                 # Forestillingsperioder
│   ├── consultation.js            # Konsultation booking
│   └── tilkoeb.js                 # Tilkøb/add-ons
│
├── 📊 MODELS
│   ├── BrugerDB.js                # Bruger database model
│   ├── BrugereFil.js              # Bruger fil model (deprecated)
│   └── ProduktDB.js               # Produkt database model
│
├── 📁 DATA (Legacy - nu i database)
│   ├── brugere.json               # Gamle bruger data
│   └── produkter.json             # Gamle produkt data
│
├── 🎨 VIEWS (EJS Templates)
│   ├── index.ejs                  # Forside
│   ├── login.ejs                  # Login side
│   ├── registrer.ejs              # Registrering
│   ├── dashboard.ejs              # Bruger dashboard
│   ├── produkter.ejs              # Produktliste
│   ├── produkt-detalje.ejs        # Produkt detaljer
│   ├── opret-produkt.ejs          # Opret produkt form
│   ├── browse.ejs                 # Browse andre teatre
│   ├── favoritter.ejs             # Mine favoritter
│   ├── forestillingsperioder.ejs  # Forestillingsperioder
│   ├── konsultation.ejs           # Konsultation booking
│   ├── tilkøb.ejs                 # Tilkøb/add-ons
│   ├── admin.ejs                  # Admin panel
│   └── partials/
│       ├── header.ejs             # Header komponent
│       └── footer.ejs             # Footer komponent
│
├── 🌐 PUBLIC
│   ├── css/
│   │   ├── style.css              # Compiled CSS
│   │   └── input.css              # Tailwind input
│   └── images/
│       ├── hero/                  # Hero billeder
│       ├── icons/                 # Ikoner
│       └── produkter/             # Produkt billeder
│
├── 📝 KONFIGURATION
│   ├── package.json               # NPM dependencies
│   ├── tailwind.config.js         # Tailwind konfiguration
│   ├── nixpacks.toml             # Railway build config
│   └── railway.json              # Railway konfiguration
│
└── 📚 DOKUMENTATION
    ├── README.md                  # Projekt oversigt
    ├── ROUTE-STRUCTURE.md         # Route dokumentation ⭐
    ├── RAILWAY-DEPLOYMENT.md      # Deploy guide ⭐
    ├── RAILWAY-GUIDE.md           # Railway setup
    ├── RAILWAY-INTEGRATION-SUMMARY.md
    ├── QUICK-START-RAILWAY.md
    ├── DEPLOYMENT-CHECKLIST.md
    ├── DATABASE-MIGRATION.md
    ├── MIGRATION-GUIDE.md
    └── POSTGRESQL-SETUP.md

```

## 🔄 Mapping: Gammel vs Ny Struktur

### server_old.js (613 linjer) → Ny Struktur

| Gammel Lokation | Ny Lokation | Linjer |
|----------------|-------------|--------|
| Lines 55-76 | `middleware/auth.js` | 22 |
| Lines 78-85 | `server-new.js` (home route) | 3 |
| Lines 87-168 | `routes/products.js` | 80 |
| Lines 170-262 | `routes/auth.js` | 150 |
| Lines 264-336 | `routes/dashboard.js` | 70 |
| Lines 338-386 | `routes/admin.js` | 90 |
| Lines 388-478 | `routes/browse.js` | 150 |
| Lines 480-549 | `routes/periods.js` | 90 |
| Lines 551-590 | `routes/consultation.js` | 60 |
| Lines 592-598 | `routes/tilkoeb.js` | 20 |
| Lines 600-613 | `server-new.js` (startup) | 15 |

### Resultat
- **Før**: 1 fil × 613 linjer = 613 linjer total
- **Efter**: 10 filer × ~60 linjer gennemsnit = mere overskueligt
- **Gevinst**: 10× mere organiseret! 🎉

## 🎯 Næste Trin

### 1. Test lokalt (valgfrit)
Hvis du har en lokal PostgreSQL database:
```bash
# Sæt miljøvariabler
$env:DATABASE_URL="your-local-db-url"
$env:SESSION_SECRET="test-secret"
$env:NODE_ENV="development"

# Kør ny server
node server-new.js
```

### 2. Deploy til Railway (anbefalet)
```bash
# Erstat server.js med den nye
mv server.js server_old_backup.js
mv server-new.js server.js

# Commit og push
git add .
git commit -m "Refactor: Clean server structure with separate routes"
git push

# Railway deployer automatisk! 🚀
```

### 3. Verificér på Railway
- Tjek logs for fejl
- Test alle routes (se RAILWAY-DEPLOYMENT.md)
- Verificér at database forbindelse virker

## 📈 Fordele ved ny struktur

| Aspekt | Før | Efter |
|--------|-----|-------|
| **Læsbarhed** | 😵 Svær | 😊 Nem |
| **Vedligeholdelse** | 🔧 Krævende | ✅ Let |
| **Debugging** | 🐛 Svært at finde fejl | 🎯 Nemt at isolere |
| **Udvid funktionalitet** | 😰 Risikabelt | 🚀 Sikkert |
| **Team collaboration** | 👎 Merge conflicts | 👍 Smooth |
| **Onboarding** | 📚 Lang læringskurve | ⚡ Hurtig start |

## ✨ Hvad er bevaret?

✅ Alle eksisterende routes
✅ Samme database forbindelse
✅ Samme session håndtering
✅ Samme middleware logik
✅ Alle views (EJS filer)
✅ Alle models
✅ Railway kompatibilitet

## 🚫 Hvad er IKKE ændret?

- Database struktur (db.js)
- View templates (*.ejs)
- Public assets (CSS, images)
- Package dependencies
- Railway konfiguration
- Environment variables

## 🎊 Du er klar!

Følg RAILWAY-DEPLOYMENT.md for at deploye din nye, clean server struktur! 🚀
