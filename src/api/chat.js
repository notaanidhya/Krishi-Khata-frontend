/**
 * Chat API Layer — uses centralized apiClient with JWT interceptor.
 * REST endpoints for history + image upload.
 * WebSocket is handled directly in the CommunityPage component.
 */

import apiClient from './apiClient';

/**
 * Fetch the last 50 chat messages (oldest first).
 * @returns {Promise<Array>} List of ChatMessageResponse objects
 */
export const getChatHistory = async () => {
  const { data } = await apiClient.get('/api/v1/chat/history');
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
  const { data } = await apiClient.post('/api/v1/chat/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
};
