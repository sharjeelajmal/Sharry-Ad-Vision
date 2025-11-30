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

        {/* --- 4. MEDIA GALLERY --- */}
        <AnimatedSection>
           <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl"><ImageIcon size={24} /></div>
                      <h2 className="text-xl font-bold text-slate-900">Media Gallery</h2>
                  </div>
                  <label className={`btn bg-slate-900 text-white hover:bg-slate-800 rounded-xl border-none shadow-lg font-bold px-6 hover:scale-105 transition-all ${uploading ? "loading" : ""}`}>
                      {uploading ? "Uploading..." : "Upload New Media"}
                      <input type="file" hidden accept="image/*,video/mp4,video/webm" onChange={handleGalleryUpload} disabled={uploading} />
                  </label>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-4 max-h-80 overflow-y-auto custom-scrollbar p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  {galleryItems.map((media) => (
                    <div key={media._id} className="relative group aspect-square rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]">
                        {media.filetype === "video" ? (
                            <video src={media.url} muted className="w-full h-full object-cover" />
                        ) : (
                            <Image src={media.url} alt={media.filename} fill className="object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <button 
                                onPointerDown={(e) => {e.stopPropagation(); handleGalleryDelete(media)}} 
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg transform hover:scale-110"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                  ))}
              </div>
           </div>
        </AnimatedSection>

        {/* --- 5. SERVICE MANAGEMENT --- */}
        <AnimatedSection>
           <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl border border-slate-100">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                 <div className="flex items-center gap-3">
                     <div className="p-3 bg-green-100 text-green-600 rounded-2xl"><LayoutGrid size={24} /></div>
                     <h2 className="text-xl font-bold text-slate-900">Manage Services</h2>
                 </div>
                 
                 {/* Premium Action Buttons */}
                 <div className="flex flex-wrap gap-3">
                     {isEditingTabs ? (
                         <div className="flex gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-inner">
                            <Button size="sm" onClick={handleSaveTabs} className="bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold shadow hover:scale-105 transition-all">Save</Button>
                            <Button size="sm" onClick={() => { setIsEditingTabs(false); setEditTabs([...tabs]); }} variant="destructive" className="rounded-lg font-bold shadow hover:scale-105 transition-all">Cancel</Button>
                            <Button size="sm" onClick={handleAddTab} variant="outline" className="rounded-lg bg-white shadow hover:scale-105 transition-all"><Plus size={16}/></Button>
                         </div>
                     ) : (
                         <Button onClick={() => setIsEditingTabs(true)} variant="outline" className="rounded-xl border-slate-200 font-bold hover:bg-slate-50 text-slate-600 hover:scale-105 transition-all shadow-sm">Edit Categories</Button>
                     )}
                     
                     <Button onClick={handleAddService} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 font-bold px-6 hover:scale-105 transition-all">
                        <Plus size={18} className="mr-2" /> Add Service
                     </Button>
                     <Button onClick={handleSaveOrder} disabled={isLoading} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg font-bold px-6 hover:scale-105 transition-all">
                        {isLoading ? "Saving..." : "Save Order"}
                     </Button>
                 </div>
              </div>

              {/* Tabs & Search (Premium Input) */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 shadow-inner">
                  {isEditingTabs ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {editTabs.map((tab, index) => (
                              <div key={index} className="flex gap-2">
                                  <input type="text" value={tab} onChange={(e) => { const newTabs = [...editTabs]; newTabs[index] = e.target.value; setEditTabs(newTabs); }} className="input input-sm flex-1 rounded-lg border-slate-300 focus:ring-2 focus:ring-green-200" />
                                  <button onClick={() => setEditTabs(editTabs.filter((_, i) => i !== index))} className="p-1.5 bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-50"><X size={16}/></button>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="flex flex-wrap gap-2 justify-center mb-8">
                          {tabs.map(tab => (
                              <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg transform scale-105' : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200 hover:-translate-y-0.5 hover:shadow-sm'}`}
                              >
                                {tab}
                              </button>
                          ))}
                      </div>
                  )}
                  
                  {/* PREMIUM SEARCH BAR */}
                  <div className="relative max-w-lg mx-auto group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                      <div className="relative bg-white rounded-full flex items-center px-4 py-3 shadow-sm border border-slate-200">
                          <Search className="text-slate-400 w-5 h-5 mr-3 group-focus-within:text-blue-500" />
                          <input 
                            type="text" 
                            placeholder="Search services to edit..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-400"
                          />
                      </div>
                  </div>
              </div>

              {/* --- ADMIN CARDS (Hover Flip Premium Style) --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={orderedServices.map((s) => s._id)} strategy={verticalListSortingStrategy}>
                    {orderedServices.map((service) => (
                      <SortableServiceItem key={service._id} service={service}>
                        <div className={`group bg-white rounded-3xl p-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1 relative overflow-hidden ${service.isHidden ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
                            
                            {/* Drag Handle */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-slate-200 rounded-b-full opacity-50 cursor-grab"></div>

                            {/* Admin Controls (Visible on Hover) */}
                            <div className="absolute top-3 right-3 z-30 flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 translate-x-2 sm:group-hover:translate-x-0">
                                <button 
                                    onPointerDown={(e) => {e.stopPropagation(); handleEditService(service)}} 
                                    className="p-2 bg-white text-blue-600 rounded-xl shadow-lg border border-blue-100 hover:bg-blue-600 hover:text-white transition-colors transform hover:scale-110"
                                    title="Edit"
                                >
                                    <Edit size={16}/>
                                </button>
                                <button 
                                    onPointerDown={(e) => {e.stopPropagation(); handleToggleHide(service._id, !service.isHidden)}} 
                                    className={`p-2 bg-white rounded-xl shadow-lg border transition-colors transform hover:scale-110 ${service.isHidden ? 'text-green-600 border-green-100 hover:bg-green-600 hover:text-white' : 'text-slate-500 border-slate-100 hover:bg-slate-800 hover:text-white'}`}
                                    title={service.isHidden ? "Unhide" : "Hide"}
                                >
                                    {service.isHidden ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                                <button 
                                    onPointerDown={(e) => {e.stopPropagation(); handleDeleteService(service._id)}} 
                                    className="p-2 bg-white text-red-500 rounded-xl shadow-lg border border-red-100 hover:bg-red-500 hover:text-white transition-colors transform hover:scale-110"
                                    title="Delete"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>

                            {/* Media */}
                            <div className="h-44 w-full bg-slate-50 rounded-2xl mb-4 overflow-hidden relative group-hover:shadow-inner transition-all">
                                {(service.imageUrl && (service.imageUrl.endsWith('.mp4') || service.imageUrl.endsWith('.webm'))) 
                                    ? <video src={service.imageUrl} muted className="w-full h-full object-cover" />
                                    : <Image src={service.imageUrl || '/placeholder.png'} alt={service.title} fill className="object-cover" />
                                }
                                {service.serviceId && (
                                    <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                                        #{service.serviceId}
                                    </span>
                                )}
                            </div>
                            
                            <div className="space-y-2 px-1">
                                <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg shadow-sm">
                                        {convertPrice(service.price)} {selectedCurrency}
                                    </p>
                                    {service.isHidden && <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-1 rounded-lg">HIDDEN</span>}
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

      {/* --- ADD/EDIT MODAL (Styled) --- */}
      {isModalOpen && (
        <dialog open className="modal modal-open z-[9999]">
          <div className="modal-box max-w-3xl bg-white rounded-[2.5rem] p-8 shadow-2xl border border-white/50">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="font-bold text-2xl text-slate-900">
                  {currentService._id ? "Edit Service" : "Add New Service"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Title</label>
                        <input type="text" name="title" value={currentService.title} onChange={handleInputChange} className="input w-full bg-slate-50 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Service Name" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Service ID</label>
                        <input type="text" name="serviceId" value={currentService.serviceId} onChange={handleInputChange} className="input w-full bg-slate-50 border-slate-200 rounded-xl" placeholder="ID (Optional)" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Price</label>
                            <input type="number" name="price" value={currentService.price} onChange={handleInputChange} className="input w-full bg-slate-50 border-slate-200 rounded-xl" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Quantity</label>
                            <input type="text" name="quantity" value={currentService.quantity} onChange={handleInputChange} className="input w-full bg-slate-50 border-slate-200 rounded-xl" placeholder="1k" />
                        </div>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Category</label>
                        <select name="category" value={currentService.category} onChange={handleInputChange} className="select w-full bg-slate-50 border-slate-200 rounded-xl custom-select">
                            {tabs.map(tab => <option key={tab} value={tab}>{tab}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Media</label>
                        <div className="flex gap-2">
                            <input type="text" name="imageUrl" value={currentService.imageUrl} onChange={handleInputChange} className="input flex-1 bg-slate-50 border-slate-200 rounded-xl text-xs" placeholder="URL" />
                            <Button onClick={() => setIsGalleryOpen(true)} variant="outline" className="bg-white border-slate-200 rounded-xl shadow-sm">Gallery</Button>
                        </div>
                        {previewUrl && (
                            <div className="mt-2 h-24 w-full bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200 shadow-inner">
                                {(previewUrl.endsWith('.mp4') || previewUrl.endsWith('.webm')) 
                                    ? <video src={previewUrl} muted className="w-full h-full object-cover" />
                                    : <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="mb-8">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description</label>
                <textarea name="description" value={currentService.description} onChange={handleInputChange} className="textarea w-full h-32 bg-slate-50 border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Service Details..."></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-500 rounded-xl hover:bg-slate-100 font-bold">Cancel</Button>
                <Button onClick={handleSaveService} className="bg-slate-900 text-white rounded-xl px-8 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">Save Service</Button>
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