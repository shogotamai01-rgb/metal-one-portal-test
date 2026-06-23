/* eslint-disable */
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";

// ── Color palette ─────────────────────────────────────────────────────────────
const G = {
  primary: "#3a7d44", primaryDark: "#2c6235", primaryLight: "#e8f5e9",
  accent: "#f5a623", danger: "#c0392b", blue: "#2563eb",
  text: "#1a1a2e", muted: "#6b7280", border: "#e2e8f0",
  bg: "#f8fafc", white: "#ffffff", tableHdr: "#3a7d44",
};

// ── Role / user data ──────────────────────────────────────────────────────────
const USERS = [
  { email: "momoko.nakamura@mtlo.com",  password: "Metal1234!", name: "Momoko Nakamura",  role: "Inside Sales",     avatar: "MN" },
  { email: "mako.ishimoto@mtlo.com",    password: "Metal1234!", name: "Mako Ishimoto",    role: "Inside Sales",     avatar: "MI" },
  { email: "carlos.rodriguez@mtlo.com", password: "Metal1234!", name: "Carlos Rodriguez", role: "Manager/Signer",   avatar: "CR" },
  { email: "compliance@mtlo.com",       password: "Metal1234!", name: "Ana Compliance",   role: "Compliance",       avatar: "AC" },
  { email: "broker@grucas.com",         password: "Metal1234!", name: "Grucas Broker",    role: "Grucas Broker",    avatar: "GB" },
  { email: "broker@gontour.com",        password: "Metal1234!", name: "Gontour Broker",   role: "Gontour Broker",   avatar: "GO" },
  { email: "customer@mosmex.com",       password: "Metal1234!", name: "MOSMEX Customer",  role: "Customer",         avatar: "MX" },
  { email: "trucking@carrier.com",      password: "Metal1234!", name: "Carrier",          role: "Trucking Company", avatar: "CA" },
];

const ROLE_ACCESS = {
  "Admin":            ["dashboard","shipments","documents","production","notifications","settings","admin"],
  "Inside Sales":     ["dashboard","shipments","documents","production","notifications"],
  "Manager/Signer":   ["dashboard","shipments","documents","production","notifications"],
  "Compliance":       ["dashboard","shipments","documents","production","notifications"],
  "Grucas Broker":    ["shipments"],
  "Gontour Broker":   ["shipments"],
  "Customer":         ["shipments","production"],
  "Trucking Company": ["shipments"],
};

const HTS_STATUSES = {
  "1.1": { label: "HTS REQ Submitted",    color: "#2563eb", bg: "#dbeafe" },
  "1.2": { label: "HTS REQ Re-submitted", color: "#7c3aed", bg: "#ede9fe" },
  "2.1": { label: "HTS Returned",         color: "#c0392b", bg: "#fee2e2" },
  "3.1": { label: "Wait for Invoice",     color: "#b45309", bg: "#fef3c7" },
  "3.2": { label: "SLI Signature REQ",    color: "#0369a1", bg: "#e0f2fe" },
  "4.1": { label: "In Review (MGR)",      color: "#6d28d9", bg: "#ede9fe" },
  "5.1": { label: "Approved by MGR",      color: "#15803d", bg: "#dcfce7" },
  "5.2": { label: "Returned by MGR",      color: "#c0392b", bg: "#fee2e2" },
};

const SHIPMENT_STAGES = ["Mill","Processing Company","In Transit (US)","Laredo Terminal","Cross Border","Nuevo Laredo","MOSMEX"];

// ── Seed data ─────────────────────────────────────────────────────────────────
const SHIPMENTS_SEED = [
  { id:"SHP-001", bol:"BOL-9021", customer:"METAL ONE STEEL SERVICE DE MEXICO SA", customerPO:"MX-2407015920", maiPO:"00310552", origin:"Houston, TX",     destination:"Monterrey, MX",       product:"Cold Rolled Steel", status:"In Transit (US)",     etd:"02/10/2026", eta:"02/18/2026", customs:"Pending",      htsStatus:"3.2", stage:2, mill:"Cliffs Steel",    truckingCo:"XPO Logistics",       broker:"Global Customs Inc", shipmentStatus:"Docs Pending", statusDate:"" },
  { id:"SHP-002", bol:"BOL-7733", customer:"THYSSENKRUPP STEEL DISTRIBUTION",      customerPO:"CF_EDI_SSW1",   maiPO:"00310631", origin:"Chicago, IL",     destination:"Mexico City, MX",     product:"Hot Rolled Steel",  status:"Laredo Terminal",     etd:"01/28/2026", eta:"02/05/2026", customs:"Under Review", htsStatus:"4.1", stage:3, mill:"Cliffs Steel",    truckingCo:"Werner Enterprises",  broker:"Global Customs Inc", shipmentStatus:"Customs Pending", statusDate:"" },
  { id:"SHP-003", bol:"BOL-6610", customer:"COILPLUS BERWICK",                      customerPO:"Testing DocuSign", maiPO:"00310604", origin:"Los Angeles, CA", destination:"Guadalajara, MX",  product:"CSCR Coil",         status:"MOSMEX",              etd:"01/15/2026", eta:"01/22/2026", customs:"Cleared",      htsStatus:"5.1", stage:6, mill:"Cliffs Steel",    truckingCo:"J.B. Hunt",           broker:"Border Pro LLC",   shipmentStatus:"Delivered", statusDate:"01/22/2026" },
  { id:"SHP-004", bol:"BOL-4401", customer:"NIPPON STEEL PIPE AMERICA, INC",        customerPO:"TEST_NSPA-00323853", maiPO:"00310580", origin:"Detroit, MI", destination:"Tijuana, MX",      product:"Steel Pipe",        status:"Mill",                etd:"02/20/2026", eta:"02/27/2026", customs:"Not Started",  htsStatus:"1.1", stage:0, mill:"NS Sales",         truckingCo:"TBD",                 broker:"TBD",              shipmentStatus:"Docs Pending", statusDate:"" },
  { id:"SHP-005", bol:"BOL-5582", customer:"JACKSON TUBE SERVICE",                  customerPO:"TEST_JTS-00323855", maiPO:"00310574", origin:"Houston, TX", destination:"Monterrey, MX",      product:"Tube Steel",        status:"In Transit (US)",     etd:"02/12/2026", eta:"02/19/2026", customs:"Pending",      htsStatus:"3.2", stage:2, mill:"Cliffs Steel",    truckingCo:"Schneider National",  broker:"Global Customs Inc", shipmentStatus:"Docs Pending", statusDate:"" },
  { id:"SHP-006", bol:"BOL-3390", customer:"COILPLUS ALABAMA",                       customerPO:"18857",          maiPO:"00300549", origin:"Birmingham, AL", destination:"Saltillo, MX",      product:"CSCR",              status:"MOSMEX",              etd:"01/05/2026", eta:"01/12/2026", customs:"Cleared",      htsStatus:"5.1", stage:6, mill:"Cliffs Steel",    truckingCo:"J.B. Hunt",           broker:"Border Pro LLC",   shipmentStatus:"Delivered", statusDate:"01/12/2026" },
  { id:"SHP-007", bol:"BOL-8821", customer:"JEMISON METALS",                         customerPO:"CLV-29182",      maiPO:"00300529", origin:"Cleveland, OH", destination:"San Luis Potosi, MX", product:"Cold Rolled Steel", status:"Cross Border",        etd:"02/14/2026", eta:"02/22/2026", customs:"Pending",      htsStatus:"3.1", stage:4, mill:"Cleveland Cliffs", truckingCo:"Werner Enterprises",  broker:"Global Customs Inc", shipmentStatus:"Customs Pending", statusDate:"" },
  { id:"SHP-008", bol:"BOL-2247", customer:"HARVARD STEEL SALES, LTD.",              customerPO:"119038",         maiPO:"00300504", origin:"Warren, OH",    destination:"Querétaro, MX",       product:"Hot Rolled Steel",  status:"Processing Company",  etd:"02/25/2026", eta:"03/05/2026", customs:"Not Started",  htsStatus:"1.1", stage:1, mill:"Cleveland Cliffs", truckingCo:"TBD",                 broker:"TBD",              shipmentStatus:"Docs Pending", statusDate:"" },
];

const DOCUMENTS_SEED = [
  { id:"DOC-001", shipmentId:"SHP-001", customer:"METAL ONE STEEL SERVICE DE MEXICO SA", maiPO:"00310552", docType:"Commercial Invoice",           bol:"BOL-9021", coil:"C-5501", heat:"H-4411", issueDate:"02/10/2026", status:"Available", uploadedBy:"Momoko Nakamura", fileName:"invoice_9021.pdf",   fileType:"pdf",  fileUrl:null, fileData:null },
  { id:"DOC-002", shipmentId:"SHP-001", customer:"METAL ONE STEEL SERVICE DE MEXICO SA", maiPO:"00310552", docType:"Packing List",                 bol:"BOL-9021", coil:"C-5501", heat:"H-4411", issueDate:"02/10/2026", status:"Available", uploadedBy:"Momoko Nakamura", fileName:"packing_9021.pdf",  fileType:"pdf",  fileUrl:null, fileData:null },
  { id:"DOC-003", shipmentId:"SHP-001", customer:"METAL ONE STEEL SERVICE DE MEXICO SA", maiPO:"00310552", docType:"Certificate of Origin (USMCA)", bol:"BOL-9021", coil:"",      heat:"",      issueDate:"02/11/2026", status:"Available", uploadedBy:"Ana Compliance",  fileName:"co_9021.pdf",       fileType:"pdf",  fileUrl:null, fileData:null },
  { id:"DOC-004", shipmentId:"SHP-002", customer:"THYSSENKRUPP STEEL DISTRIBUTION",      maiPO:"00310631", docType:"Mill Certificate",             bol:"BOL-7733", coil:"C-3302", heat:"H-2210", issueDate:"01/28/2026", status:"Available", uploadedBy:"Momoko Nakamura", fileName:"mill_cert_7733.pdf", fileType:"pdf",  fileUrl:null, fileData:null },
  { id:"DOC-005", shipmentId:"SHP-002", customer:"THYSSENKRUPP STEEL DISTRIBUTION",      maiPO:"00310631", docType:"Commercial Invoice",           bol:"BOL-7733", coil:"C-3302", heat:"H-2210", issueDate:"01/28/2026", status:"Available", uploadedBy:"Momoko Nakamura", fileName:"invoice_7733.pdf",  fileType:"pdf",  fileUrl:null, fileData:null },
  { id:"DOC-006", shipmentId:"SHP-002", customer:"THYSSENKRUPP STEEL DISTRIBUTION",      maiPO:"00310631", docType:"Shipping Notice",              bol:"BOL-7733", coil:"",      heat:"",      issueDate:"01/29/2026", status:"Pending",   uploadedBy:"",               fileName:"",                  fileType:"",     fileUrl:null, fileData:null },
  { id:"DOC-007", shipmentId:"SHP-003", customer:"COILPLUS BERWICK",                      maiPO:"00310604", docType:"Commercial Invoice",           bol:"BOL-6610", coil:"C-4421", heat:"H-3301", issueDate:"01/15/2026", status:"Available", uploadedBy:"Momoko Nakamura", fileName:"invoice_6610.pdf",  fileType:"pdf",  fileUrl:null, fileData:null },
  { id:"DOC-008", shipmentId:"SHP-003", customer:"COILPLUS BERWICK",                      maiPO:"00310604", docType:"Pedimento (Mexico Customs)",  bol:"BOL-6610", coil:"",      heat:"",      issueDate:"01/20/2026", status:"Available", uploadedBy:"Ana Compliance",  fileName:"pedimento_6610.pdf",fileType:"pdf",  fileUrl:null, fileData:null },
];

const NOTIFICATIONS_SEED = [
  { id:"N-001", type:"warning", title:"HTS Returned",     message:"SHP-002 HTS request was returned. Please re-submit.",        shipmentId:"SHP-002", time:"10 min ago", read:false, roles:["Inside Sales","Manager/Signer","Admin"] },
  { id:"N-002", type:"info",    title:"Approval Required", message:"SHP-001 SLI Signature is waiting for your review.",          shipmentId:"SHP-001", time:"1 hr ago",  read:false, roles:["Manager/Signer","Admin"] },
  { id:"N-003", type:"success", title:"Customs Cleared",   message:"SHP-003 has been cleared by Mexican customs.",               shipmentId:"SHP-003", time:"2 hrs ago", read:true,  roles:["Inside Sales","Compliance","Admin","Customer"] },
  { id:"N-004", type:"warning", title:"Missing Document",  message:"SHP-002 Shipping Notice is still pending upload.",           shipmentId:"SHP-002", time:"3 hrs ago", read:false, roles:["Inside Sales","Compliance","Admin"] },
  { id:"N-005", type:"info",    title:"Shipment Arrived",  message:"SHP-007 arrived at Laredo Terminal.",                        shipmentId:"SHP-007", time:"5 hrs ago", read:true,  roles:["Inside Sales","Trucking Company","Customer","Admin"] },
  { id:"N-006", type:"success", title:"MGR Approved",      message:"SHP-003 approved by Manager and email sent to customer.",    shipmentId:"SHP-003", time:"1 day ago", read:true,  roles:["Inside Sales","Manager/Signer","Admin","Customer"] },
];

const PRODUCTION_SEED = [
  { id:"P-001", customer:"METAL ONE STEEL SERVICE DE MEXICO SA", customerPO:"MX-2407015920", maiPO:"00310552", plant:"IHE", mill:"Cliffs Steel",  size:"0.0755 X 53.6500 X COIL MIN", ordQty:132, hr:0, pktd:0, ht:0, coat:0, tmpFin:0, finHeld:0, pkg:0, rdyForOp:0,   transit:132, delivered:0,   readyDate:"02/15/2026", product:"Cold Rolled Steel", origin:"Houston, TX",   destination:"Monterrey, MX" },
  { id:"P-002", customer:"COILPLUS BERWICK",                      customerPO:"Testing DocuSign", maiPO:"00310604", plant:"BH",  mill:"Nucor Steel",  size:".0687 X 59.9250 X .0000",    ordQty:24,  hr:0, pktd:0, ht:0, coat:0, tmpFin:0, finHeld:0, pkg:0, rdyForOp:24,  transit:0,   delivered:24, readyDate:"01/16/2026", product:"CSCR",             origin:"Chicago, IL",   destination:"Guadalajara, MX" },
  { id:"P-003", customer:"NIPPON STEEL PIPE AMERICA, INC",        customerPO:"TEST_NSPA-00323853", maiPO:"00310580", plant:"NCW", mill:"NS Sales",   size:".0522 X 53.0000 X .0000",    ordQty:96,  hr:0, pktd:0, ht:0, coat:0, tmpFin:0, finHeld:0, pkg:0, rdyForOp:0,   transit:0,   delivered:0,   readyDate:"02/28/2026", product:"Cold Rolled Steel", origin:"Detroit, MI",   destination:"Tijuana, MX" },
  { id:"P-004", customer:"JACKSON TUBE SERVICE",                   customerPO:"TEST_JTS-00323855", maiPO:"00310574", plant:"IHE", mill:"AK Steel",   size:"0.0430 X 60.0000 X COIL MIN",ordQty:299, hr:0, pktd:0, ht:0, coat:0, tmpFin:0, finHeld:0, pkg:0, rdyForOp:0,   transit:299, delivered:0,   readyDate:"02/12/2026", product:"Tube Steel",        origin:"Cleveland, OH", destination:"Mexico City, MX" },
];

// ── UUID generator ────────────────────────────────────────────────────────────
const genId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

// ── Status helpers ────────────────────────────────────────────────────────────
const statusColor = (s) => {
  const map = {
    "MOSMEX":            { bg:"#dcfce7", color:"#15803d", border:"#86efac" },
    "In Transit (US)":   { bg:"#dbeafe", color:"#1d4ed8", border:"#93c5fd" },
    "Processing Company":{ bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0" },
    "Laredo Terminal":   { bg:"#fef3c7", color:"#b45309", border:"#fcd34d" },
    "Cross Border":      { bg:"#fef9c3", color:"#854d0e", border:"#fde047" },
    "Mill":              { bg:"#f1f5f9", color:"#475569", border:"#cbd5e1" },
    "Nuevo Laredo":      { bg:"#fce7f3", color:"#9d174d", border:"#fbcfe8" },
    "Cleared":           { bg:"#dcfce7", color:"#15803d", border:"#86efac" },
    "Pending":           { bg:"#fef3c7", color:"#b45309", border:"#fcd34d" },
    "Under Review":      { bg:"#fee2e2", color:"#b91c1c", border:"#fca5a5" },
    "Not Started":       { bg:"#f1f5f9", color:"#64748b", border:"#cbd5e1" },
    "Available":         { bg:"#dcfce7", color:"#15803d", border:"#86efac" },
    "Customs Hold":      { bg:"#fee2e2", color:"#b91c1c", border:"#fca5a5" },
  };
  return map[s] || { bg:"#f1f5f9", color:"#64748b", border:"#e2e8f0" };
};

// ── Shared UI components ──────────────────────────────────────────────────────
const Badge = ({ label }) => {
  const s = statusColor(label);
  return <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, padding:"2px 10px", borderRadius:20, fontSize:12, fontWeight:600, whiteSpace:"nowrap" }}>{label}</span>;
};
const HTSBadge = ({ code }) => {
  const s = HTS_STATUSES[code] || { label:code, color:G.muted, bg:"#f1f5f9" };
  return <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.color}30`, padding:"2px 10px", borderRadius:20, fontSize:12, fontWeight:600, whiteSpace:"nowrap" }}>{s.label}</span>;
};
const Th = ({ children, style }) => (
  <th style={{ background:G.tableHdr, color:G.white, padding:"10px 14px", textAlign:"left", fontSize:13, fontWeight:600, whiteSpace:"nowrap", ...style }}>{children}</th>
);
const Td = ({ children, style }) => (
  <td style={{ padding:"10px 14px", fontSize:13, color:G.text, borderBottom:`1px solid ${G.border}`, ...style }}>{children}</td>
);
const FInput = ({ placeholder, value, onChange, type="text", style }) => (
  <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
    style={{ border:`1px solid ${G.border}`, borderRadius:6, padding:"7px 10px", fontSize:13, outline:"none", background:G.white, color:G.text, ...style }} />
);
const FSelect = ({ value, onChange, options, style }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ border:`1px solid ${G.border}`, borderRadius:6, padding:"7px 10px", fontSize:13, outline:"none", background:G.white, color:G.text, cursor:"pointer", ...style }}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);
const Btn = ({ children, onClick, color=G.primary, style, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ background:disabled?"#9ca3af":color, color:G.white, border:"none", borderRadius:7, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:disabled?"not-allowed":"pointer", ...style }}
    onMouseEnter={e => { if(!disabled) e.currentTarget.style.opacity=".85"; }}
    onMouseLeave={e => { e.currentTarget.style.opacity="1"; }}>
    {children}
  </button>
);
const SectionTitle = ({ children }) => (
  <h2 style={{ fontSize:22, fontWeight:700, color:G.text, margin:"0 0 20px", display:"flex", alignItems:"center", gap:8 }}>
    {children}
  </h2>
);

// ── Login Page ────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    setTimeout(() => {
      const user = USERS.find(u => u.email === email && u.password === password);
      if (user) { onLogin(user); } else { setError("Invalid email or password."); setLoading(false); }
    }, 600);
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'Segoe UI', system-ui, sans-serif", background:"#f0f4f8" }}>
      {/* Left panel */}
      <div style={{ width:"45%", background:`linear-gradient(155deg, ${G.primaryDark} 0%, ${G.primary} 50%, #5a9e6a 100%)`, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:60, color:G.white, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:350, height:350, borderRadius:"50%", border:"1px solid rgba(255,255,255,.12)", top:-80, left:-80 }} />
        <div style={{ position:"absolute", width:250, height:250, borderRadius:"50%", border:"1px solid rgba(255,255,255,.1)", bottom:-60, right:-60 }} />
        <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
          <div style={{ fontSize:38, fontWeight:900, marginBottom:6 }}>Metal <span style={{ color:"#f87171" }}>One</span></div>
          <div style={{ fontSize:12, opacity:0.7, marginBottom:40, letterSpacing:3, textTransform:"uppercase" }}>America — Internal Portal</div>
          <div style={{ fontSize:22, fontWeight:700, marginBottom:12, lineHeight:1.3 }}>Shipment & Customs<br/>Clearance Portal</div>
          <div style={{ fontSize:13, opacity:0.8, lineHeight:1.8, maxWidth:300, margin:"0 auto 36px" }}>
            USA → Mexico workflow tracking for Inside Sales, Management, Compliance, Brokers, Trucking & Customers.
          </div>
          {["Role-based access control","Real file upload & PDF preview","HTS workflow inside Documents","Customs compliance checklist","Advanced document filtering"].map(f => (
            <div key={f} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, flexShrink:0 }}>✓</div>
              <span style={{ fontSize:13, opacity:0.9 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
        <div style={{ width:"100%", maxWidth:420 }}>
          <h2 style={{ fontSize:28, fontWeight:800, color:G.text, margin:"0 0 6px" }}>Sign in</h2>
          <p style={{ fontSize:14, color:G.muted, margin:"0 0 24px" }}>Enter your credentials to access the portal</p>

          <div style={{ background:G.primaryLight, border:`1px solid #a7d7b0`, borderRadius:8, padding:"10px 14px", marginBottom:20, fontSize:12, color:G.primaryDark }}>
            <strong>Demo accounts</strong> (password: <em>Metal1234!</em>)<br/>
            momoko.nakamura@mtlo.com · carlos.rodriguez@mtlo.com · compliance@mtlo.com<br/>
            broker@grucas.com · customer@mosmex.com · trucking@carrier.com
          </div>

          {error && (
            <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#b91c1c" }}>⚠️ {error}</div>
          )}

          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:13, fontWeight:600, color:G.text, display:"block", marginBottom:6 }}>Email address</label>
            <input type="email" placeholder="you@mtlo.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ width:"100%", border:`1px solid ${G.border}`, borderRadius:8, padding:"11px 14px", fontSize:14, outline:"none", boxSizing:"border-box" }} />
          </div>
          <div style={{ marginBottom:22 }}>
            <label style={{ fontSize:13, fontWeight:600, color:G.text, display:"block", marginBottom:6 }}>Password</label>
            <div style={{ position:"relative" }}>
              <input type={showPw?"text":"password"} placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{ width:"100%", border:`1px solid ${G.border}`, borderRadius:8, padding:"11px 44px 11px 14px", fontSize:14, outline:"none", boxSizing:"border-box" }} />
              <button onClick={() => setShowPw(p => !p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, color:G.muted }}>
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            style={{ width:"100%", background:loading?"#6aaa74":G.primary, color:G.white, border:"none", borderRadius:8, padding:13, fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer" }}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
          <div style={{ marginTop:28, paddingTop:20, borderTop:`1px solid ${G.border}`, fontSize:12, color:G.muted, textAlign:"center" }}>
            © 2026 Metal One America · Internal Portal · Confidential
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ user, setPage, shipments, notifications }) {
  const myNotifs = notifications.filter(n => n.roles.includes(user.role) && !n.read);
  const stageCounts = SHIPMENT_STAGES.map(s => ({ stage:s, count:shipments.filter(sh => sh.status===s).length }));

  return (
    <div>
      <SectionTitle>Dashboard</SectionTitle>

      {/* KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:28 }}>
        {[
          { label:"Total Shipments",   value:shipments.length,                                             color:G.blue },
          { label:"In Transit",        value:shipments.filter(s=>s.status==="In Transit (US)").length,    color:"#0369a1" },
          { label:"At Laredo",         value:shipments.filter(s=>["Laredo Terminal","Cross Border","Nuevo Laredo"].includes(s.status)).length, color:"#b45309" },
          { label:"Delivered",         value:shipments.filter(s=>s.status==="MOSMEX").length,             color:G.primary },
        ].map(k => (
          <div key={k.label} style={{ background:G.white, border:`1px solid ${G.border}`, borderRadius:12, padding:"20px 24px", borderLeft:`4px solid ${k.color}` }}>
            <div style={{ fontSize:12, color:G.muted, fontWeight:600, marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>{k.label}</div>
            <div style={{ fontSize:32, fontWeight:800, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Stage pipeline */}
      <div style={{ background:G.white, border:`1px solid ${G.border}`, borderRadius:12, padding:24, marginBottom:24 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>Pipeline Status</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {stageCounts.map(({ stage, count }) => (
            <div key={stage} style={{ flex:1, minWidth:90, background:G.bg, border:`1px solid ${G.border}`, borderRadius:8, padding:"12px 10px", textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:800, color:count>0?G.primary:G.muted }}>{count}</div>
              <div style={{ fontSize:11, color:G.muted, marginTop:4, lineHeight:1.4 }}>{stage}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Unread notifications */}
      {myNotifs.length > 0 && (
        <div style={{ background:G.white, border:`1px solid ${G.border}`, borderRadius:12, padding:24 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>🔔 Unread Notifications ({myNotifs.length})</div>
          {myNotifs.slice(0,5).map(n => (
            <div key={n.id} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:`1px solid ${G.border}` }}>
              <span style={{ fontSize:18 }}>{n.type==="warning"?"⚠️":n.type==="success"?"✅":"ℹ️"}</span>
              <div>
                <div style={{ fontWeight:600, fontSize:13 }}>{n.title}</div>
                <div style={{ fontSize:12, color:G.muted }}>{n.message}</div>
              </div>
              <div style={{ marginLeft:"auto", fontSize:11, color:G.muted, whiteSpace:"nowrap" }}>{n.time}</div>
            </div>
          ))}
          <button onClick={() => setPage("notifications")} style={{ marginTop:12, background:"none", border:"none", color:G.primary, fontSize:13, cursor:"pointer", fontWeight:600 }}>
            View all notifications →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Shipments Page ────────────────────────────────────────────────────────────
function ShipmentsPage({ user, shipments, documents, onDetail, onAddShipment, onEditShipment, onDeleteShipment }) {
  const isExternal = ["Customer","Trucking Company","Grucas Broker","Gontour Broker"].includes(user.role);
  const canManage = ["Inside Sales","Manager/Signer","Admin"].includes(user.role);

  const [fCustomer, setFCustomer] = useState("");
  const [fStatus,   setFStatus]   = useState("");
  const [fHTS,      setFHTS]      = useState("");
  const [fMaiPO,    setFMaiPO]    = useState("");
  const [showAdd,   setShowAdd]   = useState(false);

  const filtered = useMemo(() => shipments.filter(s => {
    if (fCustomer && !s.customer.toLowerCase().includes(fCustomer.toLowerCase())) return false;
    if (fStatus && s.status !== fStatus) return false;
    if (fHTS && s.htsStatus !== fHTS) return false;
    if (fMaiPO && !s.maiPO.includes(fMaiPO)) return false;
    return true;
  }), [shipments, fCustomer, fStatus, fHTS, fMaiPO]);

  return (
    <div>
      {/* Add Shipment Modal */}
      {showAdd && (
        <AddShipmentModal onClose={() => setShowAdd(false)} onSave={s => { onAddShipment(s); setShowAdd(false); }} />
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <SectionTitle>Shipments</SectionTitle>
        {canManage && <Btn onClick={() => setShowAdd(true)}>+ New Shipment</Btn>}
      </div>

      {/* Filters */}
      <div style={{ background:"#f1f5f9", border:`1px solid ${G.border}`, borderRadius:10, padding:16, marginBottom:16 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10 }}>
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:G.muted, display:"block", marginBottom:4 }}>CUSTOMER</label>
            <FInput placeholder="Search customer…" value={fCustomer} onChange={setFCustomer} style={{ width:"100%", boxSizing:"border-box" }} />
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:G.muted, display:"block", marginBottom:4 }}>MAI PO #</label>
            <FInput placeholder="e.g. 00310552" value={fMaiPO} onChange={setFMaiPO} style={{ width:"100%", boxSizing:"border-box" }} />
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:G.muted, display:"block", marginBottom:4 }}>STAGE</label>
            <FSelect value={fStatus} onChange={setFStatus} style={{ width:"100%", boxSizing:"border-box" }}
              options={[{value:"",label:"All Stages"},...SHIPMENT_STAGES.map(s=>({value:s,label:s}))]} />
          </div>
          {!isExternal && (
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:G.muted, display:"block", marginBottom:4 }}>HTS STATUS</label>
              <FSelect value={fHTS} onChange={setFHTS} style={{ width:"100%", boxSizing:"border-box" }}
                options={[{value:"",label:"All"},...Object.entries(HTS_STATUSES).map(([k,v])=>({value:k,label:`${k} · ${v.label}`}))]} />
            </div>
          )}
        </div>
        <div style={{ marginTop:10, fontSize:13, color:G.muted }}>
          Showing <strong>{filtered.length}</strong> of <strong>{shipments.length}</strong> shipments
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX:"auto", borderRadius:8, border:`1px solid ${G.border}` }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <Th>BOL #</Th>
              <Th>MAI PO #</Th>
              <Th>Customer</Th>
              <Th>Product</Th>
              <Th>Origin → Dest.</Th>
              <Th>Stage</Th>
              {!isExternal && <Th>HTS Status</Th>}
              <Th>ETD</Th>
              <Th>ETA</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} style={{ background:i%2===0?G.white:"#f8fafc" }}
                onMouseEnter={e => e.currentTarget.style.background=G.primaryLight}
                onMouseLeave={e => e.currentTarget.style.background=i%2===0?G.white:"#f8fafc"}>
                <Td style={{ fontWeight:600, color:G.blue, cursor:"pointer" }} onClick={() => onDetail(s)}>{s.bol}</Td>
                <Td style={{ fontWeight:600 }}>{s.maiPO}</Td>
                <Td style={{ fontSize:12, maxWidth:180 }}>{s.customer.slice(0,30)}{s.customer.length>30?"…":""}</Td>
                <Td style={{ fontSize:12 }}>{s.product}</Td>
                <Td style={{ fontSize:11, color:G.muted }}>{s.origin} → {s.destination}</Td>
                <Td><Badge label={s.status} /></Td>
                {!isExternal && <Td><HTSBadge code={s.htsStatus} /></Td>}
                <Td style={{ fontSize:12 }}>{s.etd}</Td>
                <Td style={{ fontSize:12 }}>{s.eta}</Td>
                <Td>
                  <div style={{ display:"flex", gap:5 }}>
                    <button onClick={() => onDetail(s)} style={{ background:G.blue+"15", color:G.blue, border:`1px solid ${G.blue}25`, borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:600 }}>
                      View
                    </button>
                    {canManage && (
                      <button onClick={() => onDeleteShipment(s.id)} style={{ background:G.danger+"15", color:G.danger, border:`1px solid ${G.danger}25`, borderRadius:6, padding:"4px 8px", fontSize:11, cursor:"pointer" }}>
                        🗑
                      </button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:48, color:G.muted }}>No shipments match the current filters.</div>
        )}
      </div>
    </div>
  );
}

// ── Add Shipment Modal ────────────────────────────────────────────────────────
function AddShipmentModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    bol:"", maiPO:"", customerPO:"", customer:"", product:"Cold Rolled Steel",
    origin:"Houston, TX", destination:"Monterrey, MX", mill:"Cliffs Steel",
    truckingCo:"", broker:"", etd:"", eta:"", status:"Mill", htsStatus:"1.1",
  });
  const f = (k,v) => setForm(p => ({...p,[k]:v}));

  const handleSave = () => {
    if (!form.maiPO || !form.customer) { alert("MAI PO # and Customer are required."); return; }
    onSave({
      id: genId(), ...form,
      stage: SHIPMENT_STAGES.indexOf(form.status),
      customs: "Not Started", shipmentStatus: "Docs Pending", statusDate: "",
    });
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:1500, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:G.white, borderRadius:16, width:560, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(0,0,0,.25)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${G.border}`, background:G.primaryLight, borderRadius:"16px 16px 0 0" }}>
          <div style={{ fontWeight:800, fontSize:18 }}>🚢 New Shipment</div>
        </div>
        <div style={{ padding:24 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
            {[["BOL #","bol","BOL-0000"],["MAI PO #","maiPO","00310000"],["Customer PO #","customerPO","MX-0000"],["Customer","customer","Company name"]].map(([lbl,key,ph]) => (
              <div key={key}>
                <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>{lbl}</label>
                <input value={form[key]} onChange={e=>f(key,e.target.value)} placeholder={ph}
                  style={{ width:"100%", boxSizing:"border-box", border:`1px solid ${G.border}`, borderRadius:6, padding:"7px 10px", fontSize:13, outline:"none" }} />
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Product</label>
              <FSelect value={form.product} onChange={v=>f("product",v)} style={{ width:"100%", boxSizing:"border-box" }}
                options={["Cold Rolled Steel","Hot Rolled Steel","CSCR Coil","Steel Pipe","Tube Steel","Galvanized Steel"].map(p=>({value:p,label:p}))} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>Stage</label>
              <FSelect value={form.status} onChange={v=>f("status",v)} style={{ width:"100%", boxSizing:"border-box" }}
                options={SHIPMENT_STAGES.map(s=>({value:s,label:s}))} />
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>ETD</label>
              <input type="date" value={form.etd} onChange={e=>f("etd",e.target.value)}
                style={{ width:"100%", boxSizing:"border-box", border:`1px solid ${G.border}`, borderRadius:6, padding:"7px 10px", fontSize:13, outline:"none" }} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, display:"block", marginBottom:4 }}>ETA</label>
              <input type="date" value={form.eta} onChange={e=>f("eta",e.target.value)}
                style={{ width:"100%", boxSizing:"border-box", border:`1px solid ${G.border}`, borderRadius:6, padding:"7px 10px", fontSize:13, outline:"none" }} />
            </div>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:20 }}>
            <Btn onClick={onClose} color={G.muted}>Cancel</Btn>
            <Btn onClick={handleSave}>💾 Save Shipment</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shipment Detail ───────────────────────────────────────────────────────────
function ShipmentDetail({ shipment, onBack, user, documents, onUpload, onEdit, onDelete, shipments, onUpdateShipment }) {
  const [showUpload, setShowUpload] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const docs = documents.filter(d => d.shipmentId === shipment.id);
  const canUpload = ["Inside Sales","Compliance","Custom Broker","Admin"].includes(user.role);
  const canManage = canUpload;
  const isExternal = ["Customer","Trucking Company"].includes(user.role);
  const docTypes = ["Commercial Invoice","Packing List","Certificate of Origin (USMCA)","Mill Certificate","BOL","SLI"];

  const handleDownload = (d) => {
    const url = d.fileUrl || d.fileData;
    if (!url) { alert("File not available."); return; }
    const a = document.createElement("a"); a.href = url; a.download = d.fileName; a.click();
  };

  // Stage progress bar
  const stageIdx = SHIPMENT_STAGES.indexOf(shipment.status);

  return (
    <div>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} shipments={shipments} onUpload={onUpload} preselectedShipment={shipment} userName={user.name} />}
      {previewDoc && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}

      {/* Breadcrumb */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
        <span onClick={onBack} style={{ color:G.blue, cursor:"pointer", fontWeight:600 }}>Shipments</span>
        <span style={{ color:G.muted }}>/</span>
        <span style={{ fontWeight:700, fontSize:18 }}>{shipment.bol || shipment.maiPO}</span>
        <span style={{ fontSize:12, color:G.muted }}>MAI PO: {shipment.maiPO}</span>
        {!isExternal && <HTSBadge code={shipment.htsStatus} />}
      </div>

      {/* Stage progress */}
      <div style={{ background:G.white, border:`1px solid ${G.border}`, borderRadius:10, padding:"16px 20px", marginBottom:20 }}>
        <div style={{ fontWeight:600, fontSize:13, marginBottom:12, color:G.muted }}>SHIPMENT PROGRESS</div>
        <div style={{ display:"flex", alignItems:"center" }}>
          {SHIPMENT_STAGES.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1, minWidth:0 }}>
                <div style={{
                  width:28, height:28, borderRadius:"50%",
                  background: i < stageIdx ? G.primary : i === stageIdx ? G.primary : "#e2e8f0",
                  color: i <= stageIdx ? G.white : G.muted,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700,
                  border: i === stageIdx ? `2px solid ${G.primaryDark}` : "none",
                }}>
                  {i < stageIdx ? "✓" : i+1}
                </div>
                <div style={{ fontSize:9, color: i <= stageIdx ? G.primary : G.muted, marginTop:4, textAlign:"center", lineHeight:1.3, maxWidth:60 }}>{s}</div>
              </div>
              {i < SHIPMENT_STAGES.length-1 && (
                <div style={{ height:2, flex:0.5, background: i < stageIdx ? G.primary : "#e2e8f0", margin:"0 2px", marginBottom:18 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Details + checklist */}
      <div style={{ display:"grid", gridTemplateColumns:isExternal?"1fr":"1fr 280px", gap:20, marginBottom:20 }}>
        <div style={{ background:G.white, border:`1px solid ${G.border}`, borderRadius:10, padding:24 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:16 }}>Shipment Details</div>
          <div style={{ display:"grid", gridTemplateColumns:"160px 1fr", rowGap:10, fontSize:13 }}>
            {[
              ["BOL #:", shipment.bol||"—"], ["MAI PO #:", shipment.maiPO],
              ["Customer:", shipment.customer], ["Product:", shipment.product],
              ["Origin:", shipment.origin], ["Destination:", shipment.destination],
              ["Mill:", shipment.mill], ["Carrier:", shipment.truckingCo||"—"],
              ["Broker:", shipment.broker||"—"],
              ...(!isExternal ? [["Customs:", shipment.customs], ["Status:", shipment.shipmentStatus||"Docs Pending"]] : []),
              ["ETD:", shipment.etd], ["ETA:", shipment.eta],
            ].map(([k,v]) => (
              <React.Fragment key={k}>
                <div style={{ fontWeight:600, color:G.text }}>{k}</div>
                <div style={{ color:G.muted }}>{v}</div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {!isExternal && (
          <div>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>Documents Checklist</div>
            {docTypes.map(dt => {
              const cnt = docs.filter(d => d.docType===dt).length;
              return (
                <div key={dt} style={{ border:`1px solid ${G.border}`, borderRadius:8, padding:"9px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", background:cnt>0?"#f0fdf4":"#f8fafc", marginBottom:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12 }}>
                    <span>{cnt>0?"✅":"📄"}</span>{dt}
                  </div>
                  <span style={{ color:G.muted, fontSize:11 }}>({cnt})</span>
                </div>
              );
            })}
            {canUpload && <Btn onClick={() => setShowUpload(true)} style={{ width:"100%", marginTop:10 }}>📎 Upload Document</Btn>}
          </div>
        )}
      </div>

      {/* Documents table */}
      {!isExternal && (
        <div style={{ background:G.white, border:`1px solid ${G.border}`, borderRadius:10, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${G.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontWeight:700 }}>Documents ({docs.length})</span>
            {canUpload && <Btn onClick={() => setShowUpload(true)} color={G.blue} style={{ fontSize:12, padding:"5px 12px" }}>+ Upload</Btn>}
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr><Th>Type</Th><Th>File</Th><Th>Issue Date</Th><Th>Uploaded By</Th><Th>Status</Th><Th>Actions</Th></tr>
            </thead>
            <tbody>
              {docs.map((d,i) => (
                <tr key={d.id} style={{ background:i%2?G.white:"#f8fafc" }}>
                  <Td style={{ fontSize:12 }}>{d.docType}</Td>
                  <Td style={{ fontSize:12 }}>{d.fileName || "—"}</Td>
                  <Td style={{ fontSize:12 }}>{d.issueDate}</Td>
                  <Td style={{ fontSize:12 }}>{d.uploadedBy||"—"}</Td>
                  <Td><Badge label={d.status} /></Td>
                  <Td>
                    <div style={{ display:"flex", gap:5 }}>
                      <button onClick={() => setPreviewDoc(d)} style={{ background:G.blue+"15", color:G.blue, border:`1px solid ${G.blue}25`, borderRadius:6, padding:"4px 9px", fontSize:11, cursor:"pointer", fontWeight:600 }}>👁</button>
                      {(d.fileUrl || d.fileData) && (
                        <button onClick={() => handleDownload(d)} style={{ background:"#16a34a15", color:"#16a34a", border:"1px solid #16a34a25", borderRadius:6, padding:"4px 9px", fontSize:11, cursor:"pointer", fontWeight:600 }}>⬇</button>
                      )}
                      {canManage && (
                        <button onClick={() => onDelete(d.id)} style={{ background:G.danger+"15", color:G.danger, border:`1px solid ${G.danger}25`, borderRadius:6, padding:"4px 8px", fontSize:11, cursor:"pointer" }}>🗑</button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
              {docs.length === 0 && (
                <tr><Td colSpan={6} style={{ textAlign:"center", color:G.muted, padding:32 }}>No documents uploaded yet.</Td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Preview Modal ─────────────────────────────────────────────────────────────
function PreviewModal({ doc, onClose }) {
  const isPDF = doc.fileType === "pdf";
  const hasFile = !!(doc.fileUrl || doc.fileData);

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:2000, display:"flex", flexDirection:"column" }} onClick={onClose}>
      <div style={{ background:G.white, padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${G.border}` }} onClick={e=>e.stopPropagation()}>
        <div style={{ fontWeight:700, fontSize:15 }}>{doc.docType} · {doc.fileName||"No file"}</div>
        <div style={{ display:"flex", gap:10 }}>
          {hasFile && (
            <Btn onClick={() => { const a = document.createElement("a"); a.href = doc.fileData||doc.fileUrl; a.download = doc.fileName; a.click(); }} style={{ fontSize:12, padding:"5px 14px" }}>
              ⬇ Download
            </Btn>
          )}
          <button onClick={onClose} style={{ background:"none", border:`1px solid ${G.border}`, borderRadius:6, padding:"5px 12px", cursor:"pointer", fontSize:13, fontWeight:600 }}>✕ Close</button>
        </div>
      </div>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={e=>e.stopPropagation()}>
        {hasFile && isPDF && doc.fileData ? (
          <iframe src={doc.fileData} style={{ width:"100%", height:"100%", border:"none", borderRadius:8 }} title={doc.fileName} />
        ) : (
          <div style={{ background:G.white, borderRadius:12, padding:48, textAlign:"center", color:G.muted }}>
            <div style={{ fontSize:64, marginBottom:16 }}>📎</div>
            <div style={{ fontSize:16, marginBottom:16 }}>{doc.fileName || doc.docType}</div>
            {!hasFile && <div style={{ fontSize:13, color:G.muted }}>No file has been uploaded for this document.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ onClose, shipments, onUpload, preselectedShipment, userName }) {
  const [docType,    setDocType]    = useState("Commercial Invoice");
  const [shipmentId, setShipmentId] = useState(preselectedShipment?.id || shipments[0]?.id || "");
  const [file,       setFile]       = useState(null);
  const [dragOver,   setDragOver]   = useState(false);
  const [error,      setError]      = useState("");
  const fileRef = useRef(null);

  const validateFile = f => {
    if (!f) return "Please select a file.";
    const ext = "." + f.name.split(".").pop().toLowerCase();
    if (![".pdf",".xls",".xlsx"].includes(ext)) return "Only PDF or Excel files allowed.";
    if (f.size > 20*1024*1024) return "File must be under 20 MB.";
    return "";
  };

  const handleFiles = f => {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError(""); setFile(f);
  };

  const submit = () => {
    if (!file) { setError("Please select a file first."); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const ext = file.name.split(".").pop().toLowerCase();
      onUpload({ id:genId(), docType, shipmentId, fileName:file.name, fileType:ext, fileData:ev.target.result, uploadedBy:userName, issueDate:new Date().toLocaleDateString("en-US"), status:"Available", bol:"", coil:"", heat:"" });
      onClose();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:1500, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:G.white, borderRadius:16, width:520, maxHeight:"90vh", overflowY:"auto", padding:28, boxShadow:"0 24px 80px rgba(0,0,0,.25)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ fontWeight:800, fontSize:20, marginBottom:4 }}>📎 Upload Document</div>
        <div style={{ fontSize:13, color:G.muted, marginBottom:22 }}>PDF, XLS, XLSX · Max 20 MB</div>

        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Shipment (MAI PO #)</label>
          <FSelect value={shipmentId} onChange={setShipmentId} style={{ width:"100%", boxSizing:"border-box" }}
            options={shipments.map(s=>({value:s.id,label:`${s.maiPO} · ${s.customer.slice(0,40)}`}))} />
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Document Type</label>
          <FSelect value={docType} onChange={setDocType} style={{ width:"100%", boxSizing:"border-box" }}
            options={["Commercial Invoice","Packing List","Certificate of Origin (USMCA)","Mill Certificate","BOL","AES Submission","SLI","CARTA PORTE","Other"].map(d=>({value:d,label:d}))} />
        </div>

        <div
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if(f) handleFiles(f); }}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          style={{ border:`2px dashed ${dragOver?G.primary:file?G.primary:G.border}`, borderRadius:12, padding:"32px 20px", textAlign:"center", cursor:"pointer", background:file?"#f0fdf4":"#f8fafc", marginBottom:6 }}>
          <input ref={fileRef} type="file" accept=".pdf,.xls,.xlsx" onChange={e=>{const f=e.target.files[0];if(f)handleFiles(f);}} style={{ display:"none" }} />
          {file ? (
            <div>
              <div style={{ fontSize:36, marginBottom:8 }}>{file.name.endsWith(".pdf")?"📄":"📊"}</div>
              <div style={{ fontWeight:700, fontSize:14, color:G.primary }}>{file.name}</div>
              <div style={{ fontSize:12, color:G.muted, marginTop:4 }}>{(file.size/1024).toFixed(1)} KB · Click to change</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize:40, marginBottom:10 }}>☁️</div>
              <div style={{ fontWeight:700, fontSize:15, color:G.text, marginBottom:6 }}>Drag & drop your file here</div>
              <div style={{ fontSize:13, color:G.muted }}>or click to browse</div>
            </div>
          )}
        </div>

        {error && <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:8, padding:"8px 12px", fontSize:13, color:G.danger, marginTop:8 }}>⚠️ {error}</div>}

        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:16 }}>
          <Btn onClick={onClose} color={G.muted}>Cancel</Btn>
          <Btn onClick={submit} disabled={!file}>Upload Document</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Documents Page ────────────────────────────────────────────────────────────
function DocumentsPage({ user, documents, onUpload, onEdit, onDelete, shipments }) {
  const canUpload = ["Inside Sales","Compliance","Custom Broker","Admin"].includes(user.role);
  const [showUpload, setShowUpload] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [fCustomer, setFCustomer] = useState("");
  const [fMaiPO,    setFMaiPO]    = useState("");
  const [fDocType,  setFDocType]  = useState("");

  const enriched = useMemo(() => documents.map(d => {
    const ship = shipments.find(s => s.id === d.shipmentId);
    return { ...d, htsStatus: ship?.htsStatus||"", actionStatus: ship?.status||"" };
  }), [documents, shipments]);

  const rows = useMemo(() => enriched.filter(d => {
    if (fCustomer && !d.customer?.toLowerCase().includes(fCustomer.toLowerCase())) return false;
    if (fMaiPO    && !d.maiPO.includes(fMaiPO)) return false;
    if (fDocType  && d.docType !== fDocType)    return false;
    return true;
  }), [enriched, fCustomer, fMaiPO, fDocType]);

  return (
    <div>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} shipments={shipments} onUpload={onUpload} userName={user.name} />}
      {previewDoc && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <SectionTitle>Documents</SectionTitle>
        {canUpload && <Btn onClick={() => setShowUpload(true)}>📎 Upload Document</Btn>}
      </div>

      {/* Filters */}
      <div style={{ background:"#f1f5f9", border:`1px solid ${G.border}`, borderRadius:10, padding:16, marginBottom:16 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10 }}>
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:G.muted, display:"block", marginBottom:4 }}>CUSTOMER</label>
            <FInput placeholder="Search customer…" value={fCustomer} onChange={setFCustomer} style={{ width:"100%", boxSizing:"border-box" }} />
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:G.muted, display:"block", marginBottom:4 }}>MAI PO #</label>
            <FInput placeholder="e.g. 00310552" value={fMaiPO} onChange={setFMaiPO} style={{ width:"100%", boxSizing:"border-box" }} />
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:G.muted, display:"block", marginBottom:4 }}>DOCUMENT TYPE</label>
            <FSelect value={fDocType} onChange={setFDocType} style={{ width:"100%", boxSizing:"border-box" }}
              options={[{value:"",label:"All Types"},...["Commercial Invoice","Packing List","Certificate of Origin (USMCA)","Mill Certificate","BOL","AES Submission","SLI","CARTA PORTE","Other"].map(d=>({value:d,label:d}))]} />
          </div>
        </div>
        <div style={{ marginTop:10, fontSize:13, color:G.muted }}>
          Showing <strong>{rows.length}</strong> of <strong>{enriched.length}</strong> documents
        </div>
      </div>

      <div style={{ overflowX:"auto", borderRadius:8, border:`1px solid ${G.border}` }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <Th>MAI PO #</Th><Th>Customer</Th><Th>Document Type</Th><Th>File</Th><Th>Issue Date</Th><Th>HTS Status</Th><Th>Stage</Th><Th>Doc Status</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d,i) => (
              <tr key={d.id} style={{ background:i%2===0?G.white:"#f8fafc" }}
                onMouseEnter={e=>e.currentTarget.style.background=G.primaryLight}
                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?G.white:"#f8fafc"}>
                <Td style={{ fontWeight:600 }}>{d.maiPO}</Td>
                <Td style={{ fontSize:12 }}>{d.customer?.slice(0,26)}{d.customer?.length>26?"…":""}</Td>
                <Td style={{ fontSize:12 }}>{d.docType}</Td>
                <Td style={{ fontSize:12, color:G.muted }}>{d.fileName||"—"}</Td>
                <Td style={{ fontSize:12 }}>{d.issueDate||"—"}</Td>
                <Td>{d.htsStatus?<HTSBadge code={d.htsStatus}/>:<span style={{color:G.muted,fontSize:12}}>—</span>}</Td>
                <Td>{d.actionStatus?<Badge label={d.actionStatus}/>:<span style={{color:G.muted,fontSize:12}}>—</span>}</Td>
                <Td><Badge label={d.status}/></Td>
                <Td>
                  <div style={{ display:"flex", gap:5 }}>
                    <button onClick={()=>setPreviewDoc(d)} style={{ background:G.blue+"15", color:G.blue, border:`1px solid ${G.blue}25`, borderRadius:6, padding:"4px 9px", fontSize:11, cursor:"pointer", fontWeight:600 }}>👁</button>
                    {canUpload && (
                      <button onClick={()=>onDelete(d.id)} style={{ background:G.danger+"15", color:G.danger, border:`1px solid ${G.danger}25`, borderRadius:6, padding:"4px 8px", fontSize:11, cursor:"pointer" }}>🗑</button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div style={{ textAlign:"center", padding:48, color:G.muted }}>No documents match the current filters.</div>}
      </div>
    </div>
  );
}

// ── Production Page ───────────────────────────────────────────────────────────
function ProductionPage({ user, productionOrders, onAddOrder, onDeleteOrder }) {
  const canManage = ["Inside Sales","Manager/Signer","Admin"].includes(user.role);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <SectionTitle>Production Orders</SectionTitle>
      </div>
      <div style={{ overflowX:"auto", borderRadius:8, border:`1px solid ${G.border}` }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <Th>MAI PO #</Th><Th>Customer</Th><Th>Plant</Th><Th>Mill</Th><Th>Product</Th><Th>Size</Th>
              <Th>Qty (MT)</Th><Th>Ready Date</Th><Th>In Transit</Th><Th>Delivered</Th>
            </tr>
          </thead>
          <tbody>
            {productionOrders.map((o,i) => (
              <tr key={o.id} style={{ background:i%2===0?G.white:"#f8fafc" }}>
                <Td style={{ fontWeight:600 }}>{o.maiPO}</Td>
                <Td style={{ fontSize:12 }}>{o.customer?.slice(0,28)}{o.customer?.length>28?"…":""}</Td>
                <Td style={{ fontSize:12 }}>{o.plant}</Td>
                <Td style={{ fontSize:12 }}>{o.mill}</Td>
                <Td style={{ fontSize:12 }}>{o.product}</Td>
                <Td style={{ fontSize:11, color:G.muted }}>{o.size}</Td>
                <Td style={{ fontWeight:600 }}>{o.ordQty}</Td>
                <Td style={{ fontSize:12 }}>{o.readyDate}</Td>
                <Td style={{ fontSize:12 }}>{o.transit||0}</Td>
                <Td style={{ fontSize:12 }}>{o.delivered||0}</Td>
              </tr>
            ))}
          </tbody>
        </table>
        {productionOrders.length === 0 && <div style={{ textAlign:"center", padding:48, color:G.muted }}>No production orders.</div>}
      </div>
    </div>
  );
}

// ── Notifications Page ────────────────────────────────────────────────────────
function NotificationsPage({ user, notifications, setNotifications }) {
  const myNotifs = notifications.filter(n => n.roles.includes(user.role));
  const markAll = () => setNotifications(prev => prev.map(n => ({ ...n, read:true })));

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <SectionTitle>Notifications</SectionTitle>
        <Btn onClick={markAll} color={G.muted} style={{ fontSize:12 }}>Mark all read</Btn>
      </div>
      {myNotifs.length === 0 ? (
        <div style={{ textAlign:"center", padding:64, color:G.muted, background:G.white, borderRadius:12, border:`1px solid ${G.border}` }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🔔</div>
          <div style={{ fontSize:16 }}>No notifications</div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {myNotifs.map(n => (
            <div key={n.id} style={{ background:n.read?G.white:"#f0f9ff", border:`1px solid ${n.read?G.border:"#bae6fd"}`, borderRadius:10, padding:"16px 20px", display:"flex", gap:14, alignItems:"flex-start" }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{n.type==="warning"?"⚠️":n.type==="success"?"✅":"ℹ️"}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{n.title}</div>
                <div style={{ fontSize:13, color:G.muted }}>{n.message}</div>
              </div>
              <div style={{ fontSize:11, color:G.muted, whiteSpace:"nowrap", flexShrink:0 }}>{n.time}</div>
              {!n.read && <div style={{ width:8, height:8, borderRadius:"50%", background:G.blue, flexShrink:0, marginTop:4 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── User Dropdown ─────────────────────────────────────────────────────────────
function UserDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const roleColors = { "Admin":"#7c3aed","Manager/Signer":G.primary,"Inside Sales":G.blue,"Compliance":"#0369a1","Custom Broker":"#b45309","Customer":"#6d28d9","Trucking Company":"#374151","Grucas Broker":"#b45309","Gontour Broker":"#b45309" };

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={() => setOpen(p=>!p)} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", cursor:"pointer", padding:"4px 8px", borderRadius:8 }}>
        <div style={{ width:32, height:32, borderRadius:"50%", background:roleColors[user.role]||G.primary, color:G.white, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700 }}>{user.avatar}</div>
        <div style={{ textAlign:"left" }}>
          <div style={{ fontSize:13, fontWeight:600, color:G.primary, lineHeight:1.2 }}>Welcome {user.name.split(" ")[0]}!</div>
          <div style={{ fontSize:11, color:G.muted }}>{user.role}</div>
        </div>
        <span style={{ color:G.primary, fontSize:11, transform:open?"rotate(180deg)":"", transition:"transform .2s" }}>▾</span>
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:G.white, border:`1px solid ${G.border}`, borderRadius:12, boxShadow:"0 8px 32px rgba(0,0,0,.12)", minWidth:220, zIndex:999 }}>
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${G.border}`, background:G.primaryLight }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:roleColors[user.role]||G.primary, color:G.white, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700 }}>{user.avatar}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:13 }}>{user.name}</div>
                <div style={{ fontSize:11, color:G.muted }}>{user.role}</div>
              </div>
            </div>
          </div>
          <div style={{ padding:8 }}>
            <button onClick={onLogout} style={{ width:"100%", textAlign:"left", background:"none", border:"none", padding:"9px 12px", borderRadius:6, cursor:"pointer", fontSize:13, color:G.danger, fontWeight:600 }}>
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sidebar navigation ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:"dashboard",     icon:"🏠", label:"Dashboard" },
  { id:"shipments",     icon:"🚢", label:"Shipments" },
  { id:"documents",     icon:"📁", label:"Documents" },
  { id:"production",    icon:"🏭", label:"Production" },
  { id:"notifications", icon:"🔔", label:"Notifications" },
  { id:"settings",      icon:"⚙️", label:"Settings" },
];

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [selectedShipment, setSelectedShipment] = useState(null);

  const [shipments,        setShipments]        = useState(SHIPMENTS_SEED);
  const [documents,        setDocuments]        = useState(DOCUMENTS_SEED);
  const [notifications,    setNotifications]    = useState(NOTIFICATIONS_SEED);
  const [productionOrders, setProductionOrders] = useState(PRODUCTION_SEED);

  const unreadCount = notifications.filter(n => user && n.roles.includes(user.role) && !n.read).length;
  const access = user ? (ROLE_ACCESS[user.role] || []) : [];

  // ── CRUD handlers ──
  const handleAddShipment    = s  => setShipments(p => [...p, s]);
  const handleEditShipment   = (id, upd) => setShipments(p => p.map(s => s.id===id ? {...s,...upd} : s));
  const handleDeleteShipment = id => setShipments(p => p.filter(s => s.id !== id));

  const handleUpload = doc => setDocuments(p => [...p, { ...doc, id:doc.id||genId() }]);
  const handleEditDoc = (id, upd) => setDocuments(p => p.map(d => d.id===id ? {...d,...upd} : d));
  const handleDeleteDoc = id => setDocuments(p => p.filter(d => d.id !== id));

  const handleAddOrder    = o  => setProductionOrders(p => [...p, o]);
  const handleDeleteOrder = id => setProductionOrders(p => p.filter(o => o.id !== id));

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'Segoe UI', system-ui, sans-serif", background:G.bg, overflow:"hidden" }}>
      {/* Sidebar */}
      <div style={{ width:60, background:G.white, borderRight:`1px solid ${G.border}`, display:"flex", flexDirection:"column", alignItems:"center", padding:"16px 8px", flexShrink:0 }}>
        <div style={{ width:36, height:36, borderRadius:8, background:G.primary, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24 }}>
          <span style={{ color:G.white, fontSize:11, fontWeight:900 }}>M1</span>
        </div>
        {NAV_ITEMS.filter(n => access.includes(n.id)).map(n => (
          <div key={n.id} title={n.label} onClick={() => { setPage(n.id); setSelectedShipment(null); }}
            style={{ position:"relative", width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:8, cursor:"pointer", marginBottom:6, background:page===n.id?G.primary:"transparent", fontSize:20 }}>
            {n.icon}
            {n.id==="notifications" && unreadCount>0 && (
              <div style={{ position:"absolute", top:4, right:4, width:16, height:16, borderRadius:"50%", background:G.danger, color:G.white, fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {unreadCount}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main area */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Top bar */}
        <div style={{ background:G.white, borderBottom:`1px solid ${G.border}`, padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:16, color:G.text }}>Metal One America</div>
            <div style={{ fontSize:11, color:G.muted }}>Shipment & Customs Management Portal</div>
          </div>
          <UserDropdown user={user} onLogout={() => { setUser(null); setPage("dashboard"); }} />
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:28 }}>
          {page==="dashboard"     && <Dashboard user={user} setPage={setPage} shipments={shipments} notifications={notifications} />}
          {page==="shipments" && !selectedShipment && (
            <ShipmentsPage user={user} shipments={shipments} documents={documents}
              onDetail={s => setSelectedShipment(s)}
              onAddShipment={handleAddShipment}
              onEditShipment={handleEditShipment}
              onDeleteShipment={handleDeleteShipment} />
          )}
          {page==="shipments" && selectedShipment && (
            <ShipmentDetail
              shipment={selectedShipment}
              onBack={() => setSelectedShipment(null)}
              user={user}
              documents={documents}
              shipments={shipments}
              onUpload={handleUpload}
              onEdit={handleEditDoc}
              onDelete={handleDeleteDoc}
              onUpdateShipment={handleEditShipment} />
          )}
          {page==="documents"     && <DocumentsPage user={user} documents={documents} onUpload={handleUpload} onEdit={handleEditDoc} onDelete={handleDeleteDoc} shipments={shipments} />}
          {page==="production"    && <ProductionPage user={user} productionOrders={productionOrders} onAddOrder={handleAddOrder} onDeleteOrder={handleDeleteOrder} />}
          {page==="notifications" && <NotificationsPage user={user} notifications={notifications} setNotifications={setNotifications} />}
          {page==="settings"      && (
            <div>
              <SectionTitle>Settings</SectionTitle>
              <div style={{ background:G.white, borderRadius:10, border:`1px solid ${G.border}`, padding:32, color:G.muted }}>
                Settings panel coming soon.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
