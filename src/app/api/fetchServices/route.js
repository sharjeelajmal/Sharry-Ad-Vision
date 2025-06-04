// app/api/fetchServices/route.js
export async function POST() {
  const res = await fetch('https://dilsmmpanel.com/api/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key: 'bfbcb8d052afbd08dd8920d5057a641648dd3666',
      action: 'services',
    }),
  });

  const data = await res.json();

  const updatedServices = data.map(service => ({
    id: service.service,
    name: service.name,
    category: service.category,
    min: service.min,
    max: service.max,
    originalRate: service.rate,
    price: (parseFloat(service.rate) + 100).toFixed(2), // margin added
  }));

  return Response.json(updatedServices);
}
