// src/app/sharry326/page.jsx
"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import StatsCards from "../_components/StatCards";
import CurrencySelector from "../_components/CurrencySelector";
import AnimatedSection from "../_components/AnimatedSection";
import NotificationPopup from "../_components/Alertmesage.jsx";
import { toast } from "react-hot-toast";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";

function SortableServiceItem({ service, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: service._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

const countryCurrencyMap = {
  PK: "PKR",
  US: "USD",
  IN: "INR",
  AE: "AED",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
};

const Sharry326 = () => {
  const [isClient, setIsClient] = useState(false);
  const [services, setServices] = useState([]);
  const [orderedServices, setOrderedServices] = useState([]);
  const [activeTab, setActiveTab] = useState("Tiktok");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState({
    title: "",
    description: "",
    price: 0,
    quantity: "",
    imageUrl: "",
    category: "Tiktok",
  });
  const [tabs, setTabs] = useState([]);
  const [isEditingTabs, setIsEditingTabs] = useState(false);
  const [editTabs, setEditTabs] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [conversionRates, setConversionRates] = useState({ PKR: 1 });
  const [isEditingCurrencies, setIsEditingCurrencies] = useState(false);
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [galleryItems, setGalleryItems] = useState([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const pkrRegex = /(\d{1,3}(?:,?\d{3})*|\d+)\s*PKR/gi;

  const fetchAllInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/initial-data?_=${new Date().getTime()}`
      );
      if (!response.ok)
        throw new Error(`Data load failed: ${response.statusText}`);
      const data = await response.json();

      setServices(data.services || []);
      setTabs(data.tabs || []);
      setEditTabs([...(data.tabs || [])]);
      setWhatsappNumber(data.settings?.whatsappNumber || "");
      setGalleryItems(data.gallery || []);

      if ((data.tabs || []).length > 0) setActiveTab(data.tabs[0]);

      const fetchedCurrencies = data.currencies || [];
      const rates = fetchedCurrencies.reduce(
        (acc, curr) => {
          acc[curr.code] = curr.rate;
          return acc;
        },
        { PKR: 1 }
      );
      setConversionRates(rates);
      if (fetchedCurrencies.length > 0)
        setSelectedCurrency(fetchedCurrencies[0].code || "PKR");
    } catch (error) {
      toast.error(`Data load karne mein masla: ${error.message}`);
      setServices([]);
      setTabs([]);
      setEditTabs([]);
      setGalleryItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    fetchAllInitialData();
  }, [fetchAllInitialData]);

  const filterServices = useCallback(
    (category, allServicesList) => {
      if (!allServicesList) return;
      let tempFiltered = [];
      if (category.toLowerCase() === "offers") {
        tempFiltered = allServicesList.filter((service) =>
          service.title.toLowerCase().includes("offer")
        );
      } else {
        tempFiltered = allServicesList.filter((service) => {
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
      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        tempFiltered = tempFiltered.filter(
          (service) =>
            service.title.toLowerCase().includes(lowerCaseSearchTerm) ||
            service.description.toLowerCase().includes(lowerCaseSearchTerm) ||
            (service.category &&
              service.category.toLowerCase().includes(lowerCaseSearchTerm))
        );
      }
      setOrderedServices(tempFiltered);
    },
    [searchTerm]
  );

  useEffect(() => {
    if (services && activeTab) {
      filterServices(activeTab, services);
    }
  }, [services, activeTab, searchTerm, filterServices]);

  const convertPrice = useCallback(
    (price) => {
      const rate = conversionRates[selectedCurrency] || 1;
      let converted = price * rate;
      return converted % 1 === 0 ? converted.toFixed(0) : converted.toFixed(2);
    },
    [conversionRates, selectedCurrency]
  );

  const convertQuantityString = useCallback(
    (quantityString) => {
      if (!quantityString) return "";
      return quantityString.replace(pkrRegex, (match, p1) => {
        const numericValue = parseFloat(p1.replace(/,/g, ""));
        if (isNaN(numericValue)) return match;
        return `${convertPrice(numericValue)} ${selectedCurrency}`;
      });
    },
    [convertPrice, selectedCurrency, pkrRegex]
  );

  const convertDescriptionString = useCallback(
    (description, basePrice) => {
      if (!description) return "";
      let convertedDesc = description.replace(
        /{{price}}/g,
        `${convertPrice(Number(basePrice || 0))} ${selectedCurrency}`
      );
      return convertedDesc.replace(pkrRegex, (match, p1) => {
        const numericValue = parseFloat(p1.replace(/,/g, ""));
        if (isNaN(numericValue)) return match;
        return `${convertPrice(numericValue)} ${selectedCurrency}`;
      });
    },
    [convertPrice, selectedCurrency, pkrRegex]
  );

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
    try {
      const response = await fetch("/api/tabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editTabs),
      });
      if (!response.ok) throw new Error("Failed to save tabs");
      await fetchAllInitialData();
      setIsEditingTabs(false);
      toast.success("Tabs saved!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteService = async (id) => {
    if (confirm("Are you sure?")) {
      try {
        const response = await fetch(`/api/services?id=${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Service delete nahi ho saki");
        await fetchAllInitialData();
        toast.success("Service deleted!");
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleSaveService = async () => {
    try {
      const response = await fetch(
        currentService._id
          ? `/api/services?id=${currentService._id}`
          : "/api/services",
        {
          method: currentService._id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentService),
        }
      );
      if (!response.ok) throw new Error("Service save karne mein nakaami");
      await fetchAllInitialData();
      setIsModalOpen(false);
      setPreviewUrl("");
      toast.success("Service save ho gayi!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentService((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAddService = () => {
    setCurrentService({
      title: "",
      description: "",
      price: 0,
      quantity: "",
      imageUrl: "",
      category: activeTab,
    });
    setPreviewUrl("");
    setIsModalOpen(true);
  };

  const handleEditService = (service) => {
    setCurrentService({ ...service, price: parseFloat(service.price) || 0 });
    setPreviewUrl(service.imageUrl);
    setIsModalOpen(true);
  };

  const handleAddTab = () => {
    setEditTabs([...editTabs, ""]);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setOrderedServices((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        if (oldIndex === -1 || newIndex === -1) return items;
        return arrayMove(items, oldIndex, newIndex);
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
      const response = await fetch("/api/services/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      if (!response.ok) throw new Error("Failed to save order");
      await fetchAllInitialData();
      toast.success("Order saved!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!whatsappNumber) {
      toast.error("WhatsApp number cannot be empty.");
      return;
    }
    toast.loading("Saving settings...");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber }),
      });
      if (!res.ok) throw new Error("Settings save nahi ho sakein");
      toast.dismiss();
      toast.success("Settings saved!");
    } catch (error) {
      toast.dismiss();
      toast.error(error.message);
    }
  };

  const handleGalleryDelete = async (media) => {
    if (confirm(`Delete ${media.filename}?`)) {
      try {
        const response = await fetch("/api/api/gallery", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: media._id, url: media.url }),
        });
        if (!response.ok) throw new Error("Failed to delete media");
        toast.success("Media deleted!");
        await fetchAllInitialData();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    toast.loading("Uploading...");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("File upload nakaam");
      await fetchAllInitialData();
      toast.dismiss();
      toast.success("File uploaded to gallery!");
    } catch (error) {
      toast.dismiss();
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSelectFromGallery = (media) => {
    setCurrentService((prev) => ({ ...prev, imageUrl: media.url }));
    setPreviewUrl(media.url);
    setIsGalleryOpen(false);
  };

  return (
    <section className="mb-10">
      <div className="my-8 p-4 border rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Popup Messages</h2>{" "}
        <NotificationPopup
          isAdmin={true}
          galleryItems={galleryItems}
          setGalleryItems={setGalleryItems}
        />
      </div>
      <div className="my-8 p-4 border rounded-lg max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Global Settings</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label htmlFor="whatsapp" className="font-semibold whitespace-nowrap">
            WhatsApp Number:
          </label>
          <input
            id="whatsapp"
            type="text"
            className="input input-bordered w-full sm:w-auto bg-white"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="e.g., 923001234567"
          />
          <Button
            className="btn-success text-white"
            onClick={handleSaveSettings}
          >
            Save Number
          </Button>
        </div>
      </div>
      <div className="my-8 p-4  border rounded-lg max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Media Gallery</h2>
          <label
            className={`btn btn-primary text-white ${
              uploading ? "loading" : ""
            }`}
          >
            {uploading ? "Uploading..." : "Upload New Media"}
            <input
              type="file"
              hidden
              accept="image/*,video/mp4,video/webm"
              onChange={handleGalleryUpload}
              disabled={uploading}
            />
          </label>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-96 overflow-y-auto">
          {galleryItems.map((media) => (
            <div
              key={media._id}
              className="relative group border rounded-lg p-1"
            >
              {media.filetype === "video" ? (
                <video
                  src={media.url}
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="w-full h-32 object-cover"
                />
              ) : (
                <img
                  src={media.url}
                  alt={media.filename}
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleGalleryDelete(media)}
                  className="text-white bg-red-600 rounded-full p-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                    <path
                      fillRule="evenodd"
                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AnimatedSection>
        <h1 className="font-bold text-4xl text-center py-5">Our Services</h1>
        <StatsCards
          isAdmin={true}
          isEditing={isEditingStats}
          setIsEditing={setIsEditingStats}
        />
      </AnimatedSection>
      <h2 className="text-center my-7 sticky top-0 z-40">
        <span className="bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-white shadow-lg rounded-lg py-2 px-4 font-semibold text-sm">
          Check Service Description? Just Click the Icon!
        </span>
      </h2>
      {selectedCurrency && (
        <CurrencySelector
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          conversionRates={conversionRates}
          setConversionRates={setConversionRates}
          isAdmin={true}
          isEditing={isEditingCurrencies}
          setIsEditing={setIsEditingCurrencies}
        />
      )}
      <AnimatedSection>
        <div className="rounded-lg px-6 bg-white w-full max-w-4xl mx-auto">
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
            <div className="space-y-3 w-full">
              {editTabs.map((tab, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    className="input input-md w-full bg-gray-50 border"
                    value={tab}
                    onChange={(e) => {
                      const newTabs = [...editTabs];
                      newTabs[index] = e.target.value;
                      setEditTabs(newTabs);
                    }}
                  />
                  <button
                    className="btn btn-md btn-error text-white"
                    onClick={() =>
                      setEditTabs(editTabs.filter((_, i) => i !== index))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 justify-center ">
              {tabs.map((tab) => (
                <Button
                  key={tab}
                  className={`btn-md px-5 font-semibold hover:bg-gray-300 shadow-equal ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-white"
                      : "bg-white text-black no-border-tab "
                  } capitalize rounded-lg`}
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
              className="input w-full bg-white border-2 border-gray-200 outline-none px-5 py-3 rounded-full shadow-sm focus:scale-105 focus:border-transparent transition-all duration-200"
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
        <button
          className="btn btn-primary text-white"
          onClick={handleAddService}
        >
          Add Service
        </button>
        <button
          className="btn btn-success text-white"
          onClick={handleSaveOrder}
        >
          Save Order
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 px-4">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedServices.map((s) => s._id)}
            strategy={verticalListSortingStrategy}
          >
            {orderedServices.map((service) => (
              <SortableServiceItem key={service._id} service={service}>
                <AnimatedSection>
                  <div className="group relative hover:scale-105 transition-all border p-3 rounded-lg max-w-xs mx-auto">
                    <div className="relative h-40 w-full mb-3">
                      {service.imageUrl &&
                      (service.imageUrl.endsWith(".mp4") ||
                        service.imageUrl.endsWith(".webm")) ? (
                        <video
                          src={service.imageUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="object-contain h-full w-full"
                        />
                      ) : (
                        <img
                          src={service.imageUrl || "/placeholder.png"}
                          alt={service.title}
                          className="object-contain h-full w-full"
                        />
                      )}
                    </div>
                    <h2 className="font-bold text-xl mt-2 text-center">
                      {service.title}
                    </h2>
                    {/* ▼▼▼ YAHAN TABDEELI KI GAYI HAI ▼▼▼ */}
                    <p className="text-center text-sm text-gray-600 whitespace-pre-line">
                      Price: {convertPrice(service.price || 0)}{" "}
                      {selectedCurrency}
                      {service.quantity &&
                        ` ${convertQuantityString(service.quantity)}`}
                    </p>
                    <div className="absolute bottom-0 left-0 w-full p-3 bg-white opacity-0 group-hover:opacity-100 max-h-40 overflow-y-auto">
                      <p className="text-xs sm:text-sm whitespace-pre-line">
                        {convertDescriptionString(
                          service.description,
                          service.price
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center mt-4 space-x-2">
                    <button
                      className="btn btn-sm text-white bg-black"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleEditService(service);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-error text-white"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDeleteService(service._id);
                      }}
                    >
                      Delete
                    </button>
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
            <h3 className="font-bold text-lg">
              {currentService._id ? "Edit Service" : "Add New Service"}
            </h3>
            <div className="py-4 space-y-4">
              <input
                type="text"
                className="input input-bordered w-full bg-white"
                name="title"
                value={currentService.title}
                onChange={handleInputChange}
                placeholder="Service Title"
              />
              <input
                type="number"
                className="input input-bordered w-full bg-white"
                name="price"
                value={currentService.price}
                onChange={handleInputChange}
                placeholder="Service Price"
              />
              <textarea
                className="textarea textarea-bordered h-24 bg-white w-full"
                name="quantity"
                value={currentService.quantity}
                onChange={handleInputChange}
                placeholder="Service Quantity"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Media
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    className="input input-bordered w-full bg-gray-100"
                    name="imageUrl"
                    value={currentService.imageUrl}
                    onChange={handleInputChange}
                    placeholder="Click 'Choose from Gallery' or paste URL"
                    readOnly
                  />
                  <Button
                    className="btn-secondary"
                    onClick={() => setIsGalleryOpen(true)}
                  >
                    Choose from Gallery
                  </Button>
                </div>
              </div>
              {previewUrl && (
                <div className="mt-2 p-2 border rounded-md w-32">
                  <p className="text-sm text-gray-500 mb-1">Preview:</p>
                  {previewUrl.includes(".mp4") ||
                  previewUrl.includes(".webm") ? (
                    <video
                      src={previewUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="max-h-40 object-contain mx-auto"
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-40 object-contain mx-auto"
                    />
                  )}
                </div>
              )}
              <textarea
                className="textarea textarea-bordered h-32 bg-white w-full"
                name="description"
                value={currentService.description}
                onChange={handleInputChange}
                placeholder="Service Description"
              />
              <select
                className="select select-bordered w-full bg-white"
                name="category"
                value={currentService.category}
                onChange={handleInputChange}
              >
                {tabs.map((tab) => (
                  <option key={tab} value={tab}>
                    {tab}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-action">
              <Button
                className="text-white bg-red-700 hover:bg-red-500"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button className="btn-primary" onClick={handleSaveService}>
                Save
              </Button>
            </div>
          </div>
        </dialog>
      )}
      {isGalleryOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-5xl bg-white">
            <h3 className="font-bold text-lg">Select Media from Gallery</h3>
            <div className="py-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 max-h-96 overflow-y-auto">
              {galleryItems.map((media) => (
                <div
                  key={media._id}
                  className="group cursor-pointer"
                  onClick={() => handleSelectFromGallery(media)}
                >
                  {media.filetype === "video" ? (
                    <video
                      src={media.url}
                      muted
                      className="w-full h-24 object-cover rounded-lg border-2 border-transparent group-hover:border-blue-500"
                    />
                  ) : (
                    <img
                      src={media.url}
                      alt={media.filename}
                      className="w-full h-24 object-cover rounded-lg border-2 border-transparent group-hover:border-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-action">
              <Button onClick={() => setIsGalleryOpen(false)}>Cancel</Button>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
};

export default Sharry326;