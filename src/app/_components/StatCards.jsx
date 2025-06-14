// src/app/_components/StatCards.jsx
import { useEffect, useState } from "react";
import { Users, ShoppingCart, Image, Code } from "lucide-react";
import { toast } from "react-hot-toast"; // Import toast

const iconMap = {
  Users: <Users className="h-6 w-6 text-white" />,
  Orders: <ShoppingCart className="h-6 w-6 text-white" />,
  "Designs Delivered": <Image className="h-6 w-6 text-white" />,
  "Websites Built": <Code className="h-6 w-6 text-white" />,
};

// isEditing aur setIsEditing props ko receive karein
export default function StatsCards({ isAdmin = false, isEditing, setIsEditing }) {
  const [stats, setStats] = useState([]); // Empty initial state, will be fetched

  // editValues state for controlled inputs during editing
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const dataWithIcons = data.map(item => ({
          ...item,
          icon: iconMap[item.label] || <Users className="h-6 w-6 text-white" />, // Fallback icon
        }));
        setStats(dataWithIcons);
        // Initialize editValues with fetched data
        const initialValues = dataWithIcons.reduce((acc, stat) => ({
          ...acc,
          [stat.label]: stat.value // Use label as key for simplicity in editing
        }), {});
        setEditValues(initialValues);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to load stats.");
      }
    };
    fetchStats();
  }, []);

  const handleEditClick = () => {
    // Parent component (`sharry326/page.jsx`) will handle `isEditingStats` state
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    // Convert editValues back to the array format expected by the API
    const updatedStatsPayload = stats.map(stat => ({
      label: stat.label,
      value: editValues[stat.label] || stat.value // Use label as key
    }));

    try {
      const response = await fetch('/api/stats', {
        method: 'POST', // POST to update all stats
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStatsPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to save stats");
      }

      const savedStats = await response.json();
      // Update the stats state with the data returned from the server
      const savedStatsWithIcons = savedStats.map(item => ({
        ...item,
        icon: iconMap[item.label] || <Users className="h-6 w-6 text-white" />,
      }));
      setStats(savedStatsWithIcons);
      setIsEditing(false); // End editing mode
      toast.success("Stats saved successfully!");
    } catch (error) {
      console.error("Error saving stats:", error);
      toast.error(`Failed to save stats: ${error.message}`);
    }
  };

  const handleInputChange = (label, value) => {
    setEditValues(prev => ({
      ...prev,
      [label]: value
    }));
  };

  return (
    <div className="py-4 px-4 flex flex-col items-center justify-center">
      {isAdmin && (
        <div className="flex space-x-2 mb-4">
          {isEditing ? (
            <>
            <button
              className="btn btn-sm btn-success"
              onClick={handleSaveClick}
              disabled={false} // Disable while saving if `isSaving` state is added
            >
              Save Stats
            </button>
            <button
              className="btn btn-sm btn-error"
              onClick={() => setIsEditing(false)} // Cancel editing
            >
              Cancel
            </button>
            </>
          ) : (
            <button
              className="btn btn-sm btn-primary"
              onClick={handleEditClick}
            >
              Edit Stats
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
        {stats.map((stat) => (
          <div
            key={stat.label} // Use label as key for consistent identification
            className="bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <div className="bg-opacity-30 bg-white p-2 rounded-full">
                {stat.icon}
              </div>
              <span className="text-lg font-semibold">{stat.label}</span>
            </div>
            {isEditing ? (
              <input
                type="text"
                className="input input-sm w-20 text-center text-black"
                value={editValues[stat.label] || ''} // Use label as key for value
                onChange={(e) => handleInputChange(stat.label, e.target.value)}
              />
            ) : (
              <div className="text-xl font-bold">{stat.value}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}