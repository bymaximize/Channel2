import { Link } from 'react-router-dom';

const CAT_COLOR = {
  news:'#e63946',sports:'#f4a261',tech:'#4ecdc4',finance:'#2ecc71',
  media:'#9b59b6',culture:'#e67e22',gaming:'#3498db',travel:'#1abc9c',latest:'#e74c3c'
};
const FB = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=70';

export default function ArticleCard({ article, featured=false }) {
  if (!article) return null;
  const color = CAT_COLOR[article.category] || '#e63946';

  if (featured) return (
    <Link to={`/articles/${article._id}`} style={S.feat}>
      <div style={S.featImg}>
        <img src={article.image||FB} alt={article.title} style={{width:'100%',height:'100%',objectFit:'cover'}}
          onError={e=>{e.target.src=FB}} />
        <div style={S.featGrad}/>
      </div>
      <div style={S.featBody}>
        <span style={{...S.badge,background:color}}>{article.category}</span>
        <h1 style={S.featTitle}>{article.title}</h1>
        <p style={S.featSummary}>{article.summary?.slice(0,180)}…</p>
        <div style={S.meta}>
          <span>✍️ {article.authorName}</span>
          <span>👁 {(article.views||0).toLocaleString()}</span>
          <span>⏱ {article.readTime} min</span>
        </div>
      </div>
    </Link>
  );

  return (
    <Link to={`/articles/${article._id}`} style={S.card} className="article-card">
      <div style={S.imgBox}>
        <img src={article.image||FB} alt={article.title} style={S.img}
          onError={e=>{e.target.src=FB}} />
        <span style={{...S.badge,...S.badgeAbs,background:color}}>{article.category}</span>
        {article.trending && <span style={S.trendBadge}>🔥 Trending</span>}
      </div>
      <div style={S.body}>
        <p style={S.source}>{article.authorName}</p>
        <h3 style={S.title}>{article.title}</h3>
        <p style={S.summary}>{article.summary?.slice(0,100)}…</p>
        <div style={S.meta}>
          <span>👁 {(article.views||0).toLocaleString()}</span>
          <span>❤️ {article.likes?.length||0}</span>
          <span>⏱ {article.readTime}m</span>
        </div>
      </div>
    </Link>
  );
}

const S = {
  card:      {display:'flex',flexDirection:'column',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--radius)',overflow:'hidden',height:'100%',transition:'transform .2s,box-shadow .2s'},
  imgBox:    {position:'relative',aspectRatio:'16/9',overflow:'hidden',background:'var(--bg3)',flexShrink:0},
  img:       {width:'100%',height:'100%',objectFit:'cover',transition:'transform .4s ease'},
  badge:     {padding:'3px 10px',borderRadius:20,fontSize:'.66rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',color:'#fff'},
  badgeAbs:  {position:'absolute',top:10,left:10},
  trendBadge:{position:'absolute',top:10,right:10,background:'rgba(0,0,0,.7)',color:'#ffd60a',fontSize:'.65rem',fontWeight:700,padding:'2px 8px',borderRadius:10},
  body:      {padding:'14px 16px',display:'flex',flexDirection:'column',flex:1},
  source:    {fontSize:'.68rem',color:'var(--muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:5},
  title:     {fontSize:'.96rem',fontWeight:700,lineHeight:1.38,marginBottom:7,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'},
  summary:   {fontSize:'.79rem',color:'var(--muted)',lineHeight:1.55,flex:1,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'},
  meta:      {display:'flex',gap:12,marginTop:12,fontSize:'.71rem',color:'var(--muted)'},
  feat:      {display:'flex',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--radius)',overflow:'hidden',minHeight:280},
  featImg:   {position:'relative',width:'52%',flexShrink:0,overflow:'hidden'},
  featGrad:  {position:'absolute',inset:0,background:'linear-gradient(to right,transparent 50%,var(--bg2))'},
  featBody:  {padding:'28px 24px',display:'flex',flexDirection:'column',justifyContent:'center',flex:1,gap:12},
  featTitle: {fontFamily:'var(--serif)',fontSize:'clamp(1.3rem,2.5vw,1.9rem)',fontWeight:800,lineHeight:1.25},
  featSummary:{fontSize:'.88rem',color:'var(--muted)',lineHeight:1.65,display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'},
};

/* hover effect via global style */
const style = document.createElement('style');
style.textContent = `.article-card:hover{transform:translateY(-4px);box-shadow:var(--shadow)}.article-card:hover img{transform:scale(1.04)}`;
document.head.appendChild(style);
