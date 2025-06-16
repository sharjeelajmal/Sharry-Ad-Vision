"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import StatsCards from "../_components/StatCards";
import CurrencySelector from "../_components/CurrencySelector";
import AnimatedSection from "../_components/AnimatedSection";
import { toast } from "react-hot-toast";

// Define a mapping of country codes to preferred default currencies.
// This should be comprehensive for the regions you serve.
const countryCurrencyMap = {
  PK: "PKR", // Pakistan
  US: "USD", // United States
  IN: "INR", // India
  AE: "AED", // United Arab Emirates
  GB: "GBP", // United Kingdom
  DE: "EUR", // Germany (example for Eurozone)
  FR: "EUR", // France
  // Add more as needed:
  // JP: "JPY", // Japan
  // AU: "AUD", // Australia
  // CA: "CAD", // Canada
  // SA: "SAR", // Saudi Arabia
  // QA: "QAR", // Qatar
};

const Services = () => {
  const [isClient, setIsClient] = useState(false);

  // Services state
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [activeTab, setActiveTab] = useState("Tiktok");
  const [isLoading, setIsLoading] = useState(true);

  // Tabs state (read-only in this component)
  const [tabs, setTabs] = useState([]);

  // Currency state
  // Set initial selectedCurrency to null/empty string so it gets determined by location/first-added on load
  const [selectedCurrency, setSelectedCurrency] = useState("");
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
        const serviceCategory = service.category
          ? service.category.toLowerCase()
          : "";
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
  const convertPrice = useCallback(
    (price) => {
      const rate = conversionRates[selectedCurrency] || 1;
      let converted = price * rate;

      if (converted % 1 === 0) {
        return converted.toFixed(0);
      } else {
        return converted.toFixed(2);
      }
    },
    [conversionRates, selectedCurrency]
  );

  const convertQuantityString = useCallback(
    (quantityString) => {
      if (!quantityString) return "";

      const regex = /(\d{1,3}(?:,\d{3})*)\s*PKR/g;

      return quantityString.replace(regex, (match, p1) => {
        const numericValue = parseFloat(p1.replace(/,/g, ""));
        if (isNaN(numericValue)) return match;

        const convertedValue = convertPrice(numericValue);
        return `${convertedValue} ${selectedCurrency}`;
      });
    },
    [convertPrice, selectedCurrency]
  );

  // --- Helper function to fetch user location ---
  const fetchUserLocation = useCallback(async () => {
    try {
      // For production, consider using a server-side endpoint to fetch location
      // to avoid rate limits on public APIs and potential CORS issues.
      const geoResponse = await fetch("http://ip-api.com/json/");
      if (!geoResponse.ok) {
        console.error("Geolocation API response not OK:", geoResponse.status);
        throw new Error("Failed to fetch location from ip-api.com");
      }
      const geoData = await geoResponse.json();
      if (geoData && geoData.countryCode) {
        return geoData.countryCode;
      } else {
        console.warn("Geolocation data missing countryCode.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user location:", error);
      toast.error("Failed to determine your location.");
      return null;
    }
  }, []); // No dependencies, as it only fetches external data

  // --- useEffect for initial data fetching ---
  useEffect(() => {
    setIsClient(true);
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);

        const [servicesResponse, tabsResponse, currenciesResponse] =
          await Promise.all([
            fetch("/api/services"),
            fetch("/api/tabs"),
            fetch("/api/currencies"),
          ]);

        // Services
        if (!servicesResponse.ok) {
          const errorData = await servicesResponse.json();
          throw new Error(
            `HTTP error! status: ${servicesResponse.status} for services: ${
              errorData.details || servicesResponse.statusText
            }`
          );
        }
        const servicesData = await servicesResponse.json();
        setServices(servicesData);

        // Tabs
        if (!tabsResponse.ok) {
          const errorData = await tabsResponse.json();
          throw new Error(
            `HTTP error! status: ${tabsResponse.status} for tabs: ${
              errorData.details || tabsResponse.statusText
            }`
          );
        }
        const tabsData = await tabsResponse.json();
        let initialActiveTab;
        if (tabsData.length > 0) {
          setTabs(tabsData);
          initialActiveTab = tabsData[0];
        } else {
          // Default tabs if none are fetched from DB
          const defaultTabs = [
            "Tiktok",
            "Youtube",
            "Facebook",
            "Instagram",
            "X-Twitter",
            "Whatsapp",
            "Website Development",
            "Graphics Designing",
            "Offers",
          ];
          setTabs(defaultTabs);
          initialActiveTab = "Tiktok";
        }
        filterServices(initialActiveTab, servicesData); // Filter services after fetching both

        // Currencies
        if (!currenciesResponse.ok) {
          const errorData = await currenciesResponse.json();
          throw new Error(
            `HTTP error! status: ${currenciesResponse.status} for currencies: ${
              errorData.details || currenciesResponse.statusText
            }`
          );
        }
        const currenciesData = await currenciesResponse.json();

        // Sort currencies by 'createdAt' to ensure oldest is first
        // Ensure your backend provides a 'createdAt' timestamp!
        const orderedCurrencies = currenciesData.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0); // Use 0 if createdAt is missing
          const dateB = new Date(b.createdAt || 0);
          return dateA.getTime() - dateB.getTime(); // Ascending order (oldest first)
        });

        const rates = orderedCurrencies.reduce((acc, curr) => {
          acc[curr.code] = curr.rate;
          return acc;
        }, {});
        setConversionRates(rates);

        // --- Location-based currency determination logic ---
        const userCountryCode = await fetchUserLocation(); // Await location
        let determinedCurrency = "PKR"; // Default fallback if all else fails

        if (orderedCurrencies.length > 0) {
          if (userCountryCode && countryCurrencyMap[userCountryCode]) {
            const preferredCurrencyCode = countryCurrencyMap[userCountryCode];
            // Check if the preferred currency is actually in our fetched list
            if (orderedCurrencies.some((c) => c.code === preferredCurrencyCode)) {
              determinedCurrency = preferredCurrencyCode;
            } else {
              // Preferred currency not available, fallback to the oldest one
              determinedCurrency = orderedCurrencies[0].code;
            }
          } else {
            // No country code or no map entry, fallback to the oldest one
            determinedCurrency = orderedCurrencies[0].code;
          }
        }
        // If orderedCurrencies is empty, determinedCurrency remains "PKR" (initial default)

        setSelectedCurrency(determinedCurrency); // Set the determined currency
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error(`Failed to load initial data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [filterServices, fetchUserLocation]); // Add fetchUserLocation to dependencies

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img
          src="/Loader.gif" // Assuming Loader.gif is the correct path for this page
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
      {/* Removed NotificationPopup section as per your comment */}

      <AnimatedSection>
        <h1 className="font-bold text-4xl text-center py-5">Our Services</h1>
        {/* StatsCards will always be in non-editing mode for this public page */}
        <StatsCards isAdmin={false} />
      </AnimatedSection>

      <h2 className="text-center my-7 sticky top-0 z-40">
        <span className="bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-white shadow-lg rounded-lg py-2 px-2 sm:py-4 sm:px-4 mx-4 sm:mx-7 font-semibold text-xs sm:text-sm">
          Check Service Description? Just Click the Icon!
        </span>
      </h2>

      {/* CurrencySelector will always be in non-editing mode for this public page */}
      <CurrencySelector
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        conversionRates={conversionRates}
        setConversionRates={setConversionRates}
        isAdmin={false} // This page is not for admin, so isAdmin is false
        // isEditing and setIsEditing props are removed as isAdmin is false
      />
      <AnimatedSection>
        <div className="rounded-lg p-6 mb-6 bg-white w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            {/* Removed Edit Categories button and editing UI as this is a public page */}
            <h2 className="text-xl font-semibold">Service Categories</h2>
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

      {/* Removed Add Service button as this is a public page */}

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
              {/* Removed Edit and Delete buttons for each service as this is a public page */}
            </AnimatedSection>
          );
        })}
      </div>

      {/* Removed Service Edit/Create Modal as this is a public page */}
    </section>
  );
};

export default Services;