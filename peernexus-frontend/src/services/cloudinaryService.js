import apiClient from "./apiClient.js";

export const cloudinaryService = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post("/api/upload/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // The backend returns an ApiResponse containing UploadResult { secureUrl, publicId }
      return response.data.data.secureUrl;
    } catch (error) {
      console.error("Backend brokered upload failed:", error);
      throw error;
    }
  },
};
