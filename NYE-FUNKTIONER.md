# Nye Funktioner - Oktober 2025

Denne fil beskriver de nye funktioner der er tilføjet til systemet.

## 1. Email til Brugere ✉️

### Ændringer:
- **Database**: Tilføjet `email` kolonne til `brugere` tabellen
- **Registrering**: Brugere skal nu angive email ved oprettelse
- **Validering**: Email skal være unik - ingen to brugere kan have samme email

### Filer ændret:
- `migrations/add-email-and-features.sql` - Database migration
- `views/registrer.ejs` - Tilføjet email felt i registreringsform
- `routes/auth.js` - Opdateret registreringslogik til at håndtere email
- `models/BrugerDB.js` - Opdateret create metode med email parameter

### Anvendelse:
Email bruges til at sende forespørgsler mellem teatre om produkter.

---

## 2. Planlagte/Bestilte Produkter på Dashboard 📦

### Funktion:
Viser en liste over kommende reservationer hvor brugerens produkter er bestilt af andre teatre.

### Information vist:
- Produkt navn og billede
- Lejer (teaternavn og lokation)
- Lejeperiode (fra-til dato)
- Status (Kommende / Aktiv leje / Afsluttet)
- Antal dage til afhentning
- Hvor produktet står (brugerens lokation)

### Filer ændret:
- `views/dashboard.ejs` - Tilføjet ny sektion med reservationer
- `routes/dashboard.js` - Henter kommende reservationer fra databasen

### Features:
- Visuel status med farver (grøn = aktiv, blå = kommende)
- Countdown til afhentning for kommende reservationer
- Lokationsinformation for at vide hvor produktet står

---

## 3. "Vores Lager" Filter på Browse 🏢

### Funktion:
Nyt filter under lokationer som viser kun produkter fra brugerens eget lager.

### Ændringer:
- Tilføjet "🏢 Vores Lager" som første option i lokationsfilter
- Browse viser nu ALLE produkter (inkl. egne) i stedet for kun andre teatres
- JavaScript filter opdateret til at håndtere "VORES_LAGER" værdi

### Filer ændret:
- `views/browse.ejs` - Tilføjet filter option og data-attribut
- `routes/browse.js` - Inkluderer nu også egne produkter og markerer dem

### Anvendelse:
Gør det nemt at se oversigt over egne produkter og sammenligne med andre teatres udvalg.

---

## 4. "Må Renoveres" Felt på Produkter 🎨

### Funktion:
Checkbox på produkter der angiver om produktet må males om, ændres eller tilpasses til andre projekter.

### Database:
- Tilføjet `maa_renoveres` BOOLEAN kolonne til `produkter` tabellen
- Default værdi: `false`

### Filer ændret:
- `migrations/add-email-and-features.sql` - Database migration
- `views/opret-produkt.ejs` - Tilføjet checkbox i oprettelsesform
- `routes/dashboard.js` - Gemmer "må renoveres" status
- `views/produkt-detalje.ejs` - Viser badge hvis produkt må renoveres

### Visning:
Produkter med "må renoveres" viser en blå info-box på produktdetalje siden.

---

## 5. Forespørgselsfunktion til Produkter 💬

### Funktion:
Brugere kan sende forespørgsler til ejeren af et produkt via en modal form.

### Features:
- "Send forespørgsel" knap på produktdetalje siden
- Modal med kontaktformular
- Automatisk udfyldning af emne
- Sender afsenders email og teaternavn med
- Success besked efter afsendelse

### Filer ændret:
- `views/produkt-detalje.ejs` - Tilføjet knap og modal
- `routes/products.js` - Ny `/produkt/:id/kontakt` POST route
- Henter ejer email og information

### Bemærk:
- Vises kun hvis bruger er logget ind
- Vises ikke hvis bruger er ejeren af produktet
- Vises kun hvis ejer har angivet email
- I denne version logges beskeden bare til konsol (email integration kan tilføjes senere)

---

## Installation

For at aktivere de nye funktioner skal du køre database migrationen:

```bash
psql -U postgres -d scenneskift -f migrations/add-email-and-features.sql
```

Eller via Railway CLI hvis du bruger Railway:

```bash
railway run psql -f migrations/add-email-and-features.sql
```

---

## Næste Skridt

For fuld email funktionalitet kan du overveje at tilføje:
- Nodemailer eller SendGrid integration
- Email templates
- Email notifikationer ved nye reservationer
- Email bekræftelser

---

Alle funktioner er nu live og klar til brug! 🎉
