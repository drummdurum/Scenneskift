# SceneSkift - Teaterrekvisitter Udlejning

En Node.js Express-applikation til udlejning af teaterrekvisitter med fuld brugerstyring, inspireret af klassisk scenekunst.

## 📚 Dokumentation

- 🚀 **[QUICK-START-RAILWAY.md](QUICK-START-RAILWAY.md)** - Hurtig opsætning på Railway (5 minutter)
- 📖 **[RAILWAY-GUIDE.md](RAILWAY-GUIDE.md)** - Komplet Railway deployment guide på dansk
- ✅ **[DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)** - Tjekliste til deployment

## ✨ Features

- 🎭 **Tailwind CSS Design** - Moderne, responsivt design med klassisk teater-æstetik
- 🔐 **Login System** - Sikker autentificering med bcrypt
- 👑 **Admin Panel** - Godkend/deaktiver brugere og administrer produkter
- 👥 **Brugerstyring** - Registrer nye brugere (kræver admin-godkendelse)
- 📦 **Produktstyring** - Godkendte brugere kan oprette nye rekvisitter
- 🔍 **Browse & Favoritter** - Søg og favoriser rekvisitter fra andre teatre
- 📅 **Reservation System** - Book rekvisitter med kalendervisning
- ⭐ **Points System** - Optjen points ved aktivitet
- 💼 **Konsultation** - Book konsultationstimer
- 🎨 **Elegant UI** - Burgundy og guld farvepalette

## 🚀 Lokal Installation

1. Klon repository:
```bash
git clone <your-repo-url>
cd "AI ballade"
```

2. Installer dependencies:
```bash
npm install
```

3. Start serveren:
```bash
npm start
```

4. For development med auto-reload:
```bash
npm run dev
```

5. Åbn din browser på: `http://localhost:3000`

## 🌐 Deploy til Railway

Dette projekt er forberedt til deployment på Railway med alle nødvendige konfigurationsfiler.

### ⚠️ VIGTIGT: Data Persistens

**Denne applikation bruger JSON-filer til at gemme data**, hvilket betyder at alle ændringer (nye brugere, produkter, reservationer) **vil blive nulstillet** ved hver genstart på Railway, da Railway bruger ephemeral (midlertidig) filsystem.

**Anbefalede løsninger:**
1. **Railway Volumes** (Anbefalet): Tilføj et persistent volume til din Railway service
2. **Database Migration**: Migrer til en rigtig database (PostgreSQL, MongoDB, etc.)
3. **Test/Demo Mode**: Brug kun til test/demo-formål hvor data ikke behøver at være permanent

### 📋 Forudsætninger

- En GitHub konto
- Dit projekt pushet til GitHub
- En Railway konto (gratis at oprette på [railway.app](https://railway.app))

### 🚀 Step-by-Step Deployment Guide

#### Trin 1: Forbered dit Repository

Sørg for at dit projekt er pushet til GitHub:

```bash
# Hvis du ikke allerede har gjort det:
git init
git add .
git commit -m "Klar til Railway deployment"
git branch -M main
git remote add origin <din-github-repo-url>
git push -u origin main
```

#### Trin 2: Opret Railway Projekt

1. Gå til [railway.app](https://railway.app)
2. Klik på **"Login"** og log ind med din GitHub konto
3. Klik på **"New Project"**
4. Vælg **"Deploy from GitHub repo"**
5. Vælg dit **Scenneskift** repository fra listen
   - Hvis du ikke kan se dit repository, klik på "Configure GitHub App" og giv Railway adgang
6. Railway starter automatisk deployment af dit projekt

#### Trin 3: Konfigurer Environment Variables

Railway sætter automatisk `PORT`, men du bør konfigurere følgende:

1. I Railway Dashboard, klik på dit projekt
2. Klik på **"Variables"** fanen
3. Tilføj følgende variabler:

```
SESSION_SECRET=<generer-en-lang-tilfældig-streng-her>
NODE_ENV=production
```

**Tips til SESSION_SECRET:** Generer en sikker nøgle med:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Trin 4: Konfigurer Data Persistens (Valgfrit men Anbefalet)

For at bevare data mellem genstart:

1. I Railway Dashboard, gå til dit projekt
2. Klik på **"+ New"** → **"Volume"**
3. Navngiv volumet (f.eks. `data-volume`)
4. Mount volumet på `/app/data` i din service
5. Nu vil dine JSON-filer blive gemt permanent

**Alternativt:** Tilføj en PostgreSQL database:
1. Klik på **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway vil automatisk oprette en database
3. Du skal derefter migrere din applikation til at bruge databasen (kræver kode-ændringer)

#### Trin 5: Åbn din App

1. Efter deployment, klik på **"Settings"** fanen
2. Klik på **"Generate Domain"** under "Networking"
3. Railway giver dig en URL som: `https://your-app.up.railway.app`
4. Åbn URL'en i din browser

#### Trin 6: Verificer Deployment

Test at din app virker:
- Kan du tilgå forsiden?
- Kan du logge ind med admin credentials?
- Virker alle funktioner?

### 🔄 Automatisk Re-deployment

Når du pusher ændringer til GitHub, vil Railway automatisk:
1. Opdage ændringerne
2. Bygge et nyt image
3. Deploye den nye version

### 🐛 Troubleshooting

**Problem:** "Application failed to start"
- Check **"Deployments"** → **"View Logs"** i Railway Dashboard
- Verificer at alle environment variables er sat korrekt

**Problem:** "Cannot connect to app"
- Sørg for at du har genereret et domain under Settings → Networking
- Check at PORT environment variable ikke er manuelt sat (Railway sætter den automatisk)

**Problem:** "Data forsvinder ved genstart"
- Dette er forventet uden persistent volume
- Se "Data Persistens" sektionen ovenfor

### 📊 Railway Features

Din app får automatisk:
- ✅ HTTPS/SSL certifikater
- ✅ Automatisk skalering
- ✅ Deployment logs
- ✅ Metrics og monitoring
- ✅ Zero-downtime deployments

### 💰 Pricing

Railway tilbyder:
- **Gratis tier**: $5 månedlig credit (rigeligt til test/demo)
- **Pro plan**: Pay-as-you-go efter gratis credit

### 🔗 Nyttige Links

- [Railway Dokumentation](https://docs.railway.app/)
- [Railway Discord Community](https://discord.gg/railway)
- [Railway Status](https://status.railway.app/)

## 🔑 Login Credentials

### Admin Bruger
- **Brugernavn:** `admin`
- **Adgangskode:** `admin123`

### Test Bruger
- **Brugernavn:** `drumm`
- **Adgangskode:** `drumm123`

## 📁 Struktur

```
├── server.js              # Express server med routing og middleware
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind CSS konfiguration
├── data/
│   ├── produkter.json     # Produkt database
│   └── brugere.json       # Bruger database
├── views/
│   ├── index.ejs          # Forside
│   ├── produkter.ejs      # Produktside
│   ├── login.ejs          # Login side
│   ├── registrer.ejs      # Registrerings side
│   ├── dashboard.ejs      # Bruger dashboard
│   ├── opret-produkt.ejs  # Opret produkt formular
│   └── admin.ejs          # Admin panel
└── public/
    └── css/
        └── input.css      # Tailwind CSS input fil
```

## 👥 Brugerroller

### Admin
- Godkende nye brugere
- Deaktivere eksisterende brugere
- Slette produkter
- Fuld adgang til alle funktioner

### Bruger (Godkendt)
- Oprette nye rekvisitter
- Se alle produkter
- Adgang til dashboard

### Bruger (Ikke godkendt)
- Kan registrere sig
- Afventer admin-godkendelse
- Kan ikke logge ind før godkendelse

## 🎨 Design Features

- **Tailwind CSS** via CDN (ingen build-step påkrævet)
- **Burgundy (#800020)** og **Guld (#d4af37)** farvepalette
- **Responsive design** - fungerer på alle enheder
- **Georgia serif** font for klassisk look
- **Gradient baggrunde** og dramatiske effekter
- **Hover animationer** og transitions

## 📝 Sådan bruges systemet

1. **Første gang:**
   - Log ind som admin med credentials ovenfor
   - Gå til admin panel

2. **Opret nye brugere:**
   - Klik "Registrer" på login-siden
   - Udfyld formularen
   - Vent på admin-godkendelse

3. **Admin godkender brugere:**
   - Log ind som admin
   - Gå til admin panel
   - Klik "Godkend" på afventende brugere

4. **Opret produkter:**
   - Log ind som godkendt bruger
   - Gå til dashboard
   - Klik "Opret Produkt"
   - Udfyld formularen

## 🛠️ Teknologier

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **EJS** - Templating engine
- **Tailwind CSS** - Utility-first CSS framework
- **bcryptjs** - Password hashing
- **express-session** - Session management
- **JSON** - File-based database

## 🔒 Sikkerhed

- Passwords hashet med bcrypt
- Session-baseret autentificering
- Admin-middleware beskytter sensitive routes
- Auth-middleware kræver login for protected routes

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "ejs": "^3.1.9",
  "express-session": "^1.17.3",
  "bcryptjs": "^2.4.3",
  "body-parser": "^1.20.2",
  "tailwindcss": "^3.3.5"
}
```

## 🎭 Tema

Designet er inspireret af klassisk teater med:
- Burgundy og guld farvepalette (kongelige farver)
- Elegant typografi (Georgia serif)
- Gardin-effekter på forsiden
- Dramatisk atmosfære
- Teater-emoji og ikoner (🎭, 👑, 📦, etc.)

## 📄 License

ISC
