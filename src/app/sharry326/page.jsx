"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import StatsCards from "../_components/StatCards";
import CurrencySelector from "../_components/CurrencySelector";
import AnimatedSection from "../_components/AnimatedSection";
import NotificationPopup from "../_components/Alertmesage.jsx";
import DigitalAgencyLoader from "../_components/DigitalAgencyLoader";
import { toast } from "react-hot-toast";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";
import confetti from "canvas-confetti";
import { gsap } from "gsap";
// Icons imports
import { Settings, LayoutGrid, Image as ImageIcon, MessageSquare, LogOut, Plus, Save, Trash2, Eye, EyeOff, Edit, Search, X, Hash, ChevronDown } from "lucide-react";

// Helper: Trigger Confetti
const triggerCelebration = () => {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#1E40AF', '#FFD700', '#10B981']
  });
};



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
  PK: "PKR", US: "USD", IN: "INR", AE: "AED", GB: "GBP", DE: "EUR", FR: "EUR",
};

function SortableServiceItem({ service, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: service._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    touchAction: "none"
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

// --- HELPER: PREMIUM CUSTOM DROPDOWN ---
const CustomDropdown = ({ options, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // GSAP Animation for Menu
  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(listRef.current, 
        { y: -10, opacity: 0, scale: 0.95, display: "none" },
        { y: 0, opacity: 1, scale: 1, display: "block", duration: 0.3, ease: "back.out(1.7)" }
      );
    } else if (listRef.current) {
      gsap.to(listRef.current, { 
        y: -10, opacity: 0, scale: 0.95, duration: 0.2, ease: "power2.in", 
        onComplete: () => gsap.set(listRef.current, { display: "none" }) 
      });
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">{label}</label>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm px-4 py-3.5 rounded-xl transition-all duration-300 ${isOpen ? 'ring-2 ring-blue-500/20 border-blue-500 shadow-md' : 'hover:border-blue-300 hover:bg-white'}`}
      >
        <span className="truncate">{value || "Select Category"}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-500" : ""}`} />
      </button>

      {/* Dropdown List */}
      <div ref={listRef} className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl shadow-blue-900/10 overflow-hidden hidden origin-top">
        <div className="max-h-48 overflow-y-auto custom-scrollbar p-1.5">
          {options.map((option) => (
            <div 
              key={option} 
              onClick={() => { onChange(option); setIsOpen(false); }}
              className={`px-3 py-2.5 rounded-lg text-sm font-bold cursor-pointer flex items-center justify-between transition-all group ${value === option ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              {option}
              {value === option && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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
    title: "", description: "", price: 0, quantity: "", imageUrl: "", category: "", serviceId: "", isHidden: false,
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
      return "PK";
    }
  }, []);

  const fetchAllInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/initial-data");
      if (!response.ok) throw new Error(`Data load failed: ${response.statusText}`);

      const data = await response.json();
      setServices(data.services || []);
      const serviceTabs = data.tabs || [];
      setTabs(serviceTabs);
      setEditTabs([...serviceTabs]);
      setWhatsappNumber(data.settings?.whatsappNumber || "");
      setGalleryItems(data.gallery || []);

      const fetchedCurrencies = data.currencies || [];
      const rates = fetchedCurrencies.reduce((acc, curr) => { acc[curr.code] = curr.rate; return acc; }, { PKR: 1 });
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
      toast.error(`Data error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserLocation]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.replace("/admin-login"); return; }
    
    setIsClient(true);
    fetchAllInitialData();

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER });
    const channel = pusher.subscribe("updates-channel");

    channel.bind("service-update", function (data) {
      if (data.senderId === session.user.id) return;
      toast("Syncing updates...", { icon: "🔄" });
      fetchAllInitialData();
    });

    return () => {
      pusher.unsubscribe("updates-channel");
      pusher.disconnect();
    };
  }, [session, status, router, fetchAllInitialData]);

  const filterServices = useCallback(() => {
    if (!services || !activeTab) return;
    let tempFiltered = [];
    if (activeTab.toLowerCase() === "offers") {
      tempFiltered = services.filter((service) => service.title.toLowerCase().includes("offer"));
    } else {
      tempFiltered = services.filter((service) => (service.category || "").toLowerCase() === activeTab.toLowerCase());
    }
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFiltered = tempFiltered.filter(
        (service) =>
          service.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          service.description.toLowerCase().includes(lowerCaseSearchTerm) ||
          (service.serviceId && service.serviceId.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    setOrderedServices(tempFiltered.sort((a, b) => a.orderIndex - b.orderIndex));
  }, [services, activeTab, searchTerm]);

  useEffect(() => { filterServices(); }, [services, activeTab, searchTerm, filterServices]);

  const convertPrice = useCallback((price) => {
      const rate = conversionRates[selectedCurrency] || 1;
      let converted = price * rate;
      return converted % 1 === 0 ? converted.toFixed(0) : converted.toFixed(2);
    }, [conversionRates, selectedCurrency]
  );

  const handleIdClick = (id) => {
    navigator.clipboard.writeText(id).then(() => toast.success("ID Copied!"));
  };

  const handleSaveService = async () => {
    if (!currentService.title || !currentService.description || !currentService.category) {
      toast.error("Fields required!");
      return;
    }
    const isEditing = !!currentService._id;
    const originalServices = [...services];
    const tempId = `temp_${Date.now()}`;

    if (isEditing) {
      setServices((prev) => prev.map((s) => (s._id === currentService._id ? currentService : s)));
    } else {
      setServices((prev) => [...prev, { ...currentService, _id: tempId }]);
    }
    setIsModalOpen(false);

    try {
      const response = await fetch(isEditing ? `/api/services?id=${currentService._id}` : "/api/services", {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentService),
        }
      );
      const savedService = await response.json();
      if (!response.ok) throw new Error(savedService.details || "Save failed.");

      if (isEditing) {
        setServices((prev) => prev.map((s) => (s._id === savedService._id ? savedService : s)));
      } else {
        setServices((prev) => prev.map((s) => (s._id === tempId ? savedService : s)));
      }
      
      triggerCelebration();
      toast.success("Service Saved!");
      notifyClients({ type: isEditing ? "SERVICE_UPDATED" : "SERVICE_CREATED", payload: savedService, senderId: session.user.id });
    } catch (error) {
      setServices(originalServices);
      toast.error(error.message);
    }
  };

  const handleDeleteService = async (id) => {
    if (confirm("Delete service?")) {
      const originalServices = [...services];
      setServices((prev) => prev.filter((s) => s._id !== id));

      try {
        const response = await fetch(`/api/services?id=${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed");
        triggerCelebration();
        toast.success("Deleted!");
        notifyClients({ type: "SERVICE_DELETED", payload: { id }, senderId: session.user.id });
      } catch (error) {
        setServices(originalServices);
        toast.error(error.message);
      }
    }
  };

  const handleToggleHide = async (id, isHidden) => {
    const originalServices = [...services];
    setServices((prev) => prev.map((s) => (s._id === id ? { ...s, isHidden } : s)));

    try {
      const response = await fetch(`/api/services?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden }),
      });
      const updatedService = await response.json();
      if (!response.ok) throw new Error("Failed");

      setServices((prev) => prev.map((s) => (s._id === id ? updatedService : s)));
      triggerCelebration();
      toast.success(`Service ${isHidden ? "Hidden" : "Visible"}!`);
      notifyClients({ type: "SERVICE_UPDATED", payload: updatedService, senderId: session.user.id });
    } catch (error) {
      setServices(originalServices);
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
      if (!response.ok) throw new Error("Failed");
      setTabs(savedTabs);
      triggerCelebration();
      toast.success("Categories Saved!");
      notifyClients({ type: "TABS_UPDATED", payload: savedTabs, senderId: session.user.id });
    } catch (error) {
      setTabs(originalTabs);
      setIsEditingTabs(true);
      toast.error(error.message);
    }
  };

  const handleAddService = () => {
    setCurrentService({ title: "", description: "", price: 0, quantity: "", imageUrl: "", category: activeTab || tabs[0] || "", serviceId: "", isHidden: false });
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
    setCurrentService((prev) => ({ ...prev, [name]: name === "price" ? parseFloat(value) || 0 : value }));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setOrderedServices((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveOrder = async () => {
    setIsLoading(true);
    const originalServices = [...services];
    try {
      const orderPayload = orderedServices.map((service, index) => ({ id: service._id, orderIndex: index }));
      const response = await fetch("/api/services/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      if (!response.ok) throw new Error("Failed");
      const updatedServices = await response.json();
      setServices(updatedServices);
      triggerCelebration();
      toast.success("Order Saved!");
      notifyClients({ type: "ORDER_UPDATED", payload: updatedServices, senderId: session.user.id });
    } catch (error) {
      setServices(originalServices);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const toastId = toast.loading('Uploading...');

    try {
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const newMediaData = await response.json();
      if (!response.ok) throw new Error('Failed');
      const updatedGallery = [newMediaData.media, ...galleryItems];
      setGalleryItems(updatedGallery);
      toast.dismiss(toastId);
      triggerCelebration();
      toast.success('Uploaded!');
      notifyClients({ type: 'GALLERY_UPDATED', payload: updatedGallery, senderId: session.user.id });
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = null; 
    }
  };

 const handleGalleryDelete = async (media) => {
    if (confirm(`Delete ${media.filename}?`)) {
      const originalGallery = [...galleryItems];
      setGalleryItems(galleryItems.filter((item) => item._id !== media._id));
      try {
        const response = await fetch("/api/api/gallery", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: media._id, url: media.url }),
        });
        if (!response.ok) throw new Error("Failed");
        triggerCelebration();
        toast.success("Deleted!");
        notifyClients({ type: "GALLERY_UPDATED", payload: galleryItems.filter((item) => item._id !== media._id), senderId: session.user.id });
      } catch (error) {
        setGalleryItems(originalGallery);
        toast.error(error.message);
      }
    }
  };

  const handleSaveSettings = async () => {
    if (!whatsappNumber) { toast.error("Enter number"); return; }
    toast.loading("Saving...");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.dismiss();
      triggerCelebration();
      toast.success("Saved!");
      notifyClients({ type: "SETTINGS_UPDATED", payload: { whatsappNumber }, senderId: session.user.id });
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
      <div className="flex justify-center items-center h-screen bg-slate-50">
         <DigitalAgencyLoader />
      </div>
    );
  }

  return (
    // FIX: Increased Top Padding (pt-32) to avoid header overlap
    <section className="min-h-screen bg-slate-50 p-4 sm:p-8 pt-32 lg:pt-36">
      
      {/* --- 1. DASHBOARD HEADER (Premium Gradient) --- */}
      <AnimatedSection>
        <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-[1.5rem] shadow-xl border border-slate-100 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          <div className="relative z-10 text-center sm:text-left">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
            {session && <p className="text-slate-500 text-sm mt-1 font-medium">Logged in as <span className="text-blue-600 font-bold">{session.user?.email}</span></p>}
          </div>
          <Button onClick={() => signOut()} className="relative z-10 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-100 rounded-xl shadow-sm font-bold px-6 h-11 hover:scale-105 transition-all">
            <LogOut size={18} className="mr-2" /> Sign Out
          </Button>
        </div>
      </AnimatedSection>

      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* --- 2. POPUP MANAGER --- */}
        <AnimatedSection>
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl border border-slate-100">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><MessageSquare size={24} /></div>
                <h2 className="text-xl font-bold text-slate-900">Popup Management</h2>
             </div>
             <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <NotificationPopup isAdmin={true} galleryItems={galleryItems} setGalleryItems={setGalleryItems} />
             </div>
          </div>
        </AnimatedSection>

        {/* --- 3. SETTINGS & STATS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Global Settings */}
           <AnimatedSection>
             <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 h-full">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><Settings size={24} /></div>
                    <h2 className="text-xl font-bold text-slate-900">Global Settings</h2>
                </div>
                
                <div className="space-y-6">
                   <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">WhatsApp Number</label>
                      <div className="flex gap-3">
                          <input 
                            type="text" 
                            value={whatsappNumber} 
                            onChange={(e) => setWhatsappNumber(e.target.value)} 
                            className="input flex-1 bg-slate-50 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 font-medium text-slate-700"
                            placeholder="923001234567"
                          />
                          <Button onClick={handleSaveSettings} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-amber-200 font-bold px-6 hover:scale-105 transition-all">Save</Button>
                      </div>
                   </div>
                   
                   {selectedCurrency && (
                      <div>
                         <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Currency Rates</label>
                         <CurrencySelector 
                            selectedCurrency={selectedCurrency} 
                            setSelectedCurrency={setSelectedCurrency} 
                            conversionRates={conversionRates} 
                            setConversionRates={setConversionRates} 
                            isAdmin={true} 
                            isEditing={isEditingCurrencies} 
                            setIsEditing={setIsEditingCurrencies} 
                            notifyClients={notifyClients}
                         />
                      </div>
                   )}
                </div>
             </div>
           </AnimatedSection>

           {/* Live Stats Editor */}
           <AnimatedSection>
              <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 h-full">
                 <h2 className="text-xl font-bold text-slate-900 mb-6">Live Stats Editor</h2>
                 <StatsCards isAdmin={true} isEditing={isEditingStats} setIsEditing={setIsEditingStats} notifyClients={notifyClients} />
              </div>
           </AnimatedSection>
        </div>

      {/* --- 4. MEDIA GALLERY (PREMIUM REDESIGN) --- */}
        <AnimatedSection>
           <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 relative overflow-hidden">
              
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-50/50 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>

              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                      <div className="p-4 bg-gradient-to-br from-purple-100 to-indigo-50 text-indigo-600 rounded-2xl shadow-sm border border-purple-100">
                        <ImageIcon size={26} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Media Gallery</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Manage Your Assets</p>
                      </div>
                  </div>
                  
                  {/* Premium Upload Button */}
                  <label className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-900 px-8 py-4 text-white shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-95 ${uploading ? "opacity-70 pointer-events-none" : ""}`}>
                      <span className="relative z-10 flex items-center gap-2 font-bold text-sm tracking-wide">
                        {uploading ? (
                            <><span className="loading loading-spinner loading-xs"></span> Uploading...</>
                        ) : (
                            <>
                                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300 text-purple-400" /> 
                                Upload New Media
                            </>
                        )}
                      </span>
                      {/* Shine Effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"></div>
                      <input type="file" hidden accept="image/*,video/mp4,video/webm" onChange={handleGalleryUpload} disabled={uploading} />
                  </label>
              </div>

              {/* Gallery Grid Container */}
              <div className="relative z-10 bg-slate-50/80 rounded-[2rem] border border-slate-200 p-2 min-h-[300px]">
                  {galleryItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-72 text-slate-400">
                          <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                             <ImageIcon size={40} className="opacity-20 text-slate-900" />
                          </div>
                          <p className="font-bold text-sm">Gallery is empty.</p>
                          <p className="text-xs text-slate-400">Upload images to get started.</p>
                      </div>
                  ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 p-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {galleryItems.map((media) => (
                            <div 
                                key={media._id} 
                                className="group relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100 cursor-pointer transition-all duration-500 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:z-20"
                            >
                                {/* Media Content (Zoom Effect) */}
                                {media.filetype === "video" ? (
                                    <video src={media.url} muted className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                                ) : (
                                    <Image src={media.url} alt={media.filename} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                                )}

                                {/* Cinematic Overlay (Slide Up) */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                        <p className="text-white text-[10px] font-bold line-clamp-1 mb-3 opacity-90 tracking-wide">
                                            {media.filename}
                                        </p>
                                        
                                        {/* Action Buttons Row */}
                                        <div className="flex gap-2">
                                            <button 
                                                onPointerDown={(e) => {e.stopPropagation(); handleGalleryDelete(media)}} 
                                                className="flex-1 py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-xl shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                                            >
                                                <Trash2 size={14} className="group-hover/btn:animate-bounce" /> 
                                                <span className="text-[10px] font-bold">Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                      </div>
                  )}
              </div>
           </div>
        </AnimatedSection>

   {/* --- 5. SERVICE MANAGEMENT (PREMIUM UI) --- */}
        <AnimatedSection>
           <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 relative overflow-hidden">
              
              {/* Header Row */}
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10 relative z-10">
                 
                 {/* Title & Icon */}
                 <div className="flex items-center gap-4">
                     <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-50 text-emerald-600 rounded-2xl shadow-sm border border-green-100">
                        <LayoutGrid size={26} />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Services Hub</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Manage & Organize</p>
                     </div>
                 </div>
                 
                 {/* Action Toolbar */}
                 <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto p-1.5 bg-slate-50 border border-slate-200 rounded-2xl">
                     
                     {/* Edit Categories Toggle */}
                     {isEditingTabs ? (
                         <div className="flex gap-2 flex-1 sm:flex-none">
                            <Button size="sm" onClick={handleSaveTabs} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 h-10">Save</Button>
                            <Button size="sm" onClick={() => { setIsEditingTabs(false); setEditTabs([...tabs]); }} variant="ghost" className="flex-1 text-red-500 hover:bg-red-50 rounded-xl font-bold h-10">Cancel</Button>
                            <Button size="sm" onClick={handleAddTab} variant="outline" className="bg-white border-slate-200 text-slate-600 rounded-xl h-10 w-10 p-0 flex items-center justify-center"><Plus size={18}/></Button>
                         </div>
                     ) : (
                         <Button onClick={() => setIsEditingTabs(true)} variant="ghost" className="text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl font-bold text-xs uppercase tracking-wide h-10 px-4">
                            Edit Tabs
                         </Button>
                     )}
                     
                     <div className="w-px h-6 bg-slate-200 hidden sm:block mx-1"></div>

                     {/* Main Actions */}
                     <Button onClick={handleAddService} className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/20 font-bold px-6 h-10 transition-all hover:scale-105 active:scale-95">
                        <Plus size={16} className="mr-2 text-blue-400" /> New Service
                     </Button>
                     <Button onClick={handleSaveOrder} disabled={isLoading} className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-bold px-5 h-10 transition-all">
                        {isLoading ? "Saving..." : "Save Order"}
                     </Button>
                 </div>
              </div>

              {/* Tabs & Search Area */}
              <div className="relative mb-10 z-10">
                  {isEditingTabs ? (
                      // Edit Mode: Grid Layout for Pills
                      <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-200 border-dashed grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-300">
                          {editTabs.map((tab, index) => (
                              <div key={index} className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                  <input 
                                    type="text" 
                                    value={tab} 
                                    onChange={(e) => { const newTabs = [...editTabs]; newTabs[index] = e.target.value; setEditTabs(newTabs); }} 
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 px-2" 
                                    autoFocus={index === editTabs.length - 1}
                                  />
                                  <button onClick={() => setEditTabs(editTabs.filter((_, i) => i !== index))} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"><X size={14}/></button>
                              </div>
                          ))}
                      </div>
                  ) : (
                      // View Mode: Modern Tabs + Search
                      <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
                          
                          {/* Tabs Scroll */}
                          <div className="w-full lg:w-auto overflow-x-auto pb-2 scrollbar-hide">
                              <div className="flex gap-2">
                                {tabs.map(tab => (
                                    <button 
                                        key={tab} 
                                        onClick={() => setActiveTab(tab)}
                                        className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2
                                            ${activeTab === tab 
                                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 translate-y-[-2px]' 
                                                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700'
                                            }`}
                                    >
                                        {tab}
                                        {activeTab === tab && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>}
                                    </button>
                                ))}
                              </div>
                          </div>

                          {/* Premium Search Input */}
                          <div className="relative group w-full lg:w-72 flex-shrink-0">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                              <div className="relative bg-white rounded-xl flex items-center px-4 h-11 border border-slate-200 shadow-sm group-focus-within:border-blue-400 group-focus-within:ring-2 group-focus-within:ring-blue-50 transition-all">
                                  <Search className="text-slate-400 w-4 h-4 mr-3 group-focus-within:text-blue-500" />
                                  <input 
                                    type="text" 
                                    placeholder="Search services..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400"
                                  />
                              </div>
                          </div>
                      </div>
                  )}
              </div>

              {/* Grid Cards (Existing code logic, just wrapped properly) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10 min-h-[200px]">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={orderedServices.map((s) => s._id)} strategy={verticalListSortingStrategy}>
                    {orderedServices.map((service) => (
                      <SortableServiceItem key={service._id} service={service}>
                        <div className={`group bg-white rounded-[1.5rem] p-3 shadow-sm border transition-all duration-500 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden ${service.isHidden ? 'border-red-200 bg-red-50/20' : 'border-slate-100 hover:border-blue-100'}`}>
                            
                            {/* Drag Handle */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-200/50 rounded-b-full cursor-grab hover:bg-blue-400 transition-colors"></div>

                            {/* Floating Actions */}
                            <div className="absolute top-3 right-3 z-30 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                <button 
                                    onPointerDown={(e) => {e.stopPropagation(); handleEditService(service)}} 
                                    className="w-8 h-8 flex items-center justify-center bg-white text-blue-600 rounded-full shadow-lg border border-slate-100 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                                >
                                    <Edit size={14}/>
                                </button>
                                <button 
                                    onPointerDown={(e) => {e.stopPropagation(); handleToggleHide(service._id, !service.isHidden)}} 
                                    className={`w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg border transition-all transform hover:scale-110 ${service.isHidden ? 'text-green-600 border-green-100 hover:bg-green-600 hover:text-white' : 'text-slate-400 border-slate-100 hover:bg-slate-800 hover:text-white'}`}
                                >
                                    {service.isHidden ? <EyeOff size={14}/> : <Eye size={14}/>}
                                </button>
                                <button 
                                    onPointerDown={(e) => {e.stopPropagation(); handleDeleteService(service._id)}} 
                                    className="w-8 h-8 flex items-center justify-center bg-white text-red-500 rounded-full shadow-lg border border-slate-100 hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
                                >
                                    <Trash2 size={14}/>
                                </button>
                            </div>

                            {/* Card Media */}
                            <div className="h-40 w-full bg-slate-50 rounded-2xl mb-3 overflow-hidden relative border border-slate-100">
                                {(service.imageUrl && (service.imageUrl.endsWith('.mp4') || service.imageUrl.endsWith('.webm'))) 
                                    ? <video src={service.imageUrl} muted className="w-full h-full object-cover" />
                                    : <Image src={service.imageUrl || '/placeholder.png'} alt={service.title} fill className="object-cover" />
                                }
                                {service.serviceId && (
                                    <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur text-slate-900 text-[9px] font-extrabold px-2 py-1 rounded-md shadow-sm border border-slate-200">
                                        #{service.serviceId}
                                    </span>
                                )}
                            </div>
                            
                            {/* Card Content */}
                            <div className="px-1 space-y-2">
                                <h3 className="font-bold text-slate-900 text-sm line-clamp-1" title={service.title}>{service.title}</h3>
                                <div className="flex items-center justify-between">
                                    <div className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-md shadow-slate-900/10">
                                        {convertPrice(service.price)} <span className="text-amber-400 text-[10px] ml-0.5">{selectedCurrency}</span>
                                    </div>
                                    {service.isHidden && <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">HIDDEN</span>}
                                </div>
                            </div>

                        </div>
                      </SortableServiceItem>
                    ))}
                  </SortableContext>
                </DndContext>
              </div>

           </div>
        </AnimatedSection>

      </div>

    
{/* --- ADD/EDIT MODAL (FIXED BUTTONS) --- */}
      {isModalOpen && (
        <dialog open className="modal modal-open z-[9999] flex items-center justify-center">
          
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>

          {/* Modal Container - Flex Layout Fix */}
          <div className="modal-box w-full max-w-2xl bg-white rounded-[2.5rem] p-0 shadow-2xl border border-white overflow-hidden relative flex flex-col max-h-[90vh]">
            
            {/* 1. Header (Fixed Top) */}
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center flex-shrink-0">
                <div>
                    <h3 className="font-black text-2xl text-slate-900 tracking-tight">
                      {currentService._id ? "Edit Service" : "Create Service"}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Fill in the details below</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full border border-slate-200 transition-all shadow-sm active:scale-90">
                    <X size={20}/>
                </button>
            </div>
            
            {/* 2. Body (Scrollable Middle) */}
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                
                {/* Row 1: Title & ID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Service Title</label>
                        <input 
                            type="text" 
                            name="title" 
                            value={currentService.title} 
                            onChange={handleInputChange} 
                            className="input w-full bg-slate-50 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 text-sm h-12 transition-all shadow-sm" 
                            placeholder="e.g. Premium Followers" 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Service ID</label>
                        <div className="relative">
                            <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                            <input 
                                type="text" 
                                name="serviceId" 
                                value={currentService.serviceId} 
                                onChange={handleInputChange} 
                                className="input w-full bg-slate-50 border-slate-200 rounded-xl pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-bold text-slate-700 text-sm h-12" 
                                placeholder="1024" 
                            />
                        </div>
                    </div>
                </div>

                {/* Row 2: Price, Quantity, Category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Price ({selectedCurrency})</label>
                        <input 
                            type="number" 
                            name="price" 
                            value={currentService.price} 
                            onChange={handleInputChange} 
                            className="input w-full bg-slate-50 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 text-sm h-12" 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Quantity Info</label>
                        <input 
                            type="text" 
                            name="quantity" 
                            value={currentService.quantity} 
                            onChange={handleInputChange} 
                            className="input w-full bg-slate-50 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 text-sm h-12" 
                            placeholder="e.g. 1k" 
                        />
                    </div>
                    <div>
                        {/* CUSTOM ANIMATED DROPDOWN */}
                        <CustomDropdown 
                            label="Category"
                            options={tabs} 
                            value={currentService.category} 
                            onChange={(val) => setCurrentService(prev => ({ ...prev, category: val }))} 
                        />
                    </div>
                </div>

                {/* Row 3: Media */}
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Thumbnail Media</label>
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                name="imageUrl" 
                                value={currentService.imageUrl} 
                                onChange={handleInputChange} 
                                className="input w-full bg-slate-50 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-600 text-xs h-12 pr-20" 
                                placeholder="https://..." 
                            />
                            <Button onClick={() => setIsGalleryOpen(true)} size="sm" variant="ghost" className="absolute right-1 top-1 h-10 text-blue-600 hover:bg-blue-50 font-bold rounded-lg text-xs">
                                Gallery
                            </Button>
                        </div>
                        {/* Preview Box */}
                        <div className="w-12 h-12 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0">
                            {(previewUrl && (previewUrl.endsWith('.mp4') || previewUrl.endsWith('.webm'))) 
                                ? <video src={previewUrl} muted className="w-full h-full object-cover" />
                                : <Image src={previewUrl || '/placeholder.png'} alt="Preview" width={48} height={48} className="object-cover w-full h-full" />
                            }
                        </div>
                    </div>
                </div>

                {/* Row 4: Description */}
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Service Details</label>
                    <textarea 
                        name="description" 
                        value={currentService.description} 
                        onChange={handleInputChange} 
                        className="textarea w-full h-32 bg-slate-50 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700 text-sm resize-none custom-scrollbar p-4" 
                        placeholder="Describe features, delivery time, etc..."
                    ></textarea>
                </div>

            </div>

            {/* 3. Footer Actions (Fixed Bottom) */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm flex justify-end gap-3 flex-shrink-0 z-20">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-500 font-bold rounded-xl hover:bg-red-50 hover:text-red-600 h-12 px-6 transition-colors">
                    Cancel
                </Button>
                <Button onClick={handleSaveService} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold px-8 h-12 shadow-lg shadow-slate-900/10 hover:scale-105 transition-all flex items-center gap-2">
                    <Save size={18} />
                    {currentService._id ? "Update Service" : "Create Service"}
                </Button>
            </div>

          </div>
        </dialog>
      )}
      {/* GALLERY MODAL */}
      {isGalleryOpen && (
        <dialog open className="modal modal-open z-[10000]">
          <div className="modal-box max-w-5xl bg-white rounded-[2rem] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-slate-900">Select Media</h3>
                <button onClick={() => setIsGalleryOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
              {galleryItems.map((media) => (
                <div key={media._id} className="relative group cursor-pointer aspect-square rounded-xl overflow-hidden border-2 border-slate-100 hover:border-blue-600 transition-all shadow-sm hover:shadow-md hover:scale-[1.02]" onClick={() => handleSelectFromGallery(media)}>
                  {media.filetype === "video" ? (
                    <video src={media.url} muted className="w-full h-full object-cover" />
                  ) : (
                    <Image src={media.url} alt={media.filename} fill className="object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
};

export default Sharry326;