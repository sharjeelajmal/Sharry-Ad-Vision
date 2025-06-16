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
  AED: "د.إ",
};

const countryCurrencyMap = {
  PK: "PKR", // Pakistan
  US: "USD", // United States
  IN: "INR", // India
  AE: "AED", // United Arab Emirates
  GB: "GBP", // United Kingdom
  DE: "EUR", // Germany (example for Eurozone)
  FR: "EUR", // France
  // **ADD MORE COUNTRY CODES AND THEIR CURRENCIES HERE AS NEEDED**
  // Example for another country:
  // JP: "JPY", // Japan
  // AU: "AUD", // Australia
  // CA: "CAD", // Canada
};

const CurrencySelector = ({
  selectedCurrency,
  setSelectedCurrency,
  conversionRates,
  setConversionRates,
  isAdmin = false,
  isEditing = false,
  setIsEditing,
}) => {
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setHasMounted(true);

    const fetchUserLocation = async () => {
      console.log("Attempting to fetch user location...");
      try {
        const geoResponse = await fetch("http://ip-api.com/json/");
        if (!geoResponse.ok) {
          console.error("Geolocation API response not OK:", geoResponse.status);
          throw new Error("Failed to fetch location from ip-api.com");
        }
        const geoData = await geoResponse.json();
        console.log("Geolocation data received:", geoData);
        if (geoData && geoData.countryCode) {
          console.log("User country code:", geoData.countryCode);
          return geoData.countryCode;
        } else {
          console.warn("Geolocation data missing countryCode.");
          return null;
        }
      } catch (error) {
        console.error("Error fetching user location:", error);
        toast.error("Failed to determine your location."); // User-facing toast
        return null;
      }
    };

    const fetchAndSetCurrencies = async () => {
      console.log("Fetching currencies from /api/currencies...");
      try {
        const response = await fetch("/api/currencies");
        if (!response.ok) {
          console.error("API /api/currencies response not OK:", response.status);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Currencies data received:", data);

        // Sort currencies by 'createdAt' timestamp
        const orderedCurrencies = data.sort((a, b) => {
          // Check if createdAt exists before creating Date objects
          if (!a.createdAt || !b.createdAt) {
            console.warn("Missing 'createdAt' field in one or more currencies. Sorting might be unreliable.");
            // Fallback to alphabetical or current order if createdAt is missing
            return String(a.code).localeCompare(String(b.code));
          }
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateA.getTime() - dateB.getTime(); // Ascending order (oldest first)
        });
        console.log("Currencies after sorting:", orderedCurrencies);

        setCurrencies(orderedCurrencies);

        const rates = orderedCurrencies.reduce((acc, curr) => {
          acc[curr.code] = curr.rate;
          return acc;
        }, {});
        setConversionRates(rates);

        const userCountryCode = await fetchUserLocation(); // Get user's country code
        let defaultCurrencyCode = "PKR"; // Fallback default

        console.log("Attempting to determine default currency...");
        console.log("User Country Code:", userCountryCode);

        if (userCountryCode && countryCurrencyMap[userCountryCode]) {
          const preferredCurrency = countryCurrencyMap[userCountryCode];
          console.log("Preferred currency for location:", preferredCurrency);

          if (orderedCurrencies.some((c) => c.code === preferredCurrency)) {
            defaultCurrencyCode = preferredCurrency;
            console.log("Location-based currency found and is available:", defaultCurrencyCode);
          } else {
            console.log("Preferred currency from location not available in fetched currencies.");
            if (orderedCurrencies.length > 0) {
                defaultCurrencyCode = orderedCurrencies[0].code;
                console.log("Defaulting to first-created currency:", defaultCurrencyCode);
            }
          }
        } else if (orderedCurrencies.length > 0) {
          defaultCurrencyCode = orderedCurrencies[0].code;
          console.log("No location preference or location not found. Defaulting to first-created currency:", defaultCurrencyCode);
        } else {
            console.log("No currencies fetched. Defaulting to PKR.");
            defaultCurrencyCode = "PKR";
        }

        // Only update selectedCurrency if it's not already valid
        if (!selectedCurrency || !orderedCurrencies.some(c => c.code === selectedCurrency)) {
            setSelectedCurrency(defaultCurrencyCode);
            console.log("Setting selectedCurrency to:", defaultCurrencyCode);
        } else {
            console.log("selectedCurrency already valid:", selectedCurrency);
        }

      } catch (error) {
        console.error("Error in fetchAndSetCurrencies:", error);
        toast.error("Failed to load currencies or determine default.");
      } finally {
        setIsLoading(false);
        console.log("Loading finished. Is loading:", isLoading);
      }
    };

    fetchAndSetCurrencies();
  }, []); // Re-run only on mount

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSelect = (currencyCode) => {
    setSelectedCurrency(currencyCode);
    setIsOpen(false);
  };

  const handleAddCurrency = () => {
    setCurrencies([
      ...currencies,
      { code: "", name: "", symbol: "", rate: 0, createdAt: new Date().toISOString() },
    ]);
  };

  const handleSaveCurrencies = async () => {
    console.log("Saving currencies...");
    try {
      const validCurrencies = currencies
        .filter((c) => c.code && c.name && !isNaN(c.rate))
        .map((c) => ({
          code: c.code.toUpperCase(),
          name: c.name,
          symbol: c.symbol || currencyIcons[c.code] || c.code,
          rate: parseFloat(c.rate) || 0,
          createdAt: c.createdAt, // Preserve existing createdAt, backend should handle new ones
        }));

      if (validCurrencies.length === 0) {
        throw new Error("At least one valid currency is required");
      }

      const response = await fetch("/api/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validCurrencies),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to save currencies API response:", errorData);
        throw new Error(errorData.error || "Failed to save currencies");
      }

      const savedCurrencies = await response.json();
      console.log("Currencies saved by API:", savedCurrencies);

      // Sort saved currencies by 'createdAt' timestamp
      const orderedSavedCurrencies = savedCurrencies.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) {
            console.warn("Missing 'createdAt' field in one or more saved currencies. Sorting might be unreliable.");
            return String(a.code).localeCompare(String(b.code));
        }
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateA.getTime() - dateB.getTime(); // Ascending order (oldest first)
      });
      console.log("Saved currencies after sorting:", orderedSavedCurrencies);


      setCurrencies(orderedSavedCurrencies);
      setIsEditing(false);

      const newRates = orderedSavedCurrencies.reduce((acc, curr) => {
        acc[curr.code] = curr.rate;
        return acc;
      }, {});
      setConversionRates(newRates);

      // After saving, re-evaluate default based on location/oldest
      const userCountryCode = await fetchUserLocation(); // Re-fetch location or use cached
      let defaultCurrencyCode = "PKR";

      console.log("After save: Attempting to determine default currency...");
      console.log("After save: User Country Code:", userCountryCode);


      if (userCountryCode && countryCurrencyMap[userCountryCode]) {
        const preferredCurrency = countryCurrencyMap[userCountryCode];
        console.log("After save: Preferred currency for location:", preferredCurrency);
        if (orderedSavedCurrencies.some((c) => c.code === preferredCurrency)) {
          defaultCurrencyCode = preferredCurrency;
          console.log("After save: Location-based currency found and is available:", defaultCurrencyCode);
        } else {
            console.log("After save: Preferred currency from location not available in fetched currencies.");
            if (orderedSavedCurrencies.length > 0) {
                defaultCurrencyCode = orderedSavedCurrencies[0].code;
                console.log("After save: Defaulting to first-created currency:", defaultCurrencyCode);
            }
        }
      } else if (orderedSavedCurrencies.length > 0) {
        defaultCurrencyCode = orderedSavedCurrencies[0].code;
        console.log("After save: No location preference or location not found. Defaulting to first-created currency:", defaultCurrencyCode);
      } else {
          console.log("After save: No currencies saved. Defaulting to PKR.");
          defaultCurrencyCode = "PKR";
      }

      // Set the selected currency, but only if it's not already a valid selection
      if (!selectedCurrency || !orderedSavedCurrencies.some(c => c.code === selectedCurrency)) {
          setSelectedCurrency(defaultCurrencyCode);
          console.log("After save: Setting selectedCurrency to:", defaultCurrencyCode);
      } else {
          console.log("After save: selectedCurrency already valid:", selectedCurrency);
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
    <div className="flex flex-col items-center " ref={dropdownRef}>
      {isAdmin && (
        <div className="flex space-x-2 mb-2">
          {isEditing ? (
            <>
              <button
                className="btn btn-sm btn-success text-white "
                onClick={handleSaveCurrencies}
              >
                Save
              </button>
              <button
                className="btn btn-sm btn-error text-white"
                onClick={() => {
                  setIsEditing(false);
                  // If you want to discard unsaved changes and revert to the last fetched state:
                  // fetchAndSetCurrencies(); // Uncomment this line
                }}
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
            <table className="table table-zebra table-xs bg-white">
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
                  <tr key={currency._id || index}>
                    <td>
                      <input
                        type="text"
                        className="input input-sm input-bordered w-20 bg-white"
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
                        className="input input-sm input-bordered w-28 bg-white"
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
                        className="input input-sm input-bordered w-16 bg-white"
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
                        className="input input-sm input-bordered w-24 bg-white"
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
                        className="btn btn-xs btn-error text-white"
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
                className={`w-4 h-4 ml-1 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
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
              <ul className="dropdown-content z-[1] menu p-2 shadow bg-slate-50 rounded-box w-36 absolute mt-1 right-0">
                {currencies.map((currency) => (
                  <li key={currency.code}>
                    <button
                      className={`flex items-center space-x-2 w-full text-left px-2 py-1 rounded hover:bg-gray-200 ${
                        selectedCurrency === currency.code
                          ? "font-bold text-primary"
                          : ""
                      }`}
                      onClick={() => handleSelect(currency.code)}
                    >
                      <span>
                        {currency.symbol ||
                          currencyIcons[currency.code] ||
                          currency.code}
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