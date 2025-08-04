"use client";
import { SessionProvider } from "next-auth/react";

export const AuthProvider = ({ children }) => {
  // refetchOnWindowFocus={false} add karne se tab change karne par page refresh nahi hoga
  return <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>;
};