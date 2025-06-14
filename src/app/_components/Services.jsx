// src/app/_components/Services.jsx
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import StatsCards from "../_components/StatCards";
import CurrencySelector from "../_components/CurrencySelector";
import AnimatedSection from "../_components/AnimatedSection";
import NotificationPopup from '../_components/Alertmesage.jsx';

const Services = () => { // Renamed from Sharry326 to Services to avoid confusion with admin page
  // Services state
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [activeTab, setActiveTab] = useState("Tiktok");
  const [isLoading, setIsLoading] = useState(true);

  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState("PKR");
  const [conversionRates, setConversionRates] = useState({ PKR: 1 });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch services
        const servicesResponse = await fetch("/api/services");
        if (!servicesResponse.ok) throw new Error(`HTTP error! status: ${servicesResponse.status}`);
        const servicesData = await servicesResponse.json();
        setServices(servicesData);
        filterServices("Tiktok", servicesData); // Initial filter

        // Fetch currencies
        const currenciesResponse = await fetch("/api/currencies");
        if (currenciesResponse.ok) {
          const currenciesData = await currenciesResponse.json();
          const rates = currenciesData.reduce((acc, curr) => {
            acc[curr.code] = curr.rate;
            return acc;
          }, {});
          setConversionRates(rates);
          if (currenciesData.length > 0) {
            setSelectedCurrency(currenciesData[0].code);
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Filter services by category
  const filterServices = (category, allServices = services) => {
    let filtered;
    if (category.toLowerCase() === "offers") {
      filtered = allServices.filter((service) =>
        service.title.toLowerCase().includes("offer")
      );
    } else {
      filtered = allServices.filter((service) => {
        const title = service.title.toLowerCase();
        // Check if service.category matches, or if title includes category and is not an offer
        return service.category === category || (title.includes(category.toLowerCase()) && !title.includes("offer"));
      });
    }
    setFilteredServices(filtered);
  };

  // Tab management functions
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    filterServices(tab);
  };

  // Currency conversion functions
  const convertPrice = (price) => {
    const rate = conversionRates[selectedCurrency] || 1;
    let converted = price * rate;

    // Check if it's a whole number after conversion
    if (converted % 1 === 0) {
      return converted.toFixed(0); // No decimal places if it's a whole number
    } else {
      return converted.toFixed(2); // Two decimal places if it has fractional part
    }
  };

  const convertQuantityString = (quantityString) => {
    if (!quantityString) return "";

    // Regex to find numbers specifically followed by "PKR"
    // This will only match "NUMBER PKR" patterns for conversion
    const regex = /(\d{1,3}(?:,\d{3})*)\s*PKR/g;

    return quantityString.replace(regex, (match, p1) => {
      const numericValue = parseFloat(p1.replace(/,/g, ""));
      if (isNaN(numericValue)) return match; // If it's not a number, return original match

      const convertedValue = convertPrice(numericValue); // Converts PKR value to selected currency
      return `${convertedValue} ${selectedCurrency}`;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Image
          src="./Loader.gif"
          alt="loading"
          width={140}
          height={140}
          unoptimized
          className="block mx-auto max-w-full"
        />
      </div>
    );
  }

  return (
    <section className="mb-10">
      <AnimatedSection>
        <h1 className="font-bold text-4xl text-center py-5">Our Services</h1>
        <StatsCards />
      </AnimatedSection>

      <h2 className="text-center my-7 sticky top-0 z-40">
        <span className="bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-white shadow-lg rounded-lg py-2 px-2 sm:py-4 sm:px-4 mx-4 sm:mx-7 font-semibold text-xs sm:text-sm">
          Check Service Description? Just Click the Icon!
        </span>
      </h2>

      <CurrencySelector
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        conversionRates={conversionRates} // Prop added
        setConversionRates={setConversionRates} // Prop added
      />

      <AnimatedSection>
        <div className="rounded-lg p-6 mb-6 bg-white w-full max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              "Tiktok",
              "Youtube",
              "Facebook",
              "Instagram",
              "X-Twitter",
              "Whatsapp",
              "Website Development",
              "Graphics Designing",
              "Offers",
            ].map((tab) => (
              <button
                key={tab}
                className={`btn btn-md px-5 font-semibold py-2 text-md ${
                  activeTab === tab
                    ? 'bg-blue-700 text-white shadow-lg hover:bg-blue-700'
                    : 'bg-white text-black hover:bg-gray-200 border border-gray-300'
                } capitalize rounded-lg`}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {filteredServices.map((service) => {
          // Ensure service.price is a number before passing to Number()
          const dynamicDescription = service.description.replace(/{{price}}/g, `${convertPrice(Number(service.price || 0))} ${selectedCurrency}`);

          return (
            <AnimatedSection key={service.id}>
              <div className="group relative hover:scale-105 transition-all border border-gray-300 rounded-lg p-3 max-w-xs mx-auto cursor-pointer">
                {service.imageUrl && (
                  <Image
                    src={service.imageUrl}
                    alt={service.title}
                    width={140}
                    height={140}
                    unoptimized // Use unoptimized for GIFs or if Next.js Image optimization causes issues
                    className="block mx-auto max-w-full"
                  />
                )}
                <h2 className="font-bold text-xl mt-2 text-center">{service.title}</h2>
                <p className="text-center text-sm text-gray-600">
                  Price: {convertPrice(service.price || 0)} {selectedCurrency} =
                  {convertQuantityString(service.quantity)
                    .split("\n")
                    .map((line, index) => (
                      <React.Fragment key={index}> {line}<br /></React.Fragment>
                    ))}
                </p>
                <div className="absolute bottom-0 left-0 w-full p-3 bg-white opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 transform translate-y-4 max-h-40 overflow-y-auto whitespace-pre-wrap text-xs sm:text-sm">
                  {dynamicDescription.split("\n").map((line, index) => (
                    <React.Fragment key={index}>{line}<br /></React.Fragment>
                  ))}
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