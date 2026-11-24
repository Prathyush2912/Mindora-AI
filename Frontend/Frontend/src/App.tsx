
import { useEffect, useMemo, useState } from "react";
import type { ReactNode, CSSProperties } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./Auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { createWorker } from "tesseract.js";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
type Page =
  | "Dashboard"
  | "My Notes"
  | "AI Summaries"
  | "Flashcards"
  | "Quizzes"
  | "Progress"
  | "Settings";

type Note = {
  id: string;
  title: string;
  type: string;
  size: string;
  date: string;
  color: string;
  file_path?: string | null;
};

type Summary = {
  id: string;
  material_id: string;
  title: string;
  content: string;
  created_at: string;
};

type Deck = {
  id: string;
  material_id: string;
  title: string;
  description: string | null;
  flashcards: Flashcard[];
};

type Flashcard = {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  card_order: number;
};

type Quiz = {
  id: string;
  material_id: string;
  title: string;
  description: string | null;
  quiz_questions: {
    id: string;
    question: string;
    options: string[];
    question_order: number;
  }[];
};

const colors = ["#8B7CF6", "#60A5FA", "#34D399", "#F59E8B"];

const icons: Record<string, ReactNode> = {
  Dashboard: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  "My Notes": <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H18v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 4.5v17M8 7h6M8 11h7"/></>,
  "AI Summaries": <><path d="m12 3 1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4z"/><path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8zM18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z"/></>,
  Flashcards: <><rect x="3" y="5" width="16" height="14" rx="3"/><path d="m7 5 1-2h11a2 2 0 0 1 2 2v11l-2 1"/></>,
  Quizzes: <><path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h3"/></>,
  Progress: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/><path d="M2 19h21"/></>,
  Settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/></>,
  Search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  Bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  Plus: <><path d="M12 5v14M5 12h14"/></>,
  Upload: <><path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M4 15v5h16v-5"/></>,
  Play: <path d="m8 5 11 7-11 7z"/>,
  More: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  Check: <path d="m5 12 4 4L19 6"/>,
  Trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14"/></>,
  Edit: <><path d="m14 5 5 5L9 20H4v-5zM13 6l5 5"/></>,
  Menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  Close: <><path d="m6 6 12 12M18 6 6 18"/></>,
};

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden>
      {icons[name] || <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}

function Button({
  children,
  onClick,
  secondary = false,
  className = "",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button disabled={disabled} onClick={onClick}
      className={`${secondary ? "btn-secondary" : "btn-primary"} ${className}`}>
      {children}
    </button>
  );
}

function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div onClick={onClick}
      className={`panel ${onClick ? "clickable" : ""} ${className}`}>
      {children}
    </div>
  );
}

function Tag({ children, color = "purple" }: { children: ReactNode; color?: string }) {
  return <span className={`tag tag-${color}`}>{children}</span>;
}

function LogoMark() {
  return <div className="logo-mark"><div /><div /><div /></div>;
}

function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Sidebar({
  page,
  navigate,
  open,
  close,
  userName,
  email,
}: {
  page: Page;
  navigate: (p: Page) => void;
  open: boolean;
  close: () => void;
  userName: string;
  email: string;
}) {
  const pages: Page[] = [
    "Dashboard",
    "My Notes",
    "AI Summaries",
    "Flashcards",
    "Quizzes",
    "Progress",
  ];

  const initials = userName
    .split(" ")
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return <>
    {open && <div className="scrim" onClick={close} />}
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand">
        <LogoMark />
        <span>Mindora <b>AI</b></span>
        <button className="sidebar-close" onClick={close}><Icon name="Close" /></button>
      </div>
      <div className="nav-label">WORKSPACE</div>
      <nav>
        {pages.map(p => (
          <button key={p} className={page === p ? "active" : ""}
            onClick={() => navigate(p)}>
            <Icon name={p} />{p}
          </button>
        ))}
      </nav>
      <div className="sidebar-spacer" />
      <nav className="bottom-nav">
        <button className={page === "Settings" ? "active" : ""}
          onClick={() => navigate("Settings")}>
          <Icon name="Settings" />Settings
        </button>
      </nav>
      <div className="user-card">
        <div className="avatar">{initials || "U"}</div>
        <div><b>{userName}</b><span>{email}</span></div>
        <Icon name="More" />
      </div>
    </aside>
  </>;
}

function App() {
  const [session, setSession] = useState<import("@supabase/supabase-js").Session | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [page, setPage] = useState<Page>("Dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"upload" | "rename" | "delete" | "summary" | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Student");

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) console.error("Session error:", error.message);
      setSession(data.session);
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setNotes([]);
      return;
    }

    const loadNotes = async () => {
      const { data, error } = await supabase
        .from("study_materials")
        .select("id,title,file_type,file_name,file_path,created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Could not load notes:", error.message);
        notify("Could not load your notes");
        return;
      }

      setNotes((data || []).map((item, index) => ({
        id: item.id,
        title: item.title,
        type: item.file_type?.toUpperCase() || "FILE",
        size: item.file_name || "Study material",
        date: new Date(item.created_at).toLocaleDateString(),
        color: colors[index % colors.length],
        file_path: item.file_path,
      })));
    };

    void loadNotes();
  }, [session]);

  useEffect(() => {
    if (!session?.user) return;

    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", session.user.id)
        .maybeSingle();

      const name =
        data?.display_name ||
        session.user.user_metadata?.full_name ||
        session.user.email?.split("@")[0] ||
        "Student";

      setUserName(name);
    };

    void loadProfile();
  }, [session]);

  const navigate = (nextPage: Page) => {
    setPage(nextPage);
    setMobileOpen(false);
  };

  const openModal = (
    kind: "upload" | "rename" | "delete" | "summary",
    note?: Note
  ) => {
    setSelectedNote(note || null);
    setModal(kind);
  };

  const refreshNotes = async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("study_materials")
      .select("id,title,file_type,file_name,file_path,created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      notify("Refresh failed: " + error.message);
      return;
    }

    setNotes((data || []).map((item, index) => ({
      id: item.id,
      title: item.title,
      type: item.file_type?.toUpperCase() || "FILE",
      size: item.file_name || "Study material",
      date: new Date(item.created_at).toLocaleDateString(),
      color: colors[index % colors.length],
      file_path: item.file_path,
    })));
  };


const uploadNote = async (file: File, title: string) => {
  if (!session?.user) return;

  if (file.size > 20 * 1024 * 1024) {
    notify("File must be smaller than 20 MB");
    return;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  if (!["pdf", "txt"].includes(extension)) {
    notify("Only PDF and TXT files are supported.");
    return;
  }

  setLoading(true);

  const fileType = extension === "pdf" ? "pdf" : "txt";
  const path = `${session.user.id}/${crypto.randomUUID()}_${file.name}`;

  const { error: storageError } = await supabase.storage
    .from("Study-materials")
    .upload(path, file, { upsert: false });

  if (storageError) {
    setLoading(false);
    notify("Upload failed: " + storageError.message);
    return;
  }

  let extractedText: string | null = null;

  try {
    if (extension === "txt") {
      extractedText = await file.text();
    }

    if (extension === "pdf") {
      const pdf = await pdfjsLib.getDocument({
        data: await file.arrayBuffer(),
      }).promise;

      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        const pageText = content.items
          .map(item => "str" in item ? item.str : "")
          .join(" ");

        pages.push(pageText);
      }

      extractedText = pages.join("\n\n").trim();

      // If the PDF has no selectable text, use OCR.
      if (extractedText.length < 50) {
        if (pdf.numPages > 10) {
          throw new Error(
            "Scanned PDFs are currently limited to 10 pages for OCR."
          );
        }

        const worker = await createWorker("eng");

        try {
          const ocrPages: string[] = [];

          for (let i = 1; i <= pdf.numPages; i++) {
            notify(`Reading scanned PDF: page ${i} of ${pdf.numPages}`);

            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = document.createElement("canvas");
            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);

            const context = canvas.getContext("2d");

            if (!context) {
              throw new Error("Could not prepare PDF page for OCR.");
            }

            await page.render({
              canvas,
              canvasContext: context,
              viewport,
            }).promise;

            const result = await worker.recognize(canvas);
            ocrPages.push(result.data.text);

            canvas.width = 0;
            canvas.height = 0;
          }

          extractedText = ocrPages.join("\n\n").trim();
        } finally {
          await worker.terminate();
        }
      }
    }

    if (!extractedText?.trim()) {
      throw new Error("No readable text could be extracted from this file.");
    }
  } catch (error) {
    await supabase.storage
      .from("Study-materials")
      .remove([path]);

    setLoading(false);
    notify(
      error instanceof Error
        ? error.message
        : "Could not read this file."
    );
    return;
  }

 const { error: insertError } = await supabase
  .from("study_materials")
  .insert({
    user_id: session.user.id,
    title: title.trim(),
    file_name: file.name,
    file_path: path,
    file_type: fileType,
    extracted_text: extractedText,
    processing_status: "completed",
  });

if (insertError) {
  await supabase.storage
    .from("Study-materials")
    .remove([path]);

  setLoading(false);
  notify("Could not save file details: " + insertError.message);
  return;
}

setLoading(false);
setModal(null);
await refreshNotes();
notify("Study material uploaded");
};

  const renameNote = async (title: string) => {
    if (!selectedNote || !session?.user || !title.trim()) return;

    setLoading(true);

    const { error } = await supabase
      .from("study_materials")
      .update({ title: title.trim() })
      .eq("id", selectedNote.id)
      .eq("user_id", session.user.id);

    setLoading(false);

    if (error) {
      notify("Rename failed: " + error.message);
      return;
    }

    setModal(null);
    await refreshNotes();
    notify("Note renamed");
  };

  const deleteNote = async () => {
    if (!selectedNote || !session?.user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("study_materials")
      .select("file_path")
      .eq("id", selectedNote.id)
      .eq("user_id", session.user.id)
      .single();

    if (error) {
      setLoading(false);
      notify("Could not find that note: " + error.message);
      return;
    }

    const { error: deleteError } = await supabase
      .from("study_materials")
      .delete()
      .eq("id", selectedNote.id)
      .eq("user_id", session.user.id);

    if (deleteError) {
      setLoading(false);
      notify("Delete failed: " + deleteError.message);
      return;
    }

    if (data?.file_path) {
      const { error: storageError } = await supabase.storage
        .from("Study-materials")
        .remove([data.file_path]);

      if (storageError) {
        console.error("Storage cleanup failed:", storageError.message);
      }
    }

    setLoading(false);
    setModal(null);
    await refreshNotes();
    notify("Note deleted");
  };

  const saveSummary = async (
    materialId: string,
    title: string,
    content: string,
    summaryId?: string
  ) => {
    if (!session?.user) return false;

    const result = summaryId
      ? await supabase.from("summaries")
          .update({ title, content })
          .eq("id", summaryId)
      : await supabase.from("summaries")
          .insert({ material_id: materialId, title, content });

    if (result.error) {
      notify("Summary save failed: " + result.error.message);
      return false;
    }

    notify("Summary saved");
    return true;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) notify("Sign out failed: " + error.message);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b12] text-white">
        Loading Mindora...
      </div>
    );
  }

  if (!session) return <Auth />;

  const initials = userName.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="app-shell"
      onPointerMove={event => {
        event.currentTarget.style.setProperty("--mx", `${event.clientX}px`);
        event.currentTarget.style.setProperty("--my", `${event.clientY}px`);
      }}>
      <Sidebar
        page={page}
        navigate={navigate}
        open={mobileOpen}
        close={() => setMobileOpen(false)}
        userName={userName}
        email={session.user.email || ""}
      />

      <main className="main">
        <header className="topbar">
          <button className="icon-btn mobile-menu" onClick={() => setMobileOpen(true)}>
            <Icon name="Menu" />
          </button>
          <div className="mobile-brand"><LogoMark /> Mindora</div>
          <div className="top-search">
            <Icon name="Search" size={18} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search anything..."
              onKeyDown={e => {
                if (e.key === "Enter") navigate("My Notes");
              }} />
            <span>⌘ K</span>
          </div>
          <div className="top-actions">
            <button className="icon-btn notification" onClick={() => notify("You're all caught up!")}>
              <Icon name="Bell" /><i />
            </button>
            <button className="avatar" onClick={() => navigate("Settings")}>
              {initials || "U"}
            </button>
          </div>
        </header>

        <div className="content">
          {page === "Dashboard" && (
            <Dashboard
              navigate={navigate}
              userName={userName}
              noteCount={notes.length}
            />
          )}

          {page === "My Notes" && (
            <Notes
              notes={notes}
              search={search}
              setSearch={setSearch}
              openModal={openModal}
            />
          )}

          {page === "AI Summaries" && (
            <Summaries
              notes={notes}
              notify={notify}
              openModal={openModal}
              saveSummary={saveSummary}
            />
          )}

          {page === "Flashcards" && (
            <Flashcards notes={notes} notify={notify} />
          )}

          {page === "Quizzes" && (
            <Quizzes notes={notes} notify={notify} />
          )}

          {page === "Progress" && (
            <Progress userId={session.user.id} />
          )}

          {page === "Settings" && (
            <Settings
              user={session.user}
              userName={userName}
              setUserName={setUserName}
              notify={notify}
              signOut={signOut}
            />
          )}
        </div>
      </main>


{modal && (
  <Modal
    kind={modal}
    note={selectedNote}
    close={() => setModal(null)}
    loading={loading}
    upload={uploadNote}
    rename={renameNote}
    remove={deleteNote}
    generate={async () => {
      if (!selectedNote?.id) {
        notify("Select a note first.");
        return;
      }


notify("Generating your summary...");

      const { data, error } = await supabase.functions.invoke(
        "genrate-summary",
        {
          body: {
            material_id: selectedNote.id,
          },
        }
      );


if (error || data?.error) {
  let errorMessage = data?.error || error?.message || "Summary generation failed.";

  if (error && "context" in error) {
    try {
      const response = error.context as Response;
      const details = await response.clone().json();
      console.error("Edge Function response:", details);
      errorMessage = details.error || details.message || errorMessage;
    } catch {
      console.error("Could not read Edge Function response:", error);
    }
  }

  console.error("Summary generation error:", error);
  notify(errorMessage);
  return;
}


      setModal(null);
      notify("Summary generated and saved.");
      navigate("AI Summaries");
    }}
  />
)}


      {toast && (
        <div className="toast">
          <span><Icon name="Check" size={17} /></span>{toast}
        </div>
      )}
    </div>
  );
}

function Dashboard({
  navigate,
  userName,
  noteCount,
}: {
  navigate: (p: Page) => void;
  userName: string;
  noteCount: number;
}) {
  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Good morning" :
    now.getHours() < 18 ? "Good afternoon" : "Good evening";

  const dateLabel = now.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).toUpperCase();

  return <>
    <PageHeader
      eyebrow={dateLabel}
      title={`${greeting}, ${userName}`}
      subtitle="Ready to make progress? Pick up where you left off."
      action={<Button onClick={() => navigate("My Notes")}><Icon name="Plus" size={18} /> Add study material</Button>}
    />

    <section className="stats-grid">
      <Card className="stat-card">
        <div className="stat-icon note"><Icon name="My Notes" size={20}/></div>
        <span>Study materials</span><strong>{noteCount}</strong>
        <div><Tag color="purple">Library</Tag><small>your uploaded files</small></div>
      </Card>
      <Card className="stat-card">
        <div className="stat-icon"><Icon name="AI Summaries" size={20}/></div>
        <span>AI summaries</span><strong>—</strong>
        <div><Tag>Connected</Tag><small>saved summaries</small></div>
      </Card>
      <Card className="stat-card">
        <div className="stat-icon"><Icon name="Flashcards" size={20}/></div>
        <span>Flashcards</span><strong>—</strong>
        <div><Tag>Connected</Tag><small>your study decks</small></div>
      </Card>
      <Card className="stat-card">
        <div className="stat-icon"><Icon name="Quizzes" size={20}/></div>
        <span>Quiz average</span><strong>—</strong>
        <div><Tag>Connected</Tag><small>from saved attempts</small></div>
      </Card>
    </section>

    <section className="dash-grid">
      <Card className="activity-card">
        <div className="section-title">
          <div><h2>Your workspace</h2><p>Your study materials are stored securely in your account.</p></div>
        </div>
        <div className="empty">
          <div><Icon name="My Notes"/></div>
          <h3>{noteCount ? "Your library is ready" : "Start building your library"}</h3>
          <p>Upload study materials to create summaries, flashcards and quizzes.</p>
          <Button onClick={() => navigate("My Notes")}>Open my notes</Button>
        </div>
      </Card>
      <Card className="goal-card">
        <div className="section-title">
          <div><h2>Quick start</h2><p>Choose what you want to work on.</p></div>
        </div>
        <div className="quick-grid">
          {[
            ["Upload notes", "Add study material", "Upload", "My Notes"],
            ["AI summaries", "Review saved summaries", "AI Summaries", "AI Summaries"],
            ["Flashcards", "Practice active recall", "Flashcards", "Flashcards"],
            ["Quizzes", "Test your knowledge", "Quizzes", "Quizzes"],
          ].map(([title, sub, icon, destination]) => (
            <Card key={title} className="quick" onClick={() => navigate(destination as Page)}>
              <div><Icon name={icon}/></div><b>{title}</b><span>{sub}</span>
            </Card>
          ))}
        </div>
      </Card>
    </section>
  </>;
}

function Notes({
  notes,
  search,
  setSearch,
  openModal,
}: {
  notes: Note[];
  search: string;
  setSearch: (s: string) => void;
  openModal: (m: "upload" | "rename" | "delete" | "summary", n?: Note) => void;
}) {
  const [filter, setFilter] = useState("All files");

  const filtered = notes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase()) &&
    (filter === "All files" || note.type === filter)
  );


  const openNote = async (note: Note) => {
    if (!note.file_path) {
      window.alert("This note has no stored file path.");
      return;
    }

    const newTab = window.open("about:blank", "_blank");

    if (!newTab) {
      window.alert("Please allow pop-ups to open your note.");
      return;
    }

    const { data, error } = await supabase.storage
      .from("Study-materials")
      .createSignedUrl(note.file_path, 300);

    if (error || !data?.signedUrl) {
      newTab.close();
      window.alert("Could not open note: " + (error?.message || "Unknown error"));
      return;
    }

    newTab.location.href = data.signedUrl;
  };



  return <>
    <PageHeader title="My Notes"
      subtitle="Keep all your study material organized in one place."
      action={<Button onClick={() => openModal("upload")}><Icon name="Upload" size={18}/> Upload notes</Button>} />

    <Card className="note-toolbar">
      <div className="inner-search">
        <Icon name="Search" size={18}/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your notes..."/>
      </div>
      <select value={filter} onChange={e => setFilter(e.target.value)}>
        <option>All files</option><option>PDF</option><option>DOCX</option><option>TXT</option>
      </select>
      <span>{filtered.length} notes</span>
    </Card>

    <div className="notes-grid">
      {filtered.map(note => (
        <Card className="note-card" key={note.id}>
          <div className="note-preview" style={{ "--note-color": note.color } as CSSProperties}>
            <div className="paper-lines"><i/><i/><i/><i/></div>
            <Tag>{note.type}</Tag>
          </div>
          <div className="note-body">
            <div>
              <h3>{note.title}</h3>
              <button onClick={() => openModal("rename", note)}><Icon name="Edit" size={16}/></button>
            </div>
            <p>{note.size} · {note.date}</p>
            <div className="note-actions">
	<Button onClick={() => openNote(note)} secondary>
  <Icon name="Eye" size={16}/> Open
</Button>
              <Button onClick={() => openModal("summary", note)} secondary>
                <Icon name="AI Summaries" size={16}/> Summarize
              </Button>
              <button className="danger-icon" onClick={() => openModal("delete", note)}>
                <Icon name="Trash" size={17}/>
              </button>
            </div>
          </div>
        </Card>
      ))}
      <button className="upload-tile" onClick={() => openModal("upload")}>
        <span><Icon name="Upload"/></span>
        <b>Upload a new note</b>
        <p>PDF, DOCX or TXT up to 20 MB</p>
      </button>
    </div>

    {!filtered.length && (
      <div className="empty">
        <div><Icon name="Search"/></div>
        <h3>No notes found</h3>
        <p>Try adjusting your search or upload a new note.</p>
        <Button onClick={() => { setSearch(""); setFilter("All files"); }}>Clear filters</Button>
      </div>
    )}
  </>;
}

function Summaries({
  notes,
  notify,
  openModal,
  saveSummary,
}: {
  notes: Note[];
  notify: (s: string) => void;
  openModal: (m: "summary", n?: Note) => void;
  saveSummary: (materialId: string, title: string, content: string, summaryId?: string) => Promise<boolean>;
}) {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [selected, setSelected] = useState<Summary | null>(null);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const loadSummaries = async () => {
    const { data, error } = await supabase
      .from("summaries")
      .select("id,material_id,title,content,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Summary load error:", error.message);
      notify("Could not load summaries");
      return;
    }

    const rows = (data || []) as Summary[];
    setSummaries(rows);

    if (rows.length && !selected) {
      setSelected(rows[0]);
      setText(rows[0].content);
    }
  };

  useEffect(() => {
    void loadSummaries();
  }, []);

  const chooseSummary = (summary: Summary) => {
    setSelected(summary);
    setText(summary.content);
    setEditing(false);
  };

  const save = async () => {
    if (!selected) return;
    setLoading(true);
    const ok = await saveSummary(selected.material_id, selected.title, text, selected.id);
    setLoading(false);
    if (ok) {
      setEditing(false);
      await loadSummaries();
      setSelected({ ...selected, content: text });
    }
  };

  return <>
    <PageHeader
      title="AI Summaries"
      subtitle="Review and edit summaries saved to your account."
      action={<Button onClick={() => {
        if (!notes.length) {
          notify("Upload study material first");
          return;
        }
        openModal("summary", notes[0]);
      }}><Icon name="AI Summaries" size={18}/> Generate summary</Button>}
    />

    <div className="summary-layout">
      <div>
        <div className="section-heading"><h2>Saved summaries</h2><span>{summaries.length} saved</span></div>
        <div className="summary-list">
          {summaries.map(summary => (
            <Card key={summary.id}
              className={`summary-item ${selected?.id === summary.id ? "selected" : ""}`}
              onClick={() => chooseSummary(summary)}>
              <div className="doc-icon"><Icon name="AI Summaries"/></div>
              <div>
                <b>{summary.title}</b>
                <span>{new Date(summary.created_at).toLocaleDateString()}</span>
                <p>{summary.content.slice(0, 70)}{summary.content.length > 70 ? "..." : ""}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="summary-reader">
        {selected ? <>
          <div className="reader-head">
            <div>
              <Tag>SUMMARY</Tag>
              <h2>{selected.title}</h2>
              <p>Saved {new Date(selected.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <Button secondary onClick={() => setEditing(!editing)}>
                <Icon name="Edit" size={16}/>{editing ? "Preview" : "Edit"}
              </Button>
              {editing && <Button onClick={() => void save()} disabled={loading}>
                <Icon name="Check" size={16}/>{loading ? "Saving..." : "Save"}
              </Button>}
            </div>
          </div>
                  {editing ? (
            <textarea
              className="summary-editor"
              value={text}
              onChange={e => setText(e.target.value)}
            />
          ) : (
            <div className="summary-copy">
              <h3>Summary</h3>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {selected.content}
              </ReactMarkdown>
            </div>
          )}
        </> : (
          <div className="empty">
            <div><Icon name="AI Summaries"/></div>
            <h3>No summaries yet</h3>
            <p>Summaries will appear here once generated and saved.</p>
            <Button onClick={() => {
              if (notes.length) openModal("summary", notes[0]);
              else notify("Upload study material first");
            }}>Get started</Button>
          </div>
        )}
      </Card>
    </div>
  </>;
}

function Flashcards({ notes, notify }: { notes: Note[]; notify: (s: string) => void }) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [deckIndex, setDeckIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const deck = decks[deckIndex];
  const flashcards = deck?.flashcards || [];
  const current = flashcards[cardIndex];

  const loadDecks = async () => {
    const { data, error } = await supabase
      .from("flashcard_decks")
      .select("id,material_id,title,description,flashcards(id,deck_id,front,back,card_order)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Deck load error:", error.message);
      notify("Could not load flashcards");
      return;
    }

    const loaded = ((data || []) as Deck[]).map(item => ({
      ...item,
      flashcards: [...(item.flashcards || [])].sort((a, b) => a.card_order - b.card_order),
    }));

    setDecks(loaded);
    setDeckIndex(0);
    setCardIndex(0);
  };

  useEffect(() => {
    void loadDecks();
  }, []);

  const createDeck = async () => {
    if (!notes.length) {
      notify("Upload study material before creating a deck");
      return;
    }

    const title = window.prompt("Name your new flashcard deck:");
    if (!title?.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("flashcard_decks").insert({
      material_id: notes[0].id,
      title: title.trim(),
      description: "Flashcards created in Mindora",
    });
    setLoading(false);

    if (error) {
      notify("Could not create deck: " + error.message);
      return;
    }

    await loadDecks();
    notify("Deck created");
  };

  const addCard = async () => {
    if (!deck) return;

    const front = window.prompt("Enter the question or term:");
    if (!front?.trim()) return;
    const back = window.prompt("Enter the answer:");
    if (!back?.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("flashcards").insert({
      deck_id: deck.id,
      front: front.trim(),
      back: back.trim(),
      card_order: flashcards.length,
    });
    setLoading(false);

    if (error) {
      notify("Could not add flashcard: " + error.message);
      return;
    }

    await loadDecks();
    notify("Flashcard added");
  };

  const move = (next: number) => {
    if (!flashcards.length) return;
    setCardIndex((next + flashcards.length) % flashcards.length);
    setFlipped(false);
  };

  return <>
    <PageHeader title="Flashcards" subtitle="Master key concepts with active recall."
      action={<div className="header-buttons">
        <Button secondary onClick={() => move(Math.floor(Math.random() * flashcards.length))}
          disabled={!flashcards.length}>Shuffle</Button>
        <Button onClick={() => void createDeck()} disabled={loading}>
          <Icon name="Plus" size={17}/>Create deck
        </Button>
      </div>} />

    <div className="study-layout">
      <Card className="deck-info">
        <Tag>YOUR LIBRARY</Tag>
        <h2>{deck?.title || "Your flashcards"}</h2>
        <p>{deck?.description || "Choose a deck to start studying."}</p>

        {decks.length > 0 && (
          <label className="field-label">
            Select deck
            <select value={deckIndex} onChange={e => {
              setDeckIndex(Number(e.target.value));
              setCardIndex(0);
              setFlipped(false);
            }}>
              {decks.map((item, index) => <option key={item.id} value={index}>{item.title}</option>)}
            </select>
          </label>
        )}

        <div className="deck-progress">
          <div><span>Cards in deck</span><b>{flashcards.length}</b></div>
          <div className="progress-line"><i style={{ width: flashcards.length ? "100%" : "0%" }}/></div>
        </div>
        <Button secondary onClick={() => void addCard()} disabled={!deck || loading}>
          <Icon name="Plus" size={16}/> Add flashcard
        </Button>
      </Card>

      <div className="flash-area">
        {current ? <>
          <div className="card-count">
            CARD {cardIndex + 1} OF {flashcards.length}
            <span>Click the card to flip</span>
          </div>
          <button className={`flashcard ${flipped ? "flipped" : ""}`}
            onClick={() => setFlipped(!flipped)}>
            <div className="flash-inner">
              <div className="flash-face front">
                <Tag>QUESTION</Tag><h2>{current.front}</h2><span>Tap to reveal answer</span>
              </div>
              <div className="flash-face back">
                <Tag>ANSWER</Tag><p>{current.back}</p><span>Tap to see question</span>
              </div>
            </div>
          </button>
          <div className="flash-controls">
            <button onClick={() => move(cardIndex - 1)}>←</button>
            <Button secondary onClick={() => move(cardIndex + 1)}>Review again</Button>
            <Button onClick={() => move(cardIndex + 1)}>
              <Icon name="Check" size={16}/>Next card
            </Button>
            <button onClick={() => move(cardIndex + 1)}>→</button>
          </div>
        </> : (
          <div className="empty">
            <div><Icon name="Flashcards"/></div>
            <h3>{decks.length ? "This deck has no cards yet" : "No flashcard decks yet"}</h3>
            <p>Create a deck and add cards to begin studying.</p>
            <Button onClick={() => deck ? void addCard() : void createDeck()}>
              {deck ? "Add first card" : "Create first deck"}
            </Button>
          </div>
        )}
      </div>
    </div>
  </>;
}

function Quizzes({ notes, notify }: { notes: Note[]; notify: (s: string) => void }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selected, setSelected] = useState<Quiz | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const loadQuizzes = async () => {
    const { data, error } = await supabase
      .from("quizzes")
      .select("id,material_id,title,description,quiz_questions(id,question,options,question_order)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Quiz load error:", error.message);
      notify("Could not load quizzes");
      return;
    }

    const loaded = ((data || []) as Quiz[]).map(quiz => ({
      ...quiz,
      quiz_questions: [...(quiz.quiz_questions || [])].sort(
        (a, b) => a.question_order - b.question_order
      ),
    }));

    setQuizzes(loaded);
  };

  useEffect(() => {
    void loadQuizzes();
  }, []);

  const currentQuestion = selected?.quiz_questions[questionIndex];
  const options = Array.isArray(currentQuestion?.options)
    ? currentQuestion.options
    : [];

  if (selected && currentQuestion) {
    return <>
      <PageHeader title={selected.title}
        subtitle={`Question ${questionIndex + 1} of ${selected.quiz_questions.length}`}
        action={<Button secondary onClick={() => setSelected(null)}>Exit quiz</Button>} />
      <div className="quiz-progress">
        <i style={{ width: `${((questionIndex + 1) / selected.quiz_questions.length) * 100}%` }}/>
      </div>
      <Card className="question-card">
        <Tag>QUESTION {questionIndex + 1}</Tag>
        <h2>{currentQuestion.question}</h2>
        <div className="options">
          {options.map((option, index) => (
            <button key={index}
              className={answers[currentQuestion.id] === index ? "chosen" : ""}
              onClick={() => setAnswers({ ...answers, [currentQuestion.id]: index })}>
              <span>{String.fromCharCode(65 + index)}</span>
              {String(option)}
              <i>{answers[currentQuestion.id] === index && <Icon name="Check" size={16}/>}</i>
            </button>
          ))}
        </div>
        <div className="question-footer">
          <Button secondary disabled={questionIndex === 0}
            onClick={() => setQuestionIndex(Math.max(0, questionIndex - 1))}>
            Previous
          </Button>
          <Button
            disabled={answers[currentQuestion.id] === undefined}
            onClick={() => {
              if (questionIndex < selected.quiz_questions.length - 1) {
                setQuestionIndex(questionIndex + 1);
              } else {
                notify("Secure quiz scoring is not configured yet. Your answers have not been submitted.");
              }
            }}>
            {questionIndex === selected.quiz_questions.length - 1 ? "Finish quiz" : "Next question"} →
          </Button>
        </div>
        <p className="quiz-note">
          Quiz scoring will be enabled after the secure scoring function is connected.
        </p>
      </Card>
    </>;
  }

  return <>
    <PageHeader title="Quizzes" subtitle="Test your knowledge with quizzes linked to your study materials."/>
    {quizzes.length ? (
      <div className="quiz-cards">
        {quizzes.map(quiz => (
          <Card className="quiz-card" key={quiz.id}>
            <div className="quiz-art"><Icon name="Quizzes" size={35}/></div>
            <h3>{quiz.title}</h3>
            <p>{quiz.quiz_questions.length} questions · {quiz.description || "Study quiz"}</p>
            <Button onClick={() => {
              if (!quiz.quiz_questions.length) {
                notify("This quiz has no questions yet");
                return;
              }
              setSelected(quiz);
              setQuestionIndex(0);
              setAnswers({});
            }}>Start quiz <span>→</span></Button>
          </Card>
        ))}
      </div>
    ) : (
      <div className="empty">
        <div><Icon name="Quizzes"/></div>
        <h3>No quizzes yet</h3>
        <p>Quizzes linked to your study materials will appear here.</p>
        <Button onClick={() => {
          if (!notes.length) notify("Upload study material first");
          else notify("Quiz generation needs a secure AI backend function.");
        }}>Create a quiz</Button>
      </div>
    )}
  </>;
}

function Progress({ userId }: { userId: string }) {
  const [attempts, setAttempts] = useState<{
    id: string;
    score: number;
    total_questions: number;
    completed_at: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttempts = async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("id,score,total_questions,completed_at")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false });

      if (error) {
        console.error("Progress load error:", error.message);
      } else {
        setAttempts(data || []);
      }
      setLoading(false);
    };

    void loadAttempts();
  }, [userId]);

  const totalQuestions = attempts.reduce((sum, item) => sum + item.total_questions, 0);
  const totalCorrect = attempts.reduce((sum, item) => sum + item.score, 0);
  const average = totalQuestions
    ? Math.round((totalCorrect / totalQuestions) * 100)
    : 0;

  return <>
    <PageHeader title="Your Progress" subtitle="Track your learning using your saved quiz attempts."/>
    <div className="progress-highlights">
      <Card><span>Quiz accuracy</span><b>{attempts.length ? `${average}%` : "—"}</b><Tag color="green">Based on attempts</Tag></Card>
      <Card><span>Questions answered</span><b>{totalQuestions}</b><Tag color="purple">Saved attempts</Tag></Card>
      <Card><span>Quizzes completed</span><b>{attempts.length}</b><small>All recorded attempts</small></Card>
    </div>

    <Card className="history">
      <div className="section-title">
        <div><h2>Quiz history</h2><p>Your recorded quiz attempts</p></div>
      </div>
      {loading ? <p>Loading progress...</p> : attempts.length ? (
        attempts.map(attempt => {
          const percent = attempt.total_questions
            ? Math.round((attempt.score / attempt.total_questions) * 100)
            : 0;

          return (
            <div className="history-row" key={attempt.id}>
              <div className="history-icon"><Icon name="Quizzes"/></div>
              <div>
                <b>Quiz attempt</b>
                <span>{new Date(attempt.completed_at).toLocaleString()}</span>
              </div>
              <strong>{percent}%</strong>
              <Tag color={percent >= 80 ? "green" : "purple"}>
                {attempt.score}/{attempt.total_questions} correct
              </Tag>
            </div>
          );
        })
      ) : (
        <div className="empty">
          <div><Icon name="Progress"/></div>
          <h3>No quiz history yet</h3>
          <p>Your progress will appear after secure quiz scoring is enabled and attempts are saved.</p>
        </div>
      )}
    </Card>
  </>;
}

function Settings({
  user,
  userName,
  setUserName,
  notify,
  signOut,
}: {
  user: import("@supabase/supabase-js").User;
  userName: string;
  setUserName: (name: string) => void;
  notify: (s: string) => void;
  signOut: () => void;
}) {
  const [name, setName] = useState(userName);
  const [field, setField] = useState("");
  const [university, setUniversity] = useState("");
  const [saving, setSaving] = useState(false);
  const [toggles, setToggles] = useState([true, true, false, true]);

  useEffect(() => {
    setName(userName);
  }, [userName]);

  const saveProfile = async () => {
    if (!name.trim()) {
      notify("Enter your name first");
      return;
    }

    setSaving(true);

    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    });

    if (authError) {
      setSaving(false);
      notify("Profile update failed: " + authError.message);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        display_name: name.trim(),
        updated_at: new Date().toISOString(),
      });

    setSaving(false);

    if (profileError) {
      notify("Profile table update failed: " + profileError.message);
      return;
    }

    setUserName(name.trim());
    notify("Profile saved");
  };

  const initials = name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();

  return <>
    <PageHeader title="Settings" subtitle="Manage your profile and learning preferences."/>
    <div className="settings-layout">
      <div className="settings-nav">
        <button className="active">Profile</button>
        <button onClick={() => notify("Preference controls are local to this session for now.")}>Preferences</button>
        <button onClick={() => notify("Notification preferences are not connected yet.")}>Notifications</button>
        <button onClick={() => notify("Appearance settings are managed by your theme.")}>Appearance</button>
      </div>

      <div className="settings-content">
        <Card>
          <div className="settings-head">
            <h2>Profile information</h2>
            <p>Update your personal details.</p>
          </div>
          <div className="profile-edit">
            <div className="big-avatar">{initials || "U"}</div>
            <div><p>Profile connected to your Mindora account.</p></div>
          </div>
          <div className="form-grid">
            <label>Full name
              <input value={name} onChange={e => setName(e.target.value)}/>
            </label>
            <label>Email address
              <input value={user.email || ""} disabled readOnly/>
            </label>
            <label>Field of study
              <input value={field} onChange={e => setField(e.target.value)} placeholder="e.g. Psychology"/>
            </label>
            <label>University
              <input value={university} onChange={e => setUniversity(e.target.value)} placeholder="Your institution"/>
            </label>
          </div>
          <div className="save-row">
            <Button onClick={() => void saveProfile()} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="settings-head">
            <h2>Learning preferences</h2>
            <p>These controls currently apply only in this session.</p>
          </div>
          {["Daily study reminders", "Weekly progress report", "AI study suggestions", "Sound effects"].map((label, index) => (
            <div className="toggle-row" key={label}>
              <div>
                <b>{label}</b>
                <p>{index === 0 ? "Get a nudge when it's time to study." :
                  index === 1 ? "Receive a weekly summary of your progress." :
                  index === 2 ? "Let Mindora recommend what to study next." :
                  "Play subtle sounds during study sessions."}</p>
              </div>
              <button className={`toggle ${toggles[index] ? "on" : ""}`}
                onClick={() => setToggles(old => old.map((value, i) => i === index ? !value : value))}>
                <i/>
              </button>
            </div>
          ))}
        </Card>

        <Card>
          <div className="settings-head">
            <h2>Account</h2>
            <p>Sign out of your Mindora account on this device.</p>
          </div>
          <Button secondary onClick={signOut}>Sign out</Button>
        </Card>
      </div>
    </div>
  </>;
}

function Modal({
  kind,
  note,
  close,
  loading,
  upload,
  rename,
  remove,
  generate,
}: {
  kind: string;
  note: Note | null;
  close: () => void;
  loading: boolean;
  upload: (file: File, title: string) => Promise<void>;
  rename: (title: string) => Promise<void>;
  remove: () => Promise<void>;
  generate: () => void;
}) {
  const [value, setValue] = useState(kind === "rename" ? note?.title || "" : "");
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!file || !value.trim()) return;
    void upload(file, value);
  };

  return (
    <div className="modal-backdrop"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !loading) close();
      }}>
      <div className="modal">
        <button className="modal-close" onClick={close} disabled={loading}>
          <Icon name="Close"/>
        </button>

        {kind === "upload" && <>
          <div className="modal-icon"><Icon name="Upload"/></div>
          <h2>Upload study material</h2>
          <p>Add a PDF, DOCX or text file to your library.</p>
          <label className="dropzone">
            <Icon name="Upload" size={28}/>
            <b>{file ? file.name : "Drag and drop your file here"}</b>
            <span>or click to browse · Max 20 MB</span>
            <input type="file" accept=".pdf,.docx,.txt"
              onChange={event => {
                const selectedFile = event.target.files?.[0] || null;
                setFile(selectedFile);
                if (selectedFile) {
                  setValue(selectedFile.name.replace(/\.[^/.]+$/, ""));
                }
              }}/>
          </label>
          {file && <div className="file-ready">
            <Icon name="Check"/><span>{file.name}</span>
          </div>}
          <div className="modal-actions">
            <Button secondary onClick={close} disabled={loading}>Cancel</Button>
            <Button disabled={!file || !value.trim() || loading} onClick={handleUpload}>
              {loading ? "Uploading..." : "Upload note"}
            </Button>
          </div>
        </>}

        {kind === "rename" && <>
          <h2>Rename note</h2>
          <p>Choose a clear name so it's easy to find later.</p>
          <label className="field-label">
            Note name
            <input autoFocus value={value} onChange={e => setValue(e.target.value)}/>
          </label>
          <div className="modal-actions">
            <Button secondary onClick={close} disabled={loading}>Cancel</Button>
            <Button disabled={!value.trim() || loading} onClick={() => void rename(value)}>
              {loading ? "Saving..." : "Save name"}
            </Button>
          </div>
        </>}

        {kind === "delete" && <>
          <div className="modal-icon danger"><Icon name="Trash"/></div>
          <h2>Delete this note?</h2>
          <p>“{note?.title}” will be permanently removed. This action cannot be undone.</p>
          <div className="modal-actions">
            <Button secondary onClick={close} disabled={loading}>Keep note</Button>
            <button className="delete-btn" disabled={loading} onClick={() => void remove()}>
              {loading ? "Deleting..." : "Delete note"}
            </button>
          </div>
        </>}

        {kind === "summary" && <>
          <div className="modal-icon"><Icon name="AI Summaries"/></div>
          <h2>Generate AI summary</h2>
          <p>
            Create a concise study summary from “{note?.title || "your notes"}”.
            AI generation needs a secure server-side AI function before it can run.
          </p>
          <div className="modal-actions">
            <Button secondary onClick={close}>Cancel</Button>
            <Button onClick={generate}>Continue</Button>
          </div>
        </>}
      </div>
    </div>
  );
}

export default App;
