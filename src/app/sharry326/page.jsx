"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";

// Updated helper function to notify clients with a detailed payload
const notifyClients = async (payload) => {
  try {
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Notification failed:", error);
  }
};

const countryCurrencyMap = {
  PK: "PKR",
  US: "USD",
  IN: "INR",
  AE: "AED",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
};

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

const Sharry326 = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [orderedServices, setOrderedServices] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [conversionRates, setConversionRates] = useState({ PKR: 1 });
  const [selectedCurrency, setSelectedCurrency] = useState("PKR");
  const [activeTab, setActiveTab] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentService, setCurrentService] = useState({
    title: "",
    description: "",
    price: 0,
    quantity: "",
    imageUrl: "",
    category: "",
    serviceId: "",
    isHidden: false,
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const [isEditingTabs, setIsEditingTabs] = useState(false);
  const [editTabs, setEditTabs] = useState([]);
  const [isEditingCurrencies, setIsEditingCurrencies] = useState(false);
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [uploading, setUploading] = useState(false);
  const videoRefs = useRef({});

  const pkrRegex = /(\d{1,3}(?:,?\d{3})*|\d+)\s*PKR/gi;

  const fetchUserLocation = useCallback(async () => {
    const cachedCountryCode = sessionStorage.getItem("userCountryCode");
    if (cachedCountryCode) return cachedCountryCode;
    try {
      const geoResponse = await fetch("/api/get-user-location");
      const data = await geoResponse.json();
      if (data?.countryCode) {
        sessionStorage.setItem("userCountryCode", data.countryCode);
        return data.countryCode;
      }
      return "PK";
    } catch (error) {
      console.error("Could not fetch user location, defaulting to PK.", error);
      return "PK";
    }
  }, []);

  const fetchAllInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/initial-data");
      if (!response.ok)
        throw new Error(`Data load failed: ${response.statusText}`);

      const data = await response.json();
      setServices(data.services || []);
      const serviceTabs = data.tabs || [];
      setTabs(serviceTabs);
      setEditTabs([...serviceTabs]);
      setWhatsappNumber(data.settings?.whatsappNumber || "");
      setGalleryItems(data.gallery || []);

      const fetchedCurrencies = data.currencies || [];
      const rates = fetchedCurrencies.reduce(
        (acc, curr) => {
          acc[curr.code] = curr.rate;
          return acc;
        },
        { PKR: 1 }
      );
      setConversionRates(rates);

      const userCountryCode = await fetchUserLocation();
      const preferredCurrency = countryCurrencyMap[userCountryCode] || "PKR";
      if (fetchedCurrencies.some((c) => c.code === preferredCurrency)) {
        setSelectedCurrency(preferredCurrency);
      } else if (fetchedCurrencies.length > 0) {
        setSelectedCurrency(fetchedCurrencies[0].code || "PKR");
      }

      setActiveTab((prevTab) => {
        if (prevTab && serviceTabs.includes(prevTab)) return prevTab;
        return serviceTabs.length > 0 ? serviceTabs[0] : "";
      });
    } catch (error) {
      toast.error(`Data load karne mein masla: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserLocation]);

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
      return;
    }
    if (!session) {
      router.replace("/admin-login");
      return;
    }
    if (session) {
      setIsClient(true);
      fetchAllInitialData();

      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      });

      const channel = pusher.subscribe("updates-channel");

      // This is the updated, smarter Pusher listener
      channel.bind("service-update", function (data) {
        // Ignore updates sent by the current user to avoid double processing
        if (data.senderId === session.user.id) {
          return;
        }

        console.log("Real-time update received from another client:", data);
        toast("Page updated automatically!", { icon: "🔄", duration: 2000 });

        switch (data.type) {
          case "SERVICE_CREATED":
            setServices((prev) => [...prev, data.payload]);
            break;
          case "SERVICE_UPDATED":
            setServices((prev) =>
              prev.map((s) => (s._id === data.payload._id ? data.payload : s))
            );
            break;
          case "SERVICE_DELETED":
            setServices((prev) =>
              prev.filter((s) => s._id !== data.payload.id)
            );
            break;
          case "ORDER_UPDATED":
            setServices(data.payload);
            break;
          case "TABS_UPDATED":
            setTabs(data.payload);
            setEditTabs([...data.payload]);
            break;
          case "GALLERY_UPDATED":
            setGalleryItems(data.payload);
            break;
          case "SETTINGS_UPDATED":
            if (data.payload.whatsappNumber) {
              setWhatsappNumber(data.payload.whatsappNumber);
            }
            break;
          default:
            console.log(
              "Unknown update type, refetching all data as a fallback."
            );
            fetchAllInitialData();
            break;
        }
      });

      return () => {
        pusher.unsubscribe("updates-channel");
        pusher.disconnect();
      };
    }
  }, [session, status, router, fetchAllInitialData]);

  const filterServices = useCallback(() => {
    if (!services || !activeTab) return;
    let tempFiltered = [];
    if (activeTab.toLowerCase() === "offers") {
      tempFiltered = services.filter((service) =>
        service.title.toLowerCase().includes("offer")
      );
    } else {
      tempFiltered = services.filter(
        (service) =>
          (service.category || "").toLowerCase() === activeTab.toLowerCase()
      );
    }
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFiltered = tempFiltered.filter(
        (service) =>
          service.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          service.description.toLowerCase().includes(lowerCaseSearchTerm) ||
          (service.serviceId &&
            service.serviceId.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    setOrderedServices(
      tempFiltered.sort((a, b) => a.orderIndex - b.orderIndex)
    );
  }, [services, activeTab, searchTerm]);

  useEffect(() => {
    filterServices();
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
      convertedDesc = convertedDesc.replace(pkrRegex, (match, p1) => {
        const numericValue = parseFloat(p1.replace(/,/g, ""));
        if (isNaN(numericValue)) return match;
        return `${convertPrice(numericValue)} ${selectedCurrency}`;
      });
      return convertedDesc;
    },
    [convertPrice, selectedCurrency, pkrRegex]
  );

  const handleIdClick = (id) => {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        toast.success(`ID "${id}" copied to clipboard!`);
      })
      .catch((err) => {
        toast.error("Failed to copy ID.");
        console.error("Could not copy text: ", err);
      });
  };

  const handleSaveService = async () => {
    if (
      !currentService.title ||
      !currentService.description ||
      !currentService.category
    ) {
      toast.error("Title, Description, aur Category zaroori hain.");
      return;
    }

    const isEditing = !!currentService._id;
    const originalServices = [...services];
    const tempId = `temp_${Date.now()}`;

    // Optimistic Update
    if (isEditing) {
      setServices((prev) =>
        prev.map((s) => (s._id === currentService._id ? currentService : s))
      );
    } else {
      setServices((prev) => [...prev, { ...currentService, _id: tempId }]);
    }
    setIsModalOpen(false);
    setPreviewUrl("");

    try {
      const response = await fetch(
        isEditing ? `/api/services?id=${currentService._id}` : "/api/services",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentService),
        }
      );
      const savedService = await response.json();
      if (!response.ok)
        throw new Error(savedService.details || "Service save nahi ho saki.");

      // Finalize state with server data
      if (isEditing) {
        setServices((prev) =>
          prev.map((s) => (s._id === savedService._id ? savedService : s))
        );
      } else {
        setServices((prev) =>
          prev.map((s) => (s._id === tempId ? savedService : s))
        );
      }

      toast.success("Service save ho gayi!");
      notifyClients({
        type: isEditing ? "SERVICE_UPDATED" : "SERVICE_CREATED",
        payload: savedService,
        senderId: session.user.id,
      });
    } catch (error) {
      setServices(originalServices); // Rollback on error
      toast.error(`Save failed: ${error.message}`);
    }
  };

  const handleDeleteService = async (id) => {
    if (confirm("Are you sure you want to delete this service?")) {
      const originalServices = [...services];
      setServices((prev) => prev.filter((s) => s._id !== id)); // Optimistic delete

      try {
        const response = await fetch(`/api/services?id=${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Service delete nahi ho saki");

        toast.success("Service deleted!");
        notifyClients({
          type: "SERVICE_DELETED",
          payload: { id },
          senderId: session.user.id,
        });
      } catch (error) {
        setServices(originalServices); // Rollback
        toast.error(error.message);
      }
    }
  };

  const handleToggleHide = async (id, isHidden) => {
    const originalServices = [...services];
    setServices((prev) =>
      prev.map((s) => (s._id === id ? { ...s, isHidden } : s))
    ); // Optimistic toggle

    try {
      const response = await fetch(`/api/services?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden }),
      });
      const updatedService = await response.json();
      if (!response.ok) throw new Error("Status update failed");

      setServices((prev) =>
        prev.map((s) => (s._id === id ? updatedService : s))
      ); // Finalize with server data
      toast.success(`Service ${isHidden ? "hidden" : "unhidden"}!`);
      notifyClients({
        type: "SERVICE_UPDATED",
        payload: updatedService,
        senderId: session.user.id,
      });
    } catch (error) {
      setServices(originalServices); // Rollback
      toast.error(error.message);
    }
  };

  const handleSaveTabs = async () => {
    const originalTabs = [...tabs];
    setTabs(editTabs);
    setIsEditingTabs(false);

    try {
      const response = await fetch("/api/tabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editTabs),
      });
      const savedTabs = await response.json();
      if (!response.ok) throw new Error("Failed to save tabs");

      setTabs(savedTabs); // Finalize with server data
      toast.success("Tabs saved!");
      notifyClients({
        type: "TABS_UPDATED",
        payload: savedTabs,
        senderId: session.user.id,
      });
    } catch (error) {
      setTabs(originalTabs); // Rollback
      setIsEditingTabs(true);
      toast.error(error.message);
    }
  };

  const handleAddService = () => {
    setCurrentService({
      title: "",
      description: "",
      price: 0,
      quantity: "",
      imageUrl: "",
      category: activeTab || tabs[0] || "",
      serviceId: "",
      isHidden: false,
    });
    setPreviewUrl("");
    setIsModalOpen(true);
  };

  const handleEditService = (service) => {
    setCurrentService({ ...service, price: parseFloat(service.price) || 0 });
    setPreviewUrl(service.imageUrl);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentService((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
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
    const originalServices = [...services];

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
      const updatedServices = await response.json();

      setServices(updatedServices); // Update with final ordered list
      toast.success("Order saved!");
      notifyClients({
        type: "ORDER_UPDATED",
        payload: updatedServices,
        senderId: session.user.id,
      });
    } catch (error) {
      setServices(originalServices); // Rollback
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading('Uploading, please wait...');

    try {
      // API endpoint ko filename ke saath call karein
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
        },
        body: file, // Ab FormData ki zaroorat nahi, direct file bhejein
      });

      const newMediaData = await response.json();
      if (!response.ok) {
        throw new Error(newMediaData.details || 'File upload nakaam ho gaya');
      }

      // Gallery state ko update karein
      const updatedGallery = [newMediaData.media, ...galleryItems];
      setGalleryItems(updatedGallery);
      
      toast.dismiss(toastId);
      toast.success('File gallery mein upload ho gayi!');

      // Doosre clients ko notify karein (agar zaroori hai)
      if (typeof notifyClients === 'function') {
          notifyClients({
            type: 'GALLERY_UPDATED',
            payload: updatedGallery,
            senderId: session.user.id,
          });
      }

    } catch (error) {
      toast.dismiss(toastId);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      // Reset the file input so the same file can be selected again
      e.target.value = null; 
    }
  };

  const handleGalleryDelete = async (media) => {
    if (confirm(`Are you sure you want to delete ${media.filename}?`)) {
      const originalGallery = [...galleryItems];
      const updatedGallery = galleryItems.filter(
        (item) => item._id !== media._id
      );
      setGalleryItems(updatedGallery); // Optimistic delete

      try {
        const response = await fetch("/api/gallery", {
          // Corrected API endpoint
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: media._id, url: media.url }),
        });
        if (!response.ok) throw new Error("Failed to delete media");

        toast.success("Media deleted!");
        notifyClients({
          type: "GALLERY_UPDATED",
          payload: updatedGallery,
          senderId: session.user.id,
        });
      } catch (error) {
        setGalleryItems(originalGallery); // Rollback
        toast.error(error.message);
      }
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
      notifyClients({
        type: "SETTINGS_UPDATED",
        payload: { whatsappNumber },
        senderId: session.user.id,
      });
    } catch (error) {
      toast.dismiss();
      toast.error(error.message);
    }
  };

  const handleSelectFromGallery = (media) => {
    setCurrentService((prev) => ({ ...prev, imageUrl: media.url }));
    setPreviewUrl(media.url);
    setIsGalleryOpen(false);
  };

  const handleAddTab = () => setEditTabs([...editTabs, ""]);

  if (!isClient || isLoading || status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Image
          src="/loader326.gif"
          alt="loading"
          width={140}
          height={140}
          unoptimized
        />
      </div>
    );
  }

  return (
    <section className="mb-10 px-4">
      <div className="px-4 mt-4 sm:px-6 py-4 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full sm:w-auto">
          {session && (
            <p className="text-gray-800 text-base font-medium">
              Welcome,{" "}
              <span className="text-indigo-600 font-semibold break-words">
                {session.user?.email}
              </span>
            </p>
          )}
        </div>
        <div className="w-full sm:w-auto">
          <Button
            onClick={() => signOut()}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-md transition-colors duration-200"
          >
            Sign Out
          </Button>
        </div>
      </div>

      <div className="my-8 px-4 py-6 sm:px-6 lg:px-8 border border-gray-200 bg-white rounded-lg shadow-sm w-full max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
          Popup Messages
        </h2>
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

      <div className="my-8 p-4 border rounded-lg max-w-7xl mx-auto">
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
                <Image
                  src={media.url}
                  alt={media.filename}
                  className="w-full h-32 object-cover"
                  width={128}
                  height={128}
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
          notifyClients={notifyClients}
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
                  onClick={() => setActiveTab(tab)}
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
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Order"}
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
                  <div
                    className={`group relative hover:scale-105 transition-all border p-3 rounded-lg max-w-xs mx-auto ${
                      service.isHidden ? "opacity-50 bg-gray-100" : ""
                    }`}
                  >
                    {service.serviceId && (
                      <span
                        onClick={() => handleIdClick(service.serviceId)}
                        className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full z-10 cursor-pointer hover:bg-blue-700 transition-colors"
                      >
                        ID: {service.serviceId}
                      </span>
                    )}
                    <div className="relative h-40 w-full mb-3">
                      {service.imageUrl &&
                      (service.imageUrl.endsWith(".mp4") ||
                        service.imageUrl.endsWith(".webm")) ? (
                        <video
                          ref={(el) => (videoRefs.current[service._id] = el)}
                          src={service.imageUrl}
                          loop
                          muted
                          playsInline
                          className="object-contain h-full w-full"
                          onMouseEnter={() =>
                            videoRefs.current[service._id]?.play()
                          }
                          onMouseLeave={() => {
                            if (videoRefs.current[service._id]) {
                              videoRefs.current[service._id].pause();
                              videoRefs.current[service._id].currentTime = 0;
                            }
                          }}
                          preload="metadata"
                        />
                      ) : (
                        <Image
                          src={service.imageUrl || "/placeholder.png"}
                          alt={service.title}
                          width={200}
                          height={160}
                          className="object-contain h-full w-full"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <h2 className="font-bold text-xl mt-2 text-center">
                      {service.title}
                    </h2>
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
                  <div className="flex justify-center mt-4 space-x-2 flex-wrap gap-2">
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
                    <button
                      className={`btn btn-sm text-white ${
                        service.isHidden ? "bg-green-500" : "bg-yellow-500"
                      }`}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleToggleHide(service._id, !service.isHidden);
                      }}
                    >
                      {service.isHidden ? "Unhide" : "Hide"}
                    </button>
                  </div>
                </AnimatedSection>
              </SortableServiceItem>
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {isModalOpen && (
        <dialog open className="modal modal-open z-50">
          <div className="modal-box max-w-3xl bg-white">
            <h3 className="font-bold text-lg">
              {currentService._id ? "Edit Service" : "Add New Service"}
            </h3>
            <div className="py-4 space-y-4">
              <input
                type="text"
                className="input input-bordered w-full bg-white"
                name="serviceId"
                value={currentService.serviceId || ""}
                onChange={handleInputChange}
                placeholder="Service ID (e.g., TIK101)"
              />
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
        <dialog open className="modal modal-open z-[51]">
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
