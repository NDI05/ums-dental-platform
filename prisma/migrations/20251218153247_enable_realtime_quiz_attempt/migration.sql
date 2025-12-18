-- Enable Realtime for QuizAttempt (Safe for Shadow DB)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "QuizAttempt";
  END IF;
END
$$;