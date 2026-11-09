import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const PRIMARY_ADMIN_EMAIL = 'info.safatravels.ksa@gmail.com';

async function seed() {
  console.log('Seeding initial Firestore publishedContent & CMS schema...');

  // 1. Published content snapshot for /publishedContent/home
  const publishedHome = {
    pageSlug: 'home',
    pageTitle: 'Orbit Digital — Full-Service Growth & Marketing Agency',
    metaDescription: 'Engineering growth engines across strategy, creative, search, media, and performance for ambitious global brands.',
    version: 1,
    publishedAt: new Date().toISOString(),
    publishedBy: PRIMARY_ADMIN_EMAIL,
    sections: {
      'sec-workshops': {
        sectionType: 'workshops',
        internalTitle: 'S.03 Maintenance Infrastructure & Workshops',
        order: 3,
        isVisible: true,
        content: {
          badgeCategory: '#WORKSHOPS',
          tabs: [
            {
              number: '01',
              title: 'Maintenance Infrastructure',
              description:
                "At our company, maintenance is not just an operational function, it's a strategic commitment to safety, mechanical availability, and equipment reliability across every project. Our comprehensive approach integrates preventive and corrective maintenance, life cycle-based component replacements, major repairs, and rebuilds, all aimed at maximizing performance and minimizing downtime.",
              image: 'assets/workshops/tab1_technicians_full.jpg',
            },
            {
              number: '02',
              title: 'Central service workshop',
              description:
                'Our central facility is equipped to carry out complete overhauls, major repairs, and life cycle-driven component change-outs. Using advanced diagnostics and OEM-certified parts, we restore equipment to peak efficiency, ensuring the highest standards of safety, quality, and durability.',
              image: 'assets/workshops/tab2_crane_workshop.jpg',
            },
            {
              number: '03',
              title: 'On-Site service workshops',
              description:
                'Each of our project sites features a fully equipped on-site workshop for scheduled maintenance, daily inspections, and rapid response to mechanical issues. This decentralized model allows us to maintain high levels of operational availability and ensure continuous operations across all shifts. Our commitment to maintenance excellence is a core part of the high-quality service we deliver to our clients.',
              image: 'assets/workshops/tab3_safety_auditor.jpg',
            },
          ],
        },
      },
      'sec-innovation': {
        sectionType: 'innovation',
        internalTitle: 'S.02 Brand Image in the Service of Innovation',
        order: 2,
        isVisible: true,
        content: {
          headline: 'Brand image in the service of innovation',
          description:
            'For over ten years, we have been supporting innovation stakeholders and B2B clients in building their brand identity. Our understanding of these economic ecosystems guides the structuring of our offerings and allows us to deliver comprehensive and functional solutions.',
          sectors: ['AI', 'Marketing', 'Automation', 'Growth', 'Professional tools'],
          labels: ['SaaS', 'Start-up', 'Agencies', 'Purpose-driven companies'],
        },
      },
    },
  };

  // Write published snapshot
  await setDoc(doc(db, 'publishedContent', 'home'), publishedHome);
  console.log('✓ Successfully seeded /publishedContent/home in Cloud Firestore!');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
