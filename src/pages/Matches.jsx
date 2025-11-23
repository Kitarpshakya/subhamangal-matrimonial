import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { Heart, MapPin, Calendar, Sparkles, MessageCircle } from "lucide-react";
import ChatBot from "../components/ChatBot";

// Dummy profile images for privacy
const DUMMY_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=6",
];

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [showChatBot, setShowChatBot] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/signin?redirect=/matches");
      return;
    }

    // Retrieve matches from sessionStorage
    const storedMatches = sessionStorage.getItem("chatMatches");
    const storedPrefs = sessionStorage.getItem("chatPreferences");

    if (storedMatches) {
      const parsedMatches = JSON.parse(storedMatches);
      // Process matches to hide first names
      const processedMatches = parsedMatches.map((match, idx) => ({
        ...match,
        displayName: getDisplayName(match),
        dummyAvatar: DUMMY_AVATARS[idx % DUMMY_AVATARS.length],
        matchId: `match_${idx}_${Date.now()}`, // Unique ID that doesn't reveal identity
      }));
      setMatches(processedMatches);
    }

    if (storedPrefs) {
      setPreferences(JSON.parse(storedPrefs));
    }
  }, [user, navigate]);

  const getDisplayName = (profile) => {
    const fullName = profile.fullName || profile.name || "";
    const nameParts = fullName.trim().split(" ");

    if (nameParts.length === 0) return "Anonymous";
    if (nameParts.length === 1) return "*** " + nameParts[0];
    if (nameParts.length === 2) return "*** " + nameParts[1];

    // First Middle Last -> *** Middle Last
    return "*** " + nameParts.slice(1).join(" ");
  };

  const handleContactInterest = (match) => {
    // TODO: Implement contact/interest feature
    console.log("Interested in:", match.matchId);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h1
              className="text-4xl font-bold mb-4"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Your Matches
            </h1>
            {preferences && (
              <p className="text-gray-600">
                Based on your preferences: {preferences.gender} •{" "}
                {preferences.preferredAge} • {preferences.city}
              </p>
            )}
          </div>

          {matches.length === 0 ? (
            <Card className="p-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-rose-500" />
              <h2 className="text-2xl font-semibold mb-2">No Matches Found</h2>
              <p className="text-gray-600 mb-6">
                Try adjusting your preferences or check back later for new
                profiles!
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
              >
                Back to Home
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
                <Card
                  key={match.matchId}
                  className="overflow-hidden hover:shadow-xl transition-shadow"
                  data-match-id={match.matchId}
                >
                  <div className="relative h-48 bg-gradient-to-br from-rose-100 to-pink-100">
                    <img
                      src={match.dummyAvatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-medium">
                      {match.age || "N/A"} yrs
                    </div>
                  </div>

                  <div className="p-6">
                    <h3
                      className="text-xl font-bold mb-3"
                      style={{ fontFamily: '"Playfair Display", serif' }}
                    >
                      {match.displayName}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">
                          {match.location || "Location not specified"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{match.gender || "N/A"}</span>
                      </div>
                    </div>

                    {match.hobbies && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Hobbies:</p>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(match.hobbies)
                            ? match.hobbies
                            : match.hobbies.split(",")
                          )
                            .slice(0, 3)
                            .map((hobby, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-rose-50 text-rose-700 px-2 py-1 rounded-full"
                              >
                                {hobby.trim()}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => handleContactInterest(match)}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Express Interest
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Button
              onClick={() => setShowChatBot(true)}
              variant="outline"
              className="fixed bottom-6 right-6 rounded-full hover:scale-110 opacity-90 border-rose-300 text-rose-600 hover:bg-rose-50 mb-4"
            >
              Search Again
            </Button>
            <p className="text-sm text-gray-500 ">
              * First names are hidden for privacy. Contact admin to connect
              with matches.
            </p>
          </div>
        </div>
      </div>
      {showChatBot && <ChatBot onClose={() => setShowChatBot(false)} />}
    </>
  );
};

export default Matches;
