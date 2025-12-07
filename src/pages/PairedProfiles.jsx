import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { Users, Phone, MapPin, Mail, Calendar, Heart } from "lucide-react";
import { getPairedProfiles } from "../firebase/firebaseService";
import { useToast } from "../hooks/use-toast";

const PairedProfiles = () => {
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }

    if (!isAdmin) {
      navigate("/");
      return;
    }

    loadPairedProfiles();
  }, [user, isAdmin, navigate]);

  const loadPairedProfiles = async () => {
    setLoading(true);
    try {
      const pairedData = await getPairedProfiles();
      setPairs(pairedData);
    } catch (error) {
      console.error("Error loading paired profiles:", error);
      toast({
        title: "Error",
        description: "Failed to load paired profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-rose-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading paired profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-12 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <Button
            onClick={() => navigate("/admin")}
            variant="outline"
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1
            className="text-4xl font-bold text-center"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Paired Profiles - Meeting Arrangements
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Profiles that have mutually accepted interest
          </p>
        </div>

        {pairs.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-semibold mb-2">No Paired Profiles Yet</h2>
            <p className="text-gray-600">
              When users accept each other's interest, they will appear here
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {pairs.map((pair) => (
              <Card key={pair.interestId} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-4 text-green-600">
                  <Heart className="w-5 h-5 fill-current" />
                  <span className="font-semibold">
                    Matched on {formatDate(pair.acceptedAt)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Profile 1 */}
                  <div className="border-r border-gray-200 pr-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-rose-100 to-pink-100 flex-shrink-0">
                        {pair.profile1?.photoURL ? (
                          <img
                            src={pair.profile1.photoURL}
                            alt={pair.profile1.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-12 h-12 text-rose-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3
                          className="text-2xl font-bold mb-1"
                          style={{ fontFamily: '"Playfair Display", serif' }}
                        >
                          {pair.profile1?.fullName || "N/A"}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {pair.profile1?.age} years • {pair.profile1?.gender}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Phone className="w-4 h-4 text-rose-500" />
                        <span className="font-medium">
                          {pair.profile1?.mobile || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Mail className="w-4 h-4 text-rose-500" />
                        <span className="text-sm break-all">
                          {pair.profile1?.email || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-start gap-3 text-gray-700">
                        <MapPin className="w-4 h-4 text-rose-500 mt-1" />
                        <div>
                          <p className="font-medium">{pair.profile1?.location}</p>
                          <p className="text-sm text-gray-600">
                            {pair.profile1?.detailLocation || "No detailed address"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className="w-4 h-4 text-rose-500" />
                        <span className="text-sm">Caste: {pair.profile1?.caste}</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile 2 */}
                  <div className="pl-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex-shrink-0">
                        {pair.profile2?.photoURL ? (
                          <img
                            src={pair.profile2.photoURL}
                            alt={pair.profile2.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-12 h-12 text-blue-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3
                          className="text-2xl font-bold mb-1"
                          style={{ fontFamily: '"Playfair Display", serif' }}
                        >
                          {pair.profile2?.fullName || "N/A"}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {pair.profile2?.age} years • {pair.profile2?.gender}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Phone className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">
                          {pair.profile2?.mobile || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span className="text-sm break-all">
                          {pair.profile2?.email || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-start gap-3 text-gray-700">
                        <MapPin className="w-4 h-4 text-blue-500 mt-1" />
                        <div>
                          <p className="font-medium">{pair.profile2?.location}</p>
                          <p className="text-sm text-gray-600">
                            {pair.profile2?.detailLocation || "No detailed address"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Caste: {pair.profile2?.caste}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 font-medium">
                      📋 Admin Action Required: Contact both parties to arrange a meeting
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PairedProfiles;
