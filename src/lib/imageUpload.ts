import { supabase } from "@/integrations/supabase/client";

export type ImageType = "logo" | "cover" | "avatar" | "service";

const BUCKETS = {
  logo: "business-logos",
  cover: "business-covers",
  avatar: "user-avatars",
  service: "service-images",
} as const;

/**
 * Upload an image to Supabase Storage
 * @param file - The image file to upload
 * @param type - Type of image (logo, cover, or avatar)
 * @param userId - User ID for organizing files (optional, defaults to current user)
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  type: ImageType,
  userId?: string
): Promise<string> {
  const bucket = BUCKETS[type];
  
  // Get current user if userId not provided
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !userId) {
    throw new Error("User must be authenticated to upload images");
  }
  
  const fileUserId = userId || user!.id;
  
  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${fileUserId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid file type. Please upload a JPEG, PNG, or WebP image.");
  }
  
  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File size must be less than 5MB.");
  }
  
  // Upload file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });
  
  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);
  
  return publicUrl;
}

/**
 * Delete an image from Supabase Storage
 * @param url - The public URL of the image to delete
 * @param type - Type of image (logo, cover, or avatar)
 */
export async function deleteImage(url: string, type: ImageType): Promise<void> {
  const bucket = BUCKETS[type];
  
  // Extract file path from URL
  const urlParts = url.split(`/${bucket}/`);
  if (urlParts.length < 2) {
    throw new Error("Invalid image URL");
  }
  
  const filePath = urlParts[1];
  
  // Delete file
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);
  
  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Get public URL for an image
 * @param path - Storage path
 * @param type - Type of image
 */
export function getImageUrl(path: string, type: ImageType): string {
  const bucket = BUCKETS[type];
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  return publicUrl;
}

