// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve((req: any) => {
  const method = req.method;

  if (method === 'GET') {
    return new Response(
      JSON.stringify({ message: 'Hello from Supabase Edge Function!' }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers':
            'authorization, x-client-info, apikey, content-type',
        },
        status: 200,
      },
    );
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers':
        'authorization, x-client-info, apikey, content-type',
    },
    status: 405,
  });
});
