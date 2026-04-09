import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

const defaultStudentUser = {
  id: "user001",
  name: "Abish",
  role: "USER",
};

export function getCurrentUser() {
  const savedUser = localStorage.getItem("demoUser");
  return savedUser ? JSON.parse(savedUser) : defaultStudentUser;
}

export function setDemoUser(user) {
  localStorage.setItem("demoUser", JSON.stringify(user));
}

function getHeaders() {
  const user = getCurrentUser();

  return {
    "X-USER-ID": user.id,
    "X-USER-NAME": user.name,
    "X-USER-ROLE": user.role,
  };
}

function cleanFilters(filters) {
  const result = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      result[key] = value;
    }
  });

  return result;
}

export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong"
  );
}

export const bookingApi = {
  createBooking: async (bookingData) => {
    const response = await API.post("/bookings", bookingData, {
      headers: getHeaders(),
    });
    return response.data;
  },

  getMyBookings: async () => {
    const response = await API.get("/bookings/my", {
      headers: getHeaders(),
    });
    return response.data;
  },

  getAllBookings: async (filters = {}) => {
    const response = await API.get("/bookings", {
      headers: getHeaders(),
      params: cleanFilters(filters),
    });
    return response.data;
  },

  approveBooking: async (bookingId) => {
    const response = await API.patch(`/bookings/${bookingId}/approve`, null, {
      headers: getHeaders(),
    });
    return response.data;
  },

  rejectBooking: async (bookingId, reason) => {
    const response = await API.patch(
      `/bookings/${bookingId}/reject`,
      { reason },
      { headers: getHeaders() }
    );
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await API.patch(`/bookings/${bookingId}/cancel`, null, {
      headers: getHeaders(),
    });
    return response.data;
  },

  deleteBooking: async (bookingId) => {
    const response = await API.delete(`/bookings/${bookingId}`, {
      headers: getHeaders(),
    });
    return response.data;
  },
};