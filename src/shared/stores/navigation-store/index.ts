import { create } from 'zustand';

interface NavigationStore {
  isNavigating: boolean;
  setNavigating: (value: boolean) => void;
}

const navigationStore = create<NavigationStore>(set => ({
  isNavigating: false,
  setNavigating: value => set({ isNavigating: value }),
}));

export default navigationStore;
