"use client";

import React, { useState, useRef, useEffect } from "react";
import AnimatedSection from "./AnimatedSection";
const currencyIcons = {
  PKR: "₨",
  USD: "$",
  INR: "₹",
};

const CurrencySelector = ({ selectedCurrency, setSelectedCurrency }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (currency) => {
    setSelectedCurrency(currency);
    setIsOpen(false); // close dropdown after selection
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex justify-center mb-3" ref={dropdownRef}>
          <AnimatedSection>
      <div className="relative inline-block text-left">
        <button
          type="button"
          className="btn m-1 bg-gradient-to-r from-teal-400 to-blue-600 text-white shadow-lg flex items-center space-x-2"
          onClick={toggleDropdown}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span>{currencyIcons[selectedCurrency]}</span>
          <span>{selectedCurrency}</span>
          <svg
            className={`w-4 h-4 ml-1 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-36 absolute mt-1 right-0">
            {["PKR", "USD", "INR"].map((currency) => (
              <li key={currency}>
                <button
                  className={`flex items-center space-x-2 w-full text-left px-2 py-1 rounded hover:bg-gray-200 ${
                    selectedCurrency === currency ? "font-bold text-primary" : ""
                  }`}
                  onClick={() => handleSelect(currency)}
                >
                  <span>{currencyIcons[currency]}</span>
                  <span>{currency}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      </AnimatedSection>
    </div>
  );
};

export default CurrencySelector;
