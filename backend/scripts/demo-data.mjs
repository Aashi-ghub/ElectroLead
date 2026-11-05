/**
 * The demo dataset, as data rather than code.
 *
 * Kept separate from seed-demo.mjs so the cast can grow without touching the
 * seeding logic. Everything here is deliberately specific: real Indian
 * industrial cities, trade names that read like actual electrical businesses,
 * and project briefs with the kind of detail a buyer would really write.
 * Generic placeholder data is what makes a demo feel fake.
 */

export const CATEGORIES = [
  { key: 'cables', label: 'Wires & Cables', blurb: 'LT/HT cable, armoured, flexible, control' },
  { key: 'switchgear', label: 'Switchgear & Panels', blurb: 'MCB, MCCB, ACB, distribution boards' },
  { key: 'transformers', label: 'Transformers', blurb: 'Distribution, isolation, dry-type' },
  { key: 'lighting', label: 'LED & Lighting', blurb: 'Industrial, street, flameproof fittings' },
  { key: 'motors', label: 'Motors & Drives', blurb: 'Induction motors, VFDs, soft starters' },
  { key: 'solar', label: 'Solar & Renewables', blurb: 'Rooftop PV, inverters, mounting' },
  { key: 'conduits', label: 'Conduits & Fittings', blurb: 'Cable tray, raceway, glands, lugs' },
  { key: 'testing', label: 'Test & Measurement', blurb: 'Meters, relays, calibration' },
]

// plan: null = free tier (own city only)
export const SELLERS = [
  // --- Maharashtra ---------------------------------------------------------
  { email: 'demo.seller.local@voltsupply.in', name: 'Rohit Mehta', company: 'Mehta Electricals', city: 'Mumbai', state: 'Maharashtra', category: 'cables', plan: null, years: 14, rating: 4.6, reviews: 128, response: 3, kyc: 'approved', about: 'Authorised Polycab and KEI distributor supplying LT and control cable to contractors across Mumbai and Navi Mumbai since 2011.' },
  { email: 'demo.seller.state@voltsupply.in', name: 'Deepak Joshi', company: 'Joshi Power Systems', city: 'Pune', state: 'Maharashtra', category: 'switchgear', plan: 'state', years: 21, rating: 4.8, reviews: 243, response: 2, kyc: 'approved', about: 'Panel builders for IT parks and manufacturing plants. In-house fabrication, CPRI-tested assemblies, on-site commissioning teams in Pune and PCMC.' },
  { email: 'demo.seller.national@voltsupply.in', name: 'Karthik Raman', company: 'Raman Switchgear India', city: 'Chennai', state: 'Tamil Nadu', category: 'switchgear', plan: 'national', years: 27, rating: 4.9, reviews: 391, response: 1, kyc: 'approved', about: 'Pan-India supplier of HT and LT switchgear with service centres in eight states. Siemens and L&T channel partner.' },
  { email: 'demo.seller.pending@voltsupply.in', name: 'Amit Verma', company: 'Verma Cables', city: 'Mumbai', state: 'Maharashtra', category: 'cables', plan: null, years: 3, rating: null, reviews: 0, response: 8, kyc: 'pending', about: 'Cable and conductor trading house serving Mumbai metropolitan contractors.' },

  { email: 'supplier.shakti@voltsupply.in', name: 'Nilesh Patil', company: 'Shakti Electricals & Hardware', city: 'Nashik', state: 'Maharashtra', category: 'conduits', plan: 'state', years: 18, rating: 4.4, reviews: 96, response: 4, kyc: 'approved', about: 'Cable tray, GI conduit and earthing material for industrial projects across north Maharashtra.' },
  { email: 'supplier.vidyut@voltsupply.in', name: 'Sanjay Kulkarni', company: 'Vidyut Controls', city: 'Nagpur', state: 'Maharashtra', category: 'motors', plan: null, years: 9, rating: 4.2, reviews: 51, response: 6, kyc: 'approved', about: 'Induction motors, VFDs and rewinding services for textile and cement plants in Vidarbha.' },
  { email: 'supplier.sunrise@voltsupply.in', name: 'Meera Deshpande', company: 'Sunrise Illumination', city: 'Pune', state: 'Maharashtra', category: 'lighting', plan: 'national', years: 11, rating: 4.7, reviews: 164, response: 2, kyc: 'approved', about: 'Industrial and architectural LED lighting. Lux-level design and DIALux layouts provided free with every quotation.' },

  // --- Delhi NCR -----------------------------------------------------------
  { email: 'supplier.bharat@voltsupply.in', name: 'Harpreet Singh', company: 'Bharat Cable Industries', city: 'Delhi', state: 'Delhi', category: 'cables', plan: 'national', years: 32, rating: 4.7, reviews: 412, response: 2, kyc: 'approved', about: 'Manufacturer of XLPE and PVC insulated cables up to 33kV. ISI marked, supplying state utilities and EPC contractors since 1993.' },
  { email: 'supplier.capital@voltsupply.in', name: 'Rajeev Khanna', company: 'Capital Power Solutions', city: 'Gurugram', state: 'Haryana', category: 'transformers', plan: 'national', years: 16, rating: 4.5, reviews: 118, response: 3, kyc: 'approved', about: 'Distribution and package substations up to 2500 kVA, with annual maintenance contracts across NCR.' },
  { email: 'supplier.noida@voltsupply.in', name: 'Pooja Agarwal', company: 'Agarwal Electro Components', city: 'Noida', state: 'Uttar Pradesh', category: 'testing', plan: 'national', years: 7, rating: 4.3, reviews: 64, response: 5, kyc: 'approved', about: 'Protection relays, energy meters and NABL calibration services for commercial installations.' },

  // --- Karnataka / Telangana ----------------------------------------------
  { email: 'supplier.nandi@voltsupply.in', name: 'Suresh Gowda', company: 'Nandi Power Equipment', city: 'Bengaluru', state: 'Karnataka', category: 'switchgear', plan: 'national', years: 23, rating: 4.8, reviews: 287, response: 2, kyc: 'approved', about: 'LT panels, bus ducts and capacitor banks for data centres and IT campuses. UL and CPRI certified assemblies.' },
  { email: 'supplier.surya@voltsupply.in', name: 'Anitha Reddy', company: 'Surya Renewables', city: 'Hyderabad', state: 'Telangana', category: 'solar', plan: 'national', years: 10, rating: 4.6, reviews: 142, response: 3, kyc: 'approved', about: 'Rooftop solar EPC from 50 kW to 5 MW. MNRE empanelled, with O&M contracts across Telangana and Andhra Pradesh.' },
  { email: 'supplier.deccan@voltsupply.in', name: 'Vikram Rao', company: 'Deccan Motor Works', city: 'Hyderabad', state: 'Telangana', category: 'motors', plan: null, years: 19, rating: 4.4, reviews: 89, response: 4, kyc: 'approved', about: 'Crompton and ABB motor dealer with in-house rewinding and dynamic balancing workshop.' },

  // --- Tamil Nadu ----------------------------------------------------------
  { email: 'supplier.kovai@voltsupply.in', name: 'Murugan Subramanian', company: 'Kovai Motor & Pump', city: 'Coimbatore', state: 'Tamil Nadu', category: 'motors', plan: 'national', years: 29, rating: 4.7, reviews: 203, response: 3, kyc: 'approved', about: 'Pump sets and three-phase motors for textile mills and agriculture. Manufacturing since 1996 in Coimbatore.' },
  { email: 'supplier.chennailite@voltsupply.in', name: 'Lakshmi Narayanan', company: 'Chennai Lighting House', city: 'Chennai', state: 'Tamil Nadu', category: 'lighting', plan: 'national', years: 12, rating: 4.1, reviews: 73, response: 7, kyc: 'approved', about: 'Street lighting, high-mast and flameproof fittings for municipal and port projects.' },

  // --- Gujarat -------------------------------------------------------------
  { email: 'supplier.gujarat@voltsupply.in', name: 'Bhavesh Patel', company: 'Gujarat Electro Works', city: 'Ahmedabad', state: 'Gujarat', category: 'transformers', plan: 'national', years: 25, rating: 4.6, reviews: 198, response: 2, kyc: 'approved', about: 'Dry-type and oil-cooled transformer manufacturer, 25 kVA to 5 MVA, with type-test certificates from ERDA.' },
  { email: 'supplier.surat@voltsupply.in', name: 'Kiran Shah', company: 'Shah Cable & Conductor', city: 'Surat', state: 'Gujarat', category: 'cables', plan: 'state', years: 15, rating: 4.3, reviews: 87, response: 5, kyc: 'approved', about: 'Aluminium and copper conductor supplier to textile processing houses and solar EPCs in south Gujarat.' },

  // --- Rest of India -------------------------------------------------------
  { email: 'supplier.kolkata@voltsupply.in', name: 'Debashish Roy', company: 'Eastern Electricals', city: 'Kolkata', state: 'West Bengal', category: 'conduits', plan: null, years: 22, rating: 4.2, reviews: 110, response: 6, kyc: 'approved', about: 'Cable accessories, glands, lugs and earthing systems for eastern region utilities.' },
  { email: 'supplier.jaipur@voltsupply.in', name: 'Mahendra Sharma', company: 'Marudhar Solar', city: 'Jaipur', state: 'Rajasthan', category: 'solar', plan: 'national', years: 8, rating: 4.5, reviews: 97, response: 4, kyc: 'approved', about: 'Ground-mount and rooftop solar for industrial consumers in Rajasthan. 42 MW commissioned to date.' },
  { email: 'supplier.ludhiana@voltsupply.in', name: 'Gurpreet Dhillon', company: 'Dhillon Switchgear', city: 'Ludhiana', state: 'Punjab', category: 'switchgear', plan: 'state', years: 17, rating: 4.4, reviews: 76, response: 5, kyc: 'approved', about: 'Distribution boards and control panels for cycle, hosiery and auto-component units across Punjab.' },
  { email: 'supplier.indore@voltsupply.in', name: 'Ashish Jain', company: 'Malwa Power Systems', city: 'Indore', state: 'Madhya Pradesh', category: 'testing', plan: 'national', years: 13, rating: 4.5, reviews: 81, response: 3, kyc: 'approved', about: 'Relay testing, thermography and electrical safety audits for manufacturing plants in central India.' },
  { email: 'supplier.kochi@voltsupply.in', name: 'Thomas Varghese', company: 'Backwater Electricals', city: 'Kochi', state: 'Kerala', category: 'lighting', plan: null, years: 11, rating: 4.3, reviews: 68, response: 6, kyc: 'approved', about: 'Marine-grade and corrosion-resistant lighting for port, shipyard and coastal installations.' },
  { email: 'supplier.bhubaneswar@voltsupply.in', name: 'Priyanka Mohanty', company: 'Kalinga Power Trade', city: 'Bhubaneswar', state: 'Odisha', category: 'cables', plan: null, years: 6, rating: 4.0, reviews: 39, response: 8, kyc: 'pending', about: 'Cable and conductor supply for mining and steel sector contractors in Odisha.' },
  { email: 'supplier.lucknow@voltsupply.in', name: 'Faisal Ahmed', company: 'Awadh Electricals', city: 'Lucknow', state: 'Uttar Pradesh', category: 'conduits', plan: null, years: 9, rating: 4.1, reviews: 55, response: 7, kyc: 'approved', about: 'Conduit, tray and wiring accessories for government and institutional building projects.' },
]

export const BUYERS = [
  { email: 'demo.buyer@voltsupply.in', name: 'Priya Sharma', company: 'Sharma Infrastructure Pvt Ltd', city: 'Mumbai', state: 'Maharashtra', years: 18, kyc: 'approved', about: 'Civil and MEP contractor delivering metro, warehousing and commercial projects across western India.' },
  { email: 'demo.buyer2@voltsupply.in', name: 'Arjun Nair', company: 'Nair Constructions', city: 'Chennai', state: 'Tamil Nadu', years: 12, kyc: 'approved', about: 'Industrial construction and plant electrification contractor in Tamil Nadu.' },
  { email: 'buyer.textile@voltsupply.in', name: 'Rameshwar Agarwal', company: 'Shree Balaji Textiles', city: 'Surat', state: 'Gujarat', years: 24, kyc: 'approved', about: 'Textile processing house running three units in Surat and Vapi.' },
  { email: 'buyer.datacentre@voltsupply.in', name: 'Nikhil Menon', company: 'Orbit Data Infrastructure', city: 'Bengaluru', state: 'Karnataka', years: 7, kyc: 'approved', about: 'Colocation data centre operator building Tier III facilities in Bengaluru and Hyderabad.' },
  { email: 'buyer.hospital@voltsupply.in', name: 'Dr. Sneha Kulkarni', company: 'Aarogya Hospitals', city: 'Pune', state: 'Maharashtra', years: 15, kyc: 'approved', about: 'Multi-speciality hospital group expanding to four new campuses.' },
  { email: 'buyer.coldchain@voltsupply.in', name: 'Jaspreet Kaur', company: 'FreshLink Cold Chain', city: 'Ludhiana', state: 'Punjab', years: 9, kyc: 'approved', about: 'Cold storage and reefer logistics operator across north India.' },
  { email: 'buyer.realty@voltsupply.in', name: 'Aditya Bhatt', company: 'Skyline Realty', city: 'Ahmedabad', state: 'Gujarat', years: 20, kyc: 'approved', about: 'Residential and mixed-use developer with 4 million sq ft under construction.' },
  { email: 'buyer.hotels@voltsupply.in', name: 'Farida Contractor', company: 'Heritage Hotels Group', city: 'Jaipur', state: 'Rajasthan', years: 31, kyc: 'approved', about: 'Heritage hotel group refurbishing properties across Rajasthan.' },
  { email: 'buyer.auto@voltsupply.in', name: 'Sandeep Yadav', company: 'Precision Auto Components', city: 'Gurugram', state: 'Haryana', years: 17, kyc: 'approved', about: 'Tier-1 automotive component manufacturer supplying OEMs in the NCR belt.' },
  { email: 'buyer.port@voltsupply.in', name: 'Mathew Joseph', company: 'Coastal Port Services', city: 'Kochi', state: 'Kerala', years: 13, kyc: 'approved', about: 'Port handling and terminal operations contractor.' },
]

// quoteDeadlineDays is relative to the seed run, so deadlines are never stale.
export const ENQUIRIES = [
  { buyer: 'demo.buyer@voltsupply.in', title: 'LT Cable Supply for Andheri Warehouse', category: 'cables', city: 'Mumbai', state: 'Maharashtra', min: 1800000, max: 2400000, days: 14, description: '3-core 240 sq mm XLPE armoured cable, approximately 2,400 metres. ISI marked, test certificates required. Delivery to Andheri East site in two phases.' },
  { buyer: 'demo.buyer@voltsupply.in', title: 'Distribution Panels for Hinjewadi Office Block', category: 'switchgear', city: 'Pune', state: 'Maharashtra', min: 900000, max: 1300000, days: 21, description: '12 nos. floor-mounted distribution boards, IP54, with MCB/RCCB protection. Installation support preferred. Drawings available on request.' },
  { buyer: 'demo.buyer2@voltsupply.in', title: 'Transformer Supply for Sriperumbudur Unit', category: 'transformers', city: 'Chennai', state: 'Tamil Nadu', min: 4500000, max: 6000000, days: 30, description: '2 x 1000 kVA oil-cooled distribution transformers with HT panels and commissioning. ERDA type-test certificates mandatory.' },

  { buyer: 'buyer.textile@voltsupply.in', title: 'VFD Retrofit for Processing Line', category: 'motors', city: 'Surat', state: 'Gujarat', min: 1200000, max: 1800000, days: 18, description: '18 nos. variable frequency drives, 15 kW to 45 kW, to retrofit existing stenter and dyeing lines. Harmonic filters required to meet IEEE 519.' },
  { buyer: 'buyer.textile@voltsupply.in', title: 'Rooftop Solar 500 kW for Pandesara Unit', category: 'solar', city: 'Surat', state: 'Gujarat', min: 18000000, max: 23000000, days: 35, description: '500 kWp rooftop grid-tied solar with net metering. Includes structure, inverters, and 5-year O&M. Shed area approximately 45,000 sq ft.' },

  { buyer: 'buyer.datacentre@voltsupply.in', title: 'Bus Duct and LT Panels for Tier III Facility', category: 'switchgear', city: 'Bengaluru', state: 'Karnataka', min: 28000000, max: 35000000, days: 28, description: '2500A sandwich bus duct runs plus main LT panels with ATS. Form 4b Type 6 construction, CPRI short-circuit certified. Phased delivery over 5 months.' },
  { buyer: 'buyer.datacentre@voltsupply.in', title: 'Precision Earthing and Lightning Protection', category: 'conduits', city: 'Bengaluru', state: 'Karnataka', min: 2200000, max: 3000000, days: 20, description: 'Maintenance-free chemical earthing (28 pits) with copper bonded electrodes and ESE lightning protection for a 4-floor data hall.' },

  { buyer: 'buyer.hospital@voltsupply.in', title: 'Medical-Grade Isolation Transformers', category: 'transformers', city: 'Pune', state: 'Maharashtra', min: 3200000, max: 4200000, days: 25, description: '8 nos. 10 kVA isolation transformers with line isolation monitors for operation theatres and ICU. IS 15601 compliance required.' },
  { buyer: 'buyer.hospital@voltsupply.in', title: 'LED Retrofit Across Four Hospital Floors', category: 'lighting', city: 'Pune', state: 'Maharashtra', min: 1400000, max: 1900000, days: 16, description: 'Approximately 1,600 fittings. Low-glare, flicker-free panels for patient areas. Lux calculations and samples required before order.' },

  { buyer: 'buyer.coldchain@voltsupply.in', title: 'Motor and Starter Package for Cold Store', category: 'motors', city: 'Ludhiana', state: 'Punjab', min: 2600000, max: 3400000, days: 22, description: '22 nos. TEFC motors 7.5 kW to 30 kW with star-delta starters for ammonia compressor and condenser fans. IE3 efficiency minimum.' },
  { buyer: 'buyer.coldchain@voltsupply.in', title: 'Cable Tray and Containment, Rajpura Facility', category: 'conduits', city: 'Rajpura', state: 'Punjab', min: 800000, max: 1200000, days: 15, description: 'Hot-dip galvanised perforated tray, 150mm to 600mm widths, approximately 3,200 running metres with accessories and supports.' },

  { buyer: 'buyer.realty@voltsupply.in', title: 'Wiring Package for 480-Flat Tower', category: 'cables', city: 'Ahmedabad', state: 'Gujarat', min: 9500000, max: 12500000, days: 32, description: 'FR-LSH house wiring 1.0 to 6.0 sq mm for three residential towers. Phased delivery against monthly schedule. Rate contract preferred.' },
  { buyer: 'buyer.realty@voltsupply.in', title: 'Common-Area Lighting and Controls', category: 'lighting', city: 'Ahmedabad', state: 'Gujarat', min: 2800000, max: 3600000, days: 24, description: 'Corridor, basement and landscape lighting with daylight and occupancy sensors. DALI-compatible drivers preferred.' },

  { buyer: 'buyer.hotels@voltsupply.in', title: 'Decorative and Facade Lighting, Udaipur Property', category: 'lighting', city: 'Udaipur', state: 'Rajasthan', min: 4200000, max: 5800000, days: 30, description: 'Warm-white facade wash, courtyard and heritage-sensitive interior fittings. IP66 for external. Mock-up required before final order.' },
  { buyer: 'buyer.hotels@voltsupply.in', title: 'DG Synchronisation Panel, Jaipur', category: 'switchgear', city: 'Jaipur', state: 'Rajasthan', min: 1900000, max: 2500000, days: 20, description: '2 x 500 kVA DG sets to be synchronised with mains, AMF panel with remote monitoring. Existing panel layout drawings available.' },

  { buyer: 'buyer.auto@voltsupply.in', title: 'Power Factor Correction for Press Shop', category: 'switchgear', city: 'Gurugram', state: 'Haryana', min: 2400000, max: 3100000, days: 19, description: 'APFC panel 600 kVAr with detuned reactors to handle press-shop harmonics. Target PF 0.99. Existing load study available.' },
  { buyer: 'buyer.auto@voltsupply.in', title: 'Thermography and Relay Coordination Study', category: 'testing', city: 'Gurugram', state: 'Haryana', min: 450000, max: 700000, days: 12, description: 'Annual thermography of 140 panels plus a full protection coordination study with ETAP model and report.' },

  { buyer: 'buyer.port@voltsupply.in', title: 'High-Mast Lighting for Container Yard', category: 'lighting', city: 'Kochi', state: 'Kerala', min: 6400000, max: 8200000, days: 26, description: '14 nos. 30-metre high masts with LED floodlights, corrosion-resistant finish suited to coastal exposure. Includes erection.' },
  { buyer: 'buyer.port@voltsupply.in', title: 'Shore Power Cable and Reel System', category: 'cables', city: 'Kochi', state: 'Kerala', min: 5200000, max: 6800000, days: 29, description: 'Heavy-duty flexible shore power cable with motorised reels for two berths. Marine certification required.' },

  { buyer: 'demo.buyer2@voltsupply.in', title: 'Plant Earthing Upgrade, Oragadam', category: 'conduits', city: 'Chennai', state: 'Tamil Nadu', min: 1100000, max: 1600000, days: 17, description: 'Replacement of existing GI earthing with copper bonded electrodes across the plant, 46 pits, with earth resistance testing report.' },
  { buyer: 'demo.buyer@voltsupply.in', title: 'Energy Meters and Sub-Metering, Thane Mall', category: 'testing', city: 'Thane', state: 'Maharashtra', min: 1700000, max: 2200000, days: 21, description: '120 nos. class 1.0 multifunction energy meters with Modbus and a central monitoring dashboard for tenant billing.' },

  // Mumbai weighting is deliberate: the free-tier supplier in the demo is based
  // there, and a single visible lead makes the free tier look broken rather
  // than limited. Several leads that are clearly a fraction of the national
  // board tells the upgrade story far better.
  { buyer: 'demo.buyer@voltsupply.in', title: 'Substation Upgrade for Bhiwandi Logistics Park', category: 'switchgear', city: 'Mumbai', state: 'Maharashtra', min: 6800000, max: 8500000, days: 27, description: '11kV VCB panels and RMU for a new 2 MVA substation serving a 6-lakh sq ft warehousing park. Includes protection relays and cabling.' },
  { buyer: 'buyer.realty@voltsupply.in', title: 'Fire Survival Cable for Worli Tower', category: 'cables', city: 'Mumbai', state: 'Maharashtra', min: 3100000, max: 4000000, days: 23, description: 'FRLS and fire-survival cable for firefighting pumps, lifts and pressurisation fans in a 42-storey residential tower. BS 6387 CWZ compliance required.' },
  { buyer: 'buyer.hospital@voltsupply.in', title: 'UPS and Battery Bank, Mumbai Campus', category: 'testing', city: 'Mumbai', state: 'Maharashtra', min: 5400000, max: 7000000, days: 26, description: '2 x 200 kVA modular UPS with 30-minute battery backup for critical care and imaging. Includes load testing and annual maintenance quote.' },
  { buyer: 'demo.buyer@voltsupply.in', title: 'Street and Podium Lighting, Powai Development', category: 'lighting', city: 'Mumbai', state: 'Maharashtra', min: 2300000, max: 3100000, days: 19, description: 'Approximately 240 pole-mounted and bollard fittings for internal roads and podium landscape. IP66, with centralised timer control.' },
  { buyer: 'demo.buyer@voltsupply.in', title: 'Pump Room Motors, Kalyan Site', category: 'motors', city: 'Mumbai', state: 'Maharashtra', min: 1500000, max: 2000000, days: 18, description: '9 nos. 22 kW and 37 kW motors for hydro-pneumatic and firefighting pump sets, with panels. IE3 efficiency, 3-year warranty preferred.' },
]

// Quotes that make the marketplace look traded-in rather than freshly seeded.
// Each entry: [enquiry title, seller email, price, days, warranty, terms, notes]
export const QUOTES = [
  ['LT Cable Supply for Andheri Warehouse', 'demo.seller.local@voltsupply.in', 2150000, 18, '12 months', '30% advance, 70% against delivery', 'Polycab make, ISI marked. Test certificates included with each drum.'],
  ['LT Cable Supply for Andheri Warehouse', 'demo.seller.state@voltsupply.in', 1980000, 25, '18 months', '50% advance, balance on delivery', 'KEI make. Can hold price for 30 days if confirmed this week.'],
  ['LT Cable Supply for Andheri Warehouse', 'supplier.bharat@voltsupply.in', 2075000, 21, '24 months', '25% advance, balance against despatch', 'Own manufacture. Drum-wise test certificates and third-party inspection welcome.'],

  ['Distribution Panels for Hinjewadi Office Block', 'demo.seller.state@voltsupply.in', 1120000, 35, '24 months', '40% advance, 60% on installation', 'Includes on-site installation and commissioning by our Pune team.'],
  ['Distribution Panels for Hinjewadi Office Block', 'supplier.nandi@voltsupply.in', 1245000, 30, '36 months', '30% advance, 70% on delivery', 'Form 3b construction, CPRI certified. Three-year comprehensive warranty.'],

  ['Transformer Supply for Sriperumbudur Unit', 'demo.seller.national@voltsupply.in', 5450000, 55, '60 months', '20% advance, 70% on despatch, 10% after commissioning', 'ERDA type-tested. Includes HT panel, cabling and commissioning.'],
  ['Transformer Supply for Sriperumbudur Unit', 'supplier.gujarat@voltsupply.in', 5180000, 60, '60 months', '30% advance, balance against despatch documents', 'Own manufacture at Ahmedabad. Factory acceptance test witnessing welcome.'],
  ['Transformer Supply for Sriperumbudur Unit', 'supplier.capital@voltsupply.in', 5720000, 45, '60 months', '25% advance, balance on delivery', 'Faster delivery from ready stock. AMC available at 2% of order value per year.'],

  ['VFD Retrofit for Processing Line', 'supplier.kovai@voltsupply.in', 1485000, 28, '24 months', '40% advance, 60% on commissioning', 'Danfoss drives with harmonic filters. Includes programming and operator training.'],
  
  ['Rooftop Solar 500 kW for Pandesara Unit', 'supplier.surya@voltsupply.in', 20400000, 90, '60 months', '20% advance, milestone linked', 'Tier-1 modules, string inverters, 5-year O&M included. MNRE empanelled.'],
  ['Rooftop Solar 500 kW for Pandesara Unit', 'supplier.jaipur@voltsupply.in', 19750000, 105, '60 months', '15% advance, milestone linked', 'Includes net-metering liaison with DISCOM and generation guarantee.'],

  ['Bus Duct and LT Panels for Tier III Facility', 'supplier.nandi@voltsupply.in', 31200000, 120, '36 months', '20% advance, milestone linked, 10% retention', 'Form 4b Type 6, CPRI short-circuit certified. Dedicated project manager assigned.'],
  ['Bus Duct and LT Panels for Tier III Facility', 'demo.seller.national@voltsupply.in', 32800000, 110, '36 months', '25% advance, milestone linked', 'Siemens bus duct with IP55 rating. Includes thermographic commissioning report.'],

  ['Precision Earthing and Lightning Protection', 'supplier.nandi@voltsupply.in', 2640000, 30, '120 months', '40% advance, balance on completion', 'Copper bonded electrodes with 10-year performance warranty and annual testing.'],

  ['Medical-Grade Isolation Transformers', 'supplier.capital@voltsupply.in', 3780000, 42, '36 months', '30% advance, balance on delivery', 'IS 15601 compliant with line isolation monitors and remote annunciation panels.'],
  ['Medical-Grade Isolation Transformers', 'supplier.gujarat@voltsupply.in', 3540000, 50, '36 months', '35% advance, balance against despatch', 'Own manufacture. Factory test witnessing arranged at Ahmedabad works.'],

  ['LED Retrofit Across Four Hospital Floors', 'supplier.sunrise@voltsupply.in', 1620000, 24, '60 months', '30% advance, 70% on delivery', 'Flicker-free drivers, UGR<19 panels. Free DIALux layout and on-site samples.'],
  ['LED Retrofit Across Four Hospital Floors', 'supplier.chennailite@voltsupply.in', 1485000, 30, '36 months', '50% advance, balance on delivery', 'Philips and Wipro options quoted. Bulk discount applicable above 1,500 fittings.'],

    ['Motor and Starter Package for Cold Store', 'supplier.kovai@voltsupply.in', 3050000, 26, '36 months', '30% advance, balance on despatch', 'Crompton IE3 range from ready stock. Faster delivery than standard lead time.'],

  ['Cable Tray and Containment, Rajpura Facility', 'supplier.ludhiana@voltsupply.in', 945000, 20, '12 months', '50% advance, balance on delivery', 'Hot-dip galvanised to IS 4759, 80 micron coating. Local delivery within 3 days of release.'],

  ['Wiring Package for 480-Flat Tower', 'supplier.surat@voltsupply.in', 10850000, 150, '24 months', 'Monthly billing against delivery schedule', 'Rate contract for 12 months with price variation linked to LME copper.'],
  ['Wiring Package for 480-Flat Tower', 'supplier.bharat@voltsupply.in', 11200000, 140, '36 months', '20% advance, monthly billing', 'FR-LSH own manufacture. Dedicated despatch slot each month.'],

  ['Common-Area Lighting and Controls', 'supplier.sunrise@voltsupply.in', 3180000, 40, '60 months', '30% advance, 70% on installation', 'DALI-compatible with central control. Includes commissioning of sensor zones.'],

  ['Decorative and Facade Lighting, Udaipur Property', 'supplier.sunrise@voltsupply.in', 5120000, 55, '36 months', '40% advance, milestone linked', 'Mock-up at site before final order. Heritage-sensitive fixture selection.'],
  ['Decorative and Facade Lighting, Udaipur Property', 'supplier.chennailite@voltsupply.in', 4680000, 65, '24 months', '50% advance, balance on delivery', 'IP66 facade wash fittings with 5-year driver warranty.'],

    ['DG Synchronisation Panel, Jaipur', 'demo.seller.national@voltsupply.in', 2260000, 30, '36 months', '25% advance, balance on commissioning', 'Includes load-bank testing and operator training at site.'],

  ['Power Factor Correction for Press Shop', 'supplier.nandi@voltsupply.in', 2680000, 35, '24 months', '30% advance, 70% on delivery', 'Detuned reactors at 7% tuning. Harmonic study included in scope.'],
  
  ['Thermography and Relay Coordination Study', 'supplier.indore@voltsupply.in', 520000, 21, 'Report revision for 6 months', '50% advance, balance on report submission', 'NABL calibrated instruments. ETAP model handed over with the report.'],
  ['Thermography and Relay Coordination Study', 'supplier.noida@voltsupply.in', 585000, 18, 'Report revision for 12 months', '40% advance, balance on submission', 'Includes one free follow-up survey after corrective action.'],

  ['High-Mast Lighting for Container Yard', 'supplier.kochi@voltsupply.in', 7250000, 70, '60 months', '30% advance, milestone linked', 'Marine-grade C5-M coating suited to coastal exposure. Erection included.'],
  ['High-Mast Lighting for Container Yard', 'supplier.chennailite@voltsupply.in', 6980000, 80, '36 months', '40% advance, balance on erection', 'Includes winch system with lowering device for maintenance.'],

  ['Shore Power Cable and Reel System', 'supplier.kochi@voltsupply.in', 5940000, 60, '24 months', '35% advance, balance on commissioning', 'Marine certified cable with motorised reels and local control stations.'],

  ['Plant Earthing Upgrade, Oragadam', 'demo.seller.national@voltsupply.in', 1340000, 28, '120 months', '40% advance, balance on completion', 'Copper bonded electrodes, earth resistance report for each pit.'],

  ['Energy Meters and Sub-Metering, Thane Mall', 'supplier.noida@voltsupply.in', 1890000, 30, '36 months', '30% advance, 70% on commissioning', 'Class 1.0 meters with Modbus RTU and a web dashboard for tenant billing.'],
  ['Energy Meters and Sub-Metering, Thane Mall', 'supplier.indore@voltsupply.in', 1965000, 25, '24 months', '40% advance, balance on delivery', 'Includes one year of remote monitoring support and monthly billing exports.'],

  ['Substation Upgrade for Bhiwandi Logistics Park', 'demo.seller.national@voltsupply.in', 7850000, 75, '36 months', '25% advance, milestone linked', '11kV VCB panels with numerical relays. Includes testing and charging assistance with MSEDCL.'],
  ['Substation Upgrade for Bhiwandi Logistics Park', 'demo.seller.state@voltsupply.in', 7420000, 85, '24 months', '30% advance, balance on commissioning', 'RMU from Schneider with cable terminations. Site survey completed last week.'],

  ['Fire Survival Cable for Worli Tower', 'demo.seller.state@voltsupply.in', 3680000, 30, '24 months', '30% advance, 70% against delivery', 'BS 6387 CWZ certified. Third-party fire test reports provided with each drum.'],
  ['Fire Survival Cable for Worli Tower', 'supplier.bharat@voltsupply.in', 3520000, 38, '36 months', '25% advance, balance on despatch', 'Own manufacture with CWZ certification. Phased delivery to match floor handover.'],

  ['Street and Podium Lighting, Powai Development', 'supplier.sunrise@voltsupply.in', 2740000, 35, '60 months', '30% advance, 70% on delivery', 'IP66 fittings with centralised astronomical timer. Photometric layout included.'],
  ['Street and Podium Lighting, Powai Development', 'demo.seller.national@voltsupply.in', 2610000, 28, '24 months', '40% advance, balance on delivery', 'Bajaj and Havells options quoted. Pole erection can be arranged on request.'],

  ['Pump Room Motors, Kalyan Site', 'demo.seller.state@voltsupply.in', 1760000, 22, '36 months', '40% advance, 60% on delivery', 'Crompton IE3 motors with matched DOL and star-delta panels.'],
  ['Pump Room Motors, Kalyan Site', 'demo.seller.national@voltsupply.in', 1685000, 30, '24 months', '50% advance, balance on despatch', 'ABB motors. Includes alignment and commissioning support at site.'],

  ['UPS and Battery Bank, Mumbai Campus', 'supplier.noida@voltsupply.in', 6250000, 45, '36 months', '30% advance, 60% on delivery, 10% after commissioning', 'Modular UPS with hot-swap modules and VRLA bank. Includes 30-minute load test.'],
]
