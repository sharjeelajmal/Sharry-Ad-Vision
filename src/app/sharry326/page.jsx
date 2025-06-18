// src/app/sharry326/page.jsx
"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import StatsCards from "../_components/StatCards";
import CurrencySelector from "../_components/CurrencySelector";
import AnimatedSection from "../_components/AnimatedSection";
import NotificationPopup from "../_components/Alertmesage.jsx";
import { toast } from "react-hot-toast";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";

// Sortable Service Item component for drag and drop
function SortableServiceItem({ service, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: service._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab', // Visual cue that the card is draggable
  };

  return (
    // Apply ref, style, attributes, and listeners to the main draggable element
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

const countryCurrencyMap = {
  PK: "PKR", US: "USD", IN: "INR", AE: "AED", GB: "GBP", DE: "EUR", FR: "EUR",
};

const Sharry326 = () => {
  const [isClient, setIsClient] = useState(false);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [orderedServices, setOrderedServices] = useState([]);
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
  const [searchTerm, setSearchTerm] = useState('');

  const pkrRegex = /(\d{1,3}(?:,?\d{3})*|\d+)\s*PKR/gi;

  const filterServices = useCallback((category, allServicesList) => {
    let tempFiltered = [];

    if (category.toLowerCase() === "offers") {
      tempFiltered = allServicesList.filter((service) =>
        service.title.toLowerCase().includes("offer")
      );
    } else {
      tempFiltered = allServicesList.filter((service) => {
        const title = service.title.toLowerCase();
        const serviceCategory = service.category ? service.category.toLowerCase() : "";
        return (
          serviceCategory === category.toLowerCase() ||
          (title.includes(category.toLowerCase()) && !title.includes("offer"))
        );
      });
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFiltered = tempFiltered.filter(service =>
        service.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        service.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        (service.category && service.category.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    
    setFilteredServices(tempFiltered);
    setOrderedServices(tempFiltered);
    setActiveTab(category);
  }, [searchTerm]);

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

  const fetchUserLocation = useCallback(async () => {
    const cachedCountryCode = sessionStorage.getItem('userCountryCode');
    if (cachedCountryCode) return cachedCountryCode;
    try {
      const geoResponse = await fetch("/api/get-user-location");
      const data = await geoResponse.json();
      if (data && data.countryCode) {
        sessionStorage.setItem('userCountryCode', data.countryCode);
        return data.countryCode;
      }
      return 'PK';
    } catch (error) {
      return 'PK';
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
        setActiveTab(initialActiveTab);

        const fetchedCurrenciesData = await currenciesResponse.json();
        const orderedCurrencies = fetchedCurrenciesData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const rates = orderedCurrencies.reduce((acc, curr) => { acc[curr.code] = curr.rate; return acc; }, {});
        setConversionRates(rates);

        const userCountryCode = await fetchUserLocation();
        const preferredCurrency = countryCurrencyMap[userCountryCode] || "PKR";
        
        if (orderedCurrencies.some(c => c.code === preferredCurrency)) {
            setSelectedCurrency(preferredCurrency);
        } else {
            setSelectedCurrency(orderedCurrencies[0]?.code || "PKR");
        }
      } catch (error) {
        toast.error(`Failed to load essential data: ${error.message}`);
        setSelectedCurrency("PKR");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllInitialData();
  }, []);

  useEffect(() => {
    if (services.length > 0 && activeTab) {
      filterServices(activeTab, services);
    }
  }, [services, activeTab, searchTerm, filterServices]);


  if (!isClient || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src="/loader326.gif" alt="loading" width={140} height={140} />
      </div>
    );
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab);
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
      setActiveTab(savedTabsData.length > 0 ? savedTabsData[0] : "Tiktok");
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
        const updatedServicesResponse = await fetch("/api/services");
        const updatedServicesData = await updatedServicesResponse.json();
        setServices(updatedServicesData);
        filterServices(activeTab, updatedServicesData);
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

        const updatedServicesResponse = await fetch("/api/services");
        const updatedServicesData = await updatedServicesResponse.json();
        setServices(updatedServicesData);
        filterServices(activeTab, updatedServicesData);

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

  // DND Handlers
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setOrderedServices((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        const newOrderedArray = arrayMove(items, oldIndex, newIndex);
        return newOrderedArray;
      });
    }
  };

  const handleSaveOrder = async () => {
    setIsLoading(true);
    try {
      const orderPayload = orderedServices.map((service, index) => ({
        id: service._id,
        orderIndex: index,
      }));

      const response = await fetch('/api/services/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to save order");
      }
      
      const updatedServicesResponse = await fetch("/api/services");
      const updatedServicesData = await updatedServicesResponse.json();
      setServices(updatedServicesData);
      filterServices(activeTab, updatedServicesData);

      toast.success("Service order saved successfully!");
    } catch (error) {
      toast.error(`Failed to save order: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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
        <div className="rounded-lg px-6  bg-white w-full max-w-4xl mx-auto">
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
            <div className="flex flex-wrap gap-3 justify-center ">
              {tabs.map((tab) => (
                <Button
                  key={tab}
                  className={`btn-md px-5 font-semibold hover:bg-gray-300 shadow-equal ${activeTab === tab ? "bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-white" : "bg-white text-black no-border-tab "} capitalize rounded-lg`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab}
                </Button>
              ))}
            </div>
          )}
         <div className="mt-5 relative">
  <input
    type="text"
    placeholder="Search services..."
    className="input w-full bg-white border-2 border-gray-200 outline-none px-5 py-3 rounded-full shadow-sm  focus:scale-105 focus:border-transparent transition-all duration-200 "
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  <svg 
    className="absolute right-4 top-3.5 h-5 w-5 text-gray-400"
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
    />
  </svg>
</div>
        </div>
      </AnimatedSection>
      <div className="flex justify-end px-6 pt-6 pb-4 space-x-2">
        <button className="btn btn-primary text-white" onClick={handleAddService}>Add Service</button>
        <button className="btn btn-success text-white" onClick={handleSaveOrder}>Save Order</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 px-4">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderedServices.map(s => s._id)} strategy={verticalListSortingStrategy}>
            {orderedServices.map((service) => (
              <SortableServiceItem key={service._id} service={service}>
                <AnimatedSection>
                  <div className="group relative hover:scale-105 transition-all border p-3 rounded-lg max-w-xs mx-auto">
                    
                    <div className="relative h-40 w-full mb-3">
                      <img src={service.imageUrl || '/placeholder.png'} alt={service.title} className="object-contain h-full w-full" />
                    </div>
                    <h2 className="font-bold text-xl mt-2 text-center">{service.title}</h2>
                    <p className="text-center text-sm text-gray-600">
                      Price: {convertPrice(service.price || 0)} {selectedCurrency}
                      {service.quantity && (<span className="inline">  {convertQuantityString(service.quantity)}</span>)}
                    </p>
                    <div className="absolute bottom-0 left-0 w-full p-3 bg-white opacity-0 group-hover:opacity-100 max-h-40 overflow-y-auto">
                       <p className="text-xs sm:text-sm whitespace-pre-line">
                         {convertDescriptionString(service.description, service.price)}
                       </p>
                    </div>
                  </div>
                  {/* Edit/Delete buttons - Use onPointerDown for robust clickability */}
                  {/* e.stopPropagation() and e.preventDefault() are now inside the specific button handlers */}
                  <div className="flex justify-center mt-4 space-x-2">
                    <button className="btn btn-sm text-white bg-black" onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); handleEditService(service); }}>Edit</button>
                    <button className="btn btn-sm btn-error text-white" onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); handleDeleteService(service._id); }}>Delete</button>
                  </div>
                </AnimatedSection>
              </SortableServiceItem>
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {isModalOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-3xl bg-white">
            <h3 className="font-bold text-lg">{currentService._id ? "Edit Service" : "Add New Service"}</h3>
            <div className="py-4 space-y-4">
              <input type="text" className="input input-bordered w-full bg-white" name="title" value={currentService.title} onChange={handleInputChange} placeholder="Enter a Clear & Catchy Service Title (e.g.,YouTube Subscribers)" />
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
                  <Button className=" text-white bg-red-700 hover:bg-red-500" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button className=" btn-primary" onClick={handleSaveService}>Save</Button>

            </div>
          </div>
        </dialog>
      )}
    </section>
  );
};

export default Sharry326;