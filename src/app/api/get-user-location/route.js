import { NextResponse } from 'next/server';

export async function GET(request) {
  // ==================================================================
  // ========== DEVELOPMENT FIX: LOCAL MACHINE PAR ERROR KHATAM KAREN ==========
  // ==================================================================
  // Yeh check karega ke app development mode mein chal rahi hai ya nahi.
  if (process.env.NODE_ENV === 'development') {
    console.log("Development Mode: Mock location istemal ki ja rahi hai (PK). Asli API call nahi hogi.");
    // Apne computer par testing ke liye, hum ek farzi location bhej denge.
    // Is se aapki IP block nahi hogi.
    return NextResponse.json({ countryCode: 'PK' }); 
  }

  // ==================================================================
  // ========= PRODUCTION FIX: LIVE WEBSITE KE LIYE MAZBOOT BANAYEN =========
  // ==================================================================
  // Yeh code sirf live website (Vercel etc.) par chalega.

  let userIp = request.headers.get('x-forwarded-for');

  if (userIp && userIp.includes(',')) {
    userIp = userIp.split(',')[0].trim();
  }

  // Agar kisi wajah se IP nahi milti, to ek default IP istemal karen
  if (!userIp) {
    userIp = '103.208.208.0'; // Default fallback
  }

  try {
    // APNA API KEY ISTEMAL KAREN
    // ipapi.co par free account bana kar apna key yahan daalen.
    const apiKey = process.env.IPAPI_KEY;
    if (!apiKey) {
        throw new Error("IPAPI_KEY environment variable set nahi hai.");
    }
    
    const geoResponse = await fetch(`https://ipapi.co/${userIp}/json/?key=${apiKey}`);

    if (!geoResponse.ok) {
      const errorData = await geoResponse.json();
      console.error(`Error from ipapi.co: ${geoResponse.status} -`, errorData);
      return NextResponse.json(
        { error: 'External API se location fetch karne mein nakami', details: errorData.reason || 'Unknown Error' },
        { status: geoResponse.status }
      );
    }

    const geoData = await geoResponse.json();

    if (geoData && geoData.country_code) {
      return NextResponse.json({ countryCode: geoData.country_code });
    } else if (geoData.error) {
       console.error(`API Error from ipapi.co:`, geoData.reason);
       return NextResponse.json(
        { error: 'Geolocation API ne error diya', details: geoData.reason },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: 'Geolocation data mein country code nahi mila' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Geolocation lookup ke dauran server-side error:", error);
    return NextResponse.json(
      { error: 'Server error during geolocation lookup', details: error.message },
      { status: 500 }
    );
  }
}