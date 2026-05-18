/**
 * Chat API Layer — Axios fetchers for community chat.
 * REST endpoints for history + image upload.
 * WebSocket is handled directly in the CommunityPage component.
 */

import axios from 'axios';

const API_BASE = 'https://krishi-khata.onrender.com/api/v1/chat';

/**
 * Fetch the last 50 chat messages (oldest first).
 * @returns {Promise<Array>} List of ChatMessageResponse objects
 */
export const getChatHistory = async () => {
  const { data } = await axios.get(`${API_BASE}/history`);
  return data;
};

/**
 * Upload an image to the chat server.
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} The static URL of the uploaded image
 */
export const uploadChatImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await axios.post(`${API_BASE}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
};
