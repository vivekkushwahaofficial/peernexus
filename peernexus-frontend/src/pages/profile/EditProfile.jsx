import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { userService } from "../../services/userService.js";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";

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
