import { useEffect, useState } from "react";
import { Users, ShoppingCart, Image, Code } from "lucide-react";

const iconMap = {
  Users: <Users className="h-6 w-6 text-white" />,
  Orders: <ShoppingCart className="h-6 w-6 text-white" />,
  "Designs Delivered": <Image className="h-6 w-6 text-white" />,
  "Websites Built": <Code className="h-6 w-6 text-white" />,
};

export default function StatsCards({ isAdmin = false, onEditStats }) {
  const [stats, setStats] = useState([
    { id: 1, label: "Users", value: "4123", icon: iconMap["Users"] },
    { id: 2, label: "Orders", value: "112306", icon: iconMap["Orders"] },
    { id: 3, label: "Designs Delivered", value: "850", icon: iconMap["Designs Delivered"] },
    { id: 4, label: "Websites Built", value: "220", icon: iconMap["Websites Built"] },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();

        const dataWithIcons = data.map(item => ({
          ...item,
          icon: iconMap[item.label] || <Users className="h-6 w-6 text-white" />,
        }));

        setStats(dataWithIcons);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const handleEditClick = () => {
    const initialValues = stats.reduce((acc, stat) => ({
      ...acc,
      [stat.id]: stat.value
    }), {});
    setEditValues(initialValues);
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    const updatedStats = stats.map(stat => ({
      ...stat,
      value: editValues[stat.id] || stat.value
    }));

    setStats(updatedStats);
    setIsEditing(false);

    await fetch('/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedStats)
    });

    if (onEditStats) onEditStats(updatedStats);
  };

  return (
    <div className="py-4 px-4 flex flex-col items-center justify-center">
      {isAdmin && (
        <div className="flex space-x-2 mb-4">
          {isEditing ? (
            <button 
              className="btn btn-sm btn-success"
              onClick={handleSaveClick}
            >
              Save Stats
            </button>
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
            key={stat.id}
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
                value={editValues[stat.id] || stat.value}
                onChange={(e) => setEditValues({
                  ...editValues,
                  [stat.id]: e.target.value
                })}
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