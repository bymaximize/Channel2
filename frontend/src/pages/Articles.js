import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../hooks/useApi';
import ArticleCard from '../components/ArticleCard';

const CATS  = ['all','news','sports','tech','finance','media','culture','gaming','travel','latest'];
const EMOJI = {all:'🌐',news:'📰',sports:'⚽',tech:'💻',finance:'📈',media:'🎬',culture:'🎭',gaming:'🎮',travel:'✈️',latest:'⚡'};
const CAT_COLOR = {news:'#e63946',sports:'#f4a261',tech:'#4ecdc4',finance:'#2ecc71',media:'#9b59b6',culture:'#e67e22',gaming:'#3498db',travel:'#1abc9c',latest:'#e74c3c'};

export default function Articles() {
  const [sp, setSp]         = useSearchParams();
  const [articles,  setArticles]  = useState([]);
  const [allTags,   setAllTags]   = useState([]);
  const [pages,     setPages]     = useState({});
  const [loading,   setLoading]   = useState(true);

  const cat    = sp.get('category') || 'all';
  const tag    = sp.get('tag')      || '';
  const search = sp.get('search')   || '';
  const sort   = sp.get('sort')     || 'newest';
  const page   = parseInt(sp.get('page')||'1');

  const set = (k,v) => {
    const p = new URLSearchParams(sp);
    if (v) p.set(k,v); else p.delete(k);
    if (k!=='page') p.delete('page');
    setSp(p);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit:12, sort };
      if (cat!=='all') params.category = cat;
      if (tag)    params.tag    = tag;
      if (search) params.search = search;
      const r = await API.get('/articles', { params });
      setArticles(r.data.articles  || []);
      setAllTags(r.data.allTags    || []);
      setPages(r.data.pagination   || {});
    } finally { setLoading(false); }
  }, [cat,tag,search,sort,page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={S.wrap}>
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside style={S.aside}>
        <p style={S.label}>Categories</p>
        {CATS.map(c=>(
          <button key={c} onClick={()=>set('category',c==='all'?'':c)}
            style={{...S.catBtn,...(cat===c?S.catOn:{})}}>
            <span>{EMOJI[c]}</span>
            <span>{c.charAt(0).toUpperCase()+c.slice(1)}</span>
          </button>
        ))}
        <div style={S.divider}/>
        <p style={S.label}>Sort By</p>
        {[['newest','🕐 Newest'],['views','🔥 Most Viewed'],['likes','❤️ Most Liked'],['trending','📈 Trending']].map(([v,l])=>(
          <button key={v} onClick={()=>set('sort',v)}
            style={{...S.catBtn,...(sort===v?S.catOn:{})}}>
            {l}
          </button>
        ))}
        {allTags.length>0 && <>
          <div style={S.divider}/>
          <p style={S.label}>Tags</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:5,padding:'0 6px'}}>
            {allTags.slice(0,20).map(t=>(
              <button key={t} onClick={()=>set('tag',tag===t?'':t)}
                style={{...S.tagBtn,...(tag===t?S.tagOn:{})}}>#{t}</button>
            ))}
          </div>
        </>}
      </aside>

      {/* ── Main ────────────────────────────────────────── */}
      <main style={S.main}>
        {/* Search bar */}
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          <input placeholder="🔍 Search articles…" defaultValue={search}
            onKeyDown={e=>{if(e.key==='Enter')set('search',e.target.value)}}
            style={{flex:1}} />
          {search && <button onClick={()=>set('search','')} style={S.clearBtn}>✕ Clear</button>}
        </div>

        {/* Active filters */}
        {(cat!=='all'||tag||search) && (
          <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:14}}>
            {cat!=='all' && <Chip label={cat} color={CAT_COLOR[cat]} onRemove={()=>set('category','')}/>}
            {tag         && <Chip label={`#${tag}`} onRemove={()=>set('tag','')}/>}
            {search      && <Chip label={`"${search}"`} onRemove={()=>set('search','')}/>}
          </div>
        )}

        {loading ? (
          <div className="page-center"><div className="spin"/><p>Loading…</p></div>
        ) : articles.length===0 ? (
          <div className="page-center">
            <p style={{fontSize:'2rem'}}>😔</p>
            <p>No articles found.</p>
            <Link to="/articles" className="btn btn-red" style={{marginTop:8}}>Clear Filters</Link>
          </div>
        ) : (
          <>
            <p style={{fontSize:'.78rem',color:'var(--muted)',marginBottom:14}}>
              {pages.total||articles.length} articles
            </p>
            <div style={S.grid}>
              {articles.map(a=><ArticleCard key={a._id} article={a}/>)}
            </div>
            {pages.pages>1 && (
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:14,marginTop:36}}>
                <button disabled={page<=1} onClick={()=>set('page',String(page-1))} style={S.pageBtn}>← Prev</button>
                <span style={{fontSize:'.82rem',color:'var(--muted)'}}>Page {page} of {pages.pages}</span>
                <button disabled={page>=pages.pages} onClick={()=>set('page',String(page+1))} style={S.pageBtn}>Next →</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Chip({label,color,onRemove}) {
  return (
    <span style={{display:'flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:20,background:color?`${color}22`:'rgba(230,57,70,.12)',color:color||'var(--accent)',fontSize:'.74rem',fontWeight:700}}>
      {label}
      <button onClick={onRemove} style={{fontSize:'.85rem',color:'inherit',lineHeight:1}}>✕</button>
    </span>
  );
}

const S = {
  wrap:   {display:'grid',gridTemplateColumns:'220px 1fr',maxWidth:1360,margin:'0 auto',padding:'28px 22px',gap:26,minHeight:'calc(100vh - var(--nav-h))'},
  aside:  {display:'flex',flexDirection:'column',gap:4,alignSelf:'start',position:'sticky',top:'calc(var(--nav-h) + 14px)'},
  label:  {fontSize:'.66rem',fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'1px',padding:'4px 10px 8px'},
  catBtn: {display:'flex',alignItems:'center',gap:9,width:'100%',padding:'8px 10px',borderRadius:'var(--radius-s)',fontSize:'.82rem',fontWeight:500,color:'var(--muted)',textTransform:'capitalize',textAlign:'left',transition:'all .14s'},
  catOn:  {background:'rgba(230,57,70,.12)',color:'var(--accent)',fontWeight:700},
  divider:{height:1,background:'var(--border)',margin:'8px 0'},
  tagBtn: {padding:'3px 10px',borderRadius:12,fontSize:'.68rem',fontWeight:600,background:'var(--bg3)',color:'var(--muted)',transition:'all .14s',cursor:'pointer'},
  tagOn:  {background:'rgba(230,57,70,.12)',color:'var(--accent)'},
  main:   {minWidth:0},
  clearBtn:{padding:'0 14px',borderRadius:'var(--radius-s)',fontSize:'.78rem',color:'var(--muted)',background:'var(--bg3)',border:'1.5px solid var(--border)',cursor:'pointer',whiteSpace:'nowrap'},
  grid:   {display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:18},
  pageBtn:{padding:'8px 18px',borderRadius:'var(--radius-s)',background:'var(--bg2)',border:'1.5px solid var(--border)',color:'var(--text)',fontSize:'.82rem',fontWeight:600,cursor:'pointer',transition:'all .14s'},
};
