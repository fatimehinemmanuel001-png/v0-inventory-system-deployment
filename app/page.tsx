"use client";
import { useState, useMemo, useRef, useEffect } from "react";

// ── DESIGN TOKENS ──────────────────────────────────────────────
const C = {
  bg: "#0a0d14", surface: "#111520", surfaceAlt: "#181e2e", border: "#1f2840",
  accent: "#6c8fff", accentDim: "#6c8fff18", text: "#e8edf8", textMuted: "#5a6480",
  green: "#22d47a", red: "#f04b5a", yellow: "#f5c842", purple: "#b06cff",
  orange: "#ff8c42",
};

// ── SEED DATA ──────────────────────────────────────────────────
const CATEGORIES = ["Electronics", "Groceries", "Stationery", "Clothing", "Tools"];
const EMOJI = { Electronics:"⚡", Groceries:"🛒", Stationery:"📝", Clothing:"👕", Tools:"🔧" };

const INIT_PRODUCTS = [
  { id:1, sku:"EL-001", name:"USB-C Hub 7-in-1",        category:"Electronics", cost:12,  price:29.99, qty:45, lowStock:10, supplier:"TechParts Ltd" },
  { id:2, sku:"EL-002", name:"Wireless Mouse",           category:"Electronics", cost:8,   price:19.99, qty:8,  lowStock:10, supplier:"TechParts Ltd" },
  { id:3, sku:"GR-001", name:"Arabica Coffee Beans 1kg", category:"Groceries",   cost:6,   price:14.50, qty:32, lowStock:15, supplier:"Metro Wholesale" },
  { id:4, sku:"GR-002", name:"Organic Green Tea 50pk",   category:"Groceries",   cost:3,   price:7.99,  qty:5,  lowStock:10, supplier:"Metro Wholesale" },
  { id:5, sku:"ST-001", name:"A4 Notebook 200pg",        category:"Stationery",  cost:1.5, price:4.50,  qty:120,lowStock:20, supplier:"Stationery World" },
  { id:6, sku:"ST-002", name:"Ballpoint Pen (Box/12)",   category:"Stationery",  cost:0.8, price:2.99,  qty:3,  lowStock:10, supplier:"Stationery World" },
  { id:7, sku:"CL-001", name:'Cotton T-Shirt L',         category:"Clothing",    cost:5,   price:15.99, qty:22, lowStock:8,  supplier:"FashionWholesale" },
  { id:8, sku:"TL-001", name:'Adjustable Wrench 10"',    category:"Tools",       cost:7,   price:18.50, qty:14, lowStock:5,  supplier:"ToolZone" },
];

const INIT_SUPPLIERS = [
  { id:1, name:"TechParts Ltd",     contact:"Alex Kim",    email:"alex@techparts.com",  phone:"+1 555-0101", address:"123 Tech Ave, Silicon City",   notes:"Reliable. Net-30 terms." },
  { id:2, name:"Metro Wholesale",   contact:"Priya Sharma",email:"priya@metro.com",     phone:"+1 555-0202", address:"45 Market St, Foodville",      notes:"Delivers Mon/Wed/Fri." },
  { id:3, name:"Stationery World",  contact:"John Reeves", email:"john@statworld.com",  phone:"+1 555-0303", address:"78 Paper Lane, Inkton",         notes:"Minimum order $50." },
  { id:4, name:"FashionWholesale",  contact:"Maria Lopez", email:"maria@fwholesale.com",phone:"+1 555-0404", address:"9 Fabric Blvd, Styleville",    notes:"" },
  { id:5, name:"ToolZone",          contact:"Derek Hall",  email:"derek@toolzone.com",  phone:"+1 555-0505", address:"200 Industrial Rd, Buildtown", notes:"Good bulk discounts." },
];

const INIT_SALES = [
  { id:1, date:"2026-05-08", items:[{productId:1,name:"USB-C Hub 7-in-1",qty:2,price:29.99,cost:12},{productId:5,name:"A4 Notebook 200pg",qty:3,price:4.5,cost:1.5}], total:73.48, payment:"Cash" },
  { id:2, date:"2026-05-08", items:[{productId:3,name:"Arabica Coffee Beans 1kg",qty:1,price:14.5,cost:6},{productId:4,name:"Organic Green Tea 50pk",qty:2,price:7.99,cost:3}], total:30.48, payment:"Card" },
  { id:3, date:"2026-05-09", items:[{productId:7,name:"Cotton T-Shirt L",qty:2,price:15.99,cost:5},{productId:8,name:'Adjustable Wrench 10"',qty:1,price:18.5,cost:7}], total:50.48, payment:"Card" },
  { id:4, date:"2026-05-09", items:[{productId:2,name:"Wireless Mouse",qty:1,price:19.99,cost:8}], total:19.99, payment:"Cash" },
  { id:5, date:"2026-05-10", items:[{productId:1,name:"USB-C Hub 7-in-1",qty:1,price:29.99,cost:12},{productId:6,name:"Ballpoint Pen (Box/12)",qty:2,price:2.99,cost:0.8}], total:35.97, payment:"Mobile" },
];

const INIT_PURCHASE_ORDERS = [
  { id:1, supplier:"TechParts Ltd",    date:"2026-05-06", expectedDate:"2026-05-13", status:"Received",  items:[{sku:"EL-002",name:"Wireless Mouse",qty:20,unitCost:8}], total:160, notes:"" },
  { id:2, supplier:"Metro Wholesale",  date:"2026-05-09", expectedDate:"2026-05-14", status:"Ordered",   items:[{sku:"GR-002",name:"Organic Green Tea 50pk",qty:30,unitCost:3}], total:90, notes:"Urgent restock" },
  { id:3, supplier:"Stationery World", date:"2026-05-10", expectedDate:"2026-05-15", status:"Pending",   items:[{sku:"ST-002",name:"Ballpoint Pen (Box/12)",qty:50,unitCost:0.8}], total:40, notes:"" },
];

// Stock history events
const INIT_HISTORY = [
  { id:1, date:"2026-05-06", productId:2, productName:"Wireless Mouse",           type:"Purchase Order", delta:+20, balanceAfter:28, ref:"PO-001", note:"Received from TechParts Ltd" },
  { id:2, date:"2026-05-08", productId:1, productName:"USB-C Hub 7-in-1",         type:"Sale",           delta:-2,  balanceAfter:47, ref:"SALE-001", note:"" },
  { id:3, date:"2026-05-08", productId:5, productName:"A4 Notebook 200pg",        type:"Sale",           delta:-3,  balanceAfter:123,ref:"SALE-001", note:"" },
  { id:4, date:"2026-05-08", productId:3, productName:"Arabica Coffee Beans 1kg", type:"Sale",           delta:-1,  balanceAfter:33, ref:"SALE-002", note:"" },
  { id:5, date:"2026-05-09", productId:7, productName:"Cotton T-Shirt L",         type:"Sale",           delta:-2,  balanceAfter:24, ref:"SALE-003", note:"" },
  { id:6, date:"2026-05-09", productId:2, productName:"Wireless Mouse",           type:"Sale",           delta:-1,  balanceAfter:8,  ref:"SALE-004", note:"" },
  { id:7, date:"2026-05-10", productId:1, productName:"USB-C Hub 7-in-1",         type:"Sale",           delta:-1,  balanceAfter:45, ref:"SALE-005", note:"" },
  { id:8, date:"2026-05-10", productId:4, productName:"Organic Green Tea 50pk",   type:"Adjustment",     delta:-2,  balanceAfter:5,  ref:"ADJ-001",  note:"Damaged stock removed" },
];

// ── HELPERS ────────────────────────────────────────────────────
const fmt = n => `$${Number(n).toFixed(2)}`;
const profit = items => items.reduce((s,i) => s+(i.price-i.cost)*i.qty, 0);
const uid = () => Date.now() + Math.floor(Math.random()*1000);

// ── ICONS ──────────────────────────────────────────────────────
const Icon = ({ d, size=18, color="currentColor", sw=1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const IC = {
  dash:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  tag:     "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
  pos:     "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4",
  people:  "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  chart:   "M18 20V10 M12 20V4 M6 20v-6",
  alert:   "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  plus:    "M12 5v14 M5 12h14",
  edit:    "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:   "M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6",
  search:  "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  cart:    "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0",
  check:   "M20 6L9 17l-5-5",
  x:       "M18 6L6 18 M6 6l12 12",
  pkg:     "M16.5 9.4l-9-5.19 M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12",
  trend:   "M23 6l-9.5 9.5-5-5L1 18",
  po:      "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  history: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0",
  ai:      "M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 010 2h-1v1a2 2 0 01-2 2v1a1 1 0 01-2 0v-1H7v1a1 1 0 01-2 0v-1a2 2 0 01-2-2v-1H2a1 1 0 010-2h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z",
  send:    "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7",
  barcode: "M4 6v12 M8 6v12 M12 6v12 M16 6v12 M20 6v12 M2 9h2 M2 15h2 M20 9h2 M20 15h2",
  scan:    "M3 7V5a2 2 0 012-2h2 M17 3h2a2 2 0 012 2v2 M21 17v2a2 2 0 01-2 2h-2 M7 21H5a2 2 0 01-2-2v-2 M7 8h10 M7 12h10 M7 16h6",
};

// ── SHARED UI ──────────────────────────────────────────────────
const Badge = ({ children, color=C.accent }) => (
  <span style={{ background:color+"22", color, border:`1px solid ${color}44`, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase" }}>{children}</span>
);
const Card = ({ children, style={} }) => (
  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:24, ...style }}>{children}</div>
);
const StatCard = ({ label, value, sub, color=C.accent, icon }) => (
  <Card style={{ display:"flex", flexDirection:"column", gap:8 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <span style={{ color:C.textMuted, fontSize:12, fontWeight:700, letterSpacing:"0.04em", textTransform:"uppercase" }}>{label}</span>
      <Icon d={icon} size={18} color={color}/>
    </div>
    <div style={{ fontSize:26, fontWeight:900, color, fontFamily:"monospace" }}>{value}</div>
    {sub && <div style={{ fontSize:12, color:C.textMuted }}>{sub}</div>}
  </Card>
);
const Btn = ({ children, onClick, variant="primary", style={}, small=false, disabled=false }) => {
  const s = { primary:{background:C.accent,color:"#fff",border:"none"}, secondary:{background:"transparent",color:C.text,border:`1px solid ${C.border}`}, danger:{background:C.red+"22",color:C.red,border:`1px solid ${C.red}44`}, ghost:{background:"transparent",color:C.textMuted,border:"none"}, success:{background:C.green+"22",color:C.green,border:`1px solid ${C.green}44`} };
  return <button onClick={onClick} disabled={disabled} style={{ ...s[variant], borderRadius:8, padding:small?"5px 11px":"9px 18px", fontSize:small?12:14, fontWeight:700, cursor:disabled?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", gap:6, fontFamily:"inherit", opacity:disabled?0.5:1, transition:"opacity 0.15s", ...style }} onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.opacity="0.8"; }} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{children}</button>;
};
const Input = ({ label, value, onChange, type="text", placeholder="", style={} }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:5, ...style }}>
    {label && <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, letterSpacing:"0.05em", textTransform:"uppercase" }}>{label}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 13px", color:C.text, fontSize:14, outline:"none", fontFamily:"inherit" }}
      onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/>
  </div>
);
const Sel = ({ label, value, onChange, options, style={} }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:5, ...style }}>
    {label && <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, letterSpacing:"0.05em", textTransform:"uppercase" }}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 13px", color:C.text, fontSize:14, outline:"none", fontFamily:"inherit" }}>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);
const Modal = ({ title, onClose, children, wide=false }) => (
  <div style={{ position:"fixed", inset:0, background:"#00000099", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:32, width:"100%", maxWidth:wide?740:520, maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:900 }}>{title}</h2>
        <Btn onClick={onClose} variant="ghost"><Icon d={IC.x}/></Btn>
      </div>
      {children}
    </div>
  </div>
);
const Table = ({ cols, rows }) => (
  <div style={{ overflowX:"auto" }}>
    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
      <thead><tr>{cols.map(c=><th key={c} style={{ textAlign:"left", padding:"10px 14px", color:C.textMuted, fontSize:11, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", borderBottom:`1px solid ${C.border}` }}>{c}</th>)}</tr></thead>
      <tbody>{rows}</tbody>
    </table>
  </div>
);
const TR = ({ children, hi=false }) => <tr style={{ borderBottom:`1px solid ${C.border}22`, background:hi?C.accentDim:"transparent" }}>{children}</tr>;
const TD = ({ children, mono=false }) => <td style={{ padding:"11px 14px", color:C.text, fontFamily:mono?"monospace":"inherit", fontSize:13 }}>{children}</td>;

// ── DASHBOARD ──────────────────────────────────────────────────
function Dashboard({ products, sales }) {
  const today = "2026-05-10";
  const todaySales = sales.filter(s=>s.date===today);
  const rev = todaySales.reduce((s,t)=>s+t.total,0);
  const prof = todaySales.reduce((s,t)=>s+profit(t.items),0);
  const lowStock = products.filter(p=>p.qty<=p.lowStock);
  const productSales={};
  sales.forEach(s=>s.items.forEach(i=>{ productSales[i.name]=(productSales[i.name]||0)+i.qty; }));
  const best = Object.entries(productSales).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const days=["05-08","05-09","05-10"];
  const weekRev = days.map(d=>({ date:d, rev:sales.filter(s=>s.date.endsWith(d)).reduce((s,t)=>s+t.total,0) }));
  const maxRev = Math.max(...weekRev.map(d=>d.rev));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
      <div><h1 style={{ margin:0, fontSize:26, fontWeight:900 }}>Dashboard</h1><p style={{ margin:"4px 0 0", color:C.textMuted, fontSize:13 }}>Sunday, May 10 2026 — StockHQ Pro</p></div>
      {lowStock.length>0&&<div style={{ background:C.red+"15", border:`1px solid ${C.red}33`, borderRadius:10, padding:"12px 18px", display:"flex", alignItems:"center", gap:10 }}><Icon d={IC.alert} color={C.red} size={18}/><span style={{ color:C.red, fontWeight:700, fontSize:13 }}>{lowStock.length} item{lowStock.length>1?"s":""} low stock: {lowStock.map(p=>p.name).join(", ")}</span></div>}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14 }}>
        <StatCard label="Today Revenue" value={fmt(rev)} sub={`${todaySales.length} transactions`} icon={IC.trend} color={C.green}/>
        <StatCard label="Today Profit"  value={fmt(prof)} sub={`${rev?(prof/rev*100).toFixed(1):0}% margin`} icon={IC.chart} color={C.accent}/>
        <StatCard label="Products"      value={products.length} sub={`${lowStock.length} low stock`} icon={IC.tag} color={C.purple}/>
        <StatCard label="Low Stock"     value={lowStock.length} sub="Need reorder" icon={IC.alert} color={C.red}/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <Card>
          <h3 style={{ margin:"0 0 18px", fontSize:12, fontWeight:800, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.05em" }}>Revenue — Last 3 Days</h3>
          <div style={{ display:"flex", alignItems:"flex-end", gap:16, height:110 }}>
            {weekRev.map(d=>(
              <div key={d.date} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:11, color:C.textMuted, fontFamily:"monospace" }}>{fmt(d.rev)}</span>
                <div style={{ width:"100%", background:`linear-gradient(to top,${C.accent},${C.accent}88)`, borderRadius:"5px 5px 0 0", height:`${(d.rev/maxRev)*80}px` }}/>
                <span style={{ fontSize:11, color:C.textMuted }}>May {d.date.split("-")[1]}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 style={{ margin:"0 0 18px", fontSize:12, fontWeight:800, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.05em" }}>Top Sellers</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {best.map(([name,qty],i)=>(
              <div key={name} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:11, color:C.accent, fontWeight:800, width:18 }}>#{i+1}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600 }}>{name}</div>
                  <div style={{ height:3, background:C.border, borderRadius:2, marginTop:3 }}>
                    <div style={{ height:3, borderRadius:2, width:`${(qty/best[0][1])*100}%`, background:C.accent }}/>
                  </div>
                </div>
                <span style={{ fontSize:11, color:C.textMuted, fontFamily:"monospace" }}>{qty}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card style={{ padding:0 }}>
        <div style={{ padding:"18px 22px 10px" }}><h3 style={{ margin:0, fontSize:12, fontWeight:800, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.05em" }}>Recent Transactions</h3></div>
        <Table cols={["Date","Items","Total","Profit","Payment"]} rows={sales.slice(-5).reverse().map(s=>(
          <TR key={s.id}>
            <TD mono>{s.date}</TD>
            <TD>{s.items.map(i=>`${i.name} ×${i.qty}`).join(", ")}</TD>
            <TD mono><span style={{ color:C.green }}>{fmt(s.total)}</span></TD>
            <TD mono><span style={{ color:C.accent }}>{fmt(profit(s.items))}</span></TD>
            <TD><Badge color={s.payment==="Cash"?C.green:s.payment==="Card"?C.accent:C.purple}>{s.payment}</Badge></TD>
          </TR>
        ))}/>
      </Card>
    </div>
  );
}

// ── PRODUCTS ───────────────────────────────────────────────────
function Products({ products, setProducts }) {
  const [search,setSearch]=useState(""); const [cat,setCat]=useState("All");
  const [showModal,setShowModal]=useState(false); const [edit,setEdit]=useState(null);
  const [form,setForm]=useState({ sku:"",name:"",category:CATEGORIES[0],cost:"",price:"",qty:"",lowStock:"10",supplier:"" });
  const filtered=useMemo(()=>products.filter(p=>(cat==="All"||p.category===cat)&&(p.name.toLowerCase().includes(search.toLowerCase())||p.sku.toLowerCase().includes(search.toLowerCase()))),[products,search,cat]);
  const openAdd=()=>{ setEdit(null); setForm({ sku:"",name:"",category:CATEGORIES[0],cost:"",price:"",qty:"",lowStock:"10",supplier:"" }); setShowModal(true); };
  const openEdit=p=>{ setEdit(p); setForm({...p,cost:String(p.cost),price:String(p.price),qty:String(p.qty),lowStock:String(p.lowStock)}); setShowModal(true); };
  const save=()=>{ if(!form.name||!form.sku)return; const item={...form,id:edit?.id||uid(),cost:+form.cost,price:+form.price,qty:+form.qty,lowStock:+form.lowStock}; setProducts(prev=>edit?prev.map(p=>p.id===edit.id?item:p):[...prev,item]); setShowModal(false); };
  const del=id=>setProducts(prev=>prev.filter(p=>p.id!==id));
  const f=k=>v=>setForm(prev=>({...prev,[k]:v}));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div><h1 style={{ margin:0, fontSize:26, fontWeight:900 }}>Products</h1><p style={{ margin:"4px 0 0", color:C.textMuted, fontSize:13 }}>{products.length} items</p></div>
        <Btn onClick={openAdd}><Icon d={IC.plus} size={15}/>Add Product</Btn>
      </div>
      <div style={{ display:"flex", gap:10 }}>
        <div style={{ flex:1, position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:C.textMuted }}><Icon d={IC.search} size={15}/></span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or SKU…" style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 13px 9px 38px", color:C.text, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}/>
        </div>
        <Sel value={cat} onChange={setCat} options={["All",...CATEGORIES]}/>
      </div>
      <Card style={{ padding:0 }}>
        <Table cols={["SKU","Product","Cat","Cost","Price","Margin","Stock","Status","Actions"]} rows={filtered.map(p=>{
          const margin=(((p.price-p.cost)/p.price)*100).toFixed(0); const low=p.qty<=p.lowStock;
          return(<TR key={p.id} hi={low}>
            <TD mono><span style={{ color:C.textMuted }}>{p.sku}</span></TD>
            <TD><span style={{ fontWeight:600 }}>{EMOJI[p.category]||"📦"} {p.name}</span></TD>
            <TD><Badge color={C.accent}>{p.category}</Badge></TD>
            <TD mono>{fmt(p.cost)}</TD>
            <TD mono><span style={{ color:C.green,fontWeight:700 }}>{fmt(p.price)}</span></TD>
            <TD mono><span style={{ color:C.accent }}>{margin}%</span></TD>
            <TD mono><span style={{ color:low?C.red:C.text, fontWeight:low?800:400 }}>{p.qty}</span></TD>
            <TD>{low?<Badge color={C.red}>Low</Badge>:<Badge color={C.green}>OK</Badge>}</TD>
            <TD><div style={{ display:"flex", gap:4 }}><Btn onClick={()=>openEdit(p)} variant="ghost" small><Icon d={IC.edit} size={13}/></Btn><Btn onClick={()=>del(p.id)} variant="danger" small><Icon d={IC.trash} size={13}/></Btn></div></TD>
          </TR>);
        })}/>
      </Card>
      {showModal&&<Modal title={edit?"Edit Product":"Add Product"} onClose={()=>setShowModal(false)}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <Input label="SKU" value={form.sku} onChange={f("sku")} placeholder="EL-001"/>
          <Input label="Name" value={form.name} onChange={f("name")} placeholder="Product name" style={{ gridColumn:"1/-1" }}/>
          <Sel label="Category" value={form.category} onChange={f("category")} options={CATEGORIES}/>
          <Input label="Supplier" value={form.supplier} onChange={f("supplier")} placeholder="Supplier name"/>
          <Input label="Cost ($)" value={form.cost} onChange={f("cost")} type="number"/>
          <Input label="Price ($)" value={form.price} onChange={f("price")} type="number"/>
          <Input label="Qty" value={form.qty} onChange={f("qty")} type="number"/>
          <Input label="Low Stock Alert" value={form.lowStock} onChange={f("lowStock")} type="number"/>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:22 }}>
          <Btn onClick={()=>setShowModal(false)} variant="secondary">Cancel</Btn>
          <Btn onClick={save}><Icon d={IC.check} size={15}/>{edit?"Update":"Add"}</Btn>
        </div>
      </Modal>}
    </div>
  );
}

// ── POS ────────────────────────────────────────────────────────
function POS({ products, setProducts, setSales, addHistory }) {
  const [search,setSearch]=useState(""); const [cart,setCart]=useState([]);
  const [discount,setDiscount]=useState(0); const [tax,setTax]=useState(8);
  const [payment,setPayment]=useState("Cash"); const [done,setDone]=useState(false);
  const [scanInput,setScanInput]=useState(""); const [scanMsg,setScanMsg]=useState("");
  const scanRef=useRef(null);

  const filtered=products.filter(p=>p.qty>0&&(p.name.toLowerCase().includes(search.toLowerCase())||p.category.toLowerCase().includes(search.toLowerCase())));
  const addToCart=p=>{ setCart(prev=>{ const ex=prev.find(c=>c.id===p.id); if(ex){ if(ex.qty>=p.qty)return prev; return prev.map(c=>c.id===p.id?{...c,qty:c.qty+1}:c); } return [...prev,{...p,qty:1}]; }); };
  const updateQty=(id,delta)=>setCart(prev=>prev.map(c=>c.id===id?{...c,qty:Math.max(0,c.qty+delta)}:c).filter(c=>c.qty>0));
  const sub=cart.reduce((s,c)=>s+c.price*c.qty,0);
  const disc=sub*(discount/100); const taxAmt=(sub-disc)*(tax/100); const total=sub-disc+taxAmt;

  const handleScan=()=>{
    const p=products.find(p=>p.sku.toLowerCase()===scanInput.trim().toLowerCase());
    if(p){ addToCart(p); setScanMsg(`✓ Added: ${p.name}`); setScanInput(""); }
    else{ setScanMsg(`✗ SKU "${scanInput}" not found`); }
    setTimeout(()=>setScanMsg(""),2500);
  };

  const checkout=()=>{
    if(!cart.length)return;
    const saleId=`SALE-${uid()}`;
    setProducts(prev=>prev.map(p=>{ const item=cart.find(c=>c.id===p.id); return item?{...p,qty:p.qty-item.qty}:p; }));
    setSales(prev=>[...prev,{ id:uid(), date:"2026-05-10", items:cart.map(c=>({productId:c.id,name:c.name,qty:c.qty,price:c.price,cost:c.cost})), total, payment }]);
    cart.forEach(c=>addHistory({ date:"2026-05-10", productId:c.id, productName:c.name, type:"Sale", delta:-c.qty, balanceAfter:products.find(p=>p.id===c.id).qty-c.qty, ref:saleId, note:"" }));
    setDone(true);
  };
  const reset=()=>{ setCart([]); setDiscount(0); setTax(8); setDone(false); };

  if(done) return(
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, gap:22 }}>
      <div style={{ width:72,height:72,borderRadius:"50%",background:C.green+"22",display:"flex",alignItems:"center",justifyContent:"center" }}><Icon d={IC.check} size={36} color={C.green} sw={3}/></div>
      <div style={{ textAlign:"center" }}><h2 style={{ margin:0,fontSize:26,fontWeight:900,color:C.green }}>Sale Complete!</h2><p style={{ color:C.textMuted,margin:"6px 0 0" }}>Total: <strong style={{ color:C.text }}>{fmt(total)}</strong> via {payment}</p></div>
      <Card style={{ width:"100%",maxWidth:300 }}>
        <h4 style={{ margin:"0 0 12px",textAlign:"center",textTransform:"uppercase",letterSpacing:"0.1em",fontSize:12,color:C.textMuted }}>Receipt</h4>
        {cart.map(c=><div key={c.id} style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6 }}><span>{c.name} ×{c.qty}</span><span style={{ fontFamily:"monospace" }}>{fmt(c.price*c.qty)}</span></div>)}
        <div style={{ borderTop:`1px dashed ${C.border}`,marginTop:10,paddingTop:10,display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:16 }}><span>Total</span><span style={{ color:C.green }}>{fmt(total)}</span></div>
      </Card>
      <Btn onClick={reset}><Icon d={IC.plus} size={15}/>New Sale</Btn>
    </div>
  );

  return(
    <div style={{ display:"flex", flexDirection:"column", gap:14, width:"100%", maxWidth:"100%", overflowX:"hidden" }}>
      <h1 style={{ margin:0, fontSize:22, fontWeight:900 }}>Point of Sale</h1>
      {/* Barcode scanner */}
      <div style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 16px" }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8, display:"flex", alignItems:"center", gap:6 }}><Icon d={IC.scan} size={14}/>Barcode / SKU Scanner</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <input ref={scanRef} value={scanInput} onChange={e=>setScanInput(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter")handleScan(); }} placeholder="Type or scan SKU, press Enter…" style={{ flex:"1 1 200px", minWidth:0, background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", color:C.text, fontSize:13, outline:"none", fontFamily:"monospace", boxSizing:"border-box" }} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/>
          <Btn onClick={handleScan} small><Icon d={IC.scan} size={14}/>Scan</Btn>
        </div>
        {scanMsg&&<div style={{ marginTop:6, fontSize:12, color:scanMsg.startsWith("✓")?C.green:C.red, fontFamily:"monospace" }}>{scanMsg}</div>}
      </div>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.textMuted }}><Icon d={IC.search} size={15}/></span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…" style={{ width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 13px 9px 38px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box" }}/>
      </div>
      {/* Product Grid */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10 }}>
        {filtered.map(p=>{ const inCart=cart.find(c=>c.id===p.id); return(
          <div key={p.id} onClick={()=>addToCart(p)} style={{ background:inCart?C.accentDim:C.surface, border:`1px solid ${inCart?C.accent:C.border}`, borderRadius:10, padding:12, cursor:"pointer", transition:"all 0.15s", display:"flex", flexDirection:"column", gap:6 }}>
            <div style={{ fontSize:24, textAlign:"center" }}>{EMOJI[p.category]||"📦"}</div>
            <div style={{ fontSize:11, fontWeight:700, lineHeight:1.3 }}>{p.name}</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color:C.green,fontWeight:800,fontFamily:"monospace",fontSize:13 }}>{fmt(p.price)}</span>
              <span style={{ fontSize:10,color:C.textMuted }}>×{p.qty}</span>
            </div>
            {inCart&&<Badge color={C.accent}>×{inCart.qty}</Badge>}
          </div>
        ); })}
      </div>
      {/* Cart Section */}
      <Card style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <h3 style={{ margin:0, fontSize:13, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.05em", color:C.textMuted, display:"flex", alignItems:"center", gap:6 }}><Icon d={IC.cart} size={14}/> Cart ({cart.length})</h3>
        {cart.length===0?<div style={{ padding:"20px 0",textAlign:"center",color:C.textMuted,fontSize:13 }}>Tap products to add</div>:
        <div style={{ display:"flex",flexDirection:"column",gap:6 }}>{cart.map(c=>(
          <div key={c.id} style={{ display:"flex",alignItems:"center",gap:7,padding:"8px 0",borderBottom:`1px solid ${C.border}33`,flexWrap:"wrap" }}>
            <div style={{ flex:"1 1 120px",minWidth:0 }}><div style={{ fontSize:12,fontWeight:600 }}>{c.name}</div><div style={{ fontSize:11,color:C.textMuted,fontFamily:"monospace" }}>{fmt(c.price)}</div></div>
            <div style={{ display:"flex",alignItems:"center",gap:4 }}><Btn onClick={()=>updateQty(c.id,-1)} variant="secondary" small>−</Btn><span style={{ fontSize:13,fontWeight:700,minWidth:18,textAlign:"center" }}>{c.qty}</span><Btn onClick={()=>updateQty(c.id,1)} variant="secondary" small>+</Btn></div>
            <span style={{ fontSize:12,fontWeight:700,fontFamily:"monospace",color:C.green,minWidth:52,textAlign:"right" }}>{fmt(c.price*c.qty)}</span>
          </div>
        ))}</div>}
      </Card>
      {/* Totals & Checkout */}
      <Card>
        <div style={{ display:"flex",gap:10,marginBottom:10,flexWrap:"wrap" }}>
          <Input label="Discount %" value={String(discount)} onChange={v=>setDiscount(+v)} type="number" style={{ flex:"1 1 80px",minWidth:80 }}/>
          <Input label="Tax %" value={String(tax)} onChange={v=>setTax(+v)} type="number" style={{ flex:"1 1 80px",minWidth:80 }}/>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:4,marginBottom:14,fontSize:13 }}>
          <div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ color:C.textMuted }}>Subtotal</span><span style={{ fontFamily:"monospace" }}>{fmt(sub)}</span></div>
          {discount>0&&<div style={{ display:"flex",justifyContent:"space-between",color:C.red }}><span>Discount {discount}%</span><span style={{ fontFamily:"monospace" }}>−{fmt(disc)}</span></div>}
          <div style={{ display:"flex",justifyContent:"space-between",color:C.textMuted }}><span>Tax {tax}%</span><span style={{ fontFamily:"monospace" }}>+{fmt(taxAmt)}</span></div>
          <div style={{ display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:17,marginTop:8,borderTop:`1px solid ${C.border}`,paddingTop:10 }}><span>Total</span><span style={{ color:C.green,fontFamily:"monospace" }}>{fmt(total)}</span></div>
        </div>
        <Sel label="Payment" value={payment} onChange={setPayment} options={["Cash","Card","Mobile"]} style={{ marginBottom:10 }}/>
        <Btn onClick={checkout} disabled={!cart.length} style={{ width:"100%",justifyContent:"center" }}><Icon d={IC.check} size={15}/>Confirm Sale</Btn>
      </Card>
    </div>
  );
}

// ── PURCHASE ORDERS ────────────────────────────────────────────
function PurchaseOrders({ orders, setOrders, products, setProducts, suppliers, addHistory }) {
  const [showModal,setShowModal]=useState(false);
  const [form,setForm]=useState({ supplier:"", expectedDate:"", notes:"", items:[{sku:"",name:"",qty:1,unitCost:0}] });

  const statusColor={ Pending:C.yellow, Ordered:C.accent, Received:C.green, Cancelled:C.red };

  const receive=o=>{
    setProducts(prev=>prev.map(p=>{
      const item=o.items.find(i=>i.sku===p.sku);
      if(!item)return p;
      addHistory({ date:"2026-05-10", productId:p.id, productName:p.name, type:"Purchase Order", delta:+item.qty, balanceAfter:p.qty+item.qty, ref:`PO-${o.id}`, note:`Received from ${o.supplier}` });
      return { ...p, qty:p.qty+item.qty };
    }));
    setOrders(prev=>prev.map(x=>x.id===o.id?{...x,status:"Received"}:x));
  };

  const addItem=()=>setForm(prev=>({...prev,items:[...prev.items,{sku:"",name:"",qty:1,unitCost:0}]}));
  const updItem=(i,k,v)=>setForm(prev=>({ ...prev, items:prev.items.map((it,idx)=>idx===i?{...it,[k]:v}:it) }));
  const autofillItem=(i,sku)=>{
    const p=products.find(x=>x.sku===sku);
    if(p) setForm(prev=>({ ...prev, items:prev.items.map((it,idx)=>idx===i?{...it,sku:p.sku,name:p.name,unitCost:p.cost}:it) }));
    else updItem(i,"sku",sku);
  };
  const save=()=>{
    const total=form.items.reduce((s,i)=>s+i.qty*i.unitCost,0);
    setOrders(prev=>[...prev,{ id:uid(), ...form, date:"2026-05-10", status:"Pending", total }]);
    setShowModal(false);
    setForm({ supplier:"",expectedDate:"",notes:"",items:[{sku:"",name:"",qty:1,unitCost:0}] });
  };
  const f=k=>v=>setForm(prev=>({...prev,[k]:v}));

  return(
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div><h1 style={{ margin:0, fontSize:26, fontWeight:900 }}>Purchase Orders</h1><p style={{ margin:"4px 0 0", color:C.textMuted, fontSize:13 }}>{orders.length} orders</p></div>
        <Btn onClick={()=>setShowModal(true)}><Icon d={IC.plus} size={15}/>New PO</Btn>
      </div>
      <Card style={{ padding:0 }}>
        <Table cols={["PO #","Supplier","Date","Expected","Items","Total","Status","Actions"]} rows={orders.map(o=>(
          <TR key={o.id}>
            <TD mono><span style={{ color:C.textMuted }}>PO-{o.id}</span></TD>
            <TD><span style={{ fontWeight:600 }}>{o.supplier}</span></TD>
            <TD mono>{o.date}</TD>
            <TD mono>{o.expectedDate||"—"}</TD>
            <TD>{o.items.map(i=>`${i.name||i.sku} ×${i.qty}`).join(", ")}</TD>
            <TD mono><span style={{ color:C.green }}>{fmt(o.total)}</span></TD>
            <TD><Badge color={statusColor[o.status]||C.textMuted}>{o.status}</Badge></TD>
            <TD>
              {o.status!=="Received"&&o.status!=="Cancelled"&&
              <Btn onClick={()=>receive(o)} variant="success" small><Icon d={IC.check} size={13}/>Receive</Btn>}
            </TD>
          </TR>
        ))}/>
      </Card>
      {showModal&&<Modal title="New Purchase Order" onClose={()=>setShowModal(false)} wide>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
          <Sel label="Supplier" value={form.supplier} onChange={f("supplier")} options={["",  ...suppliers.map(s=>s.name)]}/>
          <Input label="Expected Delivery" value={form.expectedDate} onChange={f("expectedDate")} type="date"/>
          <Input label="Notes" value={form.notes} onChange={f("notes")} placeholder="Optional notes…" style={{ gridColumn:"1/-1" }}/>
        </div>
        <div style={{ marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.05em" }}>Order Items</label>
          <Btn onClick={addItem} variant="secondary" small><Icon d={IC.plus} size={12}/>Add Row</Btn>
        </div>
        {form.items.map((it,i)=>(
          <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 2fr 80px 100px", gap:10, marginBottom:8 }}>
            <Input value={it.sku} onChange={v=>autofillItem(i,v)} placeholder="SKU"/>
            <Input value={it.name} onChange={v=>updItem(i,"name",v)} placeholder="Product name"/>
            <Input value={String(it.qty)} onChange={v=>updItem(i,"qty",+v)} type="number" placeholder="Qty"/>
            <Input value={String(it.unitCost)} onChange={v=>updItem(i,"unitCost",+v)} type="number" placeholder="Cost"/>
          </div>
        ))}
        <div style={{ background:C.surfaceAlt, borderRadius:8, padding:"10px 14px", marginTop:10, textAlign:"right", fontSize:13 }}>
          <strong>Order Total: </strong><span style={{ color:C.green, fontFamily:"monospace", fontWeight:700 }}>{fmt(form.items.reduce((s,i)=>s+i.qty*i.unitCost,0))}</span>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:22 }}>
          <Btn onClick={()=>setShowModal(false)} variant="secondary">Cancel</Btn>
          <Btn onClick={save}><Icon d={IC.check} size={15}/>Create PO</Btn>
        </div>
      </Modal>}
    </div>
  );
}

// ── STOCK HISTORY ──────────────────────────────────────────────
function StockHistory({ history, products }) {
  const [filterProduct,setFilterProduct]=useState("All");
  const [filterType,setFilterType]=useState("All");
  const types=["All","Sale","Purchase Order","Adjustment"];
  const productNames=["All",...[...new Set(history.map(h=>h.productName))]];
  const filtered=history.filter(h=>(filterProduct==="All"||h.productName===filterProduct)&&(filterType==="All"||h.type===filterType)).sort((a,b)=>b.id-a.id);
  const typeColor={ Sale:C.green, "Purchase Order":C.accent, Adjustment:C.yellow };

  const [showAdj,setShowAdj]=useState(false);
  const [adj,setAdj]=useState({ productId:"", qty:"", note:"" });

  return(
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div><h1 style={{ margin:0, fontSize:26, fontWeight:900 }}>Stock History</h1><p style={{ margin:"4px 0 0", color:C.textMuted, fontSize:13 }}>{history.length} events</p></div>
        <Btn onClick={()=>setShowAdj(true)} variant="secondary"><Icon d={IC.edit} size={15}/>Manual Adjustment</Btn>
      </div>
      <div style={{ display:"flex", gap:10 }}>
        <Sel value={filterProduct} onChange={setFilterProduct} options={productNames}/>
        <Sel value={filterType} onChange={setFilterType} options={types}/>
      </div>
      <Card style={{ padding:0 }}>
        <Table cols={["Date","Product","Type","Change","After","Reference","Note"]} rows={filtered.map((h,i)=>(
          <TR key={i}>
            <TD mono>{h.date}</TD>
            <TD><span style={{ fontWeight:600 }}>{h.productName}</span></TD>
            <TD><Badge color={typeColor[h.type]||C.textMuted}>{h.type}</Badge></TD>
            <TD mono><span style={{ color:h.delta>0?C.green:C.red, fontWeight:700 }}>{h.delta>0?"+":""}{h.delta}</span></TD>
            <TD mono>{h.balanceAfter}</TD>
            <TD mono><span style={{ color:C.textMuted, fontSize:11 }}>{h.ref}</span></TD>
            <TD><span style={{ color:C.textMuted, fontSize:12 }}>{h.note}</span></TD>
          </TR>
        ))}/>
      </Card>
      {showAdj&&<Modal title="Manual Stock Adjustment" onClose={()=>setShowAdj(false)}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Sel label="Product" value={adj.productId} onChange={v=>setAdj(p=>({...p,productId:v}))} options={["",  ...products.map(p=>p.name)]}/>
          <Input label="Quantity Change (negative to remove)" value={adj.qty} onChange={v=>setAdj(p=>({...p,qty:v}))} type="number" placeholder="-5 or +10"/>
          <Input label="Reason" value={adj.note} onChange={v=>setAdj(p=>({...p,note:v}))} placeholder="Damaged, count correction…"/>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:22 }}>
          <Btn onClick={()=>setShowAdj(false)} variant="secondary">Cancel</Btn>
          <Btn onClick={()=>setShowAdj(false)}><Icon d={IC.check} size={15}/>Apply</Btn>
        </div>
      </Modal>}
    </div>
  );
}

// ── AI ASSISTANT ───────────────────────────────────────────────
function AIAssistant({ products, sales, orders }) {
  const [msgs,setMsgs]=useState([
    { role:"assistant", text:"👋 Hi! I'm your AI inventory analyst. Ask me anything — reorder suggestions, sales forecasts, margin analysis, or supplier insights. What would you like to know?" }
  ]);
  const [input,setInput]=useState(""); const [loading,setLoading]=useState(false);
  const bottomRef=useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:"smooth" }); },[msgs]);

  const quickPrompts=[
    "Which products should I reorder now?",
    "Forecast next week's sales",
    "Which products have the best margins?",
    "Summarize my inventory health",
  ];

  const buildContext=()=>{
    const lowStock=products.filter(p=>p.qty<=p.lowStock);
    const productSales={};
    sales.forEach(s=>s.items.forEach(i=>{ productSales[i.productId]=(productSales[i.productId]||0)+i.qty; }));
    return `You are an expert inventory & retail analyst AI assistant for a small business called StockHQ.
Here is the current business data:

PRODUCTS (${products.length} total):
${products.map(p=>`- ${p.name} (SKU:${p.sku}, Cat:${p.category}): qty=${p.qty}, lowStockAlert=${p.lowStock}, cost=$${p.cost}, price=$${p.price}, margin=${(((p.price-p.cost)/p.price)*100).toFixed(1)}%, supplier=${p.supplier}`).join("\n")}

LOW STOCK ITEMS: ${lowStock.length===0?"None":lowStock.map(p=>p.name).join(", ")}

RECENT SALES (${sales.length} transactions):
${sales.map(s=>`- ${s.date}: ${s.items.map(i=>`${i.name} x${i.qty}`).join(", ")} | Total: $${s.total.toFixed(2)} | ${s.payment}`).join("\n")}

OPEN PURCHASE ORDERS: ${orders.filter(o=>o.status!=="Received").map(o=>`${o.supplier} – ${o.items.map(i=>i.name).join(", ")} (${o.status})`).join("; ")||"None"}

Answer the user's question with specific, actionable insights. Be concise, data-driven, and practical. Use bullet points where helpful. Reference actual product names and numbers from the data above.`;
  };

  const send=async(text=input)=>{
    if(!text.trim()||loading)return;
    const userMsg={ role:"user", text };
    setMsgs(prev=>[...prev,userMsg]); setInput(""); setLoading(true);
    
    // Mock AI response - simulates 2 second delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const lowStock = products.filter(p => p.qty <= p.lowStock);
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const topProduct = products.reduce((a, b) => a.price * a.qty > b.price * b.qty ? a : b, products[0]);
    
    // Generate contextual mock responses based on keywords in the question
    let reply = "";
    const q = text.toLowerCase();
    
    if (q.includes("reorder") || q.includes("low stock") || q.includes("order")) {
      reply = `Based on your current inventory data, here are my reorder recommendations:\n\n${lowStock.length > 0 
        ? `**Urgent Reorders Needed:**\n${lowStock.map(p => `- **${p.name}** (SKU: ${p.sku}): Only ${p.qty} left, below your ${p.lowStock} unit threshold. Suggest ordering 20-30 units from ${p.supplier}.`).join("\n")}`
        : "Great news! All products are currently above their low stock thresholds."}\n\n**Tip:** Consider setting up automatic reorder points for your fastest-moving items to avoid stockouts.`;
    } else if (q.includes("forecast") || q.includes("sales") || q.includes("predict")) {
      reply = `**Sales Forecast Analysis:**\n\nBased on your ${sales.length} recent transactions totaling $${totalRevenue.toFixed(2)}:\n\n- **Average transaction value:** $${(totalRevenue / Math.max(sales.length, 1)).toFixed(2)}\n- **Top performer:** ${topProduct?.name || "N/A"} shows strong demand\n- **Projected weekly revenue:** $${(totalRevenue * 1.15).toFixed(2)} (estimated 15% growth)\n\n**Recommendation:** Stock up on your top 3 sellers before the weekend rush.`;
    } else if (q.includes("margin") || q.includes("profit") || q.includes("best")) {
      const sorted = [...products].sort((a, b) => ((b.price - b.cost) / b.price) - ((a.price - a.cost) / a.price));
      reply = `**Margin Analysis:**\n\nYour top products by profit margin:\n\n${sorted.slice(0, 5).map((p, i) => `${i + 1}. **${p.name}** - ${(((p.price - p.cost) / p.price) * 100).toFixed(1)}% margin ($${(p.price - p.cost).toFixed(2)} profit per unit)`).join("\n")}\n\n**Insight:** Focus marketing efforts on high-margin items. Consider bundling lower-margin products with these winners.`;
    } else if (q.includes("health") || q.includes("summary") || q.includes("overview")) {
      reply = `**Inventory Health Summary:**\n\n- **Total SKUs:** ${products.length} products across ${[...new Set(products.map(p => p.category))].length} categories\n- **Stock alerts:** ${lowStock.length} items need attention\n- **Total inventory value:** $${products.reduce((sum, p) => sum + p.cost * p.qty, 0).toFixed(2)}\n- **Potential revenue:** $${products.reduce((sum, p) => sum + p.price * p.qty, 0).toFixed(2)}\n- **Recent sales:** ${sales.length} transactions, $${totalRevenue.toFixed(2)} total\n\n**Overall Status:** ${lowStock.length === 0 ? "Healthy - all stock levels optimal" : `Attention needed - ${lowStock.length} items below threshold`}`;
    } else {
      reply = `Thanks for your question about "${text}"\n\n**Quick Inventory Snapshot:**\n- ${products.length} products in stock\n- ${lowStock.length} items need reordering\n- $${totalRevenue.toFixed(2)} in recent sales\n\nI can help you with:\n- Reorder recommendations\n- Sales forecasting\n- Margin analysis\n- Inventory health checks\n\nTry asking something like "Which products should I reorder?" or "What are my best margins?"`;
    }
    
    setMsgs(prev=>[...prev,{ role:"assistant", text:reply }]);
    setLoading(false);
  };

  return(
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 160px)", minHeight:500, gap:0 }}>
      <div style={{ marginBottom:18 }}>
        <h1 style={{ margin:0, fontSize:26, fontWeight:900, display:"flex", alignItems:"center", gap:10 }}><Icon d={IC.ai} size={24} color={C.purple}/>AI Inventory Analyst</h1>
        <p style={{ margin:"4px 0 0", color:C.textMuted, fontSize:13 }}>Powered by Claude — analyses your live inventory, sales & suppliers</p>
      </div>

      {/* Quick prompts */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
        {quickPrompts.map(q=>(
          <button key={q} onClick={()=>send(q)} disabled={loading} style={{ background:C.accentDim, border:`1px solid ${C.accent}44`, borderRadius:20, padding:"6px 14px", color:C.accent, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{q}</button>
        ))}
      </div>

      {/* Chat */}
      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:14, padding:"4px 0" }}>
        {msgs.map((m,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
            <div style={{ maxWidth:"80%", background:m.role==="user"?C.accent:C.surface, border:m.role==="user"?"none":`1px solid ${C.border}`, borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px", padding:"12px 16px", color:m.role==="user"?"#fff":C.text, fontSize:14, lineHeight:1.6, whiteSpace:"pre-wrap" }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{ display:"flex", justifyContent:"flex-start" }}>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:"18px 18px 18px 4px", padding:"12px 16px" }}>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                {[0,1,2].map(i=><div key={i} style={{ width:7,height:7,borderRadius:"50%",background:C.accent,animation:`pulse 1.2s ${i*0.2}s ease-in-out infinite` }}/>)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div style={{ display:"flex", gap:10, marginTop:14, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); } }} placeholder="Ask anything about your inventory, sales, or suppliers…" style={{ flex:1, background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"11px 16px", color:C.text, fontSize:14, outline:"none", fontFamily:"inherit" }} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/>
        <Btn onClick={()=>send()} disabled={!input.trim()||loading}><Icon d={IC.send} size={15}/>Send</Btn>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
}

// ── SUPPLIERS ──────────────────────────────────────────────────
function Suppliers({ suppliers, setSuppliers }) {
  const [showModal,setShowModal]=useState(false); const [edit,setEdit]=useState(null);
  const [form,setForm]=useState({ name:"",contact:"",email:"",phone:"",address:"",notes:"" });
  const openAdd=()=>{ setEdit(null); setForm({ name:"",contact:"",email:"",phone:"",address:"",notes:"" }); setShowModal(true); };
  const openEdit=s=>{ setEdit(s); setForm({...s}); setShowModal(true); };
  const save=()=>{ if(!form.name)return; setSuppliers(prev=>edit?prev.map(s=>s.id===edit.id?{...form,id:edit.id}:s):[...prev,{...form,id:uid()}]); setShowModal(false); };
  const del=id=>setSuppliers(prev=>prev.filter(s=>s.id!==id));
  const f=k=>v=>setForm(prev=>({...prev,[k]:v}));
  return(
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div><h1 style={{ margin:0, fontSize:26, fontWeight:900 }}>Suppliers</h1><p style={{ margin:"4px 0 0", color:C.textMuted, fontSize:13 }}>{suppliers.length} registered</p></div>
        <Btn onClick={openAdd}><Icon d={IC.plus} size={15}/>Add Supplier</Btn>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:14 }}>
        {suppliers.map(s=>(
          <Card key={s.id}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div style={{ width:42,height:42,borderRadius:10,background:C.accentDim,display:"flex",alignItems:"center",justifyContent:"center" }}><Icon d={IC.people} size={20} color={C.accent}/></div>
              <div style={{ display:"flex",gap:5 }}><Btn onClick={()=>openEdit(s)} variant="ghost" small><Icon d={IC.edit} size={13}/></Btn><Btn onClick={()=>del(s.id)} variant="danger" small><Icon d={IC.trash} size={13}/></Btn></div>
            </div>
            <h3 style={{ margin:"0 0 3px",fontSize:15,fontWeight:800 }}>{s.name}</h3>
            <p style={{ margin:"0 0 10px",fontSize:12,color:C.textMuted }}>{s.contact}</p>
            <div style={{ display:"flex",flexDirection:"column",gap:5,fontSize:12 }}>
              <div style={{ display:"flex",gap:8 }}><span style={{ color:C.textMuted }}>📧</span>{s.email}</div>
              <div style={{ display:"flex",gap:8 }}><span style={{ color:C.textMuted }}>📞</span>{s.phone}</div>
              <div style={{ display:"flex",gap:8 }}><span style={{ color:C.textMuted }}>📍</span>{s.address}</div>
              {s.notes&&<div style={{ marginTop:6,fontSize:11,color:C.textMuted,background:C.surfaceAlt,borderRadius:6,padding:"7px 10px" }}>{s.notes}</div>}
            </div>
          </Card>
        ))}
      </div>
      {showModal&&<Modal title={edit?"Edit Supplier":"Add Supplier"} onClose={()=>setShowModal(false)}>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <Input label="Company" value={form.name} onChange={f("name")} placeholder="TechParts Ltd"/>
          <Input label="Contact" value={form.contact} onChange={f("contact")} placeholder="Alex Kim"/>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <Input label="Email" value={form.email} onChange={f("email")} placeholder="alex@example.com"/>
            <Input label="Phone" value={form.phone} onChange={f("phone")} placeholder="+1 555-0101"/>
          </div>
          <Input label="Address" value={form.address} onChange={f("address")} placeholder="123 Tech Ave"/>
          <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
            <label style={{ fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.05em" }}>Notes</label>
            <textarea value={form.notes} onChange={e=>f("notes")(e.target.value)} placeholder="Payment terms, delivery…" style={{ background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 13px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",resize:"vertical",minHeight:70 }}/>
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10,marginTop:20 }}>
          <Btn onClick={()=>setShowModal(false)} variant="secondary">Cancel</Btn>
          <Btn onClick={save}><Icon d={IC.check} size={15}/>{edit?"Update":"Add"}</Btn>
        </div>
      </Modal>}
    </div>
  );
}

// ── REPORTS ────────────────────────────────────────────────────
function Reports({ sales, products }) {
  const [range,setRange]=useState("All");
  const filtered=range==="Today"?sales.filter(s=>s.date==="2026-05-10"):sales;
  const totalRev=filtered.reduce((s,t)=>s+t.total,0);
  const totalProf=filtered.reduce((s,t)=>s+profit(t.items),0);
  const totalOrders=filtered.length; const avgOrder=totalOrders?totalRev/totalOrders:0;
  const byPay=["Cash","Card","Mobile"].map(m=>({ method:m, count:filtered.filter(s=>s.payment===m).length, total:filtered.filter(s=>s.payment===m).reduce((s,t)=>s+t.total,0) }));
  const pMap={};
  filtered.forEach(s=>s.items.forEach(i=>{ if(!pMap[i.name])pMap[i.name]={name:i.name,qty:0,rev:0,prof:0}; pMap[i.name].qty+=i.qty; pMap[i.name].rev+=i.price*i.qty; pMap[i.name].prof+=(i.price-i.cost)*i.qty; }));
  const pRows=Object.values(pMap).sort((a,b)=>b.rev-a.rev);
  const dayMap={};
  filtered.forEach(s=>{ if(!dayMap[s.date])dayMap[s.date]={rev:0,prof:0,orders:0}; dayMap[s.date].rev+=s.total; dayMap[s.date].prof+=profit(s.items); dayMap[s.date].orders+=1; });
  const days=Object.entries(dayMap).sort((a,b)=>a[0].localeCompare(b[0]));
  return(
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div><h1 style={{ margin:0, fontSize:26, fontWeight:900 }}>Sales Reports</h1><p style={{ margin:"4px 0 0", color:C.textMuted, fontSize:13 }}>Analytics & profit overview</p></div>
        <div style={{ display:"flex", gap:6 }}>{["Today","All"].map(r=><Btn key={r} onClick={()=>setRange(r)} variant={range===r?"primary":"secondary"} small>{r}</Btn>)}</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:14 }}>
        <StatCard label="Revenue" value={fmt(totalRev)} sub={`${totalOrders} orders`} icon={IC.trend} color={C.green}/>
        <StatCard label="Profit"  value={fmt(totalProf)} sub={`${totalRev?(totalProf/totalRev*100).toFixed(1):0}% margin`} icon={IC.chart} color={C.accent}/>
        <StatCard label="Avg Order" value={fmt(avgOrder)} sub="Per transaction" icon={IC.cart} color={C.purple}/>
        <StatCard label="COGS"    value={fmt(totalRev-totalProf)} sub="Cost of goods" icon={IC.pkg} color={C.orange}/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
        <Card>
          <h3 style={{ margin:"0 0 16px",fontSize:12,fontWeight:800,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.05em" }}>Payment Methods</h3>
          {byPay.map(p=>(
            <div key={p.method} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
              <Badge color={p.method==="Cash"?C.green:p.method==="Card"?C.accent:C.purple}>{p.method}</Badge>
              <div style={{ flex:1 }}><div style={{ height:5,background:C.border,borderRadius:2 }}><div style={{ height:5,borderRadius:2,width:`${totalOrders?(p.count/totalOrders)*100:0}%`,background:p.method==="Cash"?C.green:p.method==="Card"?C.accent:C.purple }}/></div></div>
              <span style={{ fontSize:12,fontFamily:"monospace",minWidth:66,textAlign:"right" }}>{fmt(p.total)}</span>
              <span style={{ fontSize:11,color:C.textMuted }}>{p.count}×</span>
            </div>
          ))}
        </Card>
        <Card>
          <h3 style={{ margin:"0 0 14px",fontSize:12,fontWeight:800,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.05em" }}>Daily Breakdown</h3>
          <Table cols={["Date","Orders","Revenue","Profit"]} rows={days.map(([date,d])=>(
            <TR key={date}><TD mono>{date}</TD><TD>{d.orders}</TD><TD mono><span style={{ color:C.green }}>{fmt(d.rev)}</span></TD><TD mono><span style={{ color:C.accent }}>{fmt(d.prof)}</span></TD></TR>
          ))}/>
        </Card>
      </div>
      <Card style={{ padding:0 }}>
        <div style={{ padding:"18px 22px 10px" }}><h3 style={{ margin:0,fontSize:12,fontWeight:800,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.05em" }}>Product Performance</h3></div>
        <Table cols={["Product","Sold","Revenue","Profit","Margin"]} rows={pRows.map(p=>{
          const m=p.rev?(p.prof/p.rev*100).toFixed(1):0;
          return(<TR key={p.name}><TD><span style={{ fontWeight:600 }}>{p.name}</span></TD><TD mono>{p.qty}</TD><TD mono><span style={{ color:C.green }}>{fmt(p.rev)}</span></TD><TD mono><span style={{ color:C.accent }}>{fmt(p.prof)}</span></TD><TD><div style={{ display:"flex",alignItems:"center",gap:6 }}><div style={{ width:56,height:3,background:C.border,borderRadius:2 }}><div style={{ height:3,borderRadius:2,width:`${m}%`,background:m>50?C.green:m>30?C.accent:C.red }}/></div><span style={{ fontSize:11,fontFamily:"monospace",color:C.textMuted }}>{m}%</span></div></TD></TR>);
        })}/>
      </Card>
    </div>
  );
}

// ── ROOT ───────────────────────────────────────────────────────
type PageId = "dashboard" | "products" | "pos" | "orders" | "history" | "suppliers" | "reports" | "ai";

export default function App() {
  const [page, setPage] = useState<PageId>("dashboard");
  const [products,setProducts]=useState(INIT_PRODUCTS);
  const [suppliers,setSuppliers]=useState(INIT_SUPPLIERS);
  const [sales,setSales]=useState(INIT_SALES);
  const [orders,setOrders]=useState(INIT_PURCHASE_ORDERS);
  const [history,setHistory]=useState(INIT_HISTORY);
  const addHistory=(h: Record<string, unknown>)=>setHistory(prev=>[...prev,{ id:uid(),...h }]);
  const lowCount=products.filter(p=>p.qty<=p.lowStock).length;

  const NAV: Array<{id: PageId; label: string; icon: string}> = [
    { id:"dashboard",  label:"Home",    icon:IC.dash   },
    { id:"products",   label:"Items",     icon:IC.tag    },
    { id:"pos",        label:"POS",          icon:IC.pos    },
    { id:"orders",     label:"Orders", icon:IC.po  },
    { id:"history",    label:"History",icon:IC.history},
    { id:"suppliers",  label:"Suppliers",    icon:IC.people },
    { id:"reports",    label:"Reports",      icon:IC.chart  },
    { id:"ai",         label:"AI",   icon:IC.ai     },
  ];

  return(
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Inter','Segoe UI',sans-serif", paddingBottom:80, width:"100%", maxWidth:"100%", overflowX:"hidden" }}>
      {/* Header */}
      <header style={{ 
        position:"sticky", 
        top:0, 
        zIndex:100, 
        background:C.surface, 
        borderBottom:`1px solid ${C.border}`,
        padding:"12px 16px",
        display:"flex",
        alignItems:"center",
        gap:12
      }}>
        <div style={{ width:32,height:32,borderRadius:8,background:C.accent,display:"flex",alignItems:"center",justifyContent:"center" }}>
          <Icon d={IC.pkg} size={16} color="#fff" sw={2.5}/>
        </div>
        <div>
          <div style={{ fontSize:14,fontWeight:900,lineHeight:1 }}>StockHQ</div>
          <div style={{ fontSize:9,color:C.textMuted,marginTop:1,letterSpacing:"0.05em" }}>PRO</div>
        </div>
        {lowCount > 0 && (
          <div style={{ marginLeft:"auto", background:C.red+"22", border:`1px solid ${C.red}44`, borderRadius:20, padding:"4px 10px", display:"flex", alignItems:"center", gap:6 }}>
            <Icon d={IC.alert} size={12} color={C.red}/>
            <span style={{ color:C.red, fontSize:11, fontWeight:700 }}>{lowCount} low</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main style={{ padding:"20px 16px 24px", width:"100%", maxWidth:"100%", boxSizing:"border-box" }}>
        {page === "dashboard" && <Dashboard products={products} sales={sales}/>}
        {page === "products" && <Products products={products} setProducts={setProducts}/>}
        {page === "pos" && <POS products={products} setProducts={setProducts} setSales={setSales} addHistory={addHistory}/>}
        {page === "orders" && <PurchaseOrders orders={orders} setOrders={setOrders} products={products} setProducts={setProducts} suppliers={suppliers} addHistory={addHistory}/>}
        {page === "history" && <StockHistory history={history} products={products}/>}
        {page === "suppliers" && <Suppliers suppliers={suppliers} setSuppliers={setSuppliers}/>}
        {page === "reports" && <Reports sales={sales} products={products}/>}
        {page === "ai" && <AIAssistant products={products} sales={sales} orders={orders}/>}
      </main>

      {/* Bottom Tab Navigation */}
      <nav style={{ 
        position:"fixed", 
        bottom:0, 
        left:0, 
        right:0, 
        zIndex:1000,
        background:C.surface, 
        borderTop:`1px solid ${C.border}`,
        display:"grid",
        gridTemplateColumns:"repeat(8, 1fr)",
        padding:"8px 4px",
        paddingBottom:"max(8px, env(safe-area-inset-bottom))"
      }}>
        {NAV.map(n => (
          <button 
            key={n.id}
            type="button"
            onClick={() => setPage(n.id)}
            style={{ 
              display:"flex", 
              flexDirection:"column", 
              alignItems:"center", 
              justifyContent:"center",
              gap:2,
              padding:"4px 2px",
              border:"none",
              background: page === n.id ? C.accentDim : "transparent",
              borderRadius:8,
              cursor:"pointer",
              WebkitTapHighlightColor:"transparent",
              touchAction:"manipulation",
              outline:"none",
              WebkitAppearance:"none",
              MozAppearance:"none"
            } as React.CSSProperties}
          >
            <Icon d={n.icon} size={20} color={page === n.id ? C.accent : C.textMuted}/>
            <span style={{ 
              fontSize:8, 
              fontWeight: page === n.id ? 700 : 500, 
              color: page === n.id ? C.accent : C.textMuted,
              fontFamily:"inherit",
              lineHeight:1
            }}>
              {n.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
