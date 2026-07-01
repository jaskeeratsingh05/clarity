const genAI = require('../config/gemini');
const { qdrant, COLLECTION_NAME } = require('../config/qdrant');
const { generateEmbedding } = require('./embedding.service');

const STYLE_PROMPTS = {
  beginner: 'Explain this in very simple terms, as if talking to a 12-year-old. Use analogies and everyday examples.',
  student: 'Explain this clearly for a college student. Be thorough but concise.',
  exam: 'Give a focused, exam-ready answer. Use bullet points and key definitions.',
  interview: 'Explain as if answering in a technical interview. Be precise and structured.',
  technical: 'Give a detailed, technical explanation with all relevant specifics.',
  simple: 'Explain in the simplest possible English. Avoid jargon completely.',
};

const LANGUAGE_INSTRUCTIONS = {
  english: 'Respond in English.',
  hindi: 'Respond in Hindi (Devanagari script). Use simple, clear Hindi.',
};

/**
 * Full RAG pipeline:
 * 1. Embed the question
 * 2. Search Qdrant for top-k relevant chunks
 * 3. Build a context-aware prompt
 * 4. Stream Gemini response
 * 5. Return full answer + citation
 */
const ragQuery = async ({ bookId, question, chatHistory = [], aiMode = 'book', explanationStyle = 'student', language = 'english', onChunk }) => {
  // Step 1: Embed the question
  const queryEmbedding = await generateEmbedding(question);

  // Step 2: Search Qdrant
  const searchResults = await qdrant.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    limit: 5,
    filter: { must: [{ key: 'bookId', match: { value: bookId } }] },
    with_payload: true,
  });

  const topChunks = searchResults.filter((r) => r.score > 0.5);

  // Step 3: Build prompt
  const contextText = topChunks.map((r, i) => `[Source ${i + 1} | Page ${r.payload.page}]\n${r.payload.text}`).join('\n\n---\n\n');

  const topCitation = topChunks[0]
    ? {
        chapter: topChunks[0].payload.chapterGuess || 'Unknown Chapter',
        page: topChunks[0].payload.page,
        paragraph: topChunks[0].payload.paragraphIndex,
        confidence: Math.round(topChunks[0].score * 100),
        sourceText: topChunks[0].payload.text.slice(0, 300),
      }
    : null;

  const styleGuide = STYLE_PROMPTS[explanationStyle] || STYLE_PROMPTS.student;
  const langGuide = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.english;

  const noContextMessage =
    aiMode === 'book'
      ? "I couldn't find this information in your uploaded book. Please rephrase or ask about a topic covered in the book."
      : null;

  const systemPrompt = `You are Clarity, an AI tutor that helps users learn from their uploaded books.

${styleGuide}
${langGuide}

${topChunks.length > 0 ? `Use the following excerpts from the book to answer the question:\n\n${contextText}` : (noContextMessage ? `Note: No relevant content found in the book. ${aiMode === 'hybrid' ? 'Use your general knowledge to help.' : 'Tell the user you could not find this in the book.'}` : '')}

Rules:
- Always ground your answer in the provided book content when available.
- ${aiMode === 'book' ? 'If the answer is not in the book, say so clearly. Do NOT hallucinate.' : 'If the answer is not in the book, supplement with general knowledge and clearly label it as "Additional explanation (not from the book)".'}
- Be helpful, clear, and pedagogical.
- Do not repeat the source text verbatim — explain and teach.`;

  // Step 4: Stream Gemini response
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const formattedHistory = chatHistory.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({
    history: formattedHistory,
    systemInstruction: systemPrompt,
  });

  const streamResult = await chat.sendMessageStream(question);

  let fullAnswer = '';
  for await (const chunk of streamResult.stream) {
    const text = chunk.text();
    fullAnswer += text;
    if (onChunk) onChunk(text);
  }

  return { answer: fullAnswer, citation: topCitation };
};

module.exports = { ragQuery };
