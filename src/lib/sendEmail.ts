/**
 * Send email notification via Edge Function
 */
export async function sendEmailNotification(
  to: string,
  subject: string,
  template: string,
  data: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error("Supabase configuration missing");
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          to,
          subject,
          template,
          data,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Email failed: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return { success: true };
  } catch (error: any) {
    // Error is logged but not exposed to user
    // In production, could send to error tracking service
    return { success: false, error: error.message };
  }
}

