const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Debug route - vis alle brugere (KUN til development!)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, brugernavn, aktiv, rolle, navn, teaternavn FROM brugere ORDER BY id');
    
    let html = '<html><head><title>Debug - Alle Brugere</title></head><body>';
    html += '<h1>🔍 Alle Brugere i Databasen</h1>';
    html += '<table border="1" cellpadding="10">';
    html += '<tr><th>ID</th><th>Brugernavn</th><th>Navn</th><th>Teater</th><th>Rolle</th><th>Aktiv</th></tr>';
    
    result.rows.forEach(bruger => {
      html += `<tr>`;
      html += `<td>${bruger.id}</td>`;
      html += `<td><strong>${bruger.brugernavn}</strong></td>`;
      html += `<td>${bruger.navn || '-'}</td>`;
      html += `<td>${bruger.teaternavn || '-'}</td>`;
      html += `<td>${bruger.rolle}</td>`;
      html += `<td>${bruger.aktiv ? '✅ Ja' : '❌ Nej'}</td>`;
      html += `</tr>`;
    });
    
    html += '</table>';
    html += `<p>Total antal brugere: ${result.rows.length}</p>`;
    html += '</body></html>';
    
    res.send(html);
  } catch (error) {
    res.send(`<html><body><h1>❌ Fejl</h1><pre>${error.message}</pre></body></html>`);
  }
});

module.exports = router;
