import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import ChatBot from "../components/ChatBot";
import {
  getUserProfile,
  isAdmin as checkAdmin,
} from "../firebase/firebaseService";
import {
  Heart,
  Users,
  MessageCircle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const [showChat, setShowChat] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          // Check if admin
          const adminStatus = await checkAdmin(user.uid);
          setIsAdminUser(adminStatus);

          // Get user profile
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }
      setLoading(false);
    };

    loadUserData();
  }, [user]);

  const renderActionButton = () => {
    // Not logged in - show Join Now
    if (!user) {
      return (
        <Button
          data-testid="join-now-button"
          onClick={() => navigate("/signup")}
          size="lg"
          variant="outline"
          className="text-lg px-8 py-6 border-2 border-rose-200 hover:border-rose-300 hover:bg-rose-50 transition-all"
        >
          Join Now
        </Button>
      );
    }

    // Admin - no extra button needed
    if (isAdminUser) {
      return null;
    }

    // Regular user with pending/rejected profile - show Register/Update Biodata
    if (userProfile && userProfile.status !== "approved") {
      return (
        <Button
          data-testid="register-button"
          onClick={() => navigate("/profile")}
          size="lg"
          variant="outline"
          className="text-lg px-8 py-6 border-2 border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50 transition-all"
        >
          <FileText className="w-5 h-5 mr-2" />
          {userProfile.status === "pending"
            ? "View Registration Status"
            : "Update Biodata"}
        </Button>
      );
    }

    // Regular user with approved profile - no button
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-pink-50">
      <section className="container mx-auto px-6 py-16">
        <div
          className="grid lg:grid-cols-2 gap-12 items-center"
          data-testid="hero-section"
        >
          <div className="space-y-6">
            <h1
              className="text-5xl lg:text-6xl font-bold leading-tight"
              style={{ fontFamily: '"Playfair Display", serif' }}
              data-testid="hero-title"
            >
              Find Your{" "}
              <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                Perfect Match
              </span>{" "}
              with Shubhmangal
            </h1>
            <p
              className="text-lg text-gray-600"
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              Follow these simple steps to find your perfect match and get
              married.
            </p>
            <div className="flex gap-4">
              <Button
                data-testid="start-chat-button"
                onClick={() => setShowChat(true)}
                size="lg"
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Find Your Match
              </Button>

              {!loading && renderActionButton()}
            </div>

            {/* Status Messages */}
            {user && !isAdminUser && userProfile && (
              <div className="mt-4">
                {userProfile.status === "pending" && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <p className="text-yellow-800 text-sm">
                      ⏳ Your biodata is pending approval. You'll be notified
                      once reviewed.
                    </p>
                  </div>
                )}
                {userProfile.status === "rejected" && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                    <p className="text-red-800 text-sm">
                      ❌ Your biodata was not approved. Please update your
                      information.
                    </p>
                  </div>
                )}
                {userProfile.status === "approved" && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                    <p className="text-green-800 text-sm">
                      ✅ Your biodata is approved! Start searching for matches.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-200 to-pink-200 rounded-3xl blur-3xl opacity-30" />
            <img
              src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80"
              alt="Happy Couple"
              className="relative rounded-3xl shadow-2xl w-full object-cover"
              style={{ aspectRatio: "4/3" }}
            />
          </div>
        </div>
      </section>

      <section
        className="container mx-auto px-6 py-16"
        data-testid="how-it-works-section"
      >
        <div className="text-center mb-12">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            How Shubhmangal Works
          </h2>
          <p className="text-gray-600 text-lg">
            Follow these simple steps to find your perfect match and get married
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Users,
              title: "Step 1",
              desc: "Create Biodata",
              color: "from-rose-400 to-pink-400",
            },
            {
              icon: Heart,
              title: "Step 2",
              desc: "Look for Match",
              color: "from-pink-400 to-rose-400",
            },
            {
              icon: MessageCircle,
              title: "Step 3",
              desc: "Contact with Agent",
              color: "from-rose-500 to-pink-500",
            },
            {
              icon: CheckCircle,
              title: "Step 4",
              desc: "Get Married",
              color: "from-pink-500 to-rose-500",
            },
          ].map((step, idx) => (
            <Card
              key={idx}
              className="p-6 text-center hover:shadow-lg transition-all border-0 bg-white/80 backdrop-blur"
              data-testid={`step-${idx + 1}`}
            >
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center`}
              >
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-lg mb-2">{step.title}</h4>
              <p className="text-gray-600">{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {showChat && <ChatBot onClose={() => setShowChat(false)} />}
    </div>
  );
};

export default Home;
