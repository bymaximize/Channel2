import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../hooks/useApi';

const CATS = ['news','sports','tech','finance','media','culture','gaming','travel','latest'];
const CAT_COLOR = { news:'#e63946',sports:'#f4a261',tech:'#4ecdc4',finance:'#2ecc71',media:'#9b59b6',culture:'#e67e22',gaming:'#3498db',travel:'#1abc9c',latest:'#e74c3c' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [q,       setQ]       = useState('');
  const [results, setResults] = useState([]);
  const [drop,    setDrop]    = useState(false);
  const [open,    setOpen]    = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (q.length < 2) { setResults([]); return; }
    const t = setTimeout(() =>
      API.get(`/articles/search?q=${encodeURIComponent(q)}`)
        .then(r => { setResults(r.data.results || []); setDrop(true); })
        .catch(() => {}), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setDrop(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const go = id => { setQ(''); setResults([]); setDrop(false); nav(`/articles/${id}`); };

  return (
    <nav style={S.nav}>
      <div style={S.inner}>
        {/* Logo */}
        <Link to="/" style={S.logo}>📡 <span style={{color:'var(--accent)'}}>Channel</span>Pro</Link>

        {/* Search */}
        <div ref={ref} style={S.searchBox}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search articles…"
            onFocus={() => results.length && setDrop(true)}
            style={{...S.searchInput}} />
          {drop && results.length > 0 && (
            <div style={S.drop}>
              {results.map(r => (
                <div key={r._id} onClick={() => go(r._id)} style={S.dropItem}>
                  <img src={r.image || 'https://via.placeholder.com/40x30'} alt="" style={S.dropImg}
                    onError={e => e.target.style.display='none'} />
                  <div>
                    <p style={{fontSize:'.8rem',fontWeight:600,lineHeight:1.3}}>{r.title}</p>
                    <span style={{fontSize:'.68rem',color:'var(--muted)'}}>{r.category} · {r.readTime}m</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop cats */}
        <div style={S.cats}>
          {CATS.slice(0,5).map(c => (
            <Link key={c} to={`/articles?category=${c}`} style={S.cat}>{c}</Link>
          ))}
        </div>

        {/* Auth */}
        <div style={S.auth}>
          {user ? <>
            <Link to="/write" style={{...S.btn,...S.btnRed}}>+ Write</Link>
            <Link to="/profile" style={S.userBtn}>👤 {user.username}</Link>
            <button onClick={logout} style={{...S.btn,...S.btnOut}}>Logout</button>
          </> : <>
            <Link to="/login"  style={{...S.btn,...S.btnOut}}>Login</Link>
            <Link to="/signup" style={{...S.btn,...S.btnRed}}>Sign Up</Link>
          </>}
        </div>

        {/* Burger */}
        <button onClick={() => setOpen(o=>!o)} style={S.burger}>{open?'✕':'☰'}</button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={S.mobile}>
          {CATS.map(c => (
            <Link key={c} to={`/articles?category=${c}`} onClick={()=>setOpen(false)} style={S.mLink}>
              <span style={{width:10,height:10,borderRadius:'50%',background:CAT_COLOR[c],display:'inline-block'}}/>
              {c.charAt(0).toUpperCase()+c.slice(1)}
            </Link>
          ))}
          <hr style={{border:'none',borderTop:'1px solid var(--border)',margin:'8px 0'}}/>
          {user ? <>
            <Link to="/write"   onClick={()=>setOpen(false)} style={S.mLink}>+ Write Article</Link>
            <Link to="/profile" onClick={()=>setOpen(false)} style={S.mLink}>My Profile</Link>
            <button onClick={()=>{logout();setOpen(false)}} style={{...S.mLink,textAlign:'left'}}>Logout</button>
          </> : <>
            <Link to="/login"  onClick={()=>setOpen(false)} style={S.mLink}>Login</Link>
            <Link to="/signup" onClick={()=>setOpen(false)} style={S.mLink}>Sign Up</Link>
          </>}
        </div>
      )}
    </nav>
  );
}

const S = {
  nav:   {position:'sticky',top:0,zIndex:1000,background:'rgba(10,11,15,.93)',backdropFilter:'blur(18px)',borderBottom:'1px solid var(--border)',height:'var(--nav-h)'},
  inner: {maxWidth:1380,margin:'0 auto',display:'flex',alignItems:'center',gap:14,padding:'0 22px',height:'100%'},
  logo:  {fontSize:'1.15rem',fontWeight:900,flexShrink:0,letterSpacing:'-.3px'},
  searchBox:{position:'relative',flex:1,maxWidth:340},
  searchInput:{padding:'8px 14px',height:36,fontSize:'.82rem',borderRadius:18,background:'var(--bg3)'},
  drop:  {position:'absolute',top:'calc(100% + 8px)',left:0,right:0,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--radius)',overflow:'hidden',boxShadow:'var(--shadow-l)',zIndex:200},
  dropItem:{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',cursor:'pointer',transition:'background var(--t)'},
  dropImg:{width:44,height:30,borderRadius:5,flexShrink:0,objectFit:'cover'},
  cats:  {display:'flex',alignItems:'center',gap:2,flexShrink:0},
  cat:   {padding:'5px 10px',borderRadius:'var(--radius-s)',fontSize:'.79rem',fontWeight:500,color:'var(--muted)',textTransform:'capitalize',transition:'all var(--t)'},
  auth:  {display:'flex',alignItems:'center',gap:8,flexShrink:0},
  btn:   {padding:'7px 18px',borderRadius:20,fontSize:'.79rem',fontWeight:700,cursor:'pointer',transition:'all var(--t)',display:'inline-block',whiteSpace:'nowrap'},
  btnRed:{background:'var(--accent)',color:'#fff'},
  btnOut:{border:'1.5px solid var(--border)',color:'var(--muted)'},
  userBtn:{fontSize:'.79rem',color:'var(--muted)',cursor:'pointer',whiteSpace:'nowrap'},
  burger:{display:'none',fontSize:'1.2rem',color:'var(--text)',padding:4,marginLeft:'auto'},
  mobile:{background:'var(--bg2)',borderTop:'1px solid var(--border)',padding:'10px 16px 14px',display:'flex',flexDirection:'column',gap:2},
  mLink: {padding:'9px 12px',borderRadius:'var(--radius-s)',fontSize:'.87rem',fontWeight:500,color:'var(--muted)',textTransform:'capitalize',display:'flex',alignItems:'center',gap:8,transition:'all var(--t)'},
};
