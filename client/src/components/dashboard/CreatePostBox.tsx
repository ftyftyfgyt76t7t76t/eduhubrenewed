import { useState, useRef, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useMobile } from "@/hooks/use-mobile";

export default function CreatePostBox() {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video" | "document" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useMobile();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Empty post",
        description: "Please add some content to your post",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/posts", {
        content,
        mediaType: mediaType,
        mediaUrl: null, // In a real app, we would upload the file and get a URL
      });
      
      // Reset form
      setContent("");
      setIsExpanded(false);
      setMediaType(null);
      
      // Invalidate posts query to refresh the feed
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      
      toast({
        title: "Post created!",
        description: "Your post has been published.",
      });
    } catch (error) {
      console.error("Failed to create post:", error);
      toast({
        title: "Failed to create post",
        description: "There was an error creating your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleMediaClick = (type: "image" | "video" | "document") => {
    setMediaType(type);
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Mobile compact view
  if (isMobile) {
    return (
      <Card className="bg-white rounded-lg shadow-sm p-3 mb-4">
        <CardContent className="p-0">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={`${user.fullName}'s profile`} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <i className="fas fa-user"></i>
              )}
            </div>
            <div 
              onClick={() => setIsExpanded(true)}
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 cursor-pointer"
            >
              <span className="text-gray-500">Share something...</span>
            </div>
          </div>
          
          {isExpanded && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-lg">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Create Post</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsExpanded(false)}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What's on your mind?"
                      rows={4}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none mb-3"
                    />
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-3">
                        <Button 
                          type="button"
                          variant="ghost"
                          onClick={() => handleMediaClick("image")}
                          className="flex items-center text-gray-500 hover:text-primary-500"
                        >
                          <i className="fas fa-image mr-1"></i>
                          <span className="text-sm">Photo</span>
                        </Button>
                        <Button 
                          type="button"
                          variant="ghost"
                          onClick={() => handleMediaClick("video")}
                          className="flex items-center text-gray-500 hover:text-primary-500"
                        >
                          <i className="fas fa-video mr-1"></i>
                          <span className="text-sm">Video</span>
                        </Button>
                        <Button 
                          type="button"
                          variant="ghost"
                          onClick={() => handleMediaClick("document")}
                          className="flex items-center text-gray-500 hover:text-primary-500"
                        >
                          <i className="fas fa-file-alt mr-1"></i>
                          <span className="text-sm">Document</span>
                        </Button>
                      </div>
                      <Button 
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                      >
                        {isSubmitting ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="mt-3 flex justify-between pt-3 border-t border-gray-100">
            <Button 
              type="button"
              variant="ghost"
              onClick={() => handleMediaClick("image")}
              className="flex items-center text-gray-500"
            >
              <i className="fas fa-image mr-1"></i>
              <span className="text-sm">Photo</span>
            </Button>
            <Button 
              type="button"
              variant="ghost"
              onClick={() => handleMediaClick("video")}
              className="flex items-center text-gray-500"
            >
              <i className="fas fa-video mr-1"></i>
              <span className="text-sm">Video</span>
            </Button>
            <Button 
              type="button"
              variant="ghost"
              onClick={() => handleMediaClick("document")}
              className="flex items-center text-gray-500"
            >
              <i className="fas fa-file-alt mr-1"></i>
              <span className="text-sm">Document</span>
            </Button>
          </div>
        </CardContent>
        
        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept={
            mediaType === "image" ? "image/*" : 
            mediaType === "video" ? "video/*" : 
            mediaType === "document" ? ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" : 
            undefined
          }
        />
      </Card>
    );
  }
  
  // Desktop view
  return (
    <Card className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <CardContent className="p-0">
        <div className="flex items-start space-x-4">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={`${user.fullName}'s profile`} 
                className="h-full w-full object-cover"
              />
            ) : (
              <i className="fas fa-user"></i>
            )}
          </div>
          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                rows={isExpanded ? 3 : 2}
                placeholder="Share something with your classmates..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none"
              />
              
              {isExpanded && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex space-x-3">
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => handleMediaClick("image")}
                      className="flex items-center text-gray-500 hover:text-primary-500"
                    >
                      <i className="fas fa-image mr-1"></i>
                      <span className="text-sm">Photo</span>
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => handleMediaClick("video")}
                      className="flex items-center text-gray-500 hover:text-primary-500"
                    >
                      <i className="fas fa-video mr-1"></i>
                      <span className="text-sm">Video</span>
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => handleMediaClick("document")}
                      className="flex items-center text-gray-500 hover:text-primary-500"
                    >
                      <i className="fas fa-file-alt mr-1"></i>
                      <span className="text-sm">Document</span>
                    </Button>
                  </div>
                  <Button 
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                  >
                    {isSubmitting ? "Posting..." : "Post"}
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
        
        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept={
            mediaType === "image" ? "image/*" : 
            mediaType === "video" ? "video/*" : 
            mediaType === "document" ? ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" : 
            undefined
          }
        />
      </CardContent>
    </Card>
  );
}
