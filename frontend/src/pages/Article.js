import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import ArticleCard from '../components/ArticleCard';

const CAT_COLOR = {news:'#e63946',sports:'#f4a261',tech:'#4ecdc4',finance:'#2ecc71',media:'#9b59b6',culture:'#e67e22',gaming:'#3498db',travel:'#1abc9c',latest:'#e74c3c'};
const FB = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900&q=70';

export default function Article() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [art,       setArt]       = useState(null);
  const [related,   setRelated]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [liked,     setLiked]     = useState(false);
  const [bookmarked,setBookmarked]= useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [cText,     setCText]     = useState('');
  const [posting,   setPosting]   = useState(false);

  useEffect(() => {
    setLoading(true);
    API.get(`/articles/${id}`)
      .then(r => {
        const a = r.data.article;
        setArt(a);
        setRelated(r.data.related||[]);
        setLikeCount(a.likes?.length||0);
        if (user) {
          setLiked(a.likes?.some(l => l===user.id||l._id===user.id));
          setBookmarked(a.bookmarks?.some(b => b===user.id||b._id===user.id));
        }
      })
      .catch(() => navigate('/articles'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const like = async () => {
    if (!user) return navigate('/login');
    const r = await API.post(`/articles/${id}/like`);
    setLiked(r.data.liked); setLikeCount(r.data.count);
  };

  const bookmark = async () => {
    if (!user) return navigate('/login');
    const r = await API.post(`/articles/${id}/bookmark`);
    setBookmarked(r.data.bookmarked);
  };

  const postComment = async () => {
    if (!user) return navigate('/login');
    if (!cText.trim()) return;
    setPosting(true);
    try {
      const r = await API.post(`/articles/${id}/comments`, { text: cText.trim() });
      setArt(a => ({...a, comments:[...(a.comments||[]), r.data.comment]}));
      setCText('');
    } finally { setPosting(false); }
  };

  const delComment = async cid => {
    await API.delete(`/articles/${id}/comments/${cid}`);
    setArt(a => ({...a, comments: a.comments.filter(c=>c._id!==cid)}));
  };

  if (loading) return <div className="page-center"><div className="spin"/><p>Loading article…</p></div>;
  if (!art)    return null;

  const color  = CAT_COLOR[art.category]||'#e63946';
  const paras  = art.body?.split('\n\n').filter(Boolean)||[art.body];
  const canDel = (c) => user && (c.author===user.id||c.author?._id===user.id||user.role==='admin');

  return (
    <div>
      {/* Hero image */}
      <div style={{position:'relative',height:'clamp(220px,40vw,440px)',overflow:'hidden',background:'var(--bg2)'}}>
        <img src={art.image||FB} alt={art.title} style={{width:'100%',height:'100%',objectFit:'cover'}}
          onError={e=>{e.target.src=FB}} />
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(10,11,15,.92) 0%,rgba(10,11,15,.1) 55%,transparent 100%)'}}/>
      </div>

      <div style={S.layout}>
        {/* Article body */}
        <article style={S.body}>
          {/* Meta top */}
          <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:14}}>
            <span style={{...S.badge,background:color}}>{art.category}</span>
            {art.trending && <span style={S.tBadge}>🔥 Trending</span>}
            <span style={S.muted}>{art.authorName}</span>
            <span style={{...S.muted,marginLeft:'auto'}}>⏱ {art.readTime} min read</span>
          </div>

          <h1 style={S.heading}>{art.title}</h1>

          {/* Author row */}
          <div style={S.authorRow}>
            <div style={S.av}>{art.authorName?.charAt(0).toUpperCase()}</div>
            <div>
              <p style={{fontSize:'.88rem',fontWeight:700}}>{art.authorName}</p>
              <p style={S.muted}>{new Date(art.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</p>
            </div>
            <div style={S.acts}>
              <button onClick={like} style={{...S.actBtn,...(liked?S.actOn:{})}}>
                {liked?'❤️':'🤍'} {likeCount}
              </button>
              <button onClick={bookmark} style={{...S.actBtn,...(bookmarked?S.actOn:{})}}>
                {bookmarked?'🔖':'📑'} {bookmarked?'Saved':'Save'}
              </button>
              <span style={S.muted}>👁 {(art.views||0).toLocaleString()}</span>
            </div>
          </div>

          {/* Body paragraphs */}
          <div style={{marginBottom:28}}>
            {paras.map((p,i)=>(
              <p key={i} style={{fontSize:'1.04rem',lineHeight:1.85,marginBottom:18,color:'var(--text)'}}>{p}</p>
            ))}
          </div>

          {/* Tags */}
          {art.tags?.length>0 && (
            <div style={{display:'flex',flexWrap:'wrap',gap:7,paddingTop:20,borderTop:'1px solid var(--border)'}}>
              {art.tags.map(t=>(
                <Link key={t} to={`/articles?tag=${t}`} style={S.tag}>#{t}</Link>
              ))}
            </div>
          )}
        </article>

        {/* Sidebar */}
        <aside style={S.side}>
          <div style={S.sideCard}>
            <h3 style={S.sideTitle}>Article Info</h3>
            {[['👁 Views',(art.views||0).toLocaleString()],['❤️ Likes',likeCount],['💬 Comments',art.comments?.length||0],['⏱ Read',`${art.readTime} min`],['📂 Category',art.category]].map(([k,v])=>(
              <div key={k} style={S.sideRow}>
                <span style={S.muted}>{k}</span>
                <strong style={{textTransform:'capitalize'}}>{v}</strong>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Comments */}
      <div style={S.comments}>
        <h2 style={{fontSize:'1.15rem',fontWeight:700,marginBottom:18}}>💬 Comments ({art.comments?.length||0})</h2>

        {user ? (
          <div style={{display:'flex',gap:9,marginBottom:24}}>
            <textarea value={cText} onChange={e=>setCText(e.target.value)} rows={2}
              placeholder="Write a comment…" style={{flex:1,resize:'vertical',minHeight:52}}/>
            <button onClick={postComment} disabled={posting||!cText.trim()} style={S.postBtn}>
              {posting?'…':'Post'}
            </button>
          </div>
        ) : (
          <p style={{fontSize:'.85rem',color:'var(--muted)',marginBottom:20}}>
            <Link to="/login" style={{color:'var(--accent)'}}>Login</Link> to comment.
          </p>
        )}

        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {!art.comments?.length && <p style={{color:'var(--muted)',fontSize:'.85rem'}}>No comments yet. Be the first!</p>}
          {[...(art.comments||[])].reverse().map(c=>(
            <div key={c._id} style={S.comment}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:7}}>
                <div style={S.cAv}>{c.username?.charAt(0).toUpperCase()}</div>
                <span style={{fontSize:'.8rem',fontWeight:700}}>{c.username}</span>
                <span style={{...S.muted,fontSize:'.68rem',marginLeft:'auto'}}>
                  {new Date(c.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                </span>
                {canDel(c) && (
                  <button onClick={()=>delComment(c._id)} style={{color:'var(--accent)',fontSize:'.72rem',cursor:'pointer'}}>🗑</button>
                )}
              </div>
              <p style={{fontSize:'.86rem',lineHeight:1.55}}>{c.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related */}
      {related.length>0 && (
        <div style={{background:'var(--bg2)',borderTop:'1px solid var(--border)',padding:'44px 22px'}}>
          <div style={{maxWidth:1160,margin:'0 auto'}}>
            <h2 style={{fontSize:'1.1rem',fontWeight:700,marginBottom:20}}>More in {art.category}</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:18}}>
              {related.map(a=><ArticleCard key={a._id} article={a}/>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  layout:   {maxWidth:1160,margin:'-70px auto 0',padding:'0 22px 48px',display:'grid',gridTemplateColumns:'1fr 250px',gap:26,position:'relative',zIndex:2},
  body:     {background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'32px'},
  heading:  {fontFamily:'var(--serif)',fontSize:'clamp(1.5rem,3.5vw,2.3rem)',fontWeight:800,lineHeight:1.22,marginBottom:22},
  authorRow:{display:'flex',alignItems:'center',gap:12,padding:'14px 0',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',marginBottom:28,flexWrap:'wrap'},
  av:       {width:40,height:40,borderRadius:'50%',background:'var(--accent)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',fontWeight:800,flexShrink:0},
  acts:     {display:'flex',gap:8,alignItems:'center',marginLeft:'auto',flexWrap:'wrap'},
  actBtn:   {padding:'6px 14px',borderRadius:18,border:'1.5px solid var(--border)',color:'var(--muted)',fontSize:'.79rem',fontWeight:600,cursor:'pointer',transition:'all var(--t)',background:'transparent'},
  actOn:    {borderColor:'var(--accent)',color:'var(--accent)',background:'rgba(230,57,70,.1)'},
  badge:    {padding:'3px 10px',borderRadius:20,fontSize:'.67rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',color:'#fff'},
  tBadge:   {padding:'3px 10px',borderRadius:20,fontSize:'.67rem',fontWeight:700,background:'rgba(255,214,10,.15)',color:'#ffd60a'},
  muted:    {fontSize:'.76rem',color:'var(--muted)'},
  tag:      {padding:'4px 12px',borderRadius:18,background:'var(--bg3)',color:'var(--muted)',fontSize:'.75rem',fontWeight:600,transition:'all var(--t)'},
  side:     {alignSelf:'start',position:'sticky',top:'calc(var(--nav-h) + 14px)'},
  sideCard: {background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:18},
  sideTitle:{fontSize:'.68rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:'var(--muted)',marginBottom:14},
  sideRow:  {display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid var(--border)',fontSize:'.82rem'},
  comments: {maxWidth:1160,margin:'0 auto',padding:'0 22px 48px'},
  comment:  {background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--radius-s)',padding:'12px 14px'},
  cAv:      {width:28,height:28,borderRadius:'50%',background:'var(--blue)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.7rem',fontWeight:800},
  postBtn:  {padding:'0 18px',borderRadius:'var(--radius-s)',background:'var(--accent)',color:'#fff',fontSize:'.83rem',fontWeight:700,cursor:'pointer',flexShrink:0,transition:'background var(--t)'},
};
