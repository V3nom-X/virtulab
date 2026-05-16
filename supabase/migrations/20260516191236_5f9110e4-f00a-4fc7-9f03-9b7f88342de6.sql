
CREATE TABLE public.experiment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 150),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 10 AND 2000),
  category TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.experiment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own requests"
  ON public.experiment_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own requests"
  ON public.experiment_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all requests"
  ON public.experiment_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update requests"
  ON public.experiment_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users delete own requests"
  ON public.experiment_requests FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins delete requests"
  ON public.experiment_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_experiment_requests_updated_at
  BEFORE UPDATE ON public.experiment_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_experiment_requests_user ON public.experiment_requests(user_id);
CREATE INDEX idx_experiment_requests_status ON public.experiment_requests(status);
