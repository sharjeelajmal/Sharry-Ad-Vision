// src/app/sharry326/page.jsx
"use client";
import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
import Image from "next/image";
import StatsCards from "../_components/StatCards";
import CurrencySelector from "../_components/CurrencySelector";
import AnimatedSection from "../_components/AnimatedSection";
import NotificationPopup from "../_components/Alertmesage.jsx";
import { toast } from "react-hot-toast";

const Sharry326 = () => {
  const [isClient, setIsClient] = useState(false);

  // Services state
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [activeTab, setActiveTab] = useState("Tiktok"); // Default tab, will be set by fetched data
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState({
    title: "",
    description: "",
    price: 0,
    quantity: "",
    imageUrl: "",
    category: "Tiktok", // Default category for new service, can be changed
  });

  // Tabs state
  const [tabs, setTabs] = useState([]);
  const [isEditingTabs, setIsEditingTabs] = useState(false);
  const [editTabs, setEditTabs] = useState([]);

  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState("PKR");
  const [conversionRates, setConversionRates] = useState({ PKR: 1 });
  const [isEditingCurrencies, setIsEditingCurrencies] = useState(false);

  // Stats state
  const [isEditingStats, setIsEditingStats] = useState(false);

  // --- Functions that need to be defined before useEffect ---

  // filterServices function
  // Using useCallback to memoize the function, good practice for functions passed as props or in dependency arrays
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
          serviceCategory === category.toLowerCase() || // Prefer exact category match
          (title.includes(category.toLowerCase()) && !title.includes("offer"))
        );
      });
    }
    setFilteredServices(filtered);
    setActiveTab(category);
  }, []); // Dependencies: none, as it uses internal state setters

  // Currency conversion functions
  const convertPrice = useCallback((price) => {
    const rate = conversionRates[selectedCurrency] || 1;
    let converted = price * rate;

    if (converted % 1 === 0) {
      return converted.toFixed(0);
    } else {
      return converted.toFixed(2);
    }
  }, [conversionRates, selectedCurrency]); // Dependencies: conversionRates, selectedCurrency

  const convertQuantityString = useCallback((quantityString) => {
    if (!quantityString) return "";

    const regex = /(\d{1,3}(?:,\d{3})*)\s*PKR/g;

    return quantityString.replace(regex, (match, p1) => {
      const numericValue = parseFloat(p1.replace(/,/g, ""));
      if (isNaN(numericValue)) return match;

      const convertedValue = convertPrice(numericValue);
      return `${convertedValue} ${selectedCurrency}`;
    });
  }, [convertPrice, selectedCurrency]); // Dependencies: convertPrice, selectedCurrency

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
        const tabsData = await tabsResponse.json(); // This is expected to be an array of strings (tab names)
        if (tabsData.length > 0) {
          setTabs(tabsData);
          setEditTabs([...tabsData]);
          // After fetching tabs and services, set the initial active tab and filter services
          const initialActiveTab = tabsData[0] || "Tiktok"; // Use the first fetched tab or default
          filterServices(initialActiveTab, servicesData); // Call with the fetched data
        } else {
          // If no tabs in DB, use a default set and try to save them (optional, or just use for display)
          const defaultTabs = ["Tiktok", "Youtube", "Facebook", "Instagram", "X-Twitter", "Whatsapp", "Website Development", "Graphics Designing", "Offers"];
          setTabs(defaultTabs);
          setEditTabs(defaultTabs);
          // And also filter services based on a default if no tabs are loaded
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
  }, [filterServices]); // Add filterServices to dependencies since it's used inside and is memoized

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img
          src="/loader326.gif"
          alt="loading"
          width={140}
          height={140}
          className="block mx-auto max-w-full"
        />
      </div>
    );
  }

  // --- Tab management functions ---
  const handleTabClick = (tab) => {
    // When a tab is clicked, filter services based on the current 'services' state
    filterServices(tab, services);
  };

  const handleAddTab = () => {
    setEditTabs([...editTabs, ""]);
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to save tabs");
      }

      const savedTabsData = await response.json(); // API returns array of strings
      setTabs(savedTabsData); // Update main tabs state
      setEditTabs([...savedTabsData]); // Keep editTabs in sync
      setIsEditingTabs(false);
      toast.success("Tabs saved successfully!");
      // After saving tabs, re-filter services to ensure correct display with new/updated categories
      filterServices(activeTab, services);

    } catch (error) {
      console.error("Error saving tabs:", error);
      toast.error(`Failed to save tabs: ${error.message}`);
    }
  };

  // --- Service CRUD functions ---
  const handleAddService = () => {
    setCurrentService({
      title: "",
      description: "",
      price: 0,
      quantity: "",
      imageUrl: "",
      category: activeTab,
    });
    setIsModalOpen(true);
  };

  const handleEditService = (service) => {
    setCurrentService({
      ...service,
      price: parseFloat(service.price) || 0,
    });
    setIsModalOpen(true);
  };

  const handleDeleteService = async (id) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        const response = await fetch(`/api/services?id=${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || "Failed to delete service");
        }

        const updatedServices = services.filter((service) => service._id !== id);
        setServices(updatedServices);
        filterServices(activeTab, updatedServices);
        toast.success("Service deleted successfully!");
      } catch (error) {
        console.error("Error deleting service:", error);
        toast.error(`Failed to delete service: ${error.message}`);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentService((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSaveService = async () => {
    try {
      const serviceData = {
        title: String(currentService.title).trim(),
        description: String(currentService.description).trim(),
        price: parseFloat(currentService.price) || 0,
        quantity: String(currentService.quantity).trim(),
        imageUrl: String(currentService.imageUrl).trim(),
        category: currentService.category || activeTab,
      };

      if (!serviceData.title || serviceData.title.length < 3) {
        throw new Error("Title must be at least 3 characters.");
      }
      if (!serviceData.description || serviceData.description.length < 10) {
        throw new Error("Description must be at least 10 characters.");
      }
      if (isNaN(serviceData.price) || serviceData.price < 0) {
        throw new Error("Price must be a non-negative number.");
      }
      if (!serviceData.category) {
        throw new Error("Category is required.");
      }

      const method = currentService._id ? "PUT" : "POST";
      const url = currentService._id
        ? `/api/services?id=${currentService._id}`
        : "/api/services";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.details || "Failed to save service"
        );
      }

      let updatedServices;
      if (currentService._id) {
        updatedServices = services.map((s) =>
          s._id === result._id ? result : s
        );
      } else {
        updatedServices = [...services, result];
      }
      setServices(updatedServices);
      filterServices(activeTab, updatedServices); // Re-filter to show changes immediately

      setIsModalOpen(false);
      toast.success("Service saved successfully!");
    } catch (error) {
      console.error("Save Service Error:", error);
      toast.error(`Save failed: ${error.message}`);
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
        <span className="bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-white shadow-lg rounded-lg py-2 px-2 sm:py-4 sm:px-4 mx-4 sm:mx-7 font-semibold text-xs sm:text-sm">
          Check Service Description? Just Click the Icon!
        </span>
      </h2>

      <CurrencySelector
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        conversionRates={conversionRates}
        setConversionRates={setConversionRates}
        isAdmin={true}
        isEditing={isEditingCurrencies}
        setIsEditing={setIsEditingCurrencies}
      />
      <AnimatedSection>
        <div className="rounded-lg p-6 mb-6 bg-white w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Service Categories</h2>
            {isEditingTabs ? (
              <div className="flex space-x-2">
                <button
                  className="btn btn-md btn-success text-white"
                  onClick={handleSaveTabs}
                >
                  Save
                </button>
                <button
                  className="btn btn-md btn-error text-white"
                  onClick={() => {
                    setIsEditingTabs(false);
                    setEditTabs([...tabs]);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-md btn-primary text-white"
                  onClick={handleAddTab}
                >
                  Add Tab
                </button>
              </div>
            ) : (
              <button
                className="btn btn-md btn-primary text-white"
                onClick={() => setIsEditingTabs(true)}
              >
                Edit Categories
              </button>
            )}
          </div>

          {isEditingTabs ? (
            <div className="space-y-3 w-full bg-white">
              {editTabs.map((tab, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white">
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
                      ? "bg-blue-700 text-white shadow-lg hover:bg-blue-700"
                      : "bg-white text-black hover:bg-gray-200 border border-gray-300"
                  } capitalize rounded-lg`}
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
        <button className="btn btn-primary" onClick={handleAddService}>
          Add Service
        </button>
      </div>

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
                <h2 className="font-bold text-xl mt-2 text-center ">
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
              <div className="flex justify-center mt-4 space-x-2">
                <button
                  className="btn btn-sm"
                  onClick={() => handleEditService(service)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => handleDeleteService(service._id)}
                >
                  Delete
                </button>
              </div>
            </AnimatedSection>
          );
        })}
      </div>

      {isModalOpen && (
        <dialog open className="modal modal-open ">
          <div className="modal-box max-w-3xl bg-white">
            <h3 className="font-bold text-lg">
              {currentService._id ? "Edit Service" : "Add New Service"}
            </h3>
            <div className="py-4 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title*</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-white"
                  name="title"
                  value={currentService.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Price (PKR)*</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full bg-white"
                  name="price"
                  value={currentService.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Quantity</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24 bg-white"
                  name="quantity"
                  value={currentService.quantity}
                  onChange={handleInputChange}
                  placeholder="Enter quantity details (e.g., 1k or 1k Price: 1,200 PKR = 10k)"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Image URL</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered w-full bg-white"
                  name="imageUrl"
                  value={currentService.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
                {currentService.imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Image Preview:</p>
                    <img
                      src={currentService.imageUrl}
                      alt="Preview"
                      className="mt-1 max-h-20 object-contain"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.png";
                        e.target.className =
                          "mt-1 max-h-20 object-contain opacity-50";
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description*</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-32 bg-white"
                  name="description"
                  value={currentService.description}
                  onChange={handleInputChange}
                  placeholder="Use {{price}} for dynamic price insertion"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category*</span>
                </label>
                <select
                  className="select select-bordered w-full bg-white"
                  name="category"
                  value={currentService.category}
                  onChange={handleInputChange}
                  required
                >
                  {tabs.map((tab) => (
                    <option key={tab} value={tab}>
                      {tab}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveService}>
                Save
              </button>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
};

export default Sharry326;