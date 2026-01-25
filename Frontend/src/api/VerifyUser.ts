import { api } from "./axiosInstance";

// Sends the Google ID Token to the backend for verification and user registration
export const verifyGoogleToken = async (tokenId: string) => {
  const response = await api.post("/register", { tokenId });
  return response.data;
};
