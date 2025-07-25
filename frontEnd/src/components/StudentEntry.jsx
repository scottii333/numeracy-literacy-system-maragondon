import React, { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import api from "../api/axios";

export const StudentEntry = () => {
  const [displayLimit, setDisplayLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    lrn: "",
    sy: "",
    name: "",
    gender: "",
    address: "",
    guardian: "",
    elementary: "",
  });
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await api.get("/students");
        setStudents(data);
      } catch (err) {
        console.error("Failed to fetch students", err);
      }
    };
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isDuplicate = (newStudent) =>
    students.some((s) => s.lrn.trim() === newStudent.lrn.trim());

  const handleInsert = async () => {
    const requiredFields = [
      "lrn",
      "sy",
      "name",
      "gender",
      "address",
      "guardian",
      "elementary",
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field]?.trim()
    );

    if (missingFields.length > 0) {
      setError(
        `Missing required fields: ${missingFields.join(", ").toUpperCase()}`
      );
      setShowModal(true);
      return;
    }

    if (isDuplicate(formData)) {
      setError(`Student with LRN ${formData.lrn} already exists.`);
      setShowModal(true);
      return;
    }

    try {
      await api.post("/students", formData); // ⬅ POST to Express backend
      setStudents((prev) => [formData, ...prev]);

      setFormData({
        lrn: "",
        sy: "",
        name: "",
        gender: "",
        address: "",
        guardian: "",
        elementary: "",
      });
    } catch (err) {
      const msg = err.response?.data?.error || "Error saving to server.";
      setError(msg);
      setShowModal(true);
    }
  };

  const handleRemove = async (lrn) => {
    try {
      await api.delete(`/students/${lrn}`);
      setStudents((prev) => prev.filter((s) => s.lrn !== lrn));
    } catch (err) {
      console.error("Failed to delete student", err);
      setError("Failed to delete student.");
      setShowModal(true);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(), // normalize headers
      complete: async (results) => {
        const requiredFields = [
          "lrn",
          "sy",
          "name",
          "gender",
          "address",
          "guardian",
          "elementary",
        ];

        const newEntries = results.data;
        const errors = [];
        const validEntries = [];

        newEntries.forEach((row, index) => {
          const rowNumber = index + 2;
          const missing = requiredFields.filter((field) => !row[field]?.trim());

          if (missing.length > 0) {
            errors.push(
              `Row ${rowNumber}: Missing fields — ${missing
                .join(", ")
                .toUpperCase()}`
            );
            return;
          }

          const lrn = row.lrn.trim();
          if (students.some((s) => s.lrn === lrn)) {
            errors.push(`Row ${rowNumber}: Duplicate LRN — ${lrn}`);
            return;
          }

          validEntries.push(row);
        });

        if (errors.length > 0) {
          setError(errors.join("\n"));
          setShowModal(true);
          return;
        }

        // ✅ Insert all valid entries to the database
        const insertAll = async () => {
          for (const student of validEntries) {
            try {
              await api.post("/students", student);
              setStudents((prev) => [...prev, student]);
            } catch (err) {
              errors.push(
                `LRN ${student.lrn}: ${
                  err.response?.data?.error || "Insert failed"
                }`
              );
            }
          }

          if (errors.length > 0) {
            setError(errors.join("\n"));
            setShowModal(true);
          }
        };

        await insertAll();
      },
    });

    e.target.value = null;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Student Entry</h2>
      <p className="text-gray-600 mb-4">
        Form to register or input student details.
      </p>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
        <input
          name="lrn"
          placeholder="LRN"
          value={formData.lrn}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 outline-none"
        />

        <select
          name="sy"
          value={formData.sy}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 outline-none"
        >
          <option value="">Select S.Y. Enrolled</option>
          <option value="2025-2026">2025–2026</option>
          <option value="2026-2027">2026–2027</option>
          <option value="2027-2028">2027–2028</option>
          <option value="2028-2029">2028–2029</option>
          <option value="2029-2030">2029–2030</option>
        </select>

        <input
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 outline-none"
        />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 outline-none"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <input
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 outline-none"
        />

        <input
          name="guardian"
          placeholder="Guardian"
          value={formData.guardian}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 outline-none"
        />

        <input
          name="elementary"
          placeholder="Elementary School"
          value={formData.elementary}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 outline-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleInsert}
          className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200 shadow-sm"
        >
          ➕ Insert Student
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="bg-green-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-green-700 transition duration-200 shadow-sm"
        >
          📁 Import CSV
        </button>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          ref={fileInputRef}
          className="hidden"
        />
      </div>

      {students.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Search by LRN"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full max-w-sm"
          />
        </div>
      )}

      {/* Student Table */}
      {students.length > 0 && (
        <div className="overflow-x-auto w-full">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-lg shadow-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">LRN</th>
                    <th className="px-4 py-2 text-left font-medium">S.Y</th>
                    <th className="px-4 py-2 text-left font-medium">Name</th>
                    <th className="px-4 py-2 text-left font-medium">Gender</th>
                    <th className="px-4 py-2 text-left font-medium">Address</th>
                    <th className="px-4 py-2 text-left font-medium">
                      Guardian
                    </th>
                    <th className="px-4 py-2 text-left font-medium">
                      Elementary School
                    </th>
                    <th className="px-4 py-2 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students
                    .filter((s) =>
                      s.lrn
                        .toLowerCase()
                        .includes(searchTerm.trim().toLowerCase())
                    )
                    .slice(0, displayLimit)
                    .map((s, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{s.lrn}</td>
                        <td className="px-4 py-2">{s.sy}</td>
                        <td className="px-4 py-2">{s.name}</td>
                        <td className="px-4 py-2">{s.gender}</td>
                        <td className="px-4 py-2">{s.address}</td>
                        <td className="px-4 py-2">{s.guardian}</td>
                        <td className="px-4 py-2">{s.elementary}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleRemove(s.lrn)}
                            className="text-red-600 hover:underline hover:text-red-800 transition duration-200"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Load More Button */}
          {students.filter((s) =>
            s.lrn.toLowerCase().includes(searchTerm.trim().toLowerCase())
          ).length > displayLimit && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setDisplayLimit((prev) => prev + 30)}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full shadow hover:from-blue-600 hover:to-indigo-700 transition duration-300"
              >
                + Load More Students
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[24rem] overflow-y-auto relative">
            {/* Close Button (top-right) */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>

            <h3 className="text-lg font-semibold mb-4 text-red-600 mt-6">
              Import Error
            </h3>

            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {error}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
