"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import StatsCards from "../_components/StatCards";
import CurrencySelector from "../_components/CurrencySelector";
import AnimatedSection from "../_components/AnimatedSection";
import { toast } from "react-hot-toast";

// countryCurrencyMap ki ab zaroorat nahi hai

const Services = () => {
  const [isClient, setIsClient] = useState(false);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [tabs, setTabs] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [conversionRates, setConversionRates] = useState({ PKR: 1 });

  const pkrRegex = /(\d{1,3}(?:,?\d{3})*|\d+)\s*PKR/gi;

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
    convertedDesc = convertedDesc.replace(pkrRegex, (match, p1) => {
      const numericValue = parseFloat(p1.replace(/,/g, ""));
      if (isNaN(numericValue)) return match;
      return `${convertPrice(numericValue)} ${selectedCurrency}`;
    });
    return convertedDesc;
  }, [convertPrice, selectedCurrency, pkrRegex]);


  const fetchUserCurrency = useCallback(async () => {
    const cachedCurrency = sessionStorage.getItem('userCurrency');
    if (cachedCurrency) {
      console.log('Currency cache se mili (Services Page):', cachedCurrency);
      return cachedCurrency;
    }
    try {
      const geoResponse = await fetch("/api/get-user-location");
      const data = await geoResponse.json();
      if (data && data.currency) {
        sessionStorage.setItem('userCurrency', data.currency);
        return data.currency;
      }
      return 'PKR'; // Fallback
    } catch (error) {
      console.error("fetchUserCurrency mein error:", error);
      return 'PKR'; // Fallback
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
        filterServices(initialTab, servicesData);

        const currenciesData = await currenciesResponse.json();
        const orderedCurrencies = (currenciesData || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const rates = orderedCurrencies.reduce((acc, curr) => { acc[curr.code] = curr.rate; return acc; }, { PKR: 1 });
        setConversionRates(rates);

        const determinedCurrency = await fetchUserCurrency();
        
        if (orderedCurrencies.some(c => c.code === determinedCurrency)) {
            setSelectedCurrency(determinedCurrency);
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
  }, [filterServices, fetchUserCurrency]);

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
        {filteredServices.map((service) => (
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
                   {convertDescriptionString(service.description, service.price).split("\n").map((line, index) => (<React.Fragment key={index}>{line}<br /></React.Fragment>))}
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