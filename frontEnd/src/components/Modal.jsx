import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Modal = ({ visible, onStay }) => {
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    if (!visible) return;

    setCountdown(60); // reset when modal is shown

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect after countdown reaches 0
          localStorage.clear(); // Clear auth if needed
          navigate("/"); // Redirect to login
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, navigate]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h3 className="text-xl font-semibold mb-2">Inactive Warning</h3>
        <p className="mb-4">
          You’ll be logged out in <span className="font-bold">{countdown}</span>{" "}
          seconds.
        </p>
        <button
          onClick={onStay}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Stay Logged In
        </button>
      </div>
    </div>
  );
};

export default Modal;
