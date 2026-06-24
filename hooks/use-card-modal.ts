import { create } from "zustand";

// Type definition for the card modal store
type CardModalStore = {
  id?: string;
  isOpen: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
};

export const useCardModal = create<CardModalStore>((set) => ({
  // Initial state for the card modal store
  id: undefined,
  // Whether the modal is open or not
  isOpen: false,
  // Opens the modal with the given id
  onOpen: (id: string) => set({ isOpen: true, id }),
  // Closes the modal and resets the id
  onClose: () => set({ isOpen: false, id: undefined }),
}));
