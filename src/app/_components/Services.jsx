"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import StatsCards from "../_components/StatCards";
import CurrencySelector from "../_components/CurrencySelector";
import AnimatedSection from "../_components/AnimatedSection";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import io from 'socket.io-client';

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
  const [selectedCurrency, setSelectedCurrency] = useState("PKR");
  const [conversionRates, setConversionRates] = useState({ PKR: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState([]);
  
  // Video elements ke reference store karne ke liye
  const videoRefs = useRef({});

  const pkrRegex = /(\d{1,3}(?:,?\d{3})*|\d+)\s*PKR/gi;

  const fetchUserLocation = useCallback(async () => {
    const cachedCountryCode = sessionStorage.getItem('userCountryCode');
    if (cachedCountryCode) return cachedCountryCode;
    try {
      const geoResponse = await fetch("/api/get-user-location");
      const data = await geoResponse.json();
      if (data?.countryCode) {
        sessionStorage.setItem('userCountryCode', data.countryCode);
        return data.countryCode;
      }
      return 'PK';
    } catch (error) {
      console.error("Could not fetch user location, defaulting to PK.", error);
      return 'PK';
    }
  }, []);

  // Data fetch karne ka function
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true); // Loading shuru
    try {
      const response = await fetch('/api/initial-data');
      if (!response.ok) throw new Error("Check Your Internet Connection! Data could not be loaded.");
      
      const data = await response.json();
      setServices(data.services || []);
      setTabs(data.tabs || []);
      setStats(data.stats || []);

      setActiveTab(prevTab => {
        if (prevTab && data.tabs.includes(prevTab)) return prevTab;
        return data.tabs.length > 0 ? data.tabs[0] : "";
      });

      const orderedCurrencies = (data.currencies || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const rates = orderedCurrencies.reduce((acc, curr) => ({ ...acc, [curr.code]: curr.rate }), { PKR: 1 });
      setConversionRates(rates);

      const userCountryCode = await fetchUserLocation();
      const preferredCurrency = countryCurrencyMap[userCountryCode] || "PKR";
      
      if (orderedCurrencies.some(c => c.code === preferredCurrency)) {
        setSelectedCurrency(preferredCurrency);
      } else if (orderedCurrencies.length > 0) {
        setSelectedCurrency(orderedCurrencies[0].code);
      } else {
        setSelectedCurrency("PKR");
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Refresh Plzz! Data could not be loaded.");
    } finally {
      setIsLoading(false); // Loading khatam
    }
  }, [fetchUserLocation]);

  // Real-time updates ke liye useEffect
  useEffect(() => {
    setIsClient(true);
    
    fetchInitialData();

    fetch('/api/socket').then(() => {
        const socket = io(undefined, {
            path: '/socket.io',
            transports: ['websocket'],
        });
        socket.on('connect', () => console.log('Socket connected successfully!'));
        socket.on('serviceUpdate', () => {
          console.log('Update received, refetching data...');
          toast('Content has been updated!', { icon: '🔄', duration: 2000 });
          fetchInitialData();
        });
        socket.on('connect_error', (err) => console.error('Socket connection error:', err));
        return () => socket.disconnect();
    });

  }, [fetchInitialData]);

  // Services ko filter karne ka logic
  const filterServices = useCallback(() => {
    if (!activeTab) return;
    const visibleServices = services.filter(service => !service.isHidden);
    let tempFiltered = [];
    const lowerCaseActiveTab = activeTab.toLowerCase();
    if (lowerCaseActiveTab === 'offers') {
      tempFiltered = visibleServices.filter(service => service.title.toLowerCase().includes('offer'));
    } else {
      tempFiltered = visibleServices.filter(service => (service.category || '').toLowerCase() === lowerCaseActiveTab);
    }
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFiltered = tempFiltered.filter(service =>
        service.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        service.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        (service.serviceId && service.serviceId.toLowerCase().includes(lowerCaseSearchTerm)) // ID se search
      );
    }
    setFilteredServices(tempFiltered);
  }, [services, activeTab, searchTerm]);

  useEffect(() => {
    if (services.length > 0) {
      filterServices();
    }
  }, [services, activeTab, searchTerm, filterServices]);

  // Price conversion ka logic
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

  const handleIdClick = (id) => {
    navigator.clipboard.writeText(id).then(() => {
        toast.success(`ID "${id}" copied to clipboard!`);
    }).catch(err => {
        toast.error('Failed to copy ID.');
        console.error('Could not copy text: ', err);
    });
  };

  if (!isClient || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Image src="/Loader.gif" alt="loading" width={140} height={140} unoptimized />
      </div>
    );
  }

  return (
    <section className="mb-10">
      <AnimatedSection>
        <h1 className="font-bold text-4xl text-center py-5">Our Services</h1>
        <StatsCards isAdmin={false} statsData={stats} />
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
              placeholder="Search services by name, description, or ID..."
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
              {service.serviceId && (
                <span 
                  onClick={() => handleIdClick(service.serviceId)}
                  className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full z-10 cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  ID: {service.serviceId}
                </span>
              )}
              <div className="relative h-40 w-full mb-3">
                {service.imageUrl && (service.imageUrl.endsWith('.mp4') || service.imageUrl.endsWith('.webm')) ? (
                  <video
                    ref={el => videoRefs.current[service._id] = el}
                    src={service.imageUrl}
                    loop
                    muted
                    playsInline
                    className="object-contain h-full w-full"
                    onMouseEnter={() => videoRefs.current[service._id]?.play()}
                    onMouseLeave={() => {
                      if (videoRefs.current[service._id]) {
                        videoRefs.current[service._id].pause();
                        videoRefs.current[service._id].currentTime = 0;
                      }
                    }}
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <Image
                    src={service.imageUrl || '/placeholder.png'}
                    alt={service.title}
                    width={200}
                    height={160}
                    className="object-contain h-full w-full"
                    loading="lazy"
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