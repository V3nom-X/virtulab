-- Server-side validation for experiment_requests: enforce status enum + length constraints
CREATE OR REPLACE FUNCTION public.validate_experiment_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS NULL OR NEW.status NOT IN ('pending','approved','rejected') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  IF length(trim(NEW.title)) < 3 OR length(NEW.title) > 150 THEN
    RAISE EXCEPTION 'Title must be 3-150 characters';
  END IF;
  IF length(trim(NEW.description)) < 10 OR length(NEW.description) > 2000 THEN
    RAISE EXCEPTION 'Description must be 10-2000 characters';
  END IF;
  IF NEW.category IS NOT NULL AND length(NEW.category) > 50 THEN
    RAISE EXCEPTION 'Category must be 50 characters or fewer';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_experiment_request ON public.experiment_requests;
CREATE TRIGGER trg_validate_experiment_request
BEFORE INSERT OR UPDATE ON public.experiment_requests
FOR EACH ROW
EXECUTE FUNCTION public.validate_experiment_request();
