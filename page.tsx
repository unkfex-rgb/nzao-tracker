"use client";
import {useEffect,useMemo,useState} from "react";
type Video={video_id:string;username:string|null;description:string|null;published_at:string;video_url:string|null;hashtags:string[];metrics:{views:number;likes:number;comments:number;shares:number}};
const fmt=(n:number)=>new Intl.NumberFormat("pt-BR",{notation:n>=1000000?"compact":"standard",maximumFractionDigits:1}).format(n);
export default function Home(){
 const [data,setData]=useState<any>(null),[tag,setTag]=useState("geral"),[loading,setLoading]=useState(true);
 async function load(){setLoading(true);try{const r=await fetch("/api/stats",{cache:"no-store"});setData(await r.json())}finally{setLoading(false)}}
 useEffect(()=>{load();const t=setInterval(load,60000);return()=>clearInterval(t)},[]);
 const videos:Video[]=useMemo(()=>!data?[]:data.videos.filter((v:Video)=>tag==="geral"||v.hashtags.includes(tag)),[data,tag]);
 const totals=useMemo(()=>videos.reduce((a,v)=>({views:a.views+v.metrics.views,likes:a.likes+v.metrics.likes,comments:a.comments+v.metrics.comments,shares:a.shares+v.metrics.shares}),{views:0,likes:0,comments:0,shares:0}),[videos]);
 return <main className="wrap"><div className="muted">MONITORAMENTO DE CAMPANHA · BRASIL</div><h1>NZAO TRACKER</h1><p className="muted">Hashtags #nzao e #nzao10k · Publicações de 05/09/2026 a 05/10/2026</p>
 <div className="tabs">{["geral","nzao","nzao10k"].map(x=><button className={"tab "+(tag===x?"active":"")} onClick={()=>setTag(x)} key={x}>{x==="geral"?"Visão geral":"#"+x}</button>)}<button className="tab" onClick={load}>↻ Atualizar</button></div>
 {loading&&!data?<p>Carregando dados…</p>:!data?<p>Não foi possível carregar os dados.</p>:<>
 <div className="cards">{[["Vídeos únicos",videos.length],["Visualizações",totals.views],["Curtidas",totals.likes],["Comentários",totals.comments],["Compartilhamentos",totals.shares]].map(([k,v]:any)=><div className="card" key={k}><div className="muted">{k}</div><div className="value">{fmt(v)}</div></div>)}</div>
 <section className="panel"><h2>Vídeos com melhor desempenho</h2><table><thead><tr><th>Perfil</th><th>Data</th><th>Hashtags</th><th>Views</th><th>Curtidas</th><th>Link</th></tr></thead><tbody>{videos.slice(0,100).map(v=><tr key={v.video_id}><td>@{v.username??"desconhecido"}</td><td>{new Date(v.published_at).toLocaleDateString("pt-BR")}</td><td>{v.hashtags.map(h=><span className="pill" key={h}>#{h}</span>)}</td><td>{fmt(v.metrics.views)}</td><td>{fmt(v.metrics.likes)}</td><td>{v.video_url?<a href={v.video_url} target="_blank">Abrir</a>:"—"}</td></tr>)}</tbody></table>{videos.length===0&&<p className="muted">Nenhum vídeo encontrado. Configure o coletor e execute a primeira coleta.</p>}</section>
 <p className="muted">Atualização visual automática a cada minuto. A coleta real depende do cron horário configurado na Vercel.</p></>}</main>
}