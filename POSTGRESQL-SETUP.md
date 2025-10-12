# 🚀 Quick Setup Guide - PostgreSQL på Railway

## Problem
Appen virker ikke ordentligt på Railway fordi JSON-filer ikke gemmes permanent.

## Løsning
Tilføj PostgreSQL database (100% GRATIS på Railway).

## 📋 Trin-for-Trin

### 1. Tilføj PostgreSQL til dit Railway Projekt

1. Gå til https://railway.app og log ind
2. Åbn dit **Scenneskift** projekt  
3. Klik på **"+ New"** knappen
4. Vælg **"Database"**
5. Vælg **"Add PostgreSQL"**
6. Vent 30 sekunder mens databasen oprettes

✅ **Det er det!** Railway linker automatisk databasen til din app.

### 2. Genstart din App

Railway gendeployer automatisk, ELLER:
1. Gå til din service (Scenneskift)
2. Klik **"Settings"**
3. Scroll ned og klik **"Redeploy"**

### 3. Test det virker

1. Åbn din Railway URL (fx `https://scenneskift-production.up.railway.app`)
2. Log ind med:
   - **Brugernavn:** `admin`
   - **Password:** `admin123`

✅ **Færdig!** Din app bruger nu PostgreSQL og data gemmes permanent!

## 🎯 Hvad sker der automatisk?

- ✅ Database tabeller oprettes automatisk
- ✅ Admin bruger (`admin`/`admin123`) oprettes
- ✅ Test bruger (`drumm`/`drumm123`) oprettes  
- ✅ Alle data gemmes permanent
- ✅ Ingen data går tabt ved genstart

## 📊 Se din Database (Valgfrit)

1. I Railway Dashboard, klik på **PostgreSQL** databasen
2. Gå til **"Data"** tab
3. Se alle tabeller: `brugere`, `produkter`, `reservationer`, etc.

## ⚠️ Vigtigt at vide

- Railway's **gratis tier** inkluderer PostgreSQL
- Dine JSON filer bruges ikke længere  
- Alt data er nu i databasen
- Meget mere pålideligt end JSON filer!

## 🆘 Problemer?

Hvis login stadig ikke virker efter PostgreSQL er tilføjet:
1. Check at `DATABASE_URL` er sat under Variables
2. Prøv at redeploy en gang til
3. Check logs under "Deployments" → "View Logs"

---

**Næste gang du pusher til GitHub, gendeployer Railway automatisk!** 🎉
