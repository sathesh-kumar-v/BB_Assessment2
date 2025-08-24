import api from './api';

// 📄 Upload document
export const uploadDocument = async (formData) => {
  try {
    const res = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error.response?.data || error.message;
  }
};

// 📑 Get all documents
export const listDocuments = async (filters = {}) => {
  try {
    const res = await api.get('/documents', { params: filters });
    return res.data;
  } catch (error) {
    console.error('List error:', error);
    throw error.response?.data || error.message;
  }
};

// 📂 Get single document
export const getDocument = async (id) => {
  try {
    const res = await api.get(`/documents/${id}`);
    return res.data;
  } catch (error) {
    console.error('Get error:', error);
    throw error.response?.data || error.message;
  }
};

// ✏️ Update document (rename or replace)
export const updateDocument = async (id, data) => {
  try {
    const res = await api.put(`/documents/${id}`, data, {
         headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error('Update error:', error);
    throw error.response?.data || error.message;
  }
};

// ❌ Delete document
export const deleteDocument = async (id) => {
  try {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  } catch (error) {
    console.error('Delete error:', error);
    throw error.response?.data || error.message;
  }
};
