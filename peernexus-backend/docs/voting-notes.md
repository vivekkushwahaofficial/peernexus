# Voting System Notes

- Votes are stored per answer and per user with a unique constraint on (answer_id, user_id).
- Repeating the same vote toggles it off.
- Submitting the opposite vote switches the existing vote.
- Vote counts are derived from the Vote table.
