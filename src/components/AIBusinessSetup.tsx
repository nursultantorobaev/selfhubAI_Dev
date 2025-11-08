import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Sparkles, Wand2, CheckCircle2, AlertCircle } from "lucide-react";
import { generateBusinessFromPrompt } from "@/lib/aiService";
import { toast } from "@/hooks/use-toast";

interface AIBusinessSetupProps {
  onBusinessGenerated: (businessData: any) => void;
  onCancel: () => void;
}

export const AIBusinessSetup = ({ onBusinessGenerated, onCancel }: AIBusinessSetupProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a description",
        description: "Describe your business to get started.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedData(null);

    try {
      const result = await generateBusinessFromPrompt(prompt);
      setGeneratedData(result);
      toast({
        title: "Business Generated!",
        description: "Review the details and click 'Use This' to continue.",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to generate business setup. Please try again.";
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage.includes("API key") 
          ? "Please check your OpenAI API key in the .env file."
          : "Please try again or use the manual form instead.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseGenerated = () => {
    if (generatedData) {
      onBusinessGenerated(generatedData);
    }
  };

  const handleEdit = () => {
    setGeneratedData(null);
    setPrompt("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Quick Setup
        </CardTitle>
        <CardDescription>
          Describe your business in natural language and AI will set everything up for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedData ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Describe your business (be as detailed as possible)
              </label>
              <Textarea
                placeholder="Example: I run a barbershop in New York City. I'm open Monday to Saturday 9am to 7pm. I offer haircuts for $30, beard trims for $15, hot towel shaves for $25, and haircut with beard combo for $40. I'm located at 123 Main Street, NYC."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px]"
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground">
                Include: business type, location, hours, services with prices, and any other details
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Business Setup
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Business setup generated! Review the details below and click "Use This" to continue.
              </AlertDescription>
            </Alert>

            {isGenerating ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                <div>
                  <h3 className="font-semibold mb-1">Business Name</h3>
                  <p>{generatedData.business_name}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Type</h3>
                  <p className="capitalize">{generatedData.business_type}</p>
                </div>

                {generatedData.description && (
                  <div>
                    <h3 className="font-semibold mb-1">Description</h3>
                    <p className="text-sm text-muted-foreground">{generatedData.description}</p>
                  </div>
                )}

                {generatedData.address && (
                  <div>
                    <h3 className="font-semibold mb-1">Address</h3>
                    <p className="text-sm">
                      {generatedData.address}
                      {generatedData.city && `, ${generatedData.city}`}
                      {generatedData.state && `, ${generatedData.state}`}
                      {generatedData.zip_code && ` ${generatedData.zip_code}`}
                    </p>
                  </div>
                )}

                {generatedData.services && generatedData.services.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Services ({generatedData.services.length})</h3>
                    <div className="space-y-2">
                      {generatedData.services.map((service: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-start p-2 bg-background rounded">
                          <div className="flex-1">
                            <p className="font-medium">{service.name}</p>
                            {service.description && (
                              <p className="text-xs text-muted-foreground">{service.description}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold">
                              ${service.price} / {service.duration_minutes} min
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generatedData.hours && (
                  <div>
                    <h3 className="font-semibold mb-2">Business Hours</h3>
                    <div className="space-y-1 text-sm">
                      {generatedData.hours.map((hour: any, idx: number) => {
                        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        return (
                          <div key={idx} className="flex justify-between">
                            <span className={hour.is_closed ? "text-muted-foreground line-through" : ""}>
                              {dayNames[hour.day_of_week]}
                            </span>
                            <span className={hour.is_closed ? "text-muted-foreground" : ""}>
                              {hour.is_closed ? "Closed" : `${hour.open_time} - ${hour.close_time}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleUseGenerated} className="flex-1" disabled={isGenerating}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Use This Setup
              </Button>
              <Button variant="outline" onClick={handleEdit} disabled={isGenerating}>
                Edit Prompt
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

