// Public activation state only. NEVER return Resend or Turnstile secret values.
export function onRequestGet({env}) {
  const configured = Boolean(env.RESEND_API_KEY && env.ORDER_FROM && env.ORDER_TO
    && env.TURNSTILE_SECRET_KEY && env.TURNSTILE_SITE_KEY);
  const result = {
    enabled: configured && env.ORDERS_ENABLED === 'true',
    photoEnabled: configured && env.PHOTO_ORDERS_ENABLED === 'true',
    sitekey: configured ? env.TURNSTILE_SITE_KEY : ''
  };
  return new Response(JSON.stringify(result), {
    headers: {'content-type':'application/json; charset=utf-8', 'cache-control':'no-store, max-age=0',
      'x-content-type-options':'nosniff'}
  });
}
