# BotNagar

An AI-powered chat application built with React and Claude Sonnet 4.5. Features a distinctive neon terminal brutalist interface with a single-page 2-pane layout for seamless interaction.

## Features

- **Neon Terminal Interface**: Bold cyberpunk aesthetic with glitch effects and neon glow
- **Single-Page 2-Pane Layout**: Chat stays on the left, artifacts render on the right
- **Real-time Streaming**: Streaming responses from Claude API for instant feedback
- **Content Rendering**: Automatic detection and rendering of HTML and Markdown
- **Responsive Design**: Works beautifully on desktop and mobile devices
- **Syntax Highlighting**: Code blocks with language detection
- **Rich Markdown Support**: Tables, blockquotes, lists, and more

## Tech Stack

### Frontend
- React 18
- React Router for navigation
- React Markdown for markdown rendering
- Vite for fast development and building

### Backend
- Node.js with Express
- Anthropic SDK for Claude API integration
- Server-Sent Events for streaming responses

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Anthropic API key

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_actual_api_key_here
PORT=3001
```

To get an API key:
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key

### 3. Run the Application

Start both the frontend and backend servers:

```bash
npm run dev
```

This will start:
- Frontend dev server on http://localhost:3000
- Backend API server on http://localhost:3001

### 4. Open Your Browser

Navigate to http://localhost:3000 to use the application.

## Usage

### Home Page
1. Start at the home page with a centralized prompt input
2. Type your question or click on suggested prompts
3. Press Enter or click the arrow button to start chatting

### Chat View
1. Messages appear in a conversation format
2. When Claude generates HTML or Markdown content, a preview pane automatically appears
3. Toggle the preview pane on/off using the "Hide Preview" / "Show Preview" button
4. The preview pane shows:
   - HTML pages rendered in an iframe
   - Markdown content with rich formatting

### Content Types Supported
- **HTML**: Full web pages with CSS and basic JavaScript
- **Markdown**: Headers, lists, tables, code blocks, blockquotes, links, and images
- **Code Blocks**: Syntax highlighting for various languages

## Project Structure

```
xbotnagar/
├── server/
│   └── index.js           # Express server with Claude API integration
├── src/
│   ├── components/
│   │   ├── HomePage.jsx   # Landing page with prompt input
│   │   ├── HomePage.css
│   │   ├── ChatView.jsx   # 2-pane chat interface
│   │   ├── ChatView.css
│   │   ├── MessageRenderer.jsx  # Markdown/HTML renderer
│   │   └── MessageRenderer.css
│   ├── App.jsx            # Main app component with routing
│   ├── App.css
│   ├── main.jsx           # React entry point
│   └── index.css          # Global styles
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── package.json
└── README.md
```

## Development

### Available Scripts

- `npm run dev` - Run both frontend and backend in development mode
- `npm run dev:client` - Run only the frontend dev server
- `npm run dev:server` - Run only the backend server
- `npm run build` - Build the frontend for production
- `npm run preview` - Preview the production build

### API Endpoints

#### POST /api/chat
Non-streaming chat endpoint
- Request: `{ messages: Array, systemPrompt: string }`
- Response: `{ content: string, usage: object }`

#### POST /api/chat/stream
Streaming chat endpoint with Server-Sent Events
- Request: `{ messages: Array, systemPrompt: string }`
- Response: Stream of text deltas

## Customization

### Styling
- Modify `src/components/*.css` files to customize the appearance
- Main color scheme uses purple/blue gradients (#667eea, #764ba2)
- All components use responsive design principles

### System Prompt
Edit the `systemPrompt` in `src/components/ChatView.jsx` to customize Claude's behavior:

```javascript
systemPrompt: 'Your custom system prompt here'
```

### Suggested Prompts
Edit the `suggestedPrompts` array in `src/components/HomePage.jsx` to add your own suggestions.

## Tips for Best Results

1. **Ask for specific formats**: Request "Create an HTML page..." or "Write a markdown document..."
2. **Be descriptive**: Provide details about styling, structure, or content requirements
3. **Iterate**: Use follow-up messages to refine the generated content
4. **Preview pane**: The preview automatically appears when code blocks are detected

## Troubleshooting

### API Key Issues
- Verify your API key is correctly set in `.env`
- Check you have credits available in your Anthropic account
- Restart the server after changing environment variables

### Port Conflicts
- If port 3000 or 3001 is in use, change them in `vite.config.js` and `.env`

### Build Issues
- Delete `node_modules` and run `npm install` again
- Clear Vite cache: `rm -rf node_modules/.vite`

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
