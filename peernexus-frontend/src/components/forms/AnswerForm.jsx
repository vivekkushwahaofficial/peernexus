import React, { useState, useEffect } from "react";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";

export function AnswerForm({ initialData, onSubmit, loading, onCancel }) {
  const [content, setContent] = useState(initialData?.content || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setContent(initialData.content);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Answer description cannot be empty");
      return;
    }
    if (content.trim().length < 10) {
      setError("Please write a detailed explanation (minimum 10 characters)");
      return;
    }

    onSubmit({ content: content.trim() });
    if (!initialData) {
      setContent(""); // Clear input if posting a new answer
    }
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={initialData ? "Edit Your Answer" : "Post an Answer"}
        name="answerContent"
        type="textarea"
        placeholder="Write a clear, explanatory solution to this doubt. Code fragments, explanations, and links are encouraged..."
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (error) setError("");
        }}
        error={error}
        rows={5}
        required
      />

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {initialData ? "Save Changes" : "Post Answer"}
        </Button>
      </div>
    </form>
  );
}

export default AnswerForm;
