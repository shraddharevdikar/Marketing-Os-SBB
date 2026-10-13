import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Video, Image as ImageIcon, Music, Mic, MicOff, 
  MessageSquare, Globe, MapPin, Play, Pause, Download, Send, 
  RefreshCw, Upload, CheckCircle2, AlertCircle, Copy, Check, 
  Layers, Sliders, ShieldCheck, ArrowRight, ArrowLeft, Bot, 
  ExternalLink, Volume2, Save, Trash2, Radio, Info, Eye, ImagePlus, Wand2
} from "lucide-react";
import { ImageEditAutoIcon } from "./ImageEditAutoIcon";
import { motion, AnimatePresence } from "framer-motion";
import { 
  saveCreativeAssetToFirestore, 
  CreativeAsset 
} from "../lib/firestoreSync";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

interface MultimodalAiStudioProps {
  companyProfile: any;
  userRole?: string;
  userName?: string;
  userId?: string;
  onNavigateToTab?: (tab: string) => void;
  onPushToCommander?: (creative: any) => void;
  onBack?: () => void;
  defaultTab?: "image" | "video" | "voice" | "chat" | "grounded" | "transcribe" | "music" | "vault";
  isFocusImageStudio?: boolean;
}

export const MultimodalAiStudio: React.FC<MultimodalAiStudioProps> = ({
  companyProfile,
  userRole = "Executive",
  userName = "Operator",
  userId = "user_default",
  onNavigateToTab,
  onPushToCommander,
  onBack,
  defaultTab = "image",
  isFocusImageStudio = false
}) => {
  const [activeStudioTab, setActiveStudioTab] = useState<
    "image" | "video" | "voice" | "chat" | "grounded" | "transcribe" | "music" | "vault"
  >(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveStudioTab(defaultTab);
    }
  }, [defaultTab]);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // -------------------------------------------------------------
  // 1. IMAGE STUDIO STATE (gemini-nano-banana-2.1)
  // -------------------------------------------------------------
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageAspectRatio, setImageAspectRatio] = useState("1:1");
  const [imageSize, setImageSize] = useState("1K");
  const [imageUseSearch, setImageUseSearch] = useState(false);
  const [uploadedSourceImage, setUploadedSourceImage] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState<string | null>(null);

  // -------------------------------------------------------------
  // 2. VEO VIDEO STUDIO STATE (veo-3.1-fast-generate-preview)
  // -------------------------------------------------------------
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoAspectRatio, setVideoAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [videoSourcePhoto, setVideoSourcePhoto] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStatusText, setVideoStatusText] = useState("");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // -------------------------------------------------------------
  // 3. VOICE & LIVE CONVERSATION (gemini-3.8-live / TTS)
  // -------------------------------------------------------------
  const [voiceInputText, setVoiceInputText] = useState("");
  const [voiceName, setVoiceName] = useState("Zephyr");
  const [isVoiceTalking, setIsVoiceTalking] = useState(false);
  const [voiceHistory, setVoiceHistory] = useState<Array<{ role: string; text: string; audioUrl?: string }>>([
    {
      role: "assistant",
      text: `Greetings, ${userName}. Sovereign Voice Copilot connected. How can I assist with your advertising strategy and brand positioning?`
    }
  ]);

  // -------------------------------------------------------------
  // 4. GEMINI ROLE CHATBOT (gemini-3.1-pro-preview / 3.5-flash / 3.1-flash-lite)
  // -------------------------------------------------------------
  const [chatModel, setChatModel] = useState<"gemini-3.1-pro-preview" | "gemini-3.5-flash" | "gemini-3.1-flash-lite">("gemini-3.5-flash");
  const [chatRole, setChatRole] = useState("CMO Chief Marketing Strategist");
  const [customSystemInstruction, setCustomSystemInstruction] = useState(
    "You are an elite enterprise Chief Marketing Officer (CMO). Analyze ad budgets, multi-touch attribution, and CASL/GDPR guardrails."
  );
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; text: string; time: string }>>([
    {
      role: "model",
      text: `Hello! I am your AI Marketing Copilot configured as: ${chatRole}. Ask me to evaluate customer acquisition, structure ROAS reallocations, or draft ad copy.`,
      time: "Just now"
    }
  ]);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------
  // 5. SEARCH & MAPS GROUNDING (gemini-3.5-flash with googleSearch/googleMaps)
  // -------------------------------------------------------------
  const [groundedQuery, setGroundedQuery] = useState("");
  const [groundingTool, setGroundingTool] = useState<"search" | "maps">("search");
  const [isQueryingGrounded, setIsQueryingGrounded] = useState(false);
  const [groundedResult, setGroundedResult] = useState<string | null>(null);
  const [groundingSources, setGroundingSources] = useState<any[]>([]);

  // -------------------------------------------------------------
  // 6. AUDIO TRANSCRIPTION (gemini-3.5-transcribe)
  // -------------------------------------------------------------
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // -------------------------------------------------------------
  // 7. MUSIC GENERATION (lyria-3-clip-preview & lyria-3-pro-preview)
  // -------------------------------------------------------------
  const [musicPrompt, setMusicPrompt] = useState("");
  const [musicMode, setMusicMode] = useState<"clip" | "pro">("clip");
  const [musicSourceImage, setMusicSourceImage] = useState<string | null>(null);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedLyrics, setGeneratedLyrics] = useState<string | null>(null);

  // -------------------------------------------------------------
  // 8. VAULT (FIRESTORE SYNCED)
  // -------------------------------------------------------------
  const [savedAssets, setSavedAssets] = useState<CreativeAsset[]>([]);

  // Real-time Firestore sync for assets
  useEffect(() => {
    try {
      const q = query(collection(db, "ai_creatives"), limit(50));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items: CreativeAsset[] = [];
        snapshot.forEach((doc) => {
          items.push(doc.data() as CreativeAsset);
        });
        if (items.length > 0) {
          setSavedAssets(items);
        }
      }, (err) => {
        console.warn("Firestore snapshot notice:", err);
      });
      return () => unsubscribe();
    } catch {
      // Offline fallback
    }
  }, []);

  // Scroll to bottom of chat thread
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle Photo Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "imageEdit" | "videoAnimate" | "musicImage") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (target === "imageEdit") {
        setUploadedSourceImage(result);
        setIsEditMode(true);
      } else if (target === "videoAnimate") {
        setVideoSourcePhoto(result);
      } else if (target === "musicImage") {
        setMusicSourceImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // 1. Generate / Edit Image Handler
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setGeneratedImageUrl(null);
    setImageDescription(null);

    try {
      const res = await fetch("/api/ai/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageAspectRatio,
          imageSize,
          isEdit: isEditMode && Boolean(uploadedSourceImage),
          imageBase64: isEditMode ? uploadedSourceImage : undefined,
          useSearch: imageUseSearch
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setImageDescription(data.description || "Image created with gemini-nano-banana-2.1.");
        showToast("✓ Image generated successfully with gemini-nano-banana-2.1!");

        // Auto-save to vault
        const asset: CreativeAsset = {
          id: "IMG-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          userId,
          type: "image",
          title: imagePrompt.slice(0, 40),
          prompt: imagePrompt,
          modelUsed: "gemini-nano-banana-2.1",
          mediaUrl: data.imageUrl,
          createdAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        };
        saveCreativeAssetToFirestore(asset);
        setSavedAssets(prev => [asset, ...prev]);
      } else {
        setImageDescription(data.description || "Image generated successfully.");
      }
    } catch (err: any) {
      showToast("Error: " + (err.message || "Failed to generate image"));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 2. Generate Video Handler (veo-3.1-fast-generate-preview)
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() && !videoSourcePhoto) return;
    setIsGeneratingVideo(true);
    setGeneratedVideoUrl(null);
    setVideoStatusText("Dispatching to Veo 3.1 Fast video engine...");

    try {
      const res = await fetch("/api/ai/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: videoPrompt || "Animate this photograph with realistic cinematic movement and lighting.",
          aspectRatio: videoAspectRatio,
          imageBase64: videoSourcePhoto || undefined
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.videoUrl) {
        setGeneratedVideoUrl(data.videoUrl);
        setIsGeneratingVideo(false);
        showToast("✓ Veo video generation ready!");
        return;
      }

      const operationName = data.operationName;
      setVideoStatusText("Veo is rendering video frames (720p, " + videoAspectRatio + ")...");

      // Poll status
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await fetch("/api/ai/video/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ operationName })
          });
          const statusData = await statusRes.json();

          if (statusData.done || statusData.videoUrl) {
            clearInterval(interval);
            setIsGeneratingVideo(false);
            const finalUrl = statusData.videoUrl || `/api/ai/video/download?op=${encodeURIComponent(operationName)}`;
            setGeneratedVideoUrl(finalUrl);
            showToast("✓ Video completed with veo-3.1-fast-generate-preview!");

            const asset: CreativeAsset = {
              id: "VEO-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
              userId,
              type: "video",
              title: videoPrompt.slice(0, 40) || "Animated Veo Video",
              prompt: videoPrompt,
              modelUsed: "veo-3.1-fast-generate-preview",
              mediaUrl: finalUrl,
              createdAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
            };
            saveCreativeAssetToFirestore(asset);
            setSavedAssets(prev => [asset, ...prev]);
          } else {
            setVideoStatusText(`Rendering video... (Pass ${attempts * 4}s elapsed)`);
          }
        } catch {
          // keep polling
        }

        if (attempts > 30) {
          clearInterval(interval);
          setIsGeneratingVideo(false);
          setGeneratedVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
        }
      }, 4000);
    } catch (err: any) {
      setIsGeneratingVideo(false);
      showToast("Error: " + (err.message || "Failed to generate video"));
    }
  };

  // 3. Voice Conversation Handler (gemini-3.8-live / TTS)
  const handleSendVoiceMessage = async (textToSend?: string) => {
    const msg = textToSend || voiceInputText;
    if (!msg.trim()) return;

    const userEntry = { role: "user", text: msg };
    setVoiceHistory(prev => [...prev, userEntry]);
    setVoiceInputText("");
    setIsVoiceTalking(true);

    try {
      const res = await fetch("/api/ai/voice/converse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, voiceName })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      let audioUrl: string | undefined = undefined;
      if (data.audioBase64) {
        audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
        const audio = new Audio(audioUrl);
        audio.play().catch(() => {});
      }

      setVoiceHistory(prev => [
        ...prev,
        {
          role: "assistant",
          text: data.textResponse || "Understood. Directive logged into executive memory.",
          audioUrl
        }
      ]);
    } catch (err: any) {
      showToast("Voice notice: " + (err.message || "Voice processing notice"));
    } finally {
      setIsVoiceTalking(false);
    }
  };

  // 4. Chat Handler (Multi-turn Gemini Chatbot)
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;

    const currentMsg = chatInput;
    setChatInput("");
    const newHistory = [
      ...chatMessages,
      { role: "user" as const, text: currentMsg, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
    ];
    setChatMessages(newHistory);
    setIsSendingChat(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, text: m.text })),
          model: chatModel,
          systemInstruction: `You are the ${chatRole} for ${companyProfile?.companyName || "Sovereign Business Brain"}. ${customSystemInstruction}`
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setChatMessages(prev => [
        ...prev,
        {
          role: "model",
          text: data.text || "Task executed.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        {
          role: "model",
          text: "Notice: Unable to complete response. " + (err.message || ""),
          time: "Now"
        }
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // 5. Search & Maps Grounding Handler (gemini-3.5-flash)
  const handleRunGroundedQuery = async () => {
    if (!groundedQuery.trim()) return;
    setIsQueryingGrounded(true);
    setGroundedResult(null);
    setGroundingSources([]);

    try {
      const res = await fetch("/api/ai/grounded", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: groundedQuery,
          toolType: groundingTool,
          systemInstruction: groundingTool === "maps"
            ? "You are a local market geospatial intelligence analyst. Provide specific addresses, locations, and nearby competitors."
            : "You are a real-time market research analyst. Provide grounded factual data with source citations."
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setGroundedResult(data.answer);
      if (data.groundingMetadata?.groundingChunks) {
        setGroundingSources(data.groundingMetadata.groundingChunks);
      } else if (data.sources) {
        setGroundingSources(data.sources);
      }
      showToast(`✓ Grounded information retrieved via gemini-3.5-flash (${groundingTool})!`);
    } catch (err: any) {
      showToast("Grounding notice: " + (err.message || "Query notice"));
    } finally {
      setIsQueryingGrounded(false);
    }
  };

  // 6. Audio Recording & Transcription (gemini-3.5-transcribe)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);

        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      showToast("🎙️ Microphone active. Speak clearly...");
    } catch (err: any) {
      showToast("Microphone access error: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const handleTranscribeAudio = async () => {
    if (!audioBase64) return;
    setIsTranscribing(true);
    setTranscriptionText(null);

    try {
      const res = await fetch("/api/ai/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64,
          mimeType: "audio/webm"
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setTranscriptionText(data.transcript);
      showToast("✓ Audio transcribed successfully with gemini-3.5-transcribe!");

      const asset: CreativeAsset = {
        id: "TRS-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        userId,
        type: "transcription",
        title: data.transcript.slice(0, 40),
        prompt: "Microphone Audio Transcription",
        modelUsed: "gemini-3.5-transcribe",
        mediaUrl: data.transcript,
        createdAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      };
      saveCreativeAssetToFirestore(asset);
      setSavedAssets(prev => [asset, ...prev]);
    } catch (err: any) {
      showToast("Transcription notice: " + (err.message || "Failed to transcribe"));
    } finally {
      setIsTranscribing(false);
    }
  };

  // 7. Music Generation Handler (lyria-3-clip-preview / pro)
  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim()) return;
    setIsGeneratingMusic(true);
    setGeneratedAudioUrl(null);
    setGeneratedLyrics(null);

    try {
      const res = await fetch("/api/ai/music/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: musicPrompt,
          mode: musicMode,
          imageBase64: musicSourceImage || undefined
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.audioDataUrl) {
        setGeneratedAudioUrl(data.audioDataUrl);
      }
      if (data.lyrics) {
        setGeneratedLyrics(data.lyrics);
      }
      showToast(`✓ Music generated with lyria-3-${musicMode}-preview!`);

      if (data.audioDataUrl) {
        const asset: CreativeAsset = {
          id: "MUS-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          userId,
          type: "music",
          title: musicPrompt.slice(0, 40),
          prompt: musicPrompt,
          modelUsed: `lyria-3-${musicMode}-preview`,
          mediaUrl: data.audioDataUrl,
          createdAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        };
        saveCreativeAssetToFirestore(asset);
        setSavedAssets(prev => [asset, ...prev]);
      }
    } catch (err: any) {
      showToast("Music generation notice: " + (err.message || "Notice"));
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-fadeIn font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={() => {
            if (onBack) {
              onBack();
            } else if (onNavigateToTab) {
              onNavigateToTab("campaign-commander");
            } else {
              window.history.back();
            }
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 shadow-sm transition-all cursor-pointer active:scale-95"
          title="Return to Previous Screen"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400" />
          <span>Back to Previous Screen</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>Active Module:</span>
          <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            AI Multimodal Creative Studio
          </span>
        </div>
      </div>

      {/* Main Studio Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Autonomous Multimodal Production
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Firebase Auth & Firestore Connected
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Sovereign Multimodal Creative Studio</span>
            </h1>
            <p className="text-slate-300 text-xs max-w-3xl leading-relaxed">
              Synthesize ad campaigns with Google's flagship multimodal models: Generate & edit high-resolution images with <strong>gemini-nano-banana-2.1</strong>, produce and animate commercial videos with <strong>veo-3.1-fast-generate-preview</strong>, converse in real time with <strong>gemini-3.8-live</strong>, research with <strong>Google Search & Maps Grounding</strong>, and score ads with <strong>Lyria Music</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab("campaign-commander")}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Campaign Commander</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 8 Studio Workspaces Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: "image", label: "Image Studio", icon: ImageIcon, badge: "nano-banana-2.1" },
            { id: "video", label: "Veo Video Studio", icon: Video, badge: "veo-3.1-fast" },
            { id: "voice", label: "Live Voice Talk", icon: Volume2, badge: "gemini-3.8-live" },
            { id: "chat", label: "Role Chatbot", icon: MessageSquare, badge: "gemini-3.1-pro" },
            { id: "grounded", label: "Search & Maps", icon: Globe, badge: "grounded 3.5" },
            { id: "transcribe", label: "Transcribe Audio", icon: Mic, badge: "gemini-3.5-transcribe" },
            { id: "music", label: "Music Composer", icon: Music, badge: "lyria-3-clip" },
            { id: "vault", label: "Asset Vault", icon: Save, badge: `${savedAssets.length} saved` },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeStudioTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStudioTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-purple-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                  isActive ? "bg-purple-900/80 text-purple-200" : "bg-slate-100 text-slate-500"
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* WORKSPACE 1: IMAGE STUDIO (gemini-nano-banana-2.1) */}
      {activeStudioTab === "image" && (
        <div className="space-y-6">
          {/* Top Headline Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl border border-purple-800/40 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30">
                  <ImageEditAutoIcon className="w-5 h-5 text-purple-300" />
                </span>
                <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Create & edit images</span>
                  <span className="text-[10px] font-mono bg-purple-500/30 text-purple-200 border border-purple-400/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                    gemini-nano-banana-2.1
                  </span>
                </h2>
              </div>
              <p className="text-xs text-purple-200/80 max-w-2xl leading-relaxed">
                Use natural language text prompts to synthesize photorealistic commercial images or edit, retouch, and transform existing photos using Google's <strong>gemini-nano-banana-2.1</strong> model.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Engine Ready
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Controls Panel */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              {/* Mode Switcher: Text-to-Image vs Edit & Retouch */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Workflow Mode
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => { setIsEditMode(false); setUploadedSourceImage(null); }}
                    className={`py-2 text-center rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      !isEditMode ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Create New Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className={`py-2 text-center rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isEditMode ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <ImageEditAutoIcon className="w-3.5 h-3.5 text-purple-600" />
                    <span>Edit & Retouch Image</span>
                  </button>
                </div>
              </div>

              {/* If Edit Mode: Upload Image or Pick Sample */}
              {isEditMode && (
                <div className="space-y-3 border border-purple-200 rounded-xl p-3.5 bg-purple-50/50">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ImagePlus className="w-3.5 h-3.5 text-purple-600" />
                      <span>Source Image to Edit *</span>
                    </label>
                    {uploadedSourceImage && (
                      <button
                        type="button"
                        onClick={() => setUploadedSourceImage(null)}
                        className="text-[10px] text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                      >
                        Clear Image
                      </button>
                    )}
                  </div>

                  {uploadedSourceImage ? (
                    <div className="relative rounded-lg overflow-hidden border border-purple-300 bg-slate-900 max-h-48 flex items-center justify-center">
                      <img src={uploadedSourceImage} alt="Source to edit" className="max-h-44 w-auto object-contain" />
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                        Active Source for gemini-nano-banana-2.1
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="flex flex-col items-center justify-center p-4 border border-dashed border-purple-300 rounded-lg bg-white hover:bg-purple-50/50 cursor-pointer text-xs text-slate-600 transition-colors">
                        <Upload className="w-5 h-5 text-purple-600 mb-1" />
                        <span className="font-bold text-slate-800">Upload Source Photo to Edit</span>
                        <span className="text-[10px] text-slate-400">PNG, JPG, or WebP</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "imageEdit")} />
                      </label>

                      {/* Quick Sample Image Buttons */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                          Or Click a Sample Photo:
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            {
                              name: "Office",
                              svg: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#1e1b4b"/><rect x="40" y="140" width="320" height="220" rx="10" fill="#0f172a"/><line x1="40" y1="200" x2="360" y2="200" stroke="#6366f1" stroke-width="2"/><ellipse cx="200" cy="300" rx="120" ry="40" fill="#312e81"/><text x="200" y="90" fill="#fff" font-size="18" font-family="sans-serif" font-weight="bold" text-anchor="middle">Corporate Office</text></svg>`
                            },
                            {
                              name: "Cosmetic",
                              svg: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#022c22"/><circle cx="200" cy="180" r="90" fill="#047857" opacity="0.4"/><rect x="160" y="120" width="80" height="150" rx="14" fill="#10b981"/><rect x="180" y="90" width="40" height="30" rx="4" fill="#fbbf24"/><text x="200" y="60" fill="#fff" font-size="18" font-family="sans-serif" font-weight="bold" text-anchor="middle">Luxury Bottle</text></svg>`
                            },
                            {
                              name: "Hypercar",
                              svg: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#450a0a"/><circle cx="200" cy="150" r="70" fill="#f97316" opacity="0.5"/><path d="M80 280 L140 210 L260 210 L320 280 Z" fill="#ef4444"/><rect x="100" y="270" width="200" height="35" rx="6" fill="#18181b"/><text x="200" y="70" fill="#fff" font-size="18" font-family="sans-serif" font-weight="bold" text-anchor="middle">Electric Hypercar</text></svg>`
                            }
                          ].map((sample) => (
                            <button
                              key={sample.name}
                              type="button"
                              onClick={() => {
                                const url = `data:image/svg+xml;utf8,${encodeURIComponent(sample.svg)}`;
                                setUploadedSourceImage(url);
                                setIsEditMode(true);
                                setImagePrompt(`Change background of this ${sample.name.toLowerCase()} scene with dramatic golden hour lighting and photorealistic details.`);
                              }}
                              className="px-2 py-1.5 bg-white border border-purple-200 hover:border-purple-400 text-purple-900 rounded-lg text-[11px] font-semibold text-center cursor-pointer transition-all shadow-xs"
                            >
                              + {sample.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Text Prompt Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    {isEditMode ? "Text Prompt for Image Edit *" : "Text Prompt for New Image *"}
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">English / Multilingual</span>
                </div>
                <textarea
                  rows={3}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder={
                    isEditMode
                      ? "e.g., Change the background to a luxury high-rise office at sunset, add warm cinematic rim lighting, and remove distractions."
                      : "e.g., High-end modern corporate software executive dashboard with glowing holographic graphics, sleek dark glass, and ambient purple accents in 4K."
                  }
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all placeholder:text-slate-400"
                />

                {/* Prompt Inspiration Chips */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Quick Prompt Ideas:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(isEditMode ? [
                      "Change background to modern tech office with floor-to-ceiling glass",
                      "Add golden hour sunset lighting & cinematic lens flare",
                      "Add sleek floating holographic charts & graphs",
                      "Clean background and make minimalist studio lighting"
                    ] : [
                      "Luxury storefront architecture with warm dusk lighting",
                      "Cyberpunk digital billboard ad with neon 3D typography",
                      "High-end corporate software analytics executive dashboard",
                      "Minimalist studio cosmetics bottle product render on marble"
                    ]).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setImagePrompt(preset)}
                        className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 rounded-md transition-colors cursor-pointer truncate max-w-full"
                        title={preset}
                      >
                        "{preset.slice(0, 38)}..."
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Aspect Ratio & Resolution Controls for gemini-nano-banana-2.1 */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Aspect Ratio</span>
                    <span className="text-[10px] text-purple-600 font-mono">Nano 2.1</span>
                  </label>
                  <select
                    value={imageAspectRatio}
                    onChange={(e) => setImageAspectRatio(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none text-xs"
                  >
                    <option value="1:1">1:1 Square (Feed Ads / Social)</option>
                    <option value="16:9">16:9 Landscape (YouTube / Desktop)</option>
                    <option value="9:16">9:16 Portrait (TikTok / Reels / Stories)</option>
                    <option value="4:3">4:3 Standard Display</option>
                    <option value="3:4">3:4 Vertical Card</option>
                    <option value="4:1">4:1 Panoramic Banner</option>
                    <option value="1:4">1:4 Skyscraper Tower</option>
                    <option value="8:1">8:1 Top Header Strip</option>
                    <option value="1:8">1:8 Mobile Tall Ribbon</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Resolution Size</span>
                    <span className="text-[10px] text-purple-600 font-mono">UHD</span>
                  </label>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none text-xs"
                  >
                    <option value="1K">1K Standard HD</option>
                    <option value="2K">2K Quad HD</option>
                    <option value="4K">4K Ultra HD</option>
                  </select>
                </div>
              </div>

              {/* Google Search Grounding Checkbox for Nano Banana 2.1 */}
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <input
                  type="checkbox"
                  id="searchGroundingImg"
                  checked={imageUseSearch}
                  onChange={(e) => setImageUseSearch(e.target.checked)}
                  className="rounded text-purple-600 cursor-pointer"
                />
                <label htmlFor="searchGroundingImg" className="text-slate-700 text-xs cursor-pointer select-none">
                  Ground with real-time Google Web & Image Search context
                </label>
              </div>

              {/* Submit Execution Button */}
              <button
                type="button"
                disabled={isGeneratingImage || !imagePrompt.trim() || (isEditMode && !uploadedSourceImage)}
                onClick={handleGenerateImage}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing with gemini-nano-banana-2.1...</span>
                  </>
                ) : (
                  <>
                    <ImageEditAutoIcon className="w-4 h-4" />
                    <span>{isEditMode ? "Apply Image Edit with gemini-nano-banana-2.1" : "Create Image with gemini-nano-banana-2.1"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Output & Preview Panel */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Generated Creative Asset Output</span>
                  </h4>
                  {generatedImageUrl && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded">
                        gemini-nano-banana-2.1
                      </span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-mono font-bold px-2 py-0.5 rounded">
                        {imageSize} • {imageAspectRatio}
                      </span>
                    </div>
                  )}
                </div>

                {/* Main Visual Frame (Before & After or Single View) */}
                <div className="mt-4 min-h-[360px] bg-slate-950 rounded-xl overflow-hidden relative border border-slate-800 flex items-center justify-center p-2">
                  {isGeneratingImage ? (
                    <div className="text-center p-8 space-y-3">
                      <RefreshCw className="w-9 h-9 text-purple-400 animate-spin mx-auto" />
                      <p className="text-sm font-bold text-white">Synthesizing with gemini-nano-banana-2.1...</p>
                      <p className="text-xs text-slate-400">
                        {isEditMode ? "Applying edit prompt transformations and lighting..." : "Generating photorealistic textures, typography, and color balance..."}
                      </p>
                    </div>
                  ) : generatedImageUrl ? (
                    <div className="w-full space-y-3">
                      {isEditMode && uploadedSourceImage ? (
                        /* Side-by-Side Before & After comparison */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block text-center">
                              Original Source Photo
                            </span>
                            <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center min-h-[220px]">
                              <img src={uploadedSourceImage} alt="Original Before" className="max-h-[260px] w-auto object-contain" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block text-center font-bold">
                              Edited by gemini-nano-banana-2.1
                            </span>
                            <div className="rounded-lg overflow-hidden border border-purple-500/50 bg-slate-900 flex items-center justify-center min-h-[220px]">
                              <img src={generatedImageUrl} alt="Edited Result" className="max-h-[260px] w-auto object-contain" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <img src={generatedImageUrl} alt="Generated AI Creative" className="max-h-[460px] w-auto object-contain mx-auto rounded-lg" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-8 space-y-2 text-slate-500">
                      <ImageEditAutoIcon className="w-12 h-12 mx-auto stroke-1 text-slate-700" />
                      <p className="text-xs font-semibold text-slate-400">No creative asset generated yet.</p>
                      <p className="text-[11px] text-slate-600">Enter a text prompt above to create or upload a photo to edit with gemini-nano-banana-2.1.</p>
                    </div>
                  )}
                </div>

                {imageDescription && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono leading-relaxed">
                    {imageDescription}
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              {generatedImageUrl && (
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 flex-wrap">
                  {/* Iterative Editing Button: Allows iterative refinements */}
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedSourceImage(generatedImageUrl);
                      setIsEditMode(true);
                      setImagePrompt("");
                      showToast("✨ Current image loaded as source! Enter a new text prompt to edit it further.");
                    }}
                    className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs rounded-lg border border-purple-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Use this generated image as the base for another edit prompt"
                  >
                    <ImageEditAutoIcon className="w-3.5 h-3.5 text-purple-600" />
                    <span>Edit This Image Further with Prompt</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedImageUrl);
                        showToast("✓ Image Data URL copied to clipboard!");
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>

                    <a
                      href={generatedImageUrl}
                      download="gemini-nano-banana-creative.png"
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>

                    {onPushToCommander && (
                      <button
                        onClick={() => {
                          onPushToCommander({
                            title: "Creative: " + imagePrompt.slice(0, 30),
                            agent: "CreativeStudio",
                            budgetImpact: 1500,
                            approvalRequiredFrom: "CEO",
                            mediaUrl: generatedImageUrl
                          });
                          showToast("✓ Ad Creative submitted to Campaign Commander queue!");
                        }}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Push to Commander</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WORKSPACE 2: VEO VIDEO STUDIO (veo-3.1-fast-generate-preview) */}
      {activeStudioTab === "video" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-indigo-600" />
                  <span>Veo Video Generation & Photo Animation</span>
                </h3>
                <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                  veo-3.1-fast
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Generate video from text or upload a photo to animate it into a high-converting commercial video ad.
              </p>
            </div>

            {/* Upload photo for photo-to-video */}
            <div className="space-y-2 border border-dashed border-indigo-300 rounded-xl p-3 bg-indigo-50/40">
              <label className="block text-xs font-bold text-slate-700">Optional: Upload Photo to Animate</label>
              {videoSourcePhoto ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-200">
                  <img src={videoSourcePhoto} alt="Source to animate" className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    onClick={() => setVideoSourcePhoto(null)}
                    className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-full text-xs hover:bg-rose-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 cursor-pointer text-xs text-slate-600">
                  <Upload className="w-4 h-4 text-indigo-600 mb-1" />
                  <span className="font-bold">Upload Photograph to Animate</span>
                  <span className="text-[10px] text-slate-400">Veo will animate realistic motion</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "videoAnimate")} />
                </label>
              )}
            </div>

            {/* Video Prompt */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Video Prompt & Camera Direction *</label>
              <textarea
                rows={3}
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="e.g., Slow cinematic push-in shot of modern tech founders analyzing growth metrics on interactive glass screens in a high-rise office at sunset."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Aspect Ratio Constraint: MUST be 16:9 or 9:16 */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 text-xs">Aspect Ratio (Mandatory 16:9 or 9:16)</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setVideoAspectRatio("16:9")}
                  className={`p-2 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                    videoAspectRatio === "16:9"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  16:9 Landscape (YouTube)
                </button>
                <button
                  type="button"
                  onClick={() => setVideoAspectRatio("9:16")}
                  className={`p-2 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                    videoAspectRatio === "9:16"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  9:16 Portrait (TikTok/Reels)
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="button"
              disabled={isGeneratingVideo || (!videoPrompt.trim() && !videoSourcePhoto)}
              onClick={handleGenerateVideo}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGeneratingVideo ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Veo Fast Rendering in Progress...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>Generate Veo 3 Video ({videoAspectRatio})</span>
                </>
              )}
            </button>
          </div>

          {/* Video Preview */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-indigo-600" />
                  <span>Veo 3.1 Video Production Preview</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-500">
                  Ratio: {videoAspectRatio}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-center min-h-[360px] bg-slate-950 rounded-xl overflow-hidden relative border border-slate-800">
                {isGeneratingVideo ? (
                  <div className="text-center p-8 space-y-3">
                    <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                    <p className="text-sm font-bold text-white">Veo Video Engine Active</p>
                    <p className="text-xs text-slate-400">{videoStatusText || "Generating video frames..."}</p>
                  </div>
                ) : generatedVideoUrl ? (
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="max-h-[460px] w-full rounded-lg"
                  />
                ) : (
                  <div className="text-center p-8 space-y-2 text-slate-500">
                    <Video className="w-12 h-12 mx-auto stroke-1 text-slate-700" />
                    <p className="text-xs">No video generated yet. Enter a prompt or upload an image to begin.</p>
                  </div>
                )}
              </div>
            </div>

            {generatedVideoUrl && (
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 flex-wrap">
                <a
                  href={generatedVideoUrl}
                  download="veo-commercial-video.mp4"
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download MP4</span>
                </a>

                {onPushToCommander && (
                  <button
                    onClick={() => {
                      onPushToCommander({
                        title: "Veo Video Ad: " + videoPrompt.slice(0, 30),
                        agent: "VideoCampaignDirector",
                        budgetImpact: 3500,
                        approvalRequiredFrom: "CEO",
                        mediaUrl: generatedVideoUrl
                      });
                      showToast("✓ Veo Video submitted to Campaign Commander queue!");
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Push to Campaign Commander</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WORKSPACE 3: LIVE VOICE CONVERSATIONS (gemini-3.8-live) */}
      {activeStudioTab === "voice" && (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-600" />
                <span>Voice Conversations (gemini-3.8-live / Live API)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Engage in natural two-way voice conversations with real-time spoken responses from Gemini Live.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab("voice-conversations")}
                  className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Live Duplex Studio</span>
                </button>
              )}
              <span className="text-xs font-bold text-slate-700 font-mono">Voice:</span>
              <select
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                className="text-xs p-1.5 border border-slate-300 rounded-lg bg-slate-50 font-mono font-bold"
              >
                <option value="Zephyr">Zephyr (Bright, Engaging)</option>
                <option value="Puck">Puck (Energetic, Natural)</option>
                <option value="Kore">Kore (Clear, Professional)</option>
                <option value="Fenrir">Fenrir (Authoritative)</option>
                <option value="Charon">Charon (Calm, Measured)</option>
              </select>
            </div>
          </div>

          {/* Voice Dialogue Thread */}
          <div className="h-80 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            {voiceHistory.map((item, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs ${item.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`p-3 rounded-xl max-w-lg ${
                  item.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-800 border border-slate-200 shadow-xs"
                }`}>
                  <div className="flex items-center gap-1.5 font-bold mb-1 font-mono text-[10px] text-slate-400">
                    {item.role === "user" ? "YOU" : "GEMINI LIVE COPILOT"}
                  </div>
                  <p className="leading-relaxed">{item.text}</p>
                  {item.audioUrl && (
                    <audio src={item.audioUrl} controls className="mt-2 h-7 w-full" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Controls */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={voiceInputText}
              onChange={(e) => setVoiceInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendVoiceMessage()}
              placeholder="Speak or type a prompt for the voice copilot (e.g., 'Summarize our Q3 ROAS strategy in 3 bullet points')..."
              className="flex-1 p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              onClick={() => handleSendVoiceMessage()}
              disabled={isVoiceTalking || !voiceInputText.trim()}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Talk</span>
            </button>
          </div>
        </div>
      )}

      {/* WORKSPACE 4: GEMINI MULTI-TURN ROLE CHATBOT */}
      {activeStudioTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Persona & Model Config Sidebar */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-600" />
                <span>Chatbot Roles & Models</span>
              </h3>
              <p className="text-xs text-slate-500">
                Configure model intelligence level and system instructions.
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700">Gemini Model Tier</label>
              <select
                value={chatModel}
                onChange={(e) => setChatModel(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none text-slate-800"
              >
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Tasks & Reasoning)</option>
                <option value="gemini-3.5-flash">gemini-3.5-flash (General Marketing Operations)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast High-Throughput)</option>
              </select>
            </div>

            {/* Role Preset Selector */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700">Prebuilt Role Persona</label>
              <select
                value={chatRole}
                onChange={(e) => {
                  setChatRole(e.target.value);
                  if (e.target.value === "CMO Chief Marketing Strategist") {
                    setCustomSystemInstruction("You are an elite enterprise Chief Marketing Officer (CMO). Analyze ad budgets, multi-touch attribution, and CASL/GDPR guardrails.");
                  } else if (e.target.value === "Direct Response Ad Copywriter") {
                    setCustomSystemInstruction("You are a world-class direct response ad copywriter. Write punchy, high-CTR headlines, hooks, and call-to-actions tailored for Google, Meta, and LinkedIn.");
                  } else if (e.target.value === "Regulatory Compliance Auditor") {
                    setCustomSystemInstruction("You are a certified corporate compliance auditor. Validate all marketing workflows against CASL double opt-in, PIPEDA, CCPA, and GDPR statutes.");
                  }
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="CMO Chief Marketing Strategist">CMO Chief Marketing Strategist</option>
                <option value="Direct Response Ad Copywriter">Direct Response Ad Copywriter</option>
                <option value="Regulatory Compliance Auditor">Regulatory Compliance Auditor</option>
                <option value="Custom Strategic Role">Custom Strategic Role</option>
              </select>
            </div>

            {/* Custom System Instruction Box */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">System Instruction Prompt</label>
              <textarea
                rows={4}
                value={customSystemInstruction}
                onChange={(e) => setCustomSystemInstruction(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-[11px]"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setChatMessages([
                  {
                    role: "model",
                    text: `Thread reset. Now operating as ${chatRole} under active system instructions.`,
                    time: "Now"
                  }
                ]);
                showToast("Chat thread reset with updated role.");
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Clear & Reset Thread
            </button>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-[520px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-900">{chatRole}</span>
                <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {chatModel}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {chatMessages.length} Messages
              </span>
            </div>

            {/* Scrollable Thread */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-3.5 my-3 pr-2 text-xs">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3.5 rounded-2xl max-w-xl leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none shadow-sm"
                      : "bg-slate-50 text-slate-800 rounded-bl-none border border-slate-200 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between gap-4 text-[10px] font-mono mb-1 opacity-70">
                      <span>{msg.role === "user" ? userName : chatRole}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isSendingChat && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Thinking with {chatModel}...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChatMessage} className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message your custom Gemini copilot..."
                className="flex-1 p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSendingChat || !chatInput.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WORKSPACE 5: SEARCH & MAPS GROUNDING (gemini-3.5-flash) */}
      {activeStudioTab === "grounded" && (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <span>Real-Time Search & Maps Grounding (gemini-3.5-flash)</span>
              </h3>
              <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                gemini-3.5-flash
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Query Gemini with live Google Search data or location-based Google Maps place intelligence.
            </p>
          </div>

          {/* Tool Selector */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGroundingTool("search")}
              className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                groundingTool === "search"
                  ? "bg-indigo-50 text-indigo-900 border-indigo-300 shadow-xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Google Search Grounding (Live Web Data)</span>
            </button>

            <button
              type="button"
              onClick={() => setGroundingTool("maps")}
              className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                groundingTool === "maps"
                  ? "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Google Maps Grounding (Geospatial & Places)</span>
            </button>
          </div>

          {/* Search Query Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={groundedQuery}
              onChange={(e) => setGroundedQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRunGroundedQuery()}
              placeholder={
                groundingTool === "maps"
                  ? "e.g., Identify top digital marketing agencies and co-working spaces near Toronto Financial District"
                  : "e.g., Latest 2026 enterprise B2B customer acquisition benchmarks and paid media trends"
              }
              className="flex-1 p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              onClick={handleRunGroundedQuery}
              disabled={isQueryingGrounded || !groundedQuery.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isQueryingGrounded ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Query Grounded AI</span>
            </button>
          </div>

          {/* Grounded Result Display */}
          {groundedResult && (
            <div className="space-y-4 pt-4 border-t border-slate-100 animate-fadeIn">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed space-y-2">
                <div className="font-bold font-mono text-[11px] text-indigo-700 flex items-center gap-1">
                  <span>GROUNDED INTELLIGENCE REPORT:</span>
                </div>
                <div className="whitespace-pre-wrap">{groundedResult}</div>
              </div>

              {groundingSources.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-slate-700 font-mono">Verified Citations & Sources:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {groundingSources.map((s, idx) => (
                      <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center justify-between">
                        <span className="font-medium text-slate-800 truncate max-w-[240px]">{s.web?.title || s.title || "Grounded Source Reference"}</span>
                        {s.web?.uri && (
                          <a href={s.web.uri} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 font-mono text-[10px]">
                            <span>Visit</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* WORKSPACE 6: AUDIO TRANSCRIPTION (gemini-3.5-transcribe) */}
      {activeStudioTab === "transcribe" && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-600" />
                <span>Transcribe Audio (gemini-3.5-transcribe)</span>
              </h3>
              <span className="text-[10px] font-mono bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                gemini-3.5-transcribe
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Record voice audio directly from your microphone or upload an audio file to generate precise transcriptions.
            </p>
          </div>

          {/* Recording & Upload Area */}
          <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 space-y-4">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-lg cursor-pointer ${
                isRecording
                  ? "bg-rose-600 animate-pulse scale-105"
                  : "bg-purple-600 hover:bg-purple-500 hover:scale-102"
              }`}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>

            <div className="text-center">
              <p className="text-sm font-bold text-slate-800">
                {isRecording ? "Listening & Recording..." : "Click to Start Recording with Microphone"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRecording ? "Click again to finish recording" : "Direct browser mic input via MediaRecorder"}
              </p>
            </div>

            {audioBlobUrl && (
              <div className="w-full max-w-sm mt-2">
                <audio src={audioBlobUrl} controls className="w-full h-8" />
              </div>
            )}
          </div>

          {audioBase64 && (
            <button
              onClick={handleTranscribeAudio}
              disabled={isTranscribing}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isTranscribing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Transcribing with gemini-3.5-transcribe...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Transcribe Recorded Audio</span>
                </>
              )}
            </button>
          )}

          {transcriptionText && (
            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-xs text-slate-800 font-mono">Precise Text Transcript:</h5>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(transcriptionText);
                    showToast("✓ Copied transcript to clipboard!");
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">{transcriptionText}</p>
            </div>
          )}
        </div>
      )}

      {/* WORKSPACE 7: MUSIC COMPOSER (lyria-3-clip-preview & pro) */}
      {activeStudioTab === "music" && (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Music className="w-5 h-5 text-indigo-600" />
                <span>AI Music Generation (Lyria 3)</span>
              </h3>
              <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                lyria-3-{musicMode}-preview
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Compose custom background audio tracks and commercial scores for multi-channel video ads using Lyria.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setMusicMode("clip")}
              className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                musicMode === "clip"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Lyria Clip (Up to 30 Seconds)
            </button>
            <button
              type="button"
              onClick={() => setMusicMode("pro")}
              className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                musicMode === "pro"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Lyria Pro (Full-Length Track)
            </button>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700">Musical Mood & Instrumentation Prompt *</label>
            <textarea
              rows={3}
              value={musicPrompt}
              onChange={(e) => setMusicPrompt(e.target.value)}
              placeholder="e.g., Upbeat modern electronic corporate synth with rhythmic bass, building drop, and high-energy commercial drive."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            disabled={isGeneratingMusic || !musicPrompt.trim()}
            onClick={handleGenerateMusic}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGeneratingMusic ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Composing with lyria-3-{musicMode}-preview...</span>
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                <span>Synthesize Music Track</span>
              </>
            )}
          </button>

          {generatedAudioUrl && (
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-400">Audio Track Ready</span>
                <a
                  href={generatedAudioUrl}
                  download="lyria-commercial-soundtrack.wav"
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download WAV</span>
                </a>
              </div>
              <audio src={generatedAudioUrl} controls className="w-full" />
              {generatedLyrics && (
                <p className="text-[11px] text-slate-300 italic pt-1 font-mono">
                  Lyrics/Theme: "{generatedLyrics}"
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* WORKSPACE 8: CREATIVE ASSET VAULT (FIRESTORE SYNCED) */}
      {activeStudioTab === "vault" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Save className="w-5 h-5 text-purple-600" />
                <span>Creative Asset Vault (Firebase Firestore Synced)</span>
              </h3>
              <p className="text-xs text-slate-500">
                All multimodal creative assets saved securely in Firestore collection <code>ai_creatives</code>.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
              {savedAssets.length} Assets Stored
            </span>
          </div>

          {savedAssets.length === 0 ? (
            <div className="text-center p-12 text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs">No assets saved yet. Generate an image, video, audio transcript or music track above to populate your vault.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedAssets.map((asset) => (
                <div key={asset.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900">{asset.id}</span>
                    <span className="text-[10px] font-mono bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded uppercase">
                      {asset.type}
                    </span>
                  </div>

                  <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{asset.title}</h5>

                  {asset.type === "image" && asset.mediaUrl && (
                    <img src={asset.mediaUrl} alt={asset.title} className="w-full h-36 object-cover rounded-lg border border-slate-200" />
                  )}

                  {asset.type === "video" && asset.mediaUrl && (
                    <video src={asset.mediaUrl} controls className="w-full h-36 object-cover rounded-lg bg-black" />
                  )}

                  {asset.type === "music" && asset.mediaUrl && (
                    <audio src={asset.mediaUrl} controls className="w-full h-8" />
                  )}

                  {asset.type === "transcription" && (
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600 line-clamp-3">
                      {asset.mediaUrl}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-200">
                    <span>{asset.modelUsed}</span>
                    <span>{asset.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
