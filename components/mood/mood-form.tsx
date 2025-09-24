"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { useSession } from "@/lib/contexts/session-context";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { authenticatedFetch } from "@/lib/api/authenticatedFetch";

interface MoodFormProps {
  onSuccess?: () => void;
}

const API_URL = process.env.API_URL || "http://localhost:3001"; // API url

const MoodForm = ({ onSuccess }: MoodFormProps) => {
  const [moodScore, setMoodScore] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, loading } = useSession();
  const router = useRouter();

  const emotions = [
    { value: 0, label: "😔", description: "Very Low" },
    { value: 25, label: "😕", description: "Low" },
    { value: 50, label: "😊", description: "Neutral" },
    { value: 75, label: "😃", description: "Good" },
    { value: 100, label: "🤗", description: "Great" },
  ];

  const currentEmotion =
    emotions.find((em) => Math.abs(moodScore - em.value) < 15) || emotions[2];

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast("Authentication required", {
        description: "Please log in to track your mood",
      });
      router.push("/login");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      console.log(
        "MoodForm: Token from localStorage:",
        token ? "exists" : "not found"
      );

      const response = await authenticatedFetch(`${API_URL}/api/mood`, router, {
        method: "POST",
        body: JSON.stringify({ score: moodScore }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("MoodForm: Error response:", error);
        throw new Error(error.error || "Failed to track mood");
      }

      const data = await response.json();
      console.log("MoodForm: Success response:", data);

      toast("Mood tracked successfully!", {
        description: "Your mood has been recorded.",
      });

      // Call onSuccess to close the modal
      onSuccess?.();
    } catch (error) {
      console.error("MoodForm: Error:", error);
      toast("Error", {
        description:
          error instanceof Error ? error.message : "Failed to track mood",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Emotion display */}
      <div className="text-center space-y-2">
        <div className="text-4xl">{currentEmotion.label}</div>
        <div className="text-sm text-muted-foreground">
          {currentEmotion.description}
        </div>
      </div>

      {/* Emotion slider */}
      <div className="space-y-4">
        <div className="flex justify-between px-2">
          {emotions.map((em) => (
            <div
              key={em.value}
              className={`cursor-pointer transition-opacity ${
                Math.abs(moodScore - em.value) < 15
                  ? "opacity-100"
                  : "opacity-50"
              }`}
              onClick={() => setMoodScore(em.value)}
            >
              <div className="text-2xl">{em.label}</div>
            </div>
          ))}
        </div>

        <Slider
          value={[moodScore]}
          onValueChange={(value) => setMoodScore(value[0])}
          min={0}
          max={100}
          step={1}
          className="py-4"
        />
      </div>

      {/* Submit button */}
      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={isLoading || loading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : loading ? (
          "Loading..."
        ) : (
          "Save Mood"
        )}
      </Button>
    </div>
  );
};

export default MoodForm;
