"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import StatsCards from "../_components/StatCards";
import CurrencySelector from "../_components/CurrencySelector";
import AnimatedSection from "../_components/AnimatedSection";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

// Mapping of country codes to their respective currencies.
const countryCurrencyMap = {
  PK: "PKR", US: "USD", IN: "INR", AE: "AED", GB: "GBP", DE: "EUR", FR: "EUR",
};

const Services = () => {
  const [isClient, setIsClient] = useState(false);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [tabs, setTabs] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("PKR"); // Default to PKR
  const [conversionRates, setConversionRates] = useState({ PKR: 1 });
  const [searchTerm, setSearchTerm] = useState('');

  const pkrRegex = /(\d{1,3}(?:,?\d{3})*|\d+)\s*PKR/gi;

  // Fetches the user's location to set a preferred currency. Caches the result in sessionStorage.
  const fetchUserLocation = useCallback(async () => {
    const cachedCountryCode = sessionStorage.getItem('userCountryCode');
    if (cachedCountryCode) {
      return cachedCountryCode;
    }
    try {
      const geoResponse = await fetch("/api/get-user-location");
      const data = await geoResponse.json();
      if (data && data.countryCode) {
        sessionStorage.setItem('userCountryCode', data.countryCode);
        return data.countryCode;
      }
      return 'PK'; // Default country
    } catch (error) {
      console.error("Could not fetch user location, defaulting to PK.", error);
      return 'PK';
    }
  }, []);

  // Main data fetching function, called only once on component mount.
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Single API call to get all necessary data (services, tabs, currencies).
      const response = await fetch("/api/initial-data");
      if (!response.ok) {
        throw new Error("Check Your Internet Connection ! Data could not be loaded.");
      }
      const data = await response.json();

      // 2. Set state with the fetched data.
      setServices(data.services || []);
      const serviceTabs = data.tabs || [];
      setTabs(serviceTabs);

      // Set the initial active tab.
      if (serviceTabs.length > 0) {
        setActiveTab(serviceTabs[0]);
      }

      // Process and set currency conversion rates.
      const orderedCurrencies = (data.currencies || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const rates = orderedCurrencies.reduce((acc, curr) => {
        acc[curr.code] = curr.rate;
        return acc;
      }, { PKR: 1 });
      setConversionRates(rates);

      // 3. Determine and set the user's preferred currency.
      const userCountryCode = await fetchUserLocation();
      const preferredCurrency = countryCurrencyMap[userCountryCode] || "PKR";
      
      // Check if the preferred currency is available, otherwise fall back to the first available or PKR.
      if (orderedCurrencies.some(c => c.code === preferredCurrency)) {
          setSelectedCurrency(preferredCurrency);
      } else if (orderedCurrencies.length > 0) {
          setSelectedCurrency(orderedCurrencies[0].code);
      } else {
          setSelectedCurrency("PKR");
      }

    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Refresh Plzz ! Data could not be loaded. Defaulting to PKR.");
      setSelectedCurrency("PKR"); // Fallback currency
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserLocation]); // Dependency ensures fetchUserLocation is available.

  // This effect runs only once to fetch all initial data.
  useEffect(() => {
    setIsClient(true);
    fetchInitialData();
  }, [fetchInitialData]);
  
  // Memoized function to filter services based on the active tab and search term.
  const filterServices = useCallback(() => {
    if (!activeTab) return;
    
    let tempFiltered = [];
    const lowerCaseActiveTab = activeTab.toLowerCase();

    if (lowerCaseActiveTab === 'offers') {
      tempFiltered = services.filter(service => service.title.toLowerCase().includes('offer'));
    } else {
      tempFiltered = services.filter(service => (service.category || '').toLowerCase() === lowerCaseActiveTab);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFiltered = tempFiltered.filter(service =>
        service.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        service.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        (service.category && service.category.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    setFilteredServices(tempFiltered);
  }, [services, activeTab, searchTerm]);

  // This effect re-runs whenever the filters (active tab, search term) or services list change.
  useEffect(() => {
    if (services.length > 0) {
      filterServices();
    }
  }, [services, activeTab, searchTerm, filterServices]);

  // Memoized functions for converting prices and strings containing prices.
  const convertPrice = useCallback((price) => {
    const rate = conversionRates[selectedCurrency] || 1;
    let converted = price * rate;
    return converted % 1 === 0 ? converted.toFixed(0) : converted.toFixed(2);
  }, [conversionRates, selectedCurrency]);

  const convertQuantityString = useCallback((quantityString) => {
    if (!quantityString) return "";
    return quantityString.replace(pkrRegex, (match, p1) => {
      const numericValue = parseFloat(p1.replace(/,/g, ""));
      if (isNaN(numericValue)) return match;
      return `${convertPrice(numericValue)} ${selectedCurrency}`;
    });
  }, [convertPrice, selectedCurrency, pkrRegex]);
  
  const convertDescriptionString = useCallback((description, basePrice) => {
    if (!description) return "";
    let convertedDesc = description.replace(/{{price}}/g, `${convertPrice(Number(basePrice || 0))} ${selectedCurrency}`);
    return convertedDesc.replace(pkrRegex, (match, p1) => {
      const numericValue = parseFloat(p1.replace(/,/g, ""));
      if (isNaN(numericValue)) return match;
      return `${convertPrice(numericValue)} ${selectedCurrency}`;
    });
  }, [convertPrice, selectedCurrency, pkrRegex]);

  // Loading state UI
  if (!isClient || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Image src="/Loader.gif" alt="loading" width={140} height={140} unoptimized />
      </div>
    );
  }

  // Main component render
  return (
    <section className="mb-10">
      <AnimatedSection>
        <h1 className="font-bold text-4xl text-center py-5">Our Services</h1>
        <StatsCards isAdmin={false} />
      </AnimatedSection>

      <h2 className="text-center my-7 sticky top-0 z-40">
        <span className="bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-white shadow-lg rounded-lg py-2 px-4 font-semibold text-sm">
          Click a Service Icon to See its Description!
        </span>
      </h2>

      {selectedCurrency && (
        <CurrencySelector
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          conversionRates={conversionRates}
          setConversionRates={setConversionRates}
          isAdmin={false}
        />
      )}

      <AnimatedSection>
        <div className="rounded-lg p-6 mb-6 bg-white w-full max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold w-full text-center mb-4">Service Categories</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {tabs.map((tab) => (
              <Button
                key={tab}
                className={`btn-md px-5 font-semibold hover:bg-gray-300 shadow-equal ${activeTab === tab ? "bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-white" : "bg-white text-black border-none no-border-tab"} capitalize rounded-lg`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Button> 
            ))}
          </div>

          <div className="mt-3 relative">
            <input
              type="text"
              placeholder="Search services..."
              className="input w-full bg-white border-2 border-gray-200 outline-none px-5 py-3 rounded-full shadow-sm focus:scale-105 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {filteredServices.map((service) => (
          <AnimatedSection key={service._id}>
            <div className="group relative hover:scale-105 transition-all border border-gray-300 rounded-lg p-3 max-w-xs mx-auto cursor-pointer">
              <div className="relative h-40 w-full mb-3">
                {service.imageUrl && (service.imageUrl.endsWith('.mp4') || service.imageUrl.endsWith('.webm')) ? (
                  <video src={service.imageUrl} autoPlay loop muted playsInline className="object-contain h-full w-full">
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <Image
                    src={service.imageUrl || '/placeholder.png'}
                    alt={service.title}
                    width={200}
                    height={160}
                    className="object-contain h-full w-full"
                  />
                )}
              </div>
              <h2 className="font-bold text-xl mt-2 text-center">{service.title}</h2>
           <p className="text-center text-sm text-gray-600 whitespace-pre-line">
  Price: {convertPrice(service.price || 0)} {selectedCurrency}
  {service.quantity && (<span> {convertQuantityString(service.quantity)}</span>)}
</p>
              <div className="absolute bottom-0 left-0 w-full p-3 bg-white opacity-0 group-hover:opacity-100 transition-all duration-300 max-h-40 overflow-y-auto">
                <p className="text-xs sm:text-sm whitespace-pre-line">
                  {convertDescriptionString(service.description, service.price)}
                </p>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
};

export default Services;