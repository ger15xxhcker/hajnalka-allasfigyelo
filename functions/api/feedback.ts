// Cloudflare Pages Function: /api/feedback
// Processes sister's rejection or interested mark and updates database

interface Env {
  DB?: any;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  try {
    const body = await request.json() as {
      jobId: string;
      status: 'interested' | 'rejected';
      reasonText?: string;
      category?: string;
      notes?: string;
    };

    const { jobId, status, reasonText, category, notes } = body;

    if (!jobId || !status) {
      return new Response(JSON.stringify({ error: 'Missing jobId or status' }), { status: 400 });
    }

    if (env.DB) {
      await env.DB.prepare(`
        UPDATE jobs 
        SET status = ?, rejection_reason = ?, rejection_category = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(status, reasonText || null, category || null, notes || null, jobId).run();

      // If rejected with reason, create learned rule
      if (status === 'rejected' && reasonText) {
        const ruleId = `rule-${Date.now()}`;
        await env.DB.prepare(`
          INSERT INTO learned_rules (id, rule_type, pattern, adjustment_points, explanation, origin_feedback, is_active)
          VALUES (?, ?, ?, ?, ?, ?, 1)
        `).bind(
          ruleId,
          category || 'custom',
          reasonText.slice(0, 50),
          -30,
          `Hajnalka elutasítása alapján: "${reasonText}"`,
          reasonText
        ).run();
      }
    }

    return new Response(JSON.stringify({ success: true, jobId, status }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
