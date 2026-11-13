/* ------------------------------------------------------------------
   FARM RADIO showcase: all content in one place.
   Everything here is demo data. Edit freely: names, prices, shows,
   sponsors and copy all flow through to the page.
   ------------------------------------------------------------------ */
import schedule from './schedule.json';

const img = name => new URL(`./assets/${name}.webp`, import.meta.url).href;

export const STATION = {
  name: 'FARM RADIO',
  hourStart: 16, // the simulated live hour runs 16:00 – 17:00
  startMinute: 17.25, // where the demo starts: just after the beef-tariff story breaks
  speed: 12, // 1 real second = 12 seconds on air (a full hour plays in 5 minutes)
  roomCount: 212
};

export const PRESENTERS = {
  AL: { name: 'Isabel', role: 'Farm Desk', img: img('p-isabel') },
  JvM: { name: 'Johnny', role: 'Commodities & Markets', img: img('p-johnny') },
  GT: { name: 'Amore', role: 'Weather & Climate', img: img('p-amore') },
  PM: { name: 'Pieter', role: 'Policy & Debate', img: img('p-pieter') },
  GvN: { name: 'Gerben', role: 'Community & Music', img: img('p-gerben') },
  CH: { name: 'Christie', role: 'Field Reporter & News', img: img('p-christie') }
};
export const PRESENTER_ORDER = ['AL', 'JvM', 'GT', 'PM', 'GvN', 'CH'];

/* audience-facing channels (each groups production strands) */
export const CHANNELS = {
  news: { name: 'Breaking & Headlines', short: 'Breaking', cats: ['BRK'] },
  mkt: { name: 'Markets & Prices', short: 'Markets', cats: ['PRC'] },
  wx: { name: 'Weather & Climate', short: 'Weather', cats: ['WX'] },
  voices: { name: 'Farmer Voices', short: 'Voices', cats: ['INT', 'UGC', 'OPN'] },
  policy: { name: 'Policy & Your Rights', short: 'Policy', cats: ['POL'] },
  learn: { name: 'Learn & Grow', short: 'Learn', cats: ['KNOW', 'IND', 'EDI'] },
  near: { name: 'Near You', short: 'Near you', cats: ['LAI'] },
  music: { name: 'Music & Requests', short: 'Music', cats: ['MUS', 'LDR'] },
  social: { name: 'Trending Now', short: 'Trending', cats: ['SOC'] },
  pods: { name: 'Podcasts', short: 'Podcasts', cats: ['POD'] },
  brands: { name: 'Brand Experiences', short: 'Brands', cats: ['BX', 'ADV'] },
  unions: { name: 'Unions & Associations', short: 'Unions', cats: [] }
};
const chanOf = c => Object.keys(CHANNELS).find(k => CHANNELS[k].cats.includes(c)) || 'news';

export const FILTERS = [
  ['all', 'All'],
  ['news', 'Breaking'],
  ['mkt', 'Markets'],
  ['wx', 'Weather'],
  ['voices,unions', 'Farmer voices'],
  ['learn,policy,near', 'Learn & grow'],
  ['music,social', 'Music & trending'],
  ['pods,brands', 'Podcasts & brands']
];

/* production notes → listener-facing subtitles */
const SUB = {
  'Live data feed, auto-updating': "Today's closing prices, explained",
  'Hyper-local, by postcode area': "Your area's forecast for this evening",
  'Guest interview + clips posted to feed': 'Meet the young farmer winning online',
  'App uploads read out + posted to feed': "The crazier your agri stories, the more we love 'em",
  'Music & infotainment': 'Plus the drive-time quiz',
  'Developing story - live thread opened': 'Developing story',
  'Data feed + auction mart reporters': 'Reaction from auction marts around the country',
  'Localised by listener location data': 'What it means for marts near you',
  'Practical how-to + checklist on demand': 'Practical tips, plus a checklist to download',
  'Thread update - what was said': 'What the government said',
  'Opinion, debate & advocacy': 'Call in and have your say',
  'Social reaction read live on air': 'What farmers are saying online',
  'Branded experiential - series on demand': 'Brand experience series',
  'Sponsored experiential programming': 'Sponsored feature',
  'Clip on air, full episode on demand': 'Full episode on demand',
  'Thread update - closing prices': 'Closing prices',
  'Agri industry editorial': 'Opinion from the FARM RADIO desk',
  'Winner of the afternoon app vote': 'You voted, we play it',
  'Thread update - advice from vets': 'Advice from vets',
  'Sponsored experiential audio tour': 'Sponsored audio tour',
  'Auto-triggered by the market data feed': 'Grain futures move sharply',
  'Trailer on air, full episode on demand': 'Full episode on demand',
  'Thread update - live from the field': 'Live from the field',
  'Model update pushes timings forward': 'Rain is now expected earlier'
};
const TITLE = {
  'Topic Pulse: #BeefTariff Trending': 'Trending: #BeefTariff',
  'Topic Pulse: Social Reaction to the Debate': 'Trending: Social Reaction to the Debate'
};

function prep(s, i) {
  const o = { ...s, id: i, u: SUB[s.u] || s.u, t: TITLE[s.t] || s.t, ch: chanOf(s.c) };
  if (/RPO|Unions|Association/i.test(s.t)) o.ch = 'unions';
  if (/RPO Responds/i.test(s.t)) Object.assign(o, { video: 'rpo', p: ['CH'], u: 'Live video: Christie talks to Frikkie Mare of the RPO' });
  if (/^TELKOM Agritech/i.test(s.t)) Object.assign(o, { video: 'telkom', p: ['PM'], u: 'Live video interview with Hasnain Motlekar, CEO of Telkom BCX' });
  if (/^Policy Watch/i.test(s.t) && /AGRI SA/i.test(s.t)) Object.assign(o, { ch: 'unions', video: 'agrisa', p: ['GvN'], u: 'Live video interview with Johan Kotze of AGRI SA' });
  if (/AGRI EXPO/i.test(s.t)) Object.assign(o, { video: 'agriexpo', p: ['GT'], u: 'Video interview with Chris Fourie of Agri Expo' });
  return o;
}

/* the hour on air. Ad breaks ("STOP") drive timing; listeners never see them */
export const SEGMENTS = schedule.afternoon.map(prep);
export const MORNING = schedule.morning.map((s, i) => prep(s, 100 + i)).filter(s => s.c !== 'STOP');
export const isAd = s => s.c === 'STOP';

export const VIDEOS = {
  rpo: { img: img('v-rpo'), host: 'Christie', title: 'RPO Responds: Livestock Priorities', desc: "Christie talks to Frikkie Mare of the RPO about the beef tariff and the RPO's priorities for South Africa's livestock sector." },
  telkom: { img: img('v-telkom'), host: 'Pieter', title: 'TELKOM Agritech: Digital Solutions for SA Agriculture', desc: 'Pieter talks to Hasnain Motlekar, CEO of Telkom BCX, about digital solutions for South African agriculture.' },
  agrisa: { img: img('v-agrisa'), host: 'Gerben', title: 'Policy Watch: AGRI SA', desc: 'Gerben talks to Johan Kotze of AGRI SA about the new farm diversification planning rules.' },
  agriexpo: { img: img('v-agriexpo'), host: 'Amore', title: 'Agri Expo: Who Really Sets the Milk Price?', desc: 'Amore talks to Chris Fourie of Agri Expo about who really sets the milk price, live from the dairy.' }
};

/* ---------- markets ---------- */
/* [name, prefix, unit, opening value, decimals] */
export const PRICES = [
  ['Beef (A2)', 'R', '/kg', 64.5, 2],
  ['Wheat (SAFEX)', 'R', '/t', 5450, 0],
  ['Milk', 'R', '/l', 7.2, 2],
  ['Lamb (A2)', 'R', '/kg', 118.0, 2],
  ['Yellow maize (SAFEX)', 'R', '/t', 4120, 0],
  ['White maize (SAFEX)', 'R', '/t', 4385, 0],
  ['Soybeans (SAFEX)', 'R', '/t', 8240, 0],
  ['Sunflower (SAFEX)', 'R', '/t', 9150, 0]
];
/* story-driven moves: [price index, total move, minute it lands]. Beef reacts to the tariff news */
export const MOVES = [
  [0, -4.5, 17.5],
  [0, -1.2, 47.5]
];

/* ---------- weather (changes through the hour) ---------- */
export const weatherAt = minute => {
  const f = minute / 60;
  return {
    temp: Math.round(24 - 5 * f),
    summary: 'Clear, cooling',
    fieldAccess: 'Good',
    rain: Math.round(20 - 10 * f),
    wind: Math.round(15 - 7 * f),
    low: minute >= 58 ? 6 : 9,
    spray: '05:00–09:00',
    tomorrow: '27°C, sunny',
    alert: 'Wind alert tonight: secure loose material and check stock water'
  };
};

/* ---------- news, trends, sport ---------- */
export const TRENDS = [
  ['#BeefTariff', 'Export tariff hits beef trade: reaction live on FARM RADIO now', true],
  ['#ElNiño', 'Dept of Agriculture: El Niño to bring a drier, hotter summer. Plan for dry spells'],
  ['#RecordMaize', '2025/26 maize crop confirmed as the biggest on record'],
  ['#FMD', 'Foot-and-mouth vaccination continues; movement permits still required'],
  ['#WheatCrop', 'Winter wheat harvest estimate is the lowest in eight years'],
  ['#DieselPrice', 'Diesel at record pump prices squeezes planting budgets']
];

export const SPORT = [
  ['Rugby', '9 Nov', 'Boks open the Northern Series in style: 45-0 up at half-time against Italy, nine tries in all'],
  ['Rugby', 'Friday', 'Next up for the Springboks: France at the Stade de France'],
  ['Cricket', 'Today', 'Proteas assemble in Johannesburg for the Bangladesh Tests. First Test at the Wanderers from 15 Nov'],
  ['Cricket', '1 Nov', 'Proteas fight back to beat Australia 2-1 in the Test series after losing the opener'],
  ['Cricket', '2 Nov', 'Nortje returns, De Zorzi and Hamza recalled in the Proteas squad for Bangladesh'],
  ['Football', 'Oct', 'Bafana make it three wins from three under new coach Pitso Mosimane']
];

export const CHAT = [
  ['Boer_Hennie', 'agri', 'Beef tariff news is a punch in the gut. Hold the weaners back a week?'],
  ['Thandi_M', 'news', 'RPO interview was spot on. Hope Pretoria is listening.'],
  ['KarooKoos', 'sport', "Boks vs France on Friday, who's braaing where?"],
  ['Lizelle.vd.Berg', 'lifestyle', 'Rusks are in the oven, farm kitchen smells like heaven'],
  ['Sipho_Grain', 'agri', 'Planted 40% of the maize, waiting for that rain they promised.'],
  ['OomJan', 'agri', 'Diesel price is killing us this season. Anyone tried a fuel co-op?'],
  ['Marike_FS', 'sport', 'Proteas at the Wanderers on the 15th, taking the kids'],
  ['DairyDave', 'agri', 'Milk price up 2c here. Small mercies.'],
  ['Nomsa_Agri', 'news', 'Is the FMD permit still needed for moving calves to the sale? Asking for my dad'],
  ['Pieter_Wessels', 'agri', '@Nomsa_Agri yes, still needed in our area. Phone your state vet first.'],
  ['VrystaatVroue', 'lifestyle', "Who's going to the Agri Expo next month? Let's meet up!"],
  ['Hanno_Sheep', 'agri', "Wie's bang vir skaapkop? Not me, made potjie last night"],
  ['LwaziMbeki', 'sport', 'Bafana three from three under Pitso. Feels good to say that'],
  ['Annatjie', 'lifestyle', 'Rain dance at 5pm, everyone welcome'],
  ['Gerrit_Boer', 'agri', 'Wind alert tonight, strapping down the tunnels now'],
  ['Kobus_Wine', 'agri', 'Grape set looks good in the Breede valley this year'],
  ['Mpho_Cattle', 'news', 'Tariff update 2 just in, markets closing lower'],
  ['Riaan.R', 'sport', 'Nine tries against Italy! Rassie se manne is reg'],
  ['FarmMomZoe', 'lifestyle', 'Kids want a pet lamb. Send help.'],
  ['Jaco_Drone', 'agri', 'Drone spraying approved, finally. Saves my back and my diesel']
];

/* ---------- earlier today (on demand) ---------- */
export const EARLIER = [
  ['voices', '07:33', 'THE DEBATE: Rewilding vs Food Security', 'Studio panel + listener call-ins'],
  ['news', '07:17', 'Flood Warning for Low-Lying Farmland', 'The full story: warning + 2 updates'],
  ['wx', '07:02', 'Field Forecast: Spray Windows & Frost Risk', "This morning's forecast for your area"],
  ['brands', '07:23', 'FNB Insurance', 'Brand experience · full episode'],
  ['pods', '07:44', "Podcast Drop: 'Next Gen Farmers'", 'Full episode on demand'],
  ['learn', '07:47', 'Who Really Sets the Milk Price? - AGRI EXPO', 'Opinion from the FARM RADIO desk', 'agriexpo']
];

/* ---------- music vote: [song, artist, base share %, cover] ---------- */
export const TRACKS = [
  ['Kokomo', 'Dr. Brazil', 16, img('tr-kokomo')],
  ['Meisie meisie', 'Kurt Darren & Zaan Sonnekus', 14, img('tr-meisie')],
  ['Ou dae', 'Brendan Peyper', 12, img('tr-oudae')],
  ['Miracle', 'Booshle G', 11, img('tr-miracle')],
  ['Save me tonight', 'Jennifer Lopez & David Guetta', 10, img('tr-saveme')],
  ['Ek val', 'Die Piesangskille', 9, img('tr-ekval')],
  ['Al wat ek wil hê', 'Leah', 8, img('tr-alwat')],
  ['Jy sallie', 'Appel & Ichnus', 8, img('tr-jysallie')],
  ['Rain on me', 'Blackbyrd', 7, img('tr-rainonme')],
  ['Wela-Kapela', 'Fatman', 5, img('tr-wela')]
];

/* ---------- brand series: [brand, show, slot, status: live | next | od] ---------- */
export const BRANDS = [
  ['TELKOM Agritech', 'Connected Farm: tech that works in the field', 'Live at 16:36 · series on demand', 'live'],
  ['FNB Insurance', 'Cover for the Unexpected: farm risk stories', 'Weekdays 07:23 · on demand', 'od'],
  ['WH Auctions', 'Live from the Auction Yard: trucks, tractors & equipment', 'Thursdays 10:00 · live and online', 'next'],
  ['Nutrifeeds', 'Feed for Thought: livestock nutrition masterclass', 'Tuesdays 06:40 · on demand', 'od'],
  ['VKB Group', 'From Silo to Market: the grain week ahead', 'Mondays 17:15 · on demand', 'od'],
  ['John Deere', 'Field Tech Tuesday: precision farming in practice', 'Tuesdays 12:30 · on demand', 'od'],
  ['NWK Group', 'Platteland Business Hour: inputs, finance & grain', 'Wednesdays 16:45 · on demand', 'od'],
  ['Corteva Agriscience', 'Seed Selection Clinic: planting for an El Niño season', 'Fridays 07:10 · on demand', 'od'],
  ['Microsoft', 'Digital Farming: AI and data tools for the farm office', 'Thursdays 08:15 · on demand', 'od']
];

/* ---------- partners: [brand, line, wallpaper] ---------- */
export const SPONSORS = [
  ['TOYOTA', 'The new Hilux Travo Overland: tough enough for the farm road, smart enough for the city.', img('sp-toyota')],
  ['TELKOM', 'Smart AgriTech for South Africa: food security, smarter water management and homegrown solutions.', img('sp-telkom')],
  ['FNB', 'Your farming friend in banking. Agricultural banking from people who understand the land.', img('sp-fnb')],
  ['SYNGENTA', 'Bringing plant potential to life: seeds, crop protection and digital agronomy.', img('sp-syngenta')],
  ['CASE IH', 'Prime −8% finance for faster ownership. Finance that works as hard as you do. T&Cs apply.', img('sp-caseih')],
  ['SAMSUNG', 'Galaxy S25 Series with Galaxy AI. Your farm, in your pocket. Ts & Cs apply.', img('sp-samsung')],
  ['GRAIN SA', "The voice of South Africa's grain producers, standing with our grain farmers.", img('sp-grainsa')],
  ['WH AUCTIONS', 'Online auctions on whauctions.com: winery equipment, tanks and trucks. Register now and bid online.', img('sp-whauctions')]
];
export const PRESENTING = { brand: 'TOYOTA', line: 'The new Hilux Travo Overland', sub: 'Tough enough for the farm road. Smart enough for the city.' };

export const ALBUM_IMG = img('album-bg');
export const AUDIO_SRC = new URL('./assets/live-audio.mp3', import.meta.url).href;

/* ---------- weather outlook: [day, summary, high °C, low °C, rain %, wind km/h] ---------- */
export const OUTLOOK = [
  ['Fri', 'Sunny', 27, 9, 5, 12],
  ['Sat', 'Hot, light breeze', 31, 13, 10, 14],
  ['Sun', 'Afternoon storms', 26, 15, 60, 22],
  ['Mon', 'Cloud clearing', 24, 12, 25, 18],
  ['Tue', 'Sunny', 28, 11, 5, 10]
];
/* field planner: [task, verdict, detail, good?] */
export const PLANNER = [
  ['Spraying', 'Go tomorrow', '05:00–09:00, before the wind picks up', true],
  ['Planting', 'Hold', 'Wait for Sunday’s storms to soak in', false],
  ['Hay cutting', 'Go', 'Dry until Saturday evening', true],
  ['Frost risk', 'Low', 'Overnight lows stay above 6°C', true]
];

/* ---------- sport fixtures: [sport, when, match, where] ---------- */
export const FIXTURES = [
  ['Rugby', 'Fri 14 Nov · 22:10', 'France v Springboks', 'Stade de France, Paris'],
  ['Cricket', 'From Sat 15 Nov', 'Proteas v Bangladesh, 1st Test', 'Wanderers, Johannesburg'],
  ['Football', 'Tue 18 Nov', 'Bafana Bafana friendly', 'FNB Stadium']
];
