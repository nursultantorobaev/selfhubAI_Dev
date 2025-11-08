// Supabase Edge Function: Send Email
// This function sends emails using Resend API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "noreply@selfhubai.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify the request has authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Allow calls from database functions (anon key) or authenticated users
    // Database functions use anon key, so we'll allow it
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    // Check if this is a service role or anon key (for database function calls)
    const isServiceRole = serviceRoleKey && authHeader.includes(serviceRoleKey);
    const isAnonKey = anonKey && authHeader.includes(anonKey);
    
    // If using anon key or service role, allow (for database function calls)
    // Otherwise, verify user authentication
    if (!isServiceRole && !isAnonKey) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        anonKey ?? "",
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      );

      // Verify user is authenticated
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Unauthorized");
      }
    }

    // Parse request body
    const { to, subject, template, data } = await req.json();

    if (!to || !subject || !template) {
      throw new Error("Missing required fields: to, subject, template");
    }

    // Generate email HTML based on template
    const emailHtml = generateEmailTemplate(template, data);

    // Send email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [to],
        subject: subject,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const result = await resendResponse.json();

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

// Email template generator
function generateEmailTemplate(template: string, data: any): string {
  const baseStyles = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
      .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      .info-box { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #667eea; }
      .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
      .info-label { font-weight: bold; color: #666; }
      .info-value { color: #333; }
    </style>
  `;

  switch (template) {
    case "booking_confirmation":
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Booking Confirmation</title>
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.customer_name || "Customer"},</p>
              <p>Your appointment has been confirmed. We're looking forward to seeing you!</p>
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Business:</span>
                  <span class="info-value">${data.business_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Service:</span>
                  <span class="info-value">${data.service_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date:</span>
                  <span class="info-value">${data.appointment_date}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Time:</span>
                  <span class="info-value">${data.appointment_time}</span>
                </div>
              </div>
              <p>If you need to cancel or reschedule, please contact the business directly.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from SelfHub AI</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "booking_reminder":
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Appointment Reminder</title>
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Appointment Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${data.customer_name || "Customer"},</p>
              <p>This is a friendly reminder that you have an appointment tomorrow:</p>
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Business:</span>
                  <span class="info-value">${data.business_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Service:</span>
                  <span class="info-value">${data.service_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date:</span>
                  <span class="info-value">${data.appointment_date}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Time:</span>
                  <span class="info-value">${data.appointment_time}</span>
                </div>
              </div>
              <p>We look forward to seeing you!</p>
            </div>
            <div class="footer">
              <p>This is an automated reminder from SelfHub AI</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "booking_cancellation":
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Booking Cancelled</title>
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <h1>Booking Cancelled</h1>
            </div>
            <div class="content">
              <p>Hi ${data.customer_name || "Customer"},</p>
              <p>Your appointment has been cancelled:</p>
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Business:</span>
                  <span class="info-value">${data.business_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Service:</span>
                  <span class="info-value">${data.service_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date:</span>
                  <span class="info-value">${data.appointment_date}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Time:</span>
                  <span class="info-value">${data.appointment_time}</span>
                </div>
              </div>
              ${data.cancellation_reason ? `
                <div class="info-box" style="background: #fff3cd; border-left-color: #ffc107;">
                  <p style="margin: 0;"><strong>Reason:</strong> ${data.cancellation_reason}</p>
                </div>
              ` : ''}
              ${data.is_late_cancellation ? `
                <div class="info-box" style="background: #f8d7da; border-left-color: #dc3545; margin-top: 15px;">
                  <p style="margin: 0;"><strong>Note:</strong> This cancellation was made within 24 hours of the appointment time and may be subject to the business's cancellation policy.</p>
                </div>
              ` : ''}
              <p>If you'd like to reschedule, please book a new appointment.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from SelfHub AI</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "new_booking_alert":
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>New Booking</title>
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <h1>🔔 New Booking!</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>You have a new booking for ${data.business_name}:</p>
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Customer:</span>
                  <span class="info-value">${data.customer_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Service:</span>
                  <span class="info-value">${data.service_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date:</span>
                  <span class="info-value">${data.appointment_date}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Time:</span>
                  <span class="info-value">${data.appointment_time}</span>
                </div>
              </div>
              <p>Please confirm this booking in your dashboard.</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from SelfHub AI</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "new_review":
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>New Review</title>
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
              <h1>⭐ New Review!</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>${data.customer_name} left a ${data.rating}-star review for ${data.business_name}:</p>
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Rating:</span>
                  <span class="info-value">${"⭐".repeat(data.rating)} ${data.rating}/5</span>
                </div>
                ${data.review_text ? `
                  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                    <p style="font-style: italic; color: #666;">"${data.review_text}"</p>
                  </div>
                ` : ""}
              </div>
              <p>Thank you for providing excellent service!</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from SelfHub AI</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "booking_cancellation_owner":
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Booking Cancelled</title>
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <h1>Booking Cancelled</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>A booking has been cancelled for ${data.business_name}:</p>
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Customer:</span>
                  <span class="info-value">${data.customer_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Service:</span>
                  <span class="info-value">${data.service_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date:</span>
                  <span class="info-value">${data.appointment_date}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Time:</span>
                  <span class="info-value">${data.appointment_time}</span>
                </div>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated notification from SelfHub AI</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "booking_rescheduled":
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Appointment Rescheduled</title>
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h1>📅 Appointment Rescheduled</h1>
            </div>
            <div class="content">
              <p>Hi ${data.customer_name || "Customer"},</p>
              <p>Your appointment has been rescheduled:</p>
              <div class="info-box" style="background: #fff3cd; border-left-color: #ffc107; margin-bottom: 15px;">
                <p style="margin: 0; font-weight: bold;">Previous Time:</p>
                <p style="margin: 5px 0 0 0;">${data.old_appointment_date} at ${data.old_appointment_time}</p>
              </div>
              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Business:</span>
                  <span class="info-value">${data.business_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Service:</span>
                  <span class="info-value">${data.service_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">New Date:</span>
                  <span class="info-value">${data.new_appointment_date}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">New Time:</span>
                  <span class="info-value">${data.new_appointment_time}</span>
                </div>
              </div>
              <p>We look forward to seeing you at the new time!</p>
            </div>
            <div class="footer">
              <p>This is an automated message from SelfHub AI</p>
            </div>
          </div>
        </body>
        </html>
      `;

    default:
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${data.subject || "Notification"}</title>
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="content">
              <p>${JSON.stringify(data, null, 2)}</p>
            </div>
          </div>
        </body>
        </html>
      `;
  }
}

