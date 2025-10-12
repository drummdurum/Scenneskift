# SceneSkift - Teaterrekvisitter Udlejning

En Node.js Express-applikation til udlejning af teaterrekvisitter med fuld brugerstyring, inspireret af klassisk scenekunst.

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

### Trin 1: Push til GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Trin 2: Deploy på Railway

1. Gå til [railway.app](https://railway.app)
2. Log ind med GitHub
3. Klik på "New Project"
4. Vælg "Deploy from GitHub repo"
5. Vælg dit repository
6. Railway vil automatisk detektere Node.js projektet og deploye det

### Trin 3: Konfigurer Environment Variables (Valgfrit)

I Railway Dashboard, gå til dit projekt → Variables og tilføj:

```
SESSION_SECRET=din-sikre-hemmelige-nøgle-her
NODE_ENV=production
```

### Trin 4: Tilføj Volume for Persistent Data (VIGTIGT!)

Railway's filsystem er midlertidigt - data går tabt ved restart. Tilføj et Volume:

1. I Railway Dashboard, gå til dit projekt
2. Klik på "Variables" tab
3. Scroll ned til "Volumes"
4. Klik "New Volume"
5. **Mount Path:** `/app/data`
6. Klik "Add"

Dette sikrer at brugere og produkter bliver gemt permanent!

### Trin 5: Åbn din app

Railway giver dig automatisk en URL som: `https://your-app.up.railway.app`

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
