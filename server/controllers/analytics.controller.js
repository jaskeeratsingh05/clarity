const Message = require('../models/Message');
const Book = require('../models/Book');
const Conversation = require('../models/Conversation');

const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [books, conversations, messages] = await Promise.all([
      Book.find({ userId }).select('title questionsAsked totalStudyTime createdAt'),
      Conversation.find({ userId }).select('bookId createdAt'),
      Message.find({ bookId: { $in: (await Book.find({ userId }).select('_id')).map(b => b._id) }, role: 'user' })
        .select('createdAt bookId'),
    ]);

    // Questions per day (last 30 days)
    const last30Days = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      last30Days[d.toISOString().split('T')[0]] = 0;
    }
    messages.forEach((m) => {
      const day = m.createdAt.toISOString().split('T')[0];
      if (last30Days[day] !== undefined) last30Days[day]++;
    });

    res.json({
      success: true,
      analytics: {
        totalBooks: books.length,
        totalConversations: conversations.length,
        totalQuestions: messages.length,
        totalStudyTimeSecs: books.reduce((a, b) => a + b.totalStudyTime, 0),
        questionsPerDay: Object.entries(last30Days).map(([date, count]) => ({ date, count })),
        topBooks: books.sort((a, b) => b.questionsAsked - a.questionsAsked).slice(0, 5).map(b => ({ title: b.title, questions: b.questionsAsked })),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalytics };
