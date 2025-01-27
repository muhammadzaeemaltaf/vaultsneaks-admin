import {create} from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useAdminStore = create<any>()(
    devtools(
      persist(
        (set) => ({
          users: [],
          setUsers: (users: any) => set((state: any) => ({ ...state, users })),
          clearUsers: () => set((state: any) => ({ ...state, users: [] })),
        }),
        {
          name: "admin-storage",
        }
      )
    )
  );
