import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { uploadImage, deleteImage, type ImageType } from "@/lib/imageUpload";
import { toast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageChange: (url: string | null) => void;
  type: ImageType;
  label?: string;
  description?: string;
  className?: string;
}

export const ImageUpload = ({
  currentImageUrl,
  onImageChange,
  type,
  label = "Upload Image",
  description,
  className,
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    setUploading(true);
    try {
      // Delete old image if exists
      if (currentImageUrl) {
        try {
          await deleteImage(currentImageUrl, type);
        } catch (error) {
          // Ignore delete errors (image might not exist)
          // Silently fail - old image deletion is non-critical
        }
      }

      const imageUrl = await uploadImage(file, type);
      onImageChange(imageUrl);
      
      toast({
        title: "Image Uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (currentImageUrl) {
      try {
        await deleteImage(currentImageUrl, type);
      } catch (error) {
        // Silently fail - image deletion is non-critical
      }
    }
    
    setPreview(null);
    onImageChange(null);
    
    toast({
      title: "Image Removed",
      description: "Image has been removed successfully.",
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      <div className="flex items-center gap-4">
        {/* Preview */}
        {preview && (
          <div className="relative group">
            <div className={cn(
              "border-2 border-dashed rounded-lg overflow-hidden",
              type === "cover" ? "w-32 h-20" : "w-20 h-20"
            )}>
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            {!uploading && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Upload Button */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            id={`image-upload-${type}`}
            disabled={uploading}
          />
          <label htmlFor={`image-upload-${type}`}>
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              className="cursor-pointer"
              asChild
            >
              <span>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : preview ? (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Change Image
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {label}
                  </>
                )}
              </span>
            </Button>
          </label>
          {!preview && (
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, or WebP (max 5MB)
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

