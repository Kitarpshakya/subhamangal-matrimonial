import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { registerUser } from "../firebase/firebaseService";
import { toast } from "sonner";
import { UserPlus, Upload, Phone } from "lucide-react";

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

const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const maxWidth = 1200;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = (height / width) * maxWidth;
            width = maxWidth;
          } else {
            width = (width / height) * maxHeight;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.8
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const SignUp = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    age: "",
    gender: "Male",
    location: "",
    detail_location: "",
    mobile: "",
    mustHave: "",
    email: "",
    password: "",
  });
  const [selectedHobbies, setSelectedHobbies] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fromChatbot = searchParams.get("from") === "chatbot";

  useEffect(() => {
    if (fromChatbot) {
      toast.info("Sign up to view your detailed matches!");
    }
  }, [fromChatbot]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleHobby = (hobby) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]
    );
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      let file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      const compressed = await compressImage(file);
      setPhotoFile(compressed);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedHobbies.length === 0) {
      toast.error("Please select at least one hobby");
      return;
    }

    setLoading(true);

    try {
      // Combine name fields
      const fullName = [
        formData.firstName,
        formData.middleName,
        formData.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      if (!fullName.trim()) {
        toast.error("Please enter at least first and last name");
        setLoading(false);
        return;
      }

      // Validate mobile number (basic Nepal format)
      const mobileRegex = /^[9][6-9]\d{8}$/;
      if (
        formData.mobile &&
        !mobileRegex.test(formData.mobile.replace(/\s/g, ""))
      ) {
        toast.error(
          "Please enter a valid Nepali mobile number (10 digits starting with 98/97/96)"
        );
        setLoading(false);
        return;
      }

      const profileData = {
        firstName: formData.firstName || "",
        middleName: formData.middleName || "",
        lastName: formData.lastName || "",
        fullName: fullName,
        age: parseInt(formData.age) || null,
        gender: formData.gender || "Male",
        location: formData.location || "",
        detailLocation: formData.detail_location || "",
        mobile: formData.mobile || "",
        hobbies: selectedHobbies, // Store as array
        mustHave: formData.mustHave || "",
        biharBahi: "", // Initialize empty for admin to fill
        caste: "", // Initialize empty for admin to fill
        intercaste: "No", // Default value
      };

      await registerUser(
        formData.email,
        formData.password,
        profileData,
        photoFile
      );

      toast.success("🎉 Account created successfully!");

      // If coming from chatbot, redirect to matches after signin
      if (fromChatbot) {
        toast.info("Redirecting to your matches...");
        setTimeout(() => {
          navigate("/signin?redirect=/matches");
        }, 1000);
      } else {
        setTimeout(() => {
          navigate("/signin?redirect=/");
        }, 1000);
      }
    } catch (error) {
      console.error("Sign up error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already registered. Please sign in.");
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-12 px-6">
      <div className="container mx-auto max-w-4xl">
        <Card
          className="p-8 shadow-2xl border-0 bg-white/80 backdrop-blur"
          data-testid="signup-card"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Create Your Biodata
            </h2>
            <p className="text-gray-600">
              Join Shubhmangal and find your perfect match
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            data-testid="signup-form"
          >
            {/* Name Fields */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  data-testid="firstname-input"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  required
                  className="border-gray-200 focus:border-rose-300 focus:ring-rose-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  data-testid="middlename-input"
                  value={formData.middleName}
                  onChange={(e) => handleChange("middleName", e.target.value)}
                  className="border-gray-200 focus:border-rose-300 focus:ring-rose-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  data-testid="lastname-input"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  required
                  className="border-gray-200 focus:border-rose-300 focus:ring-rose-200"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  data-testid="age-input"
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  required
                  className="border-gray-200 focus:border-rose-300 focus:ring-rose-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleChange("gender", value)}
                >
                  <SelectTrigger
                    data-testid="gender-select"
                    className="border-gray-200 focus:border-rose-300 focus:ring-rose-200"
                  >
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

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="grid grid-cols-3 gap-3">
                <Select
                  value={formData.location}
                  onValueChange={(value) => handleChange("location", value)}
                >
                  <SelectTrigger className="border-gray-200 focus:border-rose-300 focus:ring-rose-200 col-span-1">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kathmandu">Kathmandu</SelectItem>
                    <SelectItem value="Lalitpur">Lalitpur</SelectItem>
                    <SelectItem value="Bhaktapur">Bhaktapur</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  data-testid="other-location-input"
                  placeholder="Area / Street"
                  disabled={!formData.location}
                  value={formData.detail_location || ""}
                  onChange={(e) =>
                    handleChange("detail_location", e.target.value)
                  }
                  className={`col-span-2 border-gray-200 focus:border-rose-300 focus:ring-rose-200
        ${!formData.location ? "bg-gray-100 cursor-not-allowed" : ""}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Mobile Number *
              </Label>
              <Input
                id="mobile"
                data-testid="mobile-input"
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleChange("mobile", e.target.value)}
                placeholder="98XXXXXXXX"
                required
                maxLength="10"
                className="border-gray-200 focus:border-rose-300 focus:ring-rose-200"
              />
              <p className="text-xs text-gray-500">
                Enter 10-digit Nepali mobile number (starting with 98/97/96)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Hobbies * (Select at least one)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 border rounded-lg bg-gray-50">
                {HOBBIES_OPTIONS.map((hobby) => (
                  <label
                    key={hobby}
                    className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedHobbies.includes(hobby)}
                      onChange={() => toggleHobby(hobby)}
                      className="w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
                      data-testid={`hobby-checkbox-${hobby.toLowerCase()}`}
                    />
                    <span className="text-sm">{hobby}</span>
                  </label>
                ))}
              </div>
              {selectedHobbies.length > 0 && (
                <p className="text-sm text-gray-600">
                  Selected: {selectedHobbies.join(", ")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mustHave">Must-have in partner</Label>
              <Textarea
                id="mustHave"
                data-testid="musthave-input"
                value={formData.mustHave}
                onChange={(e) => handleChange("mustHave", e.target.value)}
                placeholder="Describe your ideal partner..."
                className="border-gray-200 focus:border-rose-300 focus:ring-rose-200 min-h-[100px]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  data-testid="email-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  className="border-gray-200 focus:border-rose-300 focus:ring-rose-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                  minLength="6"
                  className="border-gray-200 focus:border-rose-300 focus:ring-rose-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Profile Photo
              </Label>
              <Input
                id="photo"
                data-testid="photo-input"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="border-gray-200 focus:border-rose-300 focus:ring-rose-200"
              />
              {photoFile && (
                <p className="text-sm text-gray-600">
                  Selected: {photoFile.name}
                </p>
              )}
            </div>

            <Button
              data-testid="signup-submit-button"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-lg py-6 shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? "Creating Account..." : "Create Biodata"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/signin"
                data-testid="signin-link"
                className="text-rose-600 hover:text-rose-700 font-semibold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
