# Testpad - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Get Your Free API Keys

**Groq API Key (for problem generation):**
- Go to [console.groq.com](https://console.groq.com)
- Sign up → API Keys → Create Key → Copy it
- Format: `gsk_...`

**Judge0 API Key (for code execution):**
- Go to [rapidapi.com/judge0-official/api/judge0-ce](https://rapidapi.com/judge0-official/api/judge0-ce)
- Click "Subscribe to Test" → Free Plan → Subscribe
- Dashboard → Your Apps → judge0-ce → Copy **X-RapidAPI-Key**

### 2. Add to Environment

Create `.env.local` file in project root:

```env
VITE_GROQ_API_KEY=gsk_paste_your_groq_key
VITE_JUDGE0_API_KEY=paste_your_judge0_key
VITE_JUDGE0_HOST=judge0-ce.p.rapidapi.com
```

### 3. Start Using

1. Open the **Testpad** page
2. Click **API Settings** → Paste Groq key → Save
3. Type a problem: "Two sum using hashtable", "Reverse a string", etc.
4. Click **Generate Problem**
5. Write your solution
6. Click **Run Tests** to test automatically

## 📝 Problem Description Examples

Try these for best results:

- "Find two numbers that add up to a target"
- "Reverse a linked list"
- "Find longest substring without repeating characters"
- "Check if a string is a palindrome"
- "Calculate factorial of a number"
- "Find the kth largest element in array"
- "Merge two sorted arrays"

## ✨ Features

| Feature | Details |
|---------|---------|
| **Problem Generation** | AI creates unique problems with examples |
| **Code Editor** | Monaco editor with syntax highlighting |
| **Test Execution** | Real code execution with actual results |
| **Custom Input** | Test with your own inputs |
| **Test Results** | Pass/fail visualization |
| **Code Templates** | Function skeleton provided |

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "API key not configured" | click API Settings and save your Groq key |
| Code doesn't execute | Check Judge0 key in Network tab of DevTools |
| Rate limit exceeded | Wait a minute or upgrade to paid tier |
| Problem not generating | Try simpler description or check Groq key validity |

## 📖 Full Documentation

See [TESTPAD_SETUP.md](./TESTPAD_SETUP.md) for detailed setup and troubleshooting.

---

**Enjoy practicing!** 🎉
