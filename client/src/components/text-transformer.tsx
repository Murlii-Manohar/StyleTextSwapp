import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Copy, RefreshCw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useLocation } from "wouter";

type TransformResponse = {
  transformedText: string;
  guestUsage?: {
    usageCount: number;
    maxUsage: number;
    remainingUses: number;
  };
};

export default function TextTransformer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, guestSession } = useAuth();
  const [inputText, setInputText] = useState("");
  const [transformedText, setTransformedText] = useState("");
  const [targetStyle, setTargetStyle] = useState("casual");
  const [preservationPercentage, setPreservationPercentage] = useState(50); // Default to 50%
  const [wordCount, setWordCount] = useState(0);
  const resultTextRef = useRef<HTMLDivElement>(null);

  // Calculate word count when input changes
  useEffect(() => {
    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [inputText]);

  // Text transformation mutation
  const transformMutation = useMutation<TransformResponse, Error, { originalText: string; toStyle: string; preservationPercentage: number }>({
    mutationFn: async ({ originalText, toStyle, preservationPercentage }) => {
      const res = await apiRequest("POST", "/api/transform", {
        originalText,
        toStyle,
        preservationPercentage,
      });
      
      if (!res.ok) {
        // Handle API errors specifically
        const errorData = await res.json();
        
        if (res.status === 429) {
          throw new Error("OpenAI API rate limit reached. Please try again later.");
        } else if (res.status === 401 || res.status === 403) {
          if (errorData.message?.includes("Guest usage limit")) {
            throw new Error("Guest usage limit reached");
          } else {
            throw new Error("API key error. Please check your OpenAI API key.");
          }
        } else {
          throw new Error(errorData.message || "An error occurred during transformation.");
        }
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      setTransformedText(data.transformedText);
      
      // Update guest usage if available
      if (data.guestUsage) {
        // This will be handled by the AuthContext automatically
      }
      
      toast({
        title: "Success",
        description: "Text transformed successfully!",
      });
    },
    onError: (error) => {
      // Check if error message contains "limit reached"
      if (error.message.includes("limit reached") || error.message.includes("Guest usage limit")) {
        toast({
          title: "Usage Limit Reached",
          description: "You've reached the guest limit. Sign up for unlimited transformations!",
          variant: "destructive",
        });
        
        // Redirect to auth page after a short delay
        setTimeout(() => {
          setLocation("/auth");
        }, 2000);
      } else if (error.message.includes("API key") || error.message.includes("rate limit")) {
        toast({
          title: "API Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to transform text: ${error.message}`,
          variant: "destructive",
        });
      }
    },
  });

  // Handle text transformation
  const handleTransform = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to transform.",
        variant: "destructive",
      });
      return;
    }

    transformMutation.mutate({
      originalText: inputText,
      toStyle: targetStyle,
      preservationPercentage,
    });
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    if (transformedText) {
      navigator.clipboard.writeText(transformedText).then(
        () => {
          toast({
            title: "Copied",
            description: "Text copied to clipboard!",
          });
        },
        (err) => {
          toast({
            title: "Error",
            description: "Failed to copy text: " + err,
            variant: "destructive",
          });
        }
      );
    }
  };

  // Handle reset
  const handleReset = () => {
    setInputText("");
    setTransformedText("");
  };
  
  // Check if guest user has reached limit
  const isGuestLimitReached = !user && guestSession?.remainingUses === 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Original Text</CardTitle>
            <div className="flex items-center">
              <span className="text-sm text-neutral-700 mr-2">Target Style:</span>
              <Select value={targetStyle} onValueChange={setTargetStyle}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="poetic">Poetic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea
                id="input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your text here... (e.g., 'Kindly let me know your availability.')"
                className="min-h-[220px] resize-none"
              />
              <div className="absolute bottom-2 right-2 text-xs text-neutral-400">
                {wordCount} words
              </div>
            </div>

            {/* Style Preservation Slider */}
            <div className="mt-4 mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-neutral-600">Style Preservation</span>
                <span className="text-sm font-medium">{preservationPercentage}%</span>
              </div>
              <div className="grid grid-cols-3 text-xs text-neutral-500 mb-1">
                <div>More {targetStyle}</div>
                <div className="text-center">Balanced</div>
                <div className="text-right">More Original</div>
              </div>
              <Slider
                value={[preservationPercentage]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setPreservationPercentage(value[0])}
              />
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleTransform}
                disabled={!inputText.trim() || transformMutation.isPending || isGuestLimitReached}
                className="gap-2"
              >
                {transformMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Transforming...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Transform Text
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Transformed Text</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!transformedText}
              className="gap-1"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </CardHeader>
          <CardContent>
            {transformMutation.isPending ? (
              <div className="min-h-[220px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-neutral-600">Transforming your text...</p>
                </div>
              </div>
            ) : (
              <div
                ref={resultTextRef}
                className="border rounded-md p-4 min-h-[220px] bg-neutral-50 text-neutral-700 overflow-y-auto"
              >
                {transformedText ? (
                  <p className="whitespace-pre-line">{transformedText}</p>
                ) : (
                  <p className="text-neutral-400 italic">Transformed text will appear here...</p>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={transformMutation.isPending}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
