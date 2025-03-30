import { useState } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNavbar from "@/components/layout/MobileNavbar";
import { useMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Resource } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useFileUpload } from "@/hooks/use-file-upload";

interface ResourceWithUser extends Resource {
  user: {
    fullName: string;
    role: string;
  };
}

export default function Books() {
  const isMobile = useMobile();
  const [resourceType, setResourceType] = useState<string>("book");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const { toast } = useToast();
  const { uploadFile, isUploading } = useFileUpload();

  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "book",
    url: ""
  });

  // Fetch resources based on type
  const { data: resources, isLoading, error } = useQuery<ResourceWithUser[]>({
    queryKey: ["/api/resources", resourceType],
    queryFn: async () => {
      const response = await fetch(`/api/resources?type=${resourceType}`);
      if (!response.ok) throw new Error("Failed to fetch resources");
      return response.json();
    }
  });

  // Filter resources based on search query
  const filteredResources = resources?.filter(resource => 
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSubmitResource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newResource.title || !newResource.url) {
      toast({
        title: "Missing information",
        description: "Please provide a title and file URL",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await apiRequest("POST", "/api/resources", newResource);
      
      setNewResource({
        title: "",
        description: "",
        type: "book",
        url: ""
      });
      
      setIsAddResourceOpen(false);
      
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      
      toast({
        title: "Success!",
        description: "Your resource has been added successfully."
      });
    } catch (error) {
      toast({
        title: "Failed to add resource",
        description: "There was an error adding your resource. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const url = await uploadFile(file, `resources/${resourceType}`);
      setNewResource({...newResource, url});
      
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully."
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderResourceList = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="p-6 text-center">
          <div className="text-4xl mb-2">❌</div>
          <h3 className="font-medium text-lg">Failed to load resources</h3>
          <p className="text-sm text-gray-500 mt-1">
            There was an error loading the resources. Please try again.
          </p>
        </div>
      );
    }
    
    if (!filteredResources || filteredResources.length === 0) {
      return (
        <div className="p-6 text-center">
          <div className="text-4xl mb-2">📚</div>
          <h3 className="font-medium text-lg">No resources found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery 
              ? "No resources match your search criteria" 
              : "There are no resources available yet. Be the first to add one!"}
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="h-40 bg-gradient-to-r from-primary-100 to-primary-50 flex items-center justify-center p-4">
                <div className="text-center">
                  {resourceType === "book" ? (
                    <i className="fas fa-book text-5xl text-primary-500 mb-2"></i>
                  ) : (
                    <i className="fas fa-file-alt text-5xl text-primary-500 mb-2"></i>
                  )}
                  <p className="text-sm font-medium">{resourceType === "book" ? "Download Book" : "Download Worksheet"}</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg mb-1">{resource.title}</h3>
                <p className="text-sm text-gray-500">
                  By {resource.user.fullName} • {resource.user.role}
                </p>
                {resource.description && (
                  <p className="mt-2 text-sm text-gray-700">{resource.description}</p>
                )}
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    <i className="fas fa-download mr-2"></i>
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Books & Worksheets | EduHub</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        {/* Desktop Layout */}
        <div className="hidden md:flex h-screen">
          <Sidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header title="Books & Worksheets" />
            
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800 mb-2">Educational Resources</h1>
                  <p className="text-gray-600">
                    Access books and worksheets shared by teachers and students
                  </p>
                </div>
                <Button 
                  onClick={() => setIsAddResourceOpen(true)}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Resource
                </Button>
              </div>
              
              <div className="mb-6">
                <Input 
                  placeholder="Search resources..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-80"
                />
              </div>
              
              <Tabs defaultValue="books" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger 
                    value="books" 
                    onClick={() => setResourceType("book")}
                    className="px-4 py-2"
                  >
                    Books
                  </TabsTrigger>
                  <TabsTrigger 
                    value="worksheets" 
                    onClick={() => setResourceType("worksheet")}
                    className="px-4 py-2"
                  >
                    Worksheets
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="books">
                  {renderResourceList()}
                </TabsContent>
                <TabsContent value="worksheets">
                  {renderResourceList()}
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col h-screen">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
            <div className="text-xl font-bold font-['Poppins'] bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-900">
              EduHub
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => setIsAddResourceOpen(true)}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </header>
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="mb-4">
              <h1 className="text-xl font-semibold text-gray-800 mb-1">Books & Worksheets</h1>
              <p className="text-sm text-gray-600">
                Access educational resources
              </p>
            </div>
            
            <div className="mb-4">
              <Input 
                placeholder="Search resources..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Tabs defaultValue="books" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger 
                  value="books" 
                  onClick={() => setResourceType("book")}
                  className="px-4 py-2"
                >
                  Books
                </TabsTrigger>
                <TabsTrigger 
                  value="worksheets" 
                  onClick={() => setResourceType("worksheet")}
                  className="px-4 py-2"
                >
                  Worksheets
                </TabsTrigger>
              </TabsList>
              <TabsContent value="books">
                {renderResourceList()}
              </TabsContent>
              <TabsContent value="worksheets">
                {renderResourceList()}
              </TabsContent>
            </Tabs>
          </main>
          
          {/* Bottom Navigation */}
          <MobileNavbar onCreatePost={() => {}} />
        </div>
      </div>
      
      {/* Add Resource Dialog */}
      <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Resource</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitResource} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Resource Type</label>
              <div className="flex mt-1 space-x-2">
                <Button
                  type="button"
                  variant={newResource.type === "book" ? "default" : "outline"}
                  onClick={() => setNewResource({...newResource, type: "book"})}
                  className="flex-1"
                >
                  <i className="fas fa-book mr-2"></i>
                  Book
                </Button>
                <Button
                  type="button"
                  variant={newResource.type === "worksheet" ? "default" : "outline"}
                  onClick={() => setNewResource({...newResource, type: "worksheet"})}
                  className="flex-1"
                >
                  <i className="fas fa-file-alt mr-2"></i>
                  Worksheet
                </Button>
              </div>
            </div>
            
            <div>
              <label htmlFor="resource-title" className="text-sm font-medium">Title</label>
              <Input
                id="resource-title"
                value={newResource.title}
                onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                placeholder="Enter resource title"
                required
              />
            </div>
            
            <div>
              <label htmlFor="resource-description" className="text-sm font-medium">Description (Optional)</label>
              <Textarea
                id="resource-description"
                value={newResource.description}
                onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                placeholder="Enter resource description"
                rows={3}
              />
            </div>
            
            <div>
              <label htmlFor="resource-file" className="text-sm font-medium">Upload File</label>
              <div className="mt-1">
                <Input
                  id="resource-file"
                  type="file"
                  accept={newResource.type === "book" ? ".pdf,.epub,.mobi" : ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"}
                  onChange={handleFileUpload}
                />
              </div>
              {newResource.url && (
                <p className="text-sm text-green-600 mt-1">
                  <i className="fas fa-check-circle mr-1"></i>
                  File uploaded successfully
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddResourceOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading || !newResource.title || !newResource.url}
              >
                {isUploading ? "Uploading..." : "Add Resource"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
