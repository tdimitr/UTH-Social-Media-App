import crypto from 'crypto';

export const hashWithHMAC = (code) => {
  return crypto
    .createHmac('sha256', process.env.SECRET_KEY)
    .update(code)
    .digest('hex');
};
