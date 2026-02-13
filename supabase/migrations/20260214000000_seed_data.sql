-- Ensure pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Roles enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin');
    END IF;
END$$;

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active DATE,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Replace policy: Users can view all profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can view all profiles'
  ) THEN
    DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
  END IF;
  CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
END
$$ LANGUAGE plpgsql;

-- Replace policy: Users can update own profile
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  END IF;
  CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((SELECT auth.uid()) = user_id);
END
$$ LANGUAGE plpgsql;

-- Replace policy: Users can insert own profile
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  END IF;
  CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
END
$$ LANGUAGE plpgsql;


-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM public, anon, authenticated;
-- Optionally grant to specific roles if needed:
-- GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;

-- Replace policy: Users can view own roles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Users can view own roles'
  ) THEN
    DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
  END IF;
  CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING ((SELECT auth.uid()) = user_id);
END
$$ LANGUAGE plpgsql;

-- Replace policy: Admins can manage roles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Admins can manage roles'
  ) THEN
    DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
  END IF;
  CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role((SELECT auth.uid())::uuid, 'admin'::app_role) OR public.has_role((SELECT auth.uid())::uuid, 'super_admin'::app_role));
END
$$ LANGUAGE plpgsql;


-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Personal Finance',
  icon TEXT DEFAULT '📚',
  color TEXT DEFAULT '#FF9F43',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'courses' AND policyname = 'Anyone can view published courses'
  ) THEN
    DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
  END IF;
  CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT USING (is_published = true OR public.has_role((SELECT auth.uid())::uuid, 'admin'::app_role) OR public.has_role((SELECT auth.uid())::uuid, 'super_admin'::app_role));
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'courses' AND policyname = 'Admins can manage courses'
  ) THEN
    DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
  END IF;
  CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (public.has_role((SELECT auth.uid())::uuid, 'admin'::app_role) OR public.has_role((SELECT auth.uid())::uuid, 'super_admin'::app_role));
END
$$ LANGUAGE plpgsql;


-- Units
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'units' AND policyname = 'Anyone can view units'
  ) THEN
    DROP POLICY IF EXISTS "Anyone can view units" ON public.units;
  END IF;
  CREATE POLICY "Anyone can view units" ON public.units FOR SELECT USING (true);
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'units' AND policyname = 'Admins can manage units'
  ) THEN
    DROP POLICY IF EXISTS "Admins can manage units" ON public.units;
  END IF;
  CREATE POLICY "Admins can manage units" ON public.units FOR ALL USING (public.has_role((SELECT auth.uid())::uuid, 'admin'::app_role) OR public.has_role((SELECT auth.uid())::uuid, 'super_admin'::app_role));
END
$$ LANGUAGE plpgsql;


-- Lessons
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'video_quiz',
  video_url TEXT,
  transcript_en TEXT,
  transcript_hi TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'lessons' AND policyname = 'Anyone can view lessons'
  ) THEN
    DROP POLICY IF EXISTS "Anyone can view lessons" ON public.lessons;
  END IF;
  CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'lessons' AND policyname = 'Admins can manage lessons'
  ) THEN
    DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
  END IF;
  CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL USING (public.has_role((SELECT auth.uid())::uuid, 'admin'::app_role) OR public.has_role((SELECT auth.uid())::uuid, 'super_admin'::app_role));
END
$$ LANGUAGE plpgsql;


-- Quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL UNIQUE,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'quizzes' AND policyname = 'Anyone can view quizzes'
  ) THEN
    DROP POLICY IF EXISTS "Anyone can view quizzes" ON public.quizzes;
  END IF;
  CREATE POLICY "Anyone can view quizzes" ON public.quizzes FOR SELECT USING (true);
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'quizzes' AND policyname = 'Admins can manage quizzes'
  ) THEN
    DROP POLICY IF EXISTS "Admins can manage quizzes" ON public.quizzes;
  END IF;
  CREATE POLICY "Admins can manage quizzes" ON public.quizzes FOR ALL USING (public.has_role((SELECT auth.uid())::uuid, 'admin'::app_role) OR public.has_role((SELECT auth.uid())::uuid, 'super_admin'::app_role));
END
$$ LANGUAGE plpgsql;


-- User lesson progress
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  score INTEGER,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_progress' AND policyname = 'Users can view own progress'
  ) THEN
    DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
  END IF;
  CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING ((SELECT auth.uid()) = user_id);
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_progress' AND policyname = 'Users can insert own progress'
  ) THEN
    DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
  END IF;
  CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_progress' AND policyname = 'Users can update own progress'
  ) THEN
    DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
  END IF;
  CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING ((SELECT auth.uid()) = user_id);
END
$$ LANGUAGE plpgsql;


-- Rewards
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  xp_cost INTEGER NOT NULL,
  voucher_codes TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  icon TEXT DEFAULT '🎁',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'rewards' AND policyname = 'Anyone can view active rewards'
  ) THEN
    DROP POLICY IF EXISTS "Anyone can view active rewards" ON public.rewards;
  END IF;
  CREATE POLICY "Anyone can view active rewards" ON public.rewards FOR SELECT USING (is_active = true OR public.has_role((SELECT auth.uid())::uuid, 'admin'::app_role) OR public.has_role((SELECT auth.uid())::uuid, 'super_admin'::app_role));
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'rewards' AND policyname = 'Admins can manage rewards'
  ) THEN
    DROP POLICY IF EXISTS "Admins can manage rewards" ON public.rewards;
  END IF;
  CREATE POLICY "Admins can manage rewards" ON public.rewards FOR ALL USING (public.has_role((SELECT auth.uid())::uuid, 'admin'::app_role) OR public.has_role((SELECT auth.uid())::uuid, 'super_admin'::app_role));
END
$$ LANGUAGE plpgsql;


-- Reward redemptions
CREATE TABLE IF NOT EXISTS public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES public.rewards(id) ON DELETE CASCADE NOT NULL,
  voucher_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'redemptions' AND policyname = 'Users can view own redemptions'
  ) THEN
    DROP POLICY IF EXISTS "Users can view own redemptions" ON public.redemptions;
  END IF;
  CREATE POLICY "Users can view own redemptions" ON public.redemptions FOR SELECT USING ((SELECT auth.uid()) = user_id);
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'redemptions' AND policyname = 'Users can create redemptions'
  ) THEN
    DROP POLICY IF EXISTS "Users can create redemptions" ON public.redemptions;
  END IF;
  CREATE POLICY "Users can create redemptions" ON public.redemptions FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'redemptions' AND policyname = 'Admins can view all redemptions'
  ) THEN
    DROP POLICY IF EXISTS "Admins can view all redemptions" ON public.redemptions;
  END IF;
  CREATE POLICY "Admins can view all redemptions" ON public.redemptions FOR SELECT USING (public.has_role((SELECT auth.uid())::uuid, 'admin'::app_role) OR public.has_role((SELECT auth.uid())::uuid, 'super_admin'::app_role));
END
$$ LANGUAGE plpgsql;


-- Articles
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'articles' AND policyname = 'Anyone can view published articles'
  ) THEN
    DROP POLICY IF EXISTS "Anyone can view published articles" ON public.articles;
  END IF;
  CREATE POLICY "Anyone can view published articles" ON public.articles FOR SELECT USING (is_published = true OR public.has_role((SELECT auth.uid())::uuid, 'admin'::app_role) OR public.has_role((SELECT auth.uid())::uuid, 'super_admin'::app_role));
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'articles' AND policyname = 'Admins can manage articles'
  ) THEN
    DROP POLICY IF EXISTS "Admins can manage articles" ON public.articles;
  END IF;
  CREATE POLICY "Admins can manage articles" ON public.articles FOR ALL USING (public.has_role((SELECT auth.uid())::uuid, 'admin'::app_role) OR public.has_role((SELECT auth.uid())::uuid, 'super_admin'::app_role));
END
$$ LANGUAGE plpgsql;


-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();