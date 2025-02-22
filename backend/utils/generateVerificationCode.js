export const generateVerificationCode = () => {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digits
};
