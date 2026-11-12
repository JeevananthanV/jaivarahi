export const DEFAULT_NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  {
    label: 'Ubasana',
    href: '#',
    children: [
      { label: 'Varahi Malai', href: '/varahimalai' },
      { label: 'Who is varahi ?', href: '/who_is_varahi' },
      { label: 'Uchchishta Ganapati', href: '/Uchchishta_Ganapati' },
      { label: 'Sri Bala manthiram', href: '/sri_bala_manthiram' },
    ],
  },
  {
    label: 'Kosala',
    href: '/kosala',
    children: [
      { label: 'Kosala Donation', href: '/kosala' },
      { label: 'Donation Archive', href: '/kosala/archive' },
    ],
  },
  {
    label: 'Jothidam',
    href: '#',
    children: [
      { label: 'Astrology prediction', href: '/Jothidam' },
      { label: 'Sri Varahi Jothida Vidyalayam', href: '/comingsoon' },
    ],
  },
  {
    label: 'Events',
    href: '#',
    children: [
      { label: 'Asta Varahi Dharshanam', href: '/astavarahi' },
      { label: 'Asta Varahi 2.0', href: '/astavarahi2' },
      { label: 'Ashada Navarathiri', href: '/ashada_navarathiri' },
    ],
  },
  { label: 'Blog', href: '/blog' },
  { label: 'Latest Updates', href: '/comingsoon' },
];

export default DEFAULT_NAV_ITEMS;
