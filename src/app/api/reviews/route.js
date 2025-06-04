let reviews = [
  {
    id: 1,
    name: "Ayesha",
    rating: 5,
    review: "Bhai kamaal ka kaam kiya! Social media se business mein bohat faida hua."
  },
  {
    id: 2,
    name: "Zainab",
    rating: 4,
    review: "Website bohat khoobsurat bani hai. Team ne time pe deliver kiya."
  },
  {
    id: 3,
    name: "Aleena",
    rating: 5,
    review: "Facebook Ads ka zabardast result mila, followers din-b-din barh rahe hain!"
  },
  {
    id: 4,
    name: "Usman",
    rating: 4,
    review: "Graphic designing mein unhone meri soch ko samjha, bohat acha kaam kiya."
  },
  {
    id: 5,
    name: "Bilal",
    rating: 5,
    review: "Website design aur response dono kamaal ke the. Highly satisfied!"
  },
  {
    id: 6,
    name: "Hamza",
    rating: 5,
    review: "Social media marketing ka asar sach mein nazar aya, sales double ho gayi hain."
  },
  {
    id: 7,
    name: "Fatima",
    rating: 3,
    review: "Graphics theek thay, lekin delivery mein thora delay tha."
  },
  {
    id: 8,
    name: "Rehan",
    rating: 5,
    review: "Digital marketing campaign se website pe traffic kaafi barh gaya hai. Shukriya!"
  },
  {
    id: 9,
    name: "Sana",
    rating: 4,
    review: "Service achi thi, lekin ads optimization ke aur options hone chahiyein."
  },
  {
    id: 10,
    name: "Hira",
    rating: 5,
    review: "Team ne kaam bohat professional tareeqay se kiya. Website dekh ke dil khush ho gaya."
  },
  {
    id: 11,
    name: "Imran",
    rating: 4,
    review: "Website design superb hai. Web development ke liye recommend zaroor karun ga."
  },
  {
    id: 12,
    name: "Yasir",
    rating: 5,
    review: "Affordable price mein excellent service. Social media strategy bohat kaam ki hai."
  },
  {
    id: 13,
    name: "Nimra",
    rating: 3,
    review: "Kaam acha tha, lekin thora aur personal touch hota tou mazeed acha lagta."
  },
  {
    id: 14,
    name: "Adil",
    rating: 4,
    review: "Overall acha experience raha. Campaign ka result samne aa raha hai."
  },
  {
    id: 15,
    name: "Mehwish",
    rating: 5,
    review: "Har cheez design se le kar marketing tak efficiently handle hui. Zabardast!"
  },
  {
    id: 16,
    name: "Noman",
    rating: 4,
    review: "Kaam fast aur effective tha, lekin customization options aur honay chahiyein."
  },
  {
    id: 17,
    name: "Iqra",
    rating: 5,
    review: "Digital marketing mein top-level results milein. Sirf ek haftay mein fark nazar aya!"
  },
  {
    id: 18,
    name: "Salman",
    rating: 4,
    review: "Bohat professional log hain. Achha experience raha overall."
  },
  {
    id: 19,
    name: "Fahad",
    rating: 5,
    review: "Website development ne meri expectations se zyada deliver kiya!"
  },
  {
    id: 20,
    name: "Mahnoor",
    rating: 4,
    review: "Website ka design dekh ke khushi hui. Quality bohat achi thi."
  }, {
    id: 21,
    name: "Shazia",
    rating: 5,
    review: "Designs itne creative thay ke clients bhi hairaan reh gaye. Aala kaam!"
  },
  {
    id: 22,
    name: "Tariq",
    rating: 4,
    review: "Social media posts timely aur professional the. Sirf thoda aur engaging ho sakte thay."
  },
  {
    id: 23,
    name: "Lubna",
    rating: 5,
    review: "Unhon ne mujhe zero se hero bana diya online! Shukriya team ko!"
  },
  {
    id: 24,
    name: "Zeeshan",
    rating: 3,
    review: "Kaam theek tha, lekin communication mein thodi improvement ki zarurat hai."
  },
  {
    id: 25,
    name: "Bushra",
    rating: 5,
    review: "Website ka UI itna sleek tha ke har koi tareef kar raha hai!"
  },
  {
    id: 26,
    name: "Haroon",
    rating: 4,
    review: "Graphic designing ka kaam accha tha, magar revisions mein thoda waqt laga."
  },
  {
    id: 27,
    name: "Komal",
    rating: 5,
    review: "Social media pages ka makeover dekh kar khushi hui. Bohat acha experience!"
  },
  {
    id: 28,
    name: "Nadeem",
    rating: 4,
    review: "Digital ads ka reach acha tha. Bas conversion aur barhane ki zarurat hai."
  },
  {
    id: 29,
    name: "Huma",
    rating: 5,
    review: "Responsive website aur SEO-friendly content—dono ne magic kar diya!"
  },
  {
    id: 30,
    name: "Asad",
    rating: 4,
    review: "Kaam acha tha, lekin pehla draft utna strong nahi tha. Baad mein behtareen ban gaya."
  },
  {
    id: 31,
    name: "Sadia",
    rating: 5,
    review: "Inki marketing ne mere online store ko Udaan de di. Highly impressed!"
  },
  {
    id: 32,
    name: "Waqar",
    rating: 4,
    review: "Professional aur timely service. Thodi aur transparency hoti tou aur acha lagta."
  },
  {
    id: 33,
    name: "Marium",
    rating: 5,
    review: "Har banner, har ad design classy tha. 100 mein se 100 marks!"
  },
  {
    id: 34,
    name: "Taha",
    rating: 3,
    review: "Team achi thi, lekin mera project thoda late deliver hua."
  },
  {
    id: 35,
    name: "Areeba",
    rating: 5,
    review: "Instagram page ko inhon ne brand bana diya. Brilliant!"
  },
  {
    id: 36,
    name: "Junaid",
    rating: 5,
    review: "Unki web development ne meri company ko ek nayi pehchan di."
  },
  {
    id: 37,
    name: "Nazia",
    rating: 4,
    review: "Thoda budget high laga, lekin quality ne justify kar diya."
  },
  {
    id: 38,
    name: "Rizwan",
    rating: 5,
    review: "Creative, sharp aur deadline pe kaam. Mujhe aur kya chahiye?"
  },
  {
    id: 39,
    name: "Amna",
    rating: 4,
    review: "Inka team friendly tha, lekin feedback ka process thoda slow tha."
  },
  {
    id: 40,
    name: "Shabbir",
    rating: 5,
    review: "Ads itne catchy thay ke log rukh kar dekhte thay. Superb design!"
  }

];

export async function GET() {
  return Response.json(reviews);
}

export async function POST(request) {
  const { name, rating, review } = await request.json();

  if (!name || !rating || !review) {
    return new Response(
      JSON.stringify({ message: "Missing required fields" }),
      { status: 400 }
    );
  }

  const newReview = {
    id: reviews.length + 1,
    name,
    rating,
    review,
  };

  reviews.unshift(newReview); // Add to top
  return new Response(JSON.stringify(newReview), { status: 201 });
}
