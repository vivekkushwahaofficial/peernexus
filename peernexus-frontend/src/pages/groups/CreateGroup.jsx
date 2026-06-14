import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateGroup, useUploadGroupImage } from "../../hooks/useGroups.js";
import { useToast } from "../../hooks/useToast.js";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";

export function CreateGroup() {
  const toast = useToast();
  const navigate = useNavigate();

  const createGroupMutation = useCreateGroup();
  const uploadImageMutation = useUploadGroupImage();

  const [form, setForm] = useState({
    name: "",
    description: "",
    topic: "",
    isPrivate: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: val }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Group name is required";
    else if (form.name.length < 2) newErrors.name = "Name must be at least 2 characters";

    if (form.description.length > 1000) newErrors.description = "Description cannot exceed 1000 characters";
    if (form.topic.length > 100) newErrors.topic = "Topic tag cannot exceed 100 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // 1. Create the group
      const newGroup = await createGroupMutation.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim(),
        topic: form.topic.trim(),
        isPrivate: form.isPrivate,
      });

      // 2. Upload image if present
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile); // Backend uses 'file' param name
        await uploadImageMutation.mutateAsync({ id: newGroup.id, formData });
      }

      toast.success("Study group created successfully!");
      navigate(`/groups/${newGroup.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create study group");
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink font-display">Create Study Group</h1>
        <p className="text-xs text-ink/50 mt-1">Start a sub-community for group learning and resource sharing.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-white p-6 rounded-3xl border border-ink/8 shadow-sm">
        <Input
          label="Group Name"
          name="name"
          placeholder="e.g. DSA & LeetCode Prep"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <Input
          label="Topic Tag"
          name="topic"
          placeholder="e.g. algorithms"
          value={form.topic}
          onChange={handleChange}
          error={errors.topic}
        />

        <Input
          label="Description"
          name="description"
          type="textarea"
          placeholder="What is this group about? Include rules, study goals, or resources..."
          value={form.description}
          onChange={handleChange}
          error={errors.description}
          rows={4}
        />

        {/* Privacy Switch */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-ink/5">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-ink">Make Group Private</span>
            <span className="text-[10px] text-ink/40">Private groups require admin approval for new members.</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="isPrivate"
              checked={form.isPrivate}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
          </label>
        </div>

        {/* Group Banner Selection */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold text-ink/75 uppercase tracking-wider">Group Banner</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border border-ink/10 rounded-xl hover:bg-slate-50 transition text-xs font-semibold"
            >
              Select Image
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {imagePreview && (
              <div className="relative w-28 h-16 rounded-xl overflow-hidden border border-ink/8">
                <img src={imagePreview} alt="Group banner preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-lg p-0.5 hover:bg-black transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Row */}
        <div className="flex justify-end gap-2.5 border-t border-ink/8 pt-4 mt-2">
          <Button variant="ghost" onClick={() => navigate("/groups")} disabled={createGroupMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={createGroupMutation.isPending || uploadImageMutation.isPending}
          >
            Create Group
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateGroup;
