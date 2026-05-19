"use client";

import { useState, type ReactElement } from "react";
import { useCalendrier, CATEGORIE_COLORS, CATEGORIES, type Evenement, type EventCategorie } from "@/hooks/useCalendrier";
import { EventModal } from "./EventModal";

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

export function CalendrierPage({ coupleId }: { coupleId: string }) {
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
    <div className="max-w-lg mx-auto px-4 pt-6 pb-32 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
          Calendrier 📅
        </h1>
        <button
          onClick={() => { setCreateDate(todayYMD); setShowCreate(true); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
          style={{ background: "var(--pastel-purple)", color: "var(--accent-purple)" }}
        >
          + Événement
        </button>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 p-1 rounded-2xl mb-5" style={{ background: "var(--surface-2)" }}>
        {(["agenda", "mois"] as View[]).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 capitalize"
            style={{
              background: view === v ? "var(--bg)" : "transparent",
              color: view === v ? "var(--text)" : "var(--text-muted)",
              boxShadow: view === v ? "var(--shadow-sm)" : "none",
              fontFamily: "var(--font-display)",
            }}>
            {v === "agenda" ? "📋 Agenda" : "🗓 Mois"}
          </button>
        ))}
      </div>

      {/* Category filters */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-none">
        {(["Toutes", ...CATEGORIES] as const).map((c) => (
          <button key={c} onClick={() => setFilterCat(c)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={{
              background: filterCat === c
                ? (c === "Toutes" ? "var(--accent-purple)" : CATEGORIE_COLORS[c as EventCategorie].bg)
                : "var(--surface-2)",
              color: filterCat === c
                ? (c === "Toutes" ? "white" : CATEGORIE_COLORS[c as EventCategorie].color)
                : "var(--text-muted)",
            }}>
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
              <div key={`month-${monthKey}`} className="flex items-center gap-3 mt-5 mb-2 first:mt-0">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent-purple)", fontFamily: "var(--font-display)" }}>
                  {MOIS[parseInt(m) - 1]} {y}
                </span>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              </div>
            );
          }

          // Day row — always show today, only show other days if they have events
          if (!isToday && dayEvs.length === 0) return;

          rows.push(
            <div key={ymd} className="flex gap-3 mb-3">
              {/* Date column */}
              <div className="flex-shrink-0 w-14 text-right pt-0.5">
                <p className="text-xs font-medium" style={{ color: "var(--text-xmuted)" }}>
                  {dayOfWeek(ymd).slice(0, 3)}
                </p>
                <p className={`text-2xl font-bold leading-none`}
                  style={{
                    fontFamily: "var(--font-display)",
                    color: isToday ? "var(--accent-purple)" : "var(--text)",
                  }}>
                  {parseInt(d)}
                </p>
                {isToday && (
                  <p className="text-xs font-bold" style={{ color: "var(--accent-purple)" }}>auj.</p>
                )}
              </div>

              {/* Events column */}
              <div className="flex-1 min-w-0 space-y-1.5">
                {dayEvs.length === 0 ? (
                  <div className="flex items-center h-full py-2">
                    <button
                      onClick={() => { setCreateDate(ymd); setShowCreate(true); }}
                      className="text-xs px-3 py-1.5 rounded-xl"
                      style={{ background: "var(--surface-2)", color: "var(--text-xmuted)", border: "1px dashed var(--border)" }}
                    >
                      + Ajouter
                    </button>
                  </div>
                ) : (
                  <>
                    {dayEvs.map((ev) => {
                      const col = CATEGORIE_COLORS[ev.categorie];
                      return (
                        <button key={ev.id} onClick={() => setOpenEvent(ev)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-left"
                          style={{ background: col.pastel, border: `1px solid ${col.color}25` }}>
                          <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: col.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>
                              {ev.title}
                            </p>
                            <p className="text-xs" style={{ color: col.color }}>
                              {ev.time && <span>{ev.time} · </span>}{ev.categorie}
                              {ev.note && <span className="text-xs" style={{ color: "var(--text-xmuted)" }}> · {ev.note.slice(0, 35)}{ev.note.length > 35 ? "…" : ""}</span>}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                    <button
                      onClick={() => { setCreateDate(ymd); setShowCreate(true); }}
                      className="text-xs px-2 py-1 rounded-lg"
                      style={{ color: "var(--text-xmuted)" }}
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
            <div className="text-center py-16">
              <p className="text-3xl mb-2">📅</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun événement à venir</p>
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
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl"
              style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-base font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
              {MOIS[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl"
              style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Grid */}
          <div className="rounded-3xl overflow-hidden mb-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="grid grid-cols-7 border-b" style={{ borderColor: "var(--border)" }}>
              {JOURS.map((j, i) => (
                <div key={i} className="py-2 text-center text-xs font-bold" style={{ color: "var(--text-xmuted)" }}>{j}</div>
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
                    style={{ background: isSelected ? "var(--pastel-purple)" : "transparent" }}>
                    <span className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mb-0.5"
                      style={{
                        background: isToday ? "var(--accent-purple)" : "transparent",
                        color: isToday ? "white" : isSelected ? "var(--accent-purple)" : "var(--text)",
                      }}>
                      {day}
                    </span>
                    <div className="flex gap-0.5 flex-wrap justify-center px-1">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <span key={ev.id} className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: CATEGORIE_COLORS[ev.categorie].color }} />
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
            const [y, m, d] = selectedDate.split("-");
            return (
              <div className="rounded-3xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    {dayOfWeek(selectedDate)} {parseInt(d)} {MOIS[parseInt(m) - 1]}
                  </p>
                  <button onClick={() => { setCreateDate(selectedDate); setShowCreate(true); }}
                    className="text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ background: "var(--pastel-purple)", color: "var(--accent-purple)" }}>
                    + Ajouter
                  </button>
                </div>
                {dayEvs.length === 0 ? (
                  <p className="text-sm text-center py-2" style={{ color: "var(--text-xmuted)" }}>Rien ce jour</p>
                ) : (
                  <div className="space-y-2">
                    {dayEvs.map((ev) => {
                      const col = CATEGORIE_COLORS[ev.categorie];
                      return (
                        <button key={ev.id} onClick={() => setOpenEvent(ev)}
                          className="w-full flex items-center gap-3 p-3 rounded-2xl text-left"
                          style={{ background: col.pastel, border: `1px solid ${col.color}20` }}>
                          <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: col.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>{ev.title}</p>
                            <p className="text-xs" style={{ color: col.color }}>
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
