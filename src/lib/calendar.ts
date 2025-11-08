/**
 * Calendar integration utilities
 * Generates .ics files for calendar applications (Google Calendar, Outlook, Apple Calendar, etc.)
 */

interface AppointmentCalendarData {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  serviceName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
}

/**
 * Format date for ICS file (YYYYMMDDTHHMMSS)
 */
function formatICSDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Escape text for ICS format (escape special characters)
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Generate ICS file content for an appointment
 */
export function generateICSFile(data: AppointmentCalendarData): string {
  const {
    title,
    description,
    startDate,
    endDate,
    location,
    businessName,
    businessAddress,
    businessPhone,
    businessEmail,
    serviceName,
    customerName,
    customerEmail,
    customerPhone,
    notes,
  } = data;

  // Generate unique ID for this event
  const uid = `appointment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@selfhubai.com`;

  // Build description
  let eventDescription = "";
  if (description) {
    eventDescription += `${description}\\n\\n`;
  }
  if (serviceName) {
    eventDescription += `Service: ${serviceName}\\n`;
  }
  if (businessName) {
    eventDescription += `Business: ${businessName}\\n`;
  }
  if (businessPhone) {
    eventDescription += `Phone: ${businessPhone}\\n`;
  }
  if (businessEmail) {
    eventDescription += `Email: ${businessEmail}\\n`;
  }
  if (customerName) {
    eventDescription += `\\nCustomer: ${customerName}\\n`;
  }
  if (customerPhone) {
    eventDescription += `Customer Phone: ${customerPhone}\\n`;
  }
  if (notes) {
    eventDescription += `\\nNotes: ${notes}\\n`;
  }

  // Build location string
  let locationString = "";
  if (location) {
    locationString = location;
  } else if (businessAddress) {
    locationString = businessAddress;
    if (businessName) {
      locationString = `${businessName}, ${locationString}`;
    }
  } else if (businessName) {
    locationString = businessName;
  }

  // Format dates
  const dtStart = formatICSDate(startDate);
  const dtEnd = formatICSDate(endDate);
  const dtStamp = formatICSDate(new Date()); // Current time as stamp

  // Build ICS content
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SelfHub AI//Calendar Integration//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(title)}`,
    description ? `DESCRIPTION:${escapeICS(eventDescription)}` : "",
    locationString ? `LOCATION:${escapeICS(locationString)}` : "",
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M", // 15 minutes before
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: ${escapeICS(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter((line) => line !== "") // Remove empty lines
    .join("\r\n");

  return icsContent;
}

/**
 * Download ICS file
 */
export function downloadICSFile(
  icsContent: string,
  filename: string = "appointment.ics"
): void {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate calendar download data from appointment object
 */
export function generateCalendarDataFromAppointment(appointment: any): AppointmentCalendarData {
  const business = appointment.business || {};
  const service = appointment.service || {};
  const customer = appointment.customer || {};

  // Calculate start and end times
  const startDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
  const durationMinutes = service.duration_minutes || 60; // Default 1 hour
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  // Build title
  const title = service.name
    ? `${service.name} at ${business.business_name || "Business"}`
    : `Appointment at ${business.business_name || "Business"}`;

  // Build location string
  const locationParts: string[] = [];
  if (business.address) locationParts.push(business.address);
  if (business.city) locationParts.push(business.city);
  if (business.state) locationParts.push(business.state);
  if (business.zip_code) locationParts.push(business.zip_code);
  const location = locationParts.join(", ");

  return {
    title,
    description: service.description || "",
    startDate,
    endDate,
    location,
    businessName: business.business_name,
    businessAddress: location,
    businessPhone: business.phone,
    businessEmail: business.email,
    serviceName: service.name,
    customerName: appointment.customer_name || customer.full_name,
    customerEmail: appointment.customer_email || customer.email,
    customerPhone: appointment.customer_phone || customer.phone,
    notes: appointment.notes || "",
  };
}

/**
 * Download appointment as calendar file
 */
export function downloadAppointmentCalendar(appointment: any): void {
  try {
    const calendarData = generateCalendarDataFromAppointment(appointment);
    const icsContent = generateICSFile(calendarData);
    
    // Generate filename
    const businessName = calendarData.businessName || "Business";
    const serviceName = calendarData.serviceName || "Appointment";
    const dateStr = appointment.appointment_date.replace(/-/g, "");
    const filename = `${serviceName}-${businessName}-${dateStr}.ics`
      .replace(/[^a-zA-Z0-9-]/g, "-") // Replace special chars with dashes
      .toLowerCase();
    
    downloadICSFile(icsContent, filename);
  } catch (error) {
    // Log error in development only
    if (import.meta.env.DEV) {
      console.error("Error generating calendar file:", error);
    }
    throw new Error("Failed to generate calendar file");
  }
}

