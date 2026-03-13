import { MeetingAnalysis, SessionType } from "../types";
import { auth } from "./firebase";

// Helper to convert Blob to Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const analyzeMeetingAudio = async (
  audioBlob: Blob, 
  language: string = 'English', 
  sessionType: SessionType = SessionType.MEETING
): Promise<MeetingAnalysis> => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  formData.append("language", language);
  formData.append("sessionType", sessionType);

  const headers: Record<string, string> = {};
  const uid = auth.currentUser?.uid;
  if (uid) {
    headers['x-user-id'] = uid;
  }

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to analyze audio");
  }

  return response.json();
};

// We create a mock chat session object that mimics the GoogleGenAI chat interface
export const createMeetingChatSession = async (audioBlob: Blob, sessionType: SessionType = SessionType.MEETING) => {
  const base64Audio = await blobToBase64(audioBlob);
  const mimeType = audioBlob.type || 'audio/webm';
  const history: { role: string, content: string }[] = [];

  return {
    sendMessage: async ({ message }: { message: string }) => {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const uid = auth.currentUser?.uid;
      if (uid) {
        headers['x-user-id'] = uid;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          base64Audio,
          mimeType,
          sessionType,
          message,
          history
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();
      
      // Add to local history for subsequent requests
      history.push({ role: "user", content: message });
      history.push({ role: "model", content: data.text });

      return { text: data.text };
    }
  };
};
