"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { token } = params;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!password) {
      toast.error("Password is required.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }
      
      toast.success("Password reset successfully! Please login.");
      router.push("/admin-login");

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred.";
      toast.error(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    // Main container ko center mein rakha hai aur side padding di hai
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Form container, mobile par full-width aur desktop par max-width set kiya hai */}
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Reset Your Password</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Input Field */}
          <div>
            <label htmlFor="new-password" className="sr-only">New Password</label>
            <div className="relative">
              <input
                id="new-password"
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                // ▼▼▼ Yahan changes kiye gaye hain ▼▼▼
                className="w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:scale-[1.02] transition-transform duration-200 ease-in-out pr-10"
                required
                disabled={isLoading}
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
          </div>

          {/* Confirm Password Input Field */}
          <div>
            <label htmlFor="confirm-password" className="sr-only">Confirm New Password</label>
            <div className="relative">
              <input
                id="confirm-password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                // ▼▼▼ Yahan changes kiye gaye hain ▼▼▼
                className="w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:scale-[1.02] transition-transform duration-200 ease-in-out pr-10"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-blue-600"
                aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}