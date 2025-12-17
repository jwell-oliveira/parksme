import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { sheetId, format = 'csv' } = req.query;

  if (!sheetId) {
    return res.status(400).json({ error: 'sheetId é obrigatório' });
  }

  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=${format}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Google Sheets retornou ${response.status}` 
      });
    }

    const buffer = await response.arrayBuffer();
    
    // Set appropriate content type
    const contentType = format === 'csv' 
      ? 'text/csv' 
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(buffer));
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ error: errorMsg });
  }
}
