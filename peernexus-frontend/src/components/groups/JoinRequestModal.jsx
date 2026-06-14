import React, { useState, useEffect } from "react";
import Modal from "../common/Modal.jsx";
import Button from "../common/Button.jsx";

export function JoinRequestModal({ isOpen, onClose, onSubmit, loading, groupName }) {
  const [message, setMessage] = useState("");

  // Clear message when modal opens
  useEffect(() => {
    if (isOpen) {
      setMessage("");
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(message);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Private Group" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-ink/75 leading-relaxed mb-3">
            {groupName ? (
              <>
                You are requesting to join the study group <strong>{groupName}</strong>. You can enter an optional message for the administrators below:
              </>
            ) : (
              "Enter an optional message for your request to join:"
            )}
          </p>
          <textarea
            className="w-full h-24 rounded-2xl border border-ink/10 bg-white p-3 text-sm text-ink placeholder:text-ink/40 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15 shadow-sm resize-none"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="flex justify-end gap-2.5">
          <Button variant="ghost" onClick={onClose} disabled={loading} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Send Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default JoinRequestModal;
