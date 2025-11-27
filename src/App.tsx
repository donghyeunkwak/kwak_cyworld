import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import "./index.css";

/* =========================================================
    TYPE DEFINITIONS
========================================================= */
interface VisitorCounter {
  today: number;
  total: number;
}

interface DiaryPost {
  id: string;
  date: string;
  content: string;
}

interface PhotoItem {
  id: string;
  imageUrl: string;
  caption: string;
  date: string;
}

interface GuestMessage {
  id: string;
  icon: string;
  name: string;
  msg: string;
  createdAt: number;
  date: string;
}

interface HeaderProps {
  today: number;
  total: number;
}

interface BGMPlayerProps {
  playlist: { title: string; artist: string; src: string }[];
}

/* =========================================================
    ROOT COMPONENT
========================================================= */
function App() {
  const [tab, setTab] = useState<"diary" | "photos" | "guestbook">("diary");

  const [theme, setTheme] = useState("day");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) setTheme("morning");
    else if (hour >= 11 && hour < 17) setTheme("day");
    else if (hour >= 17 && hour < 20) setTheme("evening");
    else setTheme("night");
  }, []);

  /* 방문자 */
  const [today, setToday] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadVisitors = async () => {
      try {
        const snap = await getDoc(doc(db, "visitors", "counter"));
        if (snap.exists()) {
          const data = snap.data() as VisitorCounter;
          setToday(data.today ?? 0);
          setTotal(data.total ?? 0);
        }
      } catch (e) {
        console.error("🔥 방문자 로드 실패:", e);
      }
    };
    loadVisitors();
  }, []);

  /* BGM */
  const bgmList = [
    { title: "나는...", artist: "mc몽", src: "/bgm1.mp3" },
    { title: "비행기", artist: "거북이", src: "/bgm2.mp3" },
    { title: "봄이여오라", artist: "mc스나이퍼", src: "/bgm3.mp3" },
    { title: "너에게쓰는편지", artist: "mc몽", src: "/bgm4.mp3" },
  ];

  return (
    <div
      className={
        "min-h-screen flex flex-col transition-all duration-700 " +
        (theme === "morning"
          ? "bg-morning text-[#4a2a2a]"
          : theme === "day"
          ? "bg-day text-[#4a2a2a]"
          : theme === "evening"
          ? "bg-evening text-[#4a2a2a]"
          : "bg-night text-white")
      }
    >
      <Header today={today} total={total} />

      {/* Tabs */}
      <nav className="mt-4 mx-4 glass flex justify-around border border-white/40 rounded-2xl py-3 text-sm font-semibold text-pink-700 shadow-md">
        <button
          onClick={() => setTab("diary")}
          className={tab === "diary" ? "text-pink-900" : "opacity-60"}
        >
          📒 다이어리
        </button>
        <button
          onClick={() => setTab("photos")}
          className={tab === "photos" ? "text-pink-900" : "opacity-60"}
        >
          🖼 사진첩
        </button>
        <button
          onClick={() => setTab("guestbook")}
          className={tab === "guestbook" ? "text-pink-900" : "opacity-60"}
        >
          💬 방명록
        </button>
      </nav>

      <main className="flex-1 p-6 pb-28">
        <AnimatePresence mode="wait">
          {tab === "diary" && (
            <motion.div key="diary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <DiaryPage />
            </motion.div>
          )}
          {tab === "photos" && (
            <motion.div key="photos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <PhotosPage />
            </motion.div>
          )}
          {tab === "guestbook" && (
            <motion.div key="guestbook" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GuestbookPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BGMPlayer playlist={bgmList} />
    </div>
  );
}

/* =========================================================
    HEADER
========================================================= */

function Header({ today, total }: HeaderProps) {
  return (
    <header className="relative w-full px-6 py-7 glass-pink shadow-xl rounded-b-3xl border border-white/40 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-pink-200/30 opacity-60" />

      <div className="relative flex items-center space-x-5">
        <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg ring-2 ring-white/50">
          <img src="/profile.jpg" className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-pink-900">곽동현 (east_hyeun)</h1>
          <p className="text-sm text-pink-800/90 mt-1 glass px-3 py-1 rounded-full">
            오늘도 즐기며 재밌게 살자.
          </p>
        </div>
      </div>

      <div className="absolute right-6 top-6 flex space-x-3 text-[11px] font-semibold">
        <span className="px-3 py-1 rounded-full glass text-pink-900">
          TODAY {String(today).padStart(3, "0")}
        </span>
        <span className="px-3 py-1 rounded-full glass text-pink-900">
          TOTAL {String(total).padStart(3, "0")}
        </span>
      </div>
    </header>
  );
}

/* =========================================================
    DIARY PAGE
========================================================= */

function DiaryPage() {
  const [posts, setPosts] = useState<DiaryPost[]>([]);

  useEffect(() => {
    const loadDiary = async () => {
      const snap = await getDocs(collection(db, "diary", "kwak", "posts"));

      const list = snap.docs.map((d) => {
        const data = d.data() as Omit<DiaryPost, "id">;
        return { id: d.id, ...data };
      });

      setPosts(list);
    };

    loadDiary();
  }, []);

  return (
    <div className="space-y-16">
      {posts.map((p) => (
        <div key={p.id}>
          <p className="text-sm mb-3">{p.date}</p>
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 h-full w-[2px] bg-pink-300/80"></div>
            <p className="whitespace-pre-line text-[15px]">{p.content}</p>
          </div>
          <div className="mt-4 relative pl-10">
            <div className="absolute left-4 h-6 w-[2px] bg-pink-300/50"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
    PHOTOS PAGE
========================================================= */

function PhotosPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  useEffect(() => {
    const loadPhotos = async () => {
      const snap = await getDocs(collection(db, "photos", "kwak", "list"));

      const list = snap.docs.map((d) => {
        const data = d.data() as Omit<PhotoItem, "id">;
        return { id: d.id, ...data };
      });

      setPhotos(list);
    };

    loadPhotos();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      {photos.map((p) => (
        <div key={p.id} className="glass-pink rounded-2xl border p-2 shadow-md">
          <div className="w-full aspect-square overflow-hidden rounded-lg">
            <img src={p.imageUrl} className="w-full h-full object-cover" />
          </div>

          <p className="mt-1 text-[13px] font-semibold truncate">{p.caption}</p>
          <p className="text-[10px] text-pink-500">{p.date}</p>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
    GUESTBOOK PAGE
========================================================= */

function GuestbookPage() {
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [emoji, setEmoji] = useState("🔥");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  /* LOAD */
  useEffect(() => {
    const loadGuestbook = async () => {
      const snap = await getDocs(collection(db, "guestbook"));

      const list = snap.docs
        .map((d) => {
          const data = d.data() as Omit<GuestMessage, "id">;
          return { id: d.id, ...data };
        })
        .sort((a, b) => b.createdAt - a.createdAt);

      setMessages(list);
    };

    loadGuestbook();
  }, []);

  /* ADD */
  const addMessage = async () => {
    if (!name.trim() || !msg.trim()) return;

    const now = Date.now();
    const dateStr = new Date(now).toISOString().slice(0, 10);

    try {
      const newItem: Omit<GuestMessage, "id"> = {
        icon: emoji,
        name,
        msg,
        createdAt: now,
        date: dateStr,
      };

      const ref = await addDoc(collection(db, "guestbook"), newItem);

      setMessages([{ id: ref.id, ...newItem }, ...messages]);
      setName("");
      setMsg("");
    } catch (e) {
      console.error("🔥 guestbook 저장 실패:", e);
    }
  };

  return (
    <div className="space-y-5">
      <div className="glass-pink p-4 rounded-2xl shadow-md border">
        <div className="flex gap-3 mb-3">
          <select
            className="border border-pink-300 rounded-lg px-2 py-1 text-pink-700 bg-pink-50"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
          >
            <option>🔥</option>
            <option>🐶</option>
            <option>😊</option>
            <option>💗</option>
            <option>👍🏻</option>
            <option>✨</option>
          </select>

          <input
            type="text"
            placeholder="닉네임"
            className="flex-1 border border-pink-300 rounded-lg px-3 py-1 bg-pink-50 text-pink-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <textarea
          placeholder="메시지를 남겨주세요"
          className="w-full border border-pink-300 rounded-lg px-3 py-2 h-20 bg-pink-50 text-pink-700 resize-none"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />

        <button
          onClick={addMessage}
          className="w-full mt-3 bg-pink-500 text-white py-2 rounded-lg shadow hover:bg-pink-600 transition"
        >
          방명록 남기기 💬
        </button>
      </div>

      {messages.map((m) => (
        <div key={m.id} className="glass-pink p-4 rounded-2xl shadow-md border">
          <div className="flex justify-between">
            <span className="font-semibold text-pink-800">
              {m.icon} {m.name}
            </span>
            <span className="text-xs text-pink-400">{m.date}</span>
          </div>

          <p className="mt-2 whitespace-pre-line text-gray-900">{m.msg}</p>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
    BGM PLAYER
========================================================= */

function BGMPlayer({ playlist }: BGMPlayerProps) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const current = playlist[index];

  /* INIT */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audioCtxRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AC();
    }

    if (!analyserRef.current) {
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;

      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    }

    drawWave();
  }, []);

  /* Track Change */
  useEffect(() => {
    const audio = audioRef.current;
    const ctx = audioCtxRef.current;

    if (!audio || !ctx) return;

    if (!sourceRef.current) {
      sourceRef.current = ctx.createMediaElementSource(audio);
      sourceRef.current.connect(analyserRef.current!);
      analyserRef.current!.connect(ctx.destination);
    }

    const autoPlay = async () => {
      try {
        audio.muted = true;
        await audio.play();
        audio.muted = false;
        setIsPlaying(true);
      } catch {}
    };

    autoPlay();
  }, [index]);

  const drawWave = () => {
    requestAnimationFrame(drawWave);

    const canvas = canvasRef.current;
    const analyser = analyserRef.current;

    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const arr = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(arr);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barCount = 12;
    const barWidth = (canvas.width / barCount) * 1.4;

    for (let i = 0; i < barCount; i++) {
      const v = arr[i * 2];
      const h = (v / 255) * canvas.height;

      ctx.fillStyle = "rgba(255, 90, 160, 0.9)";
      ctx.shadowBlur = 6;
      ctx.shadowColor = "rgba(255, 140, 200, 1)";
      ctx.fillRect(i * barWidth + 2, canvas.height - h, barWidth - 4, h);
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    const ctx = audioCtxRef.current;
    if (!audio || !ctx) return;

    if (ctx.state === "suspended") await ctx.resume();

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (e) {
        console.log("재생 실패:", e);
      }
    }
  };

  const nextTrack = () => {
    setIndex((i) => (i + 1) % playlist.length);
  };

  const onTimeUpdate = (e: any) => {
    const audio = e.target;
    if (!audio.duration) return;

    setProgress((audio.currentTime / audio.duration) * 100);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full pointer-events-none">
      <div className="px-4 pb-4 pointer-events-auto">
        <div className="glass-pink rounded-2xl border shadow-xl px-4 py-3 flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full border-[3px] border-pink-400 blur-sm opacity-70 ${
                isPlaying ? "animate-spin-slow" : ""
              }`}
            />
            <div
              className={`absolute inset-0 rounded-full border border-pink-300 ${
                isPlaying ? "animate-spin-slower" : ""
              }`}
            />
            <div className="w-5 h-5 rounded-full bg-pink-200/60 backdrop-blur-md"></div>
          </div>

          <canvas ref={canvasRef} width={110} height={28} className="rounded" />

          <div className="flex-1 flex flex-col">
            <p className="text-sm font-bold truncate">{current.title}</p>
            <p className="text-[10px] opacity-80 truncate">{current.artist}</p>
          </div>

          <button onClick={togglePlay} className="w-8 h-8 bg-white rounded-full text-pink-600">
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            onClick={nextTrack}
            className="px-2 py-1 bg-pink-500 text-white text-[11px] rounded-full"
          >
            ▶
          </button>
        </div>

        <div className="mt-1 w-full h-1 bg-pink-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-pink-600"
            style={{ width: `${progress}%` }}
          />
        </div>

        <audio
          ref={audioRef}
          src={current.src}
          playsInline
          onTimeUpdate={onTimeUpdate}
          onEnded={nextTrack}
        />
      </div>
    </div>
  );
}

export default App;
