import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ykwwoibininqctzbxfok.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrd3dvaWJpbmlucWN0emJ4Zm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MTYzMDUsImV4cCI6MjA5MzI5MjMwNX0.hTV-qXbw0N2GPmvWUHDqm3iJIZYoiy-hAArHd6TCMBY";
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

const PRICES = [10.5,11.9,12.5,13.0,14.5,15.0,15.9,16.5,17.0,18.0];
const rp = () => PRICES[Math.floor(Math.random()*PRICES.length)];

const DEFAULT_DRINKS = [
  { id:1, name:"Aiinger Bier", emoji:"🍺", unit:"Kasten (20×0,5l)", price:rp(), deposit:6.60 },
  { id:2, name:"Bier 1", emoji:"🍺", unit:"Kasten (20×0,5l)", price:rp(), deposit:6.60 },
  { id:3, name:"Bier 2", emoji:"🍺", unit:"Kasten (20×0,5l)", price:rp(), deposit:6.60 },
  { id:4, name:"Cola", emoji:"🥤", unit:"Kasten (12×1,0l)", price:rp(), deposit:6.60 },
  { id:5, name:"Fanta", emoji:"🍊", unit:"Kasten (12×1,0l)", price:rp(), deposit:6.60 },
  { id:6, name:"Salvus naturell", emoji:"💧", unit:"Kasten (12×1,0l)", price:rp(), deposit:6.60 },
  { id:7, name:"Salvus medium", emoji:"💧", unit:"Kasten (12×1,0l)", price:rp(), deposit:6.60 },
  { id:8, name:"Salvus classik", emoji:"💧", unit:"Kasten (12×1,0l)", price:rp(), deposit:6.60 },
];
const DEFAULT_PERSONS = [
  { id:1, name:"Martin", email:"martin@example.de" },
  { id:2, name:"Familie Müller", email:"mueller@example.de" },
  { id:3, name:"Familie Schmidt", email:"schmidt@example.de" },
];
const SEND_PASSWORD = "bestellen";
const ADMIN_PIN_DEFAULT = "1234";
const SPECIAL_PW = "Bermestrasse";
const fmt = (n) => Number(n).toFixed(2).replace(".",",") + " €";

const LEERGUT_TYPES = [
  { id:"lg1", name:"6er Glas / PET", price:2.40 },
  { id:"lg2", name:"6er PET / 10er Cola, Apolli", price:3.00 },
  { id:"lg3", name:"20er Bier", price:3.10 },
  { id:"lg4", name:"12er Glas / PET", price:3.30 },
  { id:"lg5", name:"24er Bier", price:3.42 },
  { id:"lg6", name:"12er Schwarz / 20er Potts", price:4.50 },
  { id:"lg7", name:"24er Glas", price:5.10 },
  { id:"lg8", name:"20er PET", price:6.50 },
];

function formatDate(s) { if(!s) return "–"; const [y,m,d]=s.split("-"); return `${d}.${m}.${y}`; }
function deadlineDate(s) { if(!s) return null; const d=new Date(s); d.setDate(d.getDate()-3); return d; }
function formatDeadline(s) { const d=deadlineDate(s); if(!d) return "–"; return d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"}); }
function isDeadlinePassed(s) { const d=deadlineDate(s); return d ? new Date()>d : false; }

// ─── Admin Modal ──────────────────────────────────────────────────────────────
function AdminModal({ drinks, persons, dealerEmail, deliveryDate, sendPassword, adminPin, onSave, onClose }) {
  const [ld, setLd] = useState(drinks.map(d=>({...d})));
  const [lp, setLp] = useState(persons.map(p=>({...p})));
  const [lDealer, setLDealer] = useState(dealerEmail);
  const [lDel, setLDel] = useState(deliveryDate||"");
  const [lPw, setLPw] = useState(sendPassword||SEND_PASSWORD);
  const [lPin, setLPin] = useState(adminPin||ADMIN_PIN_DEFAULT);
  const [tab, setTab] = useState("drinks");
  const [nd, setNd] = useState({name:"",emoji:"🍺",unit:"Kasten",price:14.00,deposit:6.60});
  const [np, setNp] = useState({name:"",email:""});

  const addDrink = () => {
    if(!nd.name.trim()) return;
    const id = Math.max(0,...ld.map(d=>d.id))+1;
    setLd(prev=>[...prev,{...nd,id,price:parseFloat(nd.price),deposit:parseFloat(nd.deposit)}]);
    setNd({name:"",emoji:"🍺",unit:"Kasten",price:14.00,deposit:6.60});
  };
  const updateDrink = (id,field,val) => setLd(prev=>prev.map(d=>d.id===id?{...d,[field]:field==="price"||field==="deposit"?parseFloat(val)||0:val}:d));
  const addPerson = () => {
    if(!np.name.trim()||!np.email.trim()) return;
    const id = Math.max(0,...lp.map(p=>p.id))+1;
    setLp(prev=>[...prev,{...np,id}]);
    setNp({name:"",email:""});
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:620,boxShadow:"0 24px 80px rgba(0,0,0,0.2)",overflow:"hidden",maxHeight:"90vh",display:"flex",flexDirection:"column"}}>
        <div style={{background:"#1a3a2a",padding:"18px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"#c8e6c9",fontFamily:"Georgia,serif",fontSize:17,fontWeight:700}}>⚙️ Administration</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#c8e6c9",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"flex",borderBottom:"2px solid #e8f5e9",flexWrap:"wrap"}}>
          {[["drinks","🍺 Getränke"],["persons","👥 Personen"],["dealer","📧 Händler"],["delivery","📅 Lieferung"]].map(([key,label])=>(
            <button key={key} onClick={()=>setTab(key)} style={{flex:1,padding:"11px 6px",border:"none",background:"none",cursor:"pointer",fontSize:11,fontWeight:tab===key?700:400,color:tab===key?"#1a3a2a":"#777",borderBottom:tab===key?"3px solid #2d7a4f":"3px solid transparent",marginBottom:-2,whiteSpace:"nowrap"}}>{label}</button>
          ))}
        </div>
        <div style={{padding:20,overflowY:"auto",flex:1}}>
          {tab==="drinks" && (
            <div>
              {ld.map(d=>(
                <div key={d.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,padding:"8px 10px",background:"#f9fafb",borderRadius:10,flexWrap:"wrap"}}>
                  <input value={d.emoji} onChange={e=>updateDrink(d.id,"emoji",e.target.value)} style={{width:36,padding:4,border:"1px solid #d1fae5",borderRadius:6,textAlign:"center",fontSize:18}}/>
                  <input value={d.name} onChange={e=>updateDrink(d.id,"name",e.target.value)} style={{flex:1,minWidth:80,padding:"4px 8px",border:"1px solid #d1fae5",borderRadius:6,fontSize:13}}/>
                  <input value={d.unit} onChange={e=>updateDrink(d.id,"unit",e.target.value)} style={{width:90,padding:"4px 6px",border:"1px solid #d1fae5",borderRadius:6,fontSize:11}}/>
                  <label style={{fontSize:11,color:"#666"}}>Preis</label>
                  <input type="number" step="0.1" value={d.price} onChange={e=>updateDrink(d.id,"price",e.target.value)} style={{width:56,padding:"3px 6px",border:"1px solid #d1fae5",borderRadius:6,fontSize:13,textAlign:"right"}}/>
                  <span style={{fontSize:11,color:"#666"}}>€ Pfand</span>
                  <input type="number" step="0.1" value={d.deposit} onChange={e=>updateDrink(d.id,"deposit",e.target.value)} style={{width:46,padding:"3px 6px",border:"1px solid #d1fae5",borderRadius:6,fontSize:13,textAlign:"right"}}/>
                  <span style={{fontSize:11,color:"#666"}}>€</span>
                  <button onClick={()=>setLd(prev=>prev.filter(x=>x.id!==d.id))} style={{background:"#fee2e2",border:"none",borderRadius:6,padding:"3px 8px",cursor:"pointer",color:"#dc2626",fontSize:12}}>✕</button>
                </div>
              ))}
              <div style={{display:"flex",gap:6,marginTop:14,flexWrap:"wrap"}}>
                <input value={nd.emoji} onChange={e=>setNd(p=>({...p,emoji:e.target.value}))} style={{width:40,padding:6,border:"1px solid #d1fae5",borderRadius:8,textAlign:"center",fontSize:16}}/>
                <input placeholder="Name" value={nd.name} onChange={e=>setNd(p=>({...p,name:e.target.value}))} style={{flex:1,minWidth:90,padding:"6px 10px",border:"1px solid #d1fae5",borderRadius:8,fontSize:13}}/>
                <input placeholder="Einheit" value={nd.unit} onChange={e=>setNd(p=>({...p,unit:e.target.value}))} style={{width:80,padding:"6px 8px",border:"1px solid #d1fae5",borderRadius:8,fontSize:12}}/>
                <input type="number" placeholder="Preis" value={nd.price} onChange={e=>setNd(p=>({...p,price:e.target.value}))} style={{width:56,padding:"6px 4px",border:"1px solid #d1fae5",borderRadius:8,fontSize:12}}/>
                <input type="number" placeholder="Pfand" value={nd.deposit} onChange={e=>setNd(p=>({...p,deposit:e.target.value}))} style={{width:56,padding:"6px 4px",border:"1px solid #d1fae5",borderRadius:8,fontSize:12}}/>
                <button onClick={addDrink} style={{background:"#2d7a4f",color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontWeight:700}}>+</button>
              </div>
            </div>
          )}
          {tab==="persons" && (
            <div>
              {lp.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,padding:"8px 12px",background:"#f9fafb",borderRadius:8}}>
                  <span style={{fontSize:18}}>👤</span>
                  <input value={p.name} onChange={e=>setLp(prev=>prev.map(x=>x.id===p.id?{...x,name:e.target.value}:x))} style={{flex:1,padding:"4px 8px",border:"1px solid #d1fae5",borderRadius:6,fontSize:14,fontWeight:600}}/>
                  <input value={p.email} onChange={e=>setLp(prev=>prev.map(x=>x.id===p.id?{...x,email:e.target.value}:x))} style={{flex:1,minWidth:140,padding:"4px 8px",border:"1px solid #d1fae5",borderRadius:6,fontSize:12,color:"#666"}}/>
                  <button onClick={()=>setLp(prev=>prev.filter(x=>x.id!==p.id))} style={{background:"#fee2e2",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",color:"#dc2626",fontSize:12}}>✕</button>
                </div>
              ))}
              <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
                <input placeholder="Name" value={np.name} onChange={e=>setNp(p=>({...p,name:e.target.value}))} style={{flex:1,minWidth:120,padding:"8px 12px",border:"1px solid #d1fae5",borderRadius:8,fontSize:14}}/>
                <input placeholder="E-Mail" value={np.email} onChange={e=>setNp(p=>({...p,email:e.target.value}))} style={{flex:1,minWidth:160,padding:"8px 12px",border:"1px solid #d1fae5",borderRadius:8,fontSize:14}}/>
                <button onClick={addPerson} style={{background:"#2d7a4f",color:"#fff",border:"none",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontWeight:700}}>+</button>
              </div>
            </div>
          )}
          {tab==="dealer" && (
            <div>
              <label style={{display:"block",marginBottom:8,fontSize:14,color:"#444"}}>Händler E-Mail:</label>
              <input value={lDealer} onChange={e=>setLDealer(e.target.value)} style={{width:"100%",padding:"10px 14px",border:"1px solid #d1fae5",borderRadius:10,fontSize:15,boxSizing:"border-box"}}/>
            </div>
          )}
          {tab==="delivery" && (
            <div>
              <label style={{display:"block",marginBottom:8,fontSize:14,color:"#444"}}>📅 Liefertermin:</label>
              <input type="date" value={lDel} onChange={e=>setLDel(e.target.value)} style={{width:"100%",padding:"10px 14px",border:"1px solid #d1fae5",borderRadius:10,fontSize:15,boxSizing:"border-box",marginBottom:16}}/>
              {lDel && <div style={{background:"#f0fdf4",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#1a3a2a",marginBottom:16}}>📦 {formatDate(lDel)} · ⏰ Bestellschluss: {formatDeadline(lDel)}</div>}
              <label style={{display:"block",marginBottom:8,fontSize:14,color:"#444"}}>🔐 Absende-Passwort:</label>
              <input type="text" value={lPw} onChange={e=>setLPw(e.target.value)} style={{width:"100%",padding:"10px 14px",border:"1px solid #d1fae5",borderRadius:10,fontSize:15,boxSizing:"border-box",marginBottom:16}}/>
              <label style={{display:"block",marginBottom:8,fontSize:14,color:"#444"}}>🔑 Admin-PIN:</label>
              <input type="text" value={lPin} onChange={e=>setLPin(e.target.value)} style={{width:"100%",padding:"10px 14px",border:"1px solid #d1fae5",borderRadius:10,fontSize:15,boxSizing:"border-box"}}/>
            </div>
          )}
        </div>
        <div style={{padding:"14px 22px",borderTop:"2px solid #e8f5e9",display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"10px 18px",border:"1px solid #ccc",borderRadius:8,background:"none",cursor:"pointer",fontSize:14}}>Abbrechen</button>
          <button onClick={()=>{onSave({drinks:ld,persons:lp,dealerEmail:lDealer,deliveryDate:lDel,sendPassword:lPw,adminPin:lPin});onClose();}} style={{padding:"10px 22px",background:"#1a3a2a",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:14}}>💾 Speichern</button>
        </div>
      </div>
    </div>
  );
}

// ─── Abrechnungs-Modal ────────────────────────────────────────────────────────
function BillingModal({ drinks, persons, orders, returns, leergut, deliveryDate, onClose }) {

  const buildBillingText = () => {
    const ds = new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"});
    let lines = [`Abrechnung Getraenke`, `Datum: ${ds}`, ``];
    if(deliveryDate) lines.push(`Lieferung am: ${formatDate(deliveryDate)}`, ``);

    const activePersons = persons.filter(p=>drinks.some(d=>(orders[d.id]?.[p.id]||0)>0));
    const deliveryCost = activePersons.length > 0 ? 10 / activePersons.length : 0;

    persons.forEach(p => {
      const ordered = drinks.filter(d=>(orders[d.id]?.[p.id]||0)>0);
      const returned = drinks.filter(d=>(returns[d.id]?.[p.id]||0)>0);
      const lg = LEERGUT_TYPES.filter(l=>(leergut[p.id]?.[l.id]||0)>0);
      const isActive = ordered.length > 0;
      if(!isActive && !lg.length) return;
      let cost=0, ret=0, lgCost=0;
      const myDelivery = isActive ? deliveryCost : 0;

      lines.push(`----------------------------`);
      lines.push(`${p.name}`);
      lines.push(``);

      ordered.forEach(d=>{
        const q=parseInt(orders[d.id]?.[p.id])||0;
        const preis=q*(parseFloat(d.price)||0);
        const pfand=q*(parseFloat(d.deposit)||0);
        cost+=preis+pfand;
        lines.push(`${d.name}: ${q} Kasten`);
        lines.push(`  Getraenkepreis: ${q} x ${fmt(parseFloat(d.price))} = ${fmt(preis)}`);
        lines.push(`  Pfand:          ${q} x ${fmt(parseFloat(d.deposit))} = ${fmt(pfand)}`);
        lines.push(``);
      });

      if(returned.length>0){
        lines.push(`Pfandrueckgabe:`);
        returned.forEach(d=>{
          const q=parseInt(returns[d.id]?.[p.id])||0;
          const r=q*(parseFloat(d.deposit)||0);
          ret+=r;
          lines.push(`  ${d.name}: ${q} x ${fmt(parseFloat(d.deposit))} = -${fmt(r)}`);
        });
        lines.push(``);
      }

      if(lg.length>0){
        lines.push(`Leergut:`);
        lg.forEach(l=>{
          const q=parseInt(leergut[p.id]?.[l.id])||0;
          const r=q*l.price;
          lgCost+=r;
          lines.push(`  ${l.name}: ${q} x ${fmt(l.price)} = +${fmt(r)}`);
        });
        lines.push(``);
      }

      if(isActive) lines.push(`Lieferkosten (10,00 € / ${activePersons.length} Besteller): ${fmt(myDelivery)}`);
      lines.push(`ZU ZAHLEN: ${fmt(cost+lgCost-ret+myDelivery)}`);
      lines.push(``);
    });

    // Gesamtübersicht
    const gesamtGetraenke = persons.reduce((s,p)=>s+drinks.reduce((ss,d)=>{ const q=parseInt(orders[d.id]?.[p.id])||0; return ss+q*((parseFloat(d.price)||0)+(parseFloat(d.deposit)||0)); },0),0);
    const gesamtLeergut = persons.reduce((s,p)=>s+LEERGUT_TYPES.reduce((ss,l)=>ss+(parseInt(leergut[p.id]?.[l.id])||0)*l.price,0),0);
    const gesamtRueckgabe = persons.reduce((s,p)=>s+drinks.reduce((ss,d)=>{ const q=parseInt(returns[d.id]?.[p.id])||0; return ss+q*(parseFloat(d.deposit)||0); },0),0);
    const gesamtLieferkosten = activePersons.length > 0 ? 10 : 0;
    lines.push(`============================`);
    lines.push(`GESAMTUEBERSICHT`);
    lines.push(``);
    lines.push(`Getraenke gesamt:          ${fmt(gesamtGetraenke)}`);
    if(gesamtLeergut>0)   lines.push(`Leergut gesamt:           +${fmt(gesamtLeergut)}`);
    if(gesamtRueckgabe>0) lines.push(`Pfandrueckgabe gesamt:    -${fmt(gesamtRueckgabe)}`);
    lines.push(`Lieferkosten gesamt:        ${fmt(gesamtLieferkosten)}`);
    lines.push(``);
    lines.push(`GESAMT ZU ZAHLEN: ${fmt(gesamtGetraenke+gesamtLeergut-gesamtRueckgabe+gesamtLieferkosten)}`);
    return lines.join("\n");
  };

  const handlePrint = () => {
    const text = buildBillingText();
    const w = window.open("", "_blank", "width=600,height=800");
    if(w) {
      w.document.write(`<!DOCTYPE html><html><head><title>Abrechnung</title><style>body{font-family:monospace;font-size:14px;padding:24px;white-space:pre-wrap;line-height:1.6;}</style></head><body>${text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</body></html>`);
      w.document.close();
      w.focus();
      setTimeout(()=>w.print(), 500);
    }
  };

  const handleWhatsApp = () => {
    const text = buildBillingText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.location.href = url;
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:560,boxShadow:"0 24px 80px rgba(0,0,0,0.3)",overflow:"hidden",maxHeight:"90vh",display:"flex",flexDirection:"column"}}>
        <div style={{background:"#1a3a2a",padding:"18px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"#c8e6c9",fontFamily:"Georgia,serif",fontSize:17,fontWeight:700}}>💶 Abrechnung</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#c8e6c9",fontSize:22,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:20,overflowY:"auto",flex:1}}>
          {(()=>{
            const activePersons = persons.filter(p=>drinks.some(d=>(orders[d.id]?.[p.id]||0)>0));
            const deliveryCost = activePersons.length > 0 ? 10 / activePersons.length : 0;
            return persons.map(p=>{
            const ordered = drinks.filter(d=>(orders[d.id]?.[p.id]||0)>0);
            const returned = drinks.filter(d=>(returns[d.id]?.[p.id]||0)>0);
            const isActive = ordered.length > 0;
            if(!isActive && !LEERGUT_TYPES.some(l=>(leergut[p.id]?.[l.id]||0)>0)) return null;
            let cost=0, ret=0;
            ordered.forEach(d=>{ const q=parseInt(orders[d.id]?.[p.id])||0; cost+=q*((parseFloat(d.price)||0)+(parseFloat(d.deposit)||0)); });
            returned.forEach(d=>{ const q=parseInt(returns[d.id]?.[p.id])||0; ret+=q*(parseFloat(d.deposit)||0); });
            const lg = LEERGUT_TYPES.filter(l=>(leergut[p.id]?.[l.id]||0)>0);
            let lgCost=0; lg.forEach(l=>{ lgCost+=(parseInt(leergut[p.id]?.[l.id])||0)*l.price; });
            const myDelivery = isActive ? deliveryCost : 0;
            return (
              <div key={p.id} style={{marginBottom:20,background:"#f0fdf4",borderRadius:14,overflow:"hidden"}}>
                <div style={{background:"#1a3a2a",padding:"10px 16px"}}><span style={{color:"#fff",fontWeight:700,fontSize:14}}>👤 {p.name}</span></div>
                <div style={{padding:14}}>
                  {ordered.map(d=>{
                    const q=parseInt(orders[d.id]?.[p.id])||0;
                    const preis=q*(parseFloat(d.price)||0);
                    const pfand=q*(parseFloat(d.deposit)||0);
                    return (
                      <div key={d.id} style={{fontSize:13,marginBottom:8,color:"#1a3a2a"}}>
                        <div style={{fontWeight:600,marginBottom:2}}>{d.emoji} {d.name}: {q}×</div>
                        <div style={{display:"flex",justifyContent:"space-between",paddingLeft:16,color:"#444",fontSize:12}}>
                          <span>Getränkepreis: {q} × {fmt(parseFloat(d.price))}</span>
                          <span>{fmt(preis)}</span>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",paddingLeft:16,color:"#444",fontSize:12}}>
                          <span>Pfand: {q} × {fmt(parseFloat(d.deposit))}</span>
                          <span>{fmt(pfand)}</span>
                        </div>
                      </div>
                    );
                  })}
                  {returned.length>0 && (
                    <div style={{marginTop:8,paddingTop:8,borderTop:"1px dashed #ccc"}}>
                      <div style={{fontSize:12,color:"#666",marginBottom:5}}>♻️ Pfandrückgabe:</div>
                      {returned.map(d=>{
                        const q=parseInt(returns[d.id]?.[p.id])||0;
                        const r=q*(parseFloat(d.deposit)||0);
                        return (
                          <div key={d.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4,color:"#16a34a"}}>
                            <span>{d.emoji} {d.name}: {q} × {fmt(parseFloat(d.deposit))}</span>
                            <span>−{fmt(r)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {lg.length>0 && (
                    <div style={{marginTop:8,paddingTop:8,borderTop:"1px dashed #ccc"}}>
                      <div style={{fontSize:12,color:"#666",marginBottom:5}}>📦 Leergut:</div>
                      {lg.map(l=>{
                        const q=parseInt(leergut[p.id]?.[l.id])||0;
                        const r=q*l.price;
                        return (
                          <div key={l.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4,color:"#2563eb"}}>
                            <span>{l.name}: {q} × {fmt(l.price)}</span>
                            <span>+{fmt(r)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {isActive && (
                    <div style={{marginTop:8,paddingTop:8,borderTop:"1px dashed #ccc"}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#666"}}>
                        <span>🚚 Lieferkosten (10,00 € ÷ {activePersons.length} Besteller)</span>
                        <span>{fmt(myDelivery)}</span>
                      </div>
                    </div>
                  )}
                  <div style={{borderTop:"2px solid #1a3a2a",marginTop:10,paddingTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:14,fontWeight:700,color:"#1a3a2a"}}>Zu zahlen</span>
                    <span style={{fontSize:22,fontWeight:700,color:"#1a3a2a"}}>{fmt(cost+lgCost-ret+myDelivery)}</span>
                  </div>
                </div>
              </div>
            );
          });})()}

          {/* Gesamtübersicht */}
          {(()=>{
            const activePersons = persons.filter(p=>drinks.some(d=>(orders[d.id]?.[p.id]||0)>0));
            const gesamtGetraenke = persons.reduce((s,p)=>s+drinks.reduce((ss,d)=>{ const q=parseInt(orders[d.id]?.[p.id])||0; return ss+q*((parseFloat(d.price)||0)+(parseFloat(d.deposit)||0)); },0),0);
            const gesamtLeergut = persons.reduce((s,p)=>s+LEERGUT_TYPES.reduce((ss,l)=>ss+(parseInt(leergut[p.id]?.[l.id])||0)*l.price,0),0);
            const gesamtRueckgabe = persons.reduce((s,p)=>s+drinks.reduce((ss,d)=>{ const q=parseInt(returns[d.id]?.[p.id])||0; return ss+q*(parseFloat(d.deposit)||0); },0),0);
            const gesamtLieferkosten = activePersons.length > 0 ? 10 : 0;
            const gesamtZahlen = gesamtGetraenke - gesamtLeergut - gesamtRueckgabe + gesamtLieferkosten;
            if(activePersons.length === 0) return null;
            return (
              <div style={{marginTop:8,background:"#1a3a2a",borderRadius:14,padding:16}}>
                <div style={{color:"#c8e6c9",fontSize:13,fontWeight:700,marginBottom:12}}>📊 Gesamtübersicht</div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#d1fae5",marginBottom:6}}>
                  <span>Getränke gesamt</span><span>{fmt(gesamtGetraenke)}</span>
                </div>
                {gesamtLeergut>0 && (
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#93c5fd",marginBottom:6}}>
                    <span>📦 Leergut gesamt</span><span>+{fmt(gesamtLeergut)}</span>
                  </div>
                )}
                {gesamtRueckgabe>0 && (
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#4ade80",marginBottom:6}}>
                    <span>♻️ Pfandrückgabe gesamt</span><span>−{fmt(gesamtRueckgabe)}</span>
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#fde68a",marginBottom:10}}>
                  <span>🚚 Lieferkosten gesamt</span><span>{fmt(gesamtLieferkosten)}</span>
                </div>
                <div style={{borderTop:"1px solid rgba(255,255,255,0.2)",paddingTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{color:"#fff",fontSize:14,fontWeight:700}}>GESAMT ZU ZAHLEN</span>
                  <span style={{color:"#4ade80",fontSize:20,fontWeight:700}}>{fmt(gesamtGetraenke+gesamtLeergut-gesamtRueckgabe+gesamtLieferkosten)}</span>
                </div>
              </div>
            );
          })()}
        </div>
        {/* Footer Buttons */}
        <div style={{padding:"14px 20px",borderTop:"2px solid #e8f5e9",display:"flex",gap:10}}>
          <button onClick={handlePrint} style={{flex:1,padding:"11px",background:"#f0fdf4",border:"2px solid #16a34a",borderRadius:10,fontSize:13,fontWeight:600,color:"#15803d",cursor:"pointer"}}>🖨️ Drucken</button>
          <button onClick={handleWhatsApp} style={{flex:1,padding:"11px",background:"#25d366",border:"none",borderRadius:10,fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer"}}>💬 WhatsApp</button>
          <button onClick={onClose} style={{flex:1,padding:"11px",background:"#1a3a2a",border:"none",borderRadius:10,fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer"}}>✕ Schließen</button>
        </div>
      </div>
    </div>
  );
}

// ─── Erfolgs-Modal ────────────────────────────────────────────────────────────
function SuccessModal({ summary, onKeep, onClear }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:480,boxShadow:"0 24px 80px rgba(0,0,0,0.25)",overflow:"hidden"}}>
        <div style={{background:"linear-gradient(135deg,#1a3a2a,#2d7a4f)",padding:"28px 24px",textAlign:"center"}}>
          <div style={{fontSize:52,marginBottom:8}}>🎉</div>
          <div style={{color:"#fff",fontSize:20,fontFamily:"Georgia,serif",fontWeight:700}}>Bestellung abgesendet!</div>
          <div style={{color:"#c8e6c9",fontSize:13,marginTop:4}}>E-Mail wurde geöffnet – bitte absenden nicht vergessen.</div>
        </div>
        <div style={{padding:22}}>
          <div style={{background:"#f0fdf4",borderRadius:10,padding:14,fontSize:12,fontFamily:"monospace",whiteSpace:"pre-wrap",color:"#1a3a2a",maxHeight:180,overflowY:"auto",marginBottom:16}}>{summary}</div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onKeep} style={{flex:1,padding:13,background:"#f0fdf4",border:"2px solid #16a34a",borderRadius:12,fontSize:14,fontWeight:600,color:"#15803d",cursor:"pointer"}}>
              📝 Bestellung behalten
            </button>
            <button onClick={onClear} style={{flex:1,padding:13,background:"#1a3a2a",color:"#fff",border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>
              🔄 Neue Bestellrunde
            </button>
          </div>
          <div style={{fontSize:11,color:"#888",textAlign:"center",marginTop:8}}>„Behalten" lässt alle Mengen stehen · „Neue Runde" löscht alles</div>
        </div>
      </div>
    </div>
  );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────
export default function App() {
  const [drinks, setDrinks] = useState(DEFAULT_DRINKS);
  const [persons, setPersons] = useState(DEFAULT_PERSONS);
  const [dealerEmail, setDealerEmail] = useState("haendler@getraenke.de");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [sendPassword, setSendPassword] = useState(SEND_PASSWORD);
  const [adminPin, setAdminPin] = useState(ADMIN_PIN_DEFAULT);
  const [orders, setOrders] = useState({});
  const [returns, setReturns] = useState({});
  const [leergut, setLeergut] = useState({}); // { personId: { lgId: qty } }
  const [specialWishes, setSpecialWishes] = useState({}); // { personId: text }
  const [showSpecialPw, setShowSpecialPw] = useState(false);
  const [specialPwInput, setSpecialPwInput] = useState("");
  const [specialPwError, setSpecialPwError] = useState(false);
  const [specialUnlocked, setSpecialUnlocked] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [activeTab, setActiveTab] = useState("order");
  const [showAdmin, setShowAdmin] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successSummary, setSuccessSummary] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showSendPw, setShowSendPw] = useState(false);
  const [sendPwInput, setSendPwInput] = useState("");
  const [sendPwError, setSendPwError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
    const channel = sb.channel("realtime-all")
      .on("postgres_changes",{event:"*",schema:"public",table:"orders"},(payload)=>{
        if(payload.eventType==="DELETE"){ setOrders(prev=>{const u={...prev};if(u[payload.old.drink_id])delete u[payload.old.drink_id][payload.old.person_id];return u;}); }
        else { const r=payload.new; setOrders(prev=>({...prev,[r.drink_id]:{...(prev[r.drink_id]||{}),[r.person_id]:r.quantity}})); }
      })
      .on("postgres_changes",{event:"*",schema:"public",table:"returns"},(payload)=>{
        if(payload.eventType==="DELETE"){ setReturns(prev=>{const u={...prev};if(u[payload.old.drink_id])delete u[payload.old.drink_id][payload.old.person_id];return u;}); }
        else { const r=payload.new; setReturns(prev=>({...prev,[r.drink_id]:{...(prev[r.drink_id]||{}),[r.person_id]:r.quantity}})); }
      })
      .subscribe();
    return ()=>{ sb.removeChannel(channel); };
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const {data:cfg} = await sb.from("config").select("*");
      if(cfg){ const c=Object.fromEntries(cfg.map(r=>[r.key,r.value])); if(c.delivery_date)setDeliveryDate(c.delivery_date); if(c.dealer_email)setDealerEmail(c.dealer_email); if(c.send_password)setSendPassword(c.send_password); if(c.admin_pin)setAdminPin(c.admin_pin); if(c.special_wishes)setSpecialWishes(JSON.parse(c.special_wishes)); if(c.leergut)setLeergut(JSON.parse(c.leergut)); }
      const {data:dd} = await sb.from("drinks").select("*").order("id");
      if(dd&&dd.length>0)setDrinks(dd); else await sb.from("drinks").upsert(DEFAULT_DRINKS);
      const {data:pd} = await sb.from("persons").select("*").order("id");
      if(pd&&pd.length>0)setPersons(pd); else await sb.from("persons").upsert(DEFAULT_PERSONS);
      const {data:od} = await sb.from("orders").select("*");
      if(od){ const o={}; od.forEach(r=>{if(!o[r.drink_id])o[r.drink_id]={};o[r.drink_id][r.person_id]=r.quantity;}); setOrders(o); }
      const {data:rd} = await sb.from("returns").select("*");
      if(rd){ const r={}; rd.forEach(row=>{if(!r[row.drink_id])r[row.drink_id]={};r[row.drink_id][row.person_id]=row.quantity;}); setReturns(r); }
    } catch(e){console.error(e);}
    setLoading(false);
  };

  const saveConfig = async (key,value) => { await sb.from("config").upsert({key,value}); };

  const handleSpecialWishChange = async (text) => {
    if(!selectedPerson) return;
    const updated = {...specialWishes, [selectedPerson]: text};
    setSpecialWishes(updated);
    await sb.from("config").upsert({key:"special_wishes", value:JSON.stringify(updated)});
  };

  const handleLeergutChange = async (lgId, qty) => {
    if(!selectedPerson) return;
    const parsed = Math.max(0, parseInt(qty)||0);
    const updated = {...leergut, [selectedPerson]: {...(leergut[selectedPerson]||{}), [lgId]: parsed}};
    setLeergut(updated);
    await sb.from("config").upsert({key:"leergut", value:JSON.stringify(updated)});
  };

  const getLeergutQty = (lgId) => !selectedPerson ? "" : (leergut[selectedPerson]?.[lgId] || "");
  const getTotalLeergutForType = (lgId) => Object.values(leergut).reduce((s,pObj)=>s+(parseInt(pObj?.[lgId])||0),0);

  const handleQtyChange = async (drinkId, qty) => {
    if(!selectedPerson) return;
    const parsed = Math.max(0,parseInt(qty)||0);
    setOrders(prev=>({...prev,[drinkId]:{...(prev[drinkId]||{}),[selectedPerson]:parsed}}));
    await sb.from("orders").upsert({drink_id:drinkId,person_id:selectedPerson,quantity:parsed},{onConflict:"drink_id,person_id"});
  };

  const handleReturnChange = async (drinkId, qty) => {
    if(!selectedPerson) return;
    const parsed = Math.max(0,parseInt(qty)||0);
    setReturns(prev=>({...prev,[drinkId]:{...(prev[drinkId]||{}),[selectedPerson]:parsed}}));
    await sb.from("returns").upsert({drink_id:drinkId,person_id:selectedPerson,quantity:parsed},{onConflict:"drink_id,person_id"});
  };

  const handleDrinkFieldChange = (id, field, val) => {
    setDrinks(prev=>prev.map(d=>d.id===id?{...d,[field]:field==="price"||field==="deposit"?parseFloat(val)||0:val}:d));
  };
  const saveDrinkField = async (id, field, val) => {
    await sb.from("drinks").update({[field]:field==="price"||field==="deposit"?parseFloat(val)||0:val}).eq("id",id);
  };
  const handlePersonNameChange = (id, val) => {
    setPersons(prev=>prev.map(p=>p.id===id?{...p,name:val}:p));
  };
  const savePersonName = async (id, val) => {
    await sb.from("persons").update({name:val}).eq("id",id);
  };


  const getQty = (drinkId) => !selectedPerson?"":((activeTab==="order"?orders:returns)[drinkId]?.[selectedPerson]||"");
  const getTotalOrdered = (drinkId) => Object.values(orders[drinkId]||{}).reduce((s,v)=>s+(parseInt(v)||0),0);
  const getTotalReturned = (drinkId) => Object.values(returns[drinkId]||{}).reduce((s,v)=>s+(parseInt(v)||0),0);
  const grandTotal = drinks.reduce((s,d)=>s+getTotalOrdered(d.id),0);

  const personCost = selectedPerson ? drinks.reduce((s,d)=>{ const q=parseInt(orders[d.id]?.[selectedPerson])||0; return s+q*((parseFloat(d.price)||0)+(parseFloat(d.deposit)||0)); },0) : 0;
  const personRet = selectedPerson ? drinks.reduce((s,d)=>{ const q=parseInt(returns[d.id]?.[selectedPerson])||0; return s+q*(parseFloat(d.deposit)||0); },0) : 0;

  const buildSummary = () => {
    const ds = new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"});
    let lines = [
      `GETRAENKE-SAMMELBESTELLUNG`,
      `Datum: ${ds}`,
    ];
    if(deliveryDate){
      lines.push(`Lieferung am: ${formatDate(deliveryDate)}`);
      lines.push(`Bestellschluss: ${formatDeadline(deliveryDate)}`);
    }
    lines.push(``);
    lines.push(`============================`);
    lines.push(`BESTELLUNGEN PRO NACHBAR`);
    lines.push(`============================`);

    persons.forEach(p=>{
      const po=drinks.filter(d=>(orders[d.id]?.[p.id]||0)>0);
      if(!po.length && !specialWishes[p.id]) return;
      lines.push(``);
      lines.push(`>> ${p.name} <<`);
      lines.push(`----------------------------`);
      po.forEach(d=>{
        const q=parseInt(orders[d.id]?.[p.id])||0;
        lines.push(`  ${d.name}: ${q} Kasten`);
      });
      if(specialWishes[p.id]) lines.push(`  Sonderwunsch: ${specialWishes[p.id]} (Preis auf Anfrage)`);
    });

    lines.push(``);
    lines.push(`============================`);
    lines.push(`GESAMTLISTE FUER HAENDLER`);
    lines.push(`============================`);
    lines.push(``);
    drinks.forEach(d=>{
      const t=getTotalOrdered(d.id);
      if(t>0) lines.push(`${d.name}: ${t} Kasten`);
    });
    const anySpecial = persons.filter(p=>specialWishes[p.id]);
    if(anySpecial.length>0){
      lines.push(``);
      lines.push(`Sonderwuensche:`);
      anySpecial.forEach(p=>lines.push(`  ${p.name}: ${specialWishes[p.id]}`));
    }
    lines.push(``);
    lines.push(`Gesamt: ${grandTotal} Kaesten`);
    return lines.join("\n");
  };

  const handleSubmit = () => { if(grandTotal===0)return; setSendPwInput("");setSendPwError(false);setShowSendPw(true); };
  const confirmSend = async () => {
    if(sendPwInput!==sendPassword){setSendPwError(true);setSendPwInput("");return;}
    setShowSendPw(false);
    const summary=buildSummary();
    const emails=[dealerEmail,...persons.map(p=>p.email)].join(",");
    window.open(`mailto:${emails}?subject=${encodeURIComponent(`Getränke-Sammelbestellung ${new Date().toLocaleDateString("de-DE")}`)}&body=${encodeURIComponent(summary)}`);
    setSuccessSummary(summary);setShowSuccess(true);
  };
  const handleSuccessKeep = () => { setShowSuccess(false); };
  const handleSuccessClose = async () => { await sb.from("orders").delete().neq("id",0); await sb.from("returns").delete().neq("id",0); setOrders({});setReturns({});setSpecialWishes({});setLeergut({});setShowSuccess(false);setSelectedPerson(null); await sb.from("config").upsert({key:"special_wishes",value:"{}"});await sb.from("config").upsert({key:"leergut",value:"{}"}); };
  const handleAdminSave = async ({drinks:d,persons:p,dealerEmail:de,deliveryDate:dd,sendPassword:sp,adminPin:ap}) => {
    setDrinks(d);setPersons(p);setDealerEmail(de);setDeliveryDate(dd||"");setSendPassword(sp||SEND_PASSWORD);
    await sb.from("drinks").delete().neq("id",0); await sb.from("drinks").insert(d);
    await sb.from("persons").delete().neq("id",0); await sb.from("persons").insert(p);
    await saveConfig("dealer_email",de); await saveConfig("delivery_date",dd||""); await saveConfig("send_password",sp||SEND_PASSWORD); await saveConfig("admin_pin",ap||ADMIN_PIN_DEFAULT);
    if(ap)setAdminPin(ap);
  };
  const tryAdmin = () => { if(adminCode===adminPin){setShowAdminLogin(false);setAdminCode("");setShowAdmin(true);}else setAdminCode(""); };

  if(loading) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0d2b1a,#1a3a2a)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{color:"#4ade80",fontSize:18,fontFamily:"Georgia,serif"}}>🍺 Laden...</div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0d2b1a 0%,#1a3a2a 40%,#0f3320 100%)",fontFamily:"Georgia,serif",padding:"0 0 60px"}}>
      {/* Header */}
      <div style={{background:"rgba(0,0,0,0.25)",borderBottom:"1px solid rgba(200,230,200,0.15)",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{color:"#c8e6c9",fontSize:10,letterSpacing:3,textTransform:"uppercase",marginBottom:2}}>Nachbarschaft</div>
          <div style={{color:"#fff",fontSize:20,fontWeight:700}}>🍺 Getränke-Sammelbestellung</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setShowBilling(true)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",color:"#c8e6c9",padding:"7px 11px",borderRadius:10,cursor:"pointer",fontSize:11}}>💶 Abrechnung</button>
          <button onClick={()=>setShowAdminLogin(true)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",color:"#c8e6c9",padding:"7px 11px",borderRadius:10,cursor:"pointer",fontSize:11}}>⚙️ Admin</button>
        </div>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"18px 14px"}}>
        {/* Lieferdatum Banner */}
        {deliveryDate && (
          <div style={{background:isDeadlinePassed(deliveryDate)?"rgba(220,38,38,0.15)":"rgba(234,179,8,0.12)",border:"1px solid",borderColor:isDeadlinePassed(deliveryDate)?"rgba(220,38,38,0.35)":"rgba(234,179,8,0.35)",borderRadius:14,padding:"13px 18px",marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
            <div>
              <div style={{color:"#fef9c3",fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:2}}>📦 Nächste Lieferung</div>
              <div style={{color:"#fff",fontSize:20,fontWeight:700}}>{formatDate(deliveryDate)}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{color:"#fef9c3",fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:2}}>⏰ Bestellungen bis</div>
              <div style={{color:isDeadlinePassed(deliveryDate)?"#fca5a5":"#fde68a",fontSize:18,fontWeight:700}}>{formatDeadline(deliveryDate)}</div>
            </div>
          </div>
        )}

        {/* Personenauswahl */}
        <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(200,230,200,0.15)",borderRadius:16,padding:16,marginBottom:18}}>
          <div style={{color:"#a5d6a7",fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>👤 Wer bestellt?</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {persons.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:0,borderRadius:50,border:"2px solid",borderColor:selectedPerson===p.id?"#4ade80":"rgba(255,255,255,0.2)",background:selectedPerson===p.id?"rgba(74,222,128,0.15)":"rgba(255,255,255,0.05)",overflow:"hidden"}}>
                <button onClick={()=>setSelectedPerson(p.id)} style={{padding:"9px 6px 9px 14px",background:"none",border:"none",color:selectedPerson===p.id?"#4ade80":"#d1fae5",fontSize:13,fontWeight:selectedPerson===p.id?700:400,cursor:"pointer"}}>
                  {selectedPerson===p.id?"✓ ":""}
                </button>
                <input
                  value={p.name}
                  onChange={e=>handlePersonNameChange(p.id,e.target.value)}
                  onBlur={()=>savePersonName(p.id,p.name)}
                  onClick={()=>setSelectedPerson(p.id)}
                  style={{background:"none",border:"none",color:selectedPerson===p.id?"#4ade80":"#d1fae5",fontSize:13,fontWeight:selectedPerson===p.id?700:400,outline:"none",cursor:"text",padding:"9px 14px 9px 0",width:Math.max(60,p.name.length*8)+"px"}}
                />
              </div>
            ))}
          </div>
          {!selectedPerson && <div style={{color:"#f59e0b",fontSize:12,marginTop:10}}>↑ Bitte zuerst eine Person auswählen</div>}
          {selectedPerson && personCost>0 && (
            <div style={{marginTop:12,display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{color:"#fde68a",fontSize:13}}>💰 {fmt(personCost)}</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          {[["order","🍺 Bestellung"],["leergut","📦 Leergut"]].map(([key,label])=>(
            <button key={key} onClick={()=>setActiveTab(key)} style={{flex:1,padding:"10px",borderRadius:10,border:"2px solid",borderColor:activeTab===key?"#4ade80":"rgba(255,255,255,0.15)",background:activeTab===key?"rgba(74,222,128,0.12)":"rgba(255,255,255,0.04)",color:activeTab===key?"#4ade80":"#d1fae5",fontFamily:"Georgia,serif",fontSize:13,fontWeight:activeTab===key?700:400,cursor:"pointer"}}>{label}</button>
          ))}
        </div>

        {/* Getränkeliste / Leergut */}
        {activeTab === "leergut" ? (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{color:"#a5d6a7",fontSize:11,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>📦 Leergut – nur für interne Abrechnung</div>
            {LEERGUT_TYPES.map(lg=>{
              const qty = getLeergutQty(lg.id);
              const total = getTotalLeergutForType(lg.id);
              return (
                <div key={lg.id} style={{background:total>0?"rgba(74,222,128,0.08)":"rgba(255,255,255,0.04)",border:"1px solid",borderColor:total>0?"rgba(74,222,128,0.3)":"rgba(255,255,255,0.1)",borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{color:"#f0fdf4",fontSize:14,fontWeight:600}}>{lg.name}</div>
                    <div style={{color:"#6ee7b7",fontSize:11,marginTop:1}}>{fmt(lg.price)} pro Kasten</div>
                  </div>
                  {total>0 && <div style={{background:"rgba(74,222,128,0.2)",color:"#4ade80",padding:"2px 7px",borderRadius:20,fontSize:10,fontWeight:700}}>∑ {total}</div>}
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <button onClick={()=>handleLeergutChange(lg.id,Math.max(0,(parseInt(qty)||0)-1))} disabled={!selectedPerson} style={{width:30,height:30,borderRadius:7,border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:18,cursor:selectedPerson?"pointer":"not-allowed",opacity:selectedPerson?1:0.4}}>−</button>
                    <input type="number" min="0" value={qty} onChange={e=>handleLeergutChange(lg.id,e.target.value)} disabled={!selectedPerson} placeholder="0" style={{width:42,textAlign:"center",padding:"6px 2px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:7,color:"#fff",fontSize:14,opacity:selectedPerson?1:0.4}}/>
                    <button onClick={()=>handleLeergutChange(lg.id,(parseInt(qty)||0)+1)} disabled={!selectedPerson} style={{width:30,height:30,borderRadius:7,border:"1px solid rgba(74,222,128,0.4)",background:"rgba(74,222,128,0.12)",color:"#4ade80",fontSize:18,cursor:selectedPerson?"pointer":"not-allowed",opacity:selectedPerson?1:0.4}}>+</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {drinks.map((drink)=>{
            const qty = getQty(drink.id);
            const totalO = getTotalOrdered(drink.id);
            const totalR = getTotalReturned(drink.id);
            const onChange = handleQtyChange;
            return (
              <div key={drink.id} style={{background:totalO>0?"rgba(74,222,128,0.08)":"rgba(255,255,255,0.04)",border:"1px solid",borderColor:totalO>0?"rgba(74,222,128,0.3)":"rgba(255,255,255,0.1)",borderRadius:14,padding:"13px 16px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <div style={{fontSize:24,flexShrink:0}}>{drink.emoji}</div>
                <div style={{flex:1,minWidth:120}}>
                  <input
                    value={drink.name}
                    onChange={e=>handleDrinkFieldChange(drink.id,"name",e.target.value)}
                    onBlur={()=>saveDrinkField(drink.id,"name",drink.name)}
                    style={{background:"none",border:"none",borderBottom:"1px dashed rgba(255,255,255,0.2)",color:"#f0fdf4",fontSize:14,fontWeight:600,width:"100%",outline:"none",cursor:"text",padding:"0 0 1px"}}
                  />
                  <div style={{display:"flex",gap:6,alignItems:"center",marginTop:3}}>
                    <input type="number" step="0.1" value={parseFloat(drink.price)||0}
                      onChange={e=>handleDrinkFieldChange(drink.id,"price",e.target.value)}
                      onBlur={()=>saveDrinkField(drink.id,"price",drink.price)}
                      style={{background:"none",border:"none",borderBottom:"1px dashed rgba(99,230,190,0.3)",color:"#6ee7b7",fontSize:11,width:46,outline:"none"}}/>
                    <span style={{color:"#6ee7b7",fontSize:11}}>€ + </span>
                    <input type="number" step="0.1" value={parseFloat(drink.deposit)||0}
                      onChange={e=>handleDrinkFieldChange(drink.id,"deposit",e.target.value)}
                      onBlur={()=>saveDrinkField(drink.id,"deposit",drink.deposit)}
                      style={{background:"none",border:"none",borderBottom:"1px dashed rgba(99,230,190,0.3)",color:"#6ee7b7",fontSize:11,width:40,outline:"none"}}/>
                    <span style={{color:"#6ee7b7",fontSize:11}}>€ Pfand</span>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end"}}>
                  {totalO>0 && <div style={{background:"rgba(74,222,128,0.2)",color:"#4ade80",padding:"2px 7px",borderRadius:20,fontSize:10,fontWeight:700}}>∑ {totalO}</div>}
                  {totalR>0 && <div style={{background:"rgba(234,179,8,0.2)",color:"#fde68a",padding:"2px 7px",borderRadius:20,fontSize:10,fontWeight:700}}>♻️ {totalR}</div>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <button onClick={()=>onChange(drink.id,Math.max(0,(parseInt(qty)||0)-1))} disabled={!selectedPerson} style={{width:30,height:30,borderRadius:7,border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:18,cursor:selectedPerson?"pointer":"not-allowed",opacity:selectedPerson?1:0.4}}>−</button>
                  <input type="number" min="0" value={qty} onChange={e=>onChange(drink.id,e.target.value)} disabled={!selectedPerson} placeholder="0" style={{width:42,textAlign:"center",padding:"6px 2px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:7,color:"#fff",fontSize:14,opacity:selectedPerson?1:0.4}}/>
                  <button onClick={()=>onChange(drink.id,(parseInt(qty)||0)+1)} disabled={!selectedPerson} style={{width:30,height:30,borderRadius:7,border:"1px solid rgba(74,222,128,0.4)",background:"rgba(74,222,128,0.12)",color:"#4ade80",fontSize:18,cursor:selectedPerson?"pointer":"not-allowed",opacity:selectedPerson?1:0.4}}>+</button>
                </div>
              </div>
            );
          })}
          </div>
        )}

        {/* Sonderwunsch */}
        <div style={{marginTop:12,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,200,100,0.2)",borderRadius:14,padding:"14px 16px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{color:"#fde68a",fontSize:13,fontWeight:600}}>✏️ Sonderwunsch</div>
            {!specialUnlocked && (
              <button onClick={()=>{setSpecialPwInput("");setSpecialPwError(false);setShowSpecialPw(true);}} style={{background:"rgba(234,179,8,0.15)",border:"1px solid rgba(234,179,8,0.3)",color:"#fde68a",padding:"4px 10px",borderRadius:8,fontSize:11,cursor:"pointer"}}>🔐 Entsperren</button>
            )}
            {specialUnlocked && <span style={{color:"#4ade80",fontSize:11}}>✓ Entsperrt</span>}
          </div>
          {specialUnlocked && selectedPerson ? (
            <textarea
              value={specialWishes[selectedPerson]||""}
              onChange={e=>handleSpecialWishChange(e.target.value)}
              placeholder="Sonderwunsch eingeben (z.B. Weissbier Kasten, Sekt...) – Preis wird auf Anfrage ermittelt"
              rows={3}
              style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,200,100,0.3)",borderRadius:8,color:"#f0fdf4",fontSize:13,padding:"8px 10px",resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif"}}
            />
          ) : (
            <div style={{color:"rgba(255,255,255,0.35)",fontSize:12}}>
              {!selectedPerson ? "Bitte zuerst Person auswählen" : "Bitte mit Passwort entsperren um Sonderwunsch einzutragen"}
            </div>
          )}
          {/* Alle Sonderwünsche anzeigen */}
          {Object.entries(specialWishes).filter(([,v])=>v).length>0 && (
            <div style={{marginTop:10,paddingTop:10,borderTop:"1px dashed rgba(255,200,100,0.2)"}}>
              <div style={{color:"#fde68a",fontSize:11,marginBottom:6}}>Aktuelle Sonderwünsche:</div>
              {persons.filter(p=>specialWishes[p.id]).map(p=>(
                <div key={p.id} style={{fontSize:12,color:"#fde68a",marginBottom:3}}>
                  👤 {p.name}: <span style={{color:"rgba(255,255,255,0.7)"}}>{specialWishes[p.id]}</span> <span style={{color:"#f87171",fontSize:11}}>(Preis auf Anfrage)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sonderwunsch Passwort Modal */}
        {showSpecialPw && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
            <div style={{background:"#fff",borderRadius:20,padding:28,width:"100%",maxWidth:300,textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:8}}>✏️</div>
              <div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,marginBottom:6,color:"#1a3a2a"}}>Sonderwunsch</div>
              <div style={{fontSize:12,color:"#666",marginBottom:16}}>Bitte Passwort eingeben</div>
              <input type="password" value={specialPwInput} onChange={e=>{setSpecialPwInput(e.target.value);setSpecialPwError(false);}} onKeyDown={e=>e.key==="Enter"&&(specialPwInput===SPECIAL_PW?(setSpecialUnlocked(true),setShowSpecialPw(false)):(setSpecialPwError(true),setSpecialPwInput("")))} placeholder="Passwort" autoFocus
                style={{width:"100%",padding:"10px 14px",border:specialPwError?"2px solid #dc2626":"2px solid #d1fae5",borderRadius:10,fontSize:16,textAlign:"center",boxSizing:"border-box",marginBottom:8}}/>
              {specialPwError && <div style={{color:"#dc2626",fontSize:12,marginBottom:8}}>⚠ Falsches Passwort</div>}
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button onClick={()=>setShowSpecialPw(false)} style={{flex:1,padding:9,border:"1px solid #ccc",borderRadius:10,background:"none",cursor:"pointer",fontSize:13}}>Abbrechen</button>
                <button onClick={()=>{if(specialPwInput===SPECIAL_PW){setSpecialUnlocked(true);setShowSpecialPw(false);}else{setSpecialPwError(true);setSpecialPwInput("");}}} style={{flex:1,padding:9,background:"#1a3a2a",color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13}}>OK</button>
              </div>
            </div>
          </div>
        )}

        {/* Sammelbestellung */}
        <div style={{marginTop:26,background:"rgba(0,0,0,0.3)",border:"1px solid rgba(200,230,200,0.2)",borderRadius:20,overflow:"hidden"}}>
          <div style={{padding:"16px 20px"}}>
            <div style={{marginBottom:12}}>
              <div style={{color:"#a5d6a7",fontSize:13,fontWeight:700,marginBottom:2}}>
                📋 Aktuelle Sammelbestellung{deliveryDate?` – Lieferung am ${formatDate(deliveryDate)}`:""}
              </div>
              {deliveryDate && <div style={{color:"#fde68a",fontSize:12}}>⏰ Bestellschluss am: <strong>{formatDeadline(deliveryDate)}</strong></div>}
            </div>
            {grandTotal===0 ? (
              <div style={{color:"#6ee7b7",fontSize:14,opacity:0.7}}>Noch keine Bestellungen eingegangen.</div>
            ) : (
              <>
                {persons.map(p=>{
                  const pd=drinks.filter(d=>(orders[d.id]?.[p.id]||0)>0);
                  if(!pd.length)return null;
                  const pTotal=pd.reduce((s,d)=>s+(parseInt(orders[d.id]?.[p.id])||0),0);
                  const pEinkauf=pd.reduce((s,d)=>s+(parseInt(orders[d.id]?.[p.id])||0)*(parseFloat(d.price)||0),0);
                  const pPfand=pd.reduce((s,d)=>s+(parseInt(orders[d.id]?.[p.id])||0)*(parseFloat(d.deposit)||0),0);
                  const pZahlen=pEinkauf+pPfand;
                  return (
                    <div key={p.id} style={{marginBottom:16,background:"rgba(255,255,255,0.04)",borderRadius:12,padding:"12px 14px"}}>
                      <div style={{color:"#f0fdf4",fontSize:14,fontWeight:700,marginBottom:6,display:"flex",alignItems:"center",gap:8}}>
                        <span>👤</span>
                        <input value={p.name} onChange={e=>handlePersonNameChange(p.id,e.target.value)} onBlur={()=>savePersonName(p.id,p.name)}
                          style={{background:"none",border:"none",borderBottom:"1px dashed rgba(255,255,255,0.3)",color:"#f0fdf4",fontSize:14,fontWeight:700,outline:"none",cursor:"text",padding:"0 0 1px",minWidth:80}}/>
                        <span style={{color:"#4ade80",fontWeight:400,fontSize:12}}>({pTotal} Kasten)</span>
                      </div>
                      {pd.map(d=>{
                        const q=parseInt(orders[d.id]?.[p.id])||0;
                        const preis=q*(parseFloat(d.price)||0);
                        const pfand=q*(parseFloat(d.deposit)||0);
                        return (
                          <div key={d.id} style={{fontSize:12,paddingLeft:16,marginBottom:3,color:"#6ee7b7",display:"flex",justifyContent:"space-between"}}>
                            <span>{d.emoji} {d.name} {q}×</span>
                            <span style={{color:"#a7f3d0"}}>
                              {fmt(preis)} <span style={{color:"#6ee7b7"}}>+ {fmt(pfand)} Pfand</span> = {fmt(preis+pfand)}
                            </span>
                          </div>
                        );
                      })}
                      <div style={{marginTop:8,paddingTop:6,borderTop:"1px solid rgba(255,255,255,0.15)",display:"flex",justifyContent:"space-between",fontSize:13}}>
                        <div style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>
                          Getränke {fmt(pEinkauf)} + Pfand {fmt(pPfand)}
                        </div>
                        <div style={{color:"#fde68a",fontWeight:700}}>{fmt(pZahlen)}</div>
                      </div>
                    </div>
                  );
                })}
                <div style={{borderTop:"1px solid rgba(255,255,255,0.15)",paddingTop:12,marginTop:4}}>
                  {(()=>{
                    const totalKasten=grandTotal;
                    const totalBrutto=drinks.reduce((s,d)=>s+getTotalOrdered(d.id)*((parseFloat(d.price)||0)+(parseFloat(d.deposit)||0)),0);
                    return (
                      <div>
                        <div style={{display:"flex",justifyContent:"space-between",color:"#fde68a",fontSize:15,fontWeight:700}}>
                          <span>Einkauf + Pfand</span><span>{fmt(totalBrutto)}</span>
                        </div>
                        <div style={{color:"rgba(255,255,255,0.4)",fontSize:12,marginTop:4}}>{totalKasten} Kästen gesamt</div>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
          <button onClick={handleSubmit} disabled={grandTotal===0} style={{width:"100%",padding:17,border:"none",background:grandTotal===0?"rgba(255,255,255,0.05)":"linear-gradient(135deg,#16a34a,#15803d)",color:grandTotal===0?"rgba(255,255,255,0.3)":"#fff",fontSize:16,fontWeight:700,fontFamily:"Georgia,serif",cursor:grandTotal===0?"not-allowed":"pointer"}}>
            {grandTotal===0?"Noch keine Bestellung":`📧 Bestellung absenden (${grandTotal} Kästen)`}
          </button>
        </div>
      </div>

      {/* Passwort Modal */}
      {showSendPw && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#fff",borderRadius:20,padding:30,width:"100%",maxWidth:310,textAlign:"center"}}>
            <div style={{fontSize:42,marginBottom:10}}>🔐</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:17,fontWeight:700,marginBottom:18,color:"#1a3a2a"}}>Bestellung absenden</div>
            <input type="password" value={sendPwInput} onChange={e=>{setSendPwInput(e.target.value);setSendPwError(false);}} onKeyDown={e=>e.key==="Enter"&&confirmSend()} placeholder="Passwort" autoFocus style={{width:"100%",padding:"11px 14px",border:sendPwError?"2px solid #dc2626":"2px solid #d1fae5",borderRadius:10,fontSize:18,textAlign:"center",boxSizing:"border-box",marginBottom:8}}/>
            {sendPwError && <div style={{color:"#dc2626",fontSize:13,marginBottom:8}}>⚠ Falsches Passwort</div>}
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <button onClick={()=>setShowSendPw(false)} style={{flex:1,padding:10,border:"1px solid #ccc",borderRadius:10,background:"none",cursor:"pointer"}}>Abbrechen</button>
              <button onClick={confirmSend} style={{flex:1,padding:10,background:"#15803d",color:"#fff",border:"none",borderRadius:10,cursor:"pointer",fontWeight:700}}>📧 Absenden</button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login */}
      {showAdminLogin && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:16,padding:30,width:270,textAlign:"center"}}>
            <div style={{fontSize:34,marginBottom:10}}>🔐</div>
            <div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,marginBottom:14,color:"#1a3a2a"}}>Admin-PIN</div>
            <input type="password" value={adminCode} onChange={e=>setAdminCode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryAdmin()} placeholder="PIN eingeben" style={{width:"100%",padding:"9px 12px",border:"2px solid #d1fae5",borderRadius:10,fontSize:18,textAlign:"center",boxSizing:"border-box",marginBottom:12}}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setShowAdminLogin(false);setAdminCode("");}} style={{flex:1,padding:9,border:"1px solid #ccc",borderRadius:8,background:"none",cursor:"pointer"}}>Abbrechen</button>
              <button onClick={tryAdmin} style={{flex:1,padding:9,background:"#1a3a2a",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontWeight:700}}>OK</button>
            </div>
          </div>
        </div>
      )}

      {showAdmin && <AdminModal drinks={drinks} persons={persons} dealerEmail={dealerEmail} deliveryDate={deliveryDate} sendPassword={sendPassword} adminPin={adminPin} onSave={handleAdminSave} onClose={()=>setShowAdmin(false)}/>}
      {showBilling && <BillingModal drinks={drinks} persons={persons} orders={orders} returns={returns} leergut={leergut} deliveryDate={deliveryDate} onClose={()=>setShowBilling(false)}/>}
      {showSuccess && <SuccessModal summary={successSummary} onKeep={handleSuccessKeep} onClear={handleSuccessClose}/>}
    </div>
  );
}
