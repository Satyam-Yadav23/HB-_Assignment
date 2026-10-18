import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

const syncUserProfileCall = httpsCallable<void, { success: boolean }>(
  functions,
  "syncUserProfile",
);

export async function syncUserProfile(): Promise<void> {
  const result = await syncUserProfileCall();
  if (!result.data.success) {
    throw new Error("The server did not confirm that your profile was saved.");
  }
}
