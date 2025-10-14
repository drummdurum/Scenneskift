-- Migration: Tilføj email og nye funktioner
-- Dato: 2025-10-14

-- Tilføj email felt til brugere tabellen
ALTER TABLE brugere ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE brugere ADD CONSTRAINT unique_email UNIQUE (email);

-- Tilføj 'må renoveres' felt til produkter tabellen
ALTER TABLE produkter ADD COLUMN IF NOT EXISTS maa_renoveres BOOLEAN DEFAULT false;

-- Tilføj kommentarer til kolonnerne for dokumentation
COMMENT ON COLUMN brugere.email IS 'Email adresse for kontakt og forespørgsler';
COMMENT ON COLUMN produkter.maa_renoveres IS 'Om produktet må renoveres/ændres til andet projekt';

-- Opdater eksisterende produkter til at have default værdi
UPDATE produkter SET maa_renoveres = false WHERE maa_renoveres IS NULL;
