"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import StatsCards from "./StatCards";

const Services = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loader state
  const [activeService, setActiveService] = useState(null); // State to track active service

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        const response = await fetch("/api/api"); // Correct API URL
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched services data:", data);
        setServices(data);
      } catch (error) {
        console.error("Error fetching services data:", error);
      } finally {
        setIsLoading(false); // Hide loader after fetch completes
      }
    };

    fetchServicesData();
  }, []);

  if (isLoading) {
    // Loader centered in the screen
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Image
          src="/Loader.gif" // Replace with your loader GIF path
          alt="Loading..."
          width={100}
          height={100}
          unoptimized
        />
      </div>
    );
  }

  // Function to handle card click
  const handleCardClick = (id) => {
    setActiveService(activeService === id ? null : id); // Toggle active service visibility
  };

  return (
    <section className="mb-40">
      <h1 className="font-bold text-4xl text-center py-5">Our Services</h1>
      <StatsCards />
 
      <h2 className="text-center my-7 sticky top-0  z-50"><span  className="bg-customGray py-4 px-6 m-7 text-xl " >Click On Icon To Know Rate Of Service</span></h2>


      {/* Services Grid with reduced column spacing */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => handleCardClick(service.id)} // Toggle on click
            className="group relative hover:scale-105 transition-all border border-gray-300 rounded-lg p-3 max-w-xs mx-auto cursor-pointer"
            style={{
              textAlign: "left",
              margin: "8px", // Reduced margin
            }}
          >
            {/* Image */}
            <div className="group-hover:block">
              {service.imageUrl && (
                <Image
                  src={service.imageUrl}
                  alt={service.title}
                  width={140} // Reduced image width
                  height={140} // Reduced image height
                  unoptimized
                  style={{
                    display: "block",
                    margin: "0 auto",
                    maxWidth: "100%",
                  }}
                />
              )}
            </div>

            {/* Title */}
            <h2 className="font-bold text-xl mt-2">{service.title}</h2>

            {/* Description */}
            <div
              className={`absolute bottom-0 left-0 w-full p-3 bg-white opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 transform translate-y-4 ${
                activeService === service.id ? "opacity-100 translate-y-0" : ""
              }`}
            >
              {service.description.split("\n").map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
