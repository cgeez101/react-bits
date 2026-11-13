/* Every page on the site. Each is its own "station" with a frequency on the dial.
   The id is the link: farmradio…#markets opens the market board. */
export const PAGES = [
  { id: 'live', label: 'On air', group: 'Studio', freq: '88.2', blurb: "What's on now, up next and this hour" },
  { id: 'markets', label: 'Market board', group: 'The desk', freq: '90.4', blurb: 'Live SAFEX and livestock prices' },
  { id: 'weather', label: 'Weather', group: 'The desk', freq: '91.6', blurb: 'Your area, spray windows and alerts' },
  { id: 'wire', label: 'Agri wire', group: 'The desk', freq: '92.8', blurb: 'Breaking agri news and the tariff story' },
  { id: 'sport', label: 'Sport', group: 'The desk', freq: '93.5', blurb: 'Boks, Proteas and Bafana' },
  { id: 'pulse', label: 'Topic pulse', group: 'The desk', freq: '94.1', blurb: 'What farmers are talking about online' },
  { id: 'feed', label: 'The feed', group: 'Listen', freq: '95.7', blurb: 'Live, up next and on demand' },
  { id: 'vote', label: 'Song vote', group: 'Listen', freq: '97.4', blurb: 'Pick the next song we play' },
  { id: 'voice', label: 'Your voice', group: 'Community', freq: '99.9', blurb: 'Voice notes and the farm album' },
  { id: 'team', label: 'Presenters', group: 'Community', freq: '101.3', blurb: 'The on-air team' },
  { id: 'brands', label: 'Brand series', group: 'Business', freq: '102.5', blurb: 'Shows made with farming brands' },
  { id: 'partners', label: 'Partners', group: 'Business', freq: '105.3', blurb: 'Our partners and advertising' }
];
export const GROUPS = [...new Set(PAGES.map(p => p.group))];
export const pageById = id => PAGES.find(p => p.id === id) || PAGES[0];
export const currentPageId = () => {
  const h = (typeof location !== 'undefined' ? location.hash : '').replace('#', '');
  return PAGES.some(p => p.id === h) ? h : 'live';
};
