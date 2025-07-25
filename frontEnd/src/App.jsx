import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      setErr("Wrong credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={submit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-xl mb-4">Login</h2>
        {err && <p className="text-red-500 mb-2">{err}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={pw}
          required
          onChange={(e) => setPw(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default App;
