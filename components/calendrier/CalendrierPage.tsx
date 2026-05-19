"use client";

import { useState, type ReactElement } from "react";
import { useCalendrier, CATEGORIE_COLORS, CATEGORIES, type Evenement, type EventCategorie } from "@/hooks/useCalendrier";
import { EventModal } from "./EventModal";
import { useApp } from "@/components/providers/AppProvider";
import { IconCalendar } from "@tabler/icons-react";

const JOURS = ["L", "M", "M", "J", "V", "S", "D"];
const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MOIS_SHORT = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
const JOURS_LONG = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}
function addDays(ymd: string, n: number): string {
  const d = new Date(ymd);
  d.setDate(d.getDate() + n);
  return toYMD(d);
}
function dayOfWeek(ymd: string): string {
  const d = new Date(ymd + "T12:00:00");
  return JOURS_LONG[(d.getDay() + 6) % 7];
}

type View = "mois" | "agenda";

export function CalendrierPage() {
  const { coupleId } = useApp();
  const { evenements, loading, addEvenement, updateEvenement, deleteEvenement } = useCalendrier(coupleId);
  const today = new Date();
  const todayYMD = toYMD(today);

  const [view, setView] = useState<View>("agenda");
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [openEvent, setOpenEvent] = useState<Evenement | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createDate, setCreateDate] = useState<string>(todayYMD);
  const [filterCat, setFilterCat] = useState<EventCategorie | "Toutes">("Toutes");

  function eventsForDay(ymd: string) {
    return evenements.filter((e) =>
      (filterCat === "Toutes" || e.categorie === filterCat) &&
      (e.date === ymd || (e.end_date && e.date <= ymd && e.end_date >= ymd))
    );
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  // Agenda: build next 60 days that have events (or show empty days grouped)
  function buildAgendaDays(): string[] {
    const days: string[] = [];
    for (let i = 0; i < 90; i++) {
      days.push(addDays(todayYMD, i));
    }
    return days;
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</div>
    </div>
  );

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  return (
    <div className="max-w-lg mx-auto px-6 pt-9 pb-32 md:pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "34px",
            fontWeight: 500,
            color: "var(--color-ink)",
            letterSpacing: "-0.8px",
          }}
        >
          Calendrier
        </h1>
        <button
          onClick={() => { setCreateDate(todayYMD); setShowCreate(true); }}
          style={{
            background: "var(--color-forest)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "9px 16px",
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          + Événement
        </button>
      </div>

      {/* View toggle */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          padding: "4px",
          background: "var(--color-cream)",
          borderRadius: "12px",
          marginBottom: "20px",
          width: "fit-content",
        }}
      >
        {(["agenda", "mois"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "7px 18px",
              borderRadius: "9px",
              fontSize: "13px",
              fontFamily: "var(--font-body)",
              background: view === v ? "#fff" : "transparent",
              color: view === v ? "var(--color-ink)" : "var(--color-muted)",
              fontWeight: view === v ? 500 : 400,
              border: "none",
              cursor: "pointer",
              boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}
          >
            {v === "agenda" ? "Agenda" : "Mois"}
          </button>
        ))}
      </div>

      {/* Category filters */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {(["Toutes", ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            style={{
              flexShrink: 0,
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "13px",
              fontFamily: "var(--font-body)",
              border: `1px solid ${filterCat === c ? (c === "Toutes" ? "var(--color-forest)" : CATEGORIE_COLORS[c as EventCategorie].color) : "var(--color-border)"}`,
              background: filterCat === c ? (c === "Toutes" ? "var(--color-forest)" : CATEGORIE_COLORS[c as EventCategorie].bg) : "transparent",
              color: filterCat === c ? (c === "Toutes" ? "#fff" : CATEGORIE_COLORS[c as EventCategorie].color) : "var(--color-ink-soft)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── AGENDA VIEW ── */}
      {view === "agenda" && (() => {
        const agendaDays = buildAgendaDays();
        // Group by month for section headers
        let lastMonth = "";
        const rows: ReactElement[] = [];

        agendaDays.forEach((ymd) => {
          const dayEvs = eventsForDay(ymd);
          const [y, m, d] = ymd.split("-");
          const monthKey = `${y}-${m}`;
          const isToday = ymd === todayYMD;

          // Month separator
          if (monthKey !== lastMonth) {
            lastMonth = monthKey;
            rows.push(
              <div key={`month-${monthKey}`} style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0 12px" }}>
                <span style={{ fontSize: "11px", fontFamily: "var(--font-body)", fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase", color: "var(--color-forest)", flexShrink: 0 }}>
                  {MOIS[parseInt(m) - 1]} {y}
                </span>
                <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
              </div>
            );
          }

          // Day row — always show today, only show other days if they have events
          if (!isToday && dayEvs.length === 0) return;

          rows.push(
            <div key={ymd} style={{ display: "grid", gridTemplateColumns: "52px 1fr", gap: "12px", alignItems: "start", marginBottom: "8px" }}>
              {/* Date column */}
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "11px", color: "var(--color-muted)", textTransform: "capitalize", fontFamily: "var(--font-body)" }}>
                  {dayOfWeek(ymd).slice(0, 3)}
                </p>
                <p style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "20px",
                  fontWeight: 500,
                  color: isToday ? "var(--color-forest)" : "var(--color-ink)",
                  lineHeight: 1,
                }}>
                  {parseInt(d)}
                </p>
                {isToday && (
                  <p style={{ fontSize: "10px", color: "var(--color-forest)", fontFamily: "var(--font-body)", fontWeight: 500 }}>auj.</p>
                )}
              </div>

              {/* Events column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {dayEvs.length === 0 ? (
                  <div style={{ paddingTop: "2px" }}>
                    <button
                      onClick={() => { setCreateDate(ymd); setShowCreate(true); }}
                      style={{
                        fontSize: "12px",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background: "transparent",
                        color: "var(--text-xmuted)",
                        border: "1px dashed var(--color-border)",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      + Ajouter
                    </button>
                  </div>
                ) : (
                  <>
                    {dayEvs.map((ev) => {
                      const col = CATEGORIE_COLORS[ev.categorie];
                      return (
                        <button
                          key={ev.id}
                          onClick={() => setOpenEvent(ev)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "stretch",
                            background: "#fff",
                            border: "0.5px solid var(--color-border)",
                            borderRadius: "12px",
                            overflow: "hidden",
                            textAlign: "left",
                            cursor: "pointer",
                            transition: "transform 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(3px)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
                        >
                          <div style={{ width: "4px", background: col.color, flexShrink: 0 }} />
                          <div style={{ padding: "10px 14px", flex: 1 }}>
                            <p style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 500, color: "var(--color-ink)", marginBottom: "2px" }}>
                              {ev.title}
                            </p>
                            <p style={{ fontSize: "12px", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
                              {ev.time && <span>{ev.time} · </span>}{ev.categorie}
                              {ev.note && <span style={{ color: "var(--text-xmuted)" }}> · {ev.note.slice(0, 35)}{ev.note.length > 35 ? "…" : ""}</span>}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                    <button
                      onClick={() => { setCreateDate(ymd); setShowCreate(true); }}
                      style={{ fontSize: "12px", padding: "4px 8px", borderRadius: "6px", color: "var(--text-xmuted)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", textAlign: "left" }}
                    >
                      + Ajouter
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        });

        if (rows.length === 0) {
          return (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <IconCalendar size={32} stroke={1.25} style={{ color: "var(--color-muted)", margin: "0 auto 8px" }} />
              <p style={{ fontSize: "14px", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>Aucun événement à venir</p>
            </div>
          );
        }

        return <div>{rows}</div>;
      })()}

      {/* ── MONTH VIEW ── */}
      {view === "mois" && (
        <>
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", background: "var(--color-cream)", border: "none", color: "var(--color-muted)", cursor: "pointer" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 500, color: "var(--color-ink)", letterSpacing: "-0.3px" }}>
              {MOIS[viewMonth].charAt(0).toUpperCase() + MOIS[viewMonth].slice(1)} {viewYear}
            </span>
            <button onClick={nextMonth} style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", background: "var(--color-cream)", border: "none", color: "var(--color-muted)", cursor: "pointer" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Grid */}
          <div style={{ background: "#fff", border: "0.5px solid var(--color-border)", borderRadius: "14px", overflow: "hidden", marginBottom: "16px" }}>
            <div className="grid grid-cols-7" style={{ borderBottom: "1px solid var(--color-border)" }}>
              {JOURS.map((j, i) => (
                <div key={i} style={{ padding: "8px 0", textAlign: "center", fontSize: "11px", fontWeight: 500, color: "var(--text-xmuted)", fontFamily: "var(--font-body)" }}>{j}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvents = eventsForDay(ymd);
                const isToday = ymd === todayYMD;
                const isSelected = ymd === selectedDate;
                return (
                  <button key={day} onClick={() => setSelectedDate(isSelected ? null : ymd)}
                    className="relative flex flex-col items-center pt-1.5 pb-1 min-h-[52px] transition-colors"
                    style={{ background: isSelected ? "var(--color-module-calendar)" : "transparent" }}>
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        fontSize: "12px",
                        fontWeight: isToday ? 500 : 400,
                        marginBottom: "2px",
                        fontFamily: isToday ? "var(--font-display)" : "var(--font-body)",
                        background: isToday ? "var(--color-forest)" : "transparent",
                        color: isToday ? "#fff" : isSelected ? "var(--color-forest)" : "var(--color-ink)",
                      }}
                    >
                      {day}
                    </span>
                    <div className="flex gap-0.5 flex-wrap justify-center px-1">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <span key={ev.id} style={{ width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0, display: "inline-block", background: CATEGORIE_COLORS[ev.categorie].color }} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day panel */}
          {selectedDate && (() => {
            const dayEvs = eventsForDay(selectedDate);
            const [, m, d] = selectedDate.split("-");
            return (
              <div style={{ background: "#fff", border: "0.5px solid var(--color-border)", borderRadius: "14px", padding: "16px 20px" }}>
                <div className="flex items-center justify-between mb-3">
                  <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
                    {dayOfWeek(selectedDate)} {parseInt(d)} {MOIS[parseInt(m) - 1]}
                  </p>
                  <button
                    onClick={() => { setCreateDate(selectedDate); setShowCreate(true); }}
                    style={{ fontSize: "12px", fontWeight: 500, padding: "5px 12px", borderRadius: "8px", background: "var(--color-module-calendar)", color: "var(--color-ink)", border: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}
                  >
                    + Ajouter
                  </button>
                </div>
                {dayEvs.length === 0 ? (
                  <p style={{ fontSize: "13px", textAlign: "center", padding: "8px 0", color: "var(--text-xmuted)", fontFamily: "var(--font-body)" }}>Rien ce jour</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {dayEvs.map((ev) => {
                      const col = CATEGORIE_COLORS[ev.categorie];
                      return (
                        <button
                          key={ev.id}
                          onClick={() => setOpenEvent(ev)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "stretch",
                            background: "#fff",
                            border: "0.5px solid var(--color-border)",
                            borderRadius: "10px",
                            overflow: "hidden",
                            textAlign: "left",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ width: "4px", background: col.color, flexShrink: 0 }} />
                          <div style={{ padding: "10px 14px", flex: 1 }}>
                            <p style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 500, color: "var(--color-ink)" }}>{ev.title}</p>
                            <p style={{ fontSize: "12px", color: col.color, fontFamily: "var(--font-body)" }}>
                              {ev.time && <span>{ev.time} · </span>}{ev.categorie}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </>
      )}

      {/* Modals */}
      {showCreate && (
        <EventModal
          initial={{ date: createDate }}
          onClose={() => setShowCreate(false)}
          onSave={(ev) => addEvenement(ev).then(() => {})}
        />
      )}
      {openEvent && (
        <EventModal
          initial={openEvent}
          onClose={() => setOpenEvent(null)}
          onSave={(ev) => updateEvenement(openEvent.id, ev)}
          onDelete={() => deleteEvenement(openEvent.id)}
        />
      )}
    </div>
  );
}
