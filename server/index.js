import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: systemPrompt || 'You are a helpful AI assistant.',
      messages: messages,
    });

    res.json({
      content: response.content[0].text,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({
      error: 'Failed to get response from Claude',
      message: error.message
    });
  }
});

app.post('/api/chat/stream', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: systemPrompt || 'You are a helpful AI assistant.',
      messages: messages,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error streaming from Claude API:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
