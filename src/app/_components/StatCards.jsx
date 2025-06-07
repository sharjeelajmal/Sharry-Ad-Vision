import { useEffect, useState } from "react";
import { Users, ShoppingCart, Image, Code } from "lucide-react";

export default function StatsCards() {
  const [orders, setOrders] = useState(112306); // integer me rakho, comma useState me mat do
  const [designs, setDesigns] = useState(850);
  const [websites, setWebsites] = useState(220);

  // Increment orders and designs every 1 hour
  useEffect(() => {
    const oneHour = 60 * 60 * 1000; // 1 hour in ms
    const interval = setInterval(() => {
      setOrders(prev => prev + 5);
      setDesigns(prev => prev + 2);
    }, oneHour);

    return () => clearInterval(interval);
  }, []);

  // Increment websites every 24 hours
  useEffect(() => {
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in ms
    const interval = setInterval(() => {
      setWebsites(prev => prev + 1);
    }, oneDay);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { id: 1, label: "Users", value: "4123", icon: <Users className="h-6 w-6 text-white" /> },
    { id: 2, label: "Orders", value: orders.toLocaleString(), icon: <ShoppingCart className="h-6 w-6 text-white" /> },
    { id: 3, label: "Designs Delivered", value: designs, icon: <Image className="h-6 w-6 text-white" /> },
    { id: 4, label: "Websites Built", value: websites, icon: <Code className="h-6 w-6 text-white" /> },
  ];

  return (
    <div className="py-4 px-4 flex items-center justify-center">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 text-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <div className="bg-opacity-30 bg-white p-2 rounded-full">{stat.icon}</div>
              <span className="text-lg font-semibold">{stat.label}</span>
            </div>
            <div className="text-xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
