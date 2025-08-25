// src/pages/Editor.jsx
import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function Editor() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const userRole = user?.role?.toLowerCase();
  const [config, setConfig] = useState(null);
  const [docServerApiJs, setDocServerApiJs] = useState(null);

  // Determine mode based on role
  const mode = userRole === "viewer" ? "view" : "edit";

  // ✅ use environment variable for backend API
  const API_BASE =
    import.meta.env.VITE_API_URL || "https://bb-assessment2.onrender.com";
    console.log("API_BASE =>", API_BASE);
console.log("ENV VAR =>", import.meta.env.VITE_API_URL);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem("token"); // stored at login
        const res = await axios.get(
          `${API_BASE}/api/onlyoffice/config/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // ✅ backend sends { config, token, docServerApiJs }
        setConfig(res.data.config);
        setDocServerApiJs(res.data.docServerApiJs);
      } catch (err) {
        console.error("Error loading editor config", err);
      }
    };

    fetchConfig();
  }, [id, API_BASE]);

  useEffect(() => {
    if (config && docServerApiJs) {
      const script = document.createElement("script");
      script.src = docServerApiJs; // ✅ now we have it in state
      script.async = true;
      script.onload = () => {
        if (window.DocsAPI) {
          new window.DocsAPI.DocEditor("onlyoffice-editor", config);
        } else {
          console.error("DocsAPI not available");
        }
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [config, docServerApiJs]);

  if (!config) {
    return <p className="text-gray-500 p-4">Loading editor...</p>;
  }

  return (
    <div className="w-screen h-screen">
      {/* ✅ Editor container */}
      <div id="onlyoffice-editor" style={{ width: "100%", height: "100vh" }} />
    </div>
  );
}
