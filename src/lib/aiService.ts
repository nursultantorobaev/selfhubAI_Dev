/**
 * AI Service for SelfHub AI
 * Handles AI-powered business setup and content generation
 */

interface BusinessSetupResult {
  business_name: string;
  business_type: string;
  description: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  services: Array<{
    name: string;
    description?: string;
    price: number;
    duration_minutes: number;
  }>;
  hours: Array<{
    day_of_week: number;
    open_time: string;
    close_time: string;
    is_closed: boolean;
  }>;
}

/**
 * Generate business setup from natural language description
 */
export async function generateBusinessFromPrompt(
  userPrompt: string,
  apiKey?: string
): Promise<BusinessSetupResult> {
  const openaiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY;

  if (!openaiKey) {
    throw new Error("OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.");
  }

  const prompt = `You are a business setup assistant for a beauty and wellness booking platform. 
Parse the user's business description and extract structured information.

User Description:
"${userPrompt}"

Extract and return a JSON object with this exact structure:
{
  "business_name": "suggested business name",
  "business_type": "salon|barbershop|spa|nails|massage|fitness|beauty|wellness|other",
  "description": "SEO-optimized business description (2-3 sentences)",
  "address": "street address (REQUIRED - use a reasonable default if not mentioned)",
  "city": "city name (REQUIRED - use a reasonable default if not mentioned)",
  "state": "state abbreviation if mentioned",
  "zip_code": "zip code if mentioned",
  "phone": "phone number in format XXX-XXX-XXXX (REQUIRED - use a placeholder if not mentioned)",
  "email": "email if mentioned",
  "website": "website if mentioned",
  "services": [
    {
      "name": "service name",
      "description": "brief description",
      "price": 0,
      "duration_minutes": 30
    }
  ],
  "hours": [
    {
      "day_of_week": 0,
      "open_time": "09:00",
      "close_time": "17:00",
      "is_closed": false
    }
  ]
}

IMPORTANT RULES:
- business_name: REQUIRED - Generate a professional name if not provided
- address: REQUIRED - Must be at least 5 characters. Use a reasonable default like "123 Main Street" if not mentioned
- city: REQUIRED - Must be at least 2 characters. Use a reasonable default like "New York" if not mentioned  
- phone: REQUIRED - Must be at least 10 characters. Use format "555-000-0000" if not mentioned
- day_of_week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
- If hours not specified, use Monday-Friday 9am-5pm, Saturday 10am-4pm, Sunday closed
- Extract services with prices and durations from the description
- Generate a professional business name if not provided
- Create an engaging description highlighting unique features

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using mini for cost efficiency, can upgrade to gpt-4 if needed
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that extracts business information from natural language and returns only valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        response_format: { type: "json_object" }, // Force JSON response
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse JSON response
    const result = JSON.parse(content) as BusinessSetupResult;

    // Validate and clean the result
    return validateAndCleanBusinessResult(result);
  } catch (error: any) {
    // Provide user-friendly error messages
    if (error.message?.includes("API key") || error.message?.includes("401")) {
      throw new Error("Invalid OpenAI API key. Please check your .env file.");
    }
    if (error.message?.includes("429")) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    if (error.message?.includes("insufficient_quota")) {
      throw new Error("OpenAI account has insufficient credits. Please add credits to your account.");
    }
    throw new Error(`Failed to generate business setup: ${error.message || "Unknown error"}`);
  }
}

/**
 * Validate and clean AI-generated business data
 */
function validateAndCleanBusinessResult(result: any): BusinessSetupResult {
  // Ensure required fields
  const cleaned: BusinessSetupResult = {
    business_name: result.business_name || "My Business",
    business_type: result.business_type || "other",
    description: result.description || "",
    services: Array.isArray(result.services) ? result.services : [],
    hours: Array.isArray(result.hours) ? result.hours : generateDefaultHours(),
  };

  // Add optional fields
  if (result.address) cleaned.address = result.address;
  if (result.city) cleaned.city = result.city;
  if (result.state) cleaned.state = result.state;
  if (result.zip_code) cleaned.zip_code = result.zip_code;
  if (result.phone) cleaned.phone = result.phone;
  if (result.email) cleaned.email = result.email;
  if (result.website) cleaned.website = result.website;

  // Validate business type
  const validTypes = ["salon", "barbershop", "spa", "nails", "massage", "fitness", "beauty", "wellness", "other"];
  if (!validTypes.includes(cleaned.business_type)) {
    cleaned.business_type = "other";
  }

  // Validate and clean services
  cleaned.services = cleaned.services
    .filter((s) => s.name && s.price >= 0 && s.duration_minutes > 0)
    .map((s) => ({
      name: s.name.trim(),
      description: s.description?.trim() || "",
      price: Math.max(0, Number(s.price) || 0),
      duration_minutes: Math.max(1, Number(s.duration_minutes) || 30),
    }));

  // Validate and clean hours
  cleaned.hours = cleaned.hours.map((h) => ({
    day_of_week: Math.max(0, Math.min(6, Number(h.day_of_week) || 0)),
    open_time: validateTime(h.open_time) || "09:00",
    close_time: validateTime(h.close_time) || "17:00",
    is_closed: Boolean(h.is_closed),
  }));

  return cleaned;
}

/**
 * Generate default business hours (Monday-Friday 9am-5pm)
 */
function generateDefaultHours() {
  return [
    { day_of_week: 0, open_time: "09:00", close_time: "17:00", is_closed: true }, // Sunday
    { day_of_week: 1, open_time: "09:00", close_time: "17:00", is_closed: false }, // Monday
    { day_of_week: 2, open_time: "09:00", close_time: "17:00", is_closed: false }, // Tuesday
    { day_of_week: 3, open_time: "09:00", close_time: "17:00", is_closed: false }, // Wednesday
    { day_of_week: 4, open_time: "09:00", close_time: "17:00", is_closed: false }, // Thursday
    { day_of_week: 5, open_time: "09:00", close_time: "17:00", is_closed: false }, // Friday
    { day_of_week: 6, open_time: "09:00", close_time: "17:00", is_closed: true }, // Saturday
  ];
}

/**
 * Validate time format (HH:MM)
 */
function validateTime(time: string): string | null {
  if (!time || typeof time !== "string") return null;
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Generate service description using AI
 */
export async function generateServiceDescription(
  serviceName: string,
  businessType: string,
  apiKey?: string
): Promise<string> {
  const openaiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY;

  if (!openaiKey) {
    return ""; // Return empty if no API key
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a marketing assistant that writes brief, engaging service descriptions for beauty and wellness businesses.",
          },
          {
            role: "user",
            content: `Write a brief, professional description (1-2 sentences) for a "${serviceName}" service at a ${businessType}.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      return "";
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    // Silently fail - description is optional
    return "";
  }
}

/**
 * Enhance search query with AI (for natural language search)
 */
export async function enhanceSearchQuery(
  userQuery: string,
  apiKey?: string
): Promise<{
  businessType?: string;
  serviceKeywords?: string[];
  location?: string;
}> {
  const openaiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY;

  if (!openaiKey) {
    // Fallback to simple parsing
    return parseSearchQuerySimple(userQuery);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Extract business type, service keywords, and location from search queries. Return JSON.",
          },
          {
            role: "user",
            content: `Extract search parameters from: "${userQuery}"

Return JSON:
{
  "businessType": "salon|barbershop|spa|nails|massage|fitness|beauty|wellness|other|null",
  "serviceKeywords": ["keyword1", "keyword2"],
  "location": "city name or null"
}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return parseSearchQuerySimple(userQuery);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
  } catch (error) {
    // Fallback to simple parsing on error
  }

  return parseSearchQuerySimple(userQuery);
}

/**
 * Simple fallback parser for search queries
 */
function parseSearchQuerySimple(query: string) {
  const businessTypes = ["salon", "barbershop", "spa", "nails", "massage", "fitness", "beauty", "wellness"];
  const lowerQuery = query.toLowerCase();

  let businessType: string | undefined;
  for (const type of businessTypes) {
    if (lowerQuery.includes(type)) {
      businessType = type;
      break;
    }
  }

  return {
    businessType,
    serviceKeywords: [],
    location: undefined,
  };
}

