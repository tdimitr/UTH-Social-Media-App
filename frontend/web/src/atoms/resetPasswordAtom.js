import { atom } from 'recoil';

export const resetPasswordAtom = atom({
  key: 'resetPasswordAtom',
  default: { email: '', code: '' },
});
