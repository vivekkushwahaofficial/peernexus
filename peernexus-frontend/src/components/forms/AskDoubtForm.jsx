import React, { useState } from "react";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import { cloudinaryService } from "../../services/cloudinaryService.js";
import Spinner from "../common/Spinner.jsx";

const CATEGORIES = [
  { value: "1", label: "Java" },
  { value: "2", label: "Spring Boot" },
  { value: "3", label: "React" },
  { value: "4", label: "DSA" },
  { value: "5", label: "DBMS" },
  { value: "6", label: "Operating Systems" },
  { value: "7", label: "Computer Networks" },
  { value: "8", label: "OOP" },
  { value: "9", label: "Aptitude" },
  { value: "10", label: "Interview Preparation" },
];

export function AskDoubtForm({ initialData, onSubmit, loading }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [categoryId, setCategoryId] = useState(initialData?.category?.id?.toString() || "1");
  const [tagInput, setTagInput] = useState(initialData?.tags?.join(", ") || "");
  const [imageUrls, setImageUrls] = useState(initialData?.images?.map(img => img.url) || []);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const urls = [];
    try {
      for (const file of files) {
        const url = await cloudinaryService.uploadFile(file);
        urls.push(url);
      }
      setImageUrls((prev) => [...prev, ...urls]);
    } catch (err) {
      console.error("Image upload failed:", err);
      setErrors((prev) => ({ ...prev, images: "Failed to upload one or more images" }));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    else if (title.length < 5) newErrors.title = "Title must be at least 5 characters";

    if (!content.trim()) newErrors.content = "Content/Description is required";
    else if (content.length < 20) newErrors.content = "Please describe your doubt in at least 20 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Parse comma separated tags
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      categoryId: parseInt(categoryId, 10),
      tags,
      imageUrls,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-white p-6 rounded-3xl border border-ink/8 shadow-sm">
      <Input
        label="Doubt Title"
        name="title"
        placeholder="e.g. How to resolve LazyInitializationException in Spring JPA?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        required
      />

      <Input
        label="Doubt Category"
        name="categoryId"
        type="select"
        options={CATEGORIES}
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      />

      <Input
        label="Detailed Description"
        name="content"
        type="textarea"
        placeholder="Explain your doubt, include code snippets or error logs if any..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        error={errors.content}
        rows={6}
        required
      />

      <Input
        label="Tags (comma-separated)"
        name="tags"
        placeholder="jpa, hibernate, n-plus-one"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
      />

      {/* Image Upload Area */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-ink/75 uppercase tracking-wider">
          Attachments / Images
        </span>
        <div className="flex items-center gap-4">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-ink/15 rounded-2xl cursor-pointer p-4 w-32 h-32 hover:border-accent transition hover:bg-slate-50">
            <svg className="w-8 h-8 text-ink/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] text-ink/40 font-semibold mt-2">Add files</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>

          {/* Image Previews */}
          <div className="flex gap-2 flex-wrap items-center">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="relative group w-32 h-32 rounded-2xl overflow-hidden border border-ink/8">
                <img src={url} alt="Doubt attachment preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-lg p-1 hover:bg-black transition opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {uploading && (
              <div className="flex items-center justify-center border border-ink/8 rounded-2xl w-32 h-32 bg-slate-50">
                <Spinner size="sm" />
              </div>
            )}
          </div>
        </div>
        {errors.images && <span className="text-xs font-medium text-ember">{errors.images}</span>}
      </div>

      <div className="flex justify-end gap-3 border-t border-ink/8 pt-4 mt-2">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={uploading}
        >
          {initialData ? "Update Doubt" : "Post Doubt"}
        </Button>
      </div>
    </form>
  );
}

export default AskDoubtForm;
