import { NextResponse } from 'next/server';

// Is line se hum Vercel ko batate hain ke yeh ek Edge Function hai
// Edge Functions mein location ki information direct milti hai
export const runtime = 'edge';

export function GET(request) {
  // Development (localhost) ke liye ek mock response bhej den
  if (process.env.NODE_ENV === 'development') {
    console.log("Development Mode: Mock country 'PK' istemal kiya ja raha hai.");
    return NextResponse.json({ countryCode: 'PK' });
  }

  // Vercel live website par user ka mulk direct is header se mil jata hai
  const country = request.headers.get('x-vercel-ip-country');

  if (country) {
    console.log(`Vercel Edge Geolocation: Country Code Mila -> ${country}`);
    return NextResponse.json({ countryCode: country });
  } else {
    // Agar kisi wajah se header na mile, to ek default fallback istemal karen
    console.log("Vercel ka location header nahi mila, fallback 'PK' istemal ho raha hai.");
    return NextResponse.json({ countryCode: 'PK' });
  }
}