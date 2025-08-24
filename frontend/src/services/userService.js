import api from './api';

// 👥 Get all users (Admin only)
export const listUsers = async () => {
  try {
    const res = await api.get('/users');
    return res.data;
  } catch (error) {
    console.error('List users error:', error);
    throw error.response?.data || error.message;
  }
};

// 👤 Get user profile
export const getProfile = async () => {
  try {
    const res = await api.get('/users/profile');
    return res.data;
  } catch (error) {
    console.error('Profile error:', error);
    throw error.response?.data || error.message;
  }
};

// ✏️ Update user profile
export const updateProfile = async (data) => {
  try {
    const res = await api.put('/users/profile', data);
    return res.data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error.response?.data || error.message;
  }
};

// ❌ Delete user (Admin only)
export const deleteUser = async (id) => {
  try {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error.response?.data || error.message;
  }
};
