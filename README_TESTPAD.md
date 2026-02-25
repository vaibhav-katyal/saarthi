# 🧪 Testpad - AI-Powered Coding Practice Platform

A fully functional coding challenge platform that generates problems using AI and executes your code in real-time.

## ✨ Features

### 1. **AI Problem Generation** 🤖
- Generate unlimited unique coding problems
- Each problem includes:
  - Title and difficulty level
  - Detailed description
  - Constraints
  - Example test cases (2-3)
  - Pre-written function template (empty logic for you to fill)
  - 3 auto-generated test cases

### 2. **Professional Code Editor** 💻
- Monaco Editor integration
- Syntax highlighting
- Real-time code formatting
- Multiple language support
- Line numbers and code folding

### 3. **Real Code Execution** ▶️
- Execute code against test cases
- See actual pass/fail results
- View expected vs actual output
- Custom input testing
- Support for multiple languages

### 4. **Test Case Management** ✅
- Automatic test case execution
- Visual pass/fail indicators
- Expected output comparison
- Sequential test execution with UI updates

## 🚀 Quick Start

### Prerequisites
```bash
# Node.js 18+
# npm, yarn, or bun
```

### Installation

1. **Clone and Install**
```bash
npm install
# or
bun install
```

2. **Get API Keys** (Free)

   **Groq API Key:**
   - Visit [https://console.groq.com](https://console.groq.com)
   - Sign up → API Keys → Create → Copy key (format: `gsk_...`)

   **Judge0 API Key:**
   - Visit [https://rapidapi.com/judge0-official/api/judge0-ce](https://rapidapi.com/judge0-official/api/judge0-ce)
   - Free Plan → Subscribe → Copy X-RapidAPI-Key

3. **Configure Environment**

Create `.env.local`:
```env
VITE_GROQ_API_KEY=gsk_your_key_here
VITE_JUDGE0_API_KEY=your_judge0_key_here
VITE_JUDGE0_HOST=judge0-ce.p.rapidapi.com
```

4. **Start Development**
```bash
npm run dev
# Visit http://localhost:5173
# Navigate to Testpad page
```

## 📖 How to Use

### Generating a Problem

```
1. Go to Testpad page
2. Enter a problem description:
   - "Find two numbers that sum to target"
   - "Reverse a linked list"
   - "Check if string is palindrome"
3. Click "Generate Problem"
4. Wait for AI to generate the problem (1-2 seconds)
```

### Solving a Problem

```
1. Read the problem description and constraints
2. Review example inputs/outputs
3. Write your solution in the code editor
   - Function skeleton is provided
   - Just implement the logic
4. Click "Run Tests"
5. See pass/fail results for each test case
```

### Testing with Custom Input

```
1. Click "Custom Input" tab
2. Enter your test input
3. Click "Run"
4. View the output
```

### Switching Problems

```
1. Click "New Problem" button
2. Enter a different topic
3. Generate and solve a new problem
```

## 🏗️ Architecture

### Components

```
src/pages/Testpad.tsx
├── Main component with state management
├── API integration (Groq)
├── Code execution logic
└── UI layout and tabs

src/components/ApiSettingsModal.tsx
├── API configuration interface
├── Environment setup guidance
└── Key management

src/lib/codeExecution.ts
├── Code execution service
└── Judge0 integration
```

### Data Flow

```
User Input
    ↓
Groq API (Problem Generation)
    ↓
Problem State Updated
    ↓
User Writes Code
    ↓
Run Tests
    ↓
Judge0 API (Code Execution)
    ↓
Test Results
    ↓
UI Update with Pass/Fail
```

## 🔑 API Keys Explained

### Groq API
- **Purpose**: Generate coding problems using AI
- **Cost**: Free tier available
- **Rate Limit**: Dependent on plan
- **Models**: Supports multiple LLMs for problem generation

### Judge0 API
- **Purpose**: Execute code in isolated environment
- **Cost**: Free tier available (limited requests)
- **Supported Languages**: 95+
- **Execution**: Sandboxed, secure
- **Response Time**: ~1-2 seconds per execution

## 📋 Supported Languages

The following languages are fully supported:

| Language | ID | Status |
|----------|----|---------| 
| Python | 71 | ✅ |
| JavaScript | 63 | ✅ |
| TypeScript | 74 | ✅ |
| Java | 62 | ✅ |
| C++ | 53 | ✅ |
| C# | 51 | ✅ |
| Go | 60 | ✅ |
| Rust | 73 | ✅ |
| Ruby | 72 | ✅ |

## 🎯 Example Problems

Try these problem descriptions:

### Easy
```
- "Check if a number is palindrome"
- "Find the sum of array elements"
- "Reverse a string"
- "Check if string has balanced parentheses"
```

### Medium
```
- "Find longest substring without repeating characters"
- "Merge two sorted arrays"
- "Implement binary search"
- "Find the kth largest element"
```

### Hard
```
- "Implement LRU cache"
- "Find median in stream of integers"
- "Implement Trie data structure"
- "Word ladder shortest path"
```

## 🐛 Troubleshooting

### Problem: "API key not configured"

**Solution**: 
```
1. Click API Settings
2. Paste your Groq key
3. Click Save
```

### Problem: "Code execution failed"

**Solution**:
```
1. Check your Judge0 key in .env.local
2. Verify RapidAPI subscription is active
3. Check code syntax
4. Review error message for details
```

### Problem: "Problem not generating"

**Solution**:
```
1. Try simpler problem description
2. Verify Groq API key validity
3. Check API usage on console.groq.com
4. Wait 10 seconds before retrying
```

### Problem: "Rate limit exceeded"

**Solution**:
```
- Free tier has request limits
- Upgrade to paid plan on RapidAPI
- Or wait 24 hours for limit reset
- Cache problems locally to reuse
```

## 🔒 Security

### API Key Protection
- Keys stored in `.env.local` (never committed)
- Only sent to official APIs
- Not logged or tracked
- Stored in browser localStorage with user consent

### Code Execution
- Code runs in sandboxed environment (Judge0)
- No access to system files
- No network access from code
- Timeout protection (2-5 seconds)

### Data Privacy
- Problems generated locally
- No problem data sent to third parties
- User code only sent to Judge0 for execution
- No code storage after execution

## 📊 Performance Tips

1. **Cache Problems**: LocalStorage stores generated problems
2. **Batch Tests**: All test cases run sequentially (no parallel)
3. **Code Quality**: Well-written code executes faster
4. **Input Size**: Smaller inputs = faster execution
5. **API Limits**: Monitor usage to avoid rate limiting

## 🛠️ Advanced Configuration

### Using Custom Judge0 Server

Edit `executePython` function in Testpad.tsx:

```typescript
const JUDGE0_API_URL = "https://your-server.com"; // Your Judge0 instance
```

### Adding More Languages

Update `executePython` functions:

```typescript
const LANGUAGE_IDS = {
  python: 71,
  javascript: 63,
  // Add more languages here
};
```

### Custom Problem Validation

Modify test case comparison logic:

```typescript
const testPassed = normalizeOutput(output) === normalizeOutput(expected);
```

## 📦 Dependencies

```json
{
  "@monaco-editor/react": "^4.5.0",
  "lucide-react": "latest",
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```

## 📝 Environment Variables

```env
# Required
VITE_GROQ_API_KEY=gsk_...              # Groq API Key
VITE_JUDGE0_API_KEY=...                 # Judge0/RapidAPI Key
VITE_JUDGE0_HOST=judge0-ce.p.rapidapi.com

# Optional
VITE_DEBUG=false                         # Enable debug logging
VITE_CUSTOM_JUDGE0_URL=...              # Custom Judge0 server
```

## 🤝 Contributing

To improve Testpad:

1. Add support for more languages
2. Improve problem generation prompts
3. Add problem difficulty filtering
4. Implement problem history/bookmarks
5. Add discussion/hints feature

## 📞 Support

### Resources
- [Groq Documentation](https://console.groq.com/docs)
- [Judge0 Documentation](https://judge0.com/docs)
- [RapidAPI Support](https://rapidapi.com/support)

### Common Issues
See [TESTPAD_SETUP.md](./TESTPAD_SETUP.md) for detailed troubleshooting.

## 📄 License

Same as the main project.

---

**Ready to start coding?** 🚀 Go to the Testpad page and generate your first problem!
