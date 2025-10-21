import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

function TeamMemberCard({ name, university, role, photo }) {
  return (
    <Card className="w-full flex flex-row items-center shadow-xl rounded-3xl overflow-hidden bg-white hover:scale-105 transition-transform duration-300">
      <img
        src={photo}
        alt={name}
        className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-full m-4 shadow-md"
      />
      <CardContent className="p-4 text-left">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">{name}</h2>
        <p className="text-sm md:text-md text-indigo-600 font-medium">{role}</p>
        <p className="text-xs md:text-sm text-gray-500 mt-1">{university}</p>
      </CardContent>
    </Card>
  );
}

export default function TeamSlider() {
  const team = [
    {
      name: "Akanksha Negi",
      university: "Graphic Era Hill University, Dehradun",
      role: "Team Leader",
      photo: "/images/akanksha.jpg",
    },
    {
      name: "Asmit Bhandari",
      university: "Graphic Era Hill University, Dehradun",
      role: "Team Member",
      photo: "/images/asmit.jpg",
    },
    {
      name: "Kaushal Thakur",
      university: "Graphic Era Hill University, Dehradun",
      role: "Team Member",
      photo: "/images/kaushal.jpg",
    },
    {
      name: "Shashvat Yash",
      university: "Graphic Era (Deemed to be University), Dehradun",
      role: "Team Member",
      photo: "/images/shashvat.jpg",
    },
  ];

  const [index, setIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % team.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [team.length]);

  return (
    <div className="relative w-full overflow-hidden ">
      <motion.div
        className="flex"
        animate={{
          x: containerRef.current
            ? -index * containerRef.current.offsetWidth
            : 0,
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        ref={containerRef}
      >
        {team.map((member, i) => (
          <div key={i} className="flex-shrink-0 w-full px-3">
            <TeamMemberCard {...member} />
          </div>
        ))}
      </motion.div>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {team.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              i === index ? "bg-indigo-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
