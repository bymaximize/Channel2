import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';
import User     from './models/User.js';
import Article  from './models/Article.js';

await mongoose.connect(process.env.MONGO_URI);
console.log('✅  Connected');

// Create admin user
const hash = await bcrypt.hash('admin123', 12);
const admin = await User.findOneAndUpdate(
  { username: 'admin' },
  { username: 'admin', password: hash, role: 'admin', bio: 'Channel Pro Admin' },
  { upsert: true, new: true, setDefaultsOnInsert: true }
);
// bypass pre-save hook since we set hash directly
await User.updateOne({ _id: admin._id }, { password: hash });
console.log('👤  Admin: admin / admin123');

await Article.deleteMany({});

const ARTICLES = [
  {
    title: 'India Wins ICC Champions Trophy 2025 in Thrilling Final',
    body: `India clinched the ICC Champions Trophy 2025 with a nail-biting 5-run victory over Australia in the final held at Dubai International Stadium.\n\nRohit Sharma led from the front with a blistering 94 off 78 balls, setting up a competitive total of 287. The Indian bowling attack then came alive, with Jasprit Bumrah picking up 4 wickets to restrict Australia to 282.\n\nThe victory marks India's third Champions Trophy title and sparked celebrations across the country. Prime Minister Narendra Modi congratulated the team on social media, calling it "a historic victory for 1.4 billion Indians".\n\nVirat Kohli, playing in what might be his final ICC tournament, scored a crucial 67 and was named Player of the Tournament for his consistent performances throughout the event.`,
    category: 'sports', featured: true, trending: true,
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80',
    tags: ['cricket','India','Champions Trophy','ICC','sports']
  },
  {
    title: 'GPT-5 Launches with Real-Time Video Understanding',
    body: `OpenAI officially released GPT-5, their most powerful AI model to date, featuring real-time video understanding, multi-modal reasoning, and agentic task completion capabilities that far exceed GPT-4.\n\nThe model introduces a "deep thinking" mode where it pauses, reflects, and revises responses before output—dramatically improving performance on mathematics, coding, and complex reasoning tasks.\n\nMost impressively, GPT-5 can analyse live video feeds. In demonstrations, the model helped diagnose car engine problems from a phone camera and guided a surgeon through a complex procedure remotely.\n\nOpenAI CEO Sam Altman called GPT-5 "the first AI that can genuinely reason like a brilliant colleague." The model is rolling out to ChatGPT Plus users immediately, with API access opening next month.\n\nRivals Google DeepMind and Anthropic are expected to announce competitive updates within weeks, signalling that the AI race is entering its most intense phase yet.`,
    category: 'tech', featured: false, trending: true,
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
    tags: ['AI','OpenAI','GPT5','tech','ML']
  },
  {
    title: 'Budget 2025: Income Tax Relief for Middle Class',
    body: `Finance Minister Nirmala Sitharaman announced major income tax relief for the middle class in Union Budget 2025, raising the basic exemption limit to ₹5 lakh and introducing a new 10% slab for income between ₹5–10 lakh.\n\nThe new tax regime will save taxpayers earning ₹10 lakh annually approximately ₹25,000 per year. The standard deduction has also been raised from ₹50,000 to ₹75,000.\n\nOther key announcements include ₹11.11 lakh crore capital expenditure for infrastructure, increased allocation for MGNREGA, and a new scheme to provide interest-free loans to first-time homebuyers.\n\nThe fiscal deficit target has been set at 4.5% of GDP for 2025-26, down from 5.1% last year, showing the government's commitment to fiscal consolidation.\n\nMarkets reacted positively, with the Sensex rising 800 points and the Nifty crossing 23,500 in intraday trade on the day of the budget announcement.`,
    category: 'finance', featured: false, trending: false,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    tags: ['Budget 2025','income tax','India','finance','economy']
  },
  {
    title: 'Jio 6G Launch in India: What You Need to Know',
    body: `Reliance Jio has officially announced the commercial launch of its 6G network in India, starting with 10 major cities including Mumbai, Delhi, Bangalore, and Hyderabad. The rollout is set to reach 100 cities by the end of 2025.\n\nJio 6G promises peak download speeds of 100 Gbps—100 times faster than current 5G—with latency below 1 millisecond. The technology enables truly immersive AR/VR experiences, real-time holographic communication, and autonomous vehicle coordination.\n\nMukesh Ambani revealed that Jio has invested ₹2 lakh crore in building indigenous 6G infrastructure, making India only the second country after South Korea to deploy commercial 6G.\n\nConsumer plans start at ₹499/month for 100GB at 6G speeds, with unlimited plans at ₹999. Enterprise packages with dedicated bandwidth are priced separately.\n\nTelecom analysts called it a "quantum leap" for Indian digital infrastructure that would accelerate Industry 4.0 adoption across manufacturing, healthcare, and agriculture.`,
    category: 'tech', featured: false, trending: true,
    image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80',
    tags: ['Jio','6G','telecom','India','tech']
  },
  {
    title: 'Bollywood: Prabhas\'s Next Film Budget Crosses ₹600 Crore',
    body: `Prabhas's upcoming pan-India epic "Kalki 2898 AD - Part 2" has reportedly crossed a production budget of ₹600 crore, making it the most expensive Indian film ever made.\n\nDirected by Nag Ashwin, the film picks up from the massive cliffhanger ending of Part 1, which grossed ₹1,000 crore worldwide. The sequel features Deepika Padukone, Amitabh Bachchan, and Kamal Haasan reprising their roles, with a new addition in the form of a Hollywood A-lister whose name is being kept under wraps.\n\nThe production involves over 5,000 VFX shots and was filmed across locations in India, Iceland, and Morocco. The dystopian future world has been expanded significantly from Part 1.\n\nThe film is slated for a Diwali 2025 release in 5 languages simultaneously. Distributors are already reporting unprecedented advance booking interest from markets across India, the Middle East, and the USA.\n\nTrade analysts project the film to open to ₹150 crore+ on its opening day, potentially breaking all existing records.`,
    category: 'media', featured: false, trending: false,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    tags: ['Bollywood','Prabhas','Kalki','cinema','entertainment']
  },
  {
    title: 'G20 Summit 2025: Climate Deal Signed by All Members',
    body: `All 20 members of the G20 signed a landmark climate agreement at the 2025 summit in South Africa, committing to net-zero carbon emissions by 2045 — five years earlier than the previous target.\n\nThe agreement, dubbed the "Johannesburg Accord," includes a $2 trillion Green Climate Fund to help developing nations transition to renewable energy, binding emissions reduction targets reviewed every two years, and a first-ever carbon border tax mechanism.\n\nIndia played a pivotal role, securing a provision that allows developing nations to continue using natural gas as a transition fuel until 2035. Prime Minister Modi called it "a balanced deal that puts climate justice at its centre."\n\nEnvironmentalists have given the accord a cautious welcome. Greenpeace called it "the most ambitious climate agreement in history" but noted enforcement mechanisms remain weak.\n\nThe agreement must now be ratified by member nations' parliaments. Analysts expect most ratifications to be completed by early 2026.`,
    category: 'news', featured: false, trending: false,
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
    tags: ['G20','climate','environment','global','policy']
  },
  {
    title: 'GTA 6 Breaks All Records: 30 Million Copies in First Week',
    body: `Rockstar Games' Grand Theft Auto VI has shattered every record in entertainment history, selling 30 million copies in its first week across PlayStation 5, Xbox Series X/S, and PC, generating $3.2 billion in revenue—more than any film, album, or game launch ever.\n\nSet in a reimagined Vice City, GTA 6 follows protagonists Jason and Lucia across a living, breathing open world with a 120+ hour main storyline, a fully simulated economy where prices fluctuate based on player actions, and unprecedented NPC AI that gives every character a memory and routine.\n\nIGN awarded it a rare 10/10, calling it "a quantum leap that makes everything else look like a tech demo." Edge Magazine gave it their first 10/10 in 15 years.\n\nThe game's online mode, launching three weeks post-release, will add player-run businesses, heists for 32 players, and a creator mode. Analysts project GTA 6 to generate $10 billion in its first year.\n\nParent company Take-Two Interactive's stock surged 25% on launch day.`,
    category: 'gaming', featured: false, trending: true,
    image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&q=80',
    tags: ['GTA6','gaming','Rockstar','PS5','Xbox']
  },
  {
    title: 'Bali vs Kerala: The Ultimate Travel Comparison 2025',
    body: `Planning your 2025 getaway? Two destinations dominate every travel wishlist — the mystical island of Bali and the lush "God's Own Country" of Kerala. We break down which is right for you.\n\nBALI: The Indonesian island offers iconic rice terraces, ancient temples, world-class surf, and a vibrant nightlife that rivals Ibiza. Budget travellers can live like royalty for ₹3,000/day, while luxury seekers will find cliff-top infinity pool villas from ₹15,000/night. The best months are May–September. Visa-free for Indians up to 30 days.\n\nKERALA: India's southwestern gem delivers backwater houseboat journeys, Ayurvedic retreats, pristine beaches, and some of the country's best seafood. A houseboat stay on Alleppey's backwaters is genuinely unlike anything else in Asia. Budget: ₹2,000–₹4,000/day. Best visited October–March.\n\nVERDICT: Choose Bali for international flavour, beach parties, and Instagram moments. Choose Kerala for authentic Indian culture, wellness, and the most serene landscapes you'll find anywhere in the country.`,
    category: 'travel', featured: false, trending: false,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    tags: ['travel','Bali','Kerala','India','vacation']
  },
  {
    title: 'UPI Hits 20 Billion Transactions in a Single Month',
    body: `India's Unified Payments Interface (UPI) crossed the historic milestone of 20 billion transactions in a single month for the first time, the National Payments Corporation of India (NPCI) announced.\n\nThe figure represents a 45% year-on-year increase and cements UPI as the world's largest real-time digital payments network—processing more transactions daily than Visa and Mastercard combined.\n\nUPI is now accepted at merchant terminals in 15 countries including Singapore, France, UAE, UK, Mauritius, and Nepal. The RBI is in active negotiations to extend UPI's reach to 30 more countries by 2026.\n\nPhonePe leads with 48% market share, followed by Google Pay (37%) and Paytm (8%). New entrants like Jio Payments and WhatsApp Pay are gaining ground rapidly.\n\nFinance Minister Nirmala Sitharaman called the milestone "a testament to India's digital revolution that is now being exported to the world."`,
    category: 'latest', featured: false, trending: true,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    tags: ['UPI','fintech','India','payments','digital']
  },
  {
    title: 'Coldplay India Tour 2025: All You Need to Know',
    body: `British rock legends Coldplay have announced five additional India dates for their Music of the Spheres world tour, bringing the total to 8 shows across Mumbai, Delhi, Bangalore, and Ahmedabad in January–February 2025.\n\nThe announcement comes after the original Mumbai shows sold out in a record 11 minutes, crashing BookMyShow's servers and sparking a national conversation about India's concert infrastructure.\n\nTicket prices range from ₹1,999 for general admission to ₹35,000 for premium floor spots. Black market prices have reportedly reached ₹5 lakh for floor tickets.\n\nThe show features the band's full spheres production: LED wristbands distributed to every audience member, zero-single-use plastic policy, and the band's commitment to planting a tree for every ticket sold.\n\nThe Delhi show at the Narendra Modi Stadium will be the largest concert ever held in India, with a capacity of 1,32,000. Special train services and metro extensions have been announced for all venues.`,
    category: 'culture', featured: false, trending: false,
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    tags: ['Coldplay','concert','India','music','culture']
  },
  {
    title: 'ISRO\'s Gaganyaan Crew Safely Returns After 14 Days in Space',
    body: `India's historic Gaganyaan mission reached a triumphant conclusion as astronauts Prashanth Balakrishnan Nair, Ajit Krishnan, Angad Pratap, and Shubhanshu Shukla splashed down safely in the Bay of Bengal after 14 days aboard India's first crewed spacecraft.\n\nThe mission, which launched from Sriharikota on March 15, 2025, made India only the fourth country to independently send humans to space, joining Russia, the USA, and China.\n\nDuring the mission, the crew conducted 23 experiments covering microgravity effects on human biology, crop growth in space, and material science. The data collected is expected to advance both space science and terrestrial medicine.\n\nISRO Chairman S. Somnath called it "the proudest moment in Indian scientific history." Prime Minister Modi personally greeted the astronauts at the recovery site.\n\nISRO has announced Gaganyaan 2 will dock with an Indian space station planned for 2028, marking the next step in India's ambitious space programme.`,
    category: 'news', featured: true, trending: true,
    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&q=80',
    tags: ['ISRO','Gaganyaan','space','India','science']
  },
  {
    title: 'Virat Kohli Announces Retirement from T20 Internationals',
    body: `Virat Kohli announced his retirement from T20 International cricket, ending a legendary 16-year career in the shortest format of the game with 4,188 runs from 125 matches at an average of 52.35.\n\n"It has been the most thrilling ride of my life," Kohli said in an emotional statement. "But the time has come to make way for the next generation and focus on Test and ODI cricket, where I still have much to give."\n\nKohli retires as one of T20I cricket's greatest, holding the record for most fifties in the format and having played a pivotal role in India's 2007 and 2024 World Cup victories.\n\nBCCI President Roger Binny paid tribute: "Virat Kohli has been the heartbeat of Indian cricket for over a decade. His passion, intensity, and match-winning ability are irreplaceable."\n\nKohli, 36, has confirmed he will continue playing Test and ODI cricket and is targeting the 2027 ODI World Cup in India as a final hurrah before a full retirement.`,
    category: 'sports', featured: false, trending: false,
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80',
    tags: ['Kohli','cricket','T20','India','sports']
  }
];

for (const a of ARTICLES) {
  await Article.create({
    ...a,
    summary:    a.body.slice(0, 200),
    author:     admin._id,
    authorName: 'Channel Pro',
    views:      Math.floor(Math.random() * 15000) + 500,
    slug:       a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
  });
  process.stdout.write('.');
}

console.log(`\n🌱  Seeded ${ARTICLES.length} articles`);
console.log('✅  Done! → admin / admin123');
await mongoose.disconnect();
