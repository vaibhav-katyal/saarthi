import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Editor } from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { Play, User, Swords, CheckCircle2, Clock, Copy, Plus, Sparkles, Settings, X, LogOut, Code2, AlertCircle, Trophy, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { GlassCard } from "@/components/GlassCard";
import { ApiGuideModal } from "@/components/ApiGuideModal";
import { extractUserCode, buildFinalCode, normalizeOutput } from "@/lib/codeExecution";
import { logCodeDuelActivity } from "@/lib/activityLogger";

interface TestCase {
    id: number;
    input: string;
    expected: string;
    actual?: string;
    output?: string;
    status?: "pass" | "fail" | "running" | "error";
    isHidden?: boolean;
}

interface Problem {
    title: string;
    difficulty: string;
    description: string;
    constraints: string[];
    examples: { input: string; output: string }[];
    testCases: TestCase[];
    fullTemplate: string;
    language: string;
}

interface Achievement {
    _id: string;
    winner: string;
    winnerName: string;
    opponent: string;
    opponentName: string;
    problemTitle: string;
    difficulty: string;
    roomId: string;
    winTime: string;
}

const CodeDuel = () => {
    // General Socket & Room State
    const [socket, setSocket] = useState<Socket | null>(null);
    const [roomMode, setRoomMode] = useState<"landing" | "in-room">("landing");
    const [status, setStatus] = useState<"waiting" | "active" | "finished">("waiting");
    const [roomId, setRoomId] = useState<string | null>(null);
    const [joinRoomId, setJoinRoomId] = useState("");
    const [isOwner, setIsOwner] = useState(false);
    const [opponent, setOpponent] = useState<any>(null);
    const [winner, setWinner] = useState<any>(null);
    const [resultMessage, setResultMessage] = useState<string>("");

    // Achievements State
    const [showAchievementsModal, setShowAchievementsModal] = useState(false);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [achievementsLoading, setAchievementsLoading] = useState(false);
    const [achievementsStats, setAchievementsStats] = useState<any>(null);

    // Setup User - with persistent guest ID
    const userString = localStorage.getItem("user");
    let user = userString ? JSON.parse(userString) : null;
    
    // If no user, create a guest and store it
    if (!user) {
        // Check if guest ID already exists
        const existingGuestId = localStorage.getItem("guestUserId");
        const guestId = existingGuestId || `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        if (!existingGuestId) {
            localStorage.setItem("guestUserId", guestId);
        }
        
        user = { id: guestId, name: "Guest User" };
    }
    
    console.log('Current user:', user);

    // AI Generation State
    const [apiKey, setApiKey] = useState("");
    const [showApiSettings, setShowApiSettings] = useState(false);
    const [showApiGuide, setShowApiGuide] = useState(false);
    const [topic, setTopic] = useState("");
    const [generating, setGenerating] = useState(false);

    // Problem & Execution State
    const [problem, setProblem] = useState<Problem | null>(null);
    const [problemSnapshot, setProblemSnapshot] = useState<Problem | null>(null);  // Keep a snapshot for achievements
    const [code, setCode] = useState<string>("// Wait for the problem to be generated...\n");
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [running, setRunning] = useState(false);
    const [opponentProgress, setOpponentProgress] = useState<{ passed: number, total: number } | null>(null);
    const [attempts, setAttempts] = useState(0);

    // Timer State
    const [timerRemaining, setTimerRemaining] = useState<number | null>(null); // in seconds
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Load API key from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("groq_api_key");
        if (saved) setApiKey(saved);

        const newSocket = io("http://localhost:5000");
        setSocket(newSocket);

        newSocket.on("room-created", ({ roomId, room }) => {
            setRoomMode("in-room");
            setRoomId(roomId);
            setIsOwner(true);
            setOpponent(null);
            setStatus("waiting");
            toast.success("Room created successfully!");
        });

        newSocket.on("player-joined", ({ roomId, room }) => {
            setRoomMode("in-room");
            setRoomId(roomId);

            // Find opponent
            const otherPlayer = room.players.find((p: any) => p.id !== user.id);
            console.log('Player joined event - room players:', room.players, 'current user:', user.id, 'found opponent:', otherPlayer);
            if (otherPlayer) {
                setOpponent(otherPlayer);
                toast.success(`${otherPlayer.name} joined the room!`);
            } else {
                console.warn('No other player found in room');
            }
        });

        newSocket.on("problem-synced", ({ problem }) => {
            console.log('===============================================');
            console.log('🎯 PROBLEM-SYNCED EVENT RECEIVED ✅');
            console.log('===============================================');
            console.log('Problem synced:', { title: problem?.title, difficulty: problem?.difficulty });
            console.log('Full problem object:', problem);
            setProblem(problem);
            setProblemSnapshot(problem);  // SAVE SNAPSHOT
            const userCode = extractUserCode(problem.fullTemplate);
            setCode(userCode);
            setTestCases(problem.testCases);
            toast.info("Problem generated! Owner can start the round.");
            logCodeDuelActivity.generateProblem(problem.title);
        });

        newSocket.on("round-started", ({ timerStartTime }) => {
            setStatus("active");
            setOpponentProgress(null);
            setAttempts(0);

            // Start 15 min timer
            const fifteenMins = 15 * 60;
            const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
            setTimerRemaining(Math.max(0, fifteenMins - elapsed));
            toast.success("Round Started! Good luck.");
        });

        newSocket.on("opponent-progress", ({ userId, passed, total }) => {
            if (userId !== user.id) {
                setOpponentProgress({ passed, total });
            }
        });

        newSocket.on("duel-finished", (eventData) => {
            console.log('===============================================');
            console.log('🎯 DUEL FINISHED EVENT RECEIVED ✅');
            console.log('===============================================');
            console.log('Full event data:', JSON.stringify(eventData, null, 2));
            
            const winner = eventData?.winner;
            const opponent = eventData?.opponent;
            const message = eventData?.message;
            const problemTitle = eventData?.problemTitle;
            const problemDifficulty = eventData?.problemDifficulty;
            const eventRoomId = eventData?.roomId;
            
            console.log('Destructured from event:');
            console.log('- winner:', winner);
            console.log('- opponent:', opponent?.name);
            console.log('- problemTitle:', problemTitle);
            console.log('- problemDifficulty:', problemDifficulty);
            console.log('- roomId:', eventRoomId);
            
            setStatus("finished");
            setWinner(winner);
            setResultMessage(message);
            if (timerRef.current) clearInterval(timerRef.current);

    if (winner?.id === user.id) {
                console.log('✅ CURRENT USER WON THE DUEL');
                toast.success("You won the duel! 🎉 Achievement saving with fallbacks...");
                logCodeDuelActivity.winDuel(roomId || '');
                
                const finalProblemTitle = problemTitle || problemSnapshot?.title || 'CodeDuel Victory';
                const finalDifficulty = problemDifficulty || problemSnapshot?.difficulty || 'Medium';
                const finalOpponentName = opponent?.name || 'Anonymous Player';
                const finalOpponentId = opponent?.id || 'unknown';
                
                console.log('Saving achievement with:', {
                    winner: winner.name,
                    opponentName: finalOpponentName,
                    opponentId: finalOpponentId,
                    problemTitle: finalProblemTitle,
                    difficulty: finalDifficulty,
                    roomId
                });
                
                saveAchievement(winner, {id: finalOpponentId, name: finalOpponentName}, finalProblemTitle, finalDifficulty);
            } else {
                console.log('❌ CURRENT USER LOST THE DUEL');
                toast.error("You lost the duel.");
                logCodeDuelActivity.loseDuel(roomId || '');
            }
        });

        newSocket.on("round-reset", ({ room }) => {
            console.log('Round reset event received');
            setStatus("waiting");
            setProblem(null);
            setProblemSnapshot(null);  // Clear snapshot too
            setCode("// Wait for the problem to be generated...\n");
            setTestCases([]);
            setOpponentProgress(null);
            setTimerRemaining(null);
            setWinner(null);
            toast.info("Room reset. Ready for a new round.");
        });

        newSocket.on("error", ({ message }) => {
            toast.error(message);
        });

        return () => {
            newSocket.disconnect();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Confetti victory animation
    useEffect(() => {
        if (winner?.id === user.id && status === "finished") {
            // Victory confetti burst
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#00F5FF', '#7B61FF', '#10B981', '#FFD700', '#FF6B6B', '#4ECDC4']
            });
            
            // Multiple bursts for celebration effect
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.6 }
                });
            }, 250);
            
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.6 }
                });
            }, 500);
        }
    }, [winner, status, user.id]);

    // Timer Interval
    useEffect(() => {
        if (status === "active" && timerRemaining !== null && timerRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimerRemaining((prev) => {
                    if (prev && prev <= 1) {
                        clearInterval(timerRef.current!);
                        handleTimeUp();
                        return 0;
                    }
                    return prev ? prev - 1 : 0;
                });
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status, timerRemaining]);

    const handleTimeUp = () => {
        setStatus("finished");
        setResultMessage("Time is up! No one finished in time.");
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const createRoom = () => {
        if (socket) socket.emit("create-room", user);
        logCodeDuelActivity.createRoom();
    };

    const joinRoom = () => {
        if (!joinRoomId.trim()) return toast.error("Enter a room ID");
        if (socket) socket.emit("join-room", { roomId: joinRoomId.trim(), user });
        logCodeDuelActivity.joinRoom(joinRoomId.trim());
    };

    const leaveRoom = () => {
        // Simple reload to leave and reset state
        window.location.reload();
    };

    // Achievements Functions
    const fetchAchievements = async () => {
        setAchievementsLoading(true);
        try {
            console.log('Fetching achievements for user:', user.id);
            const response = await fetch(`http://localhost:5000/api/codeduel/achievements/${user.id}`);
            const data = await response.json();
            console.log('Achievement fetch response:', data);
            if (data.success) {
                setAchievements(data.achievements);
                if (data.achievements.length === 0) {
                    console.warn('No achievements found for user:', user.id);
                }
            } else {
                toast.error('Failed to load achievements: ' + data.message);
            }
        } catch (error) {
            console.error('Error fetching achievements:', error);
            toast.error('Failed to load achievements');
        } finally {
            setAchievementsLoading(false);
        }
    };

    const fetchAchievementStats = async () => {
        try {
            console.log('Fetching stats for user:', user.id);
            const response = await fetch(`http://localhost:5000/api/codeduel/stats/${user.id}`);
            const data = await response.json();
            console.log('Stats fetch response:', data);
            if (data.success) {
                setAchievementsStats(data);
            } else {
                console.error('Failed to fetch stats:', data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const saveAchievement = async (winnerInfo: any, opponentInfo: any, problemTitle: string, difficulty: string) => {
        try {
            const achievementData = {
                winner: winnerInfo?.id || 'unknown',
                winnerName: winnerInfo?.name || 'Unknown Winner',
                opponent: opponentInfo?.id || 'unknown',
                opponentName: opponentInfo?.name || 'Anonymous',
                problemTitle: problemTitle || 'CodeDuel Victory',
                difficulty: difficulty || 'Medium',
                roomId: roomId || 'unknown'
            };
            
            console.log('=== SAVING ACHIEVEMENT ===');
            console.log('Final safe data:', achievementData);
            
            const response = await fetch('http://localhost:5000/api/codeduel/achievements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(achievementData)
            });
            
            const data = await response.json();
            console.log('Save response:', { status: response.status, success: data.success, data });
            
            if (data.success) {
                console.log('✅ Achievement saved!');
                toast.success('Achievement unlocked! 🏆');
            } else {
                console.warn('Save failed but continuing:', data.message);
                toast.info('Win recorded (save optional)');
            }
        } catch (error) {
            console.error('Save error (non-blocking):', error);
            toast.info('Win recorded!');
        }
    };

    const viewAchievements = async () => {
        setShowAchievementsModal(true);
        await fetchAchievements();
        await fetchAchievementStats();
    };

    const saveApiKey = () => {
        if (!apiKey.trim()) return toast.error("Please enter a valid API key");
        localStorage.setItem("groq_api_key", apiKey);
        toast.success("API key saved");
        setShowApiSettings(false);
    };

    // AI Problem Generation (Similiar to Testpad)
    const callGroqAPI = async (prompt: string) => {
        if (!apiKey.trim()) {
            toast.error("Please configure Groq API key first");
            setShowApiSettings(true);
            return null;
        }

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are a coding problem generator. Generate coding problems in valid JSON format. Always respond with valid JSON only, no other text." },
                        { role: "user", content: prompt },
                    ],
                    temperature: 0.7,
                    max_tokens: 2000,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.error?.message || "Failed to call Groq API");
                return null;
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to connect to API");
            return null;
        }
    };

    const handleGenerate = async () => {
        if (!topic.trim()) return toast.error("Enter a problem topic");
        setGenerating(true);

        const prompt = `Generate a Java coding problem for: "${topic}"

CRITICAL REQUIREMENTS:
1. Class name MUST be Main
2. The user-editable method must be an instance method inside Main.
3. Never use static methods for the user-editable method
4. Method body MUST be completely empty with just closing brace
5. Main method must instantiate Main class and call the method
6. Pass individual parameters, NOT String input
7. Print result using System.out.println()
8. For arrays, test case inputs MUST be space-separated values (e.g., "1 2 3"), NEVER use formatting like "[1, 2, 3]".
9. Generate EXACTLY 5 to 6 Test Cases. Mark 3 as hidden.

Return ONLY a valid JSON object:
{
  "title": "Problem Title",
  "difficulty": "Easy/Medium/Hard",
  "description": "Detailed description",
  "constraints": ["constraint1", "constraint2"],
  "examples": [ {"input": "1 2", "output": "3"} ],
  "testCases": [ {"input": "1 2", "expected": "3", "isHidden": false} ],
  "language": "java",
  "fullTemplate": "import java.util.*;\\n\\npublic class Main {\\n    // USER_CODE_START\\n    public long sumTwoNumbers(int a, int b) {\\n    }\\n    // USER_CODE_END\\n\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        if (sc.hasNextInt()) {\\n            int a = sc.nextInt();\\n            int b = sc.nextInt();\\n            Main obj = new Main();\\n            long result = obj.sumTwoNumbers(a, b);\\n            System.out.println(result);\\n        }\\n    }\\n}"
}`;

        const response = await callGroqAPI(prompt);
        if (!response) {
            setGenerating(false);
            return;
        }

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("No valid JSON found in response");

            const problemData = JSON.parse(jsonMatch[0]);

            const newProblem: Problem = {
                title: problemData.title,
                difficulty: problemData.difficulty,
                description: problemData.description,
                constraints: problemData.constraints,
                examples: problemData.examples,
                language: problemData.language || "java",
                fullTemplate: problemData.fullTemplate,
                testCases: problemData.testCases.map((tc: any, i: number) => ({
                    id: i + 1,
                    input: tc.input,
                    expected: tc.expected,
                    isHidden: tc.isHidden || false,
                })),
            };

            // Sync to room
            if (socket && roomId) {
                console.log('=== EMITTING SYNC-PROBLEM ===');
                console.log('roomId:', roomId);
                console.log('problem:', newProblem);
                console.log('socket connected?', socket.connected);
                socket.emit("sync-problem", { roomId, problem: newProblem });
                console.log('✅ sync-problem event emitted');
            } else {
                console.error('❌ Cannot emit sync-problem: socket or roomId missing', { socket: !!socket, roomId });
            }

        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error parsing response");
        } finally {
            setGenerating(false);
        }
    };

    const startRound = () => {
        if (socket && roomId) {
            socket.emit("start-round", { roomId });
        }
    };

    const newRound = () => {
        if (socket && roomId) {
            socket.emit("new-round", { roomId });
        }
    };

    // Code Execution
    const executeCode = async (userCode: string, input: string) => {
        if (!problem) return { output: "", error: "No problem loaded" };
        try {
            const finalCode = buildFinalCode(problem.fullTemplate, userCode);
            const response = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
                method: "POST",
                headers: {
                    "X-RapidAPI-Key": import.meta.env.VITE_JUDGE0_API_KEY || "",
                    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    language_id: 62, // Java
                    source_code: finalCode,
                    stdin: input || "",
                }),
            });

            if (!response.ok) return { output: "", error: "Code execution service failed" };
            const result = await response.json();

            if (result.status?.id > 3) {
                return { output: "", error: result.stderr || result.compile_output || "Execution error" };
            }
            return { output: normalizeOutput(result.stdout || "") };
        } catch (error) {
            return { output: "", error: error instanceof Error ? error.message : "Failed to execute code" };
        }
    };

    const runTests = async () => {
        if (!problem) return toast.error("No problem loaded");
        if (!code.trim()) return toast.error("Write some code first");

        setRunning(true);
        setTestCases((prev) => prev.map((tc) => ({ ...tc, status: "running", actual: undefined })));

        try {
            const results: TestCase[] = [];
            let passCount = 0;

            for (const testCase of testCases) {
                const execution = await executeCode(code, testCase.input);
                const passed = !execution.error && normalizeOutput(execution.output) === normalizeOutput(testCase.expected);
                if (passed) passCount++;

                results.push({
                    ...testCase,
                    status: passed ? "pass" : "fail",
                    actual: execution.output,
                    output: execution.error ? execution.error : execution.output,
                });

                // Emit progress after every test case block
                if (socket && roomId) {
                    socket.emit("test-progress", { roomId, userId: user.id, passed: passCount, total: testCases.length });
                }

                await new Promise((resolve) => setTimeout(resolve, 300));
            }

            setTestCases(results);
            setAttempts(a => a + 1);

            if (passCount === testCases.length) {
                // WON!
                console.log('✅ ALL TESTS PASSED - EMITTING DUEL-WIN');
                console.log('roomId:', roomId);
                console.log('user:', user);
                if (socket && roomId) {
                    console.log('Emitting duel-win event to backend...');
                    socket.emit("duel-win", { roomId, user });
                } else {
                    console.error('Cannot emit duel-win: socket or roomId missing', { socket: !!socket, roomId });
                }
            } else {
                toast.error(`Failed ${testCases.length - passCount} test cases.`);
            }
        } catch (error) {
            toast.error("Failed to run tests");
        } finally {
            setRunning(false);
        }
    };

    // -----------------------------------------------------------------------------------
    // RENDER LOGIC
    // -----------------------------------------------------------------------------------

    if (roomMode === "landing") {
        return (
            <PageWrapper
                title="Code Duel"
                subtitle="Challenge your peers in real-time coding battles."
                icon={<Swords className="h-3 w-3" />}
                badge="Multiplayer"
            >
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 mt-20">
                    <GlassCard className="flex-1 flex flex-col group p-8">
                        {/* <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-50"></div> */}
                        <h2 className="text-2xl font-bold mb-2">Create Room</h2>
                        <p className="text-sm text-muted-foreground mb-8">Generate a custom AI problem and invite an opponent to battle.</p>
                        
                        <Button 
                            onClick={createRoom}
                            className="mt-auto h-12 w-full bg-white text-black hover:bg-gray-200 font-bold text-lg rounded-xl transition-all"
                        >
                            <Plus className="mr-2 h-5 w-5" /> Host a Match
                        </Button>
                    </GlassCard>

                    <div className="flex items-center justify-center md:hidden">
                        <span className="text-muted-foreground font-bold uppercase text-sm">OR</span>
                    </div>

                    <GlassCard className="flex-1 flex flex-col p-8">
                        <h2 className="text-2xl font-bold mb-2">Join Room</h2>
                        <p className="text-sm text-muted-foreground mb-6">Have an invite code? Enter it below to join the battle.</p>
                        
                        <div className="mt-auto space-y-3">
                            <input 
                                type="text" 
                                value={joinRoomId} 
                                onChange={(e) => setJoinRoomId(e.target.value)}
                                placeholder="Enter 4-digit Code" 
                                className="w-full h-12 rounded-xl border border-white/20 bg-black/40 px-4 text-center font-mono text-xl text-white outline-none focus:border-primary transition-colors uppercase"
                            />
                            <Button 
                                onClick={joinRoom}
                                className="h-12 w-full bg-[#111422] border border-white/20 text-white hover:bg-white/10 font-bold text-lg rounded-xl transition-all"
                            >
                                Enter Room
                            </Button>
                        </div>
                    </GlassCard>
                </div>

                <div className="max-w-4xl mx-auto flex justify-center mt-6">
                    <button
                        onClick={viewAchievements}
                        className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-white/10 transition-colors shadow-sm"
                        title="View Achievements"
                    >
                        <Trophy className="h-4 w-4 text-accent" /> View Achievements
                    </button>
                </div>

                {/* Achievements Modal */}
                {showAchievementsModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="w-full max-w-2xl bg-[#111422] border border-white/10 rounded-2xl shadow-2xl my-8">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#00F5FF]/20 to-[#7B61FF]/20 border border-[#00F5FF]/30">
                                        <Trophy className="h-4 w-4 text-[#00F5FF]" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Your Achievements</h2>
                                        <p className="text-xs text-gray-400">Your CodeDuel victories</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowAchievementsModal(false)}
                                    className="p-1.5 hover:bg-white/5 rounded-md text-gray-400"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {achievementsLoading ? (
                                    <div className="flex items-center justify-center h-48">
                                        <div className="text-center">
                                            <div className="h-10 w-10 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mx-auto mb-4" />
                                            <p className="text-gray-400">Loading achievements...</p>
                                        </div>
                                    </div>
                                ) : achievements.length === 0 ? (
                                    <div className="flex items-center justify-center h-48">
                                        <div className="text-center">
                                            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                                            <p className="text-gray-400">No achievements yet. Start dueling to earn achievements!</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Stats Summary */}
                                        {achievementsStats && (
                                            <div className="grid grid-cols-4 gap-4 mb-8">
                                                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                                                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Total Wins</p>
                                                    <p className="text-2xl font-black text-[#00F5FF]">{achievementsStats.totalWins}</p>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                                                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Easy</p>
                                                    <p className="text-2xl font-black text-green-400">{achievementsStats.byDifficulty.Easy}</p>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                                                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Medium</p>
                                                    <p className="text-2xl font-black text-yellow-400">{achievementsStats.byDifficulty.Medium}</p>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                                                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Hard</p>
                                                    <p className="text-2xl font-black text-red-400">{achievementsStats.byDifficulty.Hard}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Achievements List */}
                                        {achievements.map((achievement) => (
                                            <div key={achievement._id} className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-[#00F5FF]/30 transition-colors">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="text-lg font-bold text-white">{achievement.problemTitle}</h3>
                                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${
                                                        achievement.difficulty === 'Easy' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 
                                                        achievement.difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' : 
                                                        'border-red-500/30 text-red-400 bg-red-500/10'
                                                    }`}>
                                                        {achievement.difficulty}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mt-3">
                                                    <div>
                                                        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">You</p>
                                                        <p className="text-white font-semibold text-sm">{achievement.winnerName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Opponent</p>
                                                        <p className="text-white font-semibold text-sm">{achievement.opponentName}</p>
                                                    </div>
                                                    <div className="md:col-span-1">
                                                        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Date</p>
                                                        <p className="text-white font-semibold text-sm">{new Date(achievement.winTime).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </PageWrapper>
        );
    }

    return (
        <div className="w-full h-screen bg-[#070B14] flex flex-col overflow-hidden text-white font-sans">
            {/* Header / Room Bar */}
            <div className="bg-[#111422] border-b border-white/10 px-6 py-4 flex items-center justify-between z-40">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#00F5FF]/20 to-[#7B61FF]/20 border border-[#00F5FF]/30">
                            <Swords className="h-5 w-5 text-[#00F5FF]" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold font-heading m-0 leading-tight tracking-wide">CodeDuel Room</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">ID:</span>
                                <span className="text-xs font-mono font-bold text-[#00F5FF] bg-[#00F5FF]/10 px-2 rounded-sm select-all">
                                    {roomId}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    {status === "active" && timerRemaining !== null && (
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Time Remaining</span>
                            <div className={`flex items-center gap-2 text-2xl font-black font-mono ${timerRemaining < 300 ? "text-red-500 animate-pulse" : "text-white"}`}>
                                <Clock className="h-5 w-5" /> {formatTime(timerRemaining)}
                            </div>
                        </div>
                    )}
                    {status === "waiting" && (
                        <div className="px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                           <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span> Waiting to start
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {isOwner && status === "waiting" && (
                        <button onClick={() => setShowApiSettings(true)} className="p-2.5 hover:bg-white/5 rounded-lg transition-colors border border-white/5 text-gray-400 hover:text-white" title="API Settings">
                            <Settings className="h-4 w-4" />
                        </button>
                    )}
                    <button onClick={leaveRoom} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                        <LogOut className="h-4 w-4" /> Leave Room
                    </button>
                </div>
            </div>

            {/* API Guide Modal */}
            <ApiGuideModal isOpen={showApiGuide} onClose={() => setShowApiGuide(false)} />

            {/* API Settings Modal */}
            {showApiSettings && isOwner && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-[#111422] border border-white/10 rounded-xl shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h2 className="text-base font-semibold">Groq API Configuration</h2>
                            <button onClick={() => setShowApiSettings(false)} className="p-1.5 hover:bg-white/5 rounded-md text-gray-400">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-5">
                            <label className="text-xs font-medium text-gray-400 mb-2 block uppercase tracking-wider">Groq API Key</label>
                            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="gsk_..." className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm outline-none focus:border-[#7B61FF] transition-colors font-mono" />
                            <div className="flex items-center justify-between mt-3">
                                <p className="text-xs text-gray-500 flex items-start gap-1">
                                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5"/> Get your free API key from console.groq.com
                                </p>
                                <button
                                    onClick={() => setShowApiGuide(true)}
                                    className="text-xs font-medium text-[#00F5FF] hover:text-[#00F5FF]/80 transition-colors underline underline-offset-2 flex items-center gap-1"
                                >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                    How to get API key?
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 p-4 border-t border-white/10 bg-white/5">
                            <button onClick={() => setShowApiSettings(false)} className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/5 transition-colors">Cancel</button>
                            <button onClick={saveApiKey} className="flex-1 rounded-lg bg-white text-black px-4 py-2.5 text-sm font-bold hover:bg-gray-200 transition-colors">Save Key</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Battle Area */}
            <div className="flex-1 flex gap-px bg-white/10 h-[calc(100vh-80px)] overflow-hidden">
                
                {/* LEFT COLLUMN: Specs & Opponent */}
                <div className="w-1/3 min-w-[350px] bg-[#070B14] flex flex-col pt-1">
                    
                    {/* Problem Configuration / Details */}
                    <div className="flex-1 flex flex-col border-b border-white/10 p-5 overflow-y-auto custom-scrollbar relative">
                        {status === "waiting" && !problem ? (
                            <div className="flex flex-col justify-center h-full">
                                {isOwner ? (
                                    <div className="space-y-4">
                                        <div className="text-center mb-6">
                                            <div className="inline-flex p-3 rounded-full bg-white/5 mb-3">
                                                <Sparkles className="h-6 w-6 text-[#7B61FF]" />
                                            </div>
                                            <h3 className="text-lg font-bold">Generate Problem</h3>
                                            <p className="text-xs text-gray-400">Configure the duel problem using AI.</p>
                                        </div>
                                        <input 
                                            type="text" 
                                            value={topic} 
                                            onChange={(e) => setTopic(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                                            placeholder="e.g. Find the longest palindromic substring"
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[#00F5FF]/50 transition-colors"
                                        />
                                        <Button onClick={handleGenerate} disabled={generating} className="w-full bg-white text-black hover:bg-gray-200 font-bold h-11">
                                            {generating ? "Generating Battle..." : "Generate AI Problem"}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-400 flex flex-col items-center">
                                        <div className="h-10 w-10 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mb-4" />
                                        <p>Waiting for Room Owner to generate the problem...</p>
                                    </div>
                                )}
                            </div>
                        ) : problem ? (
                            <div className="space-y-5 animate-in fade-in duration-500">
                                <div>
                                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">{problem.title}</h2>
                                    <div className="flex gap-2">
                                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${problem.difficulty === 'Easy' ? 'border-green-500/30 text-green-400 bg-green-500/10' : problem.difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                                            {problem.difficulty}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-300 leading-relaxed font-light">
                                    {problem.description}
                                </div>
                                {problem.examples.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Examples</h4>
                                        {problem.examples.map((ex, i) => (
                                            <div key={i} className="bg-white/5 rounded-lg border border-white/5 p-3 text-xs font-mono">
                                                <div className="text-gray-400 mb-1">Input: <span className="text-white bg-black/30 px-1 rounded">{ex.input}</span></div>
                                                <div className="text-gray-400">Output: <span className="text-[#00F5FF] bg-black/30 px-1 rounded">{ex.output}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* Opponent Status Panel (Bottom Left) */}
                    <div className="h-1/3 min-h-[200px] bg-[#0A0E1A] p-5 flex flex-col relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <User className="h-3.5 w-3.5" /> Opponent Status
                            </h4>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${opponent ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {opponent ? opponent.name : "Waiting for Player..."}
                            </span>
                        </div>

                        {status === "active" ? (
                            <div className="flex-1 flex flex-col justify-center items-center p-4 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
                                {opponentProgress ? (
                                    <>
                                        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#00F5FF] to-[#7B61FF]" style={{ width: `${(opponentProgress.passed / opponentProgress.total) * 100}%`, transition: 'width 0.5s ease' }}></div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-bold">Test Cases Passed</p>
                                        <div className="text-4xl font-black font-mono tracking-tighter shadow-lg text-white">
                                            {opponentProgress.passed} <span className="text-gray-500 text-xl">/ {opponentProgress.total}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-sm text-gray-500 font-medium">Opponent hasn't run tests yet.</div>
                                )}
                            </div>
                        ) : status === "waiting" && problem && isOwner ? (
                             <div className="flex-1 flex items-center justify-center p-4">
                                <Button onClick={startRound} className="w-full h-12 bg-gradient-to-r from-[#00F5FF] to-[#7B61FF] text-white font-bold tracking-wide hover:opacity-90 transition-opacity">
                                    Start Round Now
                                </Button>
                             </div>
                        ) : status === "finished" && winner ? (
                             <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                                <p className="text-sm text-gray-400 mb-1">Winner</p>
                                <p className={`text-xl font-black mb-3 ${winner.id === user.id ? 'text-[#00F5FF]' : 'text-red-400'}`}>
                                    {winner.name}
                                </p>
                                {isOwner && (
                                     <Button onClick={newRound} size="sm" className="bg-white/10 hover:bg-white/20 text-white font-bold h-9">
                                         New Battle
                                     </Button>
                                )}
                             </div>
                        ) : (
                             <div className="flex-1 flex items-center justify-center p-4">
                                <p className="text-xs text-gray-500 text-center uppercase tracking-widest font-bold">Match Pending</p>
                             </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Code Editor */}
                <div className="flex-1 bg-[#0A0E1A] flex flex-col relative">
                    {/* Disabler overlay */}
                    {status !== "active" && (
                        <div className="absolute inset-0 z-20 bg-[#070B14]/60 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="bg-[#111422] border border-white/10 p-6 rounded-2xl max-w-sm text-center shadow-2xl">
                                {status === "finished" ? (
                                    <>
                                        <CheckCircle2 className={`h-12 w-12 mx-auto mb-4 ${winner?.id === user.id ? 'text-[#10B981]' : 'text-red-500'}`} />
                                        <h3 className="text-xl font-bold mb-2">Match Finished!</h3>
                                        <p className="text-gray-400 text-sm mb-0">{resultMessage}</p>
                                    </>
                                ) : (
                                    <>
                                        <LockIcon className="h-8 w-8 text-gray-500 mx-auto mb-4 opacity-50" />
                                        <p className="text-gray-400 font-medium tracking-wide">Editor Locked.<br/>Waiting for round to begin.</p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="h-12 bg-[#111422] border-b border-white/5 flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <Code2 className="h-4 w-4 text-gray-400" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Main.java</span>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                 Attempts: <span className="text-white">{attempts}</span>
                             </div>
                             <Button onClick={runTests} disabled={running || status !== "active"} size="sm" className="h-7 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold px-4 rounded">
                                 {running ? "Running..." : "Run Tests"} <Play className="h-3 w-3 ml-1.5" />
                             </Button>
                        </div>
                    </div>

                    <div className="flex-1 relative pt-2">
                        <Editor
                            height="100%"
                            language="java"
                            theme="vs-dark"
                            value={code}
                            onChange={(v) => setCode(v || "")}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                scrollBeyondLastLine: false,
                                padding: { top: 16 },
                                roundedSelection: false,
                                cursorStyle: "line-thin",
                                renderLineHighlight: "all",
                            }}
                        />
                    </div>

                    {/* Test Results Drawer (Simplified for space) */}
                    <div className="h-48 bg-[#111422] border-t border-white/10 p-0 flex flex-col">
                        <div className="h-8 flex items-center px-4 bg-white/5 border-b border-white/5">
                             <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Test Results Console</h4>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
                             {testCases.length === 0 ? (
                                 <p className="text-gray-500">Run tests to see results here.</p>
                             ) : (
                                 <div className="flex gap-2 mb-3 max-w-full overflow-x-auto pb-2">
                                     {testCases.map((tc, idx) => (
                                         <div key={idx} className={`min-w-[80px] p-2 rounded border ${tc.status === 'pass' ? 'bg-green-500/10 border-green-500/30 text-green-400' : tc.status === 'fail' ? 'bg-red-500/10 border-red-500/30 text-red-400' : tc.status === 'running' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                                             <div className="font-bold opacity-70 mb-1">Case {idx + 1}</div>
                                             <div>{tc.status ? tc.status.toUpperCase() : "PENDING"}</div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
)

export default CodeDuel;
