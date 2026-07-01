const genAI = require('../config/gemini');

/**
 * Generate a vector embedding for a given text using Gemini text-embedding-004.
 * Returns a 768-dimensional float array.
 */
const generateEmbedding = async (text) => {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values;
};

module.exports = { generateEmbedding };
