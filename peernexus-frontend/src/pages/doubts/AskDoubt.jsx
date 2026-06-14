import React from "react";
import { useNavigate } from "react-router-dom";
import { useCreateDoubt } from "../../hooks/useDoubts.js";
import { useToast } from "../../hooks/useToast.js";
import AskDoubtForm from "../../components/forms/AskDoubtForm.jsx";

export function AskDoubt() {
  const navigate = useNavigate();
  const toast = useToast();
  const createDoubtMutation = useCreateDoubt();

  const handlePostDoubt = async (payload) => {
    try {
      await createDoubtMutation.mutateAsync(payload);
      toast.success("Doubt posted successfully!");
      navigate("/doubts");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to post doubt");
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink font-display">Ask a Doubt</h1>
        <p className="text-xs text-ink/50 mt-1">
          Explain your academic query in detail so that other students can help.
        </p>
      </div>

      <AskDoubtForm
        onSubmit={handlePostDoubt}
        loading={createDoubtMutation.isPending}
      />
    </div>
  );
}

export default AskDoubt;
