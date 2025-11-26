/**
 * Swanson Industries Corporate Knowledge Base
 * This file contains authoritative information about Swanson Industries
 * that AI agents can reference to provide accurate, context-aware assistance.
 *
 * Last Updated: March 2025
 */

export const SWANSON_INDUSTRIES_CONTEXT = {
  // I. Corporate Identity & Overview
  company: {
    legalName: 'Swanson Industries, Inc.',
    founded: 1964,
    foundedAs: 'Swanson Plating Company',
    type: 'Privately-held',
    employees: '300+',
    manufacturingFootprint:
      '385,000 square feet across three main US production facilities',
  },

  headquarters: {
    address: '2608 Smithtown Road',
    city: 'Morgantown',
    state: 'West Virginia',
    country: 'United States',
  },

  // II. Company History - Key Milestones
  history: [
    { year: 1964, event: 'Founded as Swanson Plating Company' },
    {
      year: 1999,
      event:
        'Renamed to Swanson Industries, Inc. under new ownership, merged with MMH, Laser Processing, and MTS',
    },
    {
      year: 2006,
      event:
        'Expanded from repair/remanufacture to new hydraulic cylinder manufacturing',
    },
    {
      year: 2012,
      event: 'AEA Investors & Manulife acquired company to expand facilities',
    },
    {
      year: 2014,
      event: 'Completed exit from Swanson Industries Australia operations',
    },
    {
      year: 2022,
      event:
        'Acquired majority ownership of Tiefenbach North America (TNA); opened Elko facility',
    },
    {
      year: 2024,
      event:
        'Turnspire Capital Partners acquired Swanson Industries from AEA Investors',
    },
    {
      year: 2025,
      event:
        'David Brightbill appointed CEO; acquired TransAxle Off-Highway business',
    },
  ],

  // III. Leadership
  leadership: {
    ceo: {
      name: 'David Brightbill',
      appointed: 'March 2025',
      background:
        '35 years global mining and metals industry experience, previously led global mining operations at Nalco',
    },
    chairman: {
      name: 'Abel S. Osorio',
      title: 'Chairman of the Board',
      affiliation: 'Partner at Turnspire Capital Partners',
    },
    vpMining: {
      name: 'Chris Dulin',
      title: 'VP of Mining',
      joined: 2022,
      background: 'Former Managing Director of Tiefenbach North America',
    },
    founder: {
      name: 'Paul Swanson',
    },
  },

  // IV. Core Business & Products
  industries: [
    'Fluid Power',
    'Mining',
    'Off-Highway',
    'Steel',
    'Construction',
    'Marine',
    'Remanufacturing',
    'Engineering Services',
  ],

  coreFunction:
    'Market-leading provider of manufacturing, remanufacturing, repair, and distribution services for hydraulic cylinders, mining equipment, and related industrial equipment',

  products: {
    hydraulicCylinders: {
      description:
        'Design, manufacturing, remanufacturing, repair, and distribution',
      specialization:
        'Mission-critical hydraulic cylinders for rugged, demanding heavy industry applications',
      certifications: 'Restores cylinders to OEM specifications',
    },
    miningEquipment: {
      description:
        'Manufacturing, remanufacturing, and repair of mission-critical mining equipment',
      specialty: 'Longwall system refurbishment (shield refurbishment via MTS)',
    },
    components: {
      items: [
        'Hydraulic pumps',
        'Motors',
        'Valves',
        'Manifolds',
        'Assemblies',
        'Hoses',
        'Fittings',
        'Power units',
      ],
    },
  },

  // V. Specialized Technologies
  surfaceTechnologies: [
    {
      name: 'Industrial Chrome Plating',
      purpose: 'Cylinder protection and wear resistance',
    },
    { name: 'Friction Welding', purpose: 'Precision joining technique' },
    {
      name: 'Laser Cladding',
      purpose: 'Advanced surface technology for resurfacing and repair',
    },
    {
      name: 'Induction Hardening',
      purpose: 'Heat treatment to increase surface hardness and fatigue life',
    },
    {
      name: 'Precision Machining',
      purpose: 'Highly detailed component restoration',
    },
    { name: 'Submerged Arc Welding', purpose: 'Component restoration welding' },
  ],

  // VI. Programs & Services
  programs: {
    cylinderXpress: {
      name: 'Cylinder Xpress',
      description:
        'Cylinder exchange program offering remanufactured hydraulic cylinders to OEM specifications',
      benefit: 'Available for immediate delivery to reduce customer downtime',
    },
  },

  // VII. Facilities & Geographic Footprint
  facilities: {
    usLocations: 16,
    states: [
      'West Virginia',
      'Pennsylvania',
      'Utah',
      'Kentucky',
      'Montana',
      'Nevada (Elko)',
    ],
    international: ['Chile', 'China'],
    tnaLocations: ['Morgantown WV', 'Illinois', 'Utah', 'Alabama'],
  },

  // VIII. Strategic Partnerships & Distribution
  partnerships: [
    {
      name: 'Tiefenbach North America (TNA)',
      relationship: 'Majority ownership',
      specialty: 'Hydraulic controls and hose assemblies for longwall systems',
    },
    {
      name: 'Parker Hannifin Hydraulics Products',
      type: 'Distribution partner',
    },
    { name: 'J. H. Fletcher', type: 'Distribution partner' },
    { name: 'DERON Mining Equipment', type: 'Distribution partner' },
    { name: 'KAMAT', type: 'Distribution partner' },
  ],

  // IX. Target Markets
  markets: {
    mining: {
      description: 'Primary sector focus',
      products:
        'Longwall shield refurbishment, specialized hydraulic cylinders, hydraulic controls, components',
      importance: 'Critical minerals and energy resource production',
    },
    fluidPower: {
      description: 'Key leader in entire fluid power lifecycle',
      services:
        'New product design, manufacturing, remanufacturing, and repair of hydraulic components',
    },
    offHighway: {
      description: 'Mobile and off-highway equipment markets',
      services: 'Remanufacturing and repair services',
    },
    steel: {
      description: 'Heavy industrial steel operations',
      services: 'Hydraulic system products and repair',
    },
    construction: {
      description: 'Construction equipment and operations',
      services: 'Hydraulic system products and repair',
    },
    marine: {
      description: 'Marine industry applications',
      services: 'Hydraulic cylinder manufacturing, remanufacturing, and repair',
    },
  },

  // X. Company Values & Mission
  mission:
    'Provide high-quality, engineered products and technical expertise to enhance the safety and efficiency of critical heavy operations',

  strategicFocus: [
    'New market development',
    'Operational transformation',
    'Strategic growth through acquisitions',
    'Enhanced capabilities in mining and heavy industry',
  ],
};

// Helper function for AI agents to access specific context
export function getSwansonContext(
  category?: keyof typeof SWANSON_INDUSTRIES_CONTEXT,
) {
  if (category) {
    return SWANSON_INDUSTRIES_CONTEXT[category];
  }

  return SWANSON_INDUSTRIES_CONTEXT;
}

// Common customer types for Swanson Industries
export const SWANSON_CUSTOMER_TYPES = [
  'Mining Operations',
  'Longwall Mining Systems',
  'Underground Mining Equipment Manufacturers',
  'Surface Mining Operations',
  'Off-Highway Equipment Manufacturers',
  'Steel Mills and Production Facilities',
  'Construction Equipment Manufacturers',
  'Marine Equipment Operators',
  'Hydraulic Equipment Distributors',
  'Original Equipment Manufacturers (OEMs)',
];

// Typical equipment types Swanson works with
export const SWANSON_EQUIPMENT_TYPES = [
  'Longwall Shield Systems',
  'Hydraulic Roof Supports',
  'Mining Excavators',
  'Draglines',
  'Hydraulic Shovels',
  'Underground Loaders',
  'Continuous Miners',
  'Off-Highway Dump Trucks',
  'Mobile Cranes',
  'Steel Mill Equipment',
  'Marine Deck Equipment',
  'Construction Excavators',
];
