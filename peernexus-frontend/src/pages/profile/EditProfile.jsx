import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { userService } from "../../services/userService.js";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import Avatar from "../../components/common/Avatar.jsx";

export function EditProfile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    skills: user?.skills || "",
    interests: user?.interests || "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(user?.profilePicture || user?.avatarUrl || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type (JPG, PNG, WEBP)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Allowed formats: JPG, PNG, WEBP");
      toast.error("Invalid image format! Please use JPG, PNG, or WEBP.");
      return;
    }

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("File size cannot exceed 5MB");
      toast.error("File is too large! Maximum limit is 5MB.");
      return;
    }

    setAvatarError("");
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);

    try {
      const updatedUser = await userService.uploadProfilePicture(file);
      updateUser(updatedUser);
      toast.success("Profile picture updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to upload profile picture.");
      setAvatarPreview(user?.profilePicture || user?.avatarUrl || "");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (form.bio.length > 500) newErrors.bio = "Bio cannot exceed 500 characters";
    if (form.skills.length > 500) newErrors.skills = "Skills list cannot exceed 500 characters";
    if (form.interests.length > 500) newErrors.interests = "Interests list cannot exceed 500 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const updatedUser = await userService.updateMe({
        name: form.name.trim(),
        bio: form.bio.trim(),
        skills: form.skills.trim(),
        interests: form.interests.trim(),
      });
      updateUser(updatedUser);
      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink font-display">Edit Profile</h1>
        <p className="text-xs text-ink/50 mt-1">Update your account credentials and bio.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-white p-6 rounded-3xl border border-ink/8 shadow-sm">
        {/* Profile Picture Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50/50 border border-ink/5">
          <div className="relative shrink-0">
            <Avatar src={avatarPreview} name={form.name} size="xl" className="shadow-md border-2 border-white ring-4 ring-ink/[0.03]" />
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-ink/40 rounded-full flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <span className="text-xs font-bold text-ink">Profile Picture</span>
            <p className="text-[10px] text-ink/40 mt-1 leading-normal">
              Supported: JPG, PNG, WEBP (Max 5MB). Image will be optimized automatically.
            </p>
            <div className="mt-3.5 flex flex-wrap gap-2.5 justify-center sm:justify-start">
              <label className="relative cursor-pointer">
                <Button as="span" variant="primary" size="sm" loading={uploadingAvatar} className="pointer-events-none">
                  Choose Photo
                </Button>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            </div>
            {avatarError && <p className="text-[10px] font-bold text-red-500 mt-2">{avatarError}</p>}
          </div>
        </div>

        <Input
          label="Display Name"
          name="name"
          placeholder="e.g. Alex Mercer"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <Input
          label="Biography"
          name="bio"
          type="textarea"
          placeholder="Tell other students about your background, goals, or study schedule..."
          value={form.bio}
          onChange={handleChange}
          error={errors.bio}
          rows={4}
        />

        <Input
          label="Skills (comma-separated)"
          name="skills"
          placeholder="Java, React, SQL, Algorithms"
          value={form.skills}
          onChange={handleChange}
          error={errors.skills}
        />

        <Input
          label="Interests (comma-separated)"
          name="interests"
          placeholder="Web Development, Competitive Programming, Database Systems"
          value={form.interests}
          onChange={handleChange}
          error={errors.interests}
        />

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 border-t border-ink/8 pt-4 mt-2">
          <Button variant="ghost" onClick={() => navigate("/profile")} disabled={loading} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} className="w-full sm:w-auto">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
