import { getAnalysisRecord } from '../../server/database/storage.js';

export default async function handler(req: any, res: any) {
  const { id } = req.query;
  const requestingUserId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || undefined;

  try {
    const record = await getAnalysisRecord(id as string, requestingUserId);
    if (!record) {
      return res.status(404).json({ error: 'Analysis record not found.' });
    }
    return res.status(200).json(record);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized or record error.';
    return res.status(403).json({ error: message });
  }
}
