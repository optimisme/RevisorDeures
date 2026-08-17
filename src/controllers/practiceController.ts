import { Request, Response } from 'express';

export const submitPracticeHandler = async (req: Request, res: Response) => {
  res.json({ message: 'Submit practice endpoint' });
};
