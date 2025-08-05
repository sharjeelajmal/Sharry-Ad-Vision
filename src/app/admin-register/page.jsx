"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    // Main container ko center mein rakha hai aur side padding di hai
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Form container, mobile par full-width aur desktop par max-width set kiya hai */}
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-2">Admin Registration</h1>
        <p className="text-center text-sm text-gray-600 mb-6">Note: Only one admin account can be created.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:scale-[1.02] transition-transform duration-200 ease-in-out"
              required
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:scale-[1.02] transition-transform duration-200 ease-in-out pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-blue-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
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