import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";

import api from "../api/axios";

export const StudentData = () => {
  const [students, setStudents] = useState([]);
  const [selectedLRN, setSelectedLRN] = useState("");
  const [studentInfo, setStudentInfo] = useState({});
  const [assessments, setAssessments] = useState([]);

  const schoolYears = [
    "2025-2026",
    "2026-2027",
    "2027-2028",
    "2028-2029",
    "2029-2030",
  ];

  useEffect(() => {
    api.get("/student-data").then((res) => setStudents(res.data));
  }, []);

  useEffect(() => {
    if (!selectedLRN) return;
    api
      .get(`/student-data/${selectedLRN}`)
      .then((res) => setStudentInfo(res.data));
    api
      .get(`/assessments/history/${selectedLRN}`)
      .then((res) => setAssessments(res.data));
  }, [selectedLRN]);

  const getAssessmentByYear = (year) =>
    assessments.find((a) => a.school_year === year) || {};

  const handleExportPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 40;
    const columnWidth = (pageWidth - margin * 2) / 3;
    const rowHeight = 100;
    const padding = 6;

    // Header (no background)
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text("MNHS Synchronized Progress Record", pageWidth / 2, 30, {
      align: "center",
    });

    // Student Info
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const infoData = [
      `LRN: ${selectedLRN}`,
      `Name: ${studentInfo.name || ""}`,
      `Gender: ${studentInfo.gender || ""}`,
      `Guardian: ${studentInfo.guardian || ""}`,
      `Address: ${studentInfo.address || ""}`,
      `Elementary: ${studentInfo.elementary || ""}`,
      `SY Enrolled: ${studentInfo.sy || ""}`,
      `School ID: ${studentInfo.school_id || ""}`,
      `Municipality: ${studentInfo.municipality || ""}`,
      `Division: ${studentInfo.division || ""}`,
    ];

    infoData.forEach((line, i) => {
      const x = margin + (i % 2) * (pageWidth / 2);
      const y = 50 + Math.floor(i / 2) * 12;
      doc.text(line, x, y);
    });

    let startY = 50 + Math.ceil(infoData.length / 2) * 12 + 16;
    const maxY = pageHeight - 80;

    schoolYears.forEach((year, index) => {
      const y = startY + index * (rowHeight + 10);
      if (y + rowHeight > maxY) return;

      const d = getAssessmentByYear(year);

      const sections = [
        {
          title: "Filipino",
          content: [
            `Pre-Test`,
            `• Pagbasa score: ${d.fil_oral_pre_score || ""} ${
              d.fil_oral_pre_level || ""
            }`,
            `• Pag-unawa score: ${d.fil_comp_pre_score || ""} ${
              d.fil_comp_pre_level || ""
            }`,
            `Post-Test`,
            `• Pagbasa score: ${d.fil_oral_post_score || ""} ${
              d.fil_oral_post_level || ""
            }`,
            `• Pag-unawa score: ${d.fil_comp_post_score || ""} ${
              d.fil_comp_post_level || ""
            }`,
          ],
        },
        {
          title: "English",
          content: [
            `Pre-Test`,
            `• Oral Reading score: ${d.eng_oral_pre_score || ""} ${
              d.eng_oral_pre_level || ""
            }`,
            `• Comprehension score: ${d.eng_comp_pre_score || ""} ${
              d.eng_comp_pre_level || ""
            }`,
            `Post-Test`,
            `• Oral Reading score: ${d.eng_oral_post_score || ""} ${
              d.eng_oral_post_level || ""
            }`,
            `• Comprehension score: ${d.eng_comp_post_score || ""} ${
              d.eng_comp_post_level || ""
            }`,
          ],
        },
        {
          title: "Numeracy",
          content: [
            `Pre-Test`,
            `• Score: ${d.numeracy_pre_score || ""} ${
              d.numeracy_pre_level || ""
            }`,
            `Post-Test`,
            `• Score: ${d.numeracy_post_score || ""} ${
              d.numeracy_post_level || ""
            }`,
            `Intervention: ${d.intervention || "--"}`,
          ],
        },
      ];

      // Draw year section border
      doc.setDrawColor(200);
      doc.rect(margin, y, pageWidth - margin * 2, rowHeight);

      // Year label
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(`School Year: ${year}`, margin + padding, y + 12);

      // Sections
      sections.forEach((sec, i) => {
        const x = margin + i * columnWidth;
        const yStart = y + 24;

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.text(sec.title, x + padding, yStart);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(60, 60, 60);

        const lines = doc.splitTextToSize(
          sec.content.join("\n"),
          columnWidth - padding * 2
        );
        doc.text(lines, x + padding, yStart + 10);
      });
    });

    // Footer
    const now = new Date().toLocaleString();
    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.text(`Generated on ${now}`, margin, pageHeight - 20);
    doc.text(
      "Principal's Signature: ______________________",
      pageWidth - 250,
      pageHeight - 20
    );

    doc.save(`${selectedLRN}_Progress_Record.pdf`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-semibold">Student Progress Record</h2>
          <p className="text-gray-500 text-sm mt-1">
            Monitor and export academic progress per year.
          </p>
        </div>
        {selectedLRN && (
          <button
            onClick={handleExportPDF}
            className="bg-green-500 hover:bg-green-600 transition text-white px-4 py-2 rounded-lg text-sm shadow"
          >
            🧾 Export to PDF
          </button>
        )}
      </div>

      <div className="border rounded-xl shadow-md overflow-hidden mb-8 bg-white">
        <div className="bg-gray-100 px-4 py-3 text-lg font-medium">
          Student Information
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div>
            <label className="block text-sm font-medium mb-1">Select LRN</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:ring focus:ring-blue-100 outline-none transition"
              value={selectedLRN}
              onChange={(e) => setSelectedLRN(e.target.value)}
            >
              <option value="">-- Select LRN --</option>
              {students.map((s) => (
                <option key={s.lrn} value={s.lrn}>
                  {s.lrn} — {s.name}
                </option>
              ))}
            </select>
          </div>
          {[
            ["Name", studentInfo.name],
            ["Gender", studentInfo.gender],
            ["Guardian", studentInfo.guardian],
            ["Address", studentInfo.address],
            ["Elementary School", studentInfo.elementary],
            ["School Year Enrolled", studentInfo.sy],
            ["School ID", studentInfo.school_id],
            ["Municipality", studentInfo.municipality],
            ["Division", studentInfo.division],
          ].map(([label, value]) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {label}
              </label>
              <div className="bg-gray-50 px-3 py-2 rounded border border-gray-200">
                {value || "--"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {schoolYears.map((year) => {
        const d = getAssessmentByYear(year);
        return (
          <div
            key={year}
            className="border rounded-xl shadow-md overflow-hidden mb-8 bg-white"
          >
            <div className="bg-gray-100 px-4 py-2 flex justify-between text-sm font-semibold">
              <span>School Year: {year}</span>
              <span>Grade &amp; Section: {d.grade_section || ""}</span>
            </div>
            <div className="bg-gray-50 px-4 py-2 text-sm font-medium">
              School: {studentInfo.school || ""}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 text-sm">
              {/* FILIPINO */}
              <div className="border rounded-lg bg-red-50 shadow-sm">
                <h4 className="bg-red-200 text-red-900 text-center py-1 rounded-t font-semibold">
                  Reading (Filipino)
                </h4>
                <div className="p-3">
                  <div className="font-semibold mb-1">Pre-Test</div>
                  <p>Pagbasa score: {d.fil_oral_pre_score || ""}</p>
                  <p>Level: {d.fil_oral_pre_level || ""}</p>
                  <p className="mt-2">
                    Pag-unawa score: {d.fil_comp_pre_score || ""}
                  </p>
                  <p>Level: {d.fil_comp_pre_level || ""}</p>

                  <div className="font-semibold mt-3">Intervention</div>
                  <p>{d.intervention || ""}</p>

                  <div className="font-semibold mt-3">Post-Test</div>
                  <p>Pagbasa score: {d.fil_oral_post_score || ""}</p>
                  <p>Level: {d.fil_oral_post_level || ""}</p>
                  <p className="mt-2">
                    Pag-unawa score: {d.fil_comp_post_score || ""}
                  </p>
                  <p>Level: {d.fil_comp_post_level || ""}</p>
                </div>
              </div>

              {/* ENGLISH */}
              <div className="border rounded-lg bg-yellow-50 shadow-sm">
                <h4 className="bg-yellow-200 text-yellow-900 text-center py-1 rounded-t font-semibold">
                  Reading (English)
                </h4>
                <div className="p-3">
                  <div className="font-semibold mb-1">Pre-Test</div>
                  <p>Oral score: {d.eng_oral_pre_score || ""}</p>
                  <p>Level: {d.eng_oral_pre_level || ""}</p>
                  <p className="mt-2">
                    Comp score: {d.eng_comp_pre_score || ""}
                  </p>
                  <p>Level: {d.eng_comp_pre_level || ""}</p>

                  <div className="font-semibold mt-3">Intervention</div>
                  <p>{d.intervention || ""}</p>

                  <div className="font-semibold mt-3">Post-Test</div>
                  <p>Oral score: {d.eng_oral_post_score || ""}</p>
                  <p>Level: {d.eng_oral_post_level || ""}</p>
                  <p className="mt-2">
                    Comp score: {d.eng_comp_post_score || ""}
                  </p>
                  <p>Level: {d.eng_comp_post_level || ""}</p>
                </div>
              </div>

              {/* NUMERACY */}
              <div className="border rounded-lg bg-cyan-50 shadow-sm">
                <h4 className="bg-cyan-200 text-cyan-900 text-center py-1 rounded-t font-semibold">
                  Numeracy
                </h4>
                <div className="p-3">
                  <div className="font-semibold mb-1">Pre-Test</div>
                  <p>Score: {d.numeracy_pre_score || ""}</p>
                  <p>Level: {d.numeracy_pre_level || ""}</p>

                  <div className="font-semibold mt-3">Intervention</div>
                  <p>{d.intervention || ""}</p>

                  <div className="font-semibold mt-3">Post-Test</div>
                  <p>Score: {d.numeracy_post_score || ""}</p>
                  <p>Level: {d.numeracy_post_level || ""}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
