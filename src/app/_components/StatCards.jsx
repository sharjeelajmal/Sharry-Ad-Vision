"use client";
import { useEffect, useState } from "react";
import { Users, ShoppingCart, Image, Code } from "lucide-react";
import { toast } from "react-hot-toast";

const iconMap = {
  Users: <Users className="h-6 w-6 text-white" />,
  Orders: <ShoppingCart className="h-6 w-6 text-white" />,
  "Designs Delivered": <Image className="h-6 w-6 text-white" />,
  "Websites Built": <Code className="h-6 w-6 text-white" />,
};

export default function StatsCards({ isAdmin = false, isEditing, setIsEditing, notifyClients, statsData }) {
  const [stats, setStats] = useState([]);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    const processStats = (data) => {
      const dataWithIcons = data.map(item => ({
        ...item,
        icon: iconMap[item.label] || <Users className="h-6 w-6 text-white" />,
      }));
      setStats(dataWithIcons);
      const initialValues = dataWithIcons.reduce((acc, stat) => ({
        ...acc,
        [stat.label]: stat.value
      }), {});
      setEditValues(initialValues);
    };

    if (isAdmin) {
      // Admin panel apne data khud fetch karega
      const fetchStats = async () => {
        try {
          const response = await fetch('/api/stats');
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          processStats(data);
        } catch (error) {
          console.error("Error fetching stats:", error);
          toast.error("Failed to load stats.");
        }
      };
      fetchStats();
    } else if (statsData) {
      // Client page ko data prop se milega
      processStats(statsData);
    }
  }, [isAdmin, statsData]);

  const handleSaveClick = async () => {
    const updatedStatsPayload = stats.map(stat => ({
      label: stat.label,
      value: editValues[stat.label] || stat.value
    }));

    try {
      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStatsPayload)
      });
      if (!response.ok) throw new Error((await response.json()).details || "Failed to save stats");

      const savedStats = await response.json();
      const savedStatsWithIcons = savedStats.map(item => ({
        ...item,
        icon: iconMap[item.label] || <Users className="h-6 w-6 text-white" />,
      }));
      setStats(savedStatsWithIcons);
      setIsEditing(false);
      toast.success("Stats saved successfully!");
      if (notifyClients) notifyClients(); // Signal bhejein
    } catch (error) {
      toast.error(`Failed to save stats: ${error.message}`);
    }
  };

  const handleInputChange = (label, value) => {
    setEditValues(prev => ({ ...prev, [label]: value }));
  };

  return (
    <div className="py-4 px-4 flex flex-col items-center justify-center">
      {isAdmin && (
        <div className="flex space-x-2 mb-4">
          {isEditing ? (
            <>
              <button className="btn btn-sm btn-success text-white" onClick={handleSaveClick}>Save Stats</button>
              <button className="btn btn-sm btn-error text-white" onClick={() => setIsEditing(false)}>Cancel</button>
            </>
          ) : (
            <button className="btn btn-sm btn-primary text-white" onClick={() => setIsEditing(true)}>Edit Stats</button>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-opacity-30 bg-white p-2 rounded-full">{stat.icon}</div>
              <span className="text-lg font-semibold">{stat.label}</span>
            </div>
            {isEditing && isAdmin ? (
              <input
                type="text"
                className="input input-sm w-20 text-center text-black bg-white mt-2"
                value={editValues[stat.label] || ''}
                onChange={(e) => handleInputChange(stat.label, e.target.value)}
              />
            ) : (
              <div className="text-xl font-bold mt-2">{stat.value}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
