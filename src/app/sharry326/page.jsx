"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import StatsCards from "../_components/StatCards";
import CurrencySelector from "../_components/CurrencySelector";
import AnimatedSection from "../_components/AnimatedSection";
import NoSSRNotification from "../_components/NoSSRNotification";
import NotificationPopup from '../_components/Alertmesage.jsx';
import { toast } from 'react-hot-toast';

const Sharry326 = () => {
  // Services state
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [activeTab, setActiveTab] = useState("Tiktok");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState({
    id: 0,
    title: "",
    description: "",
    price: 0,
    quantity: "",
    imageUrl: ""
  });

  // Tabs state
  const [tabs, setTabs] = useState([
    "Tiktok",
    "Youtube",
    "Facebook",
    "Instagram",
    "X-Twitter",
    "Whatsapp",
    "Website Development",
    "Graphics Designing",
    "Offers",
  ]);
  const [isEditingTabs, setIsEditingTabs] = useState(false);
  const [editTabs, setEditTabs] = useState([...tabs]);

  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState("PKR");
  const [conversionRates, setConversionRates] = useState({ PKR: 1 });
  const [isEditingCurrencies, setIsEditingCurrencies] = useState(false);

  // Stats state
  const [isEditingStats, setIsEditingStats] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch services
        const servicesResponse = await fetch("/api/services");
        if (!servicesResponse.ok) throw new Error(`HTTP error! status: ${servicesResponse.status}`);
        const servicesData = await servicesResponse.json();
        setServices(servicesData);
        filterServices("Tiktok", servicesData);

        // Fetch tabs
        const tabsResponse = await fetch("/api/tabs");
        if (tabsResponse.ok) {
          const tabsData = await tabsResponse.json();
          if (tabsData.length > 0) {
            setTabs(tabsData);
            setEditTabs([...tabsData]);
          }
        }

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
        toast.error("Failed to load initial data");
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
        return title.includes(category.toLowerCase()) && !title.includes("offer");
      });
    }
    setFilteredServices(filtered);
  };

  // Tab management functions
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    filterServices(tab);
  };

  const handleAddTab = () => {
    setEditTabs([...editTabs, ""]);
  };

  const handleSaveTabs = async () => {
    const filteredTabs = editTabs.filter(tab => tab.trim() !== "");
    if (filteredTabs.length === 0) {
      toast.error("At least one tab is required");
      return;
    }
    
    setTabs(filteredTabs);
    setEditTabs(filteredTabs);
    setIsEditingTabs(false);
    
    try {
      const response = await fetch('/api/tabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filteredTabs)
      });
      
      if (!response.ok) throw new Error('Failed to save tabs');
      toast.success('Tabs saved successfully!');
    } catch (error) {
      console.error("Error saving tabs:", error);
      toast.error('Failed to save tabs. Please try again.');
    }
  };

  // Currency conversion functions
  const convertPrice = (price) => {
    const rate = conversionRates[selectedCurrency] || 1;
    const converted = price * rate;
    return converted % 1 === 0 ? converted.toFixed(0) : converted.toFixed(4).replace(/\.?0+$/, '');
  };

  const convertQuantityString = (quantityString) => {
    return quantityString.replace(/(\d{1,3}(?:,\d{3})*|\d+)\s*PKR/g, (match, p1) => {
      const numericValue = Number(p1.replace(/,/g, ""));
      const converted = convertPrice(numericValue);
      return `${converted} ${selectedCurrency}`;
    });
  };

  // Service CRUD functions
  const handleAddService = () => {
    setCurrentService({
      id: 0,
      title: "",
      description: "",
      price: 0,
      quantity: "",
      imageUrl: ""
    });
    setIsModalOpen(true);
  };

  const handleEditService = (service) => {
    setCurrentService({ ...service });
    setIsModalOpen(true);
  };

  const handleDeleteService = async (id) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        const response = await fetch(`/api/services?id=${id}`, {
          method: "DELETE",
        });
        
        if (!response.ok) throw new Error("Failed to delete service");
        
        setServices(services.filter(service => service.id !== id));
        filterServices(activeTab);
        toast.success('Service deleted successfully!');
      } catch (error) {
        console.error("Error deleting service:", error);
        toast.error('Failed to delete service. Please try again.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentService(prev => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value
    }));
  };

  const handleSaveService = async () => {
    if (!currentService.title.trim() || !currentService.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    try {
      const method = currentService.id ? "PUT" : "POST";
      const url = "/api/services" + (currentService.id ? `?id=${currentService.id}` : "");
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentService),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${method === "POST" ? "create" : "update"} service`);
      }
      
      const data = await response.json();
      const updatedServices = currentService.id
        ? services.map(s => s.id === currentService.id ? data : s)
        : [...services, data];
      
      setServices(updatedServices);
      filterServices(activeTab, updatedServices);
      setIsModalOpen(false);
      toast.success('Service saved successfully!');
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error(`Error saving service: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Image    src="./loader326.gif"
                    alt= "loading"
                    width={140}
                    height={140}
                    unoptimized
                    className="block mx-auto max-w-full"></Image>
      </div>
    );
  }

  return (
    <section className="mb-10">
      <div className="my-8 p-4 border rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Popup Messages</h2>
        <NotificationPopup isAdmin={true} />
      </div>
      
      <AnimatedSection>
        <h1 className="font-bold text-4xl text-center py-5">Our Services</h1>
        <div className="flex justify-end px-6 pb-4 space-x-2">
          <button 
            className={`btn ${isEditingStats ? 'btn-success' : 'btn-outline'}`}
            onClick={() => setIsEditingStats(!isEditingStats)}
          >
            {isEditingStats ? 'Save Stats' : 'Edit Stats'}
          </button>
        </div>
        <StatsCards isAdmin={true} isEditing={isEditingStats} />
      </AnimatedSection>

      <h2 className="text-center my-7 sticky top-0 z-40">
        <span className="bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-white shadow-lg rounded-lg py-2 px-2 sm:py-4 sm:px-4 mx-4 sm:mx-7 font-semibold text-xs sm:text-sm">
          Check Service Description? Just Click the Icon!
        </span>
      </h2>

      <div className="flex justify-end px-6 pb-4 space-x-2">
        <button 
          className={`btn ${isEditingCurrencies ? 'btn-success' : 'btn-outline'}`}
          onClick={() => setIsEditingCurrencies(!isEditingCurrencies)}
        >
          {isEditingCurrencies ? 'Save Currencies' : 'Edit Currencies'}
        </button>
      </div>
      
      <CurrencySelector 
        selectedCurrency={selectedCurrency} 
        setSelectedCurrency={setSelectedCurrency}
        isAdmin={true}
        isEditing={isEditingCurrencies}
        setIsEditing={setIsEditingCurrencies}
      />

      <AnimatedSection>
<div className="rounded-lg p-6 mb-6 bg-white  w-full max-w-4xl mx-auto">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold">Service Categories</h2>
    {isEditingTabs ? (
      <div className="flex space-x-2">
        <button className="btn btn-md btn-success" onClick={handleSaveTabs}>
          Save
        </button>
        <button className="btn btn-md btn-error" onClick={() => setIsEditingTabs(false)}>
          Cancel
        </button>
        <button className="btn btn-md btn-primary" onClick={handleAddTab}>
          Add Tab
        </button>
      </div>
    ) : (
      <button className="btn btn-md btn-primary" onClick={() => setIsEditingTabs(true)}>
        Edit Categories
      </button>
    )}
  </div>

  {isEditingTabs ? (
    <div className="space-y-3 w-full">
      {editTabs.map((tab, index) => (
        <div key={index} className="flex items-center space-x-3">
          <input
            type="text"
            className="input input-md w-full bg-gray-50 text-gray-800 border border-gray-300 rounded-lg px-4 py-2"
            value={tab}
            onChange={(e) => {
              const newTabs = [...editTabs];
              newTabs[index] = e.target.value;
              setEditTabs(newTabs);
            }}
            placeholder="Enter category name"
          />
          <button
            className="btn btn-md btn-error min-w-[3rem] h-10 text-lg"
            onClick={() => {
              setEditTabs(editTabs.filter((_, i) => i !== index));
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  ) : (
    <div className="flex flex-wrap gap-3 justify-center">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`btn btn-md px-5 font-semibold py-2 text-md ${
            activeTab === tab 
              ?'bg-blue-700 text-white shadow-lg hover:bg-blue-700' 
              : 'bg-white  text-black hover:bg-gray-200 border border-gray-300'
          } capitalize rounded-lg `}
          onClick={() => handleTabClick(tab)}
        >
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
        {filteredServices.map((service) => {
          const dynamicDescription = service.description.replace(/{{price}}/g, `${convertPrice(Number(service.price))} ${selectedCurrency}`);

          return (
            <AnimatedSection key={service.id}>
              <div className="group relative hover:scale-105 transition-all border border-gray-300 rounded-lg p-3 max-w-xs mx-auto cursor-pointer">
                {service.imageUrl && (
                  <Image
                    src={service.imageUrl}
                    alt={service.title}
                    width={140}
                    height={140}
                    unoptimized
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
                <div className="flex justify-center mt-4 space-x-2">
                  <button className="btn btn-sm" onClick={() => handleEditService(service)}>Edit</button>
                  <button className="btn btn-sm btn-error" onClick={() => handleDeleteService(service.id)}>Delete</button>
                </div>
            </AnimatedSection>
          );
        })}
      </div>

      {/* Service Edit/Create Modal */}
      <dialog open={isModalOpen} className="modal">
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-lg">{currentService.id ? "Edit Service" : "Add New Service"}</h3>
          <div className="py-4 space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                name="title"
                value={currentService.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Price (PKR)</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                name="price"
                value={currentService.price}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Quantity</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                name="quantity"
                value={currentService.quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity details (one per line)"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Image URL</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                name="imageUrl"
                value={currentService.imageUrl}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32"
                name="description"
                value={currentService.description}
                onChange={handleInputChange}
                placeholder="Use {{price}} for dynamic price insertion"
              />
            </div>
          </div>
          <div className="modal-action">
            <button className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveService}>Save</button>
          </div>
        </div>
      </dialog>
    </section>
  );
};

export default Sharry326;