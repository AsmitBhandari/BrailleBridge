import React from "react";

const Section = ({ title, children }) => {
  return (
    <div className=" p-6 border rounded-lg shadow-sm bg-white">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-gray-700">{children}</p>
    </div>
  );
};

export default Section;
