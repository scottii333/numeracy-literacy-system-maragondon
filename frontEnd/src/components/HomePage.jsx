import React from "react";

export const HomePage = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-gray-800">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-800">PROJECT SYNC+</h1>
        <p className="text-sm text-gray-500 italic mt-2">
          Systematized Yearlong Numeracy and Literacy Centralization Plus
        </p>
        <h2 className="mt-6 text-lg font-semibold text-gray-700 tracking-wide">
          STUDENTS' RECORD IN LITERACY AND NUMERACY
        </h2>
      </div>

      {/* School Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <InfoRow
          label="Name of School"
          value="MARAGONDON NATIONAL HIGH SCHOOL"
        />
        <InfoRow label="Municipality" value="MARAGONDON" />
        <InfoRow label="Division" value="CAVITE PROVINCE" />
        <InfoRow label="Region" value="IV-A CALABARZON" />
        <InfoRow label="School ID" value="301204" />
        <InfoRow label="School Head" value="GREGORIA A. PEÑA" />
        <InfoRow label="Position" value="PRINCIPAL II" />
      </div>
    </div>
  );
};

// Reusable info block
const InfoRow = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
      {label}
    </span>
    <span className="text-base font-medium mt-1">{value}</span>
  </div>
);
