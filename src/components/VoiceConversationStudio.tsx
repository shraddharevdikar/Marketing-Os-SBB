import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, MicOff, Volume2, VolumeX, Sparkles, Send, RefreshCw, 
  Play, Pause, Download, Copy, CheckCircle2, AlertCircle, 
  Settings, Radio, Zap, Shield, HelpCircle, ArrowRight
} from "lucide-react";
import { AudioSparkIcon } from "./AudioSparkIcon";

interface VoiceConversationStudioProps {
  companyProfile?: any;
  userRole?: string;
  userName?: string;
  onNavigateToTab?: (tab: string) => void;
  onPushToCommander?: (brief: string) => void;
}

interface MessageItem {
  id: string;
  role: "user" | "model" | "system";
  text: string;
  audioUrl?: string;
  timestamp: string;
  modelUsed?: string;
  isStreaming?: boolean;
}

export const VoiceConversationStudio: React.FC<VoiceConversationStudioProps> = ({
  companyProfile,
  userRole = "Executive",
  userName = "Operator",
  onNavigateToTab,
  onPushToCommander,
}) => {
  // Mode selection: "live" (gemini-3.8-live duplex) or "flash" (gemini-3.8-flash conversational)
  const [voiceMode, setVoiceMode] = useState<"live" | "flash">("live");
  const [voiceName, setVoiceName] = useState<string>("Zephyr");
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Ready to start voice conversation");
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [inputText, setInputText] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Context & WebSocket References
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Initial Conversation Messages
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "msg-init-1",
      role: "model",
      text: `Hello ${userName}! I am your Sovereign Executive Voice Copilot powered by Gemini 3.8 Live (Live API) and Gemini 3.8 Flash. Press "Start Live Conversation" or speak to begin our real-time voice strategy session.`,
      timestamp: "Just now",
      modelUsed: "gemini-3.8-live"
    }
  ]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isSpeaking, isThinking]);

  // Clean up audio contexts and ws on unmount
  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, []);

  // Helper: Float32Array to 16-bit PCM Little Endian base64
  const floatTo16BitPCMBase64 = (input: Float32Array): string => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Helper: Base64 PCM to AudioBuffer for 24kHz playback
  const playPcm24kChunk = (base64Data: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000
        });
      }
      const ctx = outputAudioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.copyToChannel(float32, 0);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      if (nextStartTimeRef.current < now) {
        nextStartTimeRef.current = now;
      }
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;

      activeSourcesRef.current.push(source);
      setIsSpeaking(true);

      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setIsSpeaking(false);
        }
      };
    } catch (e) {
      console.error("Error playing PCM audio chunk:", e);
    }
  };

  // Halt playback on user interruption
  const haltAudioPlayback = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch (e) {}
    });
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;
    setIsSpeaking(false);
  };

  // Start Gemini 3.8 Live Duplex Session
  const startLiveSession = async () => {
    try {
      setStatusMessage("Requesting microphone permission & opening WebSocket...");
      haltAudioPlayback();

      // 1. Establish microphone media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      mediaStreamRef.current = stream;

      // 2. Setup input AudioContext at 16kHz
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      // Setup output AudioContext at 24kHz
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000
        });
      }

      // 3. Connect to Backend WebSocket (/live)
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsLiveConnected(true);
        setIsMicActive(true);
        setStatusMessage("🟢 Connected to gemini-3.8-live. Speak now!");
        
        // Connect audio processor to pipe mic chunks
        source.connect(processor);
        processor.connect(inputCtx.destination);
      };

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate volume for visual feedback
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setVolumeLevel(Math.min(100, Math.round(rms * 400)));

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const base64Chunk = floatTo16BitPCMBase64(inputData);
          wsRef.current.send(JSON.stringify({ audio: base64Chunk }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.interrupted) {
            haltAudioPlayback();
          }

          if (data.audio) {
            playPcm24kChunk(data.audio);
          }

          if (data.text) {
            // Append or stream text
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === "model" && last.isStreaming) {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: last.text + " " + data.text }
                ];
              } else {
                return [
                  ...prev,
                  {
                    id: "msg-" + Date.now(),
                    role: "model",
                    text: data.text,
                    timestamp: "Just now",
                    modelUsed: "gemini-3.8-live",
                    isStreaming: true
                  }
                ];
              }
            });
          }

          if (data.error) {
            setStatusMessage(`Notice: ${data.error}`);
          }
        } catch (err) {
          console.error("Error handling live message:", err);
        }
      };

      ws.onerror = (e) => {
        console.error("Live WebSocket error:", e);
        setStatusMessage("WebSocket connection failed. Falling back to REST conversational mode.");
      };

      ws.onclose = () => {
        setIsLiveConnected(false);
        setIsMicActive(false);
        setStatusMessage("Live session disconnected.");
      };

    } catch (err: any) {
      console.error("Start live session error:", err);
      setStatusMessage(`Microphone or WebSocket error: ${err.message || err}. You can use text prompts below!`);
      setIsLiveConnected(false);
      setIsMicActive(false);
    }
  };

  // Stop Live Session & release resources
  const stopLiveSession = () => {
    haltAudioPlayback();
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsLiveConnected(false);
    setIsMicActive(false);
    setVolumeLevel(0);
    setStatusMessage("Live session ended.");
  };

  // Send turn-by-turn or typed prompt (gemini-3.8-flash)
  const handleSendTextMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim()) return;

    const userMsg: MessageItem = {
      id: "msg-" + Date.now(),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsThinking(true);
    setStatusMessage(`Synthesizing response with Gemini 3.8 Flash & Voice (${voiceName})...`);

    // If live WebSocket is connected, also send text through live session
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: textToSend }));
      setIsThinking(false);
      return;
    }

    try {
      const res = await fetch("/api/ai/voice/converse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          voiceName: voiceName,
          model: "models/gemini-3.8-flash"
        })
      });

      const data = await res.json();
      setIsThinking(false);

      let audioUrl: string | undefined = undefined;
      if (data.audioBase64) {
        // Create audio Blob URL from base64
        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "audio/wav" });
        audioUrl = URL.createObjectURL(blob);
      }

      const modelMsg: MessageItem = {
        id: "msg-" + (Date.now() + 1),
        role: "model",
        text: data.textResponse || "Strategy brief synthesized.",
        audioUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "models/gemini-3.8-flash"
      };

      setMessages((prev) => [...prev, modelMsg]);
      setStatusMessage("Response delivered.");

      // If audio exists, auto-play
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play().catch(() => {});
      }
    } catch (err: any) {
      setIsThinking(false);
      setStatusMessage("Error generating voice response: " + (err.message || err));
      setMessages((prev) => [
        ...prev,
        {
          id: "msg-" + Date.now(),
          role: "model",
          text: "I am ready to assist. Please check your internet connection or verify your GEMINI_API_KEY in Settings.",
          timestamp: "Just now",
          modelUsed: "Offline Fallback"
        }
      ]);
    }
  };

  // Quick Preset Prompts
  const quickPrompts = [
    {
      title: "Daily Executive Briefing",
      prompt: "Give me a 60-second executive marketing briefing highlighting our top ROAS priorities today."
    },
    {
      title: "Budget Reallocation Advice",
      prompt: "How should our enterprise reallocate budget between Google Ads and LinkedIn sponsored content to optimize CPA?"
    },
    {
      title: "Elevator Pitch Polish",
      prompt: "Act as an investor and provide feedback on our high-growth B2B SaaS marketing value proposition."
    },
    {
      title: "CASL & PIPEDA Compliance",
      prompt: "Outline key Canadian CASL opt-in requirements for launching cold B2B outreach sequences."
    },
    {
      title: "High-Impact Campaign Hooks",
      prompt: "Suggest 3 punchy, high-converting commercial hooks for a multi-channel product launch."
    }
  ];

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-teal-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-teal-500/20 text-teal-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-teal-500/30 flex items-center gap-1.5">
                <AudioSparkIcon className="w-3.5 h-3.5 text-teal-400" />
                <span>LIVE API & FLASH VOICE</span>
              </span>
              <span className="text-slate-400 font-mono text-[10px]">
                Model: <strong>gemini-3.8-live</strong> & <strong>models/gemini-3.8-flash</strong>
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Voice Conversations Studio</span>
            </h1>
            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
              Experience real-time, low-latency, bidirectional spoken conversations powered by 
              <strong> gemini-3.8-live (Live API)</strong> with audio streaming, live transcriptions, 
              and <strong>gemini-3.8-flash</strong> executive reasoning.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab("creative-studio")}
                className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Multimodal Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Controls & Conversation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Audio Controls & Voice Configuration (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Audio Engine Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${isLiveConnected ? "text-emerald-500 animate-pulse" : "text-slate-400"}`} />
                <h3 className="text-sm font-bold text-slate-900">Live Voice Engine</h3>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                isLiveConnected 
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}>
                {isLiveConnected ? "CONNECTED" : "IDLE"}
              </span>
            </div>

            {/* Mode Switch: Live Duplex vs Turn-by-Turn */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setVoiceMode("live")}
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  voiceMode === "live"
                    ? "bg-white text-teal-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-teal-600" />
                <span>Gemini 3.8 Live</span>
              </button>
              <button
                onClick={() => setVoiceMode("flash")}
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  voiceMode === "flash"
                    ? "bg-white text-indigo-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Gemini 3.8 Flash</span>
              </button>
            </div>

            {/* Voice Persona Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Voice Persona (Prebuilt)</span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">24kHz PCM</span>
              </label>
              <select
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Zephyr">Zephyr (Bright, Natural, Engaging)</option>
                <option value="Puck">Puck (Energetic, Modern, Direct)</option>
                <option value="Kore">Kore (Clear, Professional, Articulate)</option>
                <option value="Fenrir">Fenrir (Authoritative, Confident)</option>
                <option value="Charon">Charon (Calm, Measured, Executive)</option>
              </select>
            </div>

            {/* Interactive Microphone Button */}
            <div className="space-y-3 pt-2">
              {!isLiveConnected ? (
                <button
                  onClick={startLiveSession}
                  className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Mic className="w-5 h-5 animate-bounce" />
                  <span>Start Live Conversation</span>
                </button>
              ) : (
                <button
                  onClick={stopLiveSession}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <MicOff className="w-5 h-5" />
                  <span>Stop Live Session</span>
                </button>
              )}

              {/* Live Audio Visualizer Bar */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Mic Input Level:</span>
                  <span className="font-bold text-slate-800">{volumeLevel}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-75 ${
                      volumeLevel > 60 ? "bg-emerald-500" : volumeLevel > 20 ? "bg-teal-500" : "bg-slate-400"
                    }`}
                    style={{ width: `${Math.max(4, Math.min(100, volumeLevel))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Status:</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                    {isSpeaking ? "🔊 Copilot Speaking" : isMicActive ? "🎙️ Listening" : "Paused"}
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Protocol Notes */}
            <div className="bg-teal-50/60 p-3 rounded-xl border border-teal-100 text-[11px] text-teal-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-700" />
                <span>Live API Duplex Specifications</span>
              </div>
              <ul className="list-disc list-inside text-[10px] text-teal-800 space-y-0.5">
                <li>Input: 16kHz PCM little-endian microphone</li>
                <li>Output: 24kHz PCM low-latency neural synthesis</li>
                <li>Full barge-in interruption detection enabled</li>
              </ul>
            </div>
          </div>

          {/* Quick Boardroom Prompts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Executive Verbal Prompts</span>
            </h4>
            <div className="space-y-2">
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendTextMessage(item.prompt)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-100 hover:border-teal-300 hover:bg-teal-50/40 text-xs text-slate-700 transition cursor-pointer group"
                >
                  <div className="font-bold text-slate-900 group-hover:text-teal-900 flex items-center justify-between">
                    <span>{item.title}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-teal-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {item.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Conversational Thread & Text Chat (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[580px]">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                <AudioSparkIcon className="w-4 h-4 text-teal-700" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Live Spoken Strategy Thread
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  Active Voice: <strong>{voiceName}</strong> • {statusMessage}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMessages([{
                  id: "msg-fresh",
                  role: "model",
                  text: `Ready for a new strategic session. What would you like to discuss, ${userName}?`,
                  timestamp: "Just now",
                  modelUsed: "gemini-3.8-live"
                }])}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 transition cursor-pointer"
                title="Clear Thread"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div 
            ref={chatScrollRef}
            className="flex-1 p-5 space-y-4 overflow-y-auto bg-slate-50/30 custom-scrollbar max-h-[480px]"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role !== "user" && (
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-[10px]">
                    <AudioSparkIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl max-w-xl space-y-2 ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white shadow-xs rounded-tr-xs"
                      : "bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 border-b pb-1.5 border-slate-100/30 text-[10px] font-mono opacity-80">
                    <span className="font-bold">
                      {msg.role === "user" ? userName.toUpperCase() : "SOVEREIGN VOICE COPILOT"}
                    </span>
                    <div className="flex items-center gap-2">
                      {msg.modelUsed && (
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[9px] border border-slate-200">
                          {msg.modelUsed}
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>

                  <p className="leading-relaxed whitespace-pre-wrap text-xs">
                    {msg.text}
                  </p>

                  {/* Playable Audio Controls (if present) */}
                  {msg.audioUrl && (
                    <div className="pt-2 border-t border-slate-100">
                      <audio src={msg.audioUrl} controls className="w-full h-8" />
                    </div>
                  )}

                  {/* Message Action Utilities */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => copyText(msg.id, msg.text)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      title="Copy response text"
                    >
                      {copiedId === msg.id ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    {onPushToCommander && msg.role === "model" && (
                      <button
                        onClick={() => onPushToCommander(msg.text)}
                        className="text-[10px] text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <span>Push to Commander</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-[10px]">
                    {userName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-3 justify-start items-center text-xs text-slate-500 animate-pulse">
                <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
                  <AudioSparkIcon className="w-3.5 h-3.5" />
                </div>
                <span>Gemini 3.8 is generating spoken response...</span>
              </div>
            )}
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-4 border-t border-slate-200 bg-white space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendTextMessage()}
                placeholder="Type or speak a prompt for the voice copilot (e.g., 'Summarize our Q4 ROAS target in 3 sentences')..."
                className="flex-1 p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <button
                onClick={() => handleSendTextMessage()}
                disabled={isThinking || !inputText.trim()}
                className="px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Talk</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Tip: Click <strong>Start Live Conversation</strong> above to stream continuous microphone audio via Live API.</span>
              <span className="font-mono">Real-Time Duplex Active</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
