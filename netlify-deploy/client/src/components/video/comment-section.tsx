import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, Reply, Edit, Trash2, ThumbsUp, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CommentSectionProps = {
  videoId: number;
};

export function CommentSection({ videoId }: CommentSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [replyingToComment, setReplyingToComment] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState<Record<number, boolean>>({});

  // Get comments for the video
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: [`/api/videos/${videoId}/comments`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/videos/${videoId}/comments`);
      return await res.json();
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (commentText: string) => {
      const res = await apiRequest("POST", `/api/videos/${videoId}/comments`, {
        content: commentText,
        parentId: null, // top-level comment
      });
      return await res.json();
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}/comments`] });
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Could not add your comment",
        variant: "destructive",
      });
    },
  });

  // Add reply mutation
  const addReplyMutation = useMutation({
    mutationFn: async ({ commentId, replyText }: { commentId: number; replyText: string }) => {
      const res = await apiRequest("POST", `/api/videos/${videoId}/comments`, {
        content: replyText,
        parentId: commentId,
      });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      setReplyText("");
      setReplyingToComment(null);
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}/comments`] });
      // Also load replies if we just added one
      queryClient.invalidateQueries({ queryKey: [`/api/comments/${variables.commentId}/replies`] });
      toast({
        title: "Reply added",
        description: "Your reply has been posted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Could not add your reply",
        variant: "destructive",
      });
    },
  });

  // Edit comment mutation
  const editCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: number; content: string }) => {
      const res = await apiRequest("PUT", `/api/comments/${commentId}`, {
        content,
      });
      return await res.json();
    },
    onSuccess: () => {
      setEditingCommentId(null);
      setEditText("");
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}/comments`] });
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Could not update your comment",
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const res = await apiRequest("DELETE", `/api/comments/${commentId}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}/comments`] });
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Could not delete your comment",
        variant: "destructive",
      });
    },
  });

  // Get replies for a comment
  const getReplies = (commentId: number) => {
    return useQuery({
      queryKey: [`/api/comments/${commentId}/replies`],
      queryFn: async () => {
        const res = await apiRequest("GET", `/api/comments/${commentId}/replies`);
        return await res.json();
      },
      enabled: !!showReplies[commentId],
    });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
      });
      return;
    }
    addCommentMutation.mutate(comment);
  };

  const handleSubmitReply = (commentId: number) => {
    if (!replyText.trim()) return;
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to reply",
      });
      return;
    }
    addReplyMutation.mutate({ commentId, replyText });
  };

  const handleStartEditing = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditText(comment.content);
  };

  const handleCancelEditing = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const handleSubmitEdit = (commentId: number) => {
    if (!editText.trim()) return;
    editCommentMutation.mutate({ commentId, content: editText });
  };

  const handleToggleReplies = (commentId: number) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6" id="comments-section">
      <h2 className="text-2xl font-bold">Comments</h2>

      {/* Comment form */}
      <div className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.avatarUrl || ""} />
          <AvatarFallback>{user ? getInitials(user.username) : "GU"}</AvatarFallback>
        </Avatar>
        <form onSubmit={handleSubmitComment} className="flex-1 space-y-4">
          <Textarea
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={!user || addCommentMutation.isPending}
            className="min-h-[80px]"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={!user || !comment.trim() || addCommentMutation.isPending}
            >
              {addCommentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </Button>
          </div>
        </form>
      </div>

      <Separator className="my-6" />

      {/* Comments list */}
      <div className="space-y-6">
        {isLoadingComments ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment: any) => (
            <div key={comment.id} className="space-y-4">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.userAvatarUrl || ""} />
                  <AvatarFallback>{getInitials(comment.username)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold">{comment.username}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    {user && comment.userId === user.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStartEditing(comment)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteCommentMutation.mutate(comment.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        disabled={editCommentMutation.isPending}
                        className="min-h-[80px]"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEditing}
                          disabled={editCommentMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSubmitEdit(comment.id)}
                          disabled={
                            !editText.trim() ||
                            editText === comment.content ||
                            editCommentMutation.isPending
                          }
                        >
                          {editCommentMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">{comment.content}</p>
                  )}

                  <div className="flex gap-4 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() =>
                        setReplyingToComment(
                          replyingToComment === comment.id ? null : comment.id
                        )
                      }
                    >
                      <Reply className="mr-1 h-3 w-3" />
                      Reply
                    </Button>

                    {comment.replyCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleToggleReplies(comment.id)}
                      >
                        {showReplies[comment.id] ? "Hide" : "View"} {comment.replyCount}{" "}
                        {comment.replyCount === 1 ? "reply" : "replies"}
                      </Button>
                    )}
                  </div>

                  {/* Reply form */}
                  {replyingToComment === comment.id && (
                    <div className="mt-4 flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatarUrl || ""} />
                        <AvatarFallback>
                          {user ? getInitials(user.username) : "GU"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder={`Reply to ${comment.username}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          disabled={!user || addReplyMutation.isPending}
                          className="min-h-[60px] text-sm"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReplyingToComment(null)}
                            disabled={addReplyMutation.isPending}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={
                              !user || !replyText.trim() || addReplyMutation.isPending
                            }
                          >
                            {addReplyMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Posting...
                              </>
                            ) : (
                              "Post"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Replies */}
              {showReplies[comment.id] && (
                <div className="ml-12 mt-2 space-y-4 border-l-2 border-muted pl-4">
                  {(() => {
                    const { data: replies, isLoading } = getReplies(comment.id);
                    
                    if (isLoading) {
                      return (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      );
                    }
                    
                    return replies && replies.length > 0 ? (
                      replies.map((reply: any) => (
                        <div key={reply.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={reply.userAvatarUrl || ""} />
                            <AvatarFallback>{getInitials(reply.username)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-semibold text-sm">{reply.username}</span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {formatDate(reply.createdAt)}
                                </span>
                              </div>

                              {user && reply.userId === user.id && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => deleteCommentMutation.mutate(reply.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                            <p className="text-sm">{reply.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="py-2 text-sm text-muted-foreground">No replies yet</p>
                    );
                  })()}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            <p>No comments yet</p>
            <p className="text-sm mt-1">Be the first to comment on this video</p>
          </div>
        )}
      </div>
    </div>
  );
}