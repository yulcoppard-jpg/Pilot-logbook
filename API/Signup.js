// api/signup.js
// Serverless function for Vercel / Netlify (Node.js).
// Requires environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.end('Method Not Allowed');
  }

  try {
    const body = req.body || {};
    const payload = typeof body === 'string' ? JSON.parse(body) : body;
    const email = (payload.email || '').trim();
    if (!email) return res.status(400).json({ error: 'Email required' });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase env keys');
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error } = await supabase.from('waitlist').insert([{ email }]);
    if (error) {
      const msg = String(error.message || error);
      console.error('Supabase insert error', msg);
      if (msg.toLowerCase().includes('duplicate') || msg.includes('unique')) {
        return res.status(200).json({ ok: true, message: 'Already on list' });
      }
      return res.status(500).json({ error: 'Failed to add to waitlist' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Unexpected error in signup', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
};
