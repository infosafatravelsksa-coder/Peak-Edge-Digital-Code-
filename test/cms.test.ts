import { PRIMARY_ADMIN_EMAIL } from '../src/firebase/config';

console.log('--- Self-Contained Security Invariants Test ---');
if (PRIMARY_ADMIN_EMAIL !== 'info.safatravels.ksa@gmail.com') {
  throw new Error('PRIMARY_ADMIN_EMAIL mismatch');
}
console.log('✓ Allowlist verified for administrator: info.safatravels.ksa@gmail.com');
