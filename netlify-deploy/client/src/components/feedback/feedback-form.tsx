import { useState } from "react";
import {
  MessageSquare,
  Bug,
  Lightbulb,
  ThumbsUp,
  AlertTriangle,
  Send,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const feedbackCategories = [
  { value: "feature_request", label: "Feature Request", icon: <Lightbulb className="h-4 w-4" /> },
  { value: "bug_report", label: "Bug Report", icon: <Bug className="h-4 w-4" /> },
  { value: "general_feedback", label: "General Feedback", icon: <MessageSquare className="h-4 w-4" /> },
  { value: "compliment", label: "Compliment", icon: <ThumbsUp className="h-4 w-4" /> },
  { value: "issue", label: "Issue/Problem", icon: <AlertTriangle className="h-4 w-4" /> },
];

interface FeedbackFormProps {
  onSubmit: (data: {
    category: string;
    title: string;
    description: string;
    isAnonymous: boolean;
  }) => void;
  isAuthenticated: boolean;
}

export default function FeedbackForm({ onSubmit, isAuthenticated }: FeedbackFormProps) {
  const [category, setCategory] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !category) {
      toast({
        title: "Incomplete form",
        description: "Please fill in all the required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real app, we'd send the feedback to the backend
    onSubmit({
      category,
      title,
      description,
      isAnonymous,
    });
    
    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback! Our team will review it.",
    });
    
    // Reset form
    setCategory("");
    setTitle("");
    setDescription("");
    setIsAnonymous(false);
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Feedback</CardTitle>
        <CardDescription>
          Help us improve MoodSync by sharing your thoughts and suggestions
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="category">Feedback Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {feedbackCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center">
                      {category.icon}
                      <span className="ml-2">{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Summarize your feedback in a short title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide details about your feedback, suggestion, or issue..."
              className="min-h-[120px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked === true)}
            />
            <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
              Submit anonymously
            </Label>
          </div>

          {!isAuthenticated && !isAnonymous && (
            <div className="text-sm text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 inline-block mr-1" />
              <span>You need to be logged in to submit non-anonymous feedback.</span>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || (!isAuthenticated && !isAnonymous)}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Feedback
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}