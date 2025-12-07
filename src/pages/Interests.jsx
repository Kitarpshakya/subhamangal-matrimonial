import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { Heart, X, Check, Clock, UserCheck } from "lucide-react";
import { getUserInterests, acceptInterest, rejectInterest, getUserProfile } from "../firebase/firebaseService";
import { useToast } from "../hooks/use-toast";

const Interests = () => {
  const [receivedInterests, setReceivedInterests] = useState([]);
  const [sentInterests, setSentInterests] = useState([]);
  const [profilesMap, setProfilesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }

    // Admins should not access this page
    if (isAdmin) {
      navigate("/admin");
      toast({
        title: "Admin Access",
        description: "Admins cannot manage interests. Use Admin Dashboard instead.",
      });
      return;
    }

    loadInterests();
  }, [user, isAdmin, navigate]);

  const loadInterests = async () => {
    setLoading(true);
    try {
      console.log("Loading interests for user:", user.uid);
      const interests = await getUserInterests(user.uid);

      console.log("All interests:", interests);
      console.log("Received interests:", interests.received);
      console.log("Sent interests:", interests.sent);

      // Filter pending received interests
      const pending = interests.received.filter(
        (interest) => interest.status === "interested"
      );
      console.log("Pending received interests:", pending);
      setReceivedInterests(pending);

      // All sent interests
      setSentInterests(interests.sent);

      // Fetch profile details
      const profileIds = new Set();
      [...pending, ...interests.sent].forEach((interest) => {
        profileIds.add(interest.interestedBy);
        profileIds.add(interest.interestedIn);
      });

      console.log("Profile IDs to fetch:", Array.from(profileIds));

      const profiles = {};
      await Promise.all(
        Array.from(profileIds).map(async (uid) => {
          try {
            const profile = await getUserProfile(uid);
            console.log(`Profile for ${uid}:`, profile);
            if (profile) {
              profiles[uid] = profile;
            }
          } catch (err) {
            console.error(`Error fetching profile ${uid}:`, err);
          }
        })
      );

      console.log("Profiles map:", profiles);
      setProfilesMap(profiles);
    } catch (error) {
      console.error("Error loading interests:", error);
      toast({
        title: "Error",
        description: "Failed to load interests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (interestId) => {
    setProcessingId(interestId);
    try {
      await acceptInterest(interestId);
      toast({
        title: "Interest Accepted!",
        description: "Admin will contact you both to arrange a meeting",
      });
      loadInterests();
    } catch (error) {
      console.error("Error accepting interest:", error);
      toast({
        title: "Error",
        description: "Failed to accept interest",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (interestId) => {
    setProcessingId(interestId);
    try {
      await rejectInterest(interestId);
      toast({
        title: "Interest Rejected",
        description: "The interest has been declined",
      });
      loadInterests();
    } catch (error) {
      console.error("Error rejecting interest:", error);
      toast({
        title: "Error",
        description: "Failed to reject interest",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      interested: { text: "Pending", color: "bg-yellow-100 text-yellow-800" },
      accepted: { text: "Accepted", color: "bg-green-100 text-green-800" },
      rejected: { text: "Rejected", color: "bg-red-100 text-red-800" },
    };

    const badge = badges[status] || badges.interested;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}
      >
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-rose-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading interests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <h1
          className="text-4xl font-bold mb-8 text-center"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          Interest Management
        </h1>

        {/* Received Interests */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-6 h-6 text-rose-500" />
            <h2 className="text-2xl font-semibold">
              Received Interests ({receivedInterests.length})
            </h2>
          </div>

          {receivedInterests.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">No pending interests</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {receivedInterests.map((interest) => {
                const profile = profilesMap[interest.interestedBy];
                console.log("Rendering interest:", interest, "Profile:", profile);

                if (!profile) {
                  console.warn("No profile found for interest:", interest);
                  return (
                    <Card key={interest.id} className="p-6">
                      <p className="text-red-500">Profile not found (ID: {interest.interestedBy})</p>
                    </Card>
                  );
                }

                return (
                  <Card key={interest.id} className="overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-br from-rose-100 to-pink-100">
                      {profile.photoURL ? (
                        <img
                          src={profile.photoURL}
                          alt={profile.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <UserCheck className="w-20 h-20 text-rose-300" />
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3
                        className="text-xl font-bold mb-2"
                        style={{ fontFamily: '"Playfair Display", serif' }}
                      >
                        {profile.fullName}
                      </h3>

                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <p>Age: {profile.age} years</p>
                        <p>Location: {profile.location}</p>
                        <p>Caste: {profile.caste}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAccept(interest.id)}
                          disabled={processingId === interest.id}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleReject(interest.id)}
                          disabled={processingId === interest.id}
                          variant="outline"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sent Interests */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-semibold">
              Sent Interests ({sentInterests.length})
            </h2>
          </div>

          {sentInterests.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">You haven't expressed interest in anyone yet</p>
              <Button
                onClick={() => navigate("/")}
                className="mt-4 bg-gradient-to-r from-rose-500 to-pink-500"
              >
                Find Matches
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sentInterests.map((interest) => {
                const profile = profilesMap[interest.interestedIn];
                if (!profile) return null;

                return (
                  <Card key={interest.id} className="overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100">
                      {profile.photoURL ? (
                        <img
                          src={profile.photoURL}
                          alt={profile.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <UserCheck className="w-20 h-20 text-blue-300" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(interest.status)}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3
                        className="text-xl font-bold mb-2"
                        style={{ fontFamily: '"Playfair Display", serif' }}
                      >
                        {profile.fullName}
                      </h3>

                      <div className="space-y-2 text-sm text-gray-600">
                        <p>Age: {profile.age} years</p>
                        <p>Location: {profile.location}</p>
                        <p>Status: {getStatusBadge(interest.status)}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interests;
