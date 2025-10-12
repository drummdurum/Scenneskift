# 🚂 Railway Deployment Guide (Dansk)

## Oversigt

Denne guide hjælper dig med at deploye SceneSkift til Railway - en moderne cloud platform til web applikationer.

## Hvad er Railway?

Railway er en cloud platform der gør det nemt at deploye web applikationer direkte fra GitHub. Det tager sig af:
- Server hosting
- Automatisk deployment
- SSL certificater
- Domain hosting
- Logs og monitoring

## Trin-for-Trin Guide

### 1️⃣ Opret Railway Konto

1. Gå til [railway.app](https://railway.app)
2. Klik på "Login" (øverst til højre)
3. Vælg "Login with GitHub"
4. Godkend Railway til at tilgå din GitHub konto

### 2️⃣ Connect dit GitHub Repository

1. Sørg for at dit projekt er uploadet til GitHub
2. Hvis ikke, skal du:
   ```bash
   git add .
   git commit -m "Klar til Railway"
   git push
   ```

### 3️⃣ Deploy Projektet

1. På Railway dashboard, klik **"New Project"**
2. Vælg **"Deploy from GitHub repo"**
3. Find og vælg dit **Scenneskift** repository
4. Railway begynder automatisk at deploye

**Det tager ca. 2-5 minutter første gang.**

### 4️⃣ Konfigurer Environment Variables

Environment variables er indstillinger for din app:

1. I Railway, klik på dit projekt
2. Klik på fanen **"Variables"**
3. Klik **"New Variable"**
4. Tilføj disse:

| Variable | Værdi | Hvorfor? |
|----------|-------|----------|
| `SESSION_SECRET` | En lang tilfældig streng | Sikrer bruger-sessions |
| `NODE_ENV` | `production` | Fortæller appen at den er i produktion |

**Tip:** Generer en sikker SESSION_SECRET:
```bash
# Kør dette i din terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5️⃣ Generer et Public Domain

Din app er nu kørende, men kun tilgængelig internt. For at tilgå den:

1. Klik på **"Settings"** fanen
2. Scroll ned til **"Networking"**
3. Klik **"Generate Domain"**
4. Railway giver dig en URL som: `https://scenneskift-production.up.railway.app`
5. Åbn URL'en i din browser! 🎉

### 6️⃣ Test din App

Prøv at:
- ✅ Åbne forsiden
- ✅ Logge ind med admin credentials:
  - Brugernavn: `admin`
  - Adgangskode: `admin123`
- ✅ Oprette en test reservation
- ✅ Browse produkter

## ⚠️ Vigtigt: Data Persistens Problem

**PROBLEM:** Denne app bruger JSON-filer til at gemme data. På Railway betyder det:
- 🔴 Alle ændringer (nye brugere, produkter, reservationer) vil forsvinde når appen genstarter
- 🔴 Railway kan genstarte din app når som helst (ved deployment, maintenance, etc.)

### Løsning 1: Railway Volume (Anbefalet for demo/test)

Dette gør at data bliver gemt permanent:

1. I Railway dashboard, klik dit projekt
2. Klik **"+ New"** (ved siden af din service)
3. Vælg **"Volume"**
4. Navngiv det: `data-volume`
5. Mount path: `/app/data`
6. Gem

Nu vil dine data blive bevaret!

### Løsning 2: Migrer til Database (Anbefalet for produktion)

For en rigtig produktions-app bør du bruge en database:

1. I Railway, klik **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway opretter automatisk en database
3. Du skal ændre din kode til at bruge databasen i stedet for JSON-filer

**Dette kræver kode-ændringer** - kontakt en udvikler hvis du har brug for hjælp.

### Løsning 3: Accepter begrænsningen

Hvis du kun bruger appen til:
- Demo-formål
- Test/udvikling
- Kort-leved data

...så kan du bruge den som den er, men vær opmærksom på at data kan forsvinde.

## 🔄 Automatiske Updates

Når du pusher ændringer til GitHub:
1. Railway opdager automatisk ændringer
2. Bygger en ny version
3. Deployer den automatisk
4. Ingen downtime!

```bash
# Lav ændringer i din kode...
git add .
git commit -m "Opdaterede design"
git push
# Railway deployer automatisk! ✨
```

## 📊 Overvåg din App

### Se Logs

1. Gå til Railway dashboard
2. Klik på dit projekt
3. Klik på **"Deployments"**
4. Klik på den seneste deployment
5. Se logs i realtid

### Check Status

- **Grøn indikator**: Alt kører godt ✅
- **Gul indikator**: Deployer/bygger 🔄
- **Rød indikator**: Fejl - check logs! ❌

## 💰 Hvad Koster Det?

Railway tilbyder:

### Hobby Plan (Gratis)
- $5 månedlig credit (ca. 38 DKK)
- Rigeligt til test/demo apps
- No credit card required

### Pro Plan
- $10/måned base fee
- + usage efter credit
- Bedre support
- Flere ressourcer

**For SceneSkift (lille app):**
- Hobby plan er nok til test/demo 
- Estimeret forbrug: $2-5/måned

## 🐛 Almindelige Problemer

### Problem: "Application failed to start"

**Løsning:**
1. Check logs under "Deployments" → "View Logs"
2. Verificer at environment variables er sat
3. Check at `package.json` har korrekt "start" script

### Problem: "Cannot connect to my app"

**Løsning:**
1. Har du genereret et domain under Settings → Networking?
2. Check at der ikke er en rød fejl-indikator
3. Vent 2-3 minutter efter deployment

### Problem: "Data disappears when I restart"

**Løsning:**
- Dette er forventet adfærd uden volume/database
- Se "Data Persistens Problem" sektionen ovenfor

### Problem: "Out of credits"

**Løsning:**
1. Check dit forbrug under "Usage"
2. Upgrade til Pro plan, eller
3. Reducer ressource-forbrug (mindre dyno size)

## 📚 Ekstra Ressourcer

- **Railway Docs:** https://docs.railway.app/
- **Railway Discord:** https://discord.gg/railway (god support!)
- **Railway Status:** https://status.railway.app/
- **Railway Blog:** https://blog.railway.app/

## 🎯 Næste Skridt

Nu hvor din app er live, kan du:

1. **Del linket** med andre brugere
2. **Konfigurer custom domain** (kræver Pro plan)
3. **Migrer til database** for permanent data
4. **Set op monitoring** og alerts
5. **Optimér performance**

## ❓ Brug for Hjælp?

- **Railway Support:** support@railway.app
- **Community Discord:** https://discord.gg/railway
- **GitHub Issues:** Opret et issue i dit repository

---

**Succes med din deployment! 🚀**
