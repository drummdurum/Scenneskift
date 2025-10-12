# 🔄 Server Sammenligning - Før & Efter

## 📊 Statistik

### server_old.js
```
📄 1 fil
📏 613 linjer kode
🔧 Svær at vedligeholde
😵 Svær at navigere
🐛 Svær at debugge
```

### server-new.js + routes/
```
📄 11 filer total
📏 ~90 linjer per fil (gennemsnit)
🔧 Let at vedligeholde
😊 Let at navigere
🎯 Let at debugge
```

## 🗂️ Filfordeling

```
server-new.js (90 linjer)
├── Imports & setup (40 linjer)
├── Middleware (10 linjer)
├── Route mounting (20 linjer)
└── Server start (20 linjer)

middleware/auth.js (30 linjer)
├── authMiddleware
└── adminMiddleware

routes/
├── auth.js (150 linjer)
│   ├── GET  /login
│   ├── POST /login
│   ├── GET  /registrer
│   ├── POST /registrer
│   └── GET  /logout
│
├── products.js (140 linjer)
│   ├── GET  /produkter
│   ├── GET  /produkt/:id
│   ├── POST /produkt/:id/reserver
│   └── POST /produkt/:id/skjul
│
├── dashboard.js (70 linjer)
│   ├── GET  /dashboard
│   ├── GET  /dashboard/opret-produkt
│   └── POST /dashboard/opret-produkt
│
├── admin.js (90 linjer)
│   ├── GET  /admin
│   ├── POST /admin/godkend/:id
│   ├── POST /admin/deaktiver/:id
│   └── POST /admin/slet-produkt/:id
│
├── browse.js (150 linjer)
│   ├── GET  /browse
│   ├── POST /browse/favorit/:id
│   └── GET  /favoritter
│
├── periods.js (90 linjer)
│   ├── GET  /forestillingsperioder
│   ├── POST /forestillingsperioder
│   └── POST /forestillingsperioder/slet/:id
│
├── consultation.js (60 linjer)
│   ├── GET  /konsultation
│   └── POST /konsultation
│
└── tilkoeb.js (20 linjer)
    └── GET  /tilkoeb
```

## 🎯 Hovedforskelle

### Før (server_old.js)
```javascript
// Alt i én fil - uoverskueligt!
const express = require('express');
// ... 50 linjer setup ...

// Middleware defineret inline
const authMiddleware = (req, res, next) => { ... }
const adminMiddleware = (req, res, next) => { ... }

// Routes blandet sammen
app.get('/', (req, res) => { ... })
app.get('/produkter', (req, res) => { ... })
app.post('/login', async (req, res) => { ... })
app.get('/admin', adminMiddleware, (req, res) => { ... })
// ... 500+ linjer mere ...

app.listen(PORT, () => { ... })
```

### Efter (server-new.js)
```javascript
// Clean og overskuelig!
const express = require('express');
// ... imports ...

// Setup
const app = express();
// ... middleware setup ...

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
// ... flere routes ...

// Mount routes
app.use('/', authRoutes);
app.use('/produkter', productRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/admin', adminRoutes);
// ... etc ...

// Start server
startServer();
```

### Middleware (middleware/auth.js)
```javascript
// Genbrugelig middleware i separat fil
const authMiddleware = (req, res, next) => { ... }
const adminMiddleware = (req, res, next) => { ... }

module.exports = { authMiddleware, adminMiddleware };
```

### Eksempel Route Fil (routes/auth.js)
```javascript
// Fokuseret på én ting - authentication
const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => { ... });
router.post('/login', async (req, res) => { ... });
router.get('/registrer', (req, res) => { ... });
router.post('/registrer', async (req, res) => { ... });
router.get('/logout', (req, res) => { ... });

module.exports = router;
```

## ✅ Fordele ved ny struktur

### 1. Separation of Concerns
- Hver fil har ét ansvar
- Lettere at forstå hvad koden gør

### 2. Vedligeholdelse
```
Gammel: "Hvor er login koden?"
→ "Søg i 613 linjer..." 😰

Ny: "Hvor er login koden?"
→ "routes/auth.js" ✅
```

### 3. Debugging
```
Gammel: "Der er en fejl i produkt routes..."
→ Søg gennem hele server_old.js

Ny: "Der er en fejl i produkt routes..."
→ Åbn routes/products.js direkte
```

### 4. Teamwork
```
Gammel:
Dev A: Arbejder på admin features
Dev B: Arbejder på produkter
→ Merge conflicts guaranteed! 💥

Ny:
Dev A: Arbejder i routes/admin.js
Dev B: Arbejder i routes/products.js
→ No conflicts! 🎉
```

### 5. Testing
```
Gammel:
Test alt i én stor fil = komplekst

Ny:
Test hver route fil separat = simpelt
```

## 🚀 Hurtig Reference

### Hvornår skal jeg redigere hvilken fil?

| Ændring | Fil |
|---------|-----|
| Login/logout logik | `routes/auth.js` |
| Produkt visning/reservation | `routes/products.js` |
| Dashboard/opret produkt | `routes/dashboard.js` |
| Admin panel features | `routes/admin.js` |
| Browse/favoritter | `routes/browse.js` |
| Forestillingsperioder | `routes/periods.js` |
| Konsultation | `routes/consultation.js` |
| Tilkøb | `routes/tilkoeb.js` |
| Auth middleware | `middleware/auth.js` |
| Server setup/config | `server-new.js` |

## 📝 Konklusion

### Gammel server (server_old.js)
❌ 613 linjer i én fil  
❌ Svært at finde kode  
❌ Risiko for merge conflicts  
❌ Svært at teste  
❌ Lang læringskurve  

### Ny server (server-new.js + routes/)
✅ ~60 linjer per fil  
✅ Intuitiv struktur  
✅ Minimal merge conflict risiko  
✅ Let at teste individuelt  
✅ Hurtig onboarding  

## 🎊 Klar til Railway!

Din kode er nu professionelt struktureret og klar til deployment! 🚀

Se `RAILWAY-DEPLOYMENT.md` for deploy instruktioner.
