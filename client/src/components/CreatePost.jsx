import { useState, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import { Send, Image as ImageIcon, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CreatePost = ({ onPostCreated }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fileInputRef = useRef();

  // Handle image select
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file)); // Preview image
  };

  // Remove selected image
  const removeImage = () => {
    setImage(null);
    setPreview(null);
    fileInputRef.current.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("text", text);
      if (image) formData.append("image", image);

      const res = await axiosInstance.post("/api/v1/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onPostCreated(res.data.data);
      setText("");
      removeImage();
    } catch (err) {
      console.error("Failed to create post:", err);
      alert(err.response?.data?.error || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <form onSubmit={handleSubmit} className="flex-1">
          {/* Text input */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="3"
            maxLength={500}
          />

          {/* Image preview */}
          {preview && (
            <div className="relative mt-3 w-40">
              <img
                src={preview}
                className="rounded-lg border shadow"
                alt="preview"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-white border rounded-full p-1 shadow"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            {/* Select Image Button */}
            <button
              type="button"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              onClick={() => fileInputRef.current.click()}
            >
              <ImageIcon size={20} />
              <span className="text-sm">Photo</span>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </button>

            {/* Submit */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">{text.length}/500</span>

              <button
                type="submit"
                disabled={loading || (!text.trim() && !image)}
                className="btn-primary flex items-center space-x-2"
              >
                <span>{loading ? "Posting..." : "Post"}</span>
                <Send size={16} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
