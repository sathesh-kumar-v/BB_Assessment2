import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteDocument, updateDocument } from "../services/documentService";

export default function DocumentList({ documents, setDocuments }) {
  const [editingDoc, setEditingDoc] = useState(null);
  const [newName, setNewName] = useState("");
  const [newFile, setNewFile] = useState(null);
  const navigate = useNavigate();

  // Delete doc
  const handleDelete = async (id) => {
    await deleteDocument(id);
    setDocuments((prev) => prev.filter((doc) => doc._id !== id));
  };

  // Update doc
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingDoc) return;

    const formData = new FormData();
    if (newName) formData.append("name", newName);
    if (newFile) formData.append("file", newFile);

    const updated = await updateDocument(editingDoc._id, formData);

    // update local state
    setDocuments((prev) =>
      prev.map((d) => (d._id === updated._id ? updated : d))
    );

    // reset modal
    setEditingDoc(null);
    setNewName("");
    setNewFile(null);
  };

  // Open document in editor mode
  const handleEditor = (doc) => {
    navigate(`/editor/${doc._id}?mode=edit`);
  };

  // Open document in view-only mode
// Open document directly from uploads folder
const handleView = (doc) => {
  window.open(`http://localhost:5000${doc.path}`, "_blank");
};


  return (
    <div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Uploaded By</th>
            <th className="p-2 border">Last Modified</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc._id} className="text-center">
              <td className="p-2 border">{doc.name}</td>
              <td className="p-2 border">{doc.mimeType}</td>
              <td className="p-2 border">{doc.uploadedBy?.name}</td>
              <td className="p-2 border">
                {new Date(doc.updatedAt).toLocaleString()}
              </td>
              <td className="p-2 border flex gap-2 justify-center">
                {/* 1. Rename/Replace */}
                <button
                  onClick={() => setEditingDoc(doc)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Rename/Replace
                </button>

                {/* 2. Editor */}
                <button
                  onClick={() => handleEditor(doc)}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Editor
                </button>

                {/* 3. Delete */}
                <button
                  onClick={() => handleDelete(doc._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>

                {/* 4. View */}
                <button
                  onClick={() => handleView(doc)}
                  className="bg-gray-700 text-white px-2 py-1 rounded"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Rename/Replace Modal */}
      {editingDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <form
            onSubmit={handleUpdate}
            className="bg-white p-6 rounded shadow w-96"
          >
            <h2 className="text-lg font-bold mb-4">
              Rename/Replace {editingDoc.name}
            </h2>

            <input
              type="text"
              placeholder="New name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border p-2 w-full mb-3"
            />

            <input
              type="file"
              onChange={(e) => setNewFile(e.target.files[0])}
              className="mb-3"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="bg-gray-400 px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
