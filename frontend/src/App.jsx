import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:8080/api";
const fmt = (n) => `$${Number(n).toFixed(2)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : "-";

const STATUS_COLOR = {
  PENDING: "#f59e0b", CONFIRMED: "#3b82f6", CHECKED_IN: "#10b981",
  CHECKED_OUT: "#6b7280", CANCELLED: "#ef4444"
};
const PAY_COLOR = { PENDING: "#f59e0b", COMPLETED: "#10b981", FAILED: "#ef4444", REFUNDED: "#8b5cf6" };

async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" }, ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Request failed"); }
  return res.json().catch(() => ({}));
}

function Badge({ label, color }) {
  return <span style={{ background: color + "22", color, border: `1px solid ${color}55`, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{label}</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000088", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#1e2330", borderRadius: 16, padding: 28, minWidth: 380, maxWidth: 540, width: "90%", boxShadow: "0 24px 60px #00000088", border: "1px solid #2d3447" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: "#e2e8f0", fontSize: 18 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", color: "#94a3b8", fontSize: 12, marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>}
      <input {...props} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #2d3447", background: "#131720", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none", ...props.style }} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", color: "#94a3b8", fontSize: 12, marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>}
      <select {...props} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #2d3447", background: "#131720", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none" }}>
        {children}
      </select>
    </div>
  );
}

function Btn({ children, variant = "primary", ...props }) {
  const styles = {
    primary: { background: "#6366f1", color: "#fff" },
    success: { background: "#10b981", color: "#fff" },
    danger:  { background: "#ef4444", color: "#fff" },
    ghost:   { background: "#2d3447", color: "#e2e8f0" },
  };
  return (
    <button {...props} style={{ padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "opacity .15s", ...styles[variant], ...(props.disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}), ...props.style }}>
      {children}
    </button>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ reservations, rooms, guests }) {
  const stats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === "CONFIRMED").length,
    checkedIn: reservations.filter(r => r.status === "CHECKED_IN").length,
    revenue: reservations.filter(r => r.payment?.status === "COMPLETED")
                         .reduce((s, r) => s + (r.totalAmount || 0), 0)
  };
  const cards = [
    { label: "Total Bookings", value: stats.total, color: "#6366f1", icon: "📋" },
    { label: "Confirmed",      value: stats.confirmed, color: "#3b82f6", icon: "✅" },
    { label: "Checked In",     value: stats.checkedIn, color: "#10b981", icon: "🛎" },
    { label: "Revenue",        value: fmt(stats.revenue), color: "#f59e0b", icon: "💰" },
    { label: "Rooms",          value: rooms.length, color: "#8b5cf6", icon: "🏨" },
    { label: "Guests",         value: guests.length, color: "#ec4899", icon: "👥" },
  ];
  return (
    <div>
      <h2 style={{ color: "#e2e8f0", marginBottom: 24 }}>Overview</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: "#1e2330", borderRadius: 14, padding: "20px 22px", border: `1px solid ${c.color}33` }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>
      <h3 style={{ color: "#94a3b8", marginBottom: 14 }}>Recent Bookings</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr style={{ borderBottom: "1px solid #2d3447" }}>
          {["ID","Guest","Room","Check-In","Check-Out","Status","Amount"].map(h => (
            <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "#64748b", fontSize: 12, textTransform: "uppercase" }}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {reservations.slice(0, 8).map(r => (
            <tr key={r.id} style={{ borderBottom: "1px solid #1a1f2e" }}>
              <td style={{ padding: "12px", color: "#64748b", fontSize: 13 }}>#{r.id}</td>
              <td style={{ padding: "12px", color: "#e2e8f0", fontSize: 13 }}>{r.guest?.name}</td>
              <td style={{ padding: "12px", color: "#94a3b8", fontSize: 13 }}>{r.room?.roomNumber}</td>
              <td style={{ padding: "12px", color: "#94a3b8", fontSize: 13 }}>{fmtDate(r.checkIn)}</td>
              <td style={{ padding: "12px", color: "#94a3b8", fontSize: 13 }}>{fmtDate(r.checkOut)}</td>
              <td style={{ padding: "12px" }}><Badge label={r.status} color={STATUS_COLOR[r.status]} /></td>
              <td style={{ padding: "12px", color: "#10b981", fontWeight: 600, fontSize: 13 }}>{fmt(r.totalAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Rooms ─────────────────────────────────────────────────────────────────────
function Rooms({ rooms, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ roomNumber: "", type: "SINGLE", pricePerNight: "", description: "" });
  const [msg, setMsg] = useState(null);
  const types = ["SINGLE","DOUBLE","SUITE","DELUXE","PENTHOUSE"];
  const typeColor = { SINGLE:"#3b82f6", DOUBLE:"#10b981", SUITE:"#8b5cf6", DELUXE:"#f59e0b", PENTHOUSE:"#ec4899" };

  const save = async () => {
    try {
      await api("/rooms", { method: "POST", body: { ...form, pricePerNight: parseFloat(form.pricePerNight), available: true } });
      setShowAdd(false); setForm({ roomNumber: "", type: "SINGLE", pricePerNight: "", description: "" }); onRefresh();
    } catch (e) { setMsg(e.message); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: "#e2e8f0", margin: 0 }}>Rooms</h2>
        <Btn onClick={() => setShowAdd(true)}>+ Add Room</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {rooms.map(r => (
          <div key={r.id} style={{ background: "#1e2330", borderRadius: 14, padding: 20, border: "1px solid #2d3447" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0" }}>#{r.roomNumber}</span>
              <Badge label={r.type} color={typeColor[r.type] || "#6366f1"} />
            </div>
            <div style={{ color: "#10b981", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{fmt(r.pricePerNight)}<span style={{ color: "#64748b", fontSize: 12, fontWeight: 400 }}>/night</span></div>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 10 }}>{r.description}</div>
            <Badge label={r.available ? "Available" : "Occupied"} color={r.available ? "#10b981" : "#ef4444"} />
          </div>
        ))}
      </div>
      {showAdd && (
        <Modal title="Add New Room" onClose={() => setShowAdd(false)}>
          {msg && <div style={{ color: "#ef4444", marginBottom: 12, fontSize: 13 }}>{msg}</div>}
          <Input label="Room Number" value={form.roomNumber} onChange={e => setForm({...form, roomNumber: e.target.value})} />
          <Select label="Type" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            {types.map(t => <option key={t}>{t}</option>)}
          </Select>
          <Input label="Price per Night ($)" type="number" value={form.pricePerNight} onChange={e => setForm({...form, pricePerNight: e.target.value})} />
          <Input label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={save}>Save Room</Btn>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Guests ────────────────────────────────────────────────────────────────────
function Guests({ guests, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", passportNumber: "" });
  const [msg, setMsg] = useState(null);

  const save = async () => {
    try {
      await api("/guests", { method: "POST", body: form });
      setShowAdd(false); setForm({ name: "", email: "", phone: "", passportNumber: "" }); onRefresh();
    } catch (e) { setMsg(e.message); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: "#e2e8f0", margin: 0 }}>Guests</h2>
        <Btn onClick={() => setShowAdd(true)}>+ Add Guest</Btn>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr style={{ borderBottom: "1px solid #2d3447" }}>
          {["ID","Name","Email","Phone","Passport"].map(h => (
            <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "#64748b", fontSize: 12, textTransform: "uppercase" }}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {guests.map(g => (
            <tr key={g.id} style={{ borderBottom: "1px solid #1a1f2e" }}>
              <td style={{ padding: "12px", color: "#64748b" }}>#{g.id}</td>
              <td style={{ padding: "12px", color: "#e2e8f0", fontWeight: 600 }}>{g.name}</td>
              <td style={{ padding: "12px", color: "#94a3b8" }}>{g.email}</td>
              <td style={{ padding: "12px", color: "#94a3b8" }}>{g.phone}</td>
              <td style={{ padding: "12px", color: "#64748b", fontFamily: "monospace" }}>{g.passportNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showAdd && (
        <Modal title="Add Guest" onClose={() => setShowAdd(false)}>
          {msg && <div style={{ color: "#ef4444", marginBottom: 12, fontSize: 13 }}>{msg}</div>}
          <Input label="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <Input label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <Input label="Passport Number" value={form.passportNumber} onChange={e => setForm({...form, passportNumber: e.target.value})} />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={save}>Save Guest</Btn>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Reservations ──────────────────────────────────────────────────────────────
function Reservations({ reservations, guests, rooms, onRefresh }) {
  const [showBook, setShowBook] = useState(false);
  const [payModal, setPayModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [msg, setMsg] = useState(null);
  const [avail, setAvail] = useState([]);
  const [form, setForm] = useState({ guestId: "", roomId: "", checkIn: "", checkOut: "", specialRequests: "" });
  const [payMethod, setPayMethod] = useState("CREDIT_CARD");
  const [filter, setFilter] = useState("ALL");

  const searchRooms = async () => {
    if (!form.checkIn || !form.checkOut) return;
    try {
      const data = await api(`/rooms/available?checkIn=${form.checkIn}&checkOut=${form.checkOut}`);
      setAvail(data);
    } catch {}
  };

  const book = async () => {
    try {
      await api("/reservations", { method: "POST", body: { ...form, guestId: +form.guestId, roomId: +form.roomId } });
      setShowBook(false); setForm({ guestId: "", roomId: "", checkIn: "", checkOut: "", specialRequests: "" }); onRefresh();
    } catch (e) { setMsg(e.message); }
  };

  const pay = async () => {
    try {
      await api(`/reservations/${payModal.id}/pay`, { method: "POST", body: { method: payMethod } });
      setPayModal(null); onRefresh();
    } catch (e) { alert(e.message); }
  };

  const changeStatus = async (id, status) => {
    try { await api(`/reservations/${id}/status`, { method: "PATCH", body: { status } }); onRefresh(); }
    catch (e) { alert(e.message); }
  };

  const cancel = async (id) => {
    if (!confirm("Cancel this reservation?")) return;
    try { await api(`/reservations/${id}`, { method: "DELETE" }); onRefresh(); }
    catch (e) { alert(e.message); }
  };

  const filtered = filter === "ALL" ? reservations : reservations.filter(r => r.status === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#e2e8f0", margin: 0 }}>Reservations</h2>
        <Btn onClick={() => setShowBook(true)}>+ New Booking</Btn>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["ALL","PENDING","CONFIRMED","CHECKED_IN","CHECKED_OUT","CANCELLED"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: filter === s ? "#6366f1" : "#2d3447", color: filter === s ? "#fff" : "#94a3b8" }}>
            {s.replace("_"," ")}
          </button>
        ))}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr style={{ borderBottom: "1px solid #2d3447" }}>
          {["ID","Guest","Room","Check-In","Check-Out","Amount","Status","Payment","Actions"].map(h => (
            <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "#64748b", fontSize: 12, textTransform: "uppercase" }}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.id} style={{ borderBottom: "1px solid #1a1f2e" }}>
              <td style={{ padding: "12px", color: "#64748b" }}>#{r.id}</td>
              <td style={{ padding: "12px", color: "#e2e8f0", fontWeight: 600 }}>{r.guest?.name}</td>
              <td style={{ padding: "12px", color: "#94a3b8" }}>{r.room?.roomNumber} <span style={{ color: "#3b82f6", fontSize: 11 }}>{r.room?.type}</span></td>
              <td style={{ padding: "12px", color: "#94a3b8" }}>{fmtDate(r.checkIn)}</td>
              <td style={{ padding: "12px", color: "#94a3b8" }}>{fmtDate(r.checkOut)}</td>
              <td style={{ padding: "12px", color: "#10b981", fontWeight: 700 }}>{fmt(r.totalAmount)}</td>
              <td style={{ padding: "12px" }}><Badge label={r.status} color={STATUS_COLOR[r.status]} /></td>
              <td style={{ padding: "12px" }}>
                {r.payment ? <Badge label={r.payment.status} color={PAY_COLOR[r.payment.status]} /> : <span style={{ color: "#64748b", fontSize: 12 }}>Unpaid</span>}
              </td>
              <td style={{ padding: "12px" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn variant="ghost" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => setDetailModal(r)}>View</Btn>
                  {r.status === "CONFIRMED" && !r.payment && (
                    <Btn variant="success" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => setPayModal(r)}>Pay</Btn>
                  )}
                  {r.status === "CONFIRMED" && (
                    <Btn variant="ghost" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => changeStatus(r.id, "CHECKED_IN")}>Check In</Btn>
                  )}
                  {r.status === "CHECKED_IN" && (
                    <Btn variant="ghost" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => changeStatus(r.id, "CHECKED_OUT")}>Check Out</Btn>
                  )}
                  {!["CANCELLED","CHECKED_OUT"].includes(r.status) && (
                    <Btn variant="danger" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => cancel(r.id)}>✕</Btn>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* New Booking Modal */}
      {showBook && (
        <Modal title="New Booking" onClose={() => setShowBook(false)}>
          {msg && <div style={{ color: "#ef4444", marginBottom: 12, fontSize: 13 }}>{msg}</div>}
          <Select label="Guest" value={form.guestId} onChange={e => setForm({...form, guestId: e.target.value})}>
            <option value="">Select guest...</option>
            {guests.map(g => <option key={g.id} value={g.id}>{g.name} — {g.email}</option>)}
          </Select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="Check-In" type="date" value={form.checkIn} onChange={e => setForm({...form, checkIn: e.target.value})} />
            <Input label="Check-Out" type="date" value={form.checkOut} onChange={e => setForm({...form, checkOut: e.target.value})} />
          </div>
          <Btn variant="ghost" style={{ marginBottom: 14, fontSize: 12 }} onClick={searchRooms}>🔍 Search Available Rooms</Btn>
          {avail.length > 0 && (
            <Select label="Select Room" value={form.roomId} onChange={e => setForm({...form, roomId: e.target.value})}>
              <option value="">Choose room...</option>
              {avail.map(r => <option key={r.id} value={r.id}>#{r.roomNumber} — {r.type} — {fmt(r.pricePerNight)}/night</option>)}
            </Select>
          )}
          <Input label="Special Requests" value={form.specialRequests} onChange={e => setForm({...form, specialRequests: e.target.value})} />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={book} disabled={!form.guestId || !form.roomId || !form.checkIn || !form.checkOut}>Confirm Booking</Btn>
            <Btn variant="ghost" onClick={() => setShowBook(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* Payment Modal */}
      {payModal && (
        <Modal title="Process Payment" onClose={() => setPayModal(null)}>
          <div style={{ background: "#131720", borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 6 }}>Reservation #{payModal.id} — {payModal.guest?.name}</div>
            <div style={{ color: "#10b981", fontSize: 28, fontWeight: 700 }}>{fmt(payModal.totalAmount)}</div>
          </div>
          <Select label="Payment Method" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
            {["CREDIT_CARD","DEBIT_CARD","CASH","BANK_TRANSFER"].map(m => <option key={m}>{m.replace("_"," ")}</option>)}
          </Select>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn variant="success" onClick={pay}>💳 Complete Payment</Btn>
            <Btn variant="ghost" onClick={() => setPayModal(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <Modal title={`Reservation #${detailModal.id}`} onClose={() => setDetailModal(null)}>
          {[
            ["Guest", detailModal.guest?.name],
            ["Email", detailModal.guest?.email],
            ["Room", `#${detailModal.room?.roomNumber} — ${detailModal.room?.type}`],
            ["Check-In", fmtDate(detailModal.checkIn)],
            ["Check-Out", fmtDate(detailModal.checkOut)],
            ["Total", fmt(detailModal.totalAmount)],
            ["Status", detailModal.status],
            ["Special Requests", detailModal.specialRequests || "None"],
            ["Payment", detailModal.payment ? `${detailModal.payment.status} — TXN: ${detailModal.payment.transactionId}` : "Not paid"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1f2e", fontSize: 14 }}>
              <span style={{ color: "#64748b" }}>{k}</span>
              <span style={{ color: "#e2e8f0" }}>{v}</span>
            </div>
          ))}
          <Btn variant="ghost" onClick={() => setDetailModal(null)} style={{ marginTop: 16, width: "100%" }}>Close</Btn>
        </Modal>
      )}
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [r, g, res] = await Promise.all([
        api("/rooms"), api("/guests"), api("/reservations")
      ]);
      setRooms(r); setGuests(g); setReservations(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const tabs = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "rooms",     label: "🛏 Rooms" },
    { id: "guests",    label: "👥 Guests" },
    { id: "reservations", label: "📋 Reservations" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", color: "#e2e8f0", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#1e2330", borderBottom: "1px solid #2d3447", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0" }}>
            <span style={{ fontSize: 28 }}>🏨</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>LuxStay</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Hotel Management System</div>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 4 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: "14px 20px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                  color: tab === t.id ? "#6366f1" : "#64748b",
                  borderBottom: tab === t.id ? "2px solid #6366f1" : "2px solid transparent",
                  transition: "all .15s" }}>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#64748b", padding: 80, fontSize: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            Connecting to backend...
          </div>
        ) : (
          <>
            {tab === "dashboard"    && <Dashboard reservations={reservations} rooms={rooms} guests={guests} />}
            {tab === "rooms"        && <Rooms rooms={rooms} onRefresh={refresh} />}
            {tab === "guests"       && <Guests guests={guests} onRefresh={refresh} />}
            {tab === "reservations" && <Reservations reservations={reservations} guests={guests} rooms={rooms} onRefresh={refresh} />}
          </>
        )}
      </div>
    </div>
  );
}
