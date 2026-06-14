import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { useDoubt, useDeleteDoubt } from "../../hooks/useDoubts.js";
import {
  useAnswersByDoubt,
  useCreateAnswer,
  useUpdateAnswer,
  useDeleteAnswer,
  useAcceptAnswer,
  useVoteAnswer,
} from "../../hooks/useAnswers.js";
import { useSubmitReport } from "../../hooks/useAdmin.js";
import Avatar from "../../components/common/Avatar.jsx";
import Badge from "../../components/common/Badge.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import AnswerCard from "../../components/common/AnswerCard.jsx";
import AnswerForm from "../../components/forms/AnswerForm.jsx";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";

export function DoubtDetail() {
  const { id } = useParams();
  const doubtId = parseInt(id, 10);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [editingAnswer, setEditingAnswer] = useState(null); // stores answer object if editing

  // React Query queries/mutations
  const { data: doubt, isLoading: doubtLoading, error: doubtError } = useDoubt(doubtId);
  const { data: answersData, isLoading: answersLoading } = useAnswersByDoubt(doubtId);
  const answers = answersData?.content || [];

  const deleteDoubtMutation = useDeleteDoubt();
  const createAnswerMutation = useCreateAnswer(doubtId);
  const updateAnswerMutation = useUpdateAnswer(doubtId);
  const deleteAnswerMutation = useDeleteAnswer(doubtId);
  const acceptAnswerMutation = useAcceptAnswer(doubtId);
  const voteAnswerMutation = useVoteAnswer(doubtId);
  const submitReportMutation = useSubmitReport();

  const isOwner = doubt?.author?.id === user?.id;

  const handleDeleteDoubt = async () => {
    try {
      await deleteDoubtMutation.mutateAsync(doubtId);
      toast.success("Doubt deleted successfully");
      navigate("/doubts");
    } catch (err) {
      toast.error("Failed to delete doubt");
    }
  };

  const handlePostAnswer = async (payload) => {
    try {
      await createAnswerMutation.mutateAsync({
        doubtId,
        content: payload.content,
      });
      toast.success("Answer posted successfully");
    } catch (err) {
      toast.error("Failed to post answer");
    }
  };

  const handleSaveEditAnswer = async (payload) => {
    try {
      await updateAnswerMutation.mutateAsync({
        id: editingAnswer.id,
        payload: { content: payload.content },
      });
      toast.success("Answer updated successfully");
      setEditingAnswer(null);
    } catch (err) {
      toast.error("Failed to update answer");
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (window.confirm("Are you sure you want to delete this answer?")) {
      try {
        await deleteAnswerMutation.mutateAsync(answerId);
        toast.success("Answer deleted successfully");
      } catch (err) {
        toast.error("Failed to delete answer");
      }
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await acceptAnswerMutation.mutateAsync(answerId);
      toast.success("Answer accepted as correct solution");
    } catch (err) {
      toast.error("Failed to accept answer");
    }
  };

  const handleVoteAnswer = async (answerId, type) => {
    try {
      await voteAnswerMutation.mutateAsync({ id: answerId, type });
      toast.success(`Vote registered: ${type.toLowerCase()}`);
    } catch (err) {
      toast.error("You can only vote once per answer");
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    try {
      await submitReportMutation.mutateAsync({
        type: "DOUBT",
        targetId: doubtId,
        reason: reportReason.trim(),
      });
      toast.success("Report submitted successfully for moderation");
      setReportModalOpen(false);
      setReportReason("");
    } catch (err) {
      toast.error("Failed to submit report");
    }
  };

  if (doubtLoading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (doubtError || !doubt) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-ink">Doubt not found</h2>
        <p className="text-xs text-ink/40 mt-1">
          This doubt may have been deleted or the URL is incorrect.
        </p>
        <Link to="/doubts" className="mt-4 inline-block text-accent font-bold hover:underline text-xs">
          Back to Doubt Forum
        </Link>
      </div>
    );
  }

  const formatDate = (isoStr) => {
    if (!isoStr) return "";
    return new Date(isoStr).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-fade-in">
      {/* Doubt Card Box */}
      <div className="card p-6 bg-white flex flex-col gap-5 shadow-sm border-ink/10">
        {/* Header row */}
        <div className="flex justify-between items-start">
          <Link to={doubt.author?.id === user?.id ? "/profile" : `/profile/${doubt.author?.id}`} className="flex items-center gap-3 group">
            <Avatar name={doubt.author?.name} size="md" className="group-hover:opacity-90 transition-opacity" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-ink leading-none group-hover:text-accent transition-colors">{doubt.author?.name}</span>
                {doubt.author?.verified && (
                  <svg className="w-4.5 h-4.5 text-accent shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-[10px] text-ink/40 mt-1">Asked: {formatDate(doubt.createdAt)}</span>
            </div>
          </Link>

          <div className="flex gap-2">
            {doubt.category && (
              <Badge variant="primary" className="normal-case font-medium">
                {doubt.category.name}
              </Badge>
            )}
            <Badge variant={doubt.status === "OPEN" ? "info" : doubt.status === "ANSWERED" ? "success" : "neutral"}>
              {doubt.status}
            </Badge>
          </div>
        </div>

        {/* Content row */}
        <div className="flex flex-col gap-3 border-t border-ink/5 pt-4">
          <h1 className="text-xl font-bold text-ink leading-snug">{doubt.title}</h1>
          <p className="text-sm text-ink/85 leading-relaxed whitespace-pre-wrap break-words">{doubt.content}</p>
        </div>

        {/* Images */}
        {doubt.images && doubt.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {doubt.images.map((img) => (
              <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer" className="relative h-48 rounded-2xl overflow-hidden border border-ink/8 shadow-sm">
                <img src={img.url} alt="doubt attachment" className="w-full h-full object-cover cursor-zoom-in" />
              </a>
            ))}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {doubt.tags && doubt.tags.map((t, idx) => (
            <span key={idx} className="text-xs font-semibold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
              #{t}
            </span>
          ))}
        </div>

        {/* Action Row */}
        <div className="border-t border-ink/8 pt-4 flex items-center justify-between">
          {isOwner ? (
            <div className="flex gap-2.5">
              <Link to={`/doubts/${doubtId}/edit`}>
                <Button variant="outline" size="sm">Edit Doubt</Button>
              </Link>
              <Button variant="danger" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                Delete Doubt
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setReportModalOpen(true)}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg transition"
            >
              Report Abuse
            </button>
          )}

          <Link to="/doubts" className="text-xs font-bold text-ink/40 hover:text-ink hover:underline">
            Back to forum
          </Link>
        </div>
      </div>

      {/* Answers Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-ink font-display">
          Solutions ({answers.length})
        </h2>

        {answersLoading ? (
          <div className="flex justify-center p-6">
            <Spinner size="md" />
          </div>
        ) : answers.length === 0 ? (
          <div className="card p-6 text-center text-ink/40 text-xs bg-white">
            No solutions have been posted for this doubt yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {answers.map((answer) => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                isDoubtOwner={isOwner}
                onAccept={handleAcceptAnswer}
                onVote={handleVoteAnswer}
                currentUserId={user?.id}
                onDelete={handleDeleteAnswer}
                onEdit={(ans) => setEditingAnswer(ans)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Answer Composition Form */}
      {editingAnswer ? (
        <div className="card p-5 bg-white border border-amber-300">
          <AnswerForm
            initialData={editingAnswer}
            onSubmit={handleSaveEditAnswer}
            loading={updateAnswerMutation.isPending}
            onCancel={() => setEditingAnswer(null)}
          />
        </div>
      ) : (
        <div className="card p-5 bg-white">
          <AnswerForm
            onSubmit={handlePostAnswer}
            loading={createAnswerMutation.isPending}
          />
        </div>
      )}

      {/* Delete Doubt Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteDoubt}
        title="Delete Doubt"
        message="Are you sure you want to permanently delete this doubt and all of its associated answers?"
        loading={deleteDoubtMutation.isPending}
      />

      {/* Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Doubt"
        size="sm"
      >
        <form onSubmit={handleReportSubmit} className="flex flex-col gap-4">
          <Input
            label="Reason for reporting"
            name="reason"
            type="textarea"
            placeholder="Explain why this content violates academic integrity or community guidelines..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            required
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setReportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={submitReportMutation.isPending}>
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default DoubtDetail;
