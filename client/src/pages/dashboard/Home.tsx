import { useState } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNavbar from "@/components/layout/MobileNavbar";
import CreatePostBox from "@/components/dashboard/CreatePostBox";
import PostsList from "@/components/dashboard/PostsList";
import { useMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Home() {
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const isMobile = useMobile();
  
  return (
    <>
      <Helmet>
        <title>Home | EduHub</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        {/* Desktop Layout */}
        <div className="hidden md:flex h-screen">
          <Sidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header title="Home" />
            
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <CreatePostBox />
              <PostsList />
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
              <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <i className="fas fa-search"></i>
              </button>
              <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <i className="fas fa-bell"></i>
              </button>
              <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <i className="fas fa-envelope"></i>
              </button>
            </div>
          </header>
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <CreatePostBox />
            <PostsList />
          </main>
          
          {/* Bottom Navigation */}
          <MobileNavbar onCreatePost={() => setCreatePostOpen(true)} />
          
          {/* Mobile Create Post Dialog */}
          <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
            <DialogContent className="sm:max-w-md">
              <div className="space-y-4">
                <div className="text-xl font-semibold">Create Post</div>
                <CreatePostBox />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
