
-- This is just for reference. We'll execute this SQL separately.
CREATE OR REPLACE FUNCTION record_portfolio_view(
  p_share_id TEXT,
  p_referrer TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO portfolio_analytics (share_id, referrer, user_agent)
  VALUES (p_share_id, p_referrer, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to anonymous users
GRANT EXECUTE ON FUNCTION record_portfolio_view(TEXT, TEXT, TEXT) TO anon;
