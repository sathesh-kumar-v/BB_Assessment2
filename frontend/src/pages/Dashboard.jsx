import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { listDocuments } from '../services/documentService';
import DocumentList from '../components/DocumentList';
import UploadForm from '../components/UploadForm';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userRole = user?.role?.toLowerCase();

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const res = await listDocuments();
        setDocuments(res?.docs || []);
      } catch (err) {
        console.error('Failed to fetch documents', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const canUpload = ['admin', 'editor', 'viewer'].includes(userRole);

  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Welcome, {user?.name || 'User'}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* Upload Button */}
      {canUpload && <UploadForm setDocuments={setDocuments} />}

      {/* Documents Section */}
      {loading ? (
        <p className="text-gray-500">Loading documents...</p>
      ) : documents.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg font-semibold mb-2">No documents found</p>
          <p className="italic mb-4">
            {['admin', 'editor'].includes(userRole)
              ? 'Upload your first document using the form above.'
              : 'Please check back later.'}
          </p>
          <div className="flex justify-center">
            <svg
              className="w-20 h-20 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-6h13v6M9 11V7a2 2 0 012-2h10a2 2 0 012 2v4M9 17H5a2 2 0 01-2-2V7a2 2 0 012-2h4"
              />
            </svg>
          </div>
        </div>
      ) : (
        <DocumentList documents={documents} setDocuments={setDocuments} userRole={userRole} />
      )}
    </div>
  );
}
