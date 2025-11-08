// Major US Cities for autocomplete
// Top 200+ cities by population
export const US_CITIES = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
  "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis", "Seattle", "Denver", "Washington",
  "Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City", "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore",
  "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento", "Kansas City", "Mesa", "Atlanta", "Omaha", "Colorado Springs",
  "Raleigh", "Virginia Beach", "Miami", "Oakland", "Minneapolis", "Tulsa", "Cleveland", "Wichita", "Arlington", "Tampa",
  "New Orleans", "Honolulu", "Anaheim", "Santa Ana", "St. Louis", "Riverside", "Corpus Christi", "Lexington", "Henderson", "Stockton",
  "Saint Paul", "Cincinnati", "St. Petersburg", "Pittsburgh", "Greensboro", "Lincoln", "Anchorage", "Plano", "Orlando", "Irvine",
  "Newark", "Durham", "Chula Vista", "Toledo", "Fort Wayne", "St. Louis", "Jersey City", "Madison", "Chandler", "Laredo",
  "Norfolk", "Lubbock", "Buffalo", "Garland", "Glendale", "Hialeah", "Reno", "Baton Rouge", "Irvine", "Chesapeake",
  "Scottsdale", "North Las Vegas", "Fremont", "Boise", "Richmond", "San Bernardino", "Birmingham", "Spokane", "Rochester", "Des Moines",
  "Modesto", "Fayetteville", "Tacoma", "Oxnard", "Fontana", "Columbus", "Montgomery", "Moreno Valley", "Shreveport", "Aurora",
  "Yonkers", "Akron", "Huntington Beach", "Little Rock", "Amarillo", "Port St. Lucie", "Grand Rapids", "Tallahassee", "Grand Prairie", "Overland Park",
  "Tempe", "McKinney", "Cape Coral", "Mobile", "Sioux Falls", "Worcester", "Knoxville", "Ventura", "Elk Grove", "Salem",
  "Ontario", "Bakersfield", "Newport News", "Brownsville", "Fort Lauderdale", "Huntsville", "Santa Clarita", "Providence", "Rancho Cucamonga", "Oceanside",
  "Garden Grove", "Vancouver", "Chattanooga", "Santa Rosa", "Peoria", "Ontario", "Sioux City", "Springfield", "Pembroke Pines", "Corona",
  "Eugene", "Fort Collins", "Salinas", "Springfield", "Pasadena", "Joliet", "Pembroke Pines", "Paterson", "Kansas City", "Torrance",
  "Syracuse", "Bridgeport", "Hayward", "Fort Collins", "Escondido", "Lakewood", "Naperville", "Dayton", "Hollywood", "Sunnyvale",
  "Alexandria", "Mesquite", "Hampton", "Pasadena", "Orange", "Savannah", "Cary", "Fullerton", "Warren", "Clarksville",
  "McAllen", "New Haven", "Sterling Heights", "West Valley City", "Columbia", "Killeen", "Topeka", "Thousand Oaks", "Cedar Rapids", "Olathe",
  "Elizabeth", "Waco", "Hartford", "Visalia", "Gainesville", "Simi Valley", "Stamford", "Bellevue", "Miramar", "Concord",
  "Coral Springs", "Lafayette", "Charleston", "Carrollton", "Roseville", "Thornton", "Beaumont", "Allentown", "Surprise", "Evansville",
  "Abilene", "Santa Clara", "Independence", "Victorville", "Athens", "Vallejo", "Peoria", "Lansing", "Ann Arbor", "El Monte",
  "Downey", "Costa Mesa", "Inglewood", "Miami Gardens", "Manchester", "Murfreesboro", "Compton", "Fairfield", "Clearwater", "Rochester",
  "Westminster", "Waterbury", "Gresham", "Lowell", "Pompano Beach", "Antioch", "West Covina", "Everett", "Richmond", "Burbank",
  "Daly City", "Midland", "Elgin", "Murrieta", "Temecula", "Norwalk", "Santa Maria", "El Cajon", "Rialto", "Boulder",
  "Green Bay", "Wichita Falls", "San Mateo", "Tyler", "Lawton", "Lewisville", "South Bend", "Davenport", "Lakeland", "Edison",
  "Renton", "Vista", "League City", "Davie", "Sandy Springs", "Las Cruces", "Brockton", "Kenosha", "Greeley", "Baytown",
  "Boca Raton", "Arvada", "Sparks", "Tuscaloosa", "Roanoke", "Allen", "Rio Rancho", "Orem", "Yakima", "Norfolk",
  "Fargo", "Spokane Valley", "Wilmington", "Layton", "Dearborn", "Livonia", "Longmont", "Portsmouth", "Mission Viejo", "Brockton",
].sort();

// Helper function to filter cities by search query
export const filterCities = (query: string): string[] => {
  if (!query || query.length < 2) return [];
  const lowerQuery = query.toLowerCase();
  return US_CITIES.filter(city => 
    city.toLowerCase().startsWith(lowerQuery) || 
    city.toLowerCase().includes(lowerQuery)
  ).slice(0, 10); // Limit to 10 results
};

