import axiosInstance from './authApi';

export const getAllResources = async () => {
  const response = await axiosInstance.get('/resources');
  return response.data;
};

export const getResourceById = async (id) => {
  const response = await axiosInstance.get(`/resources/${id}`);
  return response.data;
};

export const getResourcesByType = async (type) => {
  const response = await axiosInstance.get(`/resources/type/${type}`);
  return response.data;
};

export const getResourcesByStatus = async (status) => {
  const response = await axiosInstance.get(`/resources/status/${status}`);
  return response.data;
};

export const getResourcesByDepartment = async (department) => {
  const response = await axiosInstance.get(`/resources/department/${department}`);
  return response.data;
};

export const createResource = async (data) => {
  const response = await axiosInstance.post('/resources', data);
  return response.data;
};

export const updateResource = async (id, data) => {
  const response = await axiosInstance.put(`/resources/${id}`, data);
  return response.data;
};

export const deleteResource = async (id) => {
  await axiosInstance.delete(`/resources/${id}`);
};

export const updateResourceStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/resources/${id}/status`, null, {
    params: { status }
  });
  return response.data;
};

export const toggleResourceActive = async (id) => {
  const response = await axiosInstance.patch(`/resources/${id}/toggle`);
  return response.data;
};
