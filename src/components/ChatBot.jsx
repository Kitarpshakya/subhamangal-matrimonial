import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { X, Bot } from "lucide-react";
import { getApprovedProfiles } from "../firebase/firebaseService";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    id: "gender",
    question: "Preferred partner gender?",
    options: ["Male", "Female", "Any"],
    type: "options",
  },
  {
    id: "preferredAge",
    question: "Preferred age group?",
    options: ["18-25", "26-30", "31-35", "36-40", "40+", "Any"],
    type: "options",
  },
  {
    id: "city",
    question: "Which city do you prefer?",
    options: ["Kathmandu", "Lalitpur", "Bhaktapur", "Any"],
    type: "options",
  },
  {
    id: "hobbies",
    question: "What hobbies interest you in a partner?",
    options: [
      "Reading",
      "Traveling",
      "Sports",
      "Music",
      "Cooking",
      "Photography",
      "Gaming",
      "Art",
      "Dancing",
      "Yoga",
      "Hiking",
      "Movies",
      "Writing",
      "Gardening",
      "Fitness",
    ],
    type: "multiple",
  },
];

const ChatBot = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [messages, setMessages] = useState([]);
  const [selectedHobbies, setSelectedHobbies] = useState([]);
  const [searching, setSearching] = useState(false);
  const [matchCount, setMatchCount] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const initializedRef = useRef(false);

  useEffect(() => {
    // Only initialize once using ref instead of state
    if (!initializedRef.current) {
      initializedRef.current = true;
      addMessage(
        "bot",
        "👋 Hi! I will ask a few questions to find good matches for you."
      );
      setTimeout(() => {
        if (questions[0]) {
          addMessage("bot", questions[0].question);
        }
      }, 500);
    }
  }, []); // Empty dependency array - runs only once

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text, timestamp: Date.now() }]);
  };

  const handleOptionClick = (value) => {
    const currentQuestion = questions[step];

    if (currentQuestion.type === "multiple") {
      return;
    }

    addMessage("user", value);
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));

    setTimeout(() => {
      moveToNextStep(value);
    }, 300);
  };

  const handleMultipleSubmit = () => {
    if (selectedHobbies.length === 0) {
      toast.error("Please select at least one hobby");
      return;
    }

    const currentQuestion = questions[step];
    const hobbiesText = selectedHobbies.join(", ");
    addMessage("user", hobbiesText);
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: selectedHobbies }));
    setSelectedHobbies([]);

    setTimeout(() => {
      moveToNextStep(selectedHobbies);
    }, 300);
  };

  const toggleHobby = (hobby) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]
    );
  };

  const moveToNextStep = (answer) => {
    const nextStep = step + 1;

    if (nextStep < questions.length) {
      setStep(nextStep);
      addMessage("bot", questions[nextStep].question);
    } else {
      findMatches();
    }
  };

  const parseAgeRange = (ageStr) => {
    if (!ageStr || ageStr === "Any") return { min: 0, max: 999 };
    const parts = ageStr.split("-");
    if (parts.length === 2) {
      return { min: parseInt(parts[0]), max: parseInt(parts[1]) };
    }
    if (ageStr.includes("+")) {
      return { min: parseInt(ageStr), max: 999 };
    }
    return { min: 0, max: 999 };
  };

  const findMatches = async () => {
    setSearching(true);
    addMessage("bot", "🔍 Finding matches for you...");

    try {
      const profiles = await getApprovedProfiles(100);
      console.log("Total profiles fetched:", profiles.length);
      console.log("User preferences:", answers);

      const prefs = answers;

      const matches = profiles.filter((p) => {
        console.log("Checking profile:", p);

        // Gender filter - CRITICAL: Must match opposite gender unless "Any"
        if (prefs.gender && prefs.gender !== "Any") {
          if (!p.gender) {
            console.log("Profile missing gender, skipping");
            return false;
          }
          if (p.gender.toLowerCase() !== prefs.gender.toLowerCase()) {
            console.log(
              `Gender mismatch: Looking for ${prefs.gender}, found ${p.gender}`
            );
            return false;
          }
        }

        // Age filter - CRITICAL: Must be within range
        if (prefs.preferredAge && prefs.preferredAge !== "Any") {
          const ageRange = parseAgeRange(prefs.preferredAge);
          const profileAge = parseInt(p.age);

          if (!profileAge || isNaN(profileAge)) {
            console.log("Profile missing valid age, skipping");
            return false;
          }

          if (profileAge < ageRange.min || profileAge > ageRange.max) {
            console.log(
              `Age mismatch: Looking for ${prefs.preferredAge}, found ${profileAge}`
            );
            return false;
          }
        }

        // City/Location filter - CRITICAL: Must match location
        if (prefs.city && prefs.city !== "Any") {
          if (!p.location) {
            console.log("Profile missing location, skipping");
            return false;
          }
          if (!p.location.toLowerCase().includes(prefs.city.toLowerCase())) {
            console.log(
              `Location mismatch: Looking for ${prefs.city}, found ${p.location}`
            );
            return false;
          }
        }

        // Hobbies filter - OPTIONAL: Nice to have but not required
        // if (prefs.hobbies && prefs.hobbies.length > 0) {
        //   const profileHobbies = p.hobbies
        //     ? Array.isArray(p.hobbies)
        //       ? p.hobbies
        //       : p.hobbies.split(",").map((h) => h.trim())
        //     : [];

        //   const hasOverlap = prefs.hobbies.some((h) =>
        //     profileHobbies.some((ph) =>
        //       ph.toLowerCase().includes(h.toLowerCase())
        //     )
        //   );

        //   if (!hasOverlap) {
        //     console.log(
        //       `No hobby overlap: Looking for ${prefs.hobbies}, found ${profileHobbies}`
        //     );
        //     return false;
        //   }
        // }

        console.log("✓ Profile matched!");
        return true;
      });

      console.log("Total matches found:", matches.length);

      // Store matches in sessionStorage for detail page
      sessionStorage.setItem("chatMatches", JSON.stringify(matches));
      sessionStorage.setItem("chatPreferences", JSON.stringify(prefs));

      setTimeout(() => {
        setMatchCount(matches.length);
        addMessage("bot", `🎉 Found ${matches.length} potential matches!`);

        setShowResults(true);
        setSearching(false);
      }, 1000);
    } catch (error) {
      console.error("Error finding matches:", error);
      addMessage(
        "bot",
        "Unable to find matches right now. Please try again later."
      );
      setSearching(false);
    }
  };

  const handleViewMatches = () => {
    if (user) {
      navigate("/matches");
      onClose(); // Close chatbot when navigating
    } else {
      toast.info("Please sign up to view detailed matches");
      navigate("/signup?from=chatbot");
      onClose();
    }
  };

  const currentQuestion = questions[step];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-testid="chatbot-container"
    >
      <div className="fixed inset-0 bg-black/50"/>

      <Card
        className="relative w-full max-w-2xl flex flex-col shadow-2xl"
        style={{ height: "90vh" }}
      >
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-lg flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            <h3 className="font-semibold text-lg" data-testid="chatbot-title">
              Find Your Match
            </h3>
          </div>
          <Button
            data-testid="close-chatbot"
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
              data-testid={`message-${msg.sender}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {showResults && (
          <div className="p-4 border-t bg-gray-50 flex-shrink-0">
            <Button
              onClick={handleViewMatches}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-lg py-6"
            >
              {user ? "View Detailed Matches" : "Sign Up to View Matches"}
            </Button>
          </div>
        )}

        {!searching && !showResults && step < questions.length && (
          <div className="p-4 border-t bg-gray-50 flex-shrink-0">
            {currentQuestion?.type === "options" && (
              <div className="grid grid-cols-2 gap-2">
                {currentQuestion.options.map((option) => (
                  <Button
                    key={option}
                    data-testid={`option-${option
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    onClick={() => handleOptionClick(option)}
                    variant="outline"
                    className="hover:bg-rose-50 hover:border-rose-300 transition-all"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}

            {currentQuestion?.type === "multiple" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {currentQuestion.options.map((option) => (
                    <Button
                      key={option}
                      data-testid={`hobby-${option.toLowerCase()}`}
                      onClick={() => toggleHobby(option)}
                      variant={
                        selectedHobbies.includes(option) ? "default" : "outline"
                      }
                      className={
                        selectedHobbies.includes(option)
                          ? "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                          : "hover:bg-rose-50 hover:border-rose-300"
                      }
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                <Button
                  data-testid="submit-hobbies"
                  onClick={handleMultipleSubmit}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                  disabled={selectedHobbies.length === 0}
                >
                  Continue
                </Button>
              </div>
            )}
          </div>
        )}

        {searching && (
          <div className="p-4 border-t bg-gray-50 text-center flex-shrink-0">
            <div className="animate-pulse text-gray-600">Searching...</div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChatBot;
