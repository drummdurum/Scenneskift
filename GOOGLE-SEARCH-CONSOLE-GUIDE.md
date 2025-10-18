# Google Search Console Setup Guide

## Trin 1: Opret Google Search Console konto
1. Gå til https://search.google.com/search-console/
2. Log ind med din Google-konto
3. Klik på "Add Property"
4. Vælg "URL prefix" og indtast: https://scenneskift.com
5. Klik "Continue"

## Trin 2: Verificer ejerskab af domænet
Du har flere muligheder for at verificere:

### Option A: HTML Tag (Anbefalet)
1. Google vil give dig en meta tag som skal tilføjes til din header.ejs
2. Tilføj tagget i `<head>` sektionen af din header.ejs fil
3. Deploy dine ændringer til Railway
4. Gå tilbage til Google Search Console og klik "Verify"

### Option B: DNS Record
1. Gå til din domæne-udbyder (hvor du købte scenneskift.com)
2. Tilføj den TXT record som Google giver dig
3. Vent på DNS propagation (kan tage op til 24 timer)
4. Gå tilbage til Google Search Console og klik "Verify"

## Trin 3: Submit din sitemap
1. Efter verificering, gå til "Sitemaps" i venstre menu
2. Klik "Add a new sitemap"
3. Indtast: sitemap.xml
4. Klik "Submit"

## Trin 4: Vent på indexering
- Google begynder automatisk at crawle dit site
- Du kan se status under "Coverage" i Google Search Console
- Det kan tage nogle dage til uger før dine sider vises i Google søgeresultater

## Trin 5: Optimer yderligere (Valgfrit)
1. **Submit til Bing Webmaster Tools**: https://www.bing.com/webmasters
2. **Opret Google My Business**: Hvis du har en fysisk adresse
3. **Social Media**: Opret profiler på relevante sociale medier
4. **Backlinks**: Få andre websites til at linke til dig

## Hastigt tip til hurtigere indexering:
Du kan anmode om manuel indexering af vigtige sider:
1. Gå til "URL Inspection" i Google Search Console
2. Indtast URL'en på din side (f.eks. https://scenneskift.com)
3. Klik "Request Indexing" hvis siden ikke er indexeret endnu

## Forventede resultater:
- **1-3 dage**: Google begynder at crawle dit site
- **1-2 uger**: Dine sider begynder at vises i søgeresultater
- **1-3 måneder**: Fuld SEO effekt når dit site får autoritet