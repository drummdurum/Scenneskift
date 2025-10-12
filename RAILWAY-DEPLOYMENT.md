# 🚂 Railway Deployment Guide - Ny Server Struktur

## 📦 Hvad er ændret?

### Nye filer tilføjet:
```
✅ server-new.js         - Clean hovedserver (klar til at erstatte server.js)
✅ middleware/auth.js    - Authentication middleware
✅ routes/auth.js        - Login/logout routes
✅ routes/products.js    - Produkt routes
✅ routes/dashboard.js   - Dashboard routes
✅ routes/admin.js       - Admin routes
✅ routes/browse.js      - Browse & favoritter routes
✅ routes/periods.js     - Forestillingsperioder routes
✅ routes/consultation.js - Konsultation routes
✅ routes/tilkoeb.js     - Tilkøb routes
```

## 🔄 Deploy til Railway

### Option 1: Test først (anbefalet)
```bash
# 1. Behold den gamle server som backup
# (gør ingenting endnu)

# 2. Deploy til Railway og test server-new.js midlertidigt
# Tilføj til Railway's start command: node server-new.js

# 3. Test alle funktioner på Railway
# - Login
# - Registrer
# - Dashboard
# - Opret produkt
# - Browse
# - Admin panel
# - Favoritter
# - Forestillingsperioder
# - Konsultation

# 4. Hvis alt virker, erstат lokalt og push:
git add .
git commit -m "Refactor: Split server into clean routes structure"
git push
```

### Option 2: Direkte deploy (risikofuld)
```bash
# 1. Backup den gamle server
mv server.js server_old_backup.js

# 2. Brug den nye server
mv server-new.js server.js

# 3. Commit og push
git add .
git commit -m "Refactor: Split server into clean routes structure"
git push

# Railway vil automatisk deploye den nye struktur
```

## ⚙️ Railway Konfiguration

### Start Command
Ingen ændringer nødvendige! Railway bruger stadig:
```
node server.js
```

Efter du har omdøbt `server-new.js` til `server.js`, vil alt køre automatisk.

### Environment Variables
Ingen ændringer nødvendige. Den nye struktur bruger samme variabler:
- `DATABASE_URL` ✅ (eksisterer allerede)
- `SESSION_SECRET` ✅ (eksisterer allerede)
- `NODE_ENV` ✅ (eksisterer allerede)

## 🧪 Test Checklist for Railway

Efter deployment, test disse funktioner:

### Public Routes
- [ ] `GET /` - Forside loader
- [ ] `GET /produkter` - Produktliste vises

### Authentication
- [ ] `GET /login` - Login side loader
- [ ] `POST /login` - Login virker med admin bruger
- [ ] `GET /registrer` - Registrering side loader
- [ ] `POST /registrer` - Ny bruger kan oprettes
- [ ] `GET /logout` - Logout virker

### Protected Routes (kræver login)
- [ ] `GET /dashboard` - Dashboard loader
- [ ] `GET /dashboard/opret-produkt` - Opret produkt side loader
- [ ] `POST /dashboard/opret-produkt` - Nyt produkt kan oprettes
- [ ] `GET /browse` - Browse side loader
- [ ] `POST /browse/favorit/:id` - Favorit kan tilføjes/fjernes
- [ ] `GET /favoritter` - Favoritter side loader
- [ ] `GET /forestillingsperioder` - Perioder side loader
- [ ] `POST /forestillingsperioder` - Ny periode kan oprettes
- [ ] `GET /konsultation` - Konsultation side loader
- [ ] `POST /konsultation` - Konsultation kan bookes
- [ ] `GET /tilkoeb` - Tilkøb side loader

### Admin Routes (kræver admin login)
- [ ] `GET /admin` - Admin panel loader
- [ ] `POST /admin/godkend/:id` - Bruger kan godkendes
- [ ] `POST /admin/deaktiver/:id` - Bruger kan deaktiveres
- [ ] `POST /admin/slet-produkt/:id` - Produkt kan slettes

### Product Details
- [ ] `GET /produkt/:id` - Produkt detalje side loader
- [ ] `POST /produkt/:id/reserver` - Reservation virker
- [ ] `POST /produkt/:id/skjul` - Skjul/vis toggle virker

## 🔍 Forskelle fra gammel server

### Database håndtering
✅ **Samme** - Bruger stadig PostgreSQL pool fra `db.js`

### Session håndtering
✅ **Samme** - Bruger stadig connect-pg-simple

### Middleware
✅ **Forbedret** - Nu i separat fil (`middleware/auth.js`)

### Routes
✅ **Refaktoreret** - Opdelt i logiske moduler i `routes/` mappen

### Funktionalitet
✅ **Identisk** - Alle features bevaret, ingen breaking changes

## 🐛 Troubleshooting

### Hvis noget ikke virker efter deploy:

1. **Tjek Railway logs:**
   ```
   Se efter fejlmeddelelser ved start
   ```

2. **Tjek at alle filer er committed:**
   ```bash
   git status
   ```

3. **Tjek at routes mapperne er inkluderet:**
   ```bash
   ls -la routes/
   ls -la middleware/
   ```

4. **Rollback hvis nødvendigt:**
   ```bash
   git revert HEAD
   git push
   ```

## 📊 Performance

Den nye struktur har **ingen negativ indvirkning** på performance:
- Same antal database queries
- Same session håndtering
- Bare bedre organiseret kode

## 🎯 Fordele ved ny struktur

1. **Vedligeholdelse** - Lettere at finde og fixe bugs
2. **Udvikling** - Lettere at tilføje nye features
3. **Debugging** - Nemmere at isolere problemer
4. **Teamwork** - Flere kan arbejde samtidig
5. **Læsbarhed** - Mindre forvirring for nye udviklere

## ✅ Klar til deployment!

Når du er klar, følg **Option 1** ovenfra for den sikreste tilgang.

Ved spørgsmål eller problemer, tjek logs i Railway dashboard!
