export interface WorkshopTabItem {
  id: string;
  number: string;
  badgeIndex: string;
  badgeCategory: string;
  title: string;
  description: string;
  layout: 'split' | 'single';
  stat: {
    value: string;
    label: string;
  };
  tags: string[];
  images: {
    top?: string;
    bottom?: string;
    single?: string;
    altTop?: string;
    altBottom?: string;
    altSingle?: string;
  };
}

export const WORKSHOP_TABS: WorkshopTabItem[] = [
  {
    id: 'tab-01',
    number: '01',
    badgeIndex: '1 / 03',
    badgeCategory: '#WORKSHOPS',
    title: 'Maintenance Infrastructure',
    description:
      "At our company, maintenance is not just an operational function, it's a strategic commitment to safety, mechanical availability, and equipment reliability across every project. Our comprehensive approach integrates preventive and corrective maintenance, life cycle-based component replacements, major repairs, and rebuilds, all aimed at maximizing performance and minimizing downtime.",
    layout: 'split',
    stat: {
      value: '99.4%',
      label: 'Fleet Availability Rate',
    },
    tags: ['Preventive Protocols', 'OEM Diagnostics', 'Component Lifecycle'],
    images: {
      top: '/assets/workshops/tab1_technicians.jpg',
      bottom: '/assets/workshops/tab1_facility.jpg',
      altTop: 'Certified technicians performing heavy machinery maintenance in industrial facility',
      altBottom: 'Central maintenance workshop floor with specialized heavy machinery equipment',
    },
  },
  {
    id: 'tab-02',
    number: '02',
    badgeIndex: '2 / 03',
    badgeCategory: '#WORKSHOPS',
    title: 'Central service workshop',
    description:
      'Our central facility is equipped to carry out complete overhauls, major repairs, and life cycle-driven component change-outs. Using advanced diagnostics and OEM-certified parts, we restore equipment to peak efficiency, ensuring the highest standards of safety, quality, and durability.',
    layout: 'single',
    stat: {
      value: '10,000 kg',
      label: 'Bridge Crane Capacity',
    },
    tags: ['Full Overhauls', 'Component Rebuilds', 'Certified Re-power'],
    images: {
      single: '/assets/workshops/tab2_crane_workshop.jpg',
      altSingle: 'Central service workshop main hall equipped with 10000kg overhead bridge crane',
    },
  },
  {
    id: 'tab-03',
    number: '03',
    badgeIndex: '3 / 03',
    badgeCategory: '#WORKSHOPS',
    title: 'On-Site service workshops',
    description:
      'Each of our project sites features a fully equipped on-site workshop for scheduled maintenance, daily inspections, and rapid response to mechanical issues. This decentralized model allows us to maintain high levels of operational availability and ensure continuous operations across all shifts. Our commitment to maintenance excellence is a core part of the high-quality service we deliver to our clients.',
    layout: 'single',
    stat: {
      value: '24 / 7',
      label: 'Continuous Shift Readiness',
    },
    tags: ['Field Dispatch', 'Real-time Telemetry', 'Rapid Response'],
    images: {
      single: '/assets/workshops/tab3_safety_auditor.jpg',
      altSingle: 'Field safety engineer in protective equipment and respirator conducting technical audits',
    },
  },
];
