// src/app/_components/CurrencySelector.jsx
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
  conversionRates, // Receive current rates
  setConversionRates, // Receive setter for rates
  isAdmin = false,
  isEditing = false,
  setIsEditing // Receive setter for editing state from parent
}) => {
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setHasMounted(true);
    const fetchCurrencies = async () => {
      try {
        const response = await fetch('/api/currencies');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCurrencies(data);
        // Also update conversionRates here when fetched
        const rates = data.reduce((acc, curr) => {
          acc[curr.code] = curr.rate;
          return acc;
        }, {});
        setConversionRates(rates);
        // If selectedCurrency is not in fetched data, default to first or PKR
        if (data.length > 0 && !data.some(c => c.code === selectedCurrency)) {
            setSelectedCurrency(data[0].code);
        } else if (data.length === 0) {
            setSelectedCurrency("PKR"); // Fallback if no currencies
        }

      } catch (error) {
        console.error("Error fetching currencies:", error);
        toast.error("Failed to load currencies.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrencies();
  }, []); // Re-run only on mount

  const toggleDropdown = () => setIsOpen(prev => !prev);

  const handleSelect = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    setIsOpen(false);
  };

  const handleAddCurrency = () => {
    setCurrencies([...currencies, { code: "", name: "", symbol: "", rate: 0 }]);
  };

  const handleSaveCurrencies = async () => {
    try {
      // Validate currencies before saving
      const validCurrencies = currencies
        .filter(c => c.code && c.name && !isNaN(c.rate))
        .map(c => ({
          code: c.code.toUpperCase(),
          name: c.name,
          symbol: c.symbol || currencyIcons[c.code] || c.code, // Use custom symbol or fallback
          rate: parseFloat(c.rate) || 0
        }));

      // Ensure we have at least one currency
      if (validCurrencies.length === 0) {
        throw new Error('At least one valid currency is required');
      }

      // Make API call to save currencies
      const response = await fetch('/api/currencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCurrencies)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save currencies');
      }

      const savedCurrencies = await response.json();

      // Update local state
      setCurrencies(savedCurrencies);
      setIsEditing(false); // Exit editing mode

      // Update conversion rates in parent/global state
      const newRates = savedCurrencies.reduce((acc, curr) => {
        acc[curr.code] = curr.rate;
        return acc;
      }, {});
      setConversionRates(newRates);

      // Ensure selected currency still exists in the new list, or default
      if (!savedCurrencies.some(c => c.code === selectedCurrency)) {
        setSelectedCurrency(savedCurrencies[0]?.code || 'PKR');
      }

      toast.success("Currencies saved successfully!");
    } catch (error) {
      console.error("Error saving currencies:", error);
      toast.error(error.message || "Failed to save currencies");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!hasMounted || isLoading) {
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
                onClick={() => {
                  setIsEditing(false);
                  // Optionally, refetch currencies to revert unsaved changes
                  // fetchCurrencies();
                }}
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
          <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto w-full max-w-xl">
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
                  <tr key={currency._id || index}> {/* Use _id if available, otherwise index */}
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
                        className="input input-sm input-bordered w-28"
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
              aria-expanded={isOpen}
            >
              <span>{currencyIcons[selectedCurrency] || selectedCurrency}</span>
              <span>{selectedCurrency}</span>
              <svg
                className={`w-4 h-4 ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <ul className="dropdown-content z-[1] menu p-2 shadow bg-slate-50 rounded-box w-36 absolute mt-1 right-0">
                {currencies.map((currency) => (
                  <li key={currency.code}>
                    <button
                      className={`flex items-center space-x-2 w-full text-left px-2 py-1 rounded hover:bg-gray-200 ${
                        selectedCurrency === currency.code ? "font-bold text-primary" : ""
                      }`}
                      onClick={() => handleSelect(currency.code)}
                    >
                      <span>{currency.symbol || currencyIcons[currency.code] || currency.code}</span> {/* Use stored symbol first */}
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