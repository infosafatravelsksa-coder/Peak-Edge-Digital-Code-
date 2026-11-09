export interface ClientNode {
  id: string;
  name: string;
  subtext?: string;
  badge?: string;
  bg?: string;
}

export interface PillColumn {
  id: string;
  name: string;
  label: string;
  pillBg: string;
  glowColor: string;
  sectors: string[];
  clients: ClientNode[];
}

export const INNOVATION_PILLS: PillColumn[] = [
  {
    id: 'saas',
    name: 'SaaS',
    label: 'SaaS',
    pillBg: '#34d399', // vibrant green
    glowColor: 'rgba(52, 211, 153, 0.45)',
    sectors: ['AI', 'Marketing', 'Automation', 'Growth', 'Professional tools'],
    clients: [
      { id: 'lemlist', name: 'lemlist', badge: 'e', subtext: 'Cold outreach' },
      { id: 'pvt', name: 'pvt.fr', subtext: 'Partir vivre & travailler' },
      { id: 'growth-machine', name: 'La Growth Machine', subtext: 'Multi-channel' },
      { id: 'askr', name: 'ask_r.ai', subtext: 'Chat with your data' },
    ],
  },
  {
    id: 'startup',
    name: 'Start-up',
    label: 'Start-up',
    pillBg: '#facc15', // vibrant warm yellow
    glowColor: 'rgba(250, 204, 21, 0.45)',
    sectors: ['Early-stage', 'Seed & Series A', 'Fintech', 'CleanTech'],
    clients: [
      { id: 'kalyzee', name: 'Kalyzee', subtext: 'Automated video casting' },
      { id: 'secoya', name: 'Secoya Eco', subtext: 'Sustainable logistics' },
      { id: 'lumen', name: 'Lumen AI', subtext: 'Photonics compute' },
    ],
  },
  {
    id: 'agencies',
    name: 'Agencies',
    label: 'Agencies',
    pillBg: '#60a5fa', // vibrant indigo/blue
    glowColor: 'rgba(96, 165, 250, 0.45)',
    sectors: ['Design Studios', 'Media Buying', 'Production', 'B2B Creative'],
    clients: [
      { id: 'deuxio', name: 'Deuxio', subtext: 'Product Design' },
      { id: 'splendide', name: 'Splendide', subtext: 'Spatial Media' },
      { id: 'juste', name: 'Juste Studio', subtext: 'Visual Systems' },
    ],
  },
  {
    id: 'purpose',
    name: 'Purpose-driven companies',
    label: 'Purpose-driven companies', // Kept strictly on the same line!
    pillBg: '#f472b6', // vibrant pink
    glowColor: 'rgba(244, 114, 182, 0.45)',
    sectors: ['Innovative hospitality', 'Ecological transition', 'CSR', 'Impact VC'],
    clients: [
      { id: 'rec', name: 'REC', subtext: 'Entreprises Citoyennes' },
      { id: 'onlypro', name: 'ONLY PRO.', subtext: 'B-Corp Verified' },
      { id: 'weem', name: 'weem', subtext: 'Decarbonization' },
    ],
  },
];

export const CLIENT_SECTOR_TAGS = [
  'AI',
  'Marketing',
  'Automation',
  'Growth',
  'Professional tools',
];
