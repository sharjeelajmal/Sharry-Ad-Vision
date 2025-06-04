"use client";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Mail,
  Phone,
  Facebook,
  Github,
  Instagram,
  Linkedin,
} from "lucide-react";

import React from "react";

const Contact = () => {
  const handleWhatsAppRedirect = () => {
    const phoneNumber = "447751497015"; // Your WhatsApp number
    const message = "Hello, I want to know more about your services!";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.location.href = url; // Redirects to WhatsApp
  };

  return (
    <div className="bg-customGray p-8 ">
      <div className="  md:px-36">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <img src="contact.svg" className="hidden md:flex md:max-w-sm" />
          <div>
            <h1 className="text-5xl font-bold">Get in Touch with Us</h1>
            <p className="py-6">
              We’re here to help! Whether you have a question, need assistance,
              or want to share feedback, we’d love to hear from you. Reach out
              to us through any of the options below, and we’ll respond as soon
              as possible
            </p>
            {/* WhatsApp Button */}
            <Button
              onClick={handleWhatsAppRedirect}
              className="active:scale-95 hover:scale-105 transition-all ease-out"
            >
              WhatsApp
            </Button>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <header className="bg-blue-600 text-white py-8 text-center">
          <h1 className="text-4xl font-bold">Contact Us</h1>
          <p className="mt-2">
            We’d love to hear from you. Feel free to reach out!
          </p>
        </header>

        {/* Contact Form and Info Section */}
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Send us a Message
              </h2>
              <form className="space-y-6 bg-white shadow-md p-6 rounded-lg">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="mt-1 block w-full bg-customGray outline-none px-3 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="mt-1 block w-full border-gray-300 bg-customGray outline-none px-3 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    required
                    className="mt-1 block w-full border-gray-300 bg-customGray outline-none px-3 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 text-blue-600 mr-4" />
                  <p>Council More, Near Harappa Museum, Harappa City, District Sahiwal, Punjab</p>
                </div>

                <div className="flex items-center">
                  <Mail className="h-6 w-6 text-blue-600 mr-4" />
                  <p>sharjeelajmalg786@gmail.com</p>
                </div>

                <div className="flex items-center">
                  <Phone className="h-6 w-6 text-blue-600 mr-4" />
                  <p>+447751497015</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800">
                  Follow Us
                </h3>
                <div className="flex space-x-4 mt-4">
                  <a
                    href="https://www.facebook.com/profile.php?id=100084778281907" target='_blank'
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a
                    href="https://github.com/sharjeelajmal" target='_blank'
                    className="text-blue-600 hover:text-blue-800" 
                  >
                    <Github className="h-6 w-6" />
                  </a>
                  <a
                    href="https://www.instagram.com/codeenginesharjeel" target='_blank'
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/muhammad-sharjeel-701578274/" target='_blank'
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Linkedin className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
