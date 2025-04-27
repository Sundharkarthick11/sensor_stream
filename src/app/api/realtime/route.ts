import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Received data:', data);

    

    console.log('Data:', data);

    return NextResponse.json({ message: 'Data received successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing data:', error);
    return NextResponse.json({ message: 'Error processing data' }, { status: 500 });
  }
}
