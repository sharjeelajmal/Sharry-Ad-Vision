import { NextResponse } from 'next/server';

export async function GET(request) {
  // Development mode mein mock response bhej den taake local machine par error na aaye
  if (process.env.NODE_ENV === 'development') {
    console.log("Development Mode: Mock currency (PKR) istemal ki ja rahi hai.");
    return NextResponse.json({ currency: 'PKR' }); 
  }

  // Production (live website) ka code
  let userIp = request.headers.get('x-forwarded-for') || '8.8.8.8'; // Google's DNS as a reliable fallback

  if (userIp && userIp.includes(',')) {
    userIp = userIp.split(',')[0].trim();
  }

  try {
    const apiKey = process.env.IPAPI_KEY;
    if (!apiKey) {
      // Yeh error Vercel logs mein nazar aayega agar aapne key set nahi ki
      console.error("CRITICAL: IPAPI_KEY environment variable Vercel mein set nahi hai.");
      throw new Error("IPAPI_KEY environment variable not set.");
    }
    
    const geoResponse = await fetch(`https://ipapi.co/${userIp}/json/?key=${apiKey}`);

    if (!geoResponse.ok) {
      const errorData = await geoResponse.json();
      console.error(`Error from ipapi.co: ${geoResponse.status}`, errorData);
      // Agar API se error aaye, to default PKR bhej den taake website na ruke
      return NextResponse.json({ currency: 'PKR' });
    }

    const geoData = await geoResponse.json();

    // Ab hum direct currency code bhejenge
    if (geoData && geoData.currency) {
      console.log(`Live Mode: Location ke hisab se currency mili: ${geoData.currency}`);
      return NextResponse.json({ currency: geoData.currency });
    } else {
      // Agar API response mein currency na ho, to default PKR bhej den
      console.warn("API response mein currency nahi mili, fallback (PKR) istemal kiya ja raha hai.");
      return NextResponse.json({ currency: 'PKR' });
    }
  } catch (error) {
    console.error("get-user-location API route mein server error:", error);
    // Kisi bhi error ki surat mein default PKR bhej den
    return NextResponse.json({ currency: 'PKR' });
  }
}