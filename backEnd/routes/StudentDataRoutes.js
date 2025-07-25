import express from "express";
import pool from "../db/supabase.js";

const router = express.Router();

// GET all students: for dropdown list
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT lrn, name FROM mnhs_students ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Failed to fetch student list:", err.message);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// GET single student info by LRN
router.get("/:lrn", async (req, res) => {
  const { lrn } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT 
        lrn, 
        name, 
        gender, 
        address, 
        guardian, 
        elementary,
        sy
      FROM mnhs_students
      WHERE lrn = $1
      `,
      [lrn]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found." });
    }

    // Add static school info
    const enrichedStudent = {
      ...result.rows[0],
      school_id: "301204",
      municipality: "MARAGONDON",
      division: "CAVITE PROVINCE",
    };

    res.json(enrichedStudent);
  } catch (err) {
    console.error("❌ Failed to fetch student info:", err.message);
    res.status(500).json({ error: "Server error retrieving student info." });
  }
});

export default router;
