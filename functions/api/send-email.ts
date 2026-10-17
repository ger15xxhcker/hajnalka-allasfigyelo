// Cloudflare Pages Function: /api/send-email
// Sends personalized job digest email via Resend API (Free tier: 3000 emails/month)

interface Env {
  RESEND_API_KEY?: string;
  APP_URL?: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  try {
    const body = await request.json() as {
      recipientEmail?: string;
      candidateName?: string;
      jobs?: Array<{
        title: string;
        company: string;
        location: string;
        distanceKm: number;
        matchScore: number;
        url: string;
        matchReasons: string[];
      }>;
      portalUrl?: string;
    };

    const recipient = body.recipientEmail || 'purczeld.hajnalka@gmail.com';
    const candidateName = body.candidateName || 'Hajnalka';
    const jobs = body.jobs || [];
    const portalUrl = body.portalUrl || env.APP_URL || 'https://hajnalka-allasfigyelo.pages.dev';

    const apiKey = env.RESEND_API_KEY || '';

    // Build modern HTML email
    const jobItemsHtml = jobs.slice(0, 5).map(j => `
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <span style="background: #dbeafe; color: #1e40af; font-weight: 700; font-size: 13px; padding: 4px 10px; border-radius: 20px; display: inline-block; margin-bottom: 6px;">
              🎯 ${j.matchScore}% Egyezés
            </span>
            <h3 style="margin: 0 0 4px 0; color: #0f172a; font-size: 18px; font-weight: 700;">${j.title}</h3>
            <p style="margin: 0; color: #475569; font-size: 14px; font-weight: 600;">🏢 ${j.company} &nbsp;•&nbsp; 📍 ${j.location} (${j.distanceKm} km Hatvantól)</p>
          </div>
        </div>
        <div style="background: #f8fafc; border-left: 3px solid #3b82f6; padding: 10px 14px; border-radius: 4px; margin: 12px 0;">
          <p style="margin: 0; color: #334155; font-size: 13px; line-height: 1.5;">
            <strong>Miért illik hozzád?</strong> ${j.matchReasons && j.matchReasons[0] ? j.matchReasons[0] : 'Kiemelkedő egyezés az önéletrajzoddal.'}
          </p>
        </div>
        <div style="margin-top: 14px;">
          <a href="${portalUrl}#job-${j.title.replace(/\s+/g, '-')}" style="background: #2563eb; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 8px 16px; border-radius: 6px; display: inline-block;">
            Állás megtekintése & Értékelés ➜
          </a>
        </div>
      </div>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
            <div style="font-size: 36px; margin-bottom: 8px;">🎯</div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Szia ${candidateName}!</h1>
            <p style="margin: 8px 0 0 0; font-size: 15px; opacity: 0.95;">Új, neked kifejezetten releváns állásajánlatokat találtunk Hatvan környékén!</p>
          </div>

          <div style="padding: 24px; background: #f8fafc;">
            <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-top: 0;">
              Az automatikus kereső átvizsgálta a magyar állásportálokat az EPTK és projektpénzügyi referens önéletrajzod alapján. Íme a legfrissebb kiemelt találatok:
            </p>

            ${jobItemsHtml}

            <div style="text-align: center; margin: 28px 0 16px 0;">
              <a href="${portalUrl}" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; padding: 14px 28px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 10px rgba(37,99,235,0.3);">
                Összes ajánlat megnyitása a felületen 🚀
              </a>
            </div>

            <div style="background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 10px; padding: 14px 18px; margin-top: 24px;">
              <p style="margin: 0; color: #0369a1; font-size: 13px; line-height: 1.5;">
                💡 <strong>Tipp az okos tanuláshoz:</strong> A felületen minden állásnál rákattinthatsz az <em>"Elvileg jó lehet"</em> vagy <em>"Elutasítás"</em> gombra. Ha elutasítasz egyet, pár szóban írd meg, miért nem jó (pl. túl messze van, kevés a bér, túl sok angol), és az algoritmus azonnal megtanulja az elvárásaidat!
              </p>
            </div>
          </div>

          <div style="background: #f1f5f9; padding: 16px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
            Purczeld Hajnalka Személyes Álláskereső Rendszer • Hatvan 100km körzet • Cloudflare
          </div>
        </div>
      </body>
      </html>
    `;

    // If Resend API key is provided, send real email!
    if (apiKey) {
      const emailResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Állásfigyelő Asszisztens <onboarding@resend.dev>',
          to: [recipient],
          subject: `🎯 ${candidateName}, találtunk ${jobs.length} új neked való állást!`,
          html: htmlContent
        })
      });

      const emailResult = await emailResp.json();
      return new Response(JSON.stringify({ success: true, mode: 'sent_resend', result: emailResult }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If no API key configured yet, return preview / simulated delivery
    return new Response(JSON.stringify({
      success: true,
      mode: 'preview',
      recipient,
      subject: `🎯 ${candidateName}, találtunk ${jobs.length} új neked való állást!`,
      message: 'Email sablon sikeresen összeállítva! (Valós küldéshez a Beállításokban vagy Cloudflare-ben add meg a Resend API kulcsodat).'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
