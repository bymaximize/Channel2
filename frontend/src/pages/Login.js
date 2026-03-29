import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate    = useNavigate();
  const { login }   = useAuth();
  const [form,setForm]   = useState({ username:'', password:'' });
  const [err, setErr]    = useState('');
  const [busy,setBusy]   = useState(false);

  const change = e => setForm(f=>({...f,[e.target.name]:e.target.value}));

  const submit = async e => {
    e.preventDefault(); setErr('');
    if (!form.username||!form.password) return setErr('Fill in all fields.');
    setBusy(true);
    try {
      const r = await API.post('/auth/login', form);
      login(r.data.token, r.data.user);
      navigate('/articles');
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed.');
    } finally { setBusy(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>📡 Channel<span style={{color:'var(--accent)'}}>Pro</span></div>
        <h1 style={S.h1}>Welcome back</h1>
        <p style={S.sub}>Login to your account</p>

        {err && <div style={S.err}>⚠️ {err}</div>}

        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={S.field}>
            <label style={S.label}>Username</label>
            <input name="username" value={form.username} onChange={change}
              placeholder="Your username" autoComplete="username" />
          </div>
          <div style={S.field}>
            <label style={S.label}>Password</label>
            <input type="password" name="password" value={form.password} onChange={change}
              placeholder="Your password" autoComplete="current-password" />
          </div>
          <button type="submit" style={S.btn} disabled={busy}>
            {busy ? '⏳ Logging in…' : '→ Login'}
          </button>
        </form>

        <p style={S.foot}>Don't have an account? <Link to="/signup" style={{color:'var(--accent)',fontWeight:600}}>Sign up</Link></p>
      </div>
    </div>
  );
}

const S = {
  page:  {minHeight:'calc(100vh - var(--nav-h))',display:'flex',alignItems:'center',justifyContent:'center',padding:'48px 22px',background:'radial-gradient(ellipse at 50% 0%,rgba(230,57,70,.07) 0%,transparent 55%)'},
  card:  {background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'38px 34px',width:'100%',maxWidth:400,boxShadow:'var(--shadow-l)'},
  logo:  {fontSize:'1.1rem',fontWeight:900,marginBottom:22},
  h1:    {fontSize:'1.5rem',fontWeight:800,marginBottom:3},
  sub:   {color:'var(--muted)',fontSize:'.86rem',marginBottom:26},
  err:   {background:'rgba(230,57,70,.12)',border:'1px solid rgba(230,57,70,.28)',color:'var(--accent)',borderRadius:'var(--radius-s)',padding:'9px 12px',marginBottom:16,fontSize:'.82rem'},
  field: {display:'flex',flexDirection:'column',gap:5},
  label: {fontSize:'.72rem',fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.5px'},
  btn:   {marginTop:4,padding:12,background:'var(--accent)',color:'#fff',borderRadius:'var(--radius-s)',border:'none',fontSize:'.92rem',fontWeight:700,cursor:'pointer',transition:'all var(--t)'},
  foot:  {textAlign:'center',marginTop:18,fontSize:'.82rem',color:'var(--muted)'},
};
