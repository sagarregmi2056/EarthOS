import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// API route for listing all pollution data points
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const timeRange = searchParams.get('timeRange');
  const minPm25 = searchParams.get('minPm25');
  const maxPm25 = searchParams.get('maxPm25');
  const source = searchParams.get('source');
  
  try {
    // In a real app, you would connect to your backend
    // For now, we'll return mock data
    const mockData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [85.3240, 27.7172] },
          properties: { pm25: 178, source: 'user', id: '1' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [77.2090, 28.6139] },
          properties: { pm25: 210, source: 'satellite', id: '2' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [121.4737, 31.2304] },
          properties: { pm25: 156, source: 'sensor', id: '3' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [139.6917, 35.6895] },
          properties: { pm25: 42, source: 'sensor', id: '4' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [2.3522, 48.8566] },
          properties: { pm25: 28, source: 'sensor', id: '5' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-74.0060, 40.7128] },
          properties: { pm25: 35, source: 'sensor', id: '6' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [37.6173, 55.7558] },
          properties: { pm25: 68, source: 'satellite', id: '7' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-43.1729, -22.9068] },
          properties: { pm25: 89, source: 'user', id: '8' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [18.4241, -33.9249] },
          properties: { pm25: 25, source: 'sensor', id: '9' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [151.2093, -33.8688] },
          properties: { pm25: 15, source: 'sensor', id: '10' }
        }
      ]
    };
    
    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error fetching pollution data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pollution data' },
      { status: 500 }
    );
  }
}

// API route for submitting new pollution data
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.latitude || !body.longitude || !body.pm25) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // In a real app, we would send this to our backend
    // For now, we'll just mock a successful response
    
    // POST to backend API (commented out for MVP)
    // const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    // await axios.post(`${backendUrl}/api/pollution`, body);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Pollution data submitted successfully',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [parseFloat(body.longitude), parseFloat(body.latitude)]
          },
          properties: {
            pm25: parseFloat(body.pm25),
            source: body.source || 'user',
            id: Date.now().toString()
          }
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting pollution data:', error);
    return NextResponse.json(
      { error: 'Failed to submit pollution data' },
      { status: 500 }
    );
  }
} 