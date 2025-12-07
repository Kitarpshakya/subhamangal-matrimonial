import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserProfile, updateUserProfile, addAdminNote, isAdmin as checkAdmin } from "../firebase/firebaseService";
import { useSearchParams } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import Register from "../components/Register";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { User, Mail, MapPin, Heart, Calendar, AlertCircle, Edit2, Save, X, Phone, FileText } from "lucide-react";
import { toast } from "sonner";

const HOBBIES_OPTIONS = [
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
];

const Profile = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const viewingUserId = searchParams.get("userId");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [selectedHobbies, setSelectedHobbies] = useState([]);
  const [adminNote, setAdminNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user, viewingUserId]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const profileId = viewingUserId || user.uid;
      console.log("Loading profile for ID:", profileId);

      const data = await getUserProfile(profileId);
      console.log("Profile data loaded:", data);

      if (!data) {
        console.error("No profile data returned for ID:", profileId);
        setLoading(false);
        return;
      }

      setProfile(data);

      const adminStatus = await checkAdmin(user.uid);
      setIsAdminUser(adminStatus);

      if (data) {
        setEditedProfile(data);
        const hobbiesArray = Array.isArray(data.hobbies)
          ? data.hobbies
          : data.hobbies
          ? data.hobbies.split(",").map((h) => h.trim())
          : [];
        setSelectedHobbies(hobbiesArray);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditedProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleHobby = (hobby) => {
    setSelectedHobbies((prev) => (prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]));
  };

  const handleSave = async () => {
    try {
      const profileId = viewingUserId || user.uid;
      const updatedData = {
        ...editedProfile,
        hobbies: selectedHobbies,
      };

      delete updatedData.uid;
      delete updatedData.email;
      delete updatedData.createdAt;
      delete updatedData.id;

      await updateUserProfile(profileId, updatedData);

      setProfile({ ...profile, ...updatedData });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    const hobbiesArray = Array.isArray(profile.hobbies)
      ? profile.hobbies
      : profile.hobbies
      ? profile.hobbies.split(",").map((h) => h.trim())
      : [];
    setSelectedHobbies(hobbiesArray);
    setIsEditing(false);
  };

  const handleAddNote = async () => {
    if (!adminNote.trim()) {
      toast.error("Please enter a note");
      return;
    }

    setAddingNote(true);
    try {
      const profileId = viewingUserId || user.uid;
      await addAdminNote(profileId, adminNote);
      toast.success("Note added successfully!");
      setAdminNote("");
      await loadProfile();
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const handleUpdateNote = async (idx, newNoteText) => {
    if (!newNoteText.trim()) {
      toast.error("Note cannot be empty");
      return;
    }

    try {
      const updatedNotes = [...profile.adminNotes];
      updatedNotes[idx] = {
        note: newNoteText,
        timestamp: new Date().toISOString(),
      };

      const profileId = viewingUserId || user.uid;
      await updateUserProfile(profileId, {
        adminNotes: updatedNotes,
      });

      toast.success("Note updated successfully!");
      await loadProfile();
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Failed to update note");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-rose-500" />
          <h3 className="text-xl font-bold mb-2">Profile not found</h3>
          <p className="text-gray-600">Unable to load profile data.</p>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      case "married":
        return "text-pink-600 bg-pink-50 border-pink-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "✅ Approved";
      case "rejected":
        return "❌ Rejected";
      case "married":
        return "💕 Married";
      case "pending":
        return "⏳ Pending Approval";
      default:
        return status;
    }
  };

  const InfoField = ({ icon, label, value, testId }) => (
    <div className="flex items-center gap-3" data-testid={testId}>
      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
        {React.cloneElement(icon, { className: "w-5 h-5 text-rose-600" })}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
        <p className="text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-12 px-6">
      <div className="container mx-auto max-w-4xl" data-testid="profile-container">
        <Card className="p-8 shadow-2xl border-0 bg-white/80 backdrop-blur">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2
                className="text-3xl font-bold mb-2"
                style={{ fontFamily: '"Playfair Display", serif' }}
                data-testid="profile-name"
              >
                {profile.fullName}
              </h2>
              <div
                className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                  profile.status
                )}`}
                data-testid="profile-status"
              >
                {getStatusText(profile.status)}
              </div>
            </div>

            <div className="flex gap-2">
              {!isAdminUser && !viewingUserId && profile.status === "pending" && (
                <Button
                  onClick={() => setShowRegister(true)}
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Complete Registration
                </Button>
              )}

              {isAdminUser && !isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}

              {isEditing && (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="border-gray-300">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <img
                src={profile.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                alt={profile.fullName}
                className="w-48 h-48 rounded-2xl object-cover border-4 border-rose-100 shadow-lg"
                data-testid="profile-photo"
              />
            </div>

            <div className="flex-1 space-y-6">
              {!isEditing ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InfoField icon={<Mail />} label="Email" value={profile.email} testId="profile-email" />
                    <InfoField
                      icon={<Phone />}
                      label="Mobile"
                      value={profile.mobile || "Not specified"}
                      testId="profile-mobile"
                    />
                    <InfoField
                      icon={<Calendar />}
                      label="Age"
                      value={profile.age || "Not specified"}
                      testId="profile-age"
                    />
                    <InfoField
                      icon={<User />}
                      label="Gender"
                      value={profile.gender || "Not specified"}
                      testId="profile-gender"
                    />
                    <InfoField
                      icon={<MapPin />}
                      label="Location"
                      value={`${profile.location || "Not specified"}${
                        profile.detailLocation ? `, ${profile.detailLocation}` : ""
                      }`}
                      testId="profile-location"
                    />
                    <InfoField
                      icon={<FileText />}
                      label="Bihar/Bahi Name"
                      value={profile.biharBahi || "Not specified"}
                      testId="profile-bihar"
                    />
                    <InfoField
                      icon={<User />}
                      label="Caste"
                      value={profile.caste || "Not specified"}
                      testId="profile-caste"
                    />
                    <InfoField
                      icon={<User />}
                      label="Intercaste in Family"
                      value={profile.intercaste || "Not specified"}
                      testId="profile-intercaste"
                    />
                  </div>

                  {profile.hobbies && (
                    <div data-testid="profile-hobbies">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Hobbies
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(profile.hobbies) ? profile.hobbies : profile.hobbies.split(",")).map(
                          (hobby, idx) => (
                            <span key={idx} className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-sm">
                              {hobby.trim()}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {profile.mustHave && (
                    <div data-testid="profile-musthave">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Must-have in Partner</p>
                      <p className="text-gray-800">{profile.mustHave}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  {/* Edit form - keeping it the same */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={editedProfile.firstName || ""}
                        onChange={(e) => handleEditChange("firstName", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Middle Name</Label>
                      <Input
                        value={editedProfile.middleName || ""}
                        onChange={(e) => handleEditChange("middleName", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={editedProfile.lastName || ""}
                        onChange={(e) => handleEditChange("lastName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Age</Label>
                      <Input
                        type="number"
                        value={editedProfile.age || ""}
                        onChange={(e) => handleEditChange("age", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <Select
                        value={editedProfile.gender || "Male"}
                        onValueChange={(value) => handleEditChange("gender", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Location</Label>
                      <Select
                        value={editedProfile.location || ""}
                        onValueChange={(value) => handleEditChange("location", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kathmandu">Kathmandu</SelectItem>
                          <SelectItem value="Lalitpur">Lalitpur</SelectItem>
                          <SelectItem value="Bhaktapur">Bhaktapur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Detail Location</Label>
                      <Input
                        value={editedProfile.detailLocation || ""}
                        onChange={(e) => handleEditChange("detailLocation", e.target.value)}
                        placeholder="Area / Street"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Mobile Number</Label>
                    <Input
                      value={editedProfile.mobile || ""}
                      onChange={(e) => handleEditChange("mobile", e.target.value)}
                      placeholder="98XXXXXXXX"
                      maxLength="10"
                    />
                  </div>

                  <div>
                    <Label>Bihar/Bahi Name</Label>
                    <Input
                      value={editedProfile.biharBahi || ""}
                      onChange={(e) => handleEditChange("biharBahi", e.target.value)}
                      placeholder="Enter Bihar/Bahi name"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Caste</Label>
                      <Input
                        value={editedProfile.caste || ""}
                        onChange={(e) => handleEditChange("caste", e.target.value)}
                        placeholder="Enter caste"
                      />
                    </div>
                    <div>
                      <Label>Intercaste in Family Tree</Label>
                      <Select
                        value={editedProfile.intercaste || "No"}
                        onValueChange={(value) => handleEditChange("intercaste", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Hobbies (Select multiple)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                      {HOBBIES_OPTIONS.map((hobby) => (
                        <label
                          key={hobby}
                          className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedHobbies.includes(hobby)}
                            onChange={() => toggleHobby(hobby)}
                            className="w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
                          />
                          <span className="text-sm">{hobby}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Must-have in Partner</Label>
                    <Textarea
                      value={editedProfile.mustHave || ""}
                      onChange={(e) => handleEditChange("mustHave", e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              )}

              {profile.status === "pending" && !isEditing && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> Your profile is pending admin approval. You will be notified once it's
                    reviewed.
                  </p>
                </div>
              )}

              {profile.status === "approved" && !isEditing && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    <strong>Congratulations!</strong> Your profile has been approved and is now visible to other users.
                  </p>
                </div>
              )}

              {/* Admin Notes Section - NOW WITH EDITING */}
              {isAdminUser && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Admin Notes</h3>

                  {/* Display Editable Notes */}
                  {profile.adminNotes && profile.adminNotes.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {profile.adminNotes.map((note, idx) => (
                        <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <Textarea
                            defaultValue={note.note}
                            onBlur={(e) => {
                              const newText = e.target.value.trim();
                              if (newText && newText !== note.note) {
                                handleUpdateNote(idx, newText);
                              }
                            }}
                            className="text-sm text-blue-900 bg-white border-blue-300 min-h-[80px] mb-2 focus:ring-2 focus:ring-blue-400"
                            placeholder="Click to edit note..."
                          />
                          <p className="text-xs text-blue-600">
                            Last updated: {new Date(note.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Note Form */}
                  <div>
                    <Label className="mb-2 block">Add New Note</Label>
                    <Textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Write a new note about this profile..."
                      className="mb-2 min-h-[100px]"
                    />
                    <Button
                      onClick={handleAddNote}
                      disabled={addingNote}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 w-full"
                    >
                      {addingNote ? "Adding..." : "Add Note"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
      {showRegister && <Register onClose={() => setShowRegister(false)}></Register>}
    </div>
  );
};

export default Profile;
