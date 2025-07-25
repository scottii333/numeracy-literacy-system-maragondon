import React, { useEffect, useState } from "react";
import api from "../api/axios";

export const DataSummary = () => {
  const [summary, setSummary] = useState(null);
  const [schoolYear, setSchoolYear] = useState("2025-2026");

  const schoolYearOptions = [
    "2025-2026",
    "2026-2027",
    "2027-2028",
    "2028-2029",
    "2029-2030",
  ];

  const grades = ["Grade 7", "Grade 8", "Grade 9", "Grade 10"];

  useEffect(() => {
    api
      .get(`/summary/summary-grid?sy=${schoolYear}`)
      .then((res) => setSummary(res.data))
      .catch(() => setSummary(null));
  }, [schoolYear]);

  const renderUnifiedLevelTable = (label, preKey, postKey, levels, color) => {
    const pre = summary?.[preKey] || {};
    const post = summary?.[postKey] || {};

    return (
      <div className="mt-10">
        <h3 className={`text-xl font-bold mb-4 text-${color}-700`}>{label}</h3>
        <div className="overflow-auto bg-white rounded-md shadow ring-1 ring-gray-300">
          <table className="min-w-full text-sm text-center border-collapse">
            <thead className={`bg-${color}-100 text-gray-800`}>
              <tr>
                <th className="text-left py-2 px-4 bg-white">Level</th>
                {grades.map((grade) => (
                  <th key={grade} colSpan={6} className="px-2 py-2 border-l">
                    {grade}
                  </th>
                ))}
              </tr>
              <tr className="bg-gray-50 text-gray-700 text-xs">
                <th className="text-left py-1 px-4">Test / Gender</th>
                {grades.map(() => (
                  <React.Fragment key={Math.random()}>
                    <th className="px-1 py-1">Pre M</th>
                    <th className="px-1 py-1">Pre F</th>
                    <th className="px-1 py-1 font-bold">Pre T</th>
                    <th className="px-1 py-1">Post M</th>
                    <th className="px-1 py-1">Post F</th>
                    <th className="px-1 py-1 font-bold">Post T</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {levels.map((level, i) => (
                <tr
                  key={level}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="text-left py-2 px-4 font-medium">{level}</td>
                  {grades.map((grade) => {
                    const preM = pre[grade]?.M?.[level] || 0;
                    const preF = pre[grade]?.F?.[level] || 0;
                    const preT = preM + preF;

                    const postM = post[grade]?.M?.[level] || 0;
                    const postF = post[grade]?.F?.[level] || 0;
                    const postT = postM + postF;

                    return (
                      <React.Fragment key={`${grade}-${level}`}>
                        <td className="py-2 px-1">{preM}</td>
                        <td className="py-2 px-1">{preF}</td>
                        <td className="py-2 px-1 font-semibold text-gray-800">
                          {preT}
                        </td>
                        <td className="py-2 px-1">{postM}</td>
                        <td className="py-2 px-1">{postF}</td>
                        <td className="py-2 px-1 font-semibold text-gray-800">
                          {postT}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const numeracyLevels = [
    "Emerging (NP)",
    "Emerging (LP)",
    "Developing (NP)",
    "Transitioning (P)",
    "At Grade Level (HP)",
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Summary of Results
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1 text-gray-700">
          School Year
        </label>
        <select
          value={schoolYear}
          onChange={(e) => setSchoolYear(e.target.value)}
          className="border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {schoolYearOptions.map((yr) => (
            <option key={yr} value={yr}>
              S.Y. {yr}
            </option>
          ))}
        </select>
      </div>

      {summary ? (
        <>
          {renderUnifiedLevelTable(
            "Literacy (Filipino)",
            "filipino_pre",
            "filipino_post",
            ["Kabiguan", "Instruksiyunal", "Malaya"],
            "red"
          )}
          {renderUnifiedLevelTable(
            "Literacy (English)",
            "english_pre",
            "english_post",
            ["Frustration", "Instructional", "Independent"],
            "yellow"
          )}
          {renderUnifiedLevelTable(
            "Numeracy",
            "numeracy_pre",
            "numeracy_post",
            numeracyLevels,
            "blue"
          )}
        </>
      ) : (
        <p className="text-gray-500 text-sm">Loading or no data available.</p>
      )}
    </div>
  );
};
