
import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "./_components/Header";
import UpHeader from "./_components/UpHeader";
import Footer from "./_components/Footer";
import NotificationPopup from "./_components/Alertmesage";
import { Toaster } from 'react-hot-toast';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata = {
  title: "Sharry Ad Vision",
  description: "Digital Marketing And SMM Panel",
  icons: {
    icon: "/favicon.ico",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>  <link rel="icon" type="image/x-icon" href="/favicon.ico" /></head>
      <body className={outfit.className}>
        <Header />
        <UpHeader />
      <NotificationPopup/>
        {children}
         <Toaster position="top-center" reverseOrder={false} />
        <Footer />
      </body>
    </html>
  );
}
