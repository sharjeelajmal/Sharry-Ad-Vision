"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import StatsCards from "../_components/StatCards";
import CurrencySelector from "../_components/CurrencySelector";
import AnimatedSection from "../_components/AnimatedSection";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

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
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [conversionRates, setConversionRates] = useState({ PKR: 1 });
  const [searchTerm, setSearchTerm] = useState('');

  const pkrRegex = /(\d{1,3}(?:,?\d{3})*|\d+)\s*PKR/gi;

  const filterServices = useCallback((category, allServicesList) => {
    let tempFiltered = [];

    // Filter by category first
    if (category.toLowerCase() === 'offers') {
      tempFiltered = allServicesList.filter(service => service.title.toLowerCase().includes('offer'));
    } else {
      tempFiltered = allServicesList.filter(service => {
        const serviceCategory = (service.category || '').toLowerCase();
        const title = service.title.toLowerCase();
        return serviceCategory === category.toLowerCase() || (title.includes(category.toLowerCase()) && !title.includes('offer'));
      });
    }

    // Then apply search term if present
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFiltered = tempFiltered.filter(service =>
        service.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        service.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        (service.category && service.category.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    setFilteredServices(tempFiltered);
    setActiveTab(category);
  }, [searchTerm]);

  const convertPrice = useCallback((price) => {
    const rate = conversionRates[selectedCurrency] || 1;
    let converted = price * rate;
    return converted % 1 === 0 ? converted.toFixed(0) : converted.toFixed(2);
  }, [conversionRates, selectedCurrency]);

  const convertQuantityString = useCallback((quantityString) => {
    if (!quantityString) return "";
    // Only return the quantity string, do not convert price within it here if it's meant to be separate
    // The price is handled by convertPrice function directly where it's displayed
    return quantityString.replace(pkrRegex, (match, p1) => {
      const numericValue = parseFloat(p1.replace(/,/g, ""));
      if (isNaN(numericValue)) return match;
      return `${convertPrice(numericValue)} ${selectedCurrency}`;
    });
  }, [convertPrice, selectedCurrency, pkrRegex]);
  
  const convertDescriptionString = useCallback((description, basePrice) => {
    if (!description) return "";
    let convertedDesc = description.replace(/{{price}}/g, `${convertPrice(Number(basePrice || 0))} ${selectedCurrency}`);
    convertedDesc = convertedDesc.replace(pkrRegex, (match, p1) => {
      const numericValue = parseFloat(p1.replace(/,/g, ""));
      if (isNaN(numericValue)) return match;
      return `${convertPrice(numericValue)} ${selectedCurrency}`;
    });
    return convertedDesc;
  }, [convertPrice, selectedCurrency, pkrRegex]);

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
      return 'PK';
    } catch (error) {
      return 'PK';
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [servicesResponse, tabsResponse, currenciesResponse] = await Promise.all([
          fetch("/api/services"), fetch("/api/tabs"), fetch("/api/currencies"),
        ]);
        const servicesData = await servicesResponse.json();
        setServices(servicesData);

        const tabsData = await tabsResponse.json();
        setTabs(tabsData);

        const initialTab = tabsData.length > 0 ? tabsData[0] : "Tiktok";
        setActiveTab(initialTab);

        const currenciesData = await currenciesResponse.json();
        const orderedCurrencies = (currenciesData || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const rates = orderedCurrencies.reduce((acc, curr) => { acc[curr.code] = curr.rate; return acc; }, { PKR: 1 });
        setConversionRates(rates);

        const userCountryCode = await fetchUserLocation();
        const preferredCurrency = countryCurrencyMap[userCountryCode] || "PKR";
        
        if (orderedCurrencies.some(c => c.code === preferredCurrency)) {
            setSelectedCurrency(preferredCurrency);
        } else {
            setSelectedCurrency(orderedCurrencies[0]?.code || "PKR");
        }
      } catch (error) {
        console.error("Initial data fetch karne mein error:", error);
        toast.error("Data load nahi ho saka. PKR default set kar diya gaya hai.");
        setSelectedCurrency("PKR");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [fetchUserLocation]);

  useEffect(() => {
    if (services.length > 0 && activeTab) {
      filterServices(activeTab, services);
    }
  }, [services, activeTab, searchTerm, filterServices]);


  if (!isClient || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src="/Loader.gif" alt="loading" width={140} height={140} />
      </div>
    );
  }

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
                // Apply the new class here
                className={` btn-md px-5 font-semibold hover:bg-gray-300 shadow-equal ${activeTab === tab ? "bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-white" : "bg-white text-black border-none no-border-tab"} capitalize rounded-lg`}
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
    className="input w-full bg-white border-2 border-gray-200 outline-none px-5 py-3 rounded-full shadow-sm  focus:scale-105 focus:border-transparent transition-all duration-200 "
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  <svg 
    className="absolute right-4 top-3.5 h-5 w-5 text-gray-400"
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
    />
  </svg>
</div>


        </div>
      </AnimatedSection>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {filteredServices.map((service) => (
            <AnimatedSection key={service._id}>
              <div className="group relative hover:scale-105 transition-all border border-gray-300 rounded-lg p-3 max-w-xs mx-auto cursor-pointer">
                <div className="relative h-40 w-full mb-3">
                  <img src={service.imageUrl || '/placeholder.png'} alt={service.title} className="object-contain h-full w-full" />
                </div>
                <h2 className="font-bold text-xl mt-2 text-center">{service.title}</h2>
                <p className="text-center text-sm text-gray-600">
                  Price: {convertPrice(service.price || 0)} {selectedCurrency}
                  {service.quantity && (<span className="inline"> {convertQuantityString(service.quantity)}</span>)} {/* CHANGE: Quantity in same line */}
                </p>
                <div className="absolute bottom-0 left-0 w-full p-3 bg-white opacity-0 group-hover:opacity-100 transition-all duration-300 max-h-40 overflow-y-auto">
                   <p className="text-xs sm:text-sm whitespace-pre-line"> {/* CHANGE: Smaller font on small devices */}
                     {convertDescriptionString(service.description, service.price)}
                   </p>
                </div>
              </div>
            </AnimatedSection>
          )
        )}
      </div>
    </section>
  );
};

export default Services;