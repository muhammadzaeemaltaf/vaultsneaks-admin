"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie"; 

const page = () => {
  const router = useRouter();
  useEffect(() => {
    const handleLogout = async () => {
      Cookies.remove("admin_token"); 
      console.log("Token removed");
      router.push("/auth");
    };
    handleLogout();
  }, []);

  return <div className="p-6">Logging out...</div>; 
};

export default page;