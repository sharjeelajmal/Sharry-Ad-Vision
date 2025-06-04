import { Users, ShoppingCart, Image, Code } from "lucide-react";

export default function StatsCards() {
  const stats = [
    { id: 1, label: "Users", value: "4123", icon: <Users className="h-6 w-6 text-white" /> },
    { id: 2, label: "Orders", value: "1,12,306", icon: <ShoppingCart className="h-6 w-6 text-white" /> },
    { id: 3, label: "Designs Delivered", value: "850", icon: <Image className="h-6 w-6 text-white" /> },
    { id: 4, label: "Websites Built", value: "220", icon: <Code className="h-6 w-6 text-white" /> },
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
