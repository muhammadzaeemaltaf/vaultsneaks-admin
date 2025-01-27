"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useAdminStore } from "@/stores/userStore";

const page = () => {
  const router = useRouter();
  useEffect(() => {
    const handleLogout = async () => {
      try {
        const response = await axios.get("/api/logout", {
          withCredentials: true,
        });

        if (response.status === 200) {
          Cookies.remove("admin_token");
          console.log("Token removed");
          const { clearUsers } = useAdminStore.getState();
          clearUsers();
          router.push("/auth");
        } else {
          console.error("Logout failed");
        }
      } catch (error) {
        console.error("An error occurred during logout", error);
      }
    };
    handleLogout();
  }, []);

  return <div className="p-6">Logging out...</div>;
};

export default page;
