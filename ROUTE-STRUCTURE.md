# Server Struktur - Refaktoreret

## 📁 Mappestruktur

```
├── server-new.js              # Clean hovedserver fil
├── middleware/
│   └── auth.js               # Authentication middleware
└── routes/
    ├── auth.js               # Login, logout, registrering
    ├── products.js           # Produkter, produkt detaljer, reservationer
    ├── dashboard.js          # Bruger dashboard, opret produkt
    ├── admin.js              # Admin funktioner
    ├── browse.js             # Browse produkter, favoritter
    ├── periods.js            # Forestillingsperioder
    ├── consultation.js       # Konsultation booking
    └── tilkoeb.js           # Tilkøb/add-ons
```

## 🔧 Hvad er ændret?

### Før (server_old.js)
- ❌ Én stor fil med 600+ linjer
- ❌ Alle routes blandet sammen
- ❌ Middleware defineret inline
- ❌ Svært at vedligeholde og udvide

### Efter (server-new.js + routes/)
- ✅ Clean hovedserver fil (~90 linjer)
- ✅ Logisk opdeling i separate route filer
- ✅ Genbrugelige middleware i separat fil
- ✅ Nemt at finde og vedligeholde kode
- ✅ Modulær struktur - let at tilføje nye features

## 📝 Route Oversigt

### Authentication Routes (`routes/auth.js`)
- `GET /login` - Login side
- `POST /login` - Login handling
- `GET /registrer` - Registrerings side
- `POST /registrer` - Registrerings handling
- `GET /logout` - Logout

### Product Routes (`routes/products.js`)
- `GET /produkter` - Vis alle produkter
- `GET /produkt/:id` - Vis produkt detaljer
- `POST /produkt/:id/reserver` - Reserver produkt
- `POST /produkt/:id/skjul` - Skjul/vis produkt

### Dashboard Routes (`routes/dashboard.js`)
- `GET /dashboard` - Bruger dashboard
- `GET /dashboard/opret-produkt` - Opret produkt formular
- `POST /dashboard/opret-produkt` - Opret nyt produkt

### Admin Routes (`routes/admin.js`)
- `GET /admin` - Admin oversigt
- `POST /admin/godkend/:id` - Godkend bruger
- `POST /admin/deaktiver/:id` - Deaktiver bruger
- `POST /admin/slet-produkt/:id` - Slet produkt

### Browse Routes (`routes/browse.js`)
- `GET /browse` - Browse andre teatres produkter
- `POST /browse/favorit/:id` - Tilføj/fjern favorit
- `GET /favoritter` - Vis brugerens favoritter

### Periods Routes (`routes/periods.js`)
- `GET /forestillingsperioder` - Vis forestillingsperioder
- `POST /forestillingsperioder` - Tilføj ny periode
- `POST /forestillingsperioder/slet/:id` - Slet periode

### Consultation Routes (`routes/consultation.js`)
- `GET /konsultation` - Konsultation side
- `POST /konsultation` - Book konsultation

### Tilkøb Routes (`routes/tilkoeb.js`)
- `GET /tilkoeb` - Tilkøb/add-ons side

## 🚀 Sådan bruger du det

### Test den nye server:
```bash
node server-new.js
```

### Hvis alt virker, erstat den gamle server:
```bash
# Backup den gamle
mv server.js server_old_backup.js

# Brug den nye
mv server-new.js server.js
```

## 🔐 Middleware

### `authMiddleware`
Tjekker om bruger er logget ind. Brugt af:
- Dashboard routes
- Browse routes
- Periods routes
- Consultation routes
- Tilkøb routes

### `adminMiddleware`
Tjekker om bruger er admin. Brugt af:
- Alle admin routes

## 💡 Fordele ved denne struktur

1. **Separation of Concerns**: Hver route fil håndterer én specifik del af applikationen
2. **Lettere vedligeholdelse**: Find hurtigt den kode du skal ændre
3. **Bedre læsbarhed**: Mindre filer = lettere at forstå
4. **Skalerbarhed**: Let at tilføje nye routes uden at rode i eksisterende kode
5. **Team-friendly**: Flere udviklere kan arbejde på forskellige routes samtidig

## 🎯 Næste skridt

- [ ] Test alle routes grundigt
- [ ] Opdater eventuelle deployment scripts til at bruge `server.js`
- [ ] Overvej at flytte database logik til separate service filer
- [ ] Tilføj error handling middleware
- [ ] Implementer input validation middleware
