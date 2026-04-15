// Seeded pseudo-random for reproducible data
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack',
  'Kate', 'Leo', 'Mia', 'Noah', 'Olivia', 'Pete', 'Quinn', 'Rose', 'Sam', 'Tara'];
const DEPTS = ['Engineering', 'Sales', 'Marketing', 'Support', 'Finance', 'HR', 'Legal', 'Ops'];
const STATUSES = ['active', 'inactive', 'pending', 'suspended'];
const CITIES = ['SF', 'NYC', 'London', 'Berlin', 'Tokyo', 'Sydney', 'Toronto', 'Paris'];

export function generateDataset(count, seed = 42) {
  const rand = seededRandom(seed);
  const rows = new Array(count);
  for (let i = 0; i < count; i++) {
    rows[i] = {
      id: i + 1,
      name: NAMES[Math.floor(rand() * NAMES.length)] + ' ' + NAMES[Math.floor(rand() * NAMES.length)],
      email: `user${i + 1}@example.com`,
      department: DEPTS[Math.floor(rand() * DEPTS.length)],
      status: STATUSES[Math.floor(rand() * STATUSES.length)],
      city: CITIES[Math.floor(rand() * CITIES.length)],
      salary: Math.floor(rand() * 150000) + 50000,
      score: Math.floor(rand() * 10000) / 100,
      joined: `20${10 + Math.floor(rand() * 15)}-${String(Math.floor(rand() * 12) + 1).padStart(2, '0')}-${String(Math.floor(rand() * 28) + 1).padStart(2, '0')}`,
    };
  }
  return rows;
}
