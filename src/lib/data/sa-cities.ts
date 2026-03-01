export interface SACity {
  name: string
  lat: number
  lng: number
  province: string
}

export const SA_CITIES: SACity[] = [
  // Gauteng
  { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, province: 'Gauteng' },
  { name: 'Pretoria', lat: -25.7479, lng: 28.2293, province: 'Gauteng' },
  { name: 'Sandton', lat: -26.1076, lng: 28.0567, province: 'Gauteng' },
  { name: 'Soweto', lat: -26.2227, lng: 27.8544, province: 'Gauteng' },
  { name: 'Midrand', lat: -25.9891, lng: 28.1281, province: 'Gauteng' },
  { name: 'Centurion', lat: -25.8603, lng: 28.1894, province: 'Gauteng' },
  { name: 'Randburg', lat: -26.0935, lng: 28.0060, province: 'Gauteng' },
  { name: 'Roodepoort', lat: -26.1625, lng: 27.8728, province: 'Gauteng' },
  { name: 'Benoni', lat: -26.1886, lng: 28.3208, province: 'Gauteng' },
  { name: 'Boksburg', lat: -26.2122, lng: 28.2606, province: 'Gauteng' },
  { name: 'Springs', lat: -26.2546, lng: 28.4418, province: 'Gauteng' },
  { name: 'Germiston', lat: -26.2179, lng: 28.1727, province: 'Gauteng' },
  { name: 'Krugersdorp', lat: -26.0855, lng: 27.7738, province: 'Gauteng' },
  { name: 'Vereeniging', lat: -26.6736, lng: 27.9266, province: 'Gauteng' },

  // Western Cape
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241, province: 'Western Cape' },
  { name: 'Stellenbosch', lat: -33.9321, lng: 18.8602, province: 'Western Cape' },
  { name: 'Paarl', lat: -33.7342, lng: 18.9626, province: 'Western Cape' },
  { name: 'George', lat: -33.9638, lng: 22.4628, province: 'Western Cape' },
  { name: 'Somerset West', lat: -34.0788, lng: 18.8430, province: 'Western Cape' },

  // KwaZulu-Natal
  { name: 'Durban', lat: -29.8587, lng: 31.0218, province: 'KwaZulu-Natal' },
  { name: 'Pietermaritzburg', lat: -29.6006, lng: 30.3794, province: 'KwaZulu-Natal' },
  { name: 'Richards Bay', lat: -28.7830, lng: 32.0377, province: 'KwaZulu-Natal' },
  { name: 'Newcastle', lat: -27.7576, lng: 29.9318, province: 'KwaZulu-Natal' },
  { name: 'Ballito', lat: -29.5390, lng: 31.2140, province: 'KwaZulu-Natal' },

  // Eastern Cape
  { name: 'Port Elizabeth', lat: -33.9608, lng: 25.6022, province: 'Eastern Cape' },
  { name: 'East London', lat: -33.0153, lng: 27.9116, province: 'Eastern Cape' },

  // Free State
  { name: 'Bloemfontein', lat: -29.0852, lng: 26.1596, province: 'Free State' },

  // Mpumalanga
  { name: 'Nelspruit', lat: -25.4753, lng: 30.9694, province: 'Mpumalanga' },
  { name: 'Witbank', lat: -25.8714, lng: 29.2333, province: 'Mpumalanga' },

  // Limpopo
  { name: 'Polokwane', lat: -23.9045, lng: 29.4689, province: 'Limpopo' },

  // North West
  { name: 'Rustenburg', lat: -25.6715, lng: 27.2420, province: 'North West' },
  { name: 'Potchefstroom', lat: -26.7145, lng: 27.0970, province: 'North West' },

  // Northern Cape
  { name: 'Kimberley', lat: -28.7382, lng: 24.7639, province: 'Northern Cape' },
  { name: 'Upington', lat: -28.4572, lng: 21.2566, province: 'Northern Cape' },
]

/** Get unique provinces in display order */
export const SA_PROVINCES = [...new Set(SA_CITIES.map(c => c.province))]

/** Group cities by province */
export function getCitiesByProvince(): Record<string, SACity[]> {
  const grouped: Record<string, SACity[]> = {}
  for (const city of SA_CITIES) {
    if (!grouped[city.province]) grouped[city.province] = []
    grouped[city.province].push(city)
  }
  return grouped
}
