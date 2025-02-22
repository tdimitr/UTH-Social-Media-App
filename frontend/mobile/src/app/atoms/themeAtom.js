import { atom } from "recoil";

const themeAtom = atom({
  key: "themeAtom",
  default: "light",
});

export default themeAtom;
