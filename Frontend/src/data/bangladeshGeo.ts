import { BangladeshDivision } from '../types';

export const BANGLADESH_DIVISIONS: BangladeshDivision[] = [
  {
    name: 'Dhaka',
    districts: [
      'Dhaka',
      'Gazipur',
      'Narayanganj',
      'Tangail',
      'Narsingdi',
      'Munshiganj',
      'Manikganj',
      'Kishoreganj',
      'Faridpur',
      'Gopalganj',
      'Madaripur',
      'Rajbari',
      'Shariatpur',
    ],
  },
  {
    name: 'Chattogram',
    districts: [
      'Chattogram',
      'Cox\'s Bazar',
      'Cumilla',
      'Feni',
      'Brahmanbaria',
      'Noakhali',
      'Chandpur',
      'Lakshmipur',
      'Rangamati',
      'Khagrachhari',
      'Bandarban',
    ],
  },
  {
    name: 'Rajshahi',
    districts: [
      'Rajshahi',
      'Bogura',
      'Pabna',
      'Sirajganj',
      'Naogaon',
      'Natore',
      'Joypurhat',
      'Chapainawabganj',
    ],
  },
  {
    name: 'Sylhet',
    districts: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  },
  {
    name: 'Khulna',
    districts: [
      'Khulna',
      'Jashore',
      'Kushtia',
      'Jhenaidah',
      'Satkhira',
      'Bagerhat',
      'Chuadanga',
      'Meherpur',
      'Narail',
      'Magura',
    ],
  },
  {
    name: 'Barishal',
    districts: ['Barishal', 'Bhola', 'Patuakhali', 'Pirojpur', 'Barguna', 'Jhalokati'],
  },
  {
    name: 'Rangpur',
    districts: [
      'Rangpur',
      'Dinajpur',
      'Kurigram',
      'Gaibandha',
      'Nilphamari',
      'Panchagarh',
      'Thakurgaon',
      'Lalmonirhat',
    ],
  },
  {
    name: 'Mymensingh',
    districts: ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'],
  },
];

export const FREE_DELIVERY_THRESHOLD = 5000;
export const INSIDE_DHAKA_FEE = 60;
export const OUTSIDE_DHAKA_FEE = 120;

export function calculateDeliveryFee(district: string, subtotal: number): number {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) {
    return 0;
  }
  const isInsideDhaka = district.trim().toLowerCase() === 'dhaka';
  return isInsideDhaka ? INSIDE_DHAKA_FEE : OUTSIDE_DHAKA_FEE;
}

export function formatBDT(amount: number): string {
  return `৳ ${amount.toLocaleString('en-IN')}`;
}

export function isValidBDPhone(phone: string): boolean {
  // Matches 01XXXXXXXXX (11 digits starting with 013-019)
  const cleaned = phone.replace(/\s+|-/g, '');
  return /^01[3-9]\d{8}$/.test(cleaned);
}
