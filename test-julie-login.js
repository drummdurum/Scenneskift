const { pool } = require('./db');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    // Hent julie fra database
    const result = await pool.query(
      'SELECT * FROM brugere WHERE brugernavn = $1',
      ['julie']
    );
    
    const bruger = result.rows[0];
    
    if (!bruger) {
      console.log('❌ Bruger "julie" findes ikke i databasen');
      await pool.end();
      return;
    }
    
    console.log('📊 Bruger data:');
    console.log('  ID:', bruger.id);
    console.log('  Brugernavn:', bruger.brugernavn);
    console.log('  Aktiv:', bruger.aktiv);
    console.log('  Rolle:', bruger.rolle);
    console.log('  Password hash:', bruger.password);
    console.log('  Hash længde:', bruger.password.length);
    console.log('');
    
    // Test password
    const testPassword = 'julie123';
    console.log('🔐 Tester password:', testPassword);
    
    const match = await bcrypt.compare(testPassword, bruger.password);
    console.log('✅ Password match:', match);
    
    if (!match) {
      console.log('');
      console.log('🔍 Lad mig teste om hashen er korrekt formateret...');
      console.log('  Starter med $2a$ eller $2b$:', bruger.password.startsWith('$2a$') || bruger.password.startsWith('$2b$'));
      
      // Test med at hash julie123 igen
      const nyHash = await bcrypt.hash(testPassword, 10);
      console.log('  Ny hash af samme password:', nyHash);
      
      const nyMatch = await bcrypt.compare(testPassword, nyHash);
      console.log('  Test af ny hash:', nyMatch);
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Fejl:', error);
    await pool.end();
  }
}

testLogin();
