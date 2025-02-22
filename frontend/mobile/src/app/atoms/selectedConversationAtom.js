import { atom } from "recoil";

const selectedConversationAtom = atom({
  key: "selectedConversationAtom",
  default: {
    _id: "",
    userId: "",
    userProfilePic: "",
    username: "",
  },
});

export default selectedConversationAtom;
