/**
 * Script untuk generate password hash
 * Jalankan: node scripts/generate-password-hash.js
 */

const bcrypt = require('bcryptjs');

async function generateHash(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

async function main() {
  const passwords = [
    { password: 'admin123', label: 'Admin Password' },
    { password: 'password123', label: 'User Password' },
  ];

  console.log('🔐 Generating Password Hashes...\n');
  console.log('='.repeat(60));

  for (const item of passwords) {
    const hash = await generateHash(item.password);
    console.log(`\n${item.label}:`);
    console.log(`Password: ${item.password}`);
    console.log(`Hash:     ${hash}`);
    console.log(`\nSQL Update:`);
    console.log(`UPDATE admin_users SET password_hash = '${hash}' WHERE email = 'admin@example.com';`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Done! Copy hash di atas untuk update database\n');
}

main().catch(console.error);

