# Testpad - Setup Guide

This guide will help you set up the AI-powered Testpad with full code execution capability.

## Requirements

- Groq API Key (free)
- Judge0 API Key (free tier available)

## Step 1: Get Groq API Key

Groq is used to generate coding problems using AI.

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to **API keys** section
4. Create a new API key
5. Copy the key (format: `gsk_...`)

## Step 2: Get Judge0 API Key

Judge0 is used to execute the code and run tests. It supports Python, JavaScript, Java, C++, and many other languages.

### Option A: Using RapidAPI (Free Tier)

1. Visit [https://rapidapi.com/judge0-official/api/judge0-ce](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Click "Subscribe to Test"
3. Choose the free tier
4. Go to your Dashboard
5. Find "judge0-ce" in your subscriptions
6. Copy your **X-RapidAPI-Key** (this is your Judge0 API key)

### Option B: Self-hosted Judge0 (Advanced)

If you prefer to run Judge0 locally or on your own server:
- Visit [https://judge0.com](https://judge0.com)
- Follow their documentation for deployment
- Use your local endpoint instead

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root (NOT `.env` - that gets committed):

```env
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
VITE_JUDGE0_API_KEY=your_judge0_rapidapi_key_here
VITE_JUDGE0_HOST=judge0-ce.p.rapidapi.com
```

## Step 4: Start Using Testpad

1. Navigate to the **Testpad** page in the application
2. Click **API Settings** button
3. Enter your Groq API key
4. Save the settings
5. Enter a problem description (e.g., "Find the longest palindrome in a string")
6. Click **Generate Problem**
7. Write your solution in the code editor
8. Click **Run Tests** to execute your code against test cases

## Features

### Problem Generation
- Enter any coding problem description
- AI generates a complete problem with:
  - Problem title and difficulty
  - Detailed description
  - Constraints
  - Example test cases
  - Function template
  - Pre-written test cases

### Code Execution
- Real-time code execution using Judge0
- Support for multiple languages (Python, JavaScript, Java, C++, etc.)
- Live test case execution
- Custom input testing

### Test Results
- Visual pass/fail indicators
- Expected vs actual output comparison
- Execution error handling
- Test case execution timing

## Troubleshooting

### "API key not configured" Error
- Go to API Settings
- Make sure you've entered a valid Groq API key
- The key should start with `gsk_`
- Save the settings

### Judge0 Execution Errors
- Ensure your Judge0 API key is valid
- Check RapidAPI dashboard for API usage/limits
- Free tier has request limits; consider upgrading if needed
- Verify the code syntax matches the selected language

### Problems Not Generating
- Ensure Groq API key is valid
- Check your Groq API quota on [https://console.groq.com](https://console.groq.com)
- Try simpler problem descriptions
- Wait a few seconds between consecutive requests

## Advanced Configuration

### Using a Custom Code Execution Backend

If you want to use your own backend instead of Judge0:

1. Create your backend API endpoint that accepts:
   ```json
   {
     "language": "python",
     "code": "your code here",
     "stdin": "input here"
   }
   ```

2. Update the `executePython` function in [Testpad.tsx](../src/pages/Testpad.tsx) to point to your backend

### Supported Languages

The following languages are supported through Judge0:

- Python (71)
- JavaScript (63)
- Java (62)
- C++ (53)
- C (50)
- C# (51)
- Go (60)
- Rust (73)
- TypeScript (74)
- And many more...

## Security Notes

⚠️ Never commit your API keys to version control. Always use `.env.local` files.

The API keys are:
- Stored in browser localStorage (with user consent)
- Only sent to Groq and Judge0 APIs
- Never logged or transmitted to third-party services

## Performance Tips

- Test cases execute sequentially with 300ms delay between each
- Large inputs/outputs may take longer
- Judge0 free tier has rate limiting; consider upgrading for production use
- Cache generated problems in localStorage for offline access

## Support

For issues with:
- **Groq API**: Visit [https://console.groq.com/docs](https://console.groq.com/docs)
- **Judge0**: Visit [https://judge0.com/docs](https://judge0.com/docs)
- **RapidAPI**: Check [https://rapidapi.com/support](https://rapidapi.com/support)
