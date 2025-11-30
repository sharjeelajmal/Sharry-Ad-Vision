"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Coins, Save, X, Plus, Trash2 } from "lucide-react";
import { gsap } from "gsap";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

const currencySymbols = {
  PKR: "₨", USD: "$", INR: "₹", EUR: "€", GBP: "£", AED: "د.إ",
};

const CurrencySelector = ({
  selectedCurrency,
  setSelectedCurrency,
  conversionRates,
  setConversionRates,
  isAdmin = false,
  isEditing = false,
  setIsEditing,
  notifyClients,
}) => {
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  // Animation
  useEffect(() => {
    if (isOpen && menuRef.current) {
      gsap.fromTo(menuRef.current, 
        { y: -10, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [isOpen]);

  // Data Fetching
  useEffect(() => {
    const fetchAndSetCurrencies = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/currencies");
            if (!response.ok) throw new Error("Failed");
            const data = await response.json();
            
            // Sort currencies properly
            const sortedData = data.sort((a, b) => a.code.localeCompare(b.code));
            setCurrencies(sortedData);
            
            const rates = sortedData.reduce((acc, curr) => {
                acc[curr.code] = curr.rate;
                return acc;
            }, { PKR: 1 });
            setConversionRates(rates);
        } catch (error) {
            // Silent fail on client, toast on admin
            if(isAdmin) toast.error("Failed to load currencies.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Always fetch currencies to ensure list is populated for dropdown
    fetchAndSetCurrencies();
    
  }, [isAdmin, setConversionRates]);

  const handleAddCurrency = () => {
    setCurrencies([...currencies, { _id: `new-${Date.now()}`, code: "", name: "", symbol: "", rate: 0 }]);
  };

  const handleSaveCurrencies = async () => {
    try {
      const validCurrencies = currencies
        .filter((c) => c.code && c.name && c.rate !== undefined)
        .map(({ _id, ...rest }) => rest);

      if (validCurrencies.length === 0) throw new Error("At least one currency required");

      const response = await fetch("/api/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validCurrencies),
      });
      if (!response.ok) throw new Error(await response.text());

      const savedCurrencies = await response.json();
      const sortedSaved = savedCurrencies.sort((a, b) => a.code.localeCompare(b.code));
      setCurrencies(sortedSaved);
      setIsEditing(false);
      
      const newRates = sortedSaved.reduce((acc, curr) => {
          acc[curr.code] = curr.rate;
          return acc;
      }, { PKR: 1 });
      setConversionRates(newRates);
      
      if (!sortedSaved.some((c) => c.code === selectedCurrency)) {
        setSelectedCurrency(sortedSaved[0]?.code || "PKR");
      }
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#22c55e', '#ffffff'] });
      toast.success("Currencies saved!");
      
      if (notifyClients) notifyClients();
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

  if (isLoading && isAdmin) {
    return <div className="flex justify-center items-center"><span className="loading loading-spinner loading-sm text-blue-600"></span></div>;
  }

  return (
    <div className="flex flex-col items-center relative z-[100]" ref={dropdownRef}>
      
      {/* --- ADMIN CONTROLS --- */}
      {isAdmin && (
        <div className="flex flex-wrap gap-3 mb-4 justify-center">
          {isEditing ? (
            <>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-green-200 hover:scale-105 transition-all font-bold text-sm" onClick={handleSaveCurrencies}>
                <Save size={16} /> Save
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-red-100 text-red-500 rounded-xl shadow-sm hover:bg-red-50 hover:scale-105 transition-all font-bold text-sm" onClick={() => setIsEditing(false)}>
                <X size={16} /> Cancel
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-100 hover:scale-105 transition-all font-bold text-sm" onClick={handleAddCurrency}>
                <Plus size={16} /> Add New
              </button>
            </>
          ) : (
            <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl shadow-lg hover:shadow-slate-300 hover:scale-105 transition-all font-bold text-sm" onClick={() => setIsEditing(true)}>
              <Coins size={16} /> Manage Rates
            </button>
          )}
        </div>
      )}

      {/* --- PREMIUM EDITOR UI --- */}
      {isEditing && isAdmin ? (
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[1.5rem] shadow-2xl border border-white/50 w-full max-w-3xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="px-4 py-3 font-bold">Code</th>
                  <th className="px-4 py-3 font-bold">Name</th>
                  <th className="px-4 py-3 font-bold">Symbol</th>
                  <th className="px-4 py-3 font-bold">Rate (vs PKR)</th>
                  <th className="px-4 py-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currencies.map((currency, index) => (
                  <tr key={currency._id || index} className="group hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <input type="text" className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" value={currency.code}
                        onChange={(e) => {
                          const newCurrencies = [...currencies];
                          newCurrencies[index].code = e.target.value.toUpperCase();
                          setCurrencies(newCurrencies);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input type="text" className="w-32 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" value={currency.name}
                        onChange={(e) => {
                          const newCurrencies = [...currencies];
                          newCurrencies[index].name = e.target.value;
                          setCurrencies(newCurrencies);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input type="text" className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-center text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" value={currency.symbol}
                        onChange={(e) => {
                          const newCurrencies = [...currencies];
                          newCurrencies[index].symbol = e.target.value;
                          setCurrencies(newCurrencies);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" value={currency.rate} step="0.0001"
                        onChange={(e) => {
                          const newCurrencies = [...currencies];
                          newCurrencies[index].rate = parseFloat(e.target.value) || 0;
                          setCurrencies(newCurrencies);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-2 bg-white border border-red-100 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all shadow-sm" onClick={() => setCurrencies(currencies.filter((_, i) => i !== index))}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
        </div>
      ) : (
        // --- USER VIEW DROPDOWN (Home Page Fix) ---
        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="group relative flex items-center justify-between gap-3 px-6 py-3 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 min-w-[140px]"
          >
            <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-1.5 rounded-full shadow-md shadow-amber-200">
                    <Coins size={16} className="text-white" />
                </div>
                <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                    {selectedCurrency}
                </span>
            </div>
            
            <ChevronDown 
                size={16} 
                className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {isOpen && (
            <div 
                ref={menuRef}
                className="absolute right-0 mt-2 w-48 origin-top-right bg-white border border-slate-200 rounded-2xl shadow-2xl ring-1 ring-black/5 focus:outline-none overflow-hidden z-[9999]"
            >
              <div className="py-2 max-h-60 overflow-y-auto custom-scrollbar bg-white">
                {currencies.map((currency) => (
                  <button
                    key={currency.code}
                    className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-all duration-200
                        ${selectedCurrency === currency.code 
                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-3" 
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent pl-3"
                        }`}
                    onClick={() => {
                      setSelectedCurrency(currency.code);
                      setIsOpen(false);
                    }}
                  >
                    <span className="w-8 text-center text-lg font-bold opacity-70">{currency.symbol || currencySymbols[currency.code]}</span>
                    <span>{currency.code}</span>
                    {selectedCurrency === currency.code && (
                        <span className="ml-auto w-2 h-2 bg-blue-600 rounded-full shadow-sm"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;