import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { useDoubt, useUpdateDoubt } from "../../hooks/useDoubts.js";
import AskDoubtForm from "../../components/forms/AskDoubtForm.jsx";
import Spinner from "../../components/common/Spinner.jsx";

export function EditDoubt() {
  const { id } = useParams();
  const doubtId = parseInt(id, 10);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const { data: doubt, isLoading } = useDoubt(doubtId);
  const updateDoubtMutation = useUpdateDoubt();

  useEffect(() => {
    if (doubt && user && doubt.author.id !== user.id) {
      toast.error("You are not authorized to edit this doubt");
      navigate(`/doubts/${doubtId}`);
    }
  }, [doubt, user, doubtId, navigate, toast]);

  const handleUpdateDoubt = async (payload) => {
    try {
      await updateDoubtMutation.mutateAsync({
        id: doubtId,
        payload,
      });
      toast.success("Doubt updated successfully!");
      navigate(`/doubts/${doubtId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update doubt");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink font-display">Edit Doubt</h1>
        <p className="text-xs text-ink/50 mt-1">Make adjustments to your academic doubt description.</p>
      </div>

      {doubt && (
        <AskDoubtForm
          initialData={doubt}
          onSubmit={handleUpdateDoubt}
          loading={updateDoubtMutation.isPending}
        />
      )}
    </div>
  );
}

export default EditDoubt;
