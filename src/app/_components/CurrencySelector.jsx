"use client";
import React, { useState, useEffect, useRef } from "react";
import AnimatedSection from "./AnimatedSection";
import toast from "react-hot-toast";

const currencySymbols = {
  PKR: "₨",
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
};

const CurrencySelector = ({
  selectedCurrency,
  setSelectedCurrency,
  setConversionRates,
  isAdmin = false,
  isEditing = false,
  setIsEditing,
}) => {
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchCurrencies = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/currencies");
        if (!response.ok) throw new Error("Failed to fetch currency list");
        const data = await response.json();

        const orderedCurrencies = data.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setCurrencies(orderedCurrencies);

        const rates = orderedCurrencies.reduce((acc, curr) => {
          acc[curr.code] = curr.rate;
          return acc;
        }, {});
        setConversionRates(rates);
      } catch (error) {
        console.error("Error fetching currencies for dropdown:", error);
        toast.error("Failed to load currency list.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrencies();
  }, [setConversionRates]);

  const handleSelect = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    setIsOpen(false);
  };

  const handleAddCurrency = () => {
    setCurrencies([
      ...currencies,
      {
        code: "",
        name: "",
        symbol: "",
        rate: 0,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const handleSaveCurrencies = async () => {
    try {
      const validCurrencies = currencies
        .filter((c) => c.code && c.name && !isNaN(c.rate))
        .map((c) => ({
          code: String(c.code).toUpperCase(),
          name: String(c.name),
          symbol: String(c.symbol || currencySymbols[c.code] || c.code),
          rate: parseFloat(c.rate) || 0,
          createdAt: c.createdAt,
        }));
      if (validCurrencies.length === 0)
        throw new Error("At least one valid currency is required");

      const response = await fetch("/api/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validCurrencies),
      });
      if (!response.ok) throw new Error(await response.text());

      const savedCurrencies = await response.json();
      const orderedSaved = savedCurrencies.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setCurrencies(orderedSaved);
      setIsEditing(false);

      const newRates = orderedSaved.reduce((acc, curr) => {
        acc[curr.code] = curr.rate;
        return acc;
      }, {});
      setConversionRates(newRates);

      if (!orderedSaved.some((c) => c.code === selectedCurrency)) {
        setSelectedCurrency(orderedSaved[0]?.code || "PKR");
      }
      toast.success("Currencies saved!");
    } catch (error) {
      toast.error(`Save failed: ${error.message}`);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <span className="loading loading-spinner loading-sm"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center" ref={dropdownRef}>
      {isAdmin && (
        <div className="flex flex-wrap gap-2 mb-2 justify-center">
          {isEditing ? (
            <>
              <button
                className="btn btn-sm btn-success text-white"
                onClick={handleSaveCurrencies}
              >
                Save
              </button>
              <button
                className="btn btn-sm btn-error text-white"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm btn-primary text-white"
                onClick={handleAddCurrency}
              >
                Add
              </button>
            </>
          ) : (
            <button
              className="btn btn-sm btn-primary text-white"
              onClick={() => setIsEditing(true)}
            >
              Edit Currencies
            </button>
          )}
        </div>
      )}

      <AnimatedSection>
        {isEditing ? (
          <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-full overflow-x-auto">
            <table className="table bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Symbol</th>
                  <th className="px-4 py-2">Rate (vs PKR)</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {currencies.map((currency, index) => (
                  <tr key={currency._id || index} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">
                      <input
                        type="text"
                        className="input input-sm input-bordered w-full max-w-[80px] bg-white"
                        value={currency.code}
                        onChange={(e) => {
                          const newCurrencies = [...currencies];
                          newCurrencies[index].code =
                            e.target.value.toUpperCase();
                          setCurrencies(newCurrencies);
                        }}
                      />
                    </td>
                    <td className="border px-4 py-2">
                      <input
                        type="text"
                        className="input input-sm input-bordered w-full max-w-[120px] bg-white"
                        value={currency.name}
                        onChange={(e) => {
                          const newCurrencies = [...currencies];
                          newCurrencies[index].name = e.target.value;
                          setCurrencies(newCurrencies);
                        }}
                      />
                    </td>
                    <td className="border px-4 py-2">
                      <input
                        type="text"
                        className="input input-sm input-bordered w-full max-w-[60px] bg-white"
                        value={currency.symbol}
                        onChange={(e) => {
                          const newCurrencies = [...currencies];
                          newCurrencies[index].symbol = e.target.value;
                          setCurrencies(newCurrencies);
                        }}
                      />
                    </td>
                    <td className="border px-4 py-2">
                      <input
                        type="number"
                        className="input input-sm input-bordered w-full max-w-[100px] bg-white"
                        value={currency.rate}
                        step="0.0001"
                        onChange={(e) => {
                          const newCurrencies = [...currencies];
                          newCurrencies[index].rate =
                            parseFloat(e.target.value) || 0;
                          setCurrencies(newCurrencies);
                        }}
                      />
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        className="btn btn-xs btn-error text-white"
                        onClick={() =>
                          setCurrencies(
                            currencies.filter((_, i) => i !== index)
                          )
                        }
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
          <div className="relative inline-block text-left w-full sm:w-auto">
            <button
              type="button"
              className="btn w-full sm:w-auto m-1 bg-gradient-to-r from-teal-400 to-blue-600 text-white shadow-lg flex items-center justify-center space-x-2 px-4 py-2"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <span>
                {currencySymbols[selectedCurrency] || selectedCurrency}
              </span>
              <span>{selectedCurrency}</span>
              <svg
                className={`w-4 h-4 ml-1 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isOpen && (
              <ul className="dropdown-content z-[1] menu p-2 shadow bg-white rounded-box w-full sm:w-48 absolute mt-1 right-0 max-h-60 overflow-y-auto">
                {currencies.map((currency) => (
                  <li key={currency.code}>
                    <button
                      className={`flex items-center space-x-2 w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                        selectedCurrency === currency.code ? "bg-blue-50 font-semibold" : ""
                      }`}
                      onClick={() => handleSelect(currency.code)}
                    >
                      <span>
                        {currency.symbol || currencySymbols[currency.code]}
                      </span>
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