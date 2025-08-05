"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Something went wrong.");
      }
      
      toast.success(data.message);
      setSubmitted(true);

    } catch (error) {
      // Safely access error message
      const errorMessage = error instanceof Error ? error.message : "An error occurred.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Aapka responsive layout bilkul theek hai
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>
        {submitted ? (
          <div className="text-center">
            <p className="text-green-600 mb-4">
              Please check your email for the password reset link.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-center text-sm text-gray-600">Enter your email address and we will send you a link to reset your password.</p>
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                // ▼▼▼ Yahan changes kiye gaye hain ▼▼▼
                className="w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:scale-[1.02] transition-transform duration-200 ease-in-out"
                required
                disabled={isLoading}
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
        <div className="text-center mt-4">
            <Link href={"/admin-login"} className="text-sm text-blue-600 hover:underline">
                Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
}