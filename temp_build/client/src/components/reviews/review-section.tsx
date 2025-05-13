import { useState, useEffect } from "react";
import { Star, PlusCircle, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: Date;
  photoUrl?: string;
}

// Initial mock reviews
const initialReviews: Review[] = [
  {
    id: 1,
    name: "Michael J.",
    rating: 5,
    comment: "The emotion matching feature works incredibly well. Found people who truly understand my situation when I was feeling down.",
    date: new Date(2023, 10, 15),
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80"
  },
  {
    id: 2,
    name: "Jessica P.",
    rating: 5,
    comment: "I love the token system! It gives me incentives to engage with others and share my emotional journey. Very motivating!",
    date: new Date(2023, 11, 2),
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80"
  },
  {
    id: 3,
    name: "Robert K.",
    rating: 4,
    comment: "Very helpful platform for connecting with others who share similar emotional states. The UI could be a bit more intuitive.",
    date: new Date(2023, 9, 28),
  },
  {
    id: 4,
    name: "Emily W.",
    rating: 5,
    comment: "The premium features are absolutely worth it! The AI video editor is amazing and I love the private chat rooms.",
    date: new Date(2023, 11, 20),
    photoUrl: "https://images.unsplash.com/photo-1557053910-d9eadeed1c58?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80"
  },
  {
    id: 5,
    name: "Daniel T.",
    rating: 3,
    comment: "Good idea but sometimes it's hard to find people who match my emotional state. Needs more users or better matching algorithm.",
    date: new Date(2023, 10, 5),
  },
  {
    id: 6,
    name: "Sophia L.",
    rating: 5,
    comment: "The emotional support I've received on this platform has been life-changing. Thank you for creating such a meaningful space.",
    date: new Date(2023, 11, 10),
    photoUrl: "https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80"
  },
];

export const UserReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [newReview, setNewReview] = useState<Omit<Review, 'id' | 'date'>>({
    name: "",
    rating: 5,
    comment: "",
  });
  const [hoveredRating, setHoveredRating] = useState(0);

  // Load and sort reviews on initial mount
  useEffect(() => {
    // Sort reviews by rating (highest first)
    const sortedReviews = [...initialReviews].sort((a, b) => b.rating - a.rating);
    setReviews(sortedReviews);
  }, []);

  const handleAddReview = () => {
    if (newReview.name.trim() && newReview.comment.trim()) {
      const reviewToAdd: Review = {
        id: reviews.length + 1,
        ...newReview,
        date: new Date(),
      };
      
      // Add the new review and resort the array
      const updatedReviews = [...reviews, reviewToAdd].sort((a, b) => b.rating - a.rating);
      setReviews(updatedReviews);
      
      // Reset form
      setNewReview({
        name: "",
        rating: 5,
        comment: "",
      });
      
      setIsAddReviewOpen(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index}
        className={cn(
          "h-4 w-4", 
          index < rating ? "fill-amber-400 text-amber-400" : "fill-none text-gray-300",
          interactive && "cursor-pointer hover:scale-110 transition-transform"
        )}
        onClick={interactive ? () => setNewReview({...newReview, rating: index + 1}) : undefined}
        onMouseEnter={interactive ? () => setHoveredRating(index + 1) : undefined}
        onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
      />
    ));
  };

  return (
    <div className="px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-medium">User Feedback</h3>
            <p className="text-sm text-gray-500">See what others think about MoodSync</p>
          </div>
          <Button onClick={() => setIsAddReviewOpen(true)} variant="outline" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Review
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {reviews.map((review) => (
            <Card key={review.id} className="p-4 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {review.photoUrl ? (
                    <img 
                      src={review.photoUrl} 
                      alt={review.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{review.name}</p>
                  <div className="flex gap-1 mt-1 mb-1">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-xs text-gray-500">
                    {review.date.toLocaleDateString('en-US', { 
                      year: 'numeric',
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700">{review.comment}</p>
            </Card>
          ))}
        </div>
      </div>
      
      <Dialog open={isAddReviewOpen} onOpenChange={setIsAddReviewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share Your Experience</DialogTitle>
            <DialogDescription>
              Tell us what you think about MoodSync. Your feedback helps us improve.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Your Name</Label>
              <Input 
                id="name" 
                value={newReview.name} 
                onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                placeholder="Enter your name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {renderStars(hoveredRating || newReview.rating, true)}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="comment">Your Review</Label>
              <Textarea 
                id="comment" 
                value={newReview.comment} 
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                placeholder="Tell us about your experience with MoodSync"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddReview}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserReviews;