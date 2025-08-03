"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react"; // Eye icons import karein

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Password ko show/hide karne ke liye state
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("All fields are necessary.");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        toast.success("Registration successful! Please login.");
        router.push("/admin-login");
      } else {
        const data = await res.json();
        toast.error(data.message || "User registration failed.");
      }
    } catch (error) {
      toast.error("Error during registration.");
      console.log("Error during registration: ", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="md:max-w-md md:w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Registration</h1>
        <p className="text-center text-sm text-gray-600 mb-4">Note: Only one admin account can be created.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
          {/* ▼▼▼ Password Input Field Update ▼▼▼ */}
          <div className="relative">
            <input
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Register
          </button>
        </form>
         <div className="text-center mt-4">
            <Link href={"/admin-login"} className="text-sm text-blue-600 hover:underline">
                Already have an account? <span className="font-semibold">Login</span>
            </Link>
        </div>
      </div>
    </div>
  );
}
