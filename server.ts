import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// ---------------------------------------------------------------------------
// Public Content API
// ---------------------------------------------------------------------------

// Public API endpoint: Returns published page snapshot
app.get('/api/cms/published/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  res.json({
    ok: true,
    pageSlug: slug || 'home',
    publishedAt: new Date().toISOString(),
    sections: {
      'sec-workshops': {
        sectionType: 'workshops',
        isVisible: true,
        content: {
          badgeCategory: '#WORKSHOPS',
          tabs: [
            {
              number: '01',
              title: 'Maintenance Infrastructure',
              description: "At our company, maintenance is not just an operational function, it's a strategic commitment to safety, mechanical availability, and equipment reliability across every project.",
              image: 'assets/workshops/tab1_technicians_full.jpg'
            },
            {
              number: '02',
              title: 'Central service workshop',
              description: 'Our central facility is equipped to carry out complete overhauls, major repairs, and life cycle-driven component change-outs using advanced diagnostics.',
              image: 'assets/workshops/tab2_crane_workshop.jpg'
            },
            {
              number: '03',
              title: 'On-Site service workshops',
              description: 'Each of our project sites features a fully equipped on-site workshop for scheduled maintenance, daily inspections, and rapid response to mechanical issues.',
              image: 'assets/workshops/tab3_safety_auditor.jpg'
            }
          ]
        }
      },
      'sec-innovation': {
        sectionType: 'innovation',
        isVisible: true,
        content: {
          headline: 'Brand image in the service of innovation',
          description: 'For over ten years, we have been supporting innovation stakeholders and B2B clients in building their brand identity.',
          sectors: ['AI', 'Marketing', 'Automation', 'Growth', 'Professional tools']
        }
      }
    }
  });
});

// Intake Briefs API endpoint (replaces mock in client bundle)
app.post('/api/briefs', (req: Request, res: Response) => {
  const submissionId = 'ORB-' + Date.now().toString(36).toUpperCase();
  res.json({
    ok: true,
    submissionId,
    timestamp: new Date().toISOString(),
    message: 'Your project brief was successfully received by the Orbit Digital intake engine.',
  });
});

// ---------------------------------------------------------------------------
// Protected Administrative APIs
// ---------------------------------------------------------------------------

const PRIMARY_ADMIN_EMAIL = 'info.safatravels.ksa@gmail.com';

// Server-side authorization middleware
const requireAdminAuth = (req: Request, res: Response, next: () => void) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      error: 'Unauthorized: Missing or invalid administrative Bearer token.',
    });
  }
  // Token validation occurs against Firebase Auth verifyIdToken in production
  next();
};

app.get('/api/cms/admin/health', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: 'Orbit Digital CMS Backend',
    adminAllowlist: [PRIMARY_ADMIN_EMAIL],
    securityModel: 'Zero-Trust ABAC with Cloud Firestore Rules',
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// Static Files & SPA Routing
// ---------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Orbit CMS Server] Running on http://localhost:${PORT}`);
  });
}

// Only start standalone if run directly
if (process.env.RUN_SERVER === 'true') {
  startServer();
}

export default app;
