# Database Migration Guide

## 🚀 Migrer fra JSON til PostgreSQL

### På Railway:

#### 1. Tilføj PostgreSQL Database

1. Gå til dit Railway projekt
2. Klik på **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway opretter automatisk databasen og sætter `DATABASE_URL` environment variable

#### 2. Redeploy din app

1. Gå til **Settings** → **Triggers** → **Redeploy**
2. Eller push en ny commit til GitHub

#### 3. Test at det virker

1. Åbn din Railway URL
2. Log ind med:
   - **Admin:** admin / admin123
   - **Test:** drumm / drumm123

### Hvad sker der automatisk:

✅ Database tabeller oprettes automatisk ved første opstart
✅ Admin og drumm brugere oprettes automatisk
✅ Data gemmes permanent i PostgreSQL
✅ Ingen data går tabt ved restart

### Hvis du vil migrere eksisterende data:

Kontakt mig hvis du har vigtige data i JSON filerne der skal flyttes til databasen.

## 🔧 Lokal Udvikling med PostgreSQL (Valgfrit)

### Mac/Linux:
```bash
# Installer PostgreSQL
brew install postgresql
brew services start postgresql

# Opret database
createdb scenneskift

# Kør appen
npm start
```

### Windows:
```bash
# Download og installer PostgreSQL fra postgresql.org
# Opret database "scenneskift"

# Kør appen
npm start
```

### Eller brug JSON fil mode (som før):

Hvis `DATABASE_URL` ikke er sat, bruger appen automatisk JSON filer som før.

## ⚠️ Vigtig Note

Efter migration til PostgreSQL, bruges JSON filerne ikke længere. All data gemmes i databasen.
