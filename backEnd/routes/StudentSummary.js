import express from "express";
import pool from "../db/supabase.js";

const router = express.Router();

router.get("/summary-grid", async (req, res) => {
  const { sy } = req.query;
  if (!sy) return res.status(400).json({ error: "Missing school_year" });

  try {
    const result = await pool.query(
      `
      SELECT
        s.gender,
        a.grade_section,
        a.fil_oral_pre_level, a.fil_comp_pre_level,
        a.fil_oral_post_level, a.fil_comp_post_level,
        a.eng_oral_pre_level, a.eng_comp_pre_level,
        a.eng_oral_post_level, a.eng_comp_post_level,
        a.numeracy_pre_level, a.numeracy_post_level
      FROM mnhs_assessments a
      JOIN mnhs_students s ON a.lrn = s.lrn
      WHERE a.school_year = $1
      `,
      [sy]
    );

    const grades = ["Grade 7", "Grade 8", "Grade 9", "Grade 10"];
    const summaryKeys = [
      "filipino_pre",
      "filipino_post",
      "english_pre",
      "english_post",
      "numeracy_pre",
      "numeracy_post",
    ];

    // Initialize summary object
    const summary = {};
    const init = () => {
      const obj = {};
      [...grades, "TOTAL"].forEach((g) => {
        obj[g] = { M: {}, F: {}, T: {} };
      });
      return obj;
    };
    summaryKeys.forEach((key) => {
      summary[key] = init();
    });

    // Helper function to count levels
    const count = (group, grade, gender, rawLevel) => {
      const level = (rawLevel || "").trim();
      if (!level || !grade || !gender) return;

      const groupData = summary[group];
      [
        groupData[grade][gender],
        groupData[grade]["T"],
        groupData["TOTAL"][gender],
        groupData["TOTAL"]["T"],
      ].forEach((bucket) => {
        bucket[level] = (bucket[level] || 0) + 1;
      });
    };

    // Process each row
    for (const row of result.rows) {
      const [grade] = (row.grade_section || "").split(" - ");
      const gender =
        row.gender === "Male" ? "M" : row.gender === "Female" ? "F" : null;
      if (!grades.includes(grade) || !gender) continue;

      // Filipino
      [row.fil_oral_pre_level, row.fil_comp_pre_level].forEach(
        (lvl) => lvl && count("filipino_pre", grade, gender, lvl)
      );
      [row.fil_oral_post_level, row.fil_comp_post_level].forEach(
        (lvl) => lvl && count("filipino_post", grade, gender, lvl)
      );

      // English
      [row.eng_oral_pre_level, row.eng_comp_pre_level].forEach(
        (lvl) => lvl && count("english_pre", grade, gender, lvl)
      );
      [row.eng_oral_post_level, row.eng_comp_post_level].forEach(
        (lvl) => lvl && count("english_post", grade, gender, lvl)
      );

      // Numeracy
      if (row.numeracy_pre_level)
        count("numeracy_pre", grade, gender, row.numeracy_pre_level);
      if (row.numeracy_post_level)
        count("numeracy_post", grade, gender, row.numeracy_post_level);
    }

    res.json(summary);
  } catch (err) {
    console.error("❌ Error generating summary grid:", err.message);
    res.status(500).json({ error: "Failed to compute summary grid." });
  }
});

export default router;
