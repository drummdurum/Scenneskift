const fs = require('fs');

// JSON Storage for brugere
class BrugereFil {
  constructor() {
    this.filePath = './data/brugere.json';
    this.ensureFileExists();
  }

  ensureFileExists() {
    if (!fs.existsSync('./data')) {
      fs.mkdirSync('./data', { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      const defaultBrugere = [
        {
          id: 1,
          brugernavn: "admin",
          password: "$2a$10$1puYu9yUU4tWb8AivGy43OT3kpaN1A/f9zUxGbrR0uW/ov.HJkr8G",
          rolle: "admin",
          aktiv: true,
          navn: "Administrator",
          type: "admin",
          teaternavn: "SceneSkift Hovedkontor",
          lokation: "Aarhus",
          favoritter: [],
          forestillingsperioder: [],
          points: 500
        },
        {
          id: 2,
          brugernavn: "drumm",
          password: "$2a$10$iSpgYMrRH60b.cuUIIoLjuiAnlK4IvD7RADc3LfTWGNQJlWfCwSuW",
          rolle: "teater",
          aktiv: true,
          navn: "sebastian",
          type: "teater",
          teaternavn: "Det Kongelige Teater",
          lokation: "København",
          favoritter: [],
          forestillingsperioder: [],
          points: 250
        }
      ];
      fs.writeFileSync(this.filePath, JSON.stringify(defaultBrugere, null, 2));
      console.log('✅ Initialiserede brugere.json');
    }
  }

  findAll() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Fejl ved læsning af brugere:', error);
      return [];
    }
  }

  findByBrugernavn(brugernavn) {
    const brugere = this.findAll();
    return brugere.find(b => b.brugernavn === brugernavn);
  }

  findById(id) {
    const brugere = this.findAll();
    return brugere.find(b => b.id === parseInt(id));
  }

  save(brugere) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(brugere, null, 2));
    } catch (error) {
      console.error('Fejl ved gemning af brugere:', error);
    }
  }

  create(brugerData) {
    const brugere = this.findAll();
    const newId = Math.max(...brugere.map(b => b.id), 0) + 1;
    const newBruger = { id: newId, ...brugerData };
    brugere.push(newBruger);
    this.save(brugere);
    return newBruger;
  }

  update(id, brugerData) {
    const brugere = this.findAll();
    const index = brugere.findIndex(b => b.id === parseInt(id));
    if (index !== -1) {
      brugere[index] = { ...brugere[index], ...brugerData };
      this.save(brugere);
      return brugere[index];
    }
    return null;
  }
}

module.exports = BrugereFil;
