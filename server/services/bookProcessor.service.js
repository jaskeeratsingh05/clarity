const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Book = require('../models/Book');
const { generateEmbedding } = require('./embedding.service');
const { qdrant, COLLECTION_NAME } = require('../config/qdrant');
const { v4: uuidv4 } = require('uuid');

/**
 * Main book processing pipeline.
 * Emits real-time Socket.io events for UI progress tracking.
 *
 * Stages:
 * 1. Extract text from PDF or DOCX
 * 2. Chunk text semantically (by paragraph/section)
 * 3. Generate embeddings for each chunk
 * 4. Upsert vectors into Qdrant
 */
const processBook = async (book, fileBuffer, io, userId) => {
  const emit = (stage, progress, message) => {
    if (io) {
      // Emit only to the specific user's room — not all connected clients
      const room = userId ? `user:${userId}` : null;
      if (room) {
        io.to(room).emit(`book:progress:${book._id}`, { stage, progress, message });
      }
    }
  };

  try {
    // ── Stage 1: Extract Text ──────────────────────────────────────
    emit('extracting', 10, 'Extracting text from document...');
    await Book.findByIdAndUpdate(book._id, { status: 'extracting', processingProgress: 10 });

    let rawText = '';
    let pageCount = 0;

    if (book.fileType === 'pdf') {
      const data = await pdfParse(fileBuffer);
      rawText = data.text;
      pageCount = data.numpages;
    } else {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      rawText = result.value;
      pageCount = Math.ceil(rawText.length / 2500); // estimate for docx
    }

    emit('extracting', 30, 'Text extracted successfully');
    await Book.findByIdAndUpdate(book._id, { pageCount, processingProgress: 30 });

    // ── Stage 2: Chunk Text ────────────────────────────────────────
    emit('chunking', 40, 'Understanding chapters and splitting into sections...');
    await Book.findByIdAndUpdate(book._id, { status: 'chunking', processingProgress: 40 });

    const chunks = chunkText(rawText, book._id.toString(), pageCount);

    emit('chunking', 60, `Created ${chunks.length} semantic chunks`);
    await Book.findByIdAndUpdate(book._id, { processingProgress: 60 });

    // ── Stage 3 & 4: Embed + Upsert into Qdrant ───────────────────
    emit('embedding', 65, 'Building AI search index...');
    await Book.findByIdAndUpdate(book._id, { status: 'embedding', processingProgress: 65 });

    const BATCH_SIZE = 10;
    const points = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const embeddings = await Promise.all(batch.map((c) => generateEmbedding(c.text)));

      batch.forEach((chunk, idx) => {
        points.push({
          id: uuidv4(),
          vector: embeddings[idx],
          payload: { ...chunk, bookId: book._id.toString() },
        });
      });

      const progress = 65 + Math.round(((i + BATCH_SIZE) / chunks.length) * 30);
      emit('embedding', Math.min(progress, 95), `Indexed ${Math.min(i + BATCH_SIZE, chunks.length)} / ${chunks.length} chunks`);
    }

    // Upsert all points to Qdrant
    await qdrant.upsert(COLLECTION_NAME, { wait: true, points });

    // ── Done ───────────────────────────────────────────────────────
    await Book.findByIdAndUpdate(book._id, {
      status: 'ready',
      processingProgress: 100,
      totalChunks: chunks.length,
    });

    emit('ready', 100, 'Book is ready! Start asking questions.');
    console.log(`✅ Book "${book.title}" processed: ${chunks.length} chunks, ${pageCount} pages`);
  } catch (err) {
    await Book.findByIdAndUpdate(book._id, { status: 'error', processingError: err.message });
    emit('error', 0, `Processing failed: ${err.message}`);
    throw err;
  }
};

/**
 * Split raw text into semantic chunks with metadata.
 * Each chunk is ~300-500 words, split on paragraph boundaries.
 */
const chunkText = (text, bookId, totalPages) => {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter((p) => p.length > 50); // filter out empty/tiny paragraphs

  const chunks = [];
  const CHUNK_SIZE = 400; // words per chunk
  const OVERLAP = 50; // word overlap between chunks

  let currentChunk = [];
  let currentWordCount = 0;
  let paragraphIndex = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/);
    currentChunk.push(paragraph);
    currentWordCount += words.length;

    if (currentWordCount >= CHUNK_SIZE) {
      const chunkText = currentChunk.join(' ');
      const estimatedPage = Math.max(1, Math.round((paragraphIndex / paragraphs.length) * totalPages));

      chunks.push({
        text: chunkText,
        wordCount: currentWordCount,
        page: estimatedPage,
        paragraphIndex,
        chapterGuess: detectChapter(chunkText),
      });

      // Keep overlap
      const overlapWords = currentChunk.join(' ').split(/\s+/).slice(-OVERLAP).join(' ');
      currentChunk = [overlapWords];
      currentWordCount = OVERLAP;
    }

    paragraphIndex++;
  }

  // Add remaining text as last chunk
  if (currentChunk.length > 0 && currentWordCount > 20) {
    chunks.push({
      text: currentChunk.join(' '),
      wordCount: currentWordCount,
      page: totalPages,
      paragraphIndex,
      chapterGuess: detectChapter(currentChunk.join(' ')),
    });
  }

  return chunks;
};

/**
 * Naive chapter detection based on common heading patterns.
 */
const detectChapter = (text) => {
  const match = text.match(/chapter\s+(\d+|[ivxlcdm]+)[:\s—-]*/i);
  return match ? match[0].trim() : null;
};

module.exports = { processBook };
