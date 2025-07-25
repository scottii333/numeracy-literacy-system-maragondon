import express from "express";
import pool from "../db/supabase.js";

const router = express.Router();

// Create table if not exists
export const ensureAssessmentTableExists = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mnhs_assessments (
        id SERIAL PRIMARY KEY,
        lrn TEXT NOT NULL,
        name TEXT NOT NULL,
        grade_section TEXT NOT NULL,
        school_year TEXT NOT NULL,

        fil_oral_pre_score INTEGER,
        fil_oral_pre_level TEXT,
        fil_comp_pre_score INTEGER,
        fil_comp_pre_level TEXT,

        fil_oral_post_score INTEGER,
        fil_oral_post_level TEXT,
        fil_comp_post_score INTEGER,
        fil_comp_post_level TEXT,

        eng_oral_pre_score INTEGER,
        eng_oral_pre_level TEXT,
        eng_comp_pre_score INTEGER,
        eng_comp_pre_level TEXT,

        eng_oral_post_score INTEGER,
        eng_oral_post_level TEXT,
        eng_comp_post_score INTEGER,
        eng_comp_post_level TEXT,

        numeracy_pre_score INTEGER,
        numeracy_pre_level TEXT,
        numeracy_post_score INTEGER,
        numeracy_post_level TEXT,

        intervention TEXT DEFAULT 'ARAL PROGRAM',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ mnhs_assessments table ready");
  } catch (err) {
    console.error("❌ Table creation failed:", err.message);
  }
};

// GET with filter by school year
router.get("/with-students", async (req, res) => {
  const { school_year } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT 
        s.lrn,
        s.name,
        s.sy,
        s.gender,
        s.address,
        s.guardian,
        s.elementary,
        COALESCE(a.grade_section, '') AS grade_section,
        a.school_year,
        a.fil_oral_pre_score,
        a.fil_oral_pre_level,
        a.fil_comp_pre_score,
        a.fil_comp_pre_level,
        a.fil_oral_post_score,
        a.fil_oral_post_level,
        a.fil_comp_post_score,
        a.fil_comp_post_level,
        a.eng_oral_pre_score,
        a.eng_oral_pre_level,
        a.eng_comp_pre_score,
        a.eng_comp_pre_level,
        a.eng_oral_post_score,
        a.eng_oral_post_level,
        a.eng_comp_post_score,
        a.eng_comp_post_level,
        a.numeracy_pre_score,
        a.numeracy_pre_level,
        a.numeracy_post_score,
        a.numeracy_post_level,
        COALESCE(a.intervention, 'ARAL PROGRAM') AS intervention
      FROM mnhs_students s
      LEFT JOIN mnhs_assessments a
        ON s.lrn = a.lrn AND a.school_year = $1
      ORDER BY s.name ASC
      `,
      [school_year]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(
      "❌ Failed to join mnhs_students + mnhs_assessments:",
      err.message
    );
    res.status(500).json({
      error: "Server error joining students with assessments by year.",
    });
  }
});

// POST: insert or update by lrn + school_year
router.post("/", async (req, res) => {
  const data = req.body;

  const fields = [
    "school_year",
    "name",
    "grade_section",
    "fil_oral_pre_score",
    "fil_oral_pre_level",
    "fil_comp_pre_score",
    "fil_comp_pre_level",
    "fil_oral_post_score",
    "fil_oral_post_level",
    "fil_comp_post_score",
    "fil_comp_post_level",
    "eng_oral_pre_score",
    "eng_oral_pre_level",
    "eng_comp_pre_score",
    "eng_comp_pre_level",
    "eng_oral_post_score",
    "eng_oral_post_level",
    "eng_comp_post_score",
    "eng_comp_post_level",
    "numeracy_pre_score",
    "numeracy_pre_level",
    "numeracy_post_score",
    "numeracy_post_level",
    "intervention",
  ];

  const values = fields.map((f) => {
    const value = data[f];
    if (typeof value === "string" && value.trim() === "") return null;
    return value;
  });

  const placeholders = fields.map((_, i) => `$${i + 2}`).join(", ");

  try {
    const existing = await pool.query(
      "SELECT id FROM mnhs_assessments WHERE lrn = $1 AND school_year = $2",
      [data.lrn, data.school_year]
    );

    if (existing.rows.length > 0) {
      const sets = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
      await pool.query(
        `UPDATE mnhs_assessments SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE lrn = $1 AND school_year = $2`,
        [data.lrn, data.school_year, ...values.slice(1)] // skip 1st because it's already school_year
      );
      return res.json({ message: "Updated" });
    }

    await pool.query(
      `INSERT INTO mnhs_assessments (lrn, ${fields.join(", ")})
       VALUES ($1, ${placeholders})`,
      [data.lrn, ...values]
    );

    res.status(201).json({ message: "Inserted" });
  } catch (err) {
    console.error("❌ DB error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/history/:lrn", async (req, res) => {
  const { lrn } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        school_year,
        grade_section,

        fil_oral_pre_score, fil_oral_pre_level,
        fil_comp_pre_score, fil_comp_pre_level,
        fil_oral_post_score, fil_oral_post_level,
        fil_comp_post_score, fil_comp_post_level,

        eng_oral_pre_score, eng_oral_pre_level,
        eng_comp_pre_score, eng_comp_pre_level,
        eng_oral_post_score, eng_oral_post_level,
        eng_comp_post_score, eng_comp_post_level,

        numeracy_pre_score, numeracy_pre_level,
        numeracy_post_score, numeracy_post_level,

        intervention
      FROM mnhs_assessments
      WHERE lrn = $1
      ORDER BY school_year ASC
      `,
      [lrn]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Failed to fetch assessment history:", err.message);
    res
      .status(500)
      .json({ error: "Server error fetching assessment history." });
  }
});

export default router;
