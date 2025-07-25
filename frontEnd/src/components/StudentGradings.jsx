import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";

const gradeSectionMap = {
  "Grade 7": [
    "Dahlia",
    "Honesty",
    "Ilang-ilang",
    "Rosal",
    "Sampaguita",
    "Santan",
    "Waling-waling",
  ],
  "Grade 8": [
    "Atis",
    "Guyabano",
    "Kaymito",
    "Lansonez",
    "Manga",
    "SPJ Integrity",
  ],
  "Grade 9": [
    "Amorsolo",
    "Dela Rosa",
    "Edades",
    "Francisco",
    "Hidalgo",
    "Luna",
  ],
  "Grade 10": [
    "Aguinaldo",
    "Bonifacio",
    "Burgos",
    "Del Pilar",
    "Rizal",
    "Zamora",
  ],
};

export const StudentGradings = () => {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [displayLimit, setDisplayLimit] = useState(30);

  const [schoolYear, setSchoolYear] = useState("2025-2026");

  const schoolYearOptions = [
    "2025-2026",
    "2026-2027",
    "2027-2028",
    "2028-2029",
    "2029-2030",
  ];

  // Inside your component:
  const fetchStudents = useCallback(async () => {
    try {
      const res = await api.get("/assessments/with-students", {
        params: { school_year: schoolYear }, // ✅ use selected year
      });
      const formatted = res.data.map((s) => {
        const [grade = "", section = ""] = (s.grade_section || "").split(" - ");
        return { ...s, grade, section };
      });
      setStudents(formatted);
    } catch {
      showToast("❌ Failed to fetch students", "error");
    }
  }, [schoolYear]);
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]); // ✅ warning resolved

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleSave = async () => {
    const payload = {
      ...selected,
      grade_section: `${selected.grade} - ${selected.section}`,
      school_year: schoolYear,
    };
    try {
      await api.post("/assessments", payload);
      await fetchStudents();
      setShowModal(false);
      showToast("✅ Assessment saved", "success");
    } catch {
      showToast("❌ Save failed", "error");
    }
  };

  const levelColor = (level) => {
    if (!level) return "";
    if (level.includes("Kabiguan") || level.includes("Frustration"))
      return "text-red-600";
    if (level.includes("Instruksiyunal") || level.includes("Instructional"))
      return "text-orange-600";
    if (level.includes("Malaya") || level.includes("Independent"))
      return "text-green-600";
    return "";
  };

  const filteredStudents = students.filter(
    (s) =>
      s.lrn.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (gradeFilter ? s.grade === gradeFilter : true) &&
      (sectionFilter ? s.section === sectionFilter : true)
  );

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={schoolYear}
          onChange={(e) => setSchoolYear(e.target.value)}
          className="border px-3 py-1.5 rounded text-sm"
        >
          {schoolYearOptions.map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by LRN"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-1.5 rounded text-sm w-52"
        />

        <select
          value={gradeFilter}
          onChange={(e) => {
            setGradeFilter(e.target.value);
            setSectionFilter("");
          }}
          className="border px-3 py-1.5 rounded text-sm"
        >
          <option value="">All Grades</option>
          {Object.keys(gradeSectionMap).map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>

        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="border px-3 py-1.5 rounded text-sm"
          disabled={!gradeFilter}
        >
          <option value="">All Sections</option>
          {gradeFilter &&
            gradeSectionMap[gradeFilter]?.map((sec) => (
              <option key={sec}>{sec}</option>
            ))}
        </select>
      </div>

      {/* Table */}
      {filteredStudents.length > 0 ? (
        <div className="overflow-x-auto w-full">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-lg shadow border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">LRN</th>
                    <th className="px-4 py-2 text-left font-medium">Name</th>
                    <th className="px-4 py-2 text-left font-medium">Grade</th>
                    <th className="px-4 py-2 text-left font-medium">Section</th>
                    <th className="px-4 py-2 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.slice(0, displayLimit).map((s, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{s.lrn}</td>
                      <td className="px-4 py-2">{s.name}</td>
                      <td className="px-4 py-2">{s.grade}</td>
                      <td className="px-4 py-2">{s.section}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => {
                            setSelected(s);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredStudents.length > displayLimit && (
            <div className="text-center mt-4">
              <button
                onClick={() => setDisplayLimit((prev) => prev + 30)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-6 py-2 rounded-full shadow hover:from-blue-600 hover:to-indigo-700 transition"
              >
                + Load More
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No students found.</p>
      )}

      {/* Modal */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>

            <h3 className="text-lg font-semibold mb-4 mt-6">
              Update Assessment – {selected.name}
            </h3>

            {/* Grade & Section */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label>Grade</label>
                <select
                  className="border rounded px-2 py-1 w-full"
                  value={selected.grade}
                  onChange={(e) =>
                    setSelected((s) => ({
                      ...s,
                      grade: e.target.value,
                      section: "",
                    }))
                  }
                >
                  <option value="">Select</option>
                  {Object.keys(gradeSectionMap).map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Section</label>
                <select
                  className="border rounded px-2 py-1 w-full"
                  value={selected.section}
                  onChange={(e) =>
                    setSelected((s) => ({ ...s, section: e.target.value }))
                  }
                  disabled={!selected.grade}
                >
                  <option value="">Select</option>
                  {gradeSectionMap[selected.grade]?.map((sec) => (
                    <option key={sec}>{sec}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Score Fields */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                "fil_oral_pre",
                "fil_comp_pre",
                "fil_oral_post",
                "fil_comp_post",
                "eng_oral_pre",
                "eng_comp_pre",
                "eng_oral_post",
                "eng_comp_post",
                "numeracy_pre",
                "numeracy_post",
              ].map((key) => (
                <div key={key} className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-700 mb-1">
                    {key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={selected[key + "_score"] || ""}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, "");
                      if (Number(v) > 100) v = "100";

                      const updated = {
                        ...selected,
                        [key + "_score"]: v,
                      };

                      if (key.includes("oral")) {
                        updated[key + "_level"] = calculateOralLevel(
                          v,
                          key.startsWith("fil")
                        );
                      } else if (key.includes("comp")) {
                        updated[key + "_level"] = calculateCompLevel(
                          v,
                          key.startsWith("fil")
                        );
                      } else {
                        updated[key + "_level"] = selected.grade
                          ? calculateNumeracyLevel(v, selected.grade)
                          : "Select Grade";
                      }

                      setSelected(updated);
                    }}
                    className="border rounded w-24 text-center px-2 py-1 text-sm"
                  />
                  {selected[key + "_score"] && (
                    <span
                      className={`text-xs mt-1 font-medium ${levelColor(
                        selected[key + "_level"]
                      )}`}
                    >
                      {selected[key + "_level"]}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="text-right mt-4">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Message */}
      {toast.show && (
        <div
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg z-50 ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

// Calculation functions
const calculateOralLevel = (score, isFil = true) => {
  score = Number(score);
  if (score <= 89) return isFil ? "Kabiguan" : "Frustration";
  if (score <= 96) return isFil ? "Instruksiyunal" : "Instructional";
  return isFil ? "Malaya" : "Independent";
};

const calculateCompLevel = (score, isFil = true) => {
  score = Number(score);
  if (score <= 15) return isFil ? "Kabiguan" : "Frustration";
  if (score <= 27) return isFil ? "Instruksiyunal" : "Instructional";
  return isFil ? "Malaya" : "Independent";
};

const calculateNumeracyLevel = (score, grade) => {
  score = Number(score);
  const g = parseInt((grade || "").replace("Grade ", ""));
  const map = {
    7: [6, 13, 20, 27, 33],
    8: [15, 30, 43, 52, 59],
    9: [27, 55, 60, 65, 69],
    10: [29, 59, 64, 68, 72],
  };
  if (!map[g]) return "";
  const [f, l, d, t] = map[g];
  if (score <= f) return "Emerging (NP)";
  if (score <= l) return "Emerging (LP)";
  if (score <= d) return "Developing (NP)";
  if (score <= t) return "Transitioning (P)";
  return "At Grade Level (HP)";
};
