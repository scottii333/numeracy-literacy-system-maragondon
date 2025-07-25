import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import exampleRoute from "./routes/exampleRoute.js";
import studentRoute from "./routes/studentRoute.js";
import { ensureTableExists } from "./routes/studentRoute.js";
import { ensureAssessmentTableExists } from "./routes/assessmentRoute.js";
import assessmentRoute from "./routes/assessmentRoute.js";
import studentData from "./routes/StudentDataRoutes.js";
import StudentSummary from "./routes/StudentSummary.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/example", exampleRoute);

app.use("/api/students", studentRoute);
app.use("/api/assessments", assessmentRoute);
app.use("/api/student-data", studentData);
app.use("/api/summary", StudentSummary);

await ensureAssessmentTableExists();
await ensureTableExists();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
