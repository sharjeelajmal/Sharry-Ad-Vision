"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import StatsCards from "../_components/StatCards";
import CurrencySelector from "../_components/CurrencySelector";
import AnimatedSection from "../_components/AnimatedSection";
import NotificationPopup from "../_components/Alertmesage.jsx";
import { toast } from "react-hot-toast";

const countryCurrencyMap = {
  PK: "PKR", US: "USD", IN: "INR", AE: "AED", GB: "GBP", DE: "EUR", FR: "EUR",
};

const Sharry326 = () => {
  const [isClient, setIsClient] = useState(false);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [activeTab, setActiveTab] = useState("Tiktok");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState({
    title: "", description: "", price: 0, quantity: "", imageUrl: "", category: "Tiktok",
  });
  const [tabs, setTabs] = useState([]);
  const [isEditingTabs, setIsEditingTabs] = useState(false);
  const [editTabs, setEditTabs] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [conversionRates, setConversionRates] = useState({ PKR: 1 });
  const [isEditingCurrencies, setIsEditingCurrencies] = useState(false);
  const [isEditingStats, setIsEditingStats] = useState(false);

  const filterServices = useCallback((category, allServicesList) => {
    let filtered;
    if (category.toLowerCase() === "offers") {
      filtered = allServicesList.filter((service) =>
        service.title.toLowerCase().includes("offer")
      );
    } else {
      filtered = allServicesList.filter((service) => {
        const title = service.title.toLowerCase();
        const serviceCategory = service.category ? service.category.toLowerCase() : "";
        return (
          serviceCategory === category.toLowerCase() ||
          (title.includes(category.toLowerCase()) && !title.includes("offer"))
        );
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

  // **FIX: Yeh naya Regex har qisam ke number (e.g., 4000 aur 4,000) ko sahi se pakdega**
  const pkrRegex = /(\d{1,3}(?:,?\d{3})*|\d+)\s*PKR/gi;

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

  const fetchUserLocation = useCallback(async () => {
    const cachedCountryCode = sessionStorage.getItem('userCountryCode');
    if (cachedCountryCode) return cachedCountryCode;
    try {
      const geoResponse = await fetch("/api/get-user-location");
      if (!geoResponse.ok) return null;
      const geoData = await geoResponse.json();
      if (geoData && geoData.countryCode) {
        sessionStorage.setItem('userCountryCode', geoData.countryCode);
        return geoData.countryCode;
      }
      return null;
    } catch (error) {
      return null;
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    const fetchAllInitialData = async () => {
      setIsLoading(true);
      try {
        const [servicesResponse, tabsResponse, currenciesResponse] = await Promise.all([
          fetch("/api/services"), fetch("/api/tabs"), fetch("/api/currencies"),
        ]);
        const fetchedServicesData = await servicesResponse.json();
        setServices(fetchedServicesData);
        const fetchedTabsData = await tabsResponse.json();
        setTabs(fetchedTabsData);
        setEditTabs([...fetchedTabsData]);
        const initialActiveTab = fetchedTabsData.length > 0 ? fetchedTabsData[0] : "Tiktok";
        filterServices(initialActiveTab, fetchedServicesData);
        const fetchedCurrenciesData = await currenciesResponse.json();
        const orderedCurrencies = fetchedCurrenciesData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const rates = orderedCurrencies.reduce((acc, curr) => { acc[curr.code] = curr.rate; return acc; }, {});
        setConversionRates(rates);
        const userCountryCode = await fetchUserLocation();
        let newDeterminedCurrency = orderedCurrencies[0]?.code || "PKR";
        if (userCountryCode && countryCurrencyMap[userCountryCode]) {
          const preferredCurrencyCode = countryCurrencyMap[userCountryCode];
          if (orderedCurrencies.some(c => c.code === preferredCurrencyCode)) {
            newDeterminedCurrency = preferredCurrencyCode;
          }
        }
        setSelectedCurrency(newDeterminedCurrency);
      } catch (error) {
        toast.error(`Failed to load essential data: ${error.message}`);
        setSelectedCurrency("PKR");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllInitialData();
  }, [filterServices, fetchUserLocation]);

  if (!isClient || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src="/loader326.gif" alt="loading" width={140} height={140} />
      </div>
    );
  }

  const handleTabClick = (tab) => {
    filterServices(tab, services);
  };

  const handleSaveTabs = async () => {
    const filteredTabs = editTabs.filter((tab) => tab.trim() !== "");
    if (filteredTabs.length === 0) {
      toast.error("At least one tab is required");
      return;
    }
    try {
      const response = await fetch("/api/tabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filteredTabs),
      });
      if (!response.ok) throw new Error('Failed to save tabs');
      const savedTabsData = await response.json();
      setTabs(savedTabsData);
      setEditTabs([...savedTabsData]);
      setIsEditingTabs(false);
      filterServices(savedTabsData.length > 0 ? savedTabsData[0] : "Tiktok", services);
      toast.success("Tabs saved successfully!");
    } catch (error) {
      toast.error(`Failed to save tabs: ${error.message}`);
    }
  };

  const handleDeleteService = async (id) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        const response = await fetch(`/api/services?id=${id}`, { method: "DELETE" });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || "Failed to delete service");
        }
        const updatedServices = services.filter((s) => s._id !== id);
        setServices(updatedServices);
        filterServices(activeTab, updatedServices);
        toast.success("Service deleted!");
      } catch (error) {
        toast.error(`Failed to delete service: ${error.message}`);
      }
    }
  };
  
  const handleSaveService = async () => {
    try {
        if (!currentService.title || !currentService.description || !currentService.category) {
            toast.error("Title, Description, and Category are required.");
            return;
        }
        const method = currentService._id ? "PUT" : "POST";
        const url = currentService._id ? `/api/services?id=${currentService._id}` : "/api/services";
        
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentService),
        });
        
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to save service");
        }

        let updatedServices = currentService._id 
            ? services.map((s) => (s._id === result._id ? result : s)) 
            : [...services, result];
            
        setServices(updatedServices);
        filterServices(activeTab, updatedServices);
        setIsModalOpen(false);
        toast.success("Service saved successfully!");
    } catch (error) {
        toast.error(`Save failed: ${error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentService((prev) => ({ ...prev, [name]: name === "price" ? parseFloat(value) || 0 : value }));
  };
  const handleAddService = () => {
    setCurrentService({ title: "", description: "", price: 0, quantity: "", imageUrl: "", category: activeTab });
    setIsModalOpen(true);
  };
  const handleEditService = (service) => {
    setCurrentService({ ...service, price: parseFloat(service.price) || 0 });
    setIsModalOpen(true);
  };
  const handleAddTab = () => {
    setEditTabs([...editTabs, ""]);
  };

  return (
    <section className="mb-10">
      <div className="my-8 p-4 border rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Popup Messages</h2>
        <NotificationPopup isAdmin={true} />
      </div>
      <AnimatedSection>
        <h1 className="font-bold text-4xl text-center py-5">Our Services</h1>
        <StatsCards isAdmin={true} isEditing={isEditingStats} setIsEditing={setIsEditingStats} />
      </AnimatedSection>
      <h2 className="text-center my-7 sticky top-0 z-40">
        <span className="bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-white shadow-lg rounded-lg py-2 px-4 font-semibold text-sm">
          Check Service Description? Just Click the Icon!
        </span>
      </h2>
      {selectedCurrency && (
        <CurrencySelector
          selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency}
          conversionRates={conversionRates} setConversionRates={setConversionRates}
          isAdmin={true} isEditing={isEditingCurrencies} setIsEditing={setIsEditingCurrencies}
        />
      )}
      <AnimatedSection>
        <div className="rounded-lg p-6 mb-6 bg-white w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Service Categories</h2>
            {isEditingTabs ? (
              <div className="flex space-x-2">
                <button className="btn btn-md btn-success text-white" onClick={handleSaveTabs}>Save</button>
                <button className="btn btn-md btn-error text-white" onClick={() => { setIsEditingTabs(false); setEditTabs([...tabs]); }}>Cancel</button>
                <button className="btn btn-md btn-primary text-white" onClick={handleAddTab}>Add Tab</button>
              </div>
            ) : ( <button className="btn btn-md btn-primary text-white" onClick={() => setIsEditingTabs(true)}>Edit Categories</button> )}
          </div>
          {isEditingTabs ? (
            <div className="space-y-3 w-full">
              {editTabs.map((tab, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input type="text" className="input input-md w-full bg-gray-50 border" value={tab}
                    onChange={(e) => { const newTabs = [...editTabs]; newTabs[index] = e.target.value; setEditTabs(newTabs); }}
                  />
                  <button className="btn btn-md btn-error text-white" onClick={() => setEditTabs(editTabs.filter((_, i) => i !== index))}>×</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 justify-center">
              {tabs.map((tab) => (
                <button key={tab} className={`btn btn-md px-5 font-semibold ${activeTab === tab ? "bg-blue-700 text-white" : "bg-white text-black border"}`} onClick={() => handleTabClick(tab)}>
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>
      </AnimatedSection>
      <div className="flex justify-end px-6 pt-6 pb-2">
        <button className="btn btn-primary" onClick={handleAddService}>Add Service</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {selectedCurrency && filteredServices.map((service) => (
          <AnimatedSection key={service._id}>
            <div className="group relative hover:scale-105 transition-all border p-3 rounded-lg max-w-xs mx-auto cursor-pointer">
              <div className="relative h-40 w-full mb-3">
                <img src={service.imageUrl || '/placeholder.png'} alt={service.title} className="object-contain h-full w-full" />
              </div>
              <h2 className="font-bold text-xl mt-2 text-center">{service.title}</h2>
              <p className="text-center text-sm text-gray-600">
                Price: {convertPrice(service.price || 0)} {selectedCurrency}
                {service.quantity && (<> <br /> {convertQuantityString(service.quantity).split("\n").map((l, i) => (<React.Fragment key={i}>{l}<br /></React.Fragment>))} </>)}
              </p>
              <div className="absolute bottom-0 left-0 w-full p-3 bg-white opacity-0 group-hover:opacity-100 max-h-40 overflow-y-auto">
                {convertDescriptionString(service.description, service.price).split("\n").map((l, i) => (<React.Fragment key={i}>{l}<br /></React.Fragment>))}
              </div>
            </div>
            <div className="flex justify-center mt-4 space-x-2">
              <button className="btn btn-sm" onClick={() => handleEditService(service)}>Edit</button>
              <button className="btn btn-sm btn-error" onClick={() => handleDeleteService(service._id)}>Delete</button>
            </div>
          </AnimatedSection>
        ))}
      </div>

      {isModalOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-3xl bg-white">
            <h3 className="font-bold text-lg">{currentService._id ? "Edit Service" : "Add New Service"}</h3>
            <div className="py-4 space-y-4">
              <input type="text" className="input input-bordered w-full bg-white" name="title" value={currentService.title} onChange={handleInputChange} placeholder="	Enter a Clear & Catchy Service Title (e.g.,YouTube Subscribers)" />
              <input type="number" className="input input-bordered w-full bg-white" name="price" value={currentService.price} onChange={handleInputChange} placeholder="Enter the Service Price in PKR (e.g., 300)" />
              <textarea className="textarea textarea-bordered h-24 bg-white w-full" name="quantity" value={currentService.quantity} onChange={handleInputChange} placeholder="Enter Service Quantity (e.g., 1000, 10k, Unlimited)" />
              <input type="url" className="input input-bordered w-full bg-white" name="imageUrl" value={currentService.imageUrl} onChange={handleInputChange} placeholder="Paste a Valid Image URL (e.g., /images/tiktok.gif)" />
              {currentService.imageUrl && (
                <div className="mt-2 p-2 border rounded-md w-32">
                  <p className="text-sm text-gray-500 mb-1 ">Image Preview:</p>
                  <img src={currentService.imageUrl} alt="Preview" className="max-h-40 object-contain mx-auto" onError={(e) => { e.target.src = '/placeholder.png'; }} />
                </div>
              )}
              <textarea className="textarea textarea-bordered h-32 bg-white w-full" name="description" value={currentService.description} onChange={handleInputChange} placeholder="Write a Detailed Service Description. Use {{price}} to dynamically show the price" />
              <select className="select select-bordered w-full bg-white" name="category" value={currentService.category} onChange={handleInputChange}>
                {tabs.map((tab) => (<option key={tab} value={tab}>{tab}</option>))}
              </select>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveService}>Save</button>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
};

export default Sharry326;