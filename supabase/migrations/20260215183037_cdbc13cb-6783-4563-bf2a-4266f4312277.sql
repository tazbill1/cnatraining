
-- Create invitations table
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT invitations_email_unique UNIQUE (email)
);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Managers can view all invitations
CREATE POLICY "Managers can view all invitations"
ON public.invitations
FOR SELECT
USING (public.has_role(auth.uid(), 'manager'));

-- Managers can insert invitations
CREATE POLICY "Managers can insert invitations"
ON public.invitations
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'manager'));

-- Managers can update invitations
CREATE POLICY "Managers can update invitations"
ON public.invitations
FOR UPDATE
USING (public.has_role(auth.uid(), 'manager'));

-- Managers can delete invitations
CREATE POLICY "Managers can delete invitations"
ON public.invitations
FOR DELETE
USING (public.has_role(auth.uid(), 'manager'));
