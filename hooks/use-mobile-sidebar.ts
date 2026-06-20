import { create } from "zustand";

// Manages the state of the mobile sidebar (open/closed)
type MobileSidebarStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useMobileSidebar = create<MobileSidebarStore>((set) => ({
  // Initial state: sidebar is closed
  isOpen: false,
  // Opens the sidebar
  onOpen: () => set({ isOpen: true }),
  // Closes the sidebar
  onClose: () => set({ isOpen: false }),
}));
