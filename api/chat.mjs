// Função da Vercel que repassa as perguntas do chatbot ao webhook do Make.
// Assim a URL do webhook fica só na variável de ambiente MAKE_WEBHOOK_URL.

const MAX_QUESTION_LENGTH = 500;
const MAX_HISTORY_LENGTH = 8000;
const MAKE_TIMEOUT_MS = 40000;

const textResponse = (body, status) => new Response(body, {
  status,
  headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
});

// O navegador sempre envia Origin em um POST. Isso barra outros sites usando esta função,
// mas não impede scripts fora do navegador, que podem forjar o cabeçalho.
const isSameOrigin = (request) => {
  try {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return new URL(request.headers.get("origin")).host === host;
  } catch {
    return false;
  }
};

export async function POST(request) {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("MAKE_WEBHOOK_URL não está configurada.");
    return textResponse("Chat não configurado", 503);
  }
  if (!isSameOrigin(request)) return textResponse("Origem não permitida", 403);

  const fields = new URLSearchParams(await request.text());
  const question = (fields.get("pergunta") ?? "").trim();
  if (!question || question.length > MAX_QUESTION_LENGTH) return textResponse("Pergunta inválida", 400);
  const history = (fields.get("historico") ?? "").slice(-MAX_HISTORY_LENGTH);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      body: new URLSearchParams({ pergunta: question, historico: history }),
      signal: AbortSignal.timeout(MAKE_TIMEOUT_MS)
    });
    if (!response.ok) throw new Error(`Make respondeu ${response.status}`);
    const answer = (await response.text()).trim();
    // "Accepted" é a resposta padrão do Make quando o cenário não usa o módulo Webhook response.
    if (!answer || answer === "Accepted") throw new Error("Make não devolveu uma resposta");
    return textResponse(answer, 200);
  } catch (error) {
    console.error("Falha ao consultar o Make:", error.message);
    return textResponse("Assistente indisponível", 502);
  }
}
