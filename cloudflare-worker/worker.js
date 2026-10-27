const MODEL = 'gemini-3.1-flash-lite';

export default {
  async fetch(request, env) {
    const allowedOrigin =
      'https://niedzialkowskamagdalena02-ctrl.github.io';
    const origin = request.headers.get('Origin');
    const cors = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };

    const reply = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: origin === allowedOrigin ? 204 : 403,
        headers: cors
      });
    }

    if (request.method !== 'POST')
      return reply({ error: 'Method not allowed' }, 405);

    if (origin !== allowedOrigin)
      return reply({ error: 'Forbidden' }, 403);

    if (!env.GEMINI_API_KEY)
      return reply({ error: 'Brak konfiguracji AI' }, 503);

    const path = new URL(request.url).pathname;
    if (!['/mentor-ai', '/ocr-ai'].includes(path))
      return reply({ error: 'Not found' }, 404);

    const length = Number(request.headers.get('content-length') || 0);
    if (length > 5000000)
      return reply({ error: 'Za duże żądanie' }, 413);

    let body;
    try {
      body = await request.json();
    } catch {
      return reply({ error: 'Nieprawidłowy JSON' }, 400);
    }

    let contents;

    if (path === '/mentor-ai') {
      const question = String(body.question || '').slice(0, 700);
      const mentor = body.mentor === 'spiderman'
        ? 'Spider-Man' : 'Iron Man';
      if (!question.trim())
        return reply({ error: 'Brak pytania' }, 400);

      contents = [{
        role: 'user',
        parts: [{
          text:
            'Jesteś przyjaznym mentorem edukacyjnym dla dziecka. ' +
            'Twój styl to ' + mentor + '. ' +
            'Pomagaj zrozumieć zadanie krok po kroku, ' +
            'zachęcaj do samodzielnego myślenia. ' +
            'Odpowiadaj po polsku, prosto, bezpiecznie i krótko. ' +
            'Pytanie: ' + question
        }]
      }];
    } else {
      const image = String(body.image || '');
      const mimeType = String(body.mimeType || 'image/jpeg');
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType))
        return reply({ error: 'Nieobsługiwany format zdjęcia' }, 400);
      if (!image || image.length > 4500000)
        return reply({ error: 'Nieprawidłowy rozmiar zdjęcia' }, 400);

      contents = [{
        role: 'user',
        parts: [
          { text: 'Przepisz dokładnie tekst ze zdjęcia. Zwróć wyłącznie odczytany tekst.' },
          { inline_data: { mime_type: mimeType, data: image } }
        ]
      }];
    }

    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' +
          MODEL + ':generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents,
            generationConfig: { maxOutputTokens: 900 }
          })
        }
      );

      const data = await response.json();
      if (!response.ok)
        return reply({ error: 'Usługa AI jest chwilowo niedostępna' }, 502);

      const result = (data.candidates?.[0]?.content?.parts || [])
        .map(part => part.text || '').join('').trim();

      return path === '/mentor-ai'
        ? reply({ answer: result })
        : reply({ text: result });
    } catch {
      return reply({ error: 'Błąd połączenia z AI' }, 502);
    }
  }
};
