import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../hooks/useApi';
import ArticleCard from '../components/ArticleCard';

const CATS = ['news','sports','tech','finance','media','culture','gaming','travel','latest'];
const EMOJI = {news:'📰',sports:'⚽',tech:'💻',finance:'📈',media:'🎬',culture:'🎭',gaming:'🎮',travel:'✈️',latest:'⚡'};

export default function Home() {
  const [data,    setData]    = useState({ articles:[], featured:null, trending:[] });
  const [byCat,   setByCat]   = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/articles?limit=60')
      .then(r => {
        const { articles, featured, trending } = r.data;
        setData({ articles, featured, trending: trending||[] });
        const grouped = {};
        CATS.forEach(c => { grouped[c] = articles.filter(a => a.category===c).slice(0,4); });
        setByCat(grouped);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-center"><div className="spin"/><p>Loading…</p></div>;

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={S.hero}>
        <div style={S.heroGlow}/>
        <div style={S.heroInner}>
          <span style={S.heroTag}>🇮🇳 India's Modern News Platform</span>
          <h1 style={S.heroH1}>Stay Informed.<br/><span style={{color:'var(--accent)'}}>Stay Ahead.</span></h1>
          <p style={S.heroP}>Breaking news, deep analysis, and stories that matter — curated for you.</p>
          <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
            <Link to="/articles" className="btn btn-red">Browse All Articles</Link>
            <Link to="/articles?category=latest" className="btn btn-outline">Latest News ⚡</Link>
          </div>
          <div style={S.stats}>
            {[['12+','Articles'],['9','Categories'],['24/7','Updates'],['100%','Free']].map(([n,l])=>(
              <div key={l} style={{textAlign:'center'}}>
                <div style={{fontSize:'1.7rem',fontWeight:900,color:'var(--accent)'}}>{n}</div>
                <div style={{fontSize:'.72rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.5px'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={S.body}>
        {/* ── Featured ──────────────────────────────────── */}
        {data.featured && (
          <section style={S.sec}>
            <h2 style={S.secTitle}>⭐ Featured Story</h2>
            <ArticleCard article={data.featured} featured />
          </section>
        )}

        {/* ── Trending ──────────────────────────────────── */}
        {data.trending?.length > 0 && (
          <section style={S.sec}>
            <div style={S.secHd}>
              <h2 style={S.secTitle}>🔥 Trending Now</h2>
              <Link to="/articles?sort=trending" style={S.seeAll}>See all →</Link>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {data.trending.map((a,i)=>(
                <Link key={a._id} to={`/articles/${a._id}`} style={S.trendRow}>
                  <span style={S.trendNum}>0{i+1}</span>
                  <img src={a.image||'https://via.placeholder.com/60x45'} alt="" style={S.trendImg}
                    onError={e=>e.target.style.display='none'} />
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:'.85rem',fontWeight:700,lineHeight:1.3,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{a.title}</p>
                    <span style={{fontSize:'.7rem',color:'var(--muted)'}}>{a.category} · 👁 {(a.views||0).toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Latest ────────────────────────────────────── */}
        <section style={S.sec}>
          <div style={S.secHd}>
            <h2 style={S.secTitle}>🗞️ Latest Articles</h2>
            <Link to="/articles" style={S.seeAll}>See all →</Link>
          </div>
          <div style={S.grid3}>
            {data.articles.slice(0,6).map(a=><ArticleCard key={a._id} article={a}/>)}
          </div>
        </section>

        {/* ── Category strips ───────────────────────────── */}
        {CATS.filter(c=>byCat[c]?.length>0).map(c=>(
          <section key={c} style={S.sec}>
            <div style={S.secHd}>
              <h2 style={S.secTitle}>{EMOJI[c]} {c.charAt(0).toUpperCase()+c.slice(1)}</h2>
              <Link to={`/articles?category=${c}`} style={S.seeAll}>See all →</Link>
            </div>
            <div style={S.grid4}>
              {byCat[c].map(a=><ArticleCard key={a._id} article={a}/>)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

const S = {
  hero:    {padding:'80px 24px 60px',textAlign:'center',background:'linear-gradient(160deg,#0a0b0f 0%,#16082e 50%,#0a0b0f 100%)',borderBottom:'1px solid var(--border)',position:'relative',overflow:'hidden'},
  heroGlow:{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% -5%,rgba(230,57,70,.16) 0%,transparent 65%)',pointerEvents:'none'},
  heroInner:{position:'relative',maxWidth:680,margin:'0 auto',display:'flex',flexDirection:'column',alignItems:'center',gap:18},
  heroTag: {display:'inline-block',padding:'5px 16px',background:'rgba(230,57,70,.14)',border:'1px solid rgba(230,57,70,.28)',borderRadius:20,fontSize:'.77rem',fontWeight:600,color:'#ff6b7a'},
  heroH1:  {fontFamily:'var(--serif)',fontSize:'clamp(2rem,6vw,3.6rem)',fontWeight:800,lineHeight:1.15},
  heroP:   {fontSize:'1.04rem',color:'var(--muted)',maxWidth:480},
  stats:   {display:'flex',gap:36,flexWrap:'wrap',justifyContent:'center',marginTop:12},
  body:    {maxWidth:1360,margin:'0 auto',padding:'44px 22px 60px'},
  sec:     {marginBottom:52},
  secHd:   {display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18},
  secTitle:{fontSize:'1.15rem',fontWeight:800,display:'flex',alignItems:'center',gap:8},
  seeAll:  {fontSize:'.78rem',color:'var(--accent)',fontWeight:600},
  grid3:   {display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:18},
  grid4:   {display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:18},
  trendRow:{display:'flex',alignItems:'center',gap:14,padding:'12px 16px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--radius-s)',transition:'border-color var(--t)'},
  trendNum:{fontSize:'1.4rem',fontWeight:900,color:'var(--border)',width:28,flexShrink:0},
  trendImg:{width:64,height:46,borderRadius:6,objectFit:'cover',flexShrink:0},
};
