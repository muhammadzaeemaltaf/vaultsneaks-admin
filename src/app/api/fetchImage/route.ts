
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  if (!imageUrl) {
    return new Response('No url provided', { status: 400 });
  }

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const headers = new Headers({
      'Content-Type': 'image/jpeg',
      'Access-Control-Allow-Origin': '*',
    });
    return new Response(response.data, { headers });
  } catch (error) {
    return new Response('Error fetching image', { status: 500 });
  }
}