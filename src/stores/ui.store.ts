import { create } from "zustand";
import { persist } from "zustand/middleware";

type ViewMode = "cards" | "table";

interface UiState {
  financeView: ViewMode;
  setFinanceView: (view: ViewMode) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      financeView: "cards",
      setFinanceView: (financeView) => set({ financeView }),
    }),
    { name: "casaflow-ui" },
  ),
);
