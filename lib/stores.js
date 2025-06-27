import { create } from 'zustand';

export const useChatStore = create((set) => ({
  chatData: null,
  setChatData: (chatData) => set({ chatData }),
}));

export const useThemeStore = create((set) => ({
  darkMode: false,
  setDarkMode: (darkMode) => set({ darkMode }),
}));