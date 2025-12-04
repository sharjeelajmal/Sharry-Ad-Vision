"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import StatsCards from "../_components/StatCards";
import CurrencySelector from "../_components/CurrencySelector";
import AnimatedSection from "../_components/AnimatedSection";
import PremiumLoader from "./PremiumLoader"; 
import { toast } from "react-hot-toast";
import { Search, Info, LayoutGrid, Hash, X, CheckCircle2 } from "lucide-react";
import { gsap } from "gsap";
import Pusher from 'pusher-js';
import DigitalAgencyLoader from "./DigitalAgencyLoader";
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [stats, setStats] = useState([]);
  
  const videoRefs = useRef({});
  const playTimers = useRef({}); 
  const searchInputRef = useRef(null);
  const tabsRef = useRef(null);
  const searchContainerRef = useRef(null);
  
  const pkrRegex = /(\d{1,3}(?:,?\d{3})*|\d+)\s*PKR/gi;
const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Jab 10px se zyada scroll ho, tab state true hogi
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      gsap.fromTo(searchContainerRef.current, 
        { height: 0, opacity: 0, marginTop: 0 },
        { height: "auto", opacity: 1, marginTop: 16, duration: 0.4, ease: "power2.out" }
      );
    } else {
      setSearchTerm('');
      gsap.to(searchContainerRef.current, {
        height: 0, opacity: 0, marginTop: 0, duration: 0.3, ease: "power2.in"
      });
    }
  };

  const handleMouseEnter = (id) => {
    if (window.innerWidth < 768) return; 

    if (playTimers.current[id]) clearTimeout(playTimers.current[id]);
    playTimers.current[id] = setTimeout(() => {
      if (videoRefs.current[id]) {
        const playPromise = videoRefs.current[id].play();
        if (playPromise !== undefined) {
          playPromise.catch(error => console.log("Autoplay prevented"));
        }
      }
    }, 600);
  };

  const handleMouseLeave = (id) => {
    if (playTimers.current[id]) clearTimeout(playTimers.current[id]);
    if (videoRefs.current[id]) {
      videoRefs.current[id].pause();
      videoRefs.current[id].currentTime = 0;
    }
  };

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
      return 'PK';
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/initial-data');
      if (!response.ok) throw new Error("Data could not be loaded.");
      
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
      toast.error("Refresh Plzz! Data could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserLocation]);

  useEffect(() => {
    setIsClient(true);
    fetchInitialData();
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER });
    const channel = pusher.subscribe('updates-channel');
    channel.bind('service-update', function(data) {
      toast('Content has been updated!', { icon: '🔄', duration: 2000 });
      fetchInitialData();
    });
    return () => {
      pusher.unsubscribe('updates-channel');
      pusher.disconnect();
    };
  }, [fetchInitialData]);

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
        (service.serviceId && service.serviceId.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    setFilteredServices(tempFiltered);
  }, [services, activeTab, searchTerm]);

  useEffect(() => {
    if (services.length > 0) filterServices();
  }, [services, activeTab, searchTerm, filterServices]);

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
    navigator.clipboard.writeText(id).then(() => toast.success(`ID "${id}" copied!`));
  };


  return (
    <section id="services-section" className="mb-20 bg-slate-50/50 min-h-screen">
      
    {/* 1. STATS SECTION */}
<AnimatedSection>
  <div className="pt-10 pb-6">
      {/* ORIGINAL PREMIUM HEADING STYLE RESTORED */}
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-8 text-slate-900 tracking-tight">
          Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">Impact</span>
      </h1>
      
      {/* Stats Cards Component */}
      <StatsCards isAdmin={false} statsData={stats} />
  </div>
</AnimatedSection>

   <div 
        className={`sticky top-0 z-50 py-3 transition-all duration-300 ${
          isScrolled 
            ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/60 " // Scroll hone ke baad
            : " shadow-none border-none" // Start ma clean
        }`}
      >
        <div className="container mx-auto px-4 flex flex-row items-center justify-between gap-2 sm:gap-4">
            
            {/* Info Pill */}
            <div className="relative group cursor-default flex-shrink min-w-0">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-blue-600 rounded-full blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative flex items-center justify-center gap-2 px-3 py-2 sm:px-5 bg-white rounded-full border border-slate-100 shadow-sm w-full">
                    <Info size={16} className="text-blue-600 animate-pulse flex-shrink-0" />
                    <span className="text-[10px] sm:text-sm font-bold text-slate-600 truncate">
                        Tap/Hover cards!
                    </span>
                </div>
            </div>

            {/* Currency Selector */}
            {selectedCurrency && (
                <div className="flex-shrink-0 scale-90 sm:scale-100 relative z-[60]">
                    <CurrencySelector selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} conversionRates={conversionRates} setConversionRates={setConversionRates} isAdmin={false} />
                </div>
            )}
        </div>
      </div>

      <AnimatedSection>
        <div className="max-w-7xl mx-auto px-4 mt-8">
          
          {/* 3. HEADING + SEARCH ICON */}
          <div className="flex flex-col items-center mb-10">
             <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
                    <LayoutGrid className="text-blue-500" />
                    Service Categories
                </h2>
                <button 
                    onClick={toggleSearch}
                    className={`p-3 rounded-full transition-all duration-300 shadow-md border border-slate-100
                        ${isSearchOpen ? 'bg-slate-900 text-white rotate-90' : 'bg-white text-slate-500 hover:text-blue-600 hover:scale-110'}`}
                >
                    {isSearchOpen ? <X size={20} /> : <Search size={20} />}
                </button>
             </div>

             <div ref={searchContainerRef} className="w-full max-w-md h-0 opacity-0">
                <div className="relative bg-white rounded-full shadow-xl border border-blue-100 flex items-center px-4 py-3">
                    <Search className="text-blue-500 w-5 h-5 mr-3" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search services..."
                        className="w-full bg-transparent outline-none text-slate-700 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
             </div>
          </div>

          {/* 4. PREMIUM TABS */}
          <div className="mb-12 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <div ref={tabsRef} className="flex sm:flex-wrap gap-2 sm:gap-3 sm:justify-center min-w-max sm:min-w-0">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border flex items-center gap-2 whitespace-nowrap
                                ${isActive 
                                    ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/30 scale-105" 
                                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-700 hover:shadow-md"
                                }`}
                        >
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>}
                            {tab}
                        </button>
                    )
                })}
            </div>
          </div>

          {/* 5. SERVICES GRID */}
       {isLoading ? (
             // Loading ke waqt sirf ye hissa dikhega
             <div className="w-full h-96 flex items-center justify-center">
                <DigitalAgencyLoader />
             </div>
          ) : (
             // Data aane ke baad Grid dikhega
             <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {filteredServices.map((service) => (
                   <AnimatedSection key={service._id}>
                {/* --- CARD CONTAINER --- */}
                <div 
                  className="group relative h-[300px] sm:h-[360px] w-full bg-white rounded-[1.5rem] sm:rounded-[2rem] p-3 shadow-[0_5px_20px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_60px_-15px_rgba(30,58,138,0.2)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border border-slate-100 hover:border-blue-100 overflow-hidden cursor-pointer z-0"
                  onMouseEnter={() => handleMouseEnter(service._id)}
                  onMouseLeave={() => handleMouseLeave(service._id)}
                >
                  
                  {/* Service ID (Below Header) */}
                  {service.serviceId && (
                    <div 
                      onClick={(e) => { e.stopPropagation(); handleIdClick(service.serviceId); }}
                      className="absolute top-3 left-3 z-30 bg-white/90 backdrop-blur-md border border-slate-200 text-slate-500 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg cursor-copy hover:bg-slate-900 hover:text-white transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Hash size={10} /> {service.serviceId}
                    </div>
                  )}

                  {/* --- HEADER: Title, Price & Quantity (RESTORED) --- */}
                  <div className="absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-20
                      bottom-2 left-0 right-0 px-2 text-center
                      /* Hover State */
                      group-hover:bottom-auto md:group-hover:top-10 group-hover:top-12 
                      group-hover:left-0 group-hover:right-0 group-hover:text-left group-hover:px-3
                      group-hover:bg-white/95 group-hover:backdrop-blur-xl group-hover:py-2 group-hover:rounded-xl
                  ">
                      <div className="flex flex-col w-full items-center group-hover:items-start group-hover:pr-16 md:group-hover:pr-24">
                          {/* Title */}
                          <h3 className="font-bold text-xs sm:text-lg text-slate-900 line-clamp-2 group-hover:line-clamp-2 group-hover:text-[10px] sm:group-hover:text-sm group-hover:text-blue-700 transition-colors mb-1 sm:mb-2">
                            {service.title}
                          </h3>
                          
                          {/* Price */}
                          <div className="inline-flex items-center justify-center gap-2 group-hover:justify-start">
                              <div className="px-2 py-1 sm:px-3 sm:py-1 bg-slate-900 text-white rounded-full shadow-lg shadow-slate-900/20 text-[9px] sm:text-sm font-bold tracking-wide group-hover:bg-blue-600 group-hover:shadow-blue-200">
                                {convertPrice(service.price || 0)} <span className="text-amber-400 ml-1">{selectedCurrency}</span>
                              </div>
                          </div>

                          {/* Quantity - ADDED BACK */}
                          {service.quantity && (
                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 group-hover:text-slate-800 transition-colors">
                                {convertQuantityString(service.quantity)}
                            </p>
                          )}
                      </div>
                  </div>

                  {/* --- MEDIA --- */}
                  <div className="absolute transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-30 overflow-hidden bg-slate-50
                                  top-10 left-3 right-3 h-40 sm:h-48 rounded-2xl
                                  group-hover:left-auto group-hover:top-3 group-hover:right-3 
                                  group-hover:w-16 group-hover:h-16 sm:group-hover:w-24 sm:group-hover:h-24
                                  group-hover:rounded-xl group-hover:shadow-xl group-hover:border-2 group-hover:border-white">
                      
                      {service.imageUrl && (service.imageUrl.endsWith('.mp4') || service.imageUrl.endsWith('.webm')) ? (
                        <video
                          ref={el => videoRefs.current[service._id] = el}
                          src={service.imageUrl}
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover bg-white aspect-square"
                        />
                      ) : (
                        <Image
                          src={service.imageUrl || '/placeholder.png'}
                          alt={service.title}
                          fill
                          className="w-full h-full object-cover bg-white aspect-square"
                          loading="lazy"
                        />
                      )}
                  </div>

                  {/* --- DESCRIPTION --- */}
                  <div className="absolute transition-all duration-500 delay-100 ease-out z-0
                      opacity-0 translate-y-10 top-auto bottom-0
                      group-hover:opacity-100 group-hover:translate-y-0
                      group-hover:top-36 sm:group-hover:top-40 
                      group-hover:bottom-3 group-hover:left-3 group-hover:right-3
                  ">
                       <div className="bg-blue-50/60 backdrop-blur-sm p-2 sm:p-3 rounded-xl h-full border border-blue-100 overflow-y-auto custom-scrollbar">
                          <h4 className="flex items-center gap-1 text-[9px] font-bold text-blue-600 mb-1 uppercase tracking-widest">
                             <CheckCircle2 size={10} /> Details
                          </h4>
                          <p className="text-[9px] sm:text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                              {convertDescriptionString(service.description, service.price)}
                          </p>
                       </div>
                  </div>

                </div>
              </AnimatedSection>
            ))}
         </div>
        )}
        </div>
      </AnimatedSection>
    </section>
  );
};
export default Services;