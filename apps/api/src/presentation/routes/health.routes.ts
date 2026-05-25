import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

export { router as healthRouter };
