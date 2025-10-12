# 📦 Migrer Produkter til Database

## Trin 1: Hent DATABASE_URL fra Railway

1. Gå til [Railway Dashboard](https://railway.app/dashboard)
2. Klik på dit **Scenneskift** projekt
3. Klik på **Postgres** databasen
4. Gå til **"Connect"** tab  
5. Find **"Postgres Connection URL"**
6. Klik **"Copy"** knappen

## Trin 2: Opdater .env fil

1. Åbn `.env` filen i VS Code
2. Indsæt din DATABASE_URL:

```env
DATABASE_URL=postgresql://postgres:xxxxx@monorail.proxy.rlwy.net:12345/railway
```

## Trin 3: Kør Migration

I terminalen, kør:

```bash
npm run migrate
```

Du vil se:

```
🚀 Starter migration af produkter fra JSON til database...

📦 Fandt 12 produkter i JSON fil

📝 Migrerer: "Venetiansk Maske"...
   ✅ Produkt oprettet med ID: 1
   📅 Indsætter 1 reservationer...
   ✅ Reservationer indsat

... (fortsætter for alle produkter)

✅ ════════════════════════════════════════
✅ MIGRATION FULDFØRT!
✅ ════════════════════════════════════════
📦 Produkter migreret: 12
📅 Reservationer migreret: 3
```

## Trin 4: Test at det virker

1. Åbn din Railway URL
2. Log ind med admin/admin123
3. Gå til Dashboard
4. Du skulle kunne se alle dine produkter!

## ⚠️ Vigtigt

- Migration scriptet springer produkter over der allerede eksisterer
- Du kan køre det flere gange uden problemer
- JSON filerne bliver IKKE slettet automatisk (du kan slette dem manuelt bagefter)

## 🗑️ Fjern JSON fil logik (efter migration)

Når migration er færdig og alt virker, kan vi:
1. Fjerne al JSON fil læse/skrive kode fra server.js
2. Slette `data/` mappen
3. Fjerne `BrugereFil.js` osv.

Skal jeg hjælpe med det næste? 🚀
