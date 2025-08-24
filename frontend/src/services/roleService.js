import api from './api';

// 🎭 Get roles list (Admin)
export const listRoles = async () => {
  try {
    const res = await api.get('/roles');
    return res.data;
  } catch (error) {
    console.error('List roles error:', error);
    throw error.response?.data || error.message;
  }
};

// 🔄 Update role for user
export const updateUserRole = async (userId, role) => {
  try {
    const res = await api.put(`/roles/${userId}`, { role });
    return res.data;
  } catch (error) {
    console.error('Update role error:', error);
    throw error.response?.data || error.message;
  }
};
