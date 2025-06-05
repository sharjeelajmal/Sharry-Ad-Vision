// app/api/api.js
export async function GET() {
  const servicesData = [
    {
      id: 1,
      title: "Tiktok Followers",
      description: `Price {{price}} = 1k\n⚡ Recommended ✅\n⚡100% Always working 💯\n⭐Start: 0-5 minutes / 1 hour\n🔥 Speed : Excellent \n♻️Refill : Lifetime\n✅Cancel Button : Yes\n🔥Drop Ratio : 0%\n⭐ Link : Add Profile link`,
      imageUrl: "/Tiktok.gif",
      price: 500,
    },
    {
      id: 2,
      title: "Tiktok Followers 🇵🇰",
      description: `Price {{price}} = 1k\n⚡ Recommended ✅\n⚡100% Always working 💯\n⭐Start: 0-5 minutes / 1 hour\n🔥 Speed : Slow \n♻️Refill : Lifetime\n✅Cancel Button : Yes\n🔥Drop Ratio : 0%\n⭐ Link : Add Profile link`,
      imageUrl: "/Tiktok.gif",
      price: 850,
    },

    {
      id: 3,
      title: "Tiktok Likes",
      description: `Price {{price}} = 1k \n⚡ Recommended ✅\n ⚡Provider Rate - For API Users\n⭐Start: 0-5 minutes / 1 hour\n🔥Speed : Very Fast\n♻️Refill : Lifetime\n🔥Cancel Button : Yes\n✅Drop Ratio : 0%\n🔥Link : Add video link`,
      imageUrl: "/Tiktok.gif",
      price: 140,
    },
    {
      id: 4,
      title: "Tiktok Likes 🇵🇰",
      description: `Price {{price}} = 1k \n⚡ Recommended ✅\n ⚡Provider Rate - For API Users\n⭐Start: 0-5 minutes / 1 hour\n🔥Speed : Slow \n♻️Refill : Lifetime\n🔥Cancel Button : Yes\n✅Drop Ratio : 0%\n🔥Link : Add video link`,
      imageUrl: "/Tiktok.gif",
      price: 280,
    },
    {
      id: 5,
      title: "TikTok Views",
      description: `Price {{price}} = 1k\n⚡Start: 0-1 Minutes\n⚡Speed: ⚡ Ultra Fast Speed\n⭐ Recommended\n🔥 Non Drop\n♻️ Refill Button Active\n✅ Lifetime Refill\n🔥 Always working`,
      imageUrl: "/Tiktok.gif",
      price: 10,
    },
    {
      id: 6,
      title: "TikTok Views",
      description: `Price {{price}} = 1k\n⚡Start: 0-1 Minutes\n⚡Speed: ⚡Fast Speed\n⭐ Recommended\n🔥 Non Drop\n♻️ Refill Button Active\n✅ Lifetime Refill\n🔥 Always working`,
      imageUrl: "/Tiktok.gif",
      price: 5,
    },
    {
      id: 7,
      title: "TikTok Sponsored Views",
      description: `Price {{price}} = 1k\n ⚡In this service \n⚡100% Real For You Views\n⭐Bonus Likes + Bonus Followers\n 🔥 Start time 1 to 24 hours\n ♻️Non Drop Lifetime Guarantee\n✅ Best Rates In Market 😍\n🔥Best For Monetisation 💲`,
      imageUrl: "/Tiktok.gif",
      price: 170,
    },
    {
      id: 7,
      title: "TikTok Sponsored Views",
      description: `Price {{price}} = 1k\n ⚡In this service \n⚡100% Real For You Views\n⭐Bonus Likes + Bonus Followers\n 🔥 Start time 1 to 24 hours\n ♻️Non Drop Lifetime Guarantee\n✅ Best Rates In Market 😍\n🔥Best For Monetisation 💲`,
      imageUrl: "/Tiktok.gif",
      price: 200,
    },
      {
      id: 7,
      title: "TikTok Comments",
      description: `Price {{price}} = 1k\n ⚡In this service \n⚡100% Real For You Views\n⭐Bonus Likes + Bonus Followers\n 🔥 Start time 0 -1 hours\n ♻️Non Drop Lifetime Guarantee\n✅ Best Rates In Market 😍\n🔥Best For Monetisation 💲`,
      imageUrl: "/Tiktok.gif",
      price: "Not Available",
    },
      {
      id: 7,
      title: "TikTok Comments",
      description: `Price {{price}} = 1k\n ⚡In this service \n⚡100% Real For You Views\n⭐Bonus Likes + Bonus Followers\n 🔥 Start time 0 -1 hours\n ♻️Non Drop Lifetime Guarantee\n✅ Best Rates In Market 😍\n🔥Best For Monetisation 💲`,
      imageUrl: "/Tiktok.gif",
      price: "Not Available",
    },
    {
      id: 5,
      title: "Youtube Subscribers",
      description: `Price 5.38$ = 1k\n⚡Start: 0-1 Hours\n⚡Speed: ⚡Medium\n⭐ Recommended\n🔥 Non Drop\n♻️ Refill Button Active\n✅ Lifetime Refill\n🔥 Always working `,
      imageUrl: "/Youtube.gif",
    },
    {
      id: 6,
      title: "Youtube Likes",
      description: `Price 0.72$ = 1k \n⚡Start: 0-5 Minutes\n⚡Speed: ⚡ Ultra Fast Speed\n⭐ Recommended\n🔥 Non Drop\n♻️ Refill Button Active\n✅ Lifetime Refill\n🔥 Always working`,
      imageUrl: "/Youtube.gif",
    },
    {
      id: 7,
      title: "Youtube Views",
      description: `Price 1.43$ = 1k \n ⚡Recommended ✅\n ⚡100% Always working 💯\n⭐Start: 0-50 minutes / 1 hour\n🔥 Speed : Super Fast \n♻️Refill : Lifetime\n✅Cancel Button : Yes\n🔥Drop Ratio : 0%\n🔥Link : Add Video link`,
      imageUrl: "/Youtube.gif",
    },
    {
      id: 8,
      title: "Youtube Watch Time",
      description: `Price 26.80$ = 1k \n ⚡Recommended ✅\n ⚡100% Always working 💯\n⭐ Start: 0-1 hour\nSpeed : Super Fast \n🔥Refill : Lifetime\n♻️Cancel Button : Yes\n✅Drop Ratio : 0%\n 🔥Link : Add Channel link`,
      imageUrl: "/Youtube.gif",
    },
    {
      id: 9,
      title: "Facebook Page Likes+Followers",
      description: `Price 1.43$ = 1k\n ⚡Start Time: 0-1 Hour !\n⚡Link: Page Link (Must have like button)\n⭐Location: Global\n🔥Speed: Fast\n♻️Refill: Yes 30 Days\n✅Best Rates In Market 😍\n🔥Best For Monetisation 💲`,
      imageUrl: "/Facebook.gif",
    },
    {
      id: 10,
      title: "Facebook Profile Followers",
      description: `Price 1.43$ = 1k\n⚡Start Time: 0-5 Hour !\n⚡Link: Profile Link\n⭐Location: Global\n🔥 Speed: Fast\n♻️Refill : Lifetime\n✅Best Rates In Market 😍`,

      imageUrl: "/Facebook.gif",
    },
    {
      id: 11,
      title: "Facebook Post Likes",
      description: `Price 1.25$ = 1k\n ⚡Start Time: 0-3 Hour !\n⚡Link: Post Link \n⭐Location: Global\n🔥Speed:Medium\n♻️Refill: Yes Lifetime \n✅Best Rates In Market 😍`,
      imageUrl: "/Facebook.gif",
    },
    {
      id: 12,
      title: "Facebook Video Views",
      description: `Price 0.54$ = 1k\n ⚡Start Time: 0-1 Hour !\n ✅Video length should be at-least 6 seconds\n ✅View retention - 3 seconds\n Works for Reels as well\n ⚡Speed: Super Fast`,
      imageUrl: "/Facebook.gif",
    },
    {
      id: 13,
      title: "Instagram Followers",
      description: `Price 2.01$ = 1k\n ⚡Start Time: 0-1 Hour !\n🚨 If flag is on and you place the order no refill or refund would be provided \n⚡Speed - Excellent \n⭐Quality - 15+ Posts and 1 year old accounts\n♻️Drop Ratio - 0 - 5%\n✅Refill - Lifetime Guarantee\n🔥Link - Instagram Profile URL `,
      imageUrl: "/Instagram.gif",
    },
    {
      id: 14,
      title: "Instagram Likes",
      description: `Price 0.47$ = 1k\n ⚡Start - Instant\n⚡Speed - Super Fast / Day\n⭐ Quality - High Quality [ Mix ]\n♻️Drop - No\n🔥Refill - Lifetime\n✅Link - Instagram Post / Reel / IGTV URL`,
      imageUrl: "/Instagram.gif",
    },
    {
      id: 15,
      title: "Instagram Video Views",
      description: `Price 0.36$ = 1k\n ⚡Start - Instant\n⚡Speed - Super Fast / Day\n⭐Quality - High Quality [ Mix ]\n♻️Drop - No\n🔥Refill - Lifetime\n✅Link - Instagram Video URL`,
      imageUrl: "/Instagram.gif",
    },
    {
      id: 16,
      title: "Instagram Reels Views",
      description: `Price 0.36$ = 1k\n ⚡Start - Instant\n⚡Speed - Super Fast / Day\n⭐Quality - High Quality [ Mix ]\n🔥Drop - No\n♻️Refill - Lifetime\n✅Link - Instagram Reels URL`,
      imageUrl: "/Instagram.gif",
    },
    {
      id: 17,
      title: "Whatsapp Channel Followers",
      description: `Price 8.93$ = 1k\n ✨Start - 0-1 Hour⌛\n⭐Enter channel link\n✨ Speed: Normal ⚡\n🔄 Guarantee: Guaranteed Delivery\n🔄 Refill: No`,
      imageUrl: "/Whatsapp.gif",
    },
    {
      id: 18,
      title: "X-Twitter Followers",
      description: `Price 9.65$ = 1k\n ✨ Start - 0-3 Hours\n⭐Enter Profile link\n ✨ Speed:Fast⚡\n🔄 Guarantee: 30 Days`,
      imageUrl: "/Twitter.gif",
    },
    {
      id: 19,
      title: "Graphics Designing",
      description: `Price 13$ \n⚡Files Ready for Print\n⚡Front & back design\n⭐Custom graphics\n🔥Photo editing\n♻️Social media design\n✅Commercial Use`,
      imageUrl: "/Graphics.gif",
    },
    {
      id: 20,
      title: "Website Development",
      description: `⚡React/Next.js web app dev, maintenance, optimization, tech support, bug fixing\n⚡2-day delivery\n3 Revisions\n⭐1 page\nDesign customization\n🔥Content upload\n♻️Responsive design\n✅Source code`,
      imageUrl: "/Website.gif",
    },
  ];

  return new Response(JSON.stringify(servicesData), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
