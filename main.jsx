import { useState, useEffect } from "react";

const STORAGE_KEY = "ffi-assessments-v2";

const PRE_QUESTIONS = [
  {
    id: "q1", section: "knowledge", label: "Q1 · Compound Interest",
    text: "You put $100 into a savings account that pays 2% interest per year. You don't touch the money. After 5 years, how much will be in the account?",
    options: ["More than $110", "Exactly $110", "Exactly $102", "Less than $102", "I don't know"],
    correct: 0
  },
  {
    id: "q2", section: "knowledge", label: "Q2 · Inflation",
    text: "Your savings account pays 1% interest per year. Inflation is 2% per year. After one year, could you buy more, less, or the same amount with the money in your account compared to today?",
    options: ["More than today", "Exactly the same as today", "Less than today", "I don't know"],
    correct: 2
  },
  {
    id: "q3", section: "knowledge", label: "Q3 · Risk & Diversification",
    text: "True or false: Buying stock in a single company is usually SAFER than buying a fund that owns stock in many different companies.",
    options: ["True — one company is safer", "False — a fund with many companies is safer", "I don't know"],
    correct: 1
  },
  {
    id: "q4", section: "knowledge", label: "Q4 · Time & Compounding",
    text: "Taylor starts saving $50 every month at age 16. Morgan starts saving $50 every month at age 25. They both earn the same interest rate. Who will have more money at age 55?",
    options: ["Taylor — by a lot, because of the extra years of compounding", "Morgan — older people earn more interest", "About the same — they save the same amount per month", "I don't know"],
    correct: 0
  },
  {
    id: "q5", section: "knowledge", label: "Q5 · Budgeting",
    text: "Sam earns $600/month from a part-time job. Fixed costs (phone, transportation, subscriptions) are $180. Sam wants to save 15% of total income. How much is left over for spending?",
    options: ["$420", "$330", "$510", "I don't know"],
    correct: 1
  },
  {
    id: "q6", section: "knowledge", label: "Q6 · Credit Card Debt",
    text: "You owe $1,000 on a credit card that charges 20% annual interest. You pay only the minimum each month. Which statement is TRUE?",
    options: ["You will eventually pay back much more than $1,000 in total", "You will pay back exactly $1,000 because that's what you owe", "The balance goes down by the same amount every month", "I don't know"],
    correct: 0
  },
  {
    id: "q7", section: "confidence", label: "Q7 · Confidence",
    text: "How confident do you feel about managing money — things like budgeting, saving, and making smart financial choices?",
    options: ["1 — Not confident at all", "2 — A little confident", "3 — Somewhat confident", "4 — Confident", "5 — Very confident"],
    correct: null
  },
  {
    id: "q8", section: "confidence", label: "Q8 · Financial Worry",
    text: "How much do you worry about money or your family's finances?",
    options: ["1 — Never", "2 — Rarely", "3 — Sometimes", "4 — Often", "5 — All the time"],
    correct: null
  }
];

const DEMO_QUESTIONS = [
  { id: "d1", text: "How old are you?", options: ["10–12", "13–14", "15–16", "17–18"] },
  { id: "d2", text: "What is your gender?", options: ["Male", "Female", "Non-binary / Other", "Prefer not to say"] },
  { id: "d3", text: "How often does your family talk about money, saving, or finances at home?", options: ["Never or almost never", "A few times a year", "About once a month", "Once a week or more"] },
  { id: "d4", text: "Did at least one of your parents or guardians go to college?", options: ["Yes", "No", "I'm not sure"] },
  { id: "d5", text: "Does anyone in your household invest money? (stocks, 401k, mutual funds, real estate)", options: ["Yes", "No", "I'm not sure"] },
  { id: "d6", text: "Have you ever taken a class or workshop about money before today?", options: ["Yes", "No"] },
  { id: "d7", text: "Where do you learn the MOST about money? (Pick one)", options: ["Parents / Family", "School", "Social media (TikTok, YouTube, Instagram)", "Friends", "I haven't really learned about money anywhere"] }
];

const POST_BONUS = [
  { id: "b1", text: "After today, which of these are you more likely to do? (Pick all that apply)", options: ["Start saving money regularly", "Talk to my family about finances", "Learn more about investing", "Create a budget for myself", "None of the above"], multi: true },
];

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { sessions: [], responses: [] };
  } catch { return { sessions: [], responses: [] }; }
}

function saveAll(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
}

function generateId() {
  return "P" + Math.random().toString(36).substr(2, 6).toUpperCase();
}

function RadioGroup({ options, value, onChange, multi }) {
  if (multi) {
    const selected = value || [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
        {options.map((o, i) => (
          <label key={i} onClick={() => {
            const next = selected.includes(i) ? selected.filter(x => x !== i) : [...selected, i];
            onChange(next);
          }} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
            borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
            background: selected.includes(i) ? "#d8f3dc" : "#f8f8f8",
            border: selected.includes(i) ? "2px solid #2d6a4f" : "2px solid #e8e8e8",
            fontSize: 14, fontFamily: "'DM Sans', sans-serif"
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 4, border: "2px solid #aaa", flexShrink: 0,
              background: selected.includes(i) ? "#2d6a4f" : "#fff", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {selected.includes(i) && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
            </div>
            <span>{o}</span>
          </label>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
      {options.map((o, i) => (
        <label key={i} onClick={() => onChange(i)} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
          borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
          background: value === i ? "#d8f3dc" : "#f8f8f8",
          border: value === i ? "2px solid #2d6a4f" : "2px solid #e8e8e8",
          fontSize: 14, fontFamily: "'DM Sans', sans-serif"
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: 50, border: "2px solid #aaa", flexShrink: 0,
            background: value === i ? "#2d6a4f" : "#fff",
          }} />
          <span>{o}</span>
        </label>
      ))}
    </div>
  );
}

function QuestionCard({ label, text, options, value, onChange, multi }) {
  return (
    <div style={{ marginBottom: 20, padding: "18px 20px", background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
      {label && <div style={{ fontSize: 11, fontWeight: 700, color: "#2d6a4f", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>}
      <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.45, marginBottom: 4 }}>{text}</div>
      <RadioGroup options={options} value={value} onChange={onChange} multi={multi} />
    </div>
  );
}

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888", marginBottom: 4 }}>
        <span>Question {current} of {total}</span><span>{pct}%</span>
      </div>
      <div style={{ height: 6, background: "#e8e8e8", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #2d6a4f, #52b788)", borderRadius: 3, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

function LandingPage({ onStart }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#d4a843", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Financial Freedom Initiative</div>
      <h1 style={{ fontSize: 28, color: "#1b4332", margin: "0 0 8px", fontWeight: 800 }}>Workshop Assessment</h1>
      <p style={{ color: "#666", fontSize: 14, maxWidth: 400, margin: "0 auto 24px", lineHeight: 1.6 }}>
        This short assessment helps us understand what you know about money and how our workshop can help. Your answers are <strong>100% anonymous</strong>.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 300, margin: "0 auto" }}>
        <button onClick={() => onStart("pre")} style={{ padding: "14px 24px", fontSize: 16, fontWeight: 700, color: "#fff", background: "#1b4332", border: "none", borderRadius: 12, cursor: "pointer" }}>
          📋 Take Pre-Workshop Assessment
        </button>
        <button onClick={() => onStart("post")} style={{ padding: "14px 24px", fontSize: 16, fontWeight: 700, color: "#1b4332", background: "#d8f3dc", border: "2px solid #2d6a4f", borderRadius: 12, cursor: "pointer" }}>
          ✅ Take Post-Workshop Assessment
        </button>
        <button onClick={() => onStart("dashboard")} style={{ padding: "12px 24px", fontSize: 14, fontWeight: 600, color: "#666", background: "transparent", border: "1px solid #ddd", borderRadius: 12, cursor: "pointer" }}>
          📊 Facilitator Dashboard
        </button>
      </div>
    </div>
  );
}

function AssessmentPage({ type, onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [participantId, setParticipantId] = useState(() => generateId());
  const [sessionCode, setSessionCode] = useState("");
  const [customId, setCustomId] = useState("");
  const [started, setStarted] = useState(false);

  const isPre = type === "pre";
  const allQuestions = isPre
    ? [...PRE_QUESTIONS, ...DEMO_QUESTIONS]
    : [...PRE_QUESTIONS, ...POST_BONUS];
  const total = allQuestions.length;

  if (!started) {
    return (
      <div style={{ padding: "30px 20px", textAlign: "center", maxWidth: 400, margin: "0 auto" }}>
        <button onClick={onBack} style={{ position: "absolute", top: 12, left: 12, background: "none", border: "none", fontSize: 14, color: "#888", cursor: "pointer" }}>← Back</button>
        <h2 style={{ fontSize: 22, color: "#1b4332", marginBottom: 6 }}>{isPre ? "Pre-Workshop" : "Post-Workshop"} Assessment</h2>
        
        {isPre ? (
          <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>Your ID: <strong style={{ color: "#2d6a4f", fontSize: 18 }}>{participantId}</strong><br />Screenshot this or write it down — you'll need it for the post-test.</p>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>Enter the Participant ID from your pre-test:</p>
            <input
              type="text" placeholder="e.g. P3KX9M" value={customId}
              onChange={e => { setCustomId(e.target.value.toUpperCase()); setParticipantId(e.target.value.toUpperCase()); }}
              style={{ padding: "12px 16px", fontSize: 16, border: "2px solid #ddd", borderRadius: 10, width: "100%", maxWidth: 260, textAlign: "center", marginBottom: 8, fontWeight: 700, color: "#2d6a4f" }}
            />
          </div>
        )}

        <input
          type="text" placeholder="Session code (e.g. LIB-0412)" value={sessionCode}
          onChange={e => setSessionCode(e.target.value.toUpperCase())}
          style={{ padding: "12px 16px", fontSize: 16, border: "2px solid #ddd", borderRadius: 10, width: "100%", maxWidth: 260, textAlign: "center", marginBottom: 16, display: "block", margin: "0 auto 16px" }}
        />

        <button onClick={() => {
          const canStart = isPre ? sessionCode.trim() : (sessionCode.trim() && customId.trim());
          if (canStart) setStarted(true);
        }} disabled={isPre ? !sessionCode.trim() : (!sessionCode.trim() || !customId.trim())} style={{
          padding: "14px 32px", fontSize: 16, fontWeight: 700, color: "#fff",
          background: (isPre ? sessionCode.trim() : (sessionCode.trim() && customId.trim())) ? "#1b4332" : "#ccc",
          border: "none", borderRadius: 12, cursor: (isPre ? sessionCode.trim() : (sessionCode.trim() && customId.trim())) ? "pointer" : "default"
        }}>Begin Assessment</button>
      </div>
    );
  }

  const q = allQuestions[step];
  const isDemo = DEMO_QUESTIONS.some(d => d.id === q.id);

  const handleNext = () => {
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      const data = loadAll();
      const knowledgeQs = PRE_QUESTIONS.filter(q => q.section === "knowledge");
      const big3 = ["q1","q2","q3"];
      
      const entry = {
        participantId, sessionCode, type, timestamp: new Date().toISOString(), answers: { ...answers },
        big3Score: big3.filter(id => { const qq = knowledgeQs.find(q => q.id === id); return qq && answers[id] === qq.correct; }).length,
        extScore: knowledgeQs.filter(qq => answers[qq.id] === qq.correct).length,
        confidence: typeof answers["q7"] === "number" ? answers["q7"] + 1 : null,
        worry: typeof answers["q8"] === "number" ? answers["q8"] + 1 : null,
        idkCount: knowledgeQs.filter(qq => answers[qq.id] === qq.options.length - 1).length,
      };

      if (isPre) {
        entry.demographics = {};
        DEMO_QUESTIONS.forEach(d => { entry.demographics[d.id] = d.options[answers[d.id]] || "N/A"; });
      }
      if (!isPre) {
        entry.behavioral = {};
        POST_BONUS.forEach(b => { entry.behavioral[b.id] = answers[b.id]; });
      }

      data.responses.push(entry);
      saveAll(data);
      onComplete(entry);
    }
  };

  return (
    <div style={{ padding: "16px 20px", maxWidth: 520, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 13, color: "#888", cursor: "pointer" }}>← Exit</button>
        <span style={{ fontSize: 12, color: "#aaa" }}>ID: {participantId}</span>
      </div>
      <ProgressBar current={step + 1} total={total} />
      {isDemo && <div style={{ fontSize: 11, fontWeight: 700, color: "#d4a843", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>About You (Anonymous)</div>}
      <QuestionCard
        label={q.label || null}
        text={q.text}
        options={q.options}
        value={answers[q.id]}
        onChange={v => setAnswers({ ...answers, [q.id]: v })}
        multi={q.multi}
      />
      <button onClick={handleNext} disabled={answers[q.id] === undefined} style={{
        width: "100%", padding: "14px", fontSize: 16, fontWeight: 700, color: "#fff",
        background: answers[q.id] !== undefined ? "#1b4332" : "#ccc",
        border: "none", borderRadius: 12, cursor: answers[q.id] !== undefined ? "pointer" : "default", marginTop: 4
      }}>
        {step < total - 1 ? "Next →" : "Submit ✓"}
      </button>
    </div>
  );
}

function CompletePage({ entry, onBack }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
      <h2 style={{ fontSize: 22, color: "#1b4332", marginBottom: 8 }}>Assessment Complete!</h2>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>Your Participant ID: <strong style={{ color: "#2d6a4f" }}>{entry.participantId}</strong></p>
      {entry.type === "pre" && <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>Remember this ID — you'll need it for the post-workshop assessment.</p>}
      <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>
        Big Three Score: <strong>{entry.big3Score}/3</strong> · Extended Score: <strong>{entry.extScore}/6</strong>
      </p>
      <button onClick={onBack} style={{ padding: "14px 32px", fontSize: 16, fontWeight: 700, color: "#fff", background: "#1b4332", border: "none", borderRadius: 12, cursor: "pointer" }}>
        Return to Home
      </button>
    </div>
  );
}

function Dashboard({ onBack }) {
  const [data, setData] = useState(() => loadAll());

  const responses = data?.responses || [];
  const preR = responses.filter(r => r.type === "pre");
  const postR = responses.filter(r => r.type === "post");

  const avg = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : "—";
  const pct = (arr, fn) => arr.length ? Math.round((arr.filter(fn).length / arr.length) * 100) + "%" : "—";

  const famTalkGroups = {};
  preR.forEach(r => {
    if (r.demographics?.d3) {
      const key = r.demographics.d3;
      if (!famTalkGroups[key]) famTalkGroups[key] = [];
      famTalkGroups[key].push(r.big3Score);
    }
  });

  const famInvGroups = {};
  preR.forEach(r => {
    if (r.demographics?.d5) {
      const key = r.demographics.d5;
      if (!famInvGroups[key]) famInvGroups[key] = [];
      famInvGroups[key].push(r.big3Score);
    }
  });

  const Stat = ({ label, pre, post }) => (
    <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", border: "1px solid #eee", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div><span style={{ fontSize: 11, color: "#aaa" }}>Pre </span><span style={{ fontSize: 22, fontWeight: 800, color: "#1b4332" }}>{pre}</span></div>
        <div style={{ fontSize: 18, color: "#ccc" }}>→</div>
        <div><span style={{ fontSize: 11, color: "#aaa" }}>Post </span><span style={{ fontSize: 22, fontWeight: 800, color: "#2d6a4f" }}>{post}</span></div>
      </div>
    </div>
  );

  const DemoBreakdown = ({ title, groups }) => (
    Object.keys(groups).length > 0 && (
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #eee", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#1b4332", marginBottom: 8 }}>{title}</div>
        {Object.entries(groups).sort().map(([key, scores]) => (
          <div key={key} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid #f5f5f5" }}>
            <span style={{ color: "#555" }}>{key}</span>
            <span style={{ fontWeight: 700, color: "#2d6a4f" }}>{avg(scores)}/3 <span style={{ color: "#aaa", fontWeight: 400 }}>({scores.length})</span></span>
          </div>
        ))}
      </div>
    )
  );

  const handleExport = () => {
    const rows = [["ParticipantID","Type","Session","Timestamp","Big3","Extended","Confidence","Worry","IDK_Count","Age","Gender","FamTalk","ParentCollege","FamInvest","PriorEd","MoneySource"]];
    responses.forEach(r => {
      const d = r.demographics || {};
      rows.push([r.participantId, r.type, r.sessionCode, r.timestamp, r.big3Score, r.extScore, r.confidence||"", r.worry||"", r.idkCount, d.d1||"", d.d2||"", d.d3||"", d.d4||"", d.d5||"", d.d6||"", d.d7||""]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `FFI_Data_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm("This will delete ALL assessment data. Are you sure?")) {
      saveAll({ sessions: [], responses: [] });
      setData({ sessions: [], responses: [] });
    }
  };

  return (
    <div style={{ padding: "16px 20px", maxWidth: 600, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 13, color: "#888", cursor: "pointer", marginBottom: 8 }}>← Back</button>
      <h2 style={{ fontSize: 22, color: "#1b4332", margin: "0 0 4px" }}>📊 Facilitator Dashboard</h2>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>{preR.length} pre-assessments · {postR.length} post-assessments</p>

      {responses.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
          <p>No assessment data yet. Have students take the pre-workshop assessment to see results here.</p>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            <Stat label="Avg Big Three (/3)" pre={avg(preR.map(r => r.big3Score))} post={avg(postR.map(r => r.big3Score))} />
            <Stat label="Avg Extended (/6)" pre={avg(preR.map(r => r.extScore))} post={avg(postR.map(r => r.extScore))} />
            <Stat label="% All 3 Correct" pre={pct(preR, r => r.big3Score === 3)} post={pct(postR, r => r.big3Score === 3)} />
            <Stat label="Avg Confidence (1-5)" pre={avg(preR.filter(r => r.confidence).map(r => r.confidence))} post={avg(postR.filter(r => r.confidence).map(r => r.confidence))} />
            <Stat label="Avg IDK Count" pre={avg(preR.map(r => r.idkCount))} post={avg(postR.map(r => r.idkCount))} />
          </div>

          <DemoBreakdown title="Big Three by Family Discussion Frequency (Pre)" groups={famTalkGroups} />
          <DemoBreakdown title="Big Three by Family Investment Exposure (Pre)" groups={famInvGroups} />

          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <button onClick={handleExport} style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 700, color: "#1b4332", background: "#d8f3dc", border: "2px solid #2d6a4f", borderRadius: 10, cursor: "pointer" }}>📥 Export CSV</button>
            <button onClick={handleReset} style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "#c0392b", background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, cursor: "pointer" }}>🗑 Reset</button>
          </div>

          <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #eee" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1b4332", marginBottom: 8 }}>All Responses</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    {["ID","Type","Session","Big3","Ext","Conf","IDK"].map(h => (
                      <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700, color: "#555", borderBottom: "1px solid #ddd" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.slice().reverse().map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "5px 8px", color: "#2d6a4f", fontWeight: 600 }}>{r.participantId}</td>
                      <td style={{ padding: "5px 8px" }}>{r.type}</td>
                      <td style={{ padding: "5px 8px" }}>{r.sessionCode}</td>
                      <td style={{ padding: "5px 8px", fontWeight: 700 }}>{r.big3Score}/3</td>
                      <td style={{ padding: "5px 8px", fontWeight: 700 }}>{r.extScore}/6</td>
                      <td style={{ padding: "5px 8px" }}>{r.confidence || "—"}</td>
                      <td style={{ padding: "5px 8px" }}>{r.idkCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("landing");
  const [assessType, setAssessType] = useState(null);
  const [completedEntry, setCompletedEntry] = useState(null);

  const handleStart = (type) => {
    if (type === "dashboard") { setPage("dashboard"); return; }
    setAssessType(type);
    setPage("assessment");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf8", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      {page === "landing" && <LandingPage onStart={handleStart} />}
      {page === "assessment" && (
        <AssessmentPage
          type={assessType}
          onComplete={(entry) => { setCompletedEntry(entry); setPage("complete"); }}
          onBack={() => setPage("landing")}
        />
      )}
      {page === "complete" && <CompletePage entry={completedEntry} onBack={() => setPage("landing")} />}
      {page === "dashboard" && <Dashboard onBack={() => setPage("landing")} />}
    </div>
  );
}
