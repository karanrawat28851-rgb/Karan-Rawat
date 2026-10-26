import { SkillCategory, SkillProgress } from '../types/game';

export interface ChallengeData {
  id: string;
  category: SkillCategory;
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  learningFactEn: string;
  learningFactHi: string;
  stepsEn: string[];
  stepsHi: string[];
}

export const INITIAL_SKILLS: SkillProgress[] = [
  {
    id: 'MEDICAL_CPR',
    titleEn: 'Hands-Only CPR & AED Defibrillation',
    titleHi: 'सी.पी.आर और हृदय रक्षा (CPR & AED)',
    unlocked: false,
    score: 0,
    realWorldTipEn: 'Perform chest compressions at 100-120 BPM in the center of the chest. Push 2 inches (5 cm) deep and allow full recoil.',
    realWorldTipHi: 'छाती के बीच में 100-120 धड़कन प्रति मिनट की गति से 2 इंच गहरा दबाएं। यह किसी की जान बचा सकता है!',
    actionableStepsEn: [
      '1. Check responsiveness and tap shoulders: "Are you okay?"',
      '2. Call 112 / 108 immediately and ask for an AED.',
      '3. Place heel of hand on center of chest, interlock fingers.',
      '4. Compress hard & fast at 100-120 BPM (to beat of "Stayin Alive").',
      '5. Apply AED pads: Top right chest & lower left side under armpit.'
    ],
    actionableStepsHi: [
      '1. कंधे थपथपाकर पूछें: "क्या आप ठीक हैं?"',
      '2. तुरंत आपातकालीन नंबर 112 / 108 पर कॉल करें।',
      '3. छाती के केंद्र में हथेली रखें, उंगलियां आपस में फंसाएं।',
      '4. 100-120 बार प्रति मिनट की तेज गति से दबाएं।',
      '5. AED पैड्स लगाएं: दायां ऊपरी सीना और बायां निचला पसलियों का भाग।'
    ]
  },
  {
    id: 'FIRE_SAFETY',
    titleEn: 'Fire Hazard & PASS Protocol',
    titleHi: 'अग्नि सुरक्षा और P.A.S.S. तकनीक',
    unlocked: false,
    score: 0,
    realWorldTipEn: 'Never throw water on electrical or oil fires! Use CO2 or Dry Chemical (ABC). Remember P-A-S-S: Pull, Aim, Squeeze, Sweep.',
    realWorldTipHi: 'बिजली या तेल की आग पर कभी पानी न डालें! P-A-S-S याद रखें: पिन खींचें, बेस पर निशाना लगाएं, दबाएं, दाएं-बाएं घुमाएं।',
    actionableStepsEn: [
      'P - PULL the safety pin from the extinguisher.',
      'A - AIM low at the base of the fire, not the flames.',
      'S - SQUEEZE the operating lever evenly.',
      'S - SWEEP the nozzle side-to-side until completely out.',
      'Always stay low to avoid inhaling toxic hot smoke.'
    ],
    actionableStepsHi: [
      'P - पिन (Safety Pin) को बाहर खींचें।',
      'A - आग की लपटों पर नहीं, आग की जड़ (Base) पर निशाना लगाएं।',
      'S - हैंडल लीवर को मजबूती से दबाएं।',
      'S - नोजल को दाएं से बाएं (Sweep) घुमाएं।',
      'धुएं से बचने के लिए हमेशा फर्श के करीब झुककर रेंगें।'
    ]
  },
  {
    id: 'CYBER_DEFENSE',
    titleEn: 'Cyber Hygiene & Anti-Scam Shield',
    titleHi: 'साइबर सुरक्षा एवं ऑनलाइन फ्रॉड से बचाव',
    unlocked: false,
    score: 0,
    realWorldTipEn: 'You NEVER need to enter a UPI PIN or share an OTP to receive money. Always verify the domain name (look out for fake urls like paytm-offer.xyz).',
    realWorldTipHi: 'पैसे प्राप्त करने के लिए कभी UPI पिन या OTP की जरूरत नहीं होती। संदिग्ध लिंक पर कभी क्लिक न करें।',
    actionableStepsEn: [
      '1. Never enter UPI PIN to receive payment (PIN is ONLY for sending).',
      '2. Check website domain URL carefully before entering any password.',
      '3. Turn on Two-Factor Authentication (2FA) via Authenticator app.',
      '4. Beware of urgent distress calls claiming family emergency or fake lottery.',
      '5. Immediately report cyber fraud at cybercrime.gov.in or helpline 1930.'
    ],
    actionableStepsHi: [
      '1. पैसे रिसीव करने के लिए कभी UPI पिन न डालें (पिन सिर्फ पैसे भेजने के लिए होता है)।',
      '2. किसी भी वेबसाइट का असली URL ध्यान से जांचें।',
      '3. अपने सोशल मीडिया और बैंकिंग पर टू-फैक्टर ऑथेंटिकेशन (2FA) चालू रखें।',
      '4. किसी भी अनजान व्यक्ति के साथ कभी OTP या रिमोट ऐप (AnyDesk) साझा न करें।',
      '5. वित्तीय फ्रॉड होने पर तुरंत 1930 नंबर पर कॉल करें।'
    ]
  },
  {
    id: 'SURVIVAL_ENGINEERING',
    titleEn: 'Emergency Water Purifier & Energy Grid',
    titleHi: 'आपदा में शुद्ध जल निर्माण एवं सोलर पॉवर',
    unlocked: false,
    score: 0,
    realWorldTipEn: 'In floods or natural disasters, impure water spreads cholera. Create a survival filter with layers: Gravel -> Sand -> Charcoal -> Cloth.',
    realWorldTipHi: 'बाढ़ या आपदा में दूषित पानी कभी न पिएं। सर्वाइवल फिल्टर क्रम: कंकड़ -> महीन रेत -> चारकोल (कोयला) -> सूती कपड़ा।',
    actionableStepsEn: [
      '1. Layer 1 (Top): Coarse gravel/pebbles to catch leaves and large dirt.',
      '2. Layer 2: Fine river sand to trap small debris and grit.',
      '3. Layer 3: Crushed charcoal (carbon) to absorb chemical toxins & odor.',
      '4. Layer 4: Clean cotton cloth at the base to prevent particulate escape.',
      '5. Boil the filtered water for at least 1-3 minutes before drinking!'
    ],
    actionableStepsHi: [
      '1. पहली परत (ऊपर): मोटे कंकड़ (पत्ते व बड़ा कचरा रोकने के लिए)।',
      '2. दूसरी परत: महीन रेत (बारीक मिट्टी छानने के लिए)।',
      '3. तीसरी परत: पिसा हुआ कोयला/चारकोल (विषैले तत्व व दुर्गंध सोखने के लिए)।',
      '4. चौथी परत (नीचे): साफ सूती कपड़ा।',
      '5. पीने से पहले पानी को कम से कम 1 से 3 मिनट जरूर उबालें!'
    ]
  },
  {
    id: 'DISASTER_PREPAREDNESS',
    titleEn: '72-Hour Emergency Go-Bag Kit',
    titleHi: '72-घंटे का सर्वाइवल इमरजेंसी किट',
    unlocked: false,
    score: 0,
    realWorldTipEn: 'Every household must keep a ready 72-hour Go-Bag containing 3L water/person, ORS, high-energy food, whistle, flashlight, and documents.',
    realWorldTipHi: 'हर घर में एक 72-घंटे का इमरजेंसी बैग होना चाहिए: पानी, ORS, टॉर्च, सीटी, प्राथमिक चिकित्सा बॉक्स और जरूरी पहचान पत्र।',
    actionableStepsEn: [
      '1. Water: 3-4 liters per person per day + water purification tablets.',
      '2. First Aid: Bandages, antiseptic, painkillers, personal medications.',
      '3. Tools: Whistle (for signaling search teams), high-lumen torch, power bank.',
      '4. Documents: Waterproof pouch with Aadhaar, insurance, cash in small notes.',
      '5. Emergency Contact Card: Written phone numbers (in case phone battery dies).'
    ],
    actionableStepsHi: [
      '1. पानी: कम से कम 3 लीटर प्रति व्यक्ति + ORS पैकेट।',
      '2. फर्स्ट एड: बैंडेज, एंटीसेप्टिक लोशन, दर्दनिवारक व जरूरी दवाएं।',
      '3. उपकरण: सीटी (रेस्क्यू टीम को आवाज देने के लिए), टॉर्च और पावर बैंक।',
      '4. वाटरप्रूफ पाउच: आधार कार्ड, नकदी (खुल्ले पैसे) और जरूरी दस्तावेज।',
      '5. डायरी: जरूरी फोन नंबर हाथ से लिखे हुए (फोन डिस्चार्ज होने पर काम आते हैं)।'
    ]
  }
];
