// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tmgofvlwnbsikvyaavgr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZ29mdmx3bmJzaWt2eWFhdmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MzM2MDksImV4cCI6MjA2MjMwOTYwOX0.Yd-4ej2JEjrqroJzwqUCStoJ-EWZiXWBbz_mC0z7XFc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);