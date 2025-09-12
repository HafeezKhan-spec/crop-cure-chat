const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const Message = require('../models/Message');
const Upload = require('../models/Upload');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /chat/message
// @desc    Send a chat message
// @access  Private
router.post('/message', [
  authMiddleware,
  body('content.text')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message text must be between 1 and 5000 characters'),
  body('sessionId')
    .optional()
    .isUUID()
    .withMessage('Invalid session ID format'),
  body('messageType')
    .isIn(['user', 'ai', 'system'])
    .withMessage('Invalid message type'),
  body('context.conversationTopic')
    .optional()
    .isIn(['disease_detection', 'farming_advice', 'general', 'troubleshooting'])
    .withMessage('Invalid conversation topic')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      content,
      sessionId,
      messageType = 'user',
      context = {},
      metadata = {}
    } = req.body;

    // Generate session ID if not provided
    const currentSessionId = sessionId || uuidv4();

    // Validate content
    if (!content || (!content.text && (!content.attachments || content.attachments.length === 0))) {
      return res.status(400).json({
        success: false,
        message: 'Message must contain either text or attachments'
      });
    }

    // Process attachments if provided
    let processedAttachments = [];
    if (content.attachments && content.attachments.length > 0) {
      for (const attachment of content.attachments) {
        // Verify upload exists and belongs to user
        const upload = await Upload.findOne({
          _id: attachment.uploadId,
          userId: req.user._id
        });

        if (upload) {
          processedAttachments.push({
            uploadId: upload._id,
            filename: upload.filename,
            originalName: upload.originalName,
            mimeType: upload.mimeType,
            fileSize: upload.fileSize,
            fileUrl: `/uploads/${upload.filename}`
          });
        }
      }
    }

    // Create message
    const message = new Message({
      userId: req.user._id,
      sessionId: currentSessionId,
      messageType,
      content: {
        text: content.text || null,
        attachments: processedAttachments
      },
      context: {
        ...context,
        previousMessageId: context.previousMessageId || null
      },
      metadata: {
        ...metadata,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        language: req.user.languagePref || 'en'
      },
      status: 'sent'
    });

    await message.save();

    // TODO: Replace with FastAPI T5 model integration
    // Generate AI response if this is a user message
    if (messageType === 'user') {
      setTimeout(async () => {
        try {
          // Mock AI response
          const aiResponses = [
            "Based on the image you've shared, I can see signs of potential leaf disease. Let me analyze this further for you.",
            "This appears to be a common agricultural issue. Here are my recommendations for treatment and prevention.",
            "I've analyzed your crop image. The symptoms suggest a fungal infection. Here's what you should do:",
            "Your crops look healthy overall! However, I notice some areas that need attention. Let me guide you through the next steps.",
            "This is an interesting case. Based on my analysis, I recommend consulting with a local agricultural expert for the best treatment approach."
          ];

          const mockResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
          const processingTime = Math.floor(Math.random() * 2000) + 500; // 500-2500ms

          const aiMessage = new Message({
            userId: req.user._id,
            sessionId: currentSessionId,
            messageType: 'ai',
            content: {
              text: mockResponse,
              attachments: []
            },
            aiResponse: {
              model: 'agriclip-v1',
              confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
              processingTime,
              tokens: {
                input: Math.floor(Math.random() * 100) + 50,
                output: Math.floor(Math.random() * 200) + 100
              }
            },
            context: {
              previousMessageId: message._id,
              conversationTopic: context.conversationTopic || 'general'
            },
            metadata: {
              language: req.user.languagePref || 'en'
            },
            status: 'completed'
          });

          await aiMessage.save();

        } catch (error) {
          console.error('AI response generation error:', error);
        }
      }, Math.floor(Math.random() * 2000) + 1000); // 1-3 second delay
    }

    // Populate the message for response
    const populatedMessage = await Message.findById(message._id)
      .populate('content.attachments.uploadId', 'filename originalName analysisResult')
      .populate('userId', 'username profilePic');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: populatedMessage,
        sessionId: currentSessionId
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
});

// @route   GET /chat/history/:sessionId
// @desc    Get chat history for a session
// @access  Private
router.get('/history/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Validate session ID format
    if (!sessionId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID format'
      });
    }

    const messages = await Message.getConversationHistory(
      req.user._id,
      sessionId,
      parseInt(limit)
    );

    res.json({
      success: true,
      message: 'Chat history retrieved successfully',
      data: {
        messages,
        sessionId,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: messages.length
        }
      }
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving chat history'
    });
  }
});

// @route   GET /chat/sessions
// @desc    Get user's chat sessions
// @access  Private
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const sessions = await Message.getUserSessions(req.user._id, parseInt(limit));

    res.json({
      success: true,
      message: 'Chat sessions retrieved successfully',
      data: {
        sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: sessions.length
        }
      }
    });

  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving chat sessions'
    });
  }
});

// @route   PUT /chat/message/:messageId
// @desc    Edit a message
// @access  Private
router.put('/message/:messageId', [
  authMiddleware,
  body('content.text')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message text must be between 1 and 5000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findOne({
      _id: messageId,
      userId: req.user._id,
      messageType: 'user' // Only allow editing user messages
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or cannot be edited'
      });
    }

    // Check if message is too old to edit (e.g., 24 hours)
    const messageAge = Date.now() - message.createdAt.getTime();
    const maxEditAge = 24 * 60 * 60 * 1000; // 24 hours

    if (messageAge > maxEditAge) {
      return res.status(400).json({
        success: false,
        message: 'Message is too old to edit'
      });
    }

    await message.markAsEdited(content.text);

    const updatedMessage = await Message.findById(messageId)
      .populate('content.attachments.uploadId', 'filename originalName analysisResult')
      .populate('userId', 'username profilePic');

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: {
        message: updatedMessage
      }
    });

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while editing message'
    });
  }
});

// @route   DELETE /chat/message/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/message/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      userId: req.user._id
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Soft delete
    message.isDeleted = true;
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting message'
    });
  }
});

// @route   POST /chat/message/:messageId/reaction
// @desc    Add reaction to a message
// @access  Private
router.post('/message/:messageId/reaction', [
  authMiddleware,
  body('reaction')
    .isIn(['helpful', 'not_helpful', 'accurate', 'inaccurate'])
    .withMessage('Invalid reaction type')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { messageId } = req.params;
    const { reaction } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.addReaction(req.user._id, reaction);

    res.json({
      success: true,
      message: 'Reaction added successfully',
      data: {
        reaction,
        messageId
      }
    });

  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding reaction'
    });
  }
});

// @route   DELETE /chat/session/:sessionId
// @desc    Delete entire chat session
// @access  Private
router.delete('/session/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Soft delete all messages in the session
    await Message.updateMany(
      {
        userId: req.user._id,
        sessionId: sessionId
      },
      {
        isDeleted: true
      }
    );

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting chat session'
    });
  }
});

module.exports = router;