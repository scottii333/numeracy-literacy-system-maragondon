import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";

const App = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (
      email === import.meta.env.VITE_AUTH_EMAIL &&
      pw === import.meta.env.VITE_AUTH_PASSWORD
    ) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("sessionStart", Date.now().toString());
      nav("/main");
    } else {
      setErr("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-200 to-lime-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
            alt="School Icon"
            className="w-20 mx-auto mb-2"
          />
          <h1 className="text-2xl font-bold text-gray-800">
            Maragondon National High School
          </h1>
          <p className="text-gray-500 text-sm">Welcome to the school portal</p>
        </div>

        {err && (
          <div className="text-red-600 bg-red-100 border border-red-300 text-sm p-2 rounded mb-4 text-center">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={pw}
              required
              onChange={(e) => setPw(e.target.value)}
              className="pl-10 w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg transition duration-300"
          >
            Log In
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-gray-400">
          &copy; {new Date().getFullYear()} Maragondon National High School. All
          rights reserved.
        </p>
      </div>
    </div>
  );
};

export default App;
