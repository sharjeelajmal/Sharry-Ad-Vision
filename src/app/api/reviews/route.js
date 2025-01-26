// app/api/reviews/route.js
export async function GET() {
 // Sample reviews data
const reviews = [
  {
    id: 1,
    name: "Sophia",
    rating: 5,
    review: "Amazing experience! My business has grown significantly thanks to the social media marketing services. Highly recommend!",

  },
  {
    id: 2,
    name: "Emma",
    rating: 4,
    review: "The website development services were top-notch. The team delivered a stunning website in no time.",
  
  },
  {
    id: 3,
    name: "Alice Johnson",
    rating: 5,
    review: "Great results with Facebook Ads! My followers grew exponentially in just a few weeks.",

  },
  {
    id: 4,
    name: "Jacob",
    rating: 4,
    review: "Wonderful service! The graphics designing team really understood my brand vision.",

  },
  {
    id: 5,
    name: "Charlie Wilson",
    rating: 5,
    review: "The website I got developed is amazing. The team was really responsive to my needs.",

  },
  {
    id: 6,
    name: "David Miller",
    rating: 5,
    review: "I am extremely satisfied with the social media marketing services. My sales have improved a lot.",

  },
  {
    id: 7,
    name: "Emma Davis",
    rating: 3,
    review: "The graphics were good, but the turnaround time could be improved.",

  },
  {
    id: 8,
    name: "Frank Moore",
    rating: 5,
    review: "Very happy with the digital marketing campaign. It has brought great traffic to my site.",

  },
  {
    id: 9,
    name: "Grace Lee",
    rating: 4,
    review: "Good services overall. Would love to see more options for ads optimization.",

  },
  {
    id: 10,
    name: "Hannah Taylor",
    rating: 5,
    review: "The team is very professional. They handled everything smoothly and the website looks great!",
   
  },
  {
    id: 11,
    name: "Ian Harris",
    rating: 4,
    review: "The website design is fantastic. Would recommend them for web development.",

  },
  {
    id: 12,
    name: "Jack Wilson",
    rating: 5,
    review: "Great services at affordable prices. The social media strategies really work!",

  },
  {
    id: 13,
    name: "Kathy Brown",
    rating: 3,
    review: "Good, but could be more personalized to my business.",
 
  },
  {
    id: 14,
    name: "Leo Anderson",
    rating: 4,
    review: "Overall great experience. I am seeing results from the campaign.",

  },
  {
    id: 15,
    name: "Maggie Clark",
    rating: 5,
    review: "Excellent service, everything from design to marketing was handled efficiently.",

  },
  {
    id: 16,
    name: "Nathan Moore",
    rating: 4,
    review: "Quick and efficient, but would love more customization options.",

  },
  {
    id: 17,
    name: "Olivia Martinez",
    rating: 5,
    review: "This digital marketing agency is top-tier! I saw results in less than a week.",

  },
  {
    id: 18,
    name: "Paul Garcia",
    rating: 4,
    review: "Very professional, good experience overall.",

  },
  {
    id: 19,
    name: "Quincy Scott",
    rating: 5,
    review: "Incredible website development. Exceeded my expectations!",
  
  },
  {
    id: 20,
    name: "Rachel Turner",
    rating: 4,
    review: "Impressed with the design quality. The final website looks amazing.",

  },
  {
    id: 21,
    name: "Samuel Young",
    rating: 5,
    review: "Highly recommend these services. My business has benefited greatly.",
  
  },
  {
    id: 22,
    name: "Tina Harris",
    rating: 5,
    review: "Fantastic graphics design work, will definitely use them again.",

  },
  {
    id: 23,
    name: "Ursula Campbell",
    rating: 4,
    review: "The service was good, but a little pricey for the options provided.",

  },
  {
    id: 24,
    name: "Victor Allen",
    rating: 3,
    review: "Service was okay, but more variety in packages would be better.",

  },
  {
    id: 25,
    name: "Wendy Robinson",
    rating: 5,
    review: "Amazing work on our website! It looks so professional.",
  
  },
  {
    id: 26,
    name: "Xander Moore",
    rating: 4,
    review: "Really good service, just a little slow at times.",

  },
  {
    id: 27,
    name: "Yvonne Walker",
    rating: 5,
    review: "I am thrilled with the outcome. My website is live and has a great design.",

  },
  {
    id: 28,
    name: "Zachary Green",
    rating: 4,
    review: "Good quality work and professional service.",
 
  },
  {
    id: 29,
    name: "Amy Evans",
    rating: 5,
    review: "The team was wonderful to work with. They understood my needs perfectly.",

  },
  {
    id: 30,
    name: "Brandon King",
    rating: 4,
    review: "Good results but still requires more improvement in the speed of service.",

  },
  {
    id: 31,
    name: "Cynthia Lee",
    rating: 5,
    review: "Exceptional work! I will definitely use this service again.",

  },
  {
    id: 32,
    name: "Dennis Martin",
    rating: 3,
    review: "The service is good, but it can be improved in terms of cost-effectiveness.",

  },
  {
    id: 33,
    name: "Eleanor Clark",
    rating: 5,
    review: "My brand's social presence has grown immensely thanks to the team!",

  },
  {
    id: 34,
    name: "Felix Carter",
    rating: 4,
    review: "Great experience overall. The website development process was smooth.",

  },
  {
    id: 35,
    name: "Gina Stewart",
    rating: 5,
    review: "I'm so happy with my results. The services are exactly what I was looking for.",

  },
  {
    id: 36,
    name: "Hank Evans",
    rating: 3,
    review: "I had some issues with customer service, but the website looks good.",

  },
  {
    id: 37,
    name: "Ivy Scott",
    rating: 5,
    review: "The team's work was phenomenal. They exceeded my expectations in every aspect.",

  },
  {
    id: 38,
    name: "James Morgan",
    rating: 4,
    review: "Very happy with the final results. However, I'd suggest faster response times.",

  },
  {
    id: 39,
    name: "Karen Perez",
    rating: 5,
    review: "Superb customer service. They really listened to my needs and delivered.",

  },
  {
    id: 40,
    name: "Louis Wright",
    rating: 4,
    review: "Good services but a bit costly compared to competitors.",
  
  },
  {
    id: 41,
    name: "Monica Adams",
    rating: 5,
    review: "I would highly recommend this team! Their work is top quality.",

  },
  {
    id: 42,
    name: "Nathan James",
    rating: 4,
    review: "Very good service, but there is room for improvement in speed.",
   
  },
  {
    id: 43,
    name: "Olivia Campbell",
    rating: 5,
    review: "My business has flourished thanks to their expertise in digital marketing.",
   
  },
  {
    id: 44,
    name: "Paul White",
    rating: 3,
    review: "The service was okay, but there were some hiccups in the process.",
   
  },
  {
    id: 45,
    name: "Quincy Lee",
    rating: 5,
    review: "Excellent design and development services. Very happy with the results.",

  },
  {
    id: 46,
    name: "Riley Harris",
    rating: 4,
    review: "Good overall, but the customer service could be a bit faster.",
  
  },
  {
    id: 47,
    name: "Sarah Wilson",
    rating: 5,
    review: "Incredible work on the marketing campaign. We saw a huge boost in traffic.",
 
  },
  {
    id: 48,
    name: "Thomas Adams",
    rating: 4,
    review: "Good service overall. Could improve on turnaround time.",
 
  },
  {
    id: 49,
    name: "Ursula Turner",
    rating: 3,
    review: "The service was decent, but not worth the price.",

  },
  {
    id: 50,
    name: "Victor King",
    rating: 5,
    review: "The digital marketing team was outstanding. We achieved excellent results.",

  },
];

  return new Response(JSON.stringify(reviews), {
    headers: { "Content-Type": "application/json" },
  });
}
