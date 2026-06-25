import { create } from "zustand";

// Type definition for the Pro modal store
type ProModalStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useProModal = create<ProModalStore>((set) => ({
  // Initial state for the Pro modal
  isOpen: false,
  // Actions to open and close the Pro modal
  onOpen: () => set({ isOpen: true }),
  // Action to close the Pro modal
  onClose: () => set({ isOpen: false }),
}));
