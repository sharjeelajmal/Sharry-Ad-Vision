"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res.error) {
        toast.error("Invalid Credentials");
        return;
      }

      router.replace("/sharry326");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    // Main container ko center mein rakha hai
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Form container, mobile par full-width aur desktop par max-width set kiya hai */}
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 bg-white border rounded-lg focus:outline-none  focus:scale-[1.02] transition-transform duration-200 ease-in-out"
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
              className="w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:scale-[1.02] transition-transform duration-200 ease-in-out pr-10"
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
          
          <div className="text-right">
            <Link href="/forgot-password" passHref>
              <span className="text-sm text-blue-600 hover:underline cursor-pointer">Forgot Password?</span>
            </Link>
          </div>

          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none  transition-colors">
            Login
          </button>
        </form>
        <div className="text-center mt-4">
            <Link href={"/admin-register"} className="text-sm text-blue-600 hover:underline">
                Don't have an account? <span className="font-semibold">Register</span>
            </Link>
        </div>
      </div>
    </div>
  );
}