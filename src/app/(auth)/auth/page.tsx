"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation"; 
import axios from "axios"; 

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errormsg, setErrorMsg] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/login", formData);

      const { token } = response.data;

      // Store the JWT token in localStorage or cookies
      localStorage.setItem("authToken", token);

      // Redirect to dashboard or home page
      router.push("/");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 py-5 min-h-screen flex items-center">
      <div className="max-w-md w-full mx-auto bg-white p-4 md:p-6 rounded-lg">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-32 h-32 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={1000}
              height={1000}
              className="h-full w-full aspect-square object-contain"
            />
          </div>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <h1 className="text-center text-zinc-600 text-3xl font-semibold">
            Login
          </h1>
          <div className="space-y-2">
            <label htmlFor="email" className="block font-medium">
              Email
            </label>
            <Input
              id="email"
              type="text"
              placeholder="Email"
              name="email"
              className="w-full border-b border-t-0 border-x-0 rounded-none focus-visible:ring-0 px-0"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFormData({ ...formData, email: e.target.value });
              }}
            />
            {!emailValid && (
              <p className="text-zinc-600 text-xs mt-2" id="email-error">
                Please include a valid email address
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block font-medium">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full border-b border-t-0 border-x-0 rounded-none focus-visible:ring-0  px-0"
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? <Eye /> : <EyeOff />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link
              href="/auth/forgot-password"
              className="text-zinc-600 hover:text-zinc-700 text-sm"
            >
              Forgot Password?
            </Link>
          </div>

          <Button className="w-full bg-zinc-600 hover:bg-zinc-700 h-10 rounded-lg text-sm">
            {loading ? "Loading..." : "Login"}
          </Button>
          {errormsg && <p className="text-red-600 text-sm">{errormsg}</p>}
        </form>
      </div>
    </div>
  );
}
