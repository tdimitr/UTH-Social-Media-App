import { atom } from 'recoil';

export const conversationsAtom = atom({
  key: 'conversationsAtom',
  default: [],
});

export const selectedConversationAtom = atom({
  key: 'selectedConversationsAtom',
  default: {
    _id: '',
    userId: '',
    userProfilePic: '',
    username: '',
  },
});
