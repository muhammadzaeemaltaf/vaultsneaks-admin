import {create} from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useAdminStore = create<any>()(
    devtools(
      persist(
        (set) => ({
          users: [],
          setUsers: (users: any) => set((state: any) => ({ ...state, users })),
          clearUsers: () => set((state: any) => ({ ...state, users: [] })),
          clearAdminDetails: () => set((state: any) => ({ ...state, adminDetails: null })), // Add this line
        }),
        {
          name: "admin-storage",
        }
      )
    )
  );
