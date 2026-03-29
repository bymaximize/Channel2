import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const CATS = ['news','sports','tech','finance','media','culture','gaming','travel','latest'];

export default function Write() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({ title:'', body:'', image:'', category:'news', tags:'', featured:false });
  const [err,     setErr]     = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) { navigate('/login'); return null; }

  const change = e => {
    const v = e.target.type==='checkbox' ? e.target.checked : e.target.value;
    setForm(f=>({...f,[e.target.name]:v}));
  };

  const submit = async e => {
    e.preventDefault(); setErr('');
    if (!form.title.trim() || !form.body.trim()) return setErr('Title and content are required.');
    setLoading(true);
    try {
      const r = await API.post('/articles', form);
      navigate(`/articles/${r.data.article._id}`);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to publish.');
    } finally { setLoading(false); }
  };

  const words = form.body.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div style={S.page}>
      <div style={S.inner}>
        <div style={S.hd}>
          <h1 style={S.h1}>✍️ Write an Article</h1>
          <p style={{color:'var(--muted)',fontSize:'.88rem'}}>Share your story with the world</p>
        </div>

        {err && <div style={S.err}>⚠️ {err}</div>}

        <form onSubmit={submit} style={S.form}>
          {/* Row 1 */}
          <div style={S.row2}>
            <div style={S.field}>
              <label style={S.label}>Category *</label>
              <select name="category" value={form.category} onChange={change}>
                {CATS.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
            <div style={S.field}>
              <label style={S.label}>Image URL</label>
              <input name="image" value={form.image} onChange={change} placeholder="https://…" />
            </div>
          </div>

          {/* Preview */}
          {form.image && (
            <div style={{borderRadius:'var(--radius-s)',overflow:'hidden',maxHeight:180,border:'1px solid var(--border)'}}>
              <img src={form.image} alt="preview" style={{width:'100%',height:180,objectFit:'cover'}}
                onError={e=>e.target.style.display='none'} />
            </div>
          )}

          {/* Title */}
          <div style={S.field}>
            <label style={S.label}>Title *</label>
            <input name="title" value={form.title} onChange={change} placeholder="Write a compelling headline…" />
          </div>

          {/* Body */}
          <div style={S.field}>
            <label style={S.label}>Article Content *</label>
            <textarea name="body" value={form.body} onChange={change} rows={14}
              placeholder="Write your article here… (separate paragraphs with a blank line)"
              style={{resize:'vertical',minHeight:280}} />
            <div style={{display:'flex',justifyContent:'flex-end',fontSize:'.72rem',color:'var(--muted)',marginTop:4}}>
              {words} words · ~{Math.max(1,Math.ceil(words/200))} min read
            </div>
          </div>

          {/* Tags */}
          <div style={S.field}>
            <label style={S.label}>Tags</label>
            <input name="tags" value={form.tags} onChange={change} placeholder="tech, India, AI  (comma separated)" />
          </div>

          {/* Featured */}
          <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',fontSize:'.9rem'}}>
            <input type="checkbox" name="featured" checked={form.featured} onChange={change} style={{width:'auto'}} />
            Mark as Featured Story
          </label>

          {/* Actions */}
          <div style={{display:'flex',gap:10,justifyContent:'flex-end',paddingTop:6}}>
            <button type="button" className="btn btn-outline" onClick={()=>navigate('/articles')}>Cancel</button>
            <button type="submit" className="btn btn-red" disabled={loading}>
              {loading ? '⏳ Publishing…' : '🚀 Publish Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const S = {
  page:  {minHeight:'calc(100vh - var(--nav-h))',padding:'44px 22px',display:'flex',justifyContent:'center'},
  inner: {width:'100%',maxWidth:740},
  hd:    {marginBottom:26},
  h1:    {fontSize:'1.75rem',fontWeight:800,marginBottom:4},
  err:   {background:'rgba(230,57,70,.12)',border:'1px solid rgba(230,57,70,.3)',color:'var(--accent)',borderRadius:'var(--radius-s)',padding:'10px 14px',marginBottom:18,fontSize:'.85rem'},
  form:  {display:'flex',flexDirection:'column',gap:18},
  row2:  {display:'grid',gridTemplateColumns:'1fr 1fr',gap:14},
  field: {display:'flex',flexDirection:'column',gap:5},
  label: {fontSize:'.73rem',fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.5px'},
};
