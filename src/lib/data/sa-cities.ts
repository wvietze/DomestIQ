export interface SACity {
  name: string
  lat: number
  lng: number
  province: string
  metro: string
}

export const SA_CITIES: SACity[] = [
  // ═══════════════════════════════════════
  // WESTERN CAPE (Launch region — Paarl)
  // ═══════════════════════════════════════

  // Cape Town Metro
  { name: 'Cape Town CBD', lat: -33.9249, lng: 18.4241, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Sea Point', lat: -33.9175, lng: 18.3844, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Green Point', lat: -33.9088, lng: 18.3999, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Camps Bay', lat: -33.9508, lng: 18.3782, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Claremont', lat: -33.9834, lng: 18.4686, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Newlands', lat: -33.9789, lng: 18.4613, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Constantia', lat: -34.0244, lng: 18.4315, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Rondebosch', lat: -33.9607, lng: 18.4736, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Pinelands', lat: -33.9388, lng: 18.5098, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Milnerton', lat: -33.8712, lng: 18.5109, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Table View', lat: -33.8240, lng: 18.5172, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Bloubergstrand', lat: -33.8097, lng: 18.4559, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Bellville', lat: -33.9014, lng: 18.6300, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Brackenfell', lat: -33.8764, lng: 18.6949, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Durbanville', lat: -33.8318, lng: 18.6476, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Goodwood', lat: -33.9039, lng: 18.5579, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Parow', lat: -33.9031, lng: 18.5861, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Kuilsriver', lat: -33.9324, lng: 18.6815, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Somerset West', lat: -34.0788, lng: 18.8430, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Strand', lat: -34.1097, lng: 18.8250, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Fish Hoek', lat: -34.1359, lng: 18.4312, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Muizenberg', lat: -34.1076, lng: 18.4710, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Wynberg', lat: -34.0028, lng: 18.4629, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Tokai', lat: -34.0550, lng: 18.4430, province: 'Western Cape', metro: 'Cape Town Metro' },
  { name: 'Observatory', lat: -33.9372, lng: 18.4738, province: 'Western Cape', metro: 'Cape Town Metro' },

  // Winelands
  { name: 'Paarl', lat: -33.7342, lng: 18.9626, province: 'Western Cape', metro: 'Winelands' },
  { name: 'Stellenbosch', lat: -33.9321, lng: 18.8602, province: 'Western Cape', metro: 'Winelands' },
  { name: 'Franschhoek', lat: -33.9133, lng: 19.1167, province: 'Western Cape', metro: 'Winelands' },
  { name: 'Wellington', lat: -33.6394, lng: 19.0114, province: 'Western Cape', metro: 'Winelands' },
  { name: 'Drakenstein', lat: -33.6850, lng: 18.9680, province: 'Western Cape', metro: 'Winelands' },

  // Garden Route
  { name: 'George', lat: -33.9638, lng: 22.4628, province: 'Western Cape', metro: 'Garden Route' },
  { name: 'Knysna', lat: -34.0356, lng: 23.0488, province: 'Western Cape', metro: 'Garden Route' },
  { name: 'Plettenberg Bay', lat: -34.0523, lng: 23.3716, province: 'Western Cape', metro: 'Garden Route' },
  { name: 'Mossel Bay', lat: -34.1830, lng: 22.1459, province: 'Western Cape', metro: 'Garden Route' },
  { name: 'Wilderness', lat: -33.9980, lng: 22.5766, province: 'Western Cape', metro: 'Garden Route' },

  // Overberg
  { name: 'Hermanus', lat: -34.4187, lng: 19.2345, province: 'Western Cape', metro: 'Overberg' },
  { name: 'Stanford', lat: -34.4433, lng: 19.4550, province: 'Western Cape', metro: 'Overberg' },
  { name: 'Kleinmond', lat: -34.3389, lng: 19.0278, province: 'Western Cape', metro: 'Overberg' },

  // West Coast
  { name: 'Langebaan', lat: -33.0925, lng: 18.0257, province: 'Western Cape', metro: 'West Coast' },
  { name: 'Saldanha', lat: -33.0044, lng: 17.9283, province: 'Western Cape', metro: 'West Coast' },
  { name: 'Vredenburg', lat: -33.0100, lng: 17.9917, province: 'Western Cape', metro: 'West Coast' },

  // ═══════════════════════════════════════
  // GAUTENG
  // ═══════════════════════════════════════

  // Johannesburg Metro
  { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, province: 'Gauteng', metro: 'Johannesburg Metro' },
  { name: 'Sandton', lat: -26.1076, lng: 28.0567, province: 'Gauteng', metro: 'Johannesburg Metro' },
  { name: 'Randburg', lat: -26.0935, lng: 28.0060, province: 'Gauteng', metro: 'Johannesburg Metro' },
  { name: 'Roodepoort', lat: -26.1625, lng: 27.8728, province: 'Gauteng', metro: 'Johannesburg Metro' },
  { name: 'Soweto', lat: -26.2227, lng: 27.8544, province: 'Gauteng', metro: 'Johannesburg Metro' },
  { name: 'Bryanston', lat: -26.0589, lng: 28.0268, province: 'Gauteng', metro: 'Johannesburg Metro' },
  { name: 'Fourways', lat: -26.0194, lng: 28.0125, province: 'Gauteng', metro: 'Johannesburg Metro' },
  { name: 'Bedfordview', lat: -26.1820, lng: 28.1342, province: 'Gauteng', metro: 'Johannesburg Metro' },
  { name: 'Parktown', lat: -26.1747, lng: 28.0423, province: 'Gauteng', metro: 'Johannesburg Metro' },
  { name: 'Rosebank', lat: -26.1454, lng: 28.0448, province: 'Gauteng', metro: 'Johannesburg Metro' },
  { name: 'Alberton', lat: -26.2672, lng: 28.1222, province: 'Gauteng', metro: 'Johannesburg Metro' },
  { name: 'Krugersdorp', lat: -26.0855, lng: 27.7738, province: 'Gauteng', metro: 'Johannesburg Metro' },

  // Pretoria Metro
  { name: 'Pretoria', lat: -25.7479, lng: 28.2293, province: 'Gauteng', metro: 'Pretoria Metro' },
  { name: 'Centurion', lat: -25.8603, lng: 28.1894, province: 'Gauteng', metro: 'Pretoria Metro' },
  { name: 'Midrand', lat: -25.9891, lng: 28.1281, province: 'Gauteng', metro: 'Pretoria Metro' },
  { name: 'Brooklyn', lat: -25.7708, lng: 28.2361, province: 'Gauteng', metro: 'Pretoria Metro' },
  { name: 'Hatfield', lat: -25.7478, lng: 28.2387, province: 'Gauteng', metro: 'Pretoria Metro' },
  { name: 'Menlyn', lat: -25.7830, lng: 28.2780, province: 'Gauteng', metro: 'Pretoria Metro' },
  { name: 'Garsfontein', lat: -25.8050, lng: 28.3000, province: 'Gauteng', metro: 'Pretoria Metro' },
  { name: 'Waterkloof', lat: -25.7910, lng: 28.2450, province: 'Gauteng', metro: 'Pretoria Metro' },
  { name: 'Montana', lat: -25.6920, lng: 28.2430, province: 'Gauteng', metro: 'Pretoria Metro' },
  { name: 'Irene', lat: -25.8700, lng: 28.2200, province: 'Gauteng', metro: 'Pretoria Metro' },

  // East Rand
  { name: 'Benoni', lat: -26.1886, lng: 28.3208, province: 'Gauteng', metro: 'East Rand' },
  { name: 'Boksburg', lat: -26.2122, lng: 28.2606, province: 'Gauteng', metro: 'East Rand' },
  { name: 'Springs', lat: -26.2546, lng: 28.4418, province: 'Gauteng', metro: 'East Rand' },
  { name: 'Germiston', lat: -26.2179, lng: 28.1727, province: 'Gauteng', metro: 'East Rand' },
  { name: 'Edenvale', lat: -26.1413, lng: 28.1526, province: 'Gauteng', metro: 'East Rand' },
  { name: 'Kempton Park', lat: -26.1031, lng: 28.2297, province: 'Gauteng', metro: 'East Rand' },
  { name: 'Brakpan', lat: -26.2366, lng: 28.3700, province: 'Gauteng', metro: 'East Rand' },

  // Vaal
  { name: 'Vereeniging', lat: -26.6736, lng: 27.9266, province: 'Gauteng', metro: 'Vaal' },
  { name: 'Vanderbijlpark', lat: -26.7113, lng: 27.8370, province: 'Gauteng', metro: 'Vaal' },

  // ═══════════════════════════════════════
  // KWAZULU-NATAL
  // ═══════════════════════════════════════

  // Durban Metro
  { name: 'Durban', lat: -29.8587, lng: 31.0218, province: 'KwaZulu-Natal', metro: 'Durban Metro' },
  { name: 'Umhlanga', lat: -29.7234, lng: 31.0849, province: 'KwaZulu-Natal', metro: 'Durban Metro' },
  { name: 'Pinetown', lat: -29.8167, lng: 30.8574, province: 'KwaZulu-Natal', metro: 'Durban Metro' },
  { name: 'Hillcrest', lat: -29.7820, lng: 30.7650, province: 'KwaZulu-Natal', metro: 'Durban Metro' },
  { name: 'Kloof', lat: -29.7891, lng: 30.8290, province: 'KwaZulu-Natal', metro: 'Durban Metro' },
  { name: 'Westville', lat: -29.8440, lng: 30.9280, province: 'KwaZulu-Natal', metro: 'Durban Metro' },
  { name: 'Amanzimtoti', lat: -30.0494, lng: 30.8774, province: 'KwaZulu-Natal', metro: 'Durban Metro' },
  { name: 'Durban North', lat: -29.7954, lng: 31.0426, province: 'KwaZulu-Natal', metro: 'Durban Metro' },
  { name: 'Ballito', lat: -29.5390, lng: 31.2140, province: 'KwaZulu-Natal', metro: 'Durban Metro' },

  // Midlands & Inland
  { name: 'Pietermaritzburg', lat: -29.6006, lng: 30.3794, province: 'KwaZulu-Natal', metro: 'Midlands' },
  { name: 'Richards Bay', lat: -28.7830, lng: 32.0377, province: 'KwaZulu-Natal', metro: 'Midlands' },
  { name: 'Newcastle', lat: -27.7576, lng: 29.9318, province: 'KwaZulu-Natal', metro: 'Midlands' },

  // South Coast
  { name: 'Port Shepstone', lat: -30.7413, lng: 30.4548, province: 'KwaZulu-Natal', metro: 'South Coast' },
  { name: 'Margate', lat: -30.8628, lng: 30.3640, province: 'KwaZulu-Natal', metro: 'South Coast' },
  { name: 'Scottburgh', lat: -30.2870, lng: 30.7520, province: 'KwaZulu-Natal', metro: 'South Coast' },

  // ═══════════════════════════════════════
  // EASTERN CAPE
  // ═══════════════════════════════════════

  // Nelson Mandela Bay
  { name: 'Port Elizabeth', lat: -33.9608, lng: 25.6022, province: 'Eastern Cape', metro: 'Nelson Mandela Bay' },
  { name: 'Uitenhage', lat: -33.7668, lng: 25.4025, province: 'Eastern Cape', metro: 'Nelson Mandela Bay' },

  // Buffalo City
  { name: 'East London', lat: -33.0153, lng: 27.9116, province: 'Eastern Cape', metro: 'Buffalo City' },
  { name: 'King Williams Town', lat: -32.8811, lng: 27.3941, province: 'Eastern Cape', metro: 'Buffalo City' },

  // Other Eastern Cape
  { name: 'Makhanda', lat: -33.3093, lng: 26.5228, province: 'Eastern Cape', metro: 'Other' },
  { name: 'Mthatha', lat: -31.5889, lng: 28.7844, province: 'Eastern Cape', metro: 'Other' },

  // ═══════════════════════════════════════
  // FREE STATE
  // ═══════════════════════════════════════

  { name: 'Bloemfontein', lat: -29.0852, lng: 26.1596, province: 'Free State', metro: 'Mangaung' },
  { name: 'Welkom', lat: -27.9771, lng: 26.7350, province: 'Free State', metro: 'Other' },
  { name: 'Sasolburg', lat: -26.8144, lng: 27.8261, province: 'Free State', metro: 'Other' },
  { name: 'Kroonstad', lat: -27.6500, lng: 27.2340, province: 'Free State', metro: 'Other' },

  // ═══════════════════════════════════════
  // MPUMALANGA
  // ═══════════════════════════════════════

  { name: 'Nelspruit', lat: -25.4753, lng: 30.9694, province: 'Mpumalanga', metro: 'Ehlanzeni' },
  { name: 'Witbank', lat: -25.8714, lng: 29.2333, province: 'Mpumalanga', metro: 'Nkangala' },
  { name: 'Secunda', lat: -26.5103, lng: 29.1700, province: 'Mpumalanga', metro: 'Other' },
  { name: 'Middelburg', lat: -25.7750, lng: 29.4700, province: 'Mpumalanga', metro: 'Other' },
  { name: 'White River', lat: -25.3283, lng: 31.0090, province: 'Mpumalanga', metro: 'Ehlanzeni' },

  // ═══════════════════════════════════════
  // LIMPOPO
  // ═══════════════════════════════════════

  { name: 'Polokwane', lat: -23.9045, lng: 29.4689, province: 'Limpopo', metro: 'Capricorn' },
  { name: 'Tzaneen', lat: -23.8340, lng: 30.1630, province: 'Limpopo', metro: 'Mopani' },
  { name: 'Mokopane', lat: -24.1950, lng: 29.0110, province: 'Limpopo', metro: 'Other' },
  { name: 'Lephalale', lat: -23.6850, lng: 27.6970, province: 'Limpopo', metro: 'Other' },

  // ═══════════════════════════════════════
  // NORTH WEST
  // ═══════════════════════════════════════

  { name: 'Rustenburg', lat: -25.6715, lng: 27.2420, province: 'North West', metro: 'Bojanala' },
  { name: 'Potchefstroom', lat: -26.7145, lng: 27.0970, province: 'North West', metro: 'Other' },
  { name: 'Klerksdorp', lat: -26.8523, lng: 26.6662, province: 'North West', metro: 'Other' },
  { name: 'Mahikeng', lat: -25.8653, lng: 25.6445, province: 'North West', metro: 'Other' },
  { name: 'Brits', lat: -25.6340, lng: 27.7800, province: 'North West', metro: 'Bojanala' },

  // ═══════════════════════════════════════
  // NORTHERN CAPE
  // ═══════════════════════════════════════

  { name: 'Kimberley', lat: -28.7382, lng: 24.7639, province: 'Northern Cape', metro: 'Sol Plaatje' },
  { name: 'Upington', lat: -28.4572, lng: 21.2566, province: 'Northern Cape', metro: 'Other' },
  { name: 'Springbok', lat: -29.6685, lng: 17.8834, province: 'Northern Cape', metro: 'Other' },
]

/** Get unique provinces in display order (Western Cape first for launch) */
export const SA_PROVINCES = [
  'Western Cape',
  'Gauteng',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Mpumalanga',
  'Limpopo',
  'North West',
  'Northern Cape',
]

/** Group cities by province */
export function getCitiesByProvince(): Record<string, SACity[]> {
  const grouped: Record<string, SACity[]> = {}
  for (const province of SA_PROVINCES) {
    grouped[province] = SA_CITIES.filter(c => c.province === province)
  }
  return grouped
}

/** Group cities by province → metro → cities hierarchy */
export function getCitiesByProvinceAndMetro(): Record<string, Record<string, SACity[]>> {
  const result: Record<string, Record<string, SACity[]>> = {}
  for (const province of SA_PROVINCES) {
    const provinceCities = SA_CITIES.filter(c => c.province === province)
    const metroGrouped: Record<string, SACity[]> = {}
    for (const city of provinceCities) {
      if (!metroGrouped[city.metro]) metroGrouped[city.metro] = []
      metroGrouped[city.metro].push(city)
    }
    result[province] = metroGrouped
  }
  return result
}
