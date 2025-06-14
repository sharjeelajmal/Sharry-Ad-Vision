"use client";
import React, { useState, useEffect, useRef } from "react";
import AnimatedSection from "./AnimatedSection";
import toast from "react-hot-toast";


const currencyIcons = {
  PKR: "₨",
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  AED: "د.إ"
};

const CurrencySelector = ({ 
  selectedCurrency, 
  setSelectedCurrency,
  isAdmin = false,
  isEditing = false,
  setIsEditing
}) => {
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch currencies on mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch('/api/currencies');
        const data = await response.json();
        setCurrencies(data);
      } catch (error) {
        console.error("Error fetching currencies:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrencies();
  }, []);

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const handleSelect = (currency) => {
    setSelectedCurrency(currency);
    setIsOpen(false);
  };

  const handleAddCurrency = () => {
    setCurrencies([...currencies, { code: "", name: "", symbol: "", rate: 0 }]);
  };

 const handleSaveCurrencies = async () => {
  try {
    const validCurrencies = currencies.filter(c => 
      c.code && c.name && c.symbol && !isNaN(c.rate)
    );

    const response = await fetch('/api/currencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validCurrencies)
    });

    if (!response.ok) throw new Error('Failed to save currencies');

    const savedCurrencies = await response.json();
    setCurrencies(savedCurrencies);
    setIsEditing(false);

    if (!savedCurrencies.some(c => c.code === selectedCurrency)) {
      setSelectedCurrency(savedCurrencies[0]?.code || 'PKR');
    }

    // ✅ Replace alert with toast
    toast.success("Currencies saved successfully!");
    
    // 🪄 Optional: Detect if new currency was added
    const newOnes = savedCurrencies.filter(
      saved => !currencies.some(c => c.code === saved.code)
    );
    if (newOnes.length > 0) {
      toast.success(`${newOnes.length} new currency(ies) added!`);
    } else {
      toast("Edit complete!");
    }

  } catch (error) {
    console.error("Error saving currencies:", error);
    toast.error("Failed to save currencies. Please try again.");
  }
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <span className="loading loading-spinner loading-sm"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mb-3" ref={dropdownRef}>
      {isAdmin && (
        <div className="flex space-x-2 mb-2">
          {isEditing ? (
            <>
              <button 
                className="btn btn-sm btn-success"
                onClick={handleSaveCurrencies}
              >
                Save
              </button>
              <button 
                className="btn btn-sm btn-error"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-sm btn-primary"
                onClick={handleAddCurrency}
              >
                Add
              </button>
            </>
          ) : (
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          )}
        </div>
      )}
      
      <AnimatedSection>
        {isEditing ? (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <table className="table table-zebra table-xs">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Symbol</th>
                  <th>Rate (1 PKR = ?)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currencies.map((currency, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        className="input input-sm input-bordered w-20"
                        value={currency.code}
                        onChange={(e) => {
                          const newCurrencies = [...currencies];
                          newCurrencies[index].code = e.target.value.toUpperCase();
                          setCurrencies(newCurrencies);
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="input input-sm input-bordered"
                        value={currency.name}
                        onChange={(e) => {
                          const newCurrencies = [...currencies];
                          newCurrencies[index].name = e.target.value;
                          setCurrencies(newCurrencies);
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="input input-sm input-bordered w-16"
                        value={currency.symbol}
                        onChange={(e) => {
                          const newCurrencies = [...currencies];
                          newCurrencies[index].symbol = e.target.value;
                          setCurrencies(newCurrencies);
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="input input-sm input-bordered w-24"
                        value={currency.rate}
                        step="0.0001"
                        onChange={(e) => {
                          const newCurrencies = [...currencies];
                          newCurrencies[index].rate = parseFloat(e.target.value) || 0;
                          setCurrencies(newCurrencies);
                        }}
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-xs btn-error"
                        onClick={() => {
                          setCurrencies(currencies.filter((_, i) => i !== index));
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="relative inline-block text-left">
            <button
              type="button"
              className="btn m-1 bg-gradient-to-r from-teal-400 to-blue-600 text-white shadow-lg flex items-center space-x-2"
              onClick={toggleDropdown}
              aria-haspopup="true"
              aria-expanded={isOpen}
            >
              <span>{currencyIcons[selectedCurrency] || selectedCurrency}</span>
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
              <ul className="dropdown-content z-[1] menu p-2 shadow bg-slate-50 rounded-box w-36 absolute mt-1 right-0">
                {currencies.map((currency) => (
                  <li key={currency.code}>
                    <button
                      className={`flex items-center space-x-2 w-full text-left px-2 py-1 rounded bg-slate-50 hover:bg-gray-200 ${
                        selectedCurrency === currency.code ? "font-bold text-primary" : ""
                      }`}
                      onClick={() => handleSelect(currency.code)}
                    >
                      <span>{currencyIcons[currency.code] || currency.symbol}</span>
                      <span>{currency.code}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </AnimatedSection>
    </div>
  );
};

export default CurrencySelector;