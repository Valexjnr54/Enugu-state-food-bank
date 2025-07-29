// utils/handleSmsError.ts
import axios from "axios";

export function handleSmsError(error: unknown, context: string = "SMS") {
  if (axios.isAxiosError(error)) {
    console.error(`[${context}] Axios error:`, error.response?.data || error.message);
  } else if (error instanceof Error) {
    console.error(`[${context}] Unknown error:`, error.message);
  } else {
    console.error(`[${context}] Non-standard error:`, error);
  }
}
