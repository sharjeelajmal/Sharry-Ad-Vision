"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import StatsCards from "./StatCards";
import CurrencySelector from "./CurrencySelector";
import AnimatedSection from "./AnimatedSection";

const Services = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [activeTab, setActiveTab] = useState("Tiktok");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState("PKR");

  const conversionRates = {
    PKR: 1,
    USD: 0.0036,
    INR: 0.3,
  };

  const tabs = [
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

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        const response = await fetch("/api/api");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setServices(data);
        filterServices("Tiktok", data);
      } catch (error) {
        console.error("Error fetching services data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServicesData();
  }, []);

  const filterServices = (category, allServices = services) => {
    let filtered;

    if (category.toLowerCase() === "offers") {
      // Sirf wo services jinka title mein "offer" ho
      filtered = allServices.filter((service) =>
        service.title.toLowerCase().includes("offer")
      );
    } else {
      // Baaki categories: wo services jin ka title mein category ka naam ho magar title mein "offer" na ho
      filtered = allServices.filter((service) => {
        const title = service.title.toLowerCase();
        return (
          title.includes(category.toLowerCase()) && !title.includes("offer")
        );
      });
    }

    setFilteredServices(filtered);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    filterServices(tab);
  };

  const convertPrice = (price) => {
    const rate = conversionRates[selectedCurrency] || 1;
    const converted = price * rate;
    return converted % 1 === 0
      ? converted.toFixed(0)
      : converted.toFixed(2).replace(/0$/, "");
  };

  // Function to convert PKR prices in quantity string
  const convertQuantityString = (quantityString) => {
    return quantityString.replace(
      /(\d{1,3}(?:,\d{3})*|\d+)\s*PKR/g,
      (match, p1) => {
        const numericValue = Number(p1.replace(/,/g, ""));
        const converted = convertPrice(numericValue);
        return `${converted} ${selectedCurrency}`;
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Image
          src="/Loader.gif"
          alt="Loading..."
          width={100}
          height={100}
          unoptimized
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
        <span
          className="bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-white shadow-lg rounded-lg 
            py-2 px-2 sm:py-4 sm:px-4 
            mx-4 sm:mx-7 
            font-semibold text-xs sm:text-sm"
        >
          Check Service Description? Just Click the Icon!
        </span>
      </h2>

      <CurrencySelector
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
      />
      <AnimatedSection>
        <div className="flex justify-center space-x-4 py-6 flex-wrap">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => handleTabClick(tab)}
              className="capitalize mb-2"
            >
              {tab}
            </Button>
          ))}
        </div>
      </AnimatedSection>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {filteredServices.map((service) => {
          // Replace {{price}} placeholder dynamically in description
          const dynamicDescription = service.description.replace(
            /{{price}}/g,
            `${convertPrice(Number(service.price))} ${selectedCurrency}`
          );

          return (
            <AnimatedSection key={service.id}>
              <div
                className="group relative hover:scale-105 transition-all border border-gray-300 rounded-lg p-3 max-w-xs mx-auto cursor-pointer"
                style={{ textAlign: "left", margin: "8px" }}
              >
                {service.imageUrl && (
                  <Image
                    src={service.imageUrl}
                    alt={service.title}
                    width={140}
                    height={140}
                    unoptimized
                    style={{
                      display: "block",
                      margin: "0 auto",
                      maxWidth: "100%",
                    }}
                  />
                )}
                <h2 className="font-bold text-xl mt-2 text-center">
                  {service.title}
                </h2>
                <p className="text-center text-sm text-gray-600">
                  Price: {convertPrice(service.price || 0)} {selectedCurrency} =
                  {convertQuantityString(service.quantity)
                    .split("\n")
                    .map((line, index) => (
                      <React.Fragment key={index}>
                        {" "}
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
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
            </AnimatedSection>
          );
        })}
      </div>
    </section>
  );
};

export default Services;
