# ⚡ Hurtig Opsætning til Railway

## Hvad skal jeg gøre for at komme i gang?

### For Begyndere (Hurtig Version)

1. **Upload til GitHub** (hvis ikke gjort allerede)
   ```bash
   git add .
   git commit -m "Klar til Railway"
   git push
   ```

2. **Opret Railway konto**
   - Gå til [railway.app](https://railway.app)
   - Login med GitHub

3. **Deploy**
   - Klik "New Project"
   - Vælg "Deploy from GitHub repo"
   - Vælg dit repository
   - Vent 3-5 minutter

4. **Generer Domain**
   - Settings → Networking → "Generate Domain"
   - Åbn URL'en!

### Vigtigt! Environment Variables

Tilføj under Variables tab:
- `SESSION_SECRET`: En lang tilfældig tekst (f.eks. `abc123xyz789meget-lang-streng`)
- `NODE_ENV`: `production`

### ⚠️ Data Advarsel

Data (brugere, produkter) gemmes i JSON-filer og vil forsvinde ved genstart!

**Løsning:**
- Tilføj et Volume på Railway (se RAILWAY-GUIDE.md)
- Eller migrer til en database

## Færdig! 🎉

Din app er nu live på internet!

**Brug for mere hjælp?** Læs den fulde guide i `RAILWAY-GUIDE.md`
