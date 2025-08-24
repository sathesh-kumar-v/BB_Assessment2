import { useEffect, useState, useContext } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function Editor() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const userRole = user?.role?.toLowerCase();
  const [config, setConfig] = useState(null);

  // Determine mode based on role
  const mode = userRole === "viewer" ? "view" : "edit";

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`/api/onlyoffice/config/${id}`, {
          withCredentials: true,
        });

        // Inject view/edit mode based on user role
        const editorConfig = {
          ...res.data.config,
          editorConfig: {
            ...res.data.config.editorConfig,
            mode: mode, // "edit" or "view"
          },
        };

        setConfig(editorConfig);
      } catch (err) {
        console.error("Error loading editor config", err);
      }
    };

    fetchConfig();
  }, [id, mode]);

  useEffect(() => {
    if (config) {
      const script = document.createElement("script");
      script.src = "http://localhost:8080/web-apps/apps/api/documents/api.js"; // OnlyOffice API
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
  }, [config]);

  if (!config) {
    return <p className="text-gray-500 p-4">Loading editor...</p>;
  }

  return (
    <div className="w-screen h-screen">
      <div id="onlyoffice-editor" style={{ width: "100%", height: "100vh" }} />
    </div>
  );
}
