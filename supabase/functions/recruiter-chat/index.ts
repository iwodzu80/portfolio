import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();
    
    // Create Supabase client with the auth token from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user has recruiter role
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasRecruiterRole = roles?.some(r => r.role === 'recruiter');
    if (!hasRecruiterRole) {
      throw new Error('Recruiter role required');
    }

    // Fetch all public portfolios with their projects
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        user_id,
        name,
        email,
        role,
        tagline,
        description,
        phone,
        show_email,
        show_phone
      `)
      .eq('is_public', true);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw new Error('Failed to fetch profiles');
    }

    // Fetch all sections for these users
    const userIds = profiles?.map(p => p.user_id) || [];
    const { data: sections } = await supabase
      .from('sections')
      .select('*')
      .in('user_id', userIds);

    // Fetch all projects for these users
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .in('user_id', userIds);

    // Fetch features for projects
    const projectIds = projects?.map(p => p.id) || [];
    const { data: features } = await supabase
      .from('project_features')
      .select('*')
      .in('project_id', projectIds);

    // Fetch links for projects
    const { data: links } = await supabase
      .from('project_links')
      .select('*')
      .in('project_id', projectIds);

    // Build portfolio data structure
    const portfolios = profiles?.map(profile => {
      const userSections = sections?.filter(s => s.user_id === profile.user_id) || [];
      const userProjects = projects?.filter(p => p.user_id === profile.user_id) || [];
      
      const enrichedProjects = userProjects.map(project => ({
        ...project,
        features: features?.filter(f => f.project_id === project.id).map(f => f.title) || [],
        links: links?.filter(l => l.project_id === project.id).map(l => ({ title: l.title, url: l.url })) || [],
        section: userSections.find(s => s.id === project.section_id)?.title || 'Other'
      }));

      return {
        name: profile.name,
        role: profile.role,
        tagline: profile.tagline,
        description: profile.description,
        email: profile.show_email ? profile.email : null,
        phone: profile.show_phone ? profile.phone : null,
        sections: userSections.map(s => s.title),
        projects: enrichedProjects
      };
    }) || [];

    console.log(`Analyzing ${portfolios.length} portfolios for job matching`);

    // Call Lovable AI for intelligent matching
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert recruiter AI assistant specializing in matching job requirements with candidate portfolios.

Your task is to analyze candidate portfolios and provide intelligent matching based on the recruiter's requirements.

Available portfolios data:
${JSON.stringify(portfolios, null, 2)}

When a recruiter provides job requirements:
1. Analyze each portfolio against the requirements
2. Consider: skills, experience, project complexity, domain expertise, role fit
3. Provide a match score (0-100%) for top candidates
4. Explain WHY each candidate is a good match (specific projects, skills, experience)
5. Highlight standout projects or achievements relevant to the role
6. Be objective and specific

Format your responses clearly with:
- Match scores
- Key qualifications
- Relevant projects
- Reasoning

Be conversational but professional. If asked follow-up questions, provide detailed insights about specific candidates.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits depleted. Please add credits to your workspace.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error('AI Gateway request failed');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      portfolioCount: portfolios.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in recruiter-chat:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});