import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { Heart, MapPin, Calendar, Sparkles, MessageCircle, Check } from "lucide-react";
import ChatBot from "../components/ChatBot";
import { expressInterest, checkInterest } from "../firebase/firebaseService";
import { useToast } from "../hooks/use-toast";

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
  const [interestedProfiles, setInterestedProfiles] = useState(new Set());
  const [loadingInterests, setLoadingInterests] = useState({});
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
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

      // Check which profiles the user has already expressed interest in
      checkExistingInterests(parsedMatches);
    }

    if (storedPrefs) {
      setPreferences(JSON.parse(storedPrefs));
    }
  }, [user, navigate]);

  const checkExistingInterests = async (matchList) => {
    if (!user) return;

    const interested = new Set();

    // Check each match to see if interest was already expressed
    for (const match of matchList) {
      if (match.uid && match.uid !== user.uid) {
        const result = await checkInterest(user.uid, match.uid);
        if (result.exists) {
          interested.add(match.uid);
        }
      }
    }

    setInterestedProfiles(interested);
  };

  const getDisplayName = (profile) => {
    const fullName = profile.fullName || profile.name || "";
    const nameParts = fullName.trim().split(" ");

    if (nameParts.length === 0) return "Anonymous";
    if (nameParts.length === 1) return "*** " + nameParts[0];
    if (nameParts.length === 2) return "*** " + nameParts[1];

    // First Middle Last -> *** Middle Last
    return "*** " + nameParts.slice(1).join(" ");
  };

  const handleContactInterest = async (match) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to express interest",
        variant: "destructive",
      });
      navigate("/signin?redirect=/matches");
      return;
    }

    // Admins cannot express interest
    if (isAdmin) {
      toast({
        title: "Admin Restriction",
        description: "Admins cannot express interest in profiles",
        variant: "destructive",
      });
      return;
    }

    // Check if this is the user's own profile
    if (match.uid === user.uid) {
      toast({
        title: "Invalid Action",
        description: "You cannot express interest in your own profile",
        variant: "destructive",
      });
      return;
    }

    // Check if already interested
    if (interestedProfiles.has(match.uid)) {
      toast({
        title: "Already Sent",
        description: "You have already expressed interest in this profile",
      });
      return;
    }

    // Prevent double-click while loading
    if (loadingInterests[match.uid]) {
      return;
    }

    // Set loading state for this specific match
    setLoadingInterests(prev => ({ ...prev, [match.uid]: true }));

    try {
      await expressInterest(user.uid, match.uid);

      // Update the interested profiles set
      setInterestedProfiles(prev => new Set([...prev, match.uid]));

      toast({
        title: "Interest Sent!",
        description: "The admin will be notified of your interest",
      });
    } catch (error) {
      console.error("Error expressing interest:", error);
      toast({
        title: "Error",
        description: "Failed to express interest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingInterests(prev => ({ ...prev, [match.uid]: false }));
    }
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

                    {isAdmin ? (
                      <Button
                        disabled
                        className="w-full bg-gray-300 cursor-not-allowed"
                      >
                        Admin View Only
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleContactInterest(match)}
                        disabled={interestedProfiles.has(match.uid) || loadingInterests[match.uid]}
                        className={`w-full transition-all ${
                          interestedProfiles.has(match.uid)
                            ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-60"
                            : "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                        }`}
                      >
                        {loadingInterests[match.uid] ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Sending...
                          </>
                        ) : interestedProfiles.has(match.uid) ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Interest Sent
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4 mr-2" />
                            Express Interest
                          </>
                        )}
                      </Button>
                    )}
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
