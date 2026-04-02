export const BNS_SECTIONS = {
  'Cybercrime/Hacking':       ['IT Act §66 - Hacking', 'IT Act §43 - Damage to Computer', 'BNS 2024 §111 - Organised Cybercrime'],
  'Fraud/Deception':          ['BNS 2024 §318 - Cheating', 'BNS 2024 §318(4) - Cheating with Delivery'],
  'Identity Theft':           ['IT Act §66C - Identity Theft', 'BNS 2024 §319 - Cheating by Impersonation'],
  'Harassment':               ['BNS 2024 §351 - Criminal Intimidation', 'BNS 2024 §352 - Intentional Insult'],
  'Stalking':                 ['BNS 2024 §78 - Stalking'],
  'Extortion/Blackmail':      ['BNS 2024 §308 - Extortion', 'BNS 2024 §309 - Punishment for Extortion'],
  'Domestic Violence':        ['BNS 2024 §85 - Cruelty by Husband', 'Protection of Women from DV Act 2005'],
  'Sexual Assault':           ['BNS 2024 §64 - Rape', 'BNS 2024 §74 - Assault on Woman'],
  'Robbery':                  ['BNS 2024 §309 - Robbery', 'BNS 2024 §296 - Robbery with Hurt'],
  'Kidnapping':               ['BNS 2024 §137 - Kidnapping', 'BNS 2024 §140 - Kidnapping for Ransom'],
  'Homicide':                 ['BNS 2024 §101 - Murder', 'BNS 2024 §105 - Culpable Homicide'],
  'Attempted Murder':         ['BNS 2024 §109 - Attempt to Murder'],
  'Burglary':                 ['BNS 2024 §305 - Theft in Dwelling', 'BNS 2024 §331 - House Trespass'],
  'Larceny/Theft':            ['BNS 2024 §303 - Theft', 'BNS 2024 §304 - Snatching'],
  'Motor Vehicle Theft':      ['BNS 2024 §303 - Theft', 'Motor Vehicles Act 1988'],
  'Arson':                    ['BNS 2024 §324 - Mischief by Fire', 'BNS 2024 §325 - Mischief by Fire on Dwelling'],
  'Drug Trafficking':         ['NDPS Act §20 - Production/Sale', 'BNS 2024 §111 - Organised Drug Crime'],
  'Drug Possession':          ['NDPS Act §27 - Possession'],
  'Embezzlement':             ['BNS 2024 §316 - Criminal Breach of Trust'],
  'Weapons Offenses':         ['Arms Act §25 - Unlicensed Arms'],
  'Traffic/DUI':              ['Motor Vehicles Act §185 - DUI', 'BNS 2024 §281 - Rash Driving'],
  'Hit and Run':              ['Motor Vehicles Act §161 - Hit and Run', 'BNS 2024 §106 - Death by Negligence'],
  'Aggravated Assault':       ['BNS 2024 §117 - Grievous Hurt', 'BNS 2024 §118(3) - Grievous Hurt by Weapon'],
  'Simple Assault':           ['BNS 2024 §115 - Voluntarily Causing Hurt'],
  'Vandalism/Property Damage':['BNS 2024 §324 - Mischief causing Damage'],
  'Trespassing':              ['BNS 2024 §329(3) - Criminal Trespass'],
  'Disorderly Conduct':       ['BNS 2024 §223 - Public Nuisance'],
};

export const DEPARTMENT_MAP = {
  'Cybercrime/Hacking':   'Cyber Crime Cell',
  'Identity Theft':       'Cyber Crime Cell',
  'Fraud/Deception':      'Economic Offences Wing',
  'Embezzlement':         'Economic Offences Wing',
  'Drug Trafficking':     'Narcotics Control Bureau',
  'Drug Possession':      'Narcotics Control Bureau',
  'Homicide':             'Criminal Investigation Department',
  'Attempted Murder':     'Criminal Investigation Department',
  'Kidnapping':           'Criminal Investigation Department',
  'Sexual Assault':       'Women Safety Wing',
  'Domestic Violence':    'Women Safety Wing',
  'Stalking':             'Women Safety Wing',
  'Weapons Offenses':     'Special Weapons Task Force',
  'Traffic/DUI':          'Traffic Police',
  'Hit and Run':          'Traffic Police',
};

export const CITY_COORDS = {
  'Hyderabad': { lat: 17.385,  lng: 78.4867 },
  'Mumbai':    { lat: 19.076,  lng: 72.8777 },
  'Delhi':     { lat: 28.7041, lng: 77.1025 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Chennai':   { lat: 13.0827, lng: 80.2707 },
  'Kolkata':   { lat: 22.5726, lng: 88.3639 },
  'Pune':      { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Jaipur':    { lat: 26.9124, lng: 75.7873 },
  'Lucknow':   { lat: 26.8467, lng: 80.9462 },
};

export function getBnsSections(categories) {
  const sections = new Set();
  categories.forEach(cat => (BNS_SECTIONS[cat] || ['IT Act §66']).forEach(s => sections.add(s)));
  return [...sections];
}

export function getDepartment(categories) {
  for (const cat of categories) {
    if (DEPARTMENT_MAP[cat]) return DEPARTMENT_MAP[cat];
  }
  return 'Cyber Crime Cell';
}

export function getCityCoords(city) {
  return CITY_COORDS[city] || { lat: 20.5937, lng: 78.9629 };
}
