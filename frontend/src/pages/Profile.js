import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../hooks/useApi';

export default function Profile() {
  const { user, logout, refresh } = useAuth();
  const navigate = useNavigate();
  const [bio,    setBio]    = useState(user?.bio   || '');
  const [email,  setEmail]  = useState(user?.email || '');
  const [ok,     setOk]     = useState('');
  const [err,    setErr]    = useState('');
  const [busy,   setBusy]   = useState(false);

  if (!user) { navigate('/login'); return null; }

  const save = async () => {
    setBusy(true); setOk(''); setErr('');
    try {
      await API.put('/auth/profile', { bio, email });
      await refresh();
      setOk('Profile saved!');
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed.');
    } finally { setBusy(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.inner}>
        {/* Top */}
        <div style={S.top}>
          <div style={S.av}>{user.username?.charAt(0).toUpperCase()}</div>
          <div>
            <h1 style={{fontSize:'1.5rem',fontWeight:800}}>{user.username}</h1>
            <p style={{color:'var(--muted)',fontSize:'.85rem'}}>
              {user.role==='admin'?'🛡 Admin':'👤 Member'} · Channel Pro
            </p>
          </div>
        </div>

        {ok  && <div style={S.ok}>✅ {ok}</div>}
        {err && <div style={S.err}>⚠️ {err}</div>}

        {/* Edit card */}
        <div style={S.card}>
          <h2 style={S.cardTitle}>Edit Profile</h2>
          <div style={S.field}>
            <label style={S.label}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          <div style={{...S.field,marginTop:12}}>
            <label style={S.label}>Bio</label>
            <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3}
              placeholder="Tell the world about yourself…" style={{resize:'vertical'}} />
          </div>
          <div style={{display:'flex',gap:10,marginTop:16,flexWrap:'wrap'}}>
            <button className="btn btn-red" onClick={save} disabled={busy}>
              {busy?'Saving…':'💾 Save Changes'}
            </button>
            <Link to="/write" className="btn btn-outline">✍️ Write Article</Link>
          </div>
        </div>

        {/* Quick links */}
        <div style={S.card}>
          <h2 style={S.cardTitle}>Quick Links</h2>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <Link to="/articles" className="btn btn-outline">📰 Browse Articles</Link>
            <button className="btn btn-outline" onClick={()=>{logout();navigate('/');}}>🚪 Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page:      {minHeight:'calc(100vh - var(--nav-h))',padding:'44px 22px',display:'flex',justifyContent:'center'},
  inner:     {width:'100%',maxWidth:540},
  top:       {display:'flex',alignItems:'center',gap:18,marginBottom:28},
  av:        {width:68,height:68,borderRadius:'50%',background:'var(--accent)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.9rem',fontWeight:800,flexShrink:0},
  ok:        {background:'rgba(6,214,160,.12)',border:'1px solid rgba(6,214,160,.3)',color:'#06d6a0',borderRadius:'var(--radius-s)',padding:'9px 13px',marginBottom:16,fontSize:'.84rem'},
  err:       {background:'rgba(230,57,70,.12)',border:'1px solid rgba(230,57,70,.28)',color:'var(--accent)',borderRadius:'var(--radius-s)',padding:'9px 13px',marginBottom:16,fontSize:'.84rem'},
  card:      {background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'24px',marginBottom:18},
  cardTitle: {fontSize:'.7rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.8px',color:'var(--muted)',marginBottom:16},
  field:     {display:'flex',flexDirection:'column',gap:5},
  label:     {fontSize:'.72rem',fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.5px'},
};
