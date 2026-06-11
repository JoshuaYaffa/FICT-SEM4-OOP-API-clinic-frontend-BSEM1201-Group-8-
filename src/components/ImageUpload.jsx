// src/components/ImageUpload.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const ImageUpload = ({ currentImage, onImageUpload, label = "Profile Image" }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result;
      setPreview(imageUrl);
      onImageUpload(imageUrl);
      toast.success('Image selected successfully');
    };
    reader.readAsDataURL(file);
    setUploading(false);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUpload('');
    toast.success('Image removed');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-4">
        <div className="relative">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-cyan-500"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-3xl text-gray-400">👤</span>
            </div>
          )}
          <label className="absolute bottom-0 right-0 bg-cyan-600 rounded-full p-1 cursor-pointer shadow-lg hover:bg-cyan-700 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </label>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500">
            Click the camera icon to upload or change image.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Supported formats: JPG, PNG, GIF (Max 5MB)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;