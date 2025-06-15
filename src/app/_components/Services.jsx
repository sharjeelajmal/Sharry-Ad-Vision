// Services .jsx
"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import StatsCards from "../_components/StatCards";
import CurrencySelector from "../_components/CurrencySelector";
import AnimatedSection from "../_components/AnimatedSection";
// import NotificationPopup from "../_components/Alertmesage.jsx"; // Removed import, as it's rendered in layout.js
import { toast } from "react-hot-toast";

const Services = () => {
  const [isClient, setIsClient] = useState(false);

  // Services state
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [activeTab, setActiveTab] = useState("Tiktok");
  const [isLoading, setIsLoading] = useState(true);

  // Tabs state
  const [tabs, setTabs] = useState([]);

  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState("PKR");
  const [conversionRates, setConversionRates] = useState({ PKR: 1 });

  // --- Functions that need to be defined before useEffect ---

  // filterServices function
  const filterServices = useCallback((category, allServicesList) => {
    let filtered;
    if (category.toLowerCase() === "offers") {
      filtered = allServicesList.filter((service) =>
        service.title.toLowerCase().includes("offer")
      );
    } else {
      filtered = allServicesList.filter((service) => {
        const title = service.title.toLowerCase();
        const serviceCategory = service.category ? service.category.toLowerCase() : '';
        return (
          serviceCategory === category.toLowerCase() ||
          (title.includes(category.toLowerCase()) && !title.includes("offer"))
        );
      });
    }
    setFilteredServices(filtered);
    setActiveTab(category);
  }, []);

  // Currency conversion functions
  const convertPrice = useCallback((price) => {
    const rate = conversionRates[selectedCurrency] || 1;
    let converted = price * rate;

    if (converted % 1 === 0) {
      return converted.toFixed(0);
    } else {
      return converted.toFixed(2);
    }
  }, [conversionRates, selectedCurrency]);

  const convertQuantityString = useCallback((quantityString) => {
    if (!quantityString) return "";

    const regex = /(\d{1,3}(?:,\d{3})*)\s*PKR/g;

    return quantityString.replace(regex, (match, p1) => {
      const numericValue = parseFloat(p1.replace(/,/g, ""));
      if (isNaN(numericValue)) return match;

      const convertedValue = convertPrice(numericValue);
      return `${convertedValue} ${selectedCurrency}`;
    });
  }, [convertPrice, selectedCurrency]);

  // --- useEffect for initial data fetching ---
  useEffect(() => {
    setIsClient(true);
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);

        const [servicesResponse, tabsResponse, currenciesResponse] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/tabs"),
          fetch("/api/currencies"),
        ]);

        // Services
        if (!servicesResponse.ok) {
          const errorData = await servicesResponse.json();
          throw new Error(`HTTP error! status: ${servicesResponse.status} for services: ${errorData.details || servicesResponse.statusText}`);
        }
        const servicesData = await servicesResponse.json();
        setServices(servicesData);

        // Tabs
        if (!tabsResponse.ok) {
          const errorData = await tabsResponse.json();
          throw new Error(`HTTP error! status: ${tabsResponse.status} for tabs: ${errorData.details || tabsResponse.statusText}`);
        }
        const tabsData = await tabsResponse.json();
        if (tabsData.length > 0) {
          setTabs(tabsData);
          const initialActiveTab = tabsData[0] || "Tiktok";
          filterServices(initialActiveTab, servicesData);
        } else {
          const defaultTabs = ["Tiktok", "Youtube", "Facebook", "Instagram", "X-Twitter", "Whatsapp", "Website Development", "Graphics Designing", "Offers"];
          setTabs(defaultTabs);
          filterServices("Tiktok", servicesData);
        }

        // Currencies
        if (!currenciesResponse.ok) {
          const errorData = await currenciesResponse.json();
          throw new Error(`HTTP error! status: ${currenciesResponse.status} for currencies: ${errorData.details || currenciesResponse.statusText}`);
        }
        const currenciesData = await currenciesResponse.json();
        const rates = currenciesData.reduce((acc, curr) => {
          acc[curr.code] = curr.rate;
          return acc;
        }, {});
        setConversionRates(rates);
        if (currenciesData.length > 0) {
          setSelectedCurrency(currenciesData[0].code);
        } else {
          const defaultCurrencies = [{code: "PKR", name: "Pakistani Rupee", symbol: "₨", rate: 1}];
          setConversionRates({"PKR": 1});
          setSelectedCurrency("PKR");
        }

      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error(`Failed to load initial data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [filterServices]); // Dependency on filterServices for memoization

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img
          src="/Loader.gif"
          alt="loading"
          width={140}
          height={140}
          className="block mx-auto max-w-full"
        />
      </div>
    );
  }

  // --- Tab management function (read-only) ---
  const handleTabClick = (tab) => {
    filterServices(tab, services);
  };

  return (
    <section className="mb-10">
      {/* Removed this div containing NotificationPopup:
      <div className="my-8 p-4 border rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Popup Messages</h2>
        <NotificationPopup isAdmin={false} />
      </div>
      */}

      <AnimatedSection>
        <h1 className="font-bold text-4xl text-center py-5">Our Services</h1>
        {/* StatsCards will now always be in non-editing mode for this page */}
        <StatsCards isAdmin={false} />
      </AnimatedSection>

      <h2 className="text-center my-7 sticky top-0 z-40">
        <span className="bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-white shadow-lg rounded-lg py-2 px-2 sm:py-4 sm:px-4 mx-4 sm:mx-7 font-semibold text-xs sm:text-sm">
          Check Service Description? Just Click the Icon!
        </span>
      </h2>

      {/* CurrencySelector will now always be in non-editing mode for this page */}
      <CurrencySelector
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        conversionRates={conversionRates}
        setConversionRates={setConversionRates}
        isAdmin={false}
      />
      <AnimatedSection>
        <div className="rounded-lg p-6 mb-6 bg-white w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            {/* Removed Edit Categories button and editing UI */}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`btn btn-md px-5 font-semibold py-2 text-md ${
                  activeTab === tab
                    ? "bg-blue-700 text-white shadow-lg hover:bg-blue-700"
                    : "bg-white text-black hover:bg-gray-200 border border-gray-300"
                } capitalize rounded-lg`}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Removed Add Service button */}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {filteredServices.map((service) => {
          const dynamicDescription = service.description.replace(
            /{{price}}/g,
            `${convertPrice(Number(service.price || 0))} ${selectedCurrency}`
          );

          return (
            <AnimatedSection key={service._id}>
              <div className="group relative hover:scale-105 transition-all border border-gray-300 rounded-lg p-3 max-w-xs mx-auto cursor-pointer">
                {service.imageUrl && (
                  <div className="relative h-40 w-full mb-3">
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      className="object-contain h-full w-full"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.png";
                        e.target.className =
                          "object-contain h-full w-full opacity-50";
                      }}
                    />
                  </div>
                )}
                <h2 className="font-bold text-xl mt-2 text-center">
                  {service.title}
                </h2>
                <p className="text-center text-sm text-gray-600">
                  Price: {convertPrice(service.price || 0)} {selectedCurrency}
                  {service.quantity && (
                    <>
                      <br />
                      {convertQuantityString(service.quantity)
                        .split("\n")
                        .map((line, index) => (
                          <React.Fragment key={index}>
                            {line}
                            <br />
                          </React.Fragment>
                        ))}
                    </>
                  )}
                </p>
                <div className="absolute bottom-0 left-0 w-full p-3 bg-white opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 transform translate-y-4 max-h-40 overflow-y-auto whitespace-pre-wrap text-xs sm:text-sm">
                  {dynamicDescription.split("\n").map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </div>
              </div>
              {/* Removed Edit and Delete buttons for each service */}
            </AnimatedSection>
          );
        })}
      </div>

      {/* Removed Service Edit/Create Modal */}
    </section>
  );
};

export default Services;