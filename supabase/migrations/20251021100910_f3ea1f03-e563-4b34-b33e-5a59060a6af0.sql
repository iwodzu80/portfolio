-- Grant SELECT permission on public_profiles view to allow anonymous access to shared portfolios
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Also verify that the get_user_from_share function is accessible
GRANT EXECUTE ON FUNCTION public.get_user_from_share(text) TO anon, authenticated;