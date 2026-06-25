"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, ClipboardCheck, Code2,
  Dumbbell, GraduationCap, LayoutDashboard, Menu, Moon, Plus, Settings, Sun, Target, X
} from "lucide-react";
import { PlannerProvider, usePlanner } from "@/lib/store";
import { workoutSuggestions } from "@/lib/workout-suggestions";
import type { Category, Status } from "@/lib/types";

const nav = [
  ["/dashboard","Dashboard",LayoutDashboard],["/calendar","Calendário",CalendarDays],
  ["/studies","Estudos",GraduationCap],["/books","Livros",BookOpen],
  ["/pocs","POCs",Code2],["/workouts","Treinos",Dumbbell],["/review","Revisão",ClipboardCheck]
] as const;
const pct = (a:number,b:number) => b ? Math.min(100,Math.round(a/b*100)) : 0;
const labels: Record<Category,string> = {work:"Trabalho",study:"Estudos",fitness:"Treinos",reading:"Leitura",poc:"POCs",personal:"Pessoal"};
const statusLabel: Record<Status,string> = {todo:"Não iniciado",in_progress:"Em andamento",done:"Concluído",skipped:"Ignorado"};

function Modal({ title, onClose, children, onSave }:{title:string;onClose:()=>void;children:React.ReactNode;onSave:()=>void}) {
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal"><div className="modal-head"><strong>{title}</strong><button className="btn icon-btn ghost" onClick={onClose}><X size={18}/></button></div>
    <div className="modal-body">{children}</div><div className="modal-foot"><button className="btn" onClick={onClose}>Cancelar</button><button className="btn primary" onClick={onSave}>Salvar</button></div></div>
  </div>;
}
function PageHeader({title,subtitle,onAdd,addLabel="Adicionar"}:{title:string;subtitle:string;onAdd?:()=>void;addLabel?:string}) {
  const {theme,setTheme}=useTheme();
  const {data,updatePreferences}=usePlanner(); const [settingsOpen,setSettingsOpen]=useState(false);
  return <div className="topbar"><div><h1>{title}</h1><div className="eyebrow">{subtitle}</div></div><div className="actions">
    <button className="btn week-control"><ChevronLeft size={15}/> 21–27 de junho <ChevronRight size={15}/></button>
    <button className="btn icon-btn" onClick={()=>setTheme(theme==="dark"?"light":"dark")}>{theme==="dark"?<Sun size={17}/>:<Moon size={17}/>}</button>
    <button className="btn icon-btn" aria-label="Preferências" onClick={()=>setSettingsOpen(true)}><Settings size={17}/></button>
    {onAdd&&<button className="btn primary" onClick={onAdd}><Plus size={16}/>{addLabel}</button>}
    {settingsOpen&&<Modal title="Preferências" onClose={()=>setSettingsOpen(false)} onSave={()=>setSettingsOpen(false)}><div className="form-grid">
      <Field label="Início da semana"><select className="input" value={data.preferences.weekStartsOn} onChange={e=>updatePreferences({weekStartsOn:Number(e.target.value) as 0|1})}><option value={0}>Domingo</option><option value={1}>Segunda-feira</option></select></Field>
      <Field label="Idioma"><select className="input" value={data.preferences.locale} onChange={e=>updatePreferences({locale:e.target.value as "pt-BR"|"en"})}><option value="pt-BR">Português (Brasil)</option><option value="en">English (preparado)</option></select></Field>
      <Field label="Fuso horário" full><input className="input" value={data.preferences.timezone} onChange={e=>updatePreferences({timezone:e.target.value})}/></Field>
    </div></Modal>}
  </div></div>;
}
function Shell({children}:{children:React.ReactNode}) {
  const path=usePathname(); const [mobile,setMobile]=useState(false);
  return <div className="shell"><aside className="sidebar"><div className="brand"><span className="brandmark">W</span>Weekly OS</div>
    <nav className="nav">{nav.map(([href,label,Icon])=><Link className={path===href?"active":""} key={href} href={href}><Icon size={18}/>{label}</Link>)}</nav>
    <div className="sidebar-foot"><span className="avatar">G</span><span>Gabriel</span><Settings size={16} style={{marginLeft:"auto"}}/></div></aside>
    {mobile&&<div className="modal-backdrop" onClick={()=>setMobile(false)}><aside className="sidebar" style={{display:"flex",position:"fixed",left:0,width:260}} onClick={e=>e.stopPropagation()}><div className="brand">Weekly OS<button className="btn icon-btn ghost" style={{marginLeft:"auto",color:"white"}} onClick={()=>setMobile(false)}><X/></button></div><nav className="nav">{nav.map(([href,label,Icon])=><Link key={href} href={href} onClick={()=>setMobile(false)}><Icon size={18}/>{label}</Link>)}</nav></aside></div>}
    <main className="main"><button className="btn icon-btn mobile-menu" onClick={()=>setMobile(true)}><Menu size={18}/></button>{children}</main></div>;
}

function Dashboard() {
  const {data,update}=usePlanner(); const week=data.weeks[0];
  const study=data.studies.filter(s=>s.weekId); const mins=study.reduce((n,s)=>n+s.completedMinutes,0); const planned=study.reduce((n,s)=>n+s.estimatedMinutes,0);
  const book=data.books.find(b=>b.status==="reading")!; const doneWorkouts=data.workouts.filter(w=>w.status==="completed").length;
  return <><PageHeader title="Minha semana" subtitle={`${week.startDate} — ${week.endDate} · Semana ativa`}/>
    <div className="card focus"><span className="focus-icon"><Target size={20}/></span><div><small>Foco da semana</small><strong>Finalizar módulo de arquitetura e manter consistência nos treinos</strong></div></div>
    <div className="dashboard-grid"><section className="card"><div className="card-head"><h2 className="card-title"><CalendarDays size={18}/>Agenda de hoje</h2><Link className="btn" href="/calendar">Ver calendário</Link></div><div className="rows">{data.timeboxes.map(t=><div className="row" key={t.id}><span className="time">{t.startTime}</span><div className="row-main"><div className="row-title">{t.title}</div><div className="meta"><span className="dot"/>{labels[t.category]}</div></div><button className="check" aria-label="Concluir"/></div>)}</div></section>
    <section className="card"><div className="card-head"><h2 className="card-title"><Target size={18}/>Objetivos da semana</h2></div><div className="rows">{data.goals.map(g=><div className="row goal-row" key={g.id}><button className={`check ${g.status==="done"?"done":""}`} onClick={()=>update("goals",g.id,{status:g.status==="done"?"todo":"done"})}>{g.status==="done"&&<Check size={14}/>}</button><div className="row-main"><div className="row-title">{g.title}</div><div className="meta">{labels[g.category]} · {g.priority}</div></div><span className={`badge ${g.status}`}>{statusLabel[g.status]}</span></div>)}</div></section></div>
    <div className="mini-grid">
      <Mini title="Estudos" icon={<GraduationCap size={17}/>} label="Módulo atual" value={study[0].title} progress={pct(mins,planned)} foot={`${planned-mins} min restantes`}/>
      <Mini title="Leitura" icon={<BookOpen size={17}/>} label="Livro atual" value={book.title} progress={pct(book.currentPage,book.totalPages)} foot={`${book.totalPages-book.currentPage} páginas restantes`}/>
      <Mini title="POCs ativas" icon={<Code2 size={17}/>} label="Em execução" value={data.pocs.filter(p=>p.status==="doing").map(p=>p.title).join(" · ")} progress={60} foot="Abrir repositório de POCs"/>
      <Mini title="Treinos" icon={<Dumbbell size={17}/>} label="Semana atual" value={`${doneWorkouts} / ${data.workouts.length} treinos`} progress={pct(doneWorkouts,data.workouts.length)} foot="Ver plano da semana"/>
    </div>
    <div className="card review-cta"><div><strong>Fazer revisão semanal</strong><p>Reserve um tempo para aprender com a semana e planejar a próxima.</p></div><Link href="/review" className="btn primary">Fazer revisão semanal <ChevronRight size={16}/></Link></div>
  </>;
}
function Mini({title,icon,label,value,progress,foot}:{title:string;icon:React.ReactNode;label:string;value:string;progress:number;foot:string}) {
  return <div className="card mini"><div className="card-head"><h3 className="card-title">{icon}{title}</h3></div><div className="card-body"><span className="mini-label">{label}</span><span className="mini-value">{value}</span><div className="progress"><i style={{width:`${progress}%`}}/></div><span className="meta">{progress}% concluído</span></div><div className="mini-foot">{foot}</div></div>;
}

function CalendarPage() {
  const {data,add}=usePlanner(); const [open,setOpen]=useState(false); const [title,setTitle]=useState(""); const [date,setDate]=useState(data.weeks[0].startDate); const [view,setView]=useState<"day"|"week"|"month">("week");
  const base=new Date(data.weeks[0].startDate+"T12:00:00"); if(data.preferences.weekStartsOn===1)base.setDate(base.getDate()+1);
  const days=Array.from({length:7},(_,i)=>{const d=new Date(base);d.setDate(d.getDate()+i);return d.toISOString().slice(0,10)});
  const monthDays=Array.from({length:35},(_,i)=>{const d=new Date(base.getFullYear(),base.getMonth(),1,12);d.setDate(d.getDate()-d.getDay()+i);return d.toISOString().slice(0,10)});
  return <><PageHeader title="Calendário" subtitle="Organize sua semana com blocos de tempo manuais" onAdd={()=>setOpen(true)} addLabel="Novo timebox"/>
  <div className="card calendar"><div className="card-head"><h2 className="card-title">Calendário</h2><div className="actions"><button className={`btn ${view==="day"?"primary":""}`} onClick={()=>setView("day")}>Dia</button><button className={`btn ${view==="week"?"primary":""}`} onClick={()=>setView("week")}>Semana</button><button className={`btn ${view==="month"?"primary":""}`} onClick={()=>setView("month")}>Mês</button></div></div>
  {view==="week"&&<div className="calendar-grid">{days.map(day=><div className="day" key={day}><div className="day-name">{new Intl.DateTimeFormat("pt-BR",{weekday:"short",day:"2-digit"}).format(new Date(day+"T12:00:00"))}</div>{data.timeboxes.filter(t=>t.date===day).map(t=><div className="event" key={t.id}><b>{t.startTime} · {t.title}</b>{labels[t.category]}</div>)}</div>)}</div>}
  {view==="day"&&<div className="rows">{data.timeboxes.filter(t=>t.date===new Date().toISOString().slice(0,10)).map(t=><div className="row" key={t.id}><span className="time">{t.startTime}</span><div className="row-main"><div className="row-title">{t.title}</div><div className="meta">{labels[t.category]}</div></div></div>)}</div>}
  {view==="month"&&<div className="calendar-grid" style={{gridTemplateColumns:"repeat(7,1fr)"}}>{monthDays.map(day=><div className="day" style={{minHeight:110}} key={day}><div className="day-name">{day.slice(-2)}</div>{data.timeboxes.filter(t=>t.date===day).slice(0,2).map(t=><div className="event" key={t.id}><b>{t.title}</b></div>)}</div>)}</div>}
  </div>
  {open&&<Modal title="Novo timebox" onClose={()=>setOpen(false)} onSave={()=>{if(title) add("timeboxes",{id:crypto.randomUUID(),weekId:data.weeks[0].id,title,date,startTime:"09:00",endTime:"10:00",category:"personal"});setOpen(false)}}><div className="form-grid"><Field label="Título"><input className="input" value={title} onChange={e=>setTitle(e.target.value)}/></Field><Field label="Data"><input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)}/></Field><Field label="Início"><input className="input" type="time" defaultValue="09:00"/></Field><Field label="Fim"><input className="input" type="time" defaultValue="10:00"/></Field></div></Modal>}</>;
}
function Field({label,children,full=false}:{label:string;children:React.ReactNode;full?:boolean}) { return <div className={`field ${full?"full":""}`}><label>{label}</label>{children}</div>; }

function Studies() {
  const {data,update,add}=usePlanner(); const [open,setOpen]=useState(false); const [title,setTitle]=useState("");
  const total=data.studies.reduce((n,s)=>n+s.estimatedMinutes,0), done=data.studies.reduce((n,s)=>n+s.completedMinutes,0);
  return <><PageHeader title="Estudos" subtitle="Backlog, foco semanal e progresso por tempo" onAdd={()=>setOpen(true)} addLabel="Novo estudo"/>
  <div className="page-grid"><Stat label="Planejado" value={`${total} min`}/><Stat label="Concluído" value={`${done} min`}/><Stat label="Progresso" value={`${pct(done,total)}%`}/></div>
  <Section title="Estudos da semana"><div className="item-grid">{data.studies.map(s=><div className="card item-card" key={s.id}><span className={`badge ${s.status}`}>{statusLabel[s.status]}</span><h3>{s.title}</h3><p>{s.topic} · {s.type}</p><div className="progress"><i style={{width:`${pct(s.completedMinutes,s.estimatedMinutes)}%`}}/></div><p>{s.completedMinutes} de {s.estimatedMinutes} minutos</p><button className="btn" onClick={()=>update("studies",s.id,{completedMinutes:Math.min(s.estimatedMinutes,s.completedMinutes+30),status:"in_progress"})}>+ 30 minutos</button></div>)}</div></Section>
  {open&&<Modal title="Novo estudo" onClose={()=>setOpen(false)} onSave={()=>{if(title)add("studies",{id:crypto.randomUUID(),title,topic:"Novo tópico",type:"practice",estimatedMinutes:60,completedMinutes:0,status:"todo",checklist:[]});setOpen(false)}}><Field label="Título"><input className="input" value={title} onChange={e=>setTitle(e.target.value)}/></Field></Modal>}</>;
}
function Books() {
 const {data,update}=usePlanner();
 return <><PageHeader title="Livros" subtitle="Acompanhe páginas, ritmo e previsão de conclusão"/><div className="item-grid">{data.books.map(b=>{const remain=b.totalPages-b.currentPage;const weeks=b.weeklyTargetPages?Math.ceil(remain/b.weeklyTargetPages):0;return <div className="card item-card" key={b.id}><span className={`badge ${b.status}`}>{b.status==="reading"?"Lendo":b.status==="finished"?"Finalizado":"Pausado"}</span><h3>{b.title}</h3><p>{b.author}</p><div className="progress"><i style={{width:`${pct(b.currentPage,b.totalPages)}%`}}/></div><p>{b.currentPage} / {b.totalPages} páginas · {b.pagesThisWeek} nesta semana</p>{weeks>0&&<p>Estimativa: {weeks} semanas</p>}<button className="btn" disabled={b.status==="finished"} onClick={()=>update("books",b.id,{currentPage:Math.min(b.totalPages,b.currentPage+10),pagesThisWeek:b.pagesThisWeek+10})}>Registrar +10 páginas</button></div>})}</div></>;
}
function Pocs() {
 const {data,update}=usePlanner();
 return <><PageHeader title="POCs" subtitle="Experimentos pequenos, objetivos claros e escopo controlado"/><div className="item-grid">{data.pocs.map(p=><div className="card item-card" key={p.id}><span className={`badge ${p.status}`}>{p.status==="doing"?"Em andamento":p.status==="done"?"Concluída":p.status==="paused"?"Pausada":"Ideia"}</span><h3>{p.title}</h3><p>{p.description}</p><div className="chips">{p.stack.map(s=><span className="chip" key={s}>{s}</span>)}</div><p><b>Objetivo:</b> {p.goal}</p>{p.scopeChecklist.map(c=><button className={`row-title btn ghost`} key={c.id} onClick={()=>update("pocs",p.id,{scopeChecklist:p.scopeChecklist.map(x=>x.id===c.id?{...x,done:!x.done}:x)})}>{c.done?"✓":"○"} {c.title}</button>)}<div className="suggestion" style={{marginTop:12}}>Avaliação por IA será conectada em uma etapa futura.</div></div>)}</div></>;
}
function Workouts() {
 const {data,update}=usePlanner(); const suggestions=workoutSuggestions(data.workouts);
 const type:Record<string,string>={run:"Corrida",strength:"Força",mobility:"Mobilidade",pilates:"Pilates",football:"Futebol",rest:"Descanso"};
 return <><PageHeader title="Treinos" subtitle="Planeje, registre e ajuste sua semana com base no que realmente fez"/><div className="page-grid"><Stat label="Planejados" value={String(data.workouts.filter(w=>w.status==="planned").length)}/><Stat label="Concluídos" value={String(data.workouts.filter(w=>w.status==="completed").length)}/><Stat label="Carga da semana" value={`${data.workouts.reduce((n,w)=>n+w.durationMinutes,0)} min`}/></div>
 <Section title="Sugestões locais">{suggestions.map(s=><div className="suggestion" key={s}>{s}<br/><span className="eyebrow">Sugestão organizacional, não orientação médica.</span></div>)}</Section>
 <Section title="Plano da semana"><div className="item-grid">{data.workouts.map(w=><div className="card item-card" key={w.id}><span className={`badge ${w.status}`}>{w.status==="completed"?"Concluído":"Planejado"}</span><h3>{type[w.type]}</h3><p>{w.plannedDate} · {w.durationMinutes} min {w.distanceKm?`· ${w.distanceKm} km`:""} · intensidade {w.intensity}</p><button className="btn" onClick={()=>update("workouts",w.id,{status:w.status==="completed"?"planned":"completed"})}>{w.status==="completed"?"Marcar planejado":"Registrar como feito"}</button></div>)}</div></Section></>;
}
function Review() {
 const {data,add,update}=usePlanner(); const existing=data.reviews[0]; const [saved,setSaved]=useState(false);
 const [form,setForm]=useState(existing??{id:"review-current",weekId:data.weeks[0].id,wins:"",misses:"",learnings:"",nextWeekFocus:"",scoreStudy:7,scoreFitness:7,scoreWork:7,scorePersonal:7});
 const save=()=>{if(existing){update("reviews",existing.id,form)}else{add("reviews",form)}setSaved(true)};
 return <><PageHeader title="Revisão semanal" subtitle="Feche a semana com honestidade e carregue só o que importa"/><div className="card"><div className="card-body"><div className="form-grid"><Field label="Vitórias" full><textarea className="input" value={form.wins} onChange={e=>setForm({...form,wins:e.target.value})}/></Field><Field label="O que não aconteceu" full><textarea className="input" value={form.misses} onChange={e=>setForm({...form,misses:e.target.value})}/></Field><Field label="Aprendizados" full><textarea className="input" value={form.learnings} onChange={e=>setForm({...form,learnings:e.target.value})}/></Field><Field label="Foco da próxima semana" full><textarea className="input" value={form.nextWeekFocus} onChange={e=>setForm({...form,nextWeekFocus:e.target.value})}/></Field>{(["scoreStudy","scoreFitness","scoreWork","scorePersonal"] as const).map(k=><Field key={k} label={{scoreStudy:"Estudos",scoreFitness:"Fitness",scoreWork:"Trabalho",scorePersonal:"Pessoal"}[k]}><input className="input" type="number" min="1" max="10" value={form[k]} onChange={e=>setForm({...form,[k]:Number(e.target.value)})}/></Field>)}</div><div style={{marginTop:18,display:"flex",alignItems:"center",gap:12}}><button className="btn primary" onClick={save}>Salvar revisão</button>{saved&&<span className="badge">Revisão salva nesta sessão</span>}</div></div></div></>;
}
function Stat({label,value}:{label:string;value:string}){return <div className="card stat"><span>{label}</span><strong>{value}</strong></div>}
function Section({title,children}:{title:string;children:React.ReactNode}){return <section className="section"><div className="section-head"><h2>{title}</h2></div>{children}</section>}

function Router({page}:{page:string}) {
 return page==="dashboard"?<Dashboard/>:page==="calendar"?<CalendarPage/>:page==="studies"?<Studies/>:page==="books"?<Books/>:page==="pocs"?<Pocs/>:page==="workouts"?<Workouts/>:<Review/>;
}
export function PlannerApp({page}:{page:string}) {
 return <PlannerProvider><Shell><Router page={page}/></Shell></PlannerProvider>;
}
