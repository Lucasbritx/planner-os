import type { PlannerData } from "@/lib/types";

const iso = (date: Date) => date.toISOString().slice(0, 10);
const add = (date: Date, days: number) => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };
const now = new Date();
const sunday = add(now, -now.getDay());
const weekId = "week-current";
const today = iso(now);

export const initialData: PlannerData = {
  weeks: [{ id: weekId, startDate: iso(sunday), endDate: iso(add(sunday, 6)), title: "Semana de execução", status: "active" }],
  goals: [
    { id:"g1", weekId, title:"Finalizar módulo de arquitetura", category:"study", status:"in_progress", priority:"high" },
    { id:"g2", weekId, title:"Manter consistência nos treinos (5x)", category:"fitness", status:"in_progress", priority:"high" },
    { id:"g3", weekId, title:"Concluir POC de fila com Redis", category:"poc", status:"in_progress", priority:"medium" },
    { id:"g4", weekId, title:"Ler 80 páginas", category:"reading", status:"todo", priority:"medium" },
    { id:"g5", weekId, title:"Fazer revisão semanal", category:"personal", status:"todo", priority:"high" }
  ],
  timeboxes: [
    { id:"t1", weekId, title:"Treino de força", date:today, startTime:"06:00", endTime:"07:00", category:"fitness" },
    { id:"t2", weekId, title:"Sistemas Distribuídos — módulo 4", date:today, startTime:"08:30", endTime:"10:00", category:"study" },
    { id:"t3", weekId, title:"POC API em Go", date:today, startTime:"10:45", endTime:"12:15", category:"poc" },
    { id:"t4", weekId, title:"Trabalho profundo — arquitetura", date:today, startTime:"13:30", endTime:"15:30", category:"work" },
    { id:"t5", weekId, title:"Leitura — Clean Architecture", date:today, startTime:"16:00", endTime:"16:45", category:"reading" }
  ],
  studies: [
    { id:"s1", weekId, title:"Sistemas Distribuídos", topic:"Mensageria e filas", type:"course", estimatedMinutes:240, completedMinutes:155, status:"in_progress", checklist:[{id:"sc1",title:"Módulo 4",done:false},{id:"sc2",title:"Exercício prático",done:false}] },
    { id:"s2", weekId, title:"Documentação do Next.js", topic:"Server Components", type:"documentation", estimatedMinutes:90, completedMinutes:45, status:"in_progress", checklist:[{id:"sc3",title:"Anotar padrões",done:true}] },
    { id:"s3", title:"Observabilidade", topic:"OpenTelemetry", type:"article", estimatedMinutes:60, completedMinutes:0, status:"todo", checklist:[] }
  ],
  books: [
    { id:"b1", title:"Clean Architecture", author:"Robert C. Martin", totalPages:432, currentPage:186, weeklyTargetPages:80, pagesThisWeek:42, status:"reading" },
    { id:"b2", title:"Designing Data-Intensive Applications", author:"Martin Kleppmann", totalPages:616, currentPage:124, weeklyTargetPages:60, pagesThisWeek:28, status:"reading" },
    { id:"b3", title:"The Pragmatic Programmer", author:"David Thomas & Andrew Hunt", totalPages:352, currentPage:352, weeklyTargetPages:0, pagesThisWeek:0, status:"finished" }
  ],
  pocs: [
    { id:"p1", title:"API em Go com autenticação", description:"API enxuta para experimentar autenticação e filas.", goal:"Validar arquitetura e observabilidade", repoUrl:"https://github.com/example/go-api", stack:["Go","PostgreSQL","Redis"], status:"doing", scopeChecklist:[{id:"pc1",title:"Setup do projeto",done:true},{id:"pc2",title:"Autenticação",done:true},{id:"pc3",title:"Fila Redis",done:false}] },
    { id:"p2", title:"Fila com Redis", description:"Experimento de jobs e retries.", goal:"Entender garantias de entrega", stack:["Node.js","Redis"], status:"doing", scopeChecklist:[{id:"pc4",title:"Worker",done:true},{id:"pc5",title:"Retry policy",done:false}] },
    { id:"p3", title:"Web scraper com Playwright", description:"Coleta estruturada de páginas.", goal:"Avaliar robustez", stack:["TypeScript","Playwright"], status:"idea", scopeChecklist:[] }
  ],
  workouts: [
    { id:"w1", weekId, type:"strength", plannedDate:today, durationMinutes:50, intensity:"hard", status:"completed" },
    { id:"w2", weekId, type:"run", plannedDate:iso(add(now,1)), durationMinutes:40, distanceKm:6, intensity:"easy", status:"planned" },
    { id:"w3", weekId, type:"mobility", plannedDate:iso(add(now,2)), durationMinutes:25, intensity:"easy", status:"planned" },
    { id:"w4", weekId, type:"strength", plannedDate:iso(add(now,3)), durationMinutes:55, intensity:"moderate", status:"planned" },
    { id:"w5", weekId, type:"run", plannedDate:iso(add(now,5)), durationMinutes:65, distanceKm:10, intensity:"moderate", status:"planned" }
  ],
  reviews: [],
  preferences: { locale:"pt-BR", timezone:"America/Sao_Paulo", weekStartsOn:0 }
};
