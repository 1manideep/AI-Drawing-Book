import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import LandingPage from './components/LandingPage';
import CanvasBoard from './components/CanvasBoard';
import HowItWorks from './components/HowItWorks';
import About from './components/About';
// import GallerySimple from './components/GallerySimple';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import AvatarSelection from './components/AvatarSelection';

function App() {
  console.log("App Version: View Persistence Added"); // Debug Log
  const [activeView, setActiveView] = useState(() => {
    // Persist view state across refreshes
    return localStorage.getItem('activeView') || 'landing';
  });

  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return localStorage.getItem('selectedAvatar') || 'dog';
  });

  useEffect(() => {
    localStorage.setItem('activeView', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('selectedAvatar', selectedAvatar);
  }, [selectedAvatar]);

  const [initialPrompt, setInitialPrompt] = useState('');
  const [initialFile, setInitialFile] = useState(null);
  const [initialDrawing, setInitialDrawing] = useState(null);

  // Auth State
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isAvatarSelectionOpen, setIsAvatarSelectionOpen] = useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // Check for pending work recovery after redirect login
      const pendingDrawing = sessionStorage.getItem('pending_drawing');
      if (pendingDrawing) {
        console.log("Restoring pending drawing...");
        setInitialDrawing({ imageUrl: pendingDrawing });
        setInitialPrompt('');
        // We don't have file object, but imageSrc will be set by CanvasBoard from initialDrawing

        setActiveView('canvas');

        // Clean up
        sessionStorage.removeItem('pending_drawing');
        sessionStorage.removeItem('pending_drawing_dims');
      }
    });
    return () => unsubscribe();
  }, []);

  const openLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleStartWithPrompt = (prompt) => {
    setInitialPrompt(prompt);
    setInitialFile(null);
    setInitialDrawing(null);
    setActiveView('canvas');
  };

  const handleStartWithFile = (file) => {
    setInitialFile(file);
    setInitialPrompt('');
    setInitialDrawing(null);
    setActiveView('canvas');
  };

  const handleOpenGallery = () => {
    setActiveView('gallery');
  };

  const handleHowItWorks = () => {
    setActiveView('howItWorks');
  };

  const handleAbout = () => {
    setActiveView('about');
  };

  const handleContact = () => {
    setActiveView('contact');
  };

  const handleResumeDrawing = (drawing) => {
    setInitialDrawing(drawing);
    setInitialPrompt(drawing.prompt);
    setInitialFile(null);
    setActiveView('canvas');
  };

  const handleBackToLanding = () => {
    setActiveView('landing');
    setInitialPrompt('');
    setInitialFile(null);
    setInitialDrawing(null);
  };

  // Simple Error Boundary
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-red-50 text-red-900">
            <h1 className="text-3xl font-bold mb-4">Something went wrong.</h1>
            <p className="font-mono bg-white p-4 rounded shadow-sm border border-red-200">{this.state.error?.toString()}</p>
            <button onClick={() => window.location.reload()} className="mt-8 px-6 py-3 bg-red-600 text-white rounded-full font-bold">
              Reload Page
            </button>
          </div>
        );
      }
      return this.props.children;
    }
  }

  return (
    <div className="App min-h-screen bg-[#fdfbf7] font-sans text-gray-900 selection:bg-pink-100 selection:text-pink-900 relative">
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onSignupSuccess={() => setIsAvatarSelectionOpen(true)}
      />

      <AvatarSelection
        isOpen={isAvatarSelectionOpen}
        onClose={() => setIsAvatarSelectionOpen(false)}
        selectedAvatar={selectedAvatar}
        onSelect={setSelectedAvatar}
      />

      {!isAuthModalOpen && activeView !== 'canvas' && (
        <Header
          user={user}
          onOpenGallery={handleOpenGallery}
          onSignOut={handleSignOut}
          onLogin={openLogin}
          onSignup={openSignup}
          onHowItWorks={handleHowItWorks}
          onAbout={handleAbout}
          onContact={handleContact}
          onHome={() => setActiveView('landing')}
          showLogo={activeView !== 'landing'}
          selectedAvatar={selectedAvatar}
          onSelectAvatar={() => setIsAvatarSelectionOpen(true)}
        />
      )}

      {activeView === 'landing' && (
        <LandingPage
          onStartWithPrompt={handleStartWithPrompt}
          onStartWithFile={handleStartWithFile}
          onOpenGallery={handleOpenGallery}
        // Pass user if needed, but Header handles auth UI now
        />
      )}

      {activeView === 'howItWorks' && (
        <HowItWorks />
      )}

      {activeView === 'about' && (
        <About />
      )}

      {activeView === 'contact' && (
        <Contact />
      )}

      {activeView === 'canvas' && (
        <CanvasBoard
          initialPrompt={initialPrompt}
          initialFile={initialFile}
          initialDrawing={initialDrawing}
          selectedAvatar={selectedAvatar}
          onBack={() => {
            setActiveView('landing');
            setInitialPrompt('');
            setInitialFile(null);
            setInitialDrawing(null);
          }}
          onSaved={() => {
            setActiveView('gallery');
          }}
          onLogin={openLogin}
        />
      )}

      {activeView === 'gallery' && (
        <ErrorBoundary>
          <Gallery
            onBack={handleBackToLanding}
            onResume={handleResumeDrawing}
            onLogin={openLogin}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}

export default App;
