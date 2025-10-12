# 📋 Railway Deployment Checklist

Brug denne tjekliste når du deployer til Railway for første gang.

## Pre-Deployment

- [ ] Alle ændringer er committed til Git
- [ ] Project er pushet til GitHub
- [ ] Du har en Railway konto (opret på [railway.app](https://railway.app))
- [ ] Du har læst om data persistens problemet i README.md

## Railway Setup

- [ ] Oprettet nyt projekt på Railway
- [ ] Valgt "Deploy from GitHub repo"
- [ ] Valgt korrekt repository
- [ ] Deployment startet automatisk

## Configuration

- [ ] Environment variable `SESSION_SECRET` tilføjet (brug: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] Environment variable `NODE_ENV=production` tilføjet
- [ ] Domain genereret under Settings → Networking

## Optional: Data Persistence

Vælg en af følgende:

- [ ] **Option A:** Railway Volume tilføjet og mounted til `/app/data`
- [ ] **Option B:** PostgreSQL database tilføjet (kræver kode-ændringer)
- [ ] **Option C:** Accepteret at data er midlertidig (kun til demo/test)

## Verification

- [ ] App URL åbner succesfuldt
- [ ] Kan logge ind med admin credentials (admin/admin123)
- [ ] Kan browse produkter
- [ ] Kan oprette test reservation
- [ ] Logs ser sunde ud (ingen fejl)

## Post-Deployment

- [ ] Test alle hovedfunktioner
- [ ] Del URL med relevante personer
- [ ] Dokumentér din deployment URL
- [ ] Overvej custom domain (kræver Pro plan)
- [ ] Set op monitoring/alerts (optional)

## Troubleshooting Checklist

Hvis noget ikke virker:

- [ ] Check deployment logs i Railway dashboard
- [ ] Verificer alle environment variables er sat korrekt
- [ ] Prøv at redeploy (Settings → Redeploy)
- [ ] Check Railway status page: https://status.railway.app/
- [ ] Søg hjælp i Railway Discord: https://discord.gg/railway

## Success! 🎉

- [ ] Alt virker som forventet
- [ ] URL delt med team/kunder
- [ ] Dokumentation opdateret med production URL

---

**Brug for hjælp?** Se `RAILWAY-GUIDE.md` for detaljeret guide.
