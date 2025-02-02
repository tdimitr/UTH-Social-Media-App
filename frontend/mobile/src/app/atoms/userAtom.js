import { atom } from "recoil";
import * as SecureStore from "expo-secure-store";

async function loadUserInfo() {
  const userInfo = await SecureStore.getItemAsync("userInfo");
  return userInfo ? JSON.parse(userInfo) : null;
}

const userAtom = atom({
  key: "userAtom",
  default: null,
  effects_UNSTABLE: [
    ({ setSelf }) => {
      loadUserInfo().then((data) => setSelf(data));
    },
  ],
});

export default userAtom;
