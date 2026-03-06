import bcrypt from 'bcryptjs';

// Generate bcrypt hash for admin password
const password = 'admin0815';
const hash = bcrypt.hashSync(password, 10);
console.log('Bcrypt hash for admin password:', hash);
