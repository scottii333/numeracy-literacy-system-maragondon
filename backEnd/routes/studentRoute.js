import express from "express";
import pool from "../db/supabase.js";

const router = express.Router();

// Ensure table exists
export const ensureTableExists = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mnhs_students (
        id SERIAL PRIMARY KEY,
        lrn TEXT UNIQUE NOT NULL,
        sy TEXT NOT NULL,
        name TEXT NOT NULL,
        gender TEXT NOT NULL,
        address TEXT NOT NULL,
        guardian TEXT NOT NULL,
        elementary TEXT NOT NULL
      );
    `);
  } catch (err) {
    console.error("Error creating table:", err.message);
  }
};

// Insert single student
router.post("/", async (req, res) => {
  try {
    const { lrn, sy, name, gender, address, guardian, elementary } = req.body;

    const existing = await pool.query(
      "SELECT * FROM mnhs_students WHERE lrn = $1",
      [lrn]
    );
    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ error: `Student with LRN ${lrn} already exists.` });
    }

    await pool.query(
      `INSERT INTO mnhs_students (lrn, sy, name, gender, address, guardian, elementary)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [lrn, sy, name, gender, address, guardian, elementary]
    );

    res.status(201).json({ message: "Student inserted successfully." });
  } catch (err) {
    console.error("Insert error:", err.message);
    res.status(500).json({ error: "Server error inserting student." });
  }
});

router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM mnhs_students ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch students." });
  }
});

router.delete("/:lrn", async (req, res) => {
  const { lrn } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM mnhs_students WHERE lrn = $1",
      [lrn]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Student not found." });
    }
    res.json({ message: "Student deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Error deleting student." });
  }
});

export default router;
