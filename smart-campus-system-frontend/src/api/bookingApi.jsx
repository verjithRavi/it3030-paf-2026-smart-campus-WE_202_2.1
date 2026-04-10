import axios from "axios";
import { getCurrentUserData, getToken } from "../utils/token";

const API = axios.create({
  baseURL: "/api",
});

function getBookingUser() {
  return getCurrentUserData();
}

function getHeaders() {
  const user = getBookingUser();
  const token = getToken();

  if (!user) {
    throw new Error("Unable to find the current user session. Please sign in again.");
  }

  const headers = {
    "X-USER-ID": user.userId || user.id,
    "X-USER-NAME": user.name,
    "X-USER-ROLE": user.role,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
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
