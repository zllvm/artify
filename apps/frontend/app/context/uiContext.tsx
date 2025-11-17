import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

import type { ReactNode } from "react";

type UiContextType = {
  isSidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  modal: ReactNode | null;
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
};

const UiContext = createContext<UiContextType | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [modal, setModal] = useState<ReactNode | null>(null);

  const openModal = (content: ReactNode) => setModal(content);
  const closeModal = () => setModal(null);

  return (
    <UiContext.Provider
      value={{ isSidebarOpen, setSidebarOpen, modal, openModal, closeModal }}
    >
      {children}
    </UiContext.Provider>
  );
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
}
