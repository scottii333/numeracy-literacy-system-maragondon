import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import ProtectedRoute from "./components/ProtectedRoute";
import { MainLayout } from "./components/MainLayout";
import { HomePage } from "./components/HomePage";
import { StudentEntry } from "./components/StudentEntry";
import { StudentData } from "./components/StudentData";
import { StudentGradings } from "./components/StudentGradings";
import { DataSummary } from "./components/DataSummary";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/main",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true, // ✅ this means "/main" will render HomePage
        element: <HomePage />,
      },
      {
        path: "student-entry",
        element: <StudentEntry />,
      },
      {
        path: "student-data",
        element: <StudentData />,
      },
      {
        path: "student-gradings",
        element: <StudentGradings />,
      },
      {
        path: "data-summary",
        element: <DataSummary />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
