import { useMemo, useState } from "react";

type Page = "Dashboard" | "My Notes" | "AI Summaries" | "Flashcards" | "Quizzes" | "Progress" | "Settings";
type Note = { id: number; title: string; type: string; size: string; date: string; color: string };

const icons: Record<string, React.ReactNode> = {
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
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{icons[name]}</svg>;
}

const initialNotes: Note[] = [
  { id: 1, title: "Cognitive Psychology", type: "PDF", size: "2.4 MB", date: "Today, 10:32 AM", color: "#8B7CF6" },
  { id: 2, title: "Introduction to Neuroscience", type: "PDF", size: "5.8 MB", date: "Yesterday", color: "#60A5FA" },
  { id: 3, title: "Machine Learning Basics", type: "TEXT", size: "14 KB", date: "May 18, 2025", color: "#34D399" },
  { id: 4, title: "Research Methods — Chapter 4", type: "PDF", size: "3.1 MB", date: "May 16, 2025", color: "#F59E8B" },
];

const cards = [
  ["What is neuroplasticity?", "The brain's ability to reorganize itself by forming new neural connections throughout life."],
  ["What is working memory?", "A limited-capacity system that temporarily holds information available for processing."],
  ["Define classical conditioning.", "Learning through association, when a neutral stimulus becomes linked with a meaningful stimulus."],
  ["What is the hippocampus?", "A brain structure essential for learning, memory formation, and spatial navigation."],
];

const quizQuestions = [
  { q: "Which brain region is primarily responsible for forming new memories?", options: ["Amygdala", "Hippocampus", "Cerebellum", "Medulla"], answer: 1 },
  { q: "What does neuroplasticity describe?", options: ["Brain growth by age", "The brain's ability to reorganize", "Loss of neurons", "A sleep cycle"], answer: 1 },
  { q: "Working memory is best described as:", options: ["Permanent storage", "Emotional recall", "Temporary active storage", "Motor memory"], answer: 2 },
];

function Button({ children, onClick, secondary = false, className = "", disabled = false }: { children: React.ReactNode; onClick?: () => void; secondary?: boolean; className?: string; disabled?: boolean }) {
  return <button disabled={disabled} onClick={onClick} className={`${secondary ? "btn-secondary" : "btn-primary"} ${className}`}>{children}</button>;
}

function Card({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <div onClick={onClick} className={`panel ${onClick ? "clickable" : ""} ${className}`}>{children}</div>;
}

function Tag({ children, color = "purple" }: { children: React.ReactNode; color?: string }) {
  return <span className={`tag tag-${color}`}>{children}</span>;
}

export default function App() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"upload" | "rename" | "delete" | "summary" | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };
  const navigate = (p: Page) => { setPage(p); setMobileOpen(false); };
  const openModal = (kind: typeof modal, note?: Note) => { setSelectedNote(note || null); setModal(kind); };

  return (
    <div
      className="app-shell"
      onPointerMove={(event) => {
        event.currentTarget.style.setProperty("--mx", `${event.clientX}px`);
        event.currentTarget.style.setProperty("--my", `${event.clientY}px`);
      }}
    >
      <Sidebar page={page} navigate={navigate} open={mobileOpen} close={() => setMobileOpen(false)} />
      <main className="main">
        <header className="topbar">
          <button className="icon-btn mobile-menu" onClick={() => setMobileOpen(true)}><Icon name="Menu" /></button>
          <div className="mobile-brand"><LogoMark /> Mindora</div>
          <div className="top-search"><Icon name="Search" size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search anything..." onKeyDown={e => { if (e.key === "Enter") navigate("My Notes"); }} /><span>⌘ K</span></div>
          <div className="top-actions">
            <button className="icon-btn notification" onClick={() => notify("You're all caught up!")}><Icon name="Bell" /><i /></button>
            <button className="avatar" onClick={() => navigate("Settings")}>AM</button>
          </div>
        </header>
        <div className="content">
          {page === "Dashboard" && <Dashboard navigate={navigate} notify={notify} />}
          {page === "My Notes" && <Notes notes={notes} search={search} setSearch={setSearch} openModal={openModal} navigate={navigate} />}
          {page === "AI Summaries" && <Summaries notes={notes} notify={notify} openModal={openModal} />}
          {page === "Flashcards" && <Flashcards notify={notify} />}
          {page === "Quizzes" && <Quizzes notify={notify} />}
          {page === "Progress" && <Progress />}
          {page === "Settings" && <Settings notify={notify} />}
        </div>
      </main>
      {modal && <Modal kind={modal} note={selectedNote} close={() => setModal(null)} loading={loading} action={(value) => {
        if (modal === "delete" && selectedNote) setNotes(notes.filter(n => n.id !== selectedNote.id));
        if (modal === "rename" && selectedNote && value) setNotes(notes.map(n => n.id === selectedNote.id ? { ...n, title: value } : n));
        if (modal === "upload" && value) setNotes([{ id: Date.now(), title: value, type: "PDF", size: "1.8 MB", date: "Just now", color: "#A78BFA" }, ...notes]);
        if (modal === "summary") { setLoading(true); setTimeout(() => { setLoading(false); setModal(null); notify("AI summary generated successfully"); }, 1300); return; }
        setModal(null); notify(modal === "delete" ? "Note deleted" : modal === "rename" ? "Note renamed" : "Note uploaded successfully");
      }} />}
      {toast && <div className="toast"><span><Icon name="Check" size={17} /></span>{toast}</div>}
    </div>
  );
}

function LogoMark() {
  return <div className="logo-mark"><div /><div /><div /></div>;
}

function Sidebar({ page, navigate, open, close }: { page: Page; navigate: (p: Page) => void; open: boolean; close: () => void }) {
  const pages: Page[] = ["Dashboard", "My Notes", "AI Summaries", "Flashcards", "Quizzes", "Progress"];
  return <>
    {open && <div className="scrim" onClick={close} />}
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand"><LogoMark /><span>Mindora <b>AI</b></span><button className="sidebar-close" onClick={close}><Icon name="Close" /></button></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{pages.map(p => <button key={p} className={page === p ? "active" : ""} onClick={() => navigate(p)}><Icon name={p} />{p}{p === "AI Summaries" && <small>3</small>}</button>)}</nav>
      <div className="sidebar-spacer" />
      <nav className="bottom-nav"><button className={page === "Settings" ? "active" : ""} onClick={() => navigate("Settings")}><Icon name="Settings" />Settings</button></nav>
      <div className="user-card"><div className="avatar">AM</div><div><b>Alex Morgan</b><span>alex@student.edu</span></div><Icon name="More" /></div>
    </aside>
  </>;
}

function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}

function Dashboard({ navigate, notify }: { navigate: (p: Page) => void; notify: (s: string) => void }) {
  return <>
    <PageHeader eyebrow="MONDAY, MAY 26" title="Good morning, Alex" subtitle="Ready to make progress? You're on a 7 day learning streak." action={<Button onClick={() => navigate("My Notes")}><Icon name="Plus" size={18} /> Add study material</Button>} />
    <section className="stats-grid">
      {[
        ["Study time", "12.5h", "+18%", "this month", "clock"],
        ["Notes created", "24", "+4", "this week", "note"],
        ["Quiz average", "86%", "+5.2%", "vs last month", "quiz"],
        ["Study streak", "7 days", "Best: 14", "keep it going", "fire"],
      ].map(([label, value, badge, sub, type]) => <Card key={label} className="stat-card">
        <div className={`stat-icon ${type}`}>{type === "fire" ? "↗" : <Icon name={type === "note" ? "My Notes" : type === "quiz" ? "Quizzes" : "Progress"} size={20} />}</div>
        <span>{label}</span><strong>{value}</strong><div><Tag color={badge.startsWith("+") ? "green" : "purple"}>{badge}</Tag><small>{sub}</small></div>
      </Card>)}
    </section>
    <section className="dash-grid">
      <Card className="activity-card">
        <div className="section-title"><div><h2>Learning activity</h2><p>Your study time over the last 7 days</p></div><select><option>This week</option><option>Last week</option></select></div>
        <div className="chart-wrap"><div className="y-labels"><span>4h</span><span>3h</span><span>2h</span><span>1h</span><span>0h</span></div><div className="bar-chart">
          {[["Mon", 44], ["Tue", 70], ["Wed", 53], ["Thu", 88], ["Fri", 66], ["Sat", 35], ["Sun", 77]].map(([d,h], i) => <div className="bar-col" key={d}><div className={`bar ${i === 3 ? "hot" : ""}`} style={{height:`${h}%`}}><i>{(Number(h)/25).toFixed(1)}h</i></div><span>{d}</span></div>)}
        </div></div>
      </Card>
      <Card className="goal-card">
        <div className="section-title"><div><h2>Weekly goal</h2><p>8h 45m of 12 hours</p></div><button onClick={() => notify("Goal settings opened")}><Icon name="More" /></button></div>
        <div className="ring"><div><b>73%</b><span>completed</span></div></div>
        <div className="goal-stats"><div><span>Time left</span><b>3h 15m</b></div><div><span>Daily average</span><b>1h 46m</b></div></div>
      </Card>
    </section>
    <section className="lower-grid">
      <div><div className="section-heading"><h2>Continue learning</h2><button onClick={() => navigate("My Notes")}>View all →</button></div>
        <div className="course-list">
          {[["Cognitive Psychology", "Chapter 6 · Memory", 72, "#8B7CF6"], ["Introduction to Neuroscience", "Chapter 3 · Neural Networks", 48, "#60A5FA"], ["Machine Learning Basics", "Section 4 · Model Training", 31, "#34D399"]].map(([title, sub, pct, color]) => <Card className="course" key={String(title)} onClick={() => navigate("Flashcards")}><div className="doc-icon" style={{background:String(color)}}><Icon name="My Notes" /></div><div className="course-info"><b>{title}</b><span>{sub}</span><div className="progress-line"><i style={{width:`${pct}%`, background:String(color)}} /></div></div><strong>{pct}%</strong><div className="play"><Icon name="Play" size={16} /></div></Card>)}
        </div>
      </div>
      <div><div className="section-heading"><h2>Quick actions</h2></div>
        <div className="quick-grid">
          {[["Upload notes","Add PDFs or text","Upload","My Notes"],["Generate summary","Create with AI","AI Summaries","AI Summaries"],["Create flashcards","Study smarter","Flashcards","Flashcards"],["Start a quiz","Test knowledge","Quizzes","Quizzes"]].map(([a,b,icon,dest]) => <Card key={a} className="quick" onClick={() => navigate(dest as Page)}><div><Icon name={icon} /></div><b>{a}</b><span>{b}</span></Card>)}
        </div>
      </div>
    </section>
  </>;
}

function Notes({ notes, search, setSearch, openModal, navigate }: { notes: Note[]; search: string; setSearch: (s: string) => void; openModal: (m: "upload"|"rename"|"delete"|"summary", n?: Note) => void; navigate: (p: Page) => void }) {
  const [filter, setFilter] = useState("All files");
  const filtered = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) && (filter === "All files" || n.type === filter));
  return <>
    <PageHeader title="My Notes" subtitle="Keep all your study material organized in one place." action={<Button onClick={() => openModal("upload")}><Icon name="Upload" size={18} /> Upload notes</Button>} />
    <Card className="note-toolbar"><div className="inner-search"><Icon name="Search" size={18} /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search your notes..." /></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All files</option><option>PDF</option><option>TEXT</option></select><span>{filtered.length} notes</span></Card>
    <div className="notes-grid">
      {filtered.map(note => <Card className="note-card" key={note.id}>
        <div className="note-preview" style={{"--note-color":note.color} as React.CSSProperties}><div className="paper-lines"><i/><i/><i/><i/></div><Tag>{note.type}</Tag></div>
        <div className="note-body"><div><h3>{note.title}</h3><button onClick={() => openModal("rename", note)}><Icon name="Edit" size={16}/></button></div><p>{note.size} · {note.date}</p>
          <div className="note-actions"><Button onClick={() => { openModal("summary", note); }} secondary><Icon name="AI Summaries" size={16}/> Summarize</Button><button className="danger-icon" onClick={() => openModal("delete", note)}><Icon name="Trash" size={17}/></button></div>
        </div>
      </Card>)}
      <button className="upload-tile" onClick={() => openModal("upload")}><span><Icon name="Upload" /></span><b>Upload a new note</b><p>PDF, DOCX or TXT up to 20 MB</p></button>
    </div>
    {!filtered.length && <div className="empty"><div><Icon name="Search" /></div><h3>No notes found</h3><p>Try adjusting your search or upload a new note.</p><Button onClick={() => {setSearch(""); setFilter("All files")}}>Clear filters</Button></div>}
  </>;
}

function Summaries({ notes, notify, openModal }: { notes: Note[]; notify: (s:string)=>void; openModal: (m:"summary",n?:Note)=>void }) {
  const [selected, setSelected] = useState(0);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("Cognitive psychology explores how people acquire, process, and store information. Memory is not a single system but a collection of processes including encoding, storage, and retrieval.");
  return <>
    <PageHeader title="AI Summaries" subtitle="Turn complex study material into clear, useful insights." action={<Button onClick={() => openModal("summary", notes[0])}><Icon name="AI Summaries" size={18}/> Generate summary</Button>} />
    <div className="summary-layout">
      <div><div className="section-heading"><h2>Recent summaries</h2><span>{notes.length} generated</span></div><div className="summary-list">{notes.slice(0,3).map((n,i)=><Card key={n.id} className={`summary-item ${selected===i?"selected":""}`} onClick={()=>setSelected(i)}><div className="doc-icon" style={{background:n.color}}><Icon name="AI Summaries"/></div><div><b>{n.title}</b><span>{i===0?"8 min ago":n.date}</span><p>{i===0?"12 key points · 4 min read":"8 key points · 3 min read"}</p></div></Card>)}</div></div>
      <Card className="summary-reader">
        <div className="reader-head"><div><Tag>AI SUMMARY</Tag><h2>{notes[selected]?.title || "Summary"}</h2><p>Generated from 24 pages · May 26, 2025</p></div><div><Button secondary onClick={()=>setEditing(!editing)}><Icon name="Edit" size={16}/>{editing?"Preview":"Edit"}</Button><Button onClick={()=>notify("Summary saved to your library")}><Icon name="Check" size={16}/>Save</Button></div></div>
        {editing ? <textarea className="summary-editor" value={text} onChange={e=>setText(e.target.value)} /> : <div className="summary-copy"><h3>Overview</h3><p>{text}</p><h3>Key concepts</h3><ul><li><b>Encoding:</b> The process of transforming information into a form that can be stored in memory.</li><li><b>Storage:</b> Maintaining encoded information over time across sensory, short-term, and long-term systems.</li><li><b>Retrieval:</b> Accessing stored information when it is needed.</li></ul><div className="insight"><Icon name="AI Summaries"/><div><b>Mindora insight</b><p>Use active recall and spaced repetition together to strengthen retrieval pathways and improve retention.</p></div></div></div>}
      </Card>
    </div>
  </>;
}

function Flashcards({ notify }: { notify:(s:string)=>void }) {
  const [index,setIndex]=useState(0), [flipped,setFlipped]=useState(false), [learned,setLearned]=useState<number[]>([]);
  const move=(next:number)=>{setIndex((next+cards.length)%cards.length);setFlipped(false)};
  return <>
    <PageHeader title="Flashcards" subtitle="Master key concepts with active recall." action={<div className="header-buttons"><Button secondary onClick={()=>{setIndex(Math.floor(Math.random()*cards.length));setFlipped(false);notify("Cards shuffled")}}>Shuffle</Button><Button onClick={()=>notify("New deck created")}><Icon name="Plus" size={17}/>Create deck</Button></div>} />
    <div className="study-layout">
      <Card className="deck-info"><Tag>COGNITIVE PSYCHOLOGY</Tag><h2>Memory & Learning</h2><p>Master the essential concepts from Chapter 6.</p><div className="deck-progress"><div><span>Deck progress</span><b>{learned.length} / {cards.length} learned</b></div><div className="progress-line"><i style={{width:`${learned.length/cards.length*100}%`}}/></div></div><div className="mini-stat"><span>Cards left</span><b>{cards.length-learned.length}</b></div><div className="mini-stat"><span>Accuracy</span><b>82%</b></div></Card>
      <div className="flash-area"><div className="card-count">CARD {index+1} OF {cards.length}<span>Click the card to flip</span></div><button className={`flashcard ${flipped?"flipped":""}`} onClick={()=>setFlipped(!flipped)}><div className="flash-inner"><div className="flash-face front"><Tag>QUESTION</Tag><h2>{cards[index][0]}</h2><span>Tap to reveal answer</span></div><div className="flash-face back"><Tag>ANSWER</Tag><p>{cards[index][1]}</p><span>Tap to see question</span></div></div></button>
        <div className="flash-controls"><button onClick={()=>move(index-1)}>←</button><Button secondary onClick={()=>{setLearned(learned.filter(x=>x!==index));move(index+1)}}>Review again</Button><Button onClick={()=>{setLearned([...new Set([...learned,index])]);notify("Marked as learned");move(index+1)}}><Icon name="Check" size={16}/>I know this</Button><button onClick={()=>move(index+1)}>→</button></div>
      </div>
    </div>
  </>;
}

function Quizzes({ notify }: { notify:(s:string)=>void }) {
  const [started,setStarted]=useState(false), [q,setQ]=useState(0), [answers,setAnswers]=useState<Record<number,number>>({}), [done,setDone]=useState(false);
  const score=useMemo(()=>quizQuestions.reduce((s,x,i)=>s+(answers[i]===x.answer?1:0),0),[answers]);
  if(!started) return <><PageHeader title="Quizzes" subtitle="Test your knowledge with AI-generated quizzes." action={<Button onClick={()=>notify("Quiz preferences saved")}><Icon name="Settings" size={17}/>Quiz settings</Button>}/><div className="quiz-cards">{[["Cognitive Psychology","10 questions","Last score: 90%","#8B7CF6"],["Introduction to Neuroscience","12 questions","Last score: 75%","#60A5FA"],["Machine Learning Basics","8 questions","Not attempted","#34D399"]].map(([a,b,c,color],i)=><Card className="quiz-card" key={a}><div className="quiz-art" style={{background:`linear-gradient(135deg, ${color}, #292642)`}}><Icon name="Quizzes" size={35}/></div><h3>{a}</h3><p>{b} · {c}</p><Button onClick={()=>{setStarted(true);setQ(0);setDone(false);setAnswers({})}}>{i===2?"Start quiz":"Try again"}<span>→</span></Button></Card>)}</div></>;
  if(done) return <><PageHeader title="Quiz results" subtitle="Cognitive Psychology · Completed just now"/><Card className="results"><div className="result-ring"><b>{Math.round(score/quizQuestions.length*100)}%</b></div><h2>{score===3?"Outstanding work!":"Great effort, Alex!"}</h2><p>You answered {score} of {quizQuestions.length} questions correctly.</p><div className="result-stats"><div><span>Correct</span><b>{score}</b></div><div><span>Incorrect</span><b>{quizQuestions.length-score}</b></div><div><span>Time</span><b>2m 14s</b></div></div><div><Button secondary onClick={()=>setStarted(false)}>Back to quizzes</Button><Button onClick={()=>{setDone(false);setQ(0);setAnswers({})}}>Try again</Button></div></Card></>;
  const item=quizQuestions[q];
  return <><PageHeader title="Cognitive Psychology" subtitle={`Question ${q+1} of ${quizQuestions.length}`} action={<Button secondary onClick={()=>setStarted(false)}>Exit quiz</Button>}/><div className="quiz-progress"><i style={{width:`${(q+1)/quizQuestions.length*100}%`}}/></div><Card className="question-card"><Tag>QUESTION {q+1}</Tag><h2>{item.q}</h2><div className="options">{item.options.map((o,i)=><button key={o} className={answers[q]===i?"chosen":""} onClick={()=>setAnswers({...answers,[q]:i})}><span>{String.fromCharCode(65+i)}</span>{o}<i>{answers[q]===i&&<Icon name="Check" size={16}/>}</i></button>)}</div><div className="question-footer"><Button secondary onClick={()=>setQ(Math.max(0,q-1))} disabled={q===0}>Previous</Button><Button disabled={answers[q]===undefined} onClick={()=>q===quizQuestions.length-1?setDone(true):setQ(q+1)}>{q===quizQuestions.length-1?"Submit quiz":"Next question"} →</Button></div></Card></>;
}

function Progress() {
  return <>
    <PageHeader title="Your Progress" subtitle="See how your learning compounds over time." action={<select className="date-select"><option>Last 30 days</option><option>Last 3 months</option></select>} />
    <div className="progress-highlights"><Card><span>Overall mastery</span><b>78%</b><Tag color="green">+6.4%</Tag></Card><Card><span>Questions answered</span><b>184</b><Tag color="purple">24 this week</Tag></Card><Card><span>Best subject</span><b>Psychology</b><small>91% accuracy</small></Card></div>
    <div className="progress-grid"><Card className="line-card"><div className="section-title"><div><h2>Accuracy over time</h2><p>Your average quiz performance</p></div><Tag color="green">↑ 8.2%</Tag></div><div className="line-chart"><div className="grid-lines"><i/><i/><i/><i/></div><svg viewBox="0 0 600 210" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7C6FF7" stopOpacity=".35"/><stop offset="1" stopColor="#7C6FF7" stopOpacity="0"/></linearGradient></defs><path d="M0,175 C70,155 90,160 145,120 S230,145 290,90 S390,110 435,65 S520,75 600,28 L600,210 L0,210Z" fill="url(#area)"/><path d="M0,175 C70,155 90,160 145,120 S230,145 290,90 S390,110 435,65 S520,75 600,28" fill="none" stroke="#8B7CF6" strokeWidth="5"/></svg><div className="x-axis"><span>May 1</span><span>May 7</span><span>May 14</span><span>May 21</span><span>Today</span></div></div></Card>
    <Card><div className="section-title"><div><h2>Subject mastery</h2><p>Based on all quiz results</p></div></div><div className="mastery">{[["Psychology",91,"#A78BFA"],["Neuroscience",78,"#60A5FA"],["Machine Learning",72,"#34D399"],["Research Methods",64,"#F59E8B"]].map(([a,b,c])=><div key={String(a)}><div><span>{a}</span><b>{b}%</b></div><div className="progress-line"><i style={{width:`${b}%`,background:String(c)}}/></div></div>)}</div></Card></div>
    <Card className="history"><div className="section-title"><div><h2>Quiz history</h2><p>Your recent attempts</p></div><button>View all →</button></div>{[["Memory & Learning","May 26, 2025","90%","Excellent"],["Neural Networks","May 23, 2025","75%","Good"],["Research Design","May 20, 2025","82%","Great"]].map(([a,b,c,d])=><div className="history-row" key={a}><div className="history-icon"><Icon name="Quizzes"/></div><div><b>{a}</b><span>{b}</span></div><strong>{c}</strong><Tag color={d==="Excellent"?"green":"purple"}>{d}</Tag><button>View results →</button></div>)}</Card>
  </>;
}

function Settings({ notify }: { notify:(s:string)=>void }) {
  const [name,setName]=useState("Alex Morgan"), [email,setEmail]=useState("alex@student.edu"), [toggles,setToggles]=useState([true,true,false,true]);
  return <><PageHeader title="Settings" subtitle="Manage your profile and learning preferences."/><div className="settings-layout"><div className="settings-nav"><button className="active">Profile</button><button>Preferences</button><button>Notifications</button><button>Appearance</button></div><div className="settings-content">
    <Card><div className="settings-head"><h2>Profile information</h2><p>Update your personal details and photo.</p></div><div className="profile-edit"><div className="big-avatar">AM</div><div><Button secondary onClick={()=>notify("Photo picker opened")}>Change photo</Button><p>JPG or PNG. Max size 2 MB.</p></div></div><div className="form-grid"><label>Full name<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Email address<input value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Field of study<input defaultValue="Cognitive Science"/></label><label>University<input defaultValue="Stanford University"/></label></div><div className="save-row"><Button onClick={()=>notify("Profile changes saved")}>Save changes</Button></div></Card>
    <Card><div className="settings-head"><h2>Learning preferences</h2><p>Personalize your Mindora experience.</p></div>{["Daily study reminders","Weekly progress report","AI study suggestions","Sound effects"].map((x,i)=><div className="toggle-row" key={x}><div><b>{x}</b><p>{i===0?"Get a nudge when it's time to study.":i===1?"Receive a weekly summary of your progress.":i===2?"Let Mindora recommend what to study next.":"Play subtle sounds during study sessions."}</p></div><button className={`toggle ${toggles[i]?"on":""}`} onClick={()=>setToggles(toggles.map((v,j)=>i===j?!v:v))}><i/></button></div>)}</Card>
  </div></div></>;
}

function Modal({ kind, note, close, action, loading }: { kind:string; note:Note|null; close:()=>void; action:(v?:string)=>void; loading:boolean }) {
  const [value,setValue]=useState(kind==="rename"?note?.title||"":"");
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><div className="modal"><button className="modal-close" onClick={close}><Icon name="Close"/></button>
    {kind==="upload"&&<><div className="modal-icon"><Icon name="Upload"/></div><h2>Upload study material</h2><p>Add a PDF, DOCX or text file to your library.</p><label className="dropzone"><Icon name="Upload" size={28}/><b>Drag and drop your file here</b><span>or click to browse · Max 20 MB</span><input type="file" onChange={e=>setValue(e.target.files?.[0]?.name.replace(/\.[^/.]+$/,"")||"")}/></label>{value&&<div className="file-ready"><Icon name="Check"/><span>{value}</span></div>}<div className="modal-actions"><Button secondary onClick={close}>Cancel</Button><Button disabled={!value} onClick={()=>action(value)}>Upload note</Button></div></>}
    {kind==="rename"&&<><h2>Rename note</h2><p>Choose a clear name so it’s easy to find later.</p><label className="field-label">Note name<input autoFocus value={value} onChange={e=>setValue(e.target.value)}/></label><div className="modal-actions"><Button secondary onClick={close}>Cancel</Button><Button disabled={!value.trim()} onClick={()=>action(value)}>Save name</Button></div></>}
    {kind==="delete"&&<><div className="modal-icon danger"><Icon name="Trash"/></div><h2>Delete this note?</h2><p>“{note?.title}” will be permanently removed. This action cannot be undone.</p><div className="modal-actions"><Button secondary onClick={close}>Keep note</Button><button className="delete-btn" onClick={()=>action()}>Delete note</button></div></>}
    {kind==="summary"&&<><div className="modal-icon"><Icon name="AI Summaries"/></div><h2>{loading?"Creating your summary…":"Generate AI summary"}</h2><p>{loading?"Mindora is identifying key ideas and important details.":`Create a concise study summary from “${note?.title||"your notes"}”.`}</p>{loading?<div className="loading-bar"><i/></div>:<><label className="field-label">Summary style<select><option>Detailed study guide</option><option>Quick overview</option><option>Key bullet points</option></select></label><div className="modal-actions"><Button secondary onClick={close}>Cancel</Button><Button onClick={()=>action()}>Generate summary</Button></div></>}</>}
  </div></div>;
}
