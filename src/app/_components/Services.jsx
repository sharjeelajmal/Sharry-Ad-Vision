"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import StatsCards from "../_components/StatCards";
import CurrencySelector from "../_components/CurrencySelector";
import AnimatedSection from "../_components/AnimatedSection";
import { toast } from "react-hot-toast";

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

  const filterServices = useCallback((category, allServicesList) => {
    let filtered;
    if (category.toLowerCase() === 'offers') {
      filtered = allServicesList.filter(service => service.title.toLowerCase().includes('offer'));
    } else {
      filtered = allServicesList.filter(service => {
        const serviceCategory = (service.category || '').toLowerCase();
        const title = service.title.toLowerCase();
        return serviceCategory === category.toLowerCase() || (title.includes(category.toLowerCase()) && !title.includes('offer'));
      });
    }
    setFilteredServices(filtered);
    setActiveTab(category);
  }, []);

  // **UPDATED FUNCTION WITH CACHING**
  const fetchUserLocation = useCallback(async () => {
    // Step 1: Pehle browser ki session storage check karen
    const cachedCountryCode = sessionStorage.getItem('userCountryCode');
    if (cachedCountryCode) {
      console.log('Location cache se mili:', cachedCountryCode);
      return cachedCountryCode;
    }

    // Step 2: Agar cache mein nahi hai, to API call karen
    try {
      console.log('Cache mein location nahi mili, API call ki ja rahi hai...');
      const geoResponse = await fetch("/api/get-user-location");
      if (!geoResponse.ok) {
        const errorData = await geoResponse.json();
        console.error("Geolocation API se error:", geoResponse.status, errorData);
        return null;
      }
      const geoData = await geoResponse.json();
      
      // Step 3: API se milne wali location ko cache mein save karen
      if (geoData && geoData.countryCode) {
        sessionStorage.setItem('userCountryCode', geoData.countryCode);
        console.log('Location fetch karke cache mein save kar di gayi:', geoData.countryCode);
        return geoData.countryCode;
      }
      return null;
    } catch (error) {
      console.error("API call /api/get-user-location mein error:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [servicesResponse, tabsResponse, currenciesResponse] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/tabs"),
          fetch("/api/currencies"),
        ]);

        const servicesData = await servicesResponse.json();
        const tabsData = await tabsResponse.json();
        const currenciesData = await currenciesResponse.json();

        setServices(servicesData);
        setTabs(tabsData);

        const initialTab = tabsData.length > 0 ? tabsData[0] : "Tiktok";
        filterServices(initialTab, servicesData);

        const orderedCurrencies = (currenciesData || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const rates = orderedCurrencies.reduce((acc, curr) => {
          acc[curr.code] = curr.rate;
          return acc;
        }, { PKR: 1 });
        setConversionRates(rates);

        const userCountryCode = await fetchUserLocation();
        let determinedCurrency = orderedCurrencies[0]?.code || "PKR";

        if (userCountryCode && countryCurrencyMap[userCountryCode]) {
          const preferredCurrency = countryCurrencyMap[userCountryCode];
          if (orderedCurrencies.some(c => c.code === preferredCurrency)) {
            determinedCurrency = preferredCurrency;
          }
        }
        
        setSelectedCurrency(determinedCurrency);
      } catch (error) {
        console.error("Initial data fetch karne mein error:", error);
        toast.error("Data load nahi ho saka. PKR default set kar diya gaya hai.");
        setSelectedCurrency("PKR");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [filterServices, fetchUserLocation]);

  const convertPrice = useCallback((price) => {
    const rate = conversionRates[selectedCurrency] || 1;
    let converted = price * rate;
    return converted % 1 === 0 ? converted.toFixed(0) : converted.toFixed(2);
  }, [conversionRates, selectedCurrency]);

  const convertQuantityString = useCallback((quantityString) => {
    if (!quantityString) return "";
    const regex = /(\d{1,3}(?:,\d{3})*)\s*PKR/g;
    return quantityString.replace(regex, (match, p1) => {
      const numericValue = parseFloat(p1.replace(/,/g, ""));
      if (isNaN(numericValue)) return match;
      return `${convertPrice(numericValue)} ${selectedCurrency}`;
    });
  }, [convertPrice, selectedCurrency]);

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
              <button
                key={tab}
                className={`btn btn-md px-5 font-semibold ${activeTab === tab ? "bg-blue-700 text-white" : "bg-white text-black border"} capitalize rounded-lg`}
                onClick={() => filterServices(tab, services)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </AnimatedSection>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {filteredServices.map((service) => {
          const dynamicDescription = service.description.replace(/{{price}}/g, `${convertPrice(Number(service.price || 0))} ${selectedCurrency}`);
          return (
            <AnimatedSection key={service._id}>
              <div className="group relative hover:scale-105 transition-all border border-gray-300 rounded-lg p-3 max-w-xs mx-auto cursor-pointer">
                <div className="relative h-40 w-full mb-3">
                  <img src={service.imageUrl || '/placeholder.png'} alt={service.title} className="object-contain h-full w-full" />
                </div>
                <h2 className="font-bold text-xl mt-2 text-center">{service.title}</h2>
                <p className="text-center text-sm text-gray-600">
                  Price: {convertPrice(service.price || 0)} {selectedCurrency}
                  {service.quantity && (<> <br /> {convertQuantityString(service.quantity).split("\n").map((line, index) => (<React.Fragment key={index}>{line}<br /></React.Fragment>))} </>)}
                </p>
                <div className="absolute bottom-0 left-0 w-full p-3 bg-white opacity-0 group-hover:opacity-100 transition-all duration-300 max-h-40 overflow-y-auto">
                  {dynamicDescription.split("\n").map((line, index) => (<React.Fragment key={index}>{line}<br /></React.Fragment>))}
                </div>
              </div>
            </AnimatedSection>
          );
        })}
      </div>
    </section>
  );
};

export default Services;