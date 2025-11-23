// src/services/cloudinaryService.js

const CLOUDINARY_CLOUD_NAME = "dcveol6qe";
const CLOUDINARY_UPLOAD_PRESET = "matrimonial_profiles";

export const compressImage = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Max dimensions
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
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          0.8
        );
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
};

export const uploadToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "matrimonial-profiles");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Upload failed");

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || !url.includes("cloudinary.com")) return url;

  const {
    width = 800,
    height = 800,
    crop = "fill",
    quality = "auto",
    format = "auto",
  } = options;
  const transformation = `w_${width},h_${height},c_${crop},q_${quality},f_${format},l_text:Arial_20:Shubhmangal,g_south_east,o_30`;

  return url.replace("/upload/", `/upload/${transformation}/`);
};

export const deleteFromCloudinary = async (publicId) => {
  console.log("Manual delete required:", publicId);
};
