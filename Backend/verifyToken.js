const jwt = require('jsonwebtoken');

const token = '';
const secretKey = '123';

try {
  const decoded = jwt.verify(token, secretKey);
  console.log('Decoded:', decoded);
} catch (err) {
  console.error('Invalid token:', err.message);
}
