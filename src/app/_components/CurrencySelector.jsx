// src/app/_components/CurrencySelector.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import AnimatedSection from "./AnimatedSection";
import toast from "react-hot-toast";

const currencySymbols = {
  PKR: "₨", USD: "$", INR: "₹", EUR: "€", GBP: "£", AED: "د.إ"
};

const CurrencySelector = ({
  selectedCurrency,       // PROPS from parent
  setSelectedCurrency,  // PROPS from parent
  setConversionRates,     // PROPS from parent
  isAdmin = false,
  isEditing = false,
  setIsEditing
}) => {
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // This useEffect now ONLY fetches the list of available currencies for the dropdown
  useEffect(() => {
    const fetchCurrencies = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/currencies');
        if (!response.ok) throw new Error('Failed to fetch currency list');
        const data = await response.json();
        
        // Sort currencies to maintain a consistent order in the dropdown
        const orderedCurrencies = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setCurrencies(orderedCurrencies);

        // Update conversion rates in the parent component
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
  }, [setConversionRates]); // Dependency on parent's setter function

  const handleSelect = (currencyCode) => {
    setSelectedCurrency(currencyCode); // Update parent's state
    setIsOpen(false);
  };
  
  // Admin-specific functions (no changes needed here)
  const handleAddCurrency = () => {
    setCurrencies([...currencies, { code: "", name: "", symbol: "", rate: 0, createdAt: new Date().toISOString() }]);
  };

  const handleSaveCurrencies = async () => {
    // ... (Your existing save logic is fine)
    try {
      const validCurrencies = currencies.filter(c => c.code && c.name && !isNaN(c.rate)).map(c => ({
        code: String(c.code).toUpperCase(), name: String(c.name),
        symbol: String(c.symbol || currencySymbols[c.code] || c.code), rate: parseFloat(c.rate) || 0,
        createdAt: c.createdAt
      }));
      if (validCurrencies.length === 0) throw new Error('At least one valid currency is required');

      const response = await fetch('/api/currencies', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCurrencies)
      });
      if (!response.ok) throw new Error(await response.text());
      
      const savedCurrencies = await response.json();
      const orderedSaved = savedCurrencies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setCurrencies(orderedSaved);
      setIsEditing(false);

      const newRates = orderedSaved.reduce((acc, curr) => { acc[curr.code] = curr.rate; return acc; }, {});
      setConversionRates(newRates);
      
      if (!orderedSaved.some(c => c.code === selectedCurrency)) {
          setSelectedCurrency(orderedSaved[0]?.code || 'PKR');
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
    return <div className="flex justify-center items-center"><span className="loading loading-spinner loading-sm"></span></div>;
  }

  return (
    <div className="flex flex-col items-center" ref={dropdownRef}>
      {isAdmin && ( /* Admin UI remains unchanged */
        <div className="flex space-x-2 mb-2">
          {isEditing ? (
             <>
              <button className="btn btn-sm btn-success text-white" onClick={handleSaveCurrencies}>Save</button>
              <button className="btn btn-sm btn-error text-white" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="btn btn-sm btn-primary text-white" onClick={handleAddCurrency}>Add</button>
            </>
          ) : (
            <button className="btn btn-sm btn-primary" onClick={() => setIsEditing(true)}>Edit Currencies</button>
          )}
        </div>
      )}

      <AnimatedSection>
        {isEditing ? ( /* Admin editing table remains unchanged */
          <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto w-full max-w-xl">
            {/* Your existing table for editing currencies */}
             <table className="table table-zebra table-xs bg-white">
              <thead>
                <tr>
                  <th>Code</th><th>Name</th><th>Symbol</th><th>Rate (vs PKR)</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currencies.map((currency, index) => (
                  <tr key={currency._id || index}>
                    <td><input type="text" className="input input-sm input-bordered w-20 bg-white" value={currency.code} onChange={(e) => { const newCurrencies = [...currencies]; newCurrencies[index].code = e.target.value.toUpperCase(); setCurrencies(newCurrencies); }}/></td>
                    <td><input type="text" className="input input-sm input-bordered w-28 bg-white" value={currency.name} onChange={(e) => { const newCurrencies = [...currencies]; newCurrencies[index].name = e.target.value; setCurrencies(newCurrencies); }}/></td>
                    <td><input type="text" className="input input-sm input-bordered w-16 bg-white" value={currency.symbol} onChange={(e) => { const newCurrencies = [...currencies]; newCurrencies[index].symbol = e.target.value; setCurrencies(newCurrencies); }}/></td>
                    <td><input type="number" className="input input-sm input-bordered w-24 bg-white" value={currency.rate} step="0.0001" onChange={(e) => { const newCurrencies = [...currencies]; newCurrencies[index].rate = parseFloat(e.target.value) || 0; setCurrencies(newCurrencies); }}/></td>
                    <td><button className="btn btn-xs btn-error text-white" onClick={() => setCurrencies(currencies.filter((_, i) => i !== index))}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="relative inline-block text-left">
            <button type="button" className="btn m-1 bg-gradient-to-r from-teal-400 to-blue-600 text-white shadow-lg flex items-center space-x-2" onClick={() => setIsOpen(prev => !prev)}>
              <span>{currencySymbols[selectedCurrency] || selectedCurrency}</span>
              <span>{selectedCurrency}</span>
              <svg className={`w-4 h-4 ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
              <ul className="dropdown-content z-[1] menu p-2 shadow bg-slate-50 rounded-box w-36 absolute mt-1 right-0">
                {currencies.map((currency) => (
                  <li key={currency.code}>
                    <button className={`flex items-center space-x-2 w-full text-left px-2 py-1 rounded hover:bg-gray-200 ${selectedCurrency === currency.code ? "font-bold" : ""}`} onClick={() => handleSelect(currency.code)}>
                      <span>{currency.symbol || currencySymbols[currency.code]}</span>
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