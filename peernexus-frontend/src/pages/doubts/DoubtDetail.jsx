import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { useDoubt, useDeleteDoubt } from "../../hooks/useDoubts.js";
import { useAIExplain } from "../../hooks/useAI.js";
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
  const [aiResponse, setAiResponse] = useState(null);
  const [cooldown, setCooldown] = useState(0);


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
  const aiExplainMutation = useAIExplain();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleAskAI = async () => {
    if (cooldown > 0) return;
    try {
      const response = await aiExplainMutation.mutateAsync({
        title: doubt.title,
        description: doubt.content,
      });
      setAiResponse(response);
      setCooldown(30);
      toast.success("AI suggestion generated successfully!");
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Unable to generate AI response.";
      toast.error(errMsg);
    }
  };

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

  const [deleteAnswerId, setDeleteAnswerId] = useState(null);

  const handleDeleteAnswer = (answerId) => {
    setDeleteAnswerId(answerId);
  };

  const handleConfirmDeleteAnswer = async () => {
    if (!deleteAnswerId) return;
    try {
      await deleteAnswerMutation.mutateAsync(deleteAnswerId);
      toast.success("Answer deleted successfully");
      setDeleteAnswerId(null);
    } catch (err) {
      toast.error("Failed to delete answer");
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
      <div className="card p-6 bg-white flex flex-col gap-5 border border-ink/5 shadow-[0_4px_25px_-5px_rgba(16,21,26,0.03)]">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <Link to={doubt.author?.id === user?.id ? "/profile" : `/profile/${doubt.author?.id}`} className="flex items-center gap-3 group min-w-0">
            <Avatar name={doubt.author?.name} src={doubt.author?.avatarUrl} size="md" className="group-hover:opacity-90 transition-opacity" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-ink leading-none group-hover:text-accent transition-colors truncate">{doubt.author?.name}</span>
                {doubt.author?.verified && (
                  <svg className="w-4.5 h-4.5 text-accent shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-[10px] text-ink/40 font-semibold mt-1">Asked: {formatDate(doubt.createdAt)}</span>
            </div>
          </Link>

          <div className="flex gap-2 self-start sm:self-auto flex-wrap">
            {doubt.category && (
              <Badge variant="primary" className="normal-case font-semibold">
                {doubt.category.name}
              </Badge>
            )}
            <Badge variant={doubt.status === "OPEN" ? "info" : doubt.status === "ANSWERED" ? "success" : "neutral"}>
              {doubt.status}
            </Badge>
          </div>
        </div>

        {/* Content row */}
        <div className="flex flex-col gap-3 border-t border-ink/5 pt-5">
          <h1 className="text-xl font-bold text-ink leading-snug">{doubt.title}</h1>
          <p className="text-sm text-ink/70 leading-relaxed whitespace-pre-wrap break-words">{doubt.content}</p>
        </div>

        {/* Images */}
        {doubt.images && doubt.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {doubt.images.map((img) => (
              <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer" className="relative h-48 rounded-2xl overflow-hidden border border-ink/5 shadow-sm group hover:border-ink/15 transition-all">
                <img src={img.url} alt="doubt attachment" className="w-full h-full object-cover cursor-zoom-in group-hover:scale-102 transition-transform duration-300" />
              </a>
            ))}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {doubt.tags && doubt.tags.map((t, idx) => (
            <span
              key={idx}
              className="text-[10px] font-bold text-ink/40 bg-ink/5 border border-transparent px-2.5 py-1 rounded-lg hover:bg-ink/8 hover:text-ink/60 transition-all cursor-pointer"
            >
              #{t}
            </span>
          ))}
        </div>

        {/* Action Row */}
        <div className="border-t border-ink/5 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {isOwner ? (
              <>
                <Link to={`/doubts/${doubtId}/edit`} className="flex-1 sm:flex-initial">
                  <Button variant="outline" size="sm" className="w-full font-bold">Edit Doubt</Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => setDeleteDialogOpen(true)} className="flex-1 sm:flex-initial font-bold">
                  Delete Doubt
                </Button>
              </>
            ) : (
              <button
                onClick={() => setReportModalOpen(true)}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition cursor-pointer border border-transparent hover:border-rose-100 mr-2"
              >
                Report Abuse
              </button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={handleAskAI}
              loading={aiExplainMutation.isPending}
              disabled={cooldown > 0}
              className="flex-1 sm:flex-initial font-bold text-xs"
            >
              {cooldown > 0 ? `🤖 Ask AI (${cooldown}s)` : "🤖 Ask AI"}
            </Button>
          </div>

          <Link to="/doubts" className="text-xs font-bold text-ink/40 hover:text-ink hover:underline self-end sm:self-auto">
            Back to forum
          </Link>
        </div>
      </div>

      {/* AI Card */}
      {aiResponse && (
        <div className="card p-6 bg-white border border-ink/5 shadow-sm animate-slide-up flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center gap-2 pb-4 border-b border-ink/5">
            <span className="text-xl">🤖</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-ink font-display">AI Learning Assistant</h2>
                <span className="text-[9px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AI Guidance
                </span>
              </div>
              <p className="text-[10px] text-ink/40 font-semibold tracking-wider">GUIDANCE ONLY • COLLABORATIVE LEARNING ASSISTANT</p>
            </div>

          </div>

          {/* Hint */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-xs font-bold text-ink/80 flex items-center gap-1.5 font-display">
              <span>💡</span> Hint
            </h3>
            <p className="text-xs text-ink/75 leading-relaxed pl-6 font-medium bg-pearl/40 p-2.5 rounded-lg border border-ink/5">
              {aiResponse.hint}
            </p>
          </div>

          {/* Explanation */}
          <div className="flex flex-col gap-1.5 pt-2">
            <h3 className="text-xs font-bold text-ink/80 flex items-center gap-1.5 font-display">
              <span>📖</span> Explanation
            </h3>
            <p className="text-xs text-ink/75 leading-relaxed pl-6 whitespace-pre-wrap">
              {aiResponse.explanation}
            </p>
          </div>

          {/* Things to Check */}
          <div className="flex flex-col gap-2 pt-2">
            <h3 className="text-xs font-bold text-ink/80 flex items-center gap-1.5 font-display">
              <span>✅</span> Things to Check
            </h3>
            <ul className="flex flex-col gap-2 pl-6">
              {aiResponse.checks && aiResponse.checks.map((check, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-ink/70">
                  <span className="text-success shrink-0">✔</span>
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Topics */}
          {aiResponse.relatedTopics && aiResponse.relatedTopics.length > 0 && (
            <div className="flex flex-col gap-2.5 pt-4 border-t border-ink/5">
              <h3 className="text-xs font-bold text-ink/80 flex items-center gap-1.5 font-display">
                <span>📚</span> Related Topics
              </h3>
              <div className="flex flex-wrap gap-2 pl-6">
                {aiResponse.relatedTopics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold text-ink/50 bg-ink/5 px-2.5 py-1 rounded-lg border border-ink/5"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="pt-4 border-t border-ink/5 text-center">
            <p className="text-[10px] text-ink/40 font-semibold italic">
              AI-generated guidance may be incomplete. Review peer answers below and verify important information.
            </p>
          </div>
        </div>
      )}


      {/* Answers Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-bold text-ink font-display tracking-wide uppercase px-1">
          Solutions ({answers.length})
        </h2>

        {answersLoading ? (
          <div className="flex justify-center p-6">
            <Spinner size="md" />
          </div>
        ) : answers.length === 0 ? (
          <div className="card p-8 text-center text-ink/40 text-xs bg-white border border-ink/5">
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
        <div className="card p-6 bg-white border border-warning/30 shadow-sm">
          <AnswerForm
            initialData={editingAnswer}
            onSubmit={handleSaveEditAnswer}
            loading={updateAnswerMutation.isPending}
            onCancel={() => setEditingAnswer(null)}
          />
        </div>
      ) : (
        <div className="card p-6 bg-white border border-ink/5 shadow-sm">
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

      {/* Delete Answer Dialog */}
      <ConfirmDialog
        isOpen={deleteAnswerId !== null}
        onClose={() => setDeleteAnswerId(null)}
        onConfirm={handleConfirmDeleteAnswer}
        title="Delete Answer"
        message="Are you sure you want to delete this answer? This action cannot be undone."
        loading={deleteAnswerMutation.isPending}
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
