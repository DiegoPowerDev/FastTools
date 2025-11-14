import { create } from "zustand";
import { onAuthChange, logout } from "@/firebase/auth";

const useUserStore = create((set) => ({
  user: null,
  loadingUser: true,

  setUser: (user) => set({ user }),
  logout: async () => {
    await logout();
    set({ user: null });
  },

  // Inicia el listener de Firebase Auth
  listenToAuth: () => {
    onAuthChange((user) => {
      console.log(user);
      set({ user, loadingUser: false });
    });
  },
}));

export default useUserStore;
