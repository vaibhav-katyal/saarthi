import { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { Play, User, Swords, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const CodeDuel = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [status, setStatus] = useState<"not-started" | "waiting" | "in-duel" | "finished">("not-started");
    const [code, setCode] = useState<string>("// Write your solution here\n");
    const [opponentCode, setOpponentCode] = useState<string>("waiting for opponent...");
    const [roomId, setRoomId] = useState<string | null>(null);
    const [opponent, setOpponent] = useState<any>(null);
    const [resultMessage, setResultMessage] = useState<string>("");

    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : { id: `guest-${Math.floor(Math.random() * 1000)}`, name: "Guest User" };

    useEffect(() => {
        const newSocket = io("http://localhost:5000"); // Ensure Backend URL aligns with your server setup
        setSocket(newSocket);

        // Socket Event Listeners
        newSocket.on("waiting", ({ message }) => {
            setStatus("waiting");
            toast.info(message);
        });

        newSocket.on("duel-started", ({ roomId, opponent, message }) => {
            setStatus("in-duel");
            setRoomId(roomId);
            setOpponent(opponent);
            setOpponentCode("// Opponent is writing code...");
            toast.success(message);
        });

        newSocket.on("opponent-code-change", (newCode) => {
            setOpponentCode(newCode);
        });

        newSocket.on("duel-finished", ({ winner, message }) => {
            setStatus("finished");
            setResultMessage(message);

            if (winner.id === user.id) {
                toast.success("You won the duel!");
            } else {
                toast.error("You lost the duel!");
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const startDuel = () => {
        if (socket) {
            socket.emit("join-duel", user);
        }
    };

    const handleEditorChange = (value: string | undefined) => {
        const newCode = value || "";
        setCode(newCode);
        if (socket && status === "in-duel" && roomId) {
            socket.emit("code-change", { roomId, code: newCode });
        }
    };

    const submitCode = () => {
        if (socket && status === "in-duel" && roomId) {
            socket.emit("submit-code", { roomId, user });
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#070B14] p-4 text-white overflow-hidden w-full">
            {/* Header */}
            <div className="flex items-center justify-between bg-[#111422] border border-white/10 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#00F5FF]/20 to-[#7B61FF]/20 border border-white/10">
                        <Swords className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold font-heading">Code Duel</h1>
                        <p className="text-xs text-muted-foreground">Compete against another student in real-time</p>
                    </div>
                </div>

                {status === "not-started" && (
                    <Button onClick={startDuel} className="bg-gradient-to-r from-[#00F5FF] to-[#7B61FF] text-white border-0 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(123,97,255,0.4)] px-8">
                        Find Match
                    </Button>
                )}

                {status === "waiting" && (
                    <Button disabled className="bg-white/10 border-white/20 text-white cursor-not-allowed">
                        <span className="flex h-2 w-2 rounded-full bg-yellow-400 animate-pulse mr-2"></span>
                        Searching...
                    </Button>
                )}

                {status === "in-duel" && (
                    <div className="flex items-center gap-4">
                        <div className="text-sm px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                            Live Match
                        </div>
                        <Button onClick={submitCode} className="bg-[#10B981] hover:bg-[#059669] text-white">
                            <Play className="h-4 w-4 mr-2" /> Submit Solution
                        </Button>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-4 h-[calc(100vh-140px)]">

                {/* Left Side: Opponent / Status */}
                <div className="w-1/3 flex flex-col gap-4">

                    {/* Problem Description Panel */}
                    <div className="bg-[#111422] border border-white/10 rounded-xl p-5 flex flex-col">
                        <h3 className="text-lg font-semibold mb-2">Two Sum</h3>
                        <div className="text-sm text-gray-400 space-y-3">
                            <p>Given an array of integers <code className="bg-[#070B14] px-1 rounded text-[#00F5FF]">nums</code> and an integer <code className="bg-[#070B14] px-1 rounded text-[#00F5FF]">target</code>, return indices of the two numbers such that they add up to <code className="bg-[#070B14] px-1 rounded text-[#00F5FF]">target</code>.</p>
                            <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
                            <p>You can return the answer in any order.</p>
                        </div>

                        <div className="mt-4 p-3 bg-[#070B14] border border-white/5 rounded-lg text-xs font-mono text-gray-300">
                            Input: nums = [2,7,11,15], target = 9<br />
                            Output: [0,1]<br />
                            Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
                        </div>
                    </div>

                    {/* Opponent Panel */}
                    <div className="flex-1 bg-[#111422] border border-white/10 rounded-xl flex flex-col relative overflow-hidden">
                        <div className="p-3 border-b border-white/10 bg-white/5 flex items-center gap-2">
                            <User className="h-4 w-4 text-[#7B61FF]" />
                            <span className="text-sm font-semibold text-white">
                                {opponent ? opponent.name : "Opponent"}
                            </span>
                        </div>

                        {status === "finished" && (
                            <div className="absolute inset-0 z-10 bg-[#070B14]/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                                <CheckCircle2 className={`h-16 w-16 mb-4 ${resultMessage.includes("won") ? "text-[#10B981]" : "text-red-500"}`} />
                                <h2 className="text-2xl font-bold mb-2 text-white">Match Finished</h2>
                                <p className="text-gray-300 mb-6">{resultMessage}</p>
                                <Button onClick={() => setStatus("not-started")} className="bg-white/10 hover:bg-white/20 text-white">
                                    Play Again
                                </Button>
                            </div>
                        )}

                        <div className="flex-1 p-0 opacity-60 pointer-events-none">
                            {/* Readonly editor for opponent's live code */}
                            <Editor
                                height="100%"
                                defaultLanguage="javascript"
                                theme="vs-dark"
                                value={opponentCode}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    lineNumbers: "off",
                                    scrollBeyondLastLine: false,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Side: User Editor */}
                <div className="w-2/3 bg-[#111422] border border-white/10 rounded-xl flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                        <span className="text-sm font-medium text-white flex items-center gap-2">
                            <Code2 className="h-4 w-4 text-[#00F5FF]" /> Your Workspace
                        </span>
                        <span className="text-xs px-2 py-1 bg-white/10 rounded-md text-gray-300">JavaScript</span>
                    </div>

                    <div className="flex-1 relative">
                        {status !== "in-duel" && status !== "finished" && (
                            <div className="absolute inset-0 z-10 bg-[#070B14]/50 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 pointer-events-none">
                                {status === "waiting" ? (
                                    <p className="text-xl font-bold text-white mb-2">Finding a worthy opponent...</p>
                                ) : (
                                    <>
                                        <Swords className="h-12 w-12 text-gray-500 mb-4 opacity-50" />
                                        <p className="text-lg font-bold text-gray-400">Join the queue to start coding</p>
                                    </>
                                )}
                            </div>
                        )}

                        <Editor
                            height="100%"
                            language="javascript"
                            theme="vs-dark"
                            value={code}
                            onChange={handleEditorChange}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                wordWrap: "on",
                                padding: { top: 16 },
                            }}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

// Simple Code icon since lucide-react Code2 is imported from lucide-react in standard usage but let's redeclare it locally to avoid import clashing or missing imports above:
import { Code2 } from "lucide-react";

export default CodeDuel;
