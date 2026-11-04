-- REVIEW ONLY. This query does not delete any data.
-- Run after migration 002. Confirm exceptions/legal holds before deletion.
SELECT id, email, last_interaction_at,
       last_interaction_at + INTERVAL '12 months' AS retention_due_at
FROM public.worship_interest
WHERE last_interaction_at < NOW() - INTERVAL '12 months'
ORDER BY last_interaction_at ASC;
-- Deletion is deliberately NOT automated until an authorised workflow,
-- verified exceptions/legal holds and an audit process are implemented.
