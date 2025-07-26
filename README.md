Tab Writer - AI-Powered Writing Tool

A sophisticated writing tool with intelligent tone-switching autocomplete functionality. Built with Next.js, Lexical editor, and powered by OpenAI GPT-3.5-turbo, implemented as route.js in the frontend

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd tab-writer
```

### 2. Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Edit .env.local file and add your OpenAI API key
# OPENAI_API_KEY=your_openai_api_key_here

# Run the development server
npm run dev
```

The application will be running on `http://localhost:3000`

## Usage

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Accept suggestion | `Tab` |
| Dismiss suggestion | `Escape` |
| Switch tone up | `Ctrl+↑` / `Cmd+↑` |
| Switch tone down | `Ctrl+↓` / `Cmd+↓` |
| Toggle theme | `Ctrl+Shift+T` / `Cmd+Shift+T` |

Generate autocomplete suggestions based on input text and tone.

**Request:**
```json
{
  "text": "The project was successful because",
  "tone": "professional"
}
```

**Response:**
```json
{
  "suggestion": "it met all deliverables on time and within budget",
  "tone": "professional",
  "status": "success"
}
```

### GET /api/health

Health check endpoint for monitoring application status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1634567890.123
}
```

## Technologies Used

- **Next.js 14**: React framework with App Router
- **Lexical**: Facebook's extensible text editor framework
- **Tailwind CSS**: Utility-first CSS framework
- **OpenAI GPT-3.5-turbo**: AI language model
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 