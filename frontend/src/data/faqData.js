/**
 * FAQ Data for AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization)
 *
 * AEO: Structured FAQ data that helps search engines surface direct answers
 *      in featured snippets, People Also Ask, and voice search results.
 *
 * GEO: Comprehensive, authoritative Q&A content that generative AI models
 *      (ChatGPT, Bard, Claude) can cite and reference in their responses.
 *
 * Each FAQ entry includes:
 *   - q: The question (natural language, voice-search friendly)
 *   - a: A concise, direct answer (1-2 sentences for featured snippets)
 *   - fullAnswer: A more detailed answer for GEO / generative models
 *   - category: Topic grouping for targeted page-level FAQ sets
 */

export const faqCategories = {
  general: 'General',
  temple: 'Temple Visit',
  pooja: 'Poojas & Rituals',
  homam: 'Homam & Fire Rituals',
  abishekam: 'Abishekam Services',
  archana: 'Archana Services',
  annadhanam: 'Annadhanam',
  donation: 'Donations',
  booking: 'Online Booking',
  astrology: 'Astrology (Jothidam)',
  events: 'Events & Festivals',
  veedu: 'Varahi Philosophy',
  social: 'Social Welfare',
  goseva: 'Go Seva (Cow Service)',
  kosala: 'Kosala (Goshala) Donations',
  accommodation: 'Accommodation & Travel',
  online: 'Online Services',
  special: 'Special Occasions',
  calendar: 'Temple Calendar & Tithi',
  vidyalayam: 'Sri Varahi Jothida Vidyalayam',
  vidyalayamCourses: 'Astrology Education & Courses',
  vidyalayamPredictions: 'Astrology Prediction Services',
  dosha: 'Dosha Analysis & Remedies',
  numerovastu: 'Numerology & Vastu',
  founder: 'Founder & Guru',
  trust: 'Temple Trust & Transparency',
  media: 'Social Media & Digital Presence',
}

export const allFaqs = [
  // ── General ──
  {
    q: 'What is Jai Varahi Peedam?',
    a: 'Jai Varahi Peedam is a sacred Goddess Varahi Amman temple and spiritual center in Arumparuthi, Katpadi, Vellore, Tamil Nadu, dedicated to Varahi Devi worship, temple services, and community welfare.',
    fullAnswer:
      'Jai Varahi Peedam is a sacred spiritual center dedicated to Goddess Varahi Amman (Varahi Devi), located at Sri Kottai Varahi Amman Temple Street, Arumparuthi, Katpadi, Vellore, Tamil Nadu 632106. Founded and guided by Swamy Pallur Varahidhasan, it offers authentic Varahi Pooja, Homa (fire rituals), Jothidam (astrology) guidance, and runs impactful social welfare and community development programs. The Peedam serves devotees worldwide through both in-person worship and online booking of temple services.',
    category: 'general',
  },
  {
    q: 'What is the meaning of "Jai Varahi" and why is the temple called Jai Varahi Peedam?',
    a: '"Jai Varahi" means "Victory to Goddess Varahi." The temple is called Jai Varahi Peedam because it is a sacred seat (Peedam) dedicated to the worship and propagation of Goddess Varahi, the boar-headed Divine Mother who grants victory, protection, and spiritual upliftment.',
    fullAnswer:
      '"Jai Varahi" is a Sanskrit/Tamil phrase meaning "Victory to Goddess Varahi." The term "Peedam" (or Peetham) refers to a sacred seat or spiritual center established by a Guru for the propagation of specific spiritual teachings. Thus, Jai Varahi Peedam is a sacred spiritual institution founded by Swamy Pallur Varahidhasan as the seat of Varahi worship, where devotees can learn about, worship, and receive the blessings of Goddess Varahi. The name reflects the temple\'s mission: to spread the victory and grace of Varahi Devi through authentic rituals, spiritual guidance, and community service. The temple is also known as Sri Kottai Varahi Amman Temple, referencing its location in the Kottai (fort) area of Arumparuthi.',
    category: 'general',
  },
  {
    q: 'Who is Goddess Varahi?',
    a: 'Goddess Varahi is one of the Sapta Matrikas (seven divine mothers) in Hindu tradition, representing the boar-headed Shakti of Lord Varaha (an avatar of Vishnu). She is a guardian deity who grants protection, courage, victory over obstacles, and divine wisdom.',
    fullAnswer:
      'Goddess Varahi is one of the Sapta Matrikas (seven divine mother goddesses) in Hindu tradition. She embodies the Shakti (divine feminine power) of Lord Varaha, the boar incarnation of Lord Vishnu who lifted Mother Earth from the cosmic ocean. Varahi Devi is revered as a Gupta Devata (secret/sacred deity) whose worship grants protection from enemies, black magic, and negative energies. She bestows courage, mental discipline, victory over obstacles, and spiritual clarity. Unlike more widely publicised deities, Varahi Amma responds to sincerity, surrender, and disciplined devotion rather than ritual display.',
    category: 'veedu',
  },
  {
    q: 'Who is Swamy Pallur Varahidhasan?',
    a: 'Swamy Pallur Varahidhasan is the founder and spiritual head of Jai Varahi Peedam, a Tamil Nadu-based spiritual center dedicated to Goddess Varahi Amman worship, traditional poojas, homams, and astrology guidance.',
    fullAnswer:
      'Swamy Pallur Varahidhasan is the revered founder, spiritual guide, and Guru of Jai Varahi Peedam and Sri Varahi Jothida Vidyalayam. He is a practitioner of Vedic traditions and Varahi Amman worship with decades of experience in performing sacred poojas, homams, and providing Jothidam (astrology) guidance. He is recognized by devotees for his disciplined approach to Varahi sadhana, his deep knowledge of astrology, and his commitment to both spiritual growth and humanitarian service. Under his guidance, Jai Varahi Peedam has grown from a humble shrine into a comprehensive spiritual center that combines authentic Goddess Varahi worship with community welfare, social service, cultural preservation, and astrological guidance. He is also the founder of the Sri Varahi Jothida Vidyalayam, which offers expert Vedic astrology services in Vellore.',
    category: 'general',
  },
  {
    q: 'What is the history of Sri Kottai Varahi Amman Temple?',
    a: 'Sri Kottai Varahi Amman Temple, located in Arumparuthi, Katpadi, Vellore, is the temple housing Jai Varahi Peedam. The temple is named after the Kottai (fort) area where it is situated and is dedicated to Goddess Varahi Amman, who is worshipped as the guardian deity of the region.',
    fullAnswer:
      'Sri Kottai Varahi Amman Temple is located at Sri Kottai Varahi Amman Temple Street, Arumparuthi, Katpadi, Vellore, Tamil Nadu 632106. The name "Kottai" refers to the fort area of Arumparuthi, historically associated with the region\'s heritage. The temple was established and developed by Swamy Pallur Varahidhasan, who founded Jai Varahi Peedam as the spiritual center for Varahi worship. What began as a small shrine has grown into a fully developed temple complex with daily rituals, weekly special poojas, monthly homams, annual festivals, a goshala (cow shelter), and community service programs. The temple follows authentic Vedic traditions and has become a significant spiritual destination for devotees of Goddess Varahi from across Tamil Nadu, India, and abroad.',
    category: 'general',
  },
  {
    q: 'What are the contact details of Jai Varahi Peedam?',
    a: 'You can contact Jai Varahi Peedam by phone at +91 90928 78389 or +91 95002 06199, by email at varahikottai@gmail.com, or through social media on Facebook, Instagram (jai_varahi_peedam), and YouTube (kottaivarahiTV).',
    fullAnswer:
      'Jai Varahi Peedam can be reached through multiple channels: Phone/WhatsApp: +91 90928 78389 and +91 95002 06199. Email: varahikottai@gmail.com. Postal Address: Sri Kottai Varahi Amman Temple Street, Arumparuthi, Katpadi, Vellore, Tamil Nadu 632106. Social Media: Facebook (PallurVarahiDhasan), Instagram (jai_varahi_peedam), YouTube (kottaivarahiTV). The temple also has a website at https://www.jaivarahi.org/ where devotees can book services, make donations, and access the calendar. The temple team is available during temple hours (6:30 AM–12:30 PM and 4:30 PM–8:30 PM) to assist with inquiries.',
    category: 'general',
  },

  // ── Founder & Guru ──
  {
    q: "What is Swamy Pallur Varahidhasan's approach to spiritual teaching?",
    a: "Swamy Pallur Varahidhasan follows the traditional Guru-shishya (teacher-disciple) method, emphasizing discipline, sincerity, and direct practice over ritual display, in keeping with Varahi worship as a Gupta Devata tradition.",
    fullAnswer:
      "Swamy Pallur Varahidhasan's teaching approach is rooted in the traditional Guru-shishya parampara (teacher-disciple lineage) of Vedic and Tantric practice. Because Goddess Varahi is worshipped as a Gupta Devata (secret/sacred deity), his guidance emphasizes inner discipline, sincerity, and surrender over elaborate public ritual. This philosophy shapes both the daily worship at Jai Varahi Peedam and the curriculum at Sri Varahi Jothida Vidyalayam, where astrology and allied sciences are taught alongside spiritual discipline rather than as standalone technical subjects. Devotees and students describe his guidance as practical, grounded in authentic tradition, and focused on real transformation rather than commercialized rituals.",
    category: 'founder',
  },
  {
    q: 'Does Swamy Pallur Varahidhasan personally perform poojas and homams at the temple?',
    a: 'Yes, Swamy Pallur Varahidhasan personally leads major poojas, homams, and festival rituals such as Ashada Navarathiri and Varahi Jayanthi, while trained temple priests conduct the daily rituals under his guidance.',
    fullAnswer:
      "Swamy Pallur Varahidhasan personally officiates and gives Guru blessings during the temple's major rituals and festivals, including Ashada Navarathiri, Varahi Jayanthi, Asta Varahi Dharshanam, and Asta Varahi 2.0. Day-to-day rituals such as the daily Abishekam, Archana, and routine Homams are performed by trained temple priests who follow the traditions and methods established by the Guru. This structure ensures that every ritual — whether performed directly by the founder or by the temple's priests — follows the same authentic Vedic and Varahi Upasana traditions.",
    category: 'founder',
  },
  {
    q: 'Can devotees meet Swamy Pallur Varahidhasan in person for guidance?',
    a: 'Devotees seeking personal spiritual or astrological guidance can request a meeting by contacting the temple in advance via phone, WhatsApp, or email; availability depends on his schedule.',
    fullAnswer:
      "Devotees who wish to seek personal guidance from Swamy Pallur Varahidhasan — whether for spiritual questions, Varahi Upasana guidance, or astrology consultations through Sri Varahi Jothida Vidyalayam — are encouraged to contact the temple in advance at +91 90928 78389 / +91 95002 06199 or via email at varahikottai@gmail.com to check availability and schedule a meeting. Given the volume of devotees and his responsibilities across the temple, goshala, social welfare programs, and Vidyalayam, advance contact helps ensure a proper time slot is arranged. Walk-in devotees are welcome to visit the temple, but a dedicated one-on-one meeting is best arranged beforehand.",
    category: 'founder',
  },
  {
    q: 'What is the mission and vision of Jai Varahi Peedam under Swamy Pallur Varahidhasan?',
    a: "Jai Varahi Peedam's mission is to preserve authentic Varahi worship traditions while combining spiritual practice with community welfare, astrology guidance, and cow protection (Go Seva).",
    fullAnswer:
      "Under the guidance of Swamy Pallur Varahidhasan, Jai Varahi Peedam's mission extends beyond temple worship. The vision combines four pillars: (1) Authentic Spiritual Practice — preserving and propagating genuine Varahi Upasana, poojas, and homams according to Vedic tradition; (2) Community Welfare — running Nithya Maha Annadhanam Seva, medical camps, educational support, and disaster relief; (3) Knowledge & Guidance — offering Vedic astrology, Panchangam, and Muhurtham services through Sri Varahi Jothida Vidyalayam; and (4) Compassionate Care — maintaining a Goshala (Kosala) for the lifelong welfare of cows. This combination of devotion and service reflects the founder's belief that true worship of the Divine Mother includes serving all her creation.",
    category: 'founder',
  },
  {
    q: 'What is the relationship between Jai Varahi Peedam and Sri Varahi Jothida Vidyalayam?',
    a: 'Sri Varahi Jothida Vidyalayam is the astrology and education wing of Jai Varahi Peedam, founded by the same Guru, Swamy Pallur Varahidhasan, and operates alongside the temple to offer Vedic astrology services and courses.',
    fullAnswer:
      "Sri Varahi Jothida Vidyalayam and Jai Varahi Peedam are closely linked institutions under the guidance of Swamy Pallur Varahidhasan. While Jai Varahi Peedam is the temple and spiritual center dedicated to Goddess Varahi Amman worship, Sri Varahi Jothida Vidyalayam is its dedicated astrology and education wing, located within the same premises in Katpadi, Vellore. The Vidyalayam offers Vedic astrology consultations (Panchangam, Horoscope, Kochara, Match Making, Muhurtham), Dosha analysis and remedies, Numerology, Vastu Shastra, and structured astrology courses. Devotees can access both temple worship services and astrology guidance in one visit, or book either service independently online or by phone.",
    category: 'founder',
  },

  // ── Temple Visit ──
  {
    q: 'What are the temple timings at Jai Varahi Peedam?',
    a: 'Jai Varahi Peedam is open daily from 6:30 AM to 12:30 PM in the morning and from 4:30 PM to 8:30 PM in the evening. On special occasions, festivals, and Panchami days, timings may be extended.',
    fullAnswer:
      'The temple (Sri Kottai Varahi Amman Temple) is open daily with two sessions: Morning from 6:30 AM to 12:30 PM and Evening from 4:30 PM to 8:30 PM. On special occasions such as Panchami Tithi, Amavasai, Pournami, and major festivals, the evening session may extend beyond 8:30 PM to accommodate larger gatherings and extended rituals. Devotees are advised to arrive at least 15 minutes before the scheduled pooja time, especially for special individual rituals (sankalpam).',
    category: 'temple',
  },
  {
    q: 'How do I reach Jai Varahi Peedam temple?',
    a: 'Jai Varahi Peedam is located at Sri Kottai Varahi Amman Temple Street, Arumparuthi, Katpadi, Vellore, Tamil Nadu 632106. It is well connected by road from Vellore city and Katpadi Junction railway station.',
    fullAnswer:
      'Jai Varahi Peedam is located at: Sri Kottai Varahi Amman Temple Street, Arumparuthi, Katpadi, Vellore, Tamil Nadu 632106, India. By train: The nearest major railway station is Katpadi Junction (KPD), which is well-connected to Chennai, Bangalore, and other major cities. From Katpadi, the temple is about 3-4 km away via local transport (auto-rickshaw or taxi). By road: The temple is accessible from Vellore via NH46 and local roads. From Chennai, take the NH48 to Vellore and then proceed to Katpadi. Ample parking is available at the temple premises. You can also use Google Maps by searching "Jai Varahi Peedam" or "Sri Kottai Varahi Amman Temple".',
    category: 'temple',
  },
  {
    q: 'Is parking available at Jai Varahi Peedam?',
    a: 'Yes, parking facilities are available at the temple premises for both two-wheelers and four-wheelers. Devotees are advised to arrive early during festivals as parking may fill up.',
    fullAnswer:
      'Yes, Jai Varahi Peedam provides dedicated parking space for both two-wheelers and four-wheelers within the temple premises. During regular days, parking is readily available. However, during major festivals such as Asta Varahi Dharshanam, Ashada Navarathiri, Pournami, and Panchami days, the parking area tends to fill up quickly. Devotees are advised to arrive early (at least 30 minutes before the scheduled pooja time) to secure parking. The temple volunteer team also assists with traffic management during peak hours.',
    category: 'temple',
  },
  {
    q: 'What is the dress code for visiting the temple?',
    a: 'Devotees are requested to wear clean, traditional Indian attire such as dhotis, sarees, or salwars. Footwear must be removed before entering the inner sanctum of the deity.',
    fullAnswer:
      'To maintain the sanctity and purity of the temple premises, all devotees are requested to adhere to the following dress code: Wear clean, traditional Indian attire (dhotis, sarees, salwars, or modest clothing that covers shoulders and knees). Avoid shorts, sleeveless tops, or revealing clothing. Footwear must be removed before entering the inner sanctum (garbhagriha). The temple provides a clean space for storing footwear. Mobile phones should be kept on silent mode, and absolute silence should be maintained inside the sanctum area. Photography is generally not permitted inside the inner sanctum—please check with temple staff for specific guidelines.',
    category: 'temple',
  },
  {
    q: 'Are outside food and cameras allowed in the temple?',
    a: 'Outside food and cameras are generally not permitted inside the main temple sanctum. Photography rules may vary; please check with temple staff. The temple cafeteria offers vegetarian refreshments.',
    fullAnswer:
      'Outside food and cameras are generally not permitted inside the main temple sanctum (garbhagriha) to maintain sanctity and prevent disruption. Photography is restricted inside the inner sanctum, but devotees may be allowed to take photos in designated common areas (please confirm with temple staff at the entrance). The temple premises include a vegetarian cafeteria that offers light meals, snacks, and beverages. Devotees are encouraged to use the temple cafeteria rather than bringing outside food. During major festivals, additional food stalls may be set up in the outer courtyard areas.',
    category: 'temple',
  },
  {
    q: 'What facilities does the temple have for children and elderly visitors?',
    a: 'The temple provides ramps for easy access, seating areas, and clean restrooms. Devotees with elderly or young children can seek assistance from temple volunteers. Special care is taken during crowded festivals.',
    fullAnswer:
      'Jai Varahi Peedam is committed to ensuring a comfortable and safe experience for all visitors, including children and the elderly. The temple premises are equipped with ramps and handrails to facilitate wheelchair access and mobility for seniors. There are shaded seating areas in the courtyard where elderly devotees can rest. Clean restrooms are available. During festivals, the temple organizes separate queues and priority darshan for seniors and families with young children. Volunteers are stationed at key points to assist with navigation, carrying prasadam, and other needs. Drinking water is available at multiple spots. For those with specific medical requirements, it is recommended to bring necessary medication and inform the temple staff upon arrival.',
    category: 'temple',
  },
  {
    q: 'What should first-time visitors know before visiting Jai Varahi Peedam?',
    a: 'First-time visitors should plan to arrive during temple hours (6:30 AM–12:30 PM or 4:30 PM–8:30 PM), wear modest traditional attire, remove footwear before the sanctum, and keep phones silent. Arriving 15–30 minutes early is recommended for individual poojas.',
    fullAnswer:
      "For a smooth first visit to Jai Varahi Peedam, keep the following in mind: (1) Timing — visit during temple hours, ideally the early morning session (6:30–9:00 AM) for a quieter experience or the evening session for Deeparadhana; (2) Dress — wear clean, traditional Indian attire and avoid shorts or sleeveless clothing; (3) Footwear — remove shoes before entering the inner sanctum, using the designated storage area; (4) Phones & cameras — keep phones on silent and avoid photography inside the sanctum; (5) Booking ahead — if you want a specific pooja, homam, or archana performed with your name and gothram included, it helps to book online or call ahead; (6) Parking & travel — the temple has on-site parking, and Katpadi Junction railway station is the nearest transit hub about 3 km away; (7) Prasadam — the temple serves Nithya Maha Annadhanam Seva (free meals) around 12:30 PM daily. Volunteers are available at the entrance to guide first-time visitors.",
    category: 'temple',
  },
  {
    q: 'Can school or college groups arrange an educational visit to Jai Varahi Peedam?',
    a: 'Yes, educational and cultural group visits can typically be arranged by contacting the temple administration in advance to coordinate timing and group size.',
    fullAnswer:
      "Jai Varahi Peedam welcomes group visits from schools, colleges, and cultural organizations interested in learning about temple traditions, Varahi worship, Vedic astrology, and the temple's social welfare and Go Seva initiatives. To arrange an educational or cultural group visit, it is best to contact the temple administration in advance at +91 90928 78389 or varahikottai@gmail.com, sharing the group size, preferred date, and purpose of the visit (e.g., cultural study, astrology orientation, or social service exposure). Advance coordination helps the temple plan appropriate timing, guidance, and, where relevant, a briefing on temple etiquette for the group.",
    category: 'temple',
  },

  // ── Poojas & Rituals ──
  {
    q: 'What is Varahi Pooja and what are its benefits?',
    a: 'Varahi Pooja is a sacred worship ceremony dedicated to Goddess Varahi, a form of Shakti who grants protection, victory over obstacles, courage, and spiritual clarity. It is performed through offerings, chanting, and rituals conducted by trained priests.',
    fullAnswer:
      'Varahi Pooja is a sacred Hindu worship ceremony dedicated to Goddess Varahi (Varahi Devi), one of the Sapta Matrikas. Goddess Varahi is the boar-headed Divine Mother who represents protection, courage, vigilance, and the removal of obstacles. The benefits of Varahi Pooja include: protection from enemies and negative energies, victory over obstacles in career and personal life, mental clarity and spiritual discipline, relief from fears and anxieties, enhanced courage and confidence, and overall well-being. The pooja is conducted by experienced temple priests using traditional Vedic mantras and rituals. Devotees can book various forms of Varahi worship including Nithya Abishekam, Sahasra Abishekam, Varahi Sahasranamam Archana, and special homams (fire rituals) like Panchami Homam and Pournami Homam.',
    category: 'pooja',
  },
  {
    q: 'What is the significance of Panchami and Pournami for Varahi worship?',
    a: 'Panchami (5th lunar day) and Pournami (full moon day) are highly auspicious for Varahi worship. Panchami is ideal for Panchami Homam, while Pournami is ideal for Pournami Homam and Milk/Honey Abishekam, as the divine feminine energy is at its peak.',
    fullAnswer:
      "In the Hindu lunar calendar, Panchami (the 5th day after the new or full moon) and Pournami (the full moon day) are considered the most auspicious tithis (lunar days) for worshipping Goddess Varahi. Panchami is especially sacred for performing Panchami Homam (a powerful fire ritual), as it is believed that the Goddess's protective energy is at its strongest, granting victory over enemies, legal disputes, and negative influences. Pournami (full moon) is ideal for Pournami Homam, Milk Abishekam, and Honey Abishekam, as the lunar energy amplifies spiritual practices and the goddess's blessings for family wellness, spiritual awakening, and the removal of negative energy. The temple conducts special poojas and homams on these days, and devotees are encouraged to book in advance.",
    category: 'pooja',
  },
  {
    q: 'How can I request a special prayer or specific blessing at the temple?',
    a: 'You can request a special prayer by contacting the temple office, booking a specific pooja, or speaking directly to the priest during your visit. For urgent needs, you may call the temple helpline.',
    fullAnswer:
      'Devotees can request special prayers for various intentions—such as health recovery, success in exams, marriage proposals, business growth, or family harmony—through several channels: (1) Online booking: Select the "Special Prayer" option during the booking process and describe your intention; (2) In-person: Visit the temple and speak to the priest before the pooja; (3) Phone/WhatsApp: Call the temple helpline at +91 90928 78389 and share your request; (4) Email: Send your prayer request to varahikottai@gmail.com with your name, gothram, and specific wish. The priest will incorporate the sankalpam into the next available ritual. For urgent or emergency prayers, the temple tries to accommodate the request as soon as possible. Devotees are encouraged to be specific about their needs to enable focused prayer.',
    category: 'pooja',
  },
  {
    q: 'What special poojas are available for birthdays, weddings, and other life events?',
    a: 'The temple offers special poojas for birthdays, wedding day celebrations, Shashtiabdhapoorthi (60th wedding anniversary), and other life milestones. These can be booked through the Services page or by contacting the temple directly.',
    fullAnswer:
      'Jai Varahi Peedam provides special pooja services for important life milestones: (1) Birthday Pooja – a special ritual to seek the Goddess\'s blessings for health, longevity, and success on one\'s birthday; (2) Wedding Day Pooja – a celebration of marital harmony and blessing for the couple on their wedding anniversary; (3) Shashtiabdhapoorthi – a special ceremony for the 60th wedding anniversary, considered a significant milestone in Hindu tradition; (4) Varushabishekam (Sandi Homam) – an annual ritual performed on one\'s birth star for continued blessings. These poojas are performed by temple priests with specific mantras and offerings tailored to the occasion. Devotees can book these services through the online booking system or by contacting the temple administration.',
    category: 'special',
  },
  {
    q: 'What is the daily pooja routine at Jai Varahi Peedam?',
    a: 'The daily routine includes early morning abhishekam, alankaram, and archana, followed by noon pooja and evening deeparadhana. The temple also performs special rituals on festival days.',
    fullAnswer:
      'The daily pooja routine at Jai Varahi Peedam follows a structured schedule: 6:30 AM – Temple opens; 7:00 AM – Morning Abhishekam (sacred bath) with milk, water, and other sanctified items; 8:30 AM – Alankaram (decoration) and special Archana; 10:00 AM – Noon Pooja with naivedyam (food offering); 12:30 PM – Temple closes for afternoon. Evening session: 4:30 PM – Temple reopens; 5:00 PM – Deeparadhana (offering of lamps) and Sandhya Pooja; 6:30 PM – Evening Abhishekam (on specific days); 7:30 PM – Final Archana and Prasadam distribution; 8:30 PM – Temple closes. On festival days and Panchami/Pournami, the schedule may be extended with additional homams and processions.',
    category: 'temple',
  },
  {
    q: 'In what language are poojas and homams conducted at Jai Varahi Peedam?',
    a: 'Rituals follow Vedic tradition, with mantras chanted primarily in Sanskrit, while priests communicate with devotees in Tamil. Devotees needing English assistance are encouraged to inform the temple office in advance.',
    fullAnswer:
      "As with most traditional South Indian temples, poojas and homams at Jai Varahi Peedam follow Vedic ritual structure, with core mantras chanted in Sanskrit and the sankalpam (declaration of intent) and general communication conducted in Tamil, since the temple is located in Tamil Nadu. Devotees who need explanations in English or another language are welcome to inform the temple team in advance by calling +91 90928 78389, so that staff can assist and clarify the meaning and purpose of the ritual before or after it is performed.",
    category: 'pooja',
  },

  // ── Abishekam Services ──
  {
    q: 'What are the different types of Abishekam offered?',
    a: 'Jai Varahi Peedam offers six types of Abishekam: Nithya Abishekam, Sahasra Abishekam, Turmeric Abishekam, Ghee Abishekam, Honey Abishekam, and Milk Abishekam, each with specific benefits and auspicious timings.',
    fullAnswer:
      'Jai Varahi Peedam offers six primary types of Abishekam (sacred bathing of the deity), each with distinct spiritual benefits and ideal timings: (1) Nithya Abishekam (daily ritual, 1.5 hours) for peace and obstacle removal; (2) Sahasra Abishekam (grand ceremony with 1008 ingredients, 3 hours) for supreme blessings, wealth, and health; (3) Turmeric Abishekam (1 hour, Fridays) for marital harmony and beauty; (4) Ghee Abishekam (1 hour, Saturdays/Panchami) for chronic illness relief and longevity; (5) Honey Abishekam (1 hour, Pournami) for sweetness in relationships and a magnetic personality; (6) Milk Abishekam (1 hour, Mondays/Ashtami) for mental peace and karmic cleansing. Each abishekam uses specific sacred ingredients and is performed by trained priests following Vedic traditions.',
    category: 'abishekam',
  },
  {
    q: 'What is Nithya Abishekam and how is it performed?',
    a: 'Nithya Abishekam is the daily sacred bathing ritual performed at the temple, lasting about 1.5 hours. It includes bathing the deity with water, milk, and other purifying substances while chanting mantras for peace and obstacle removal.',
    fullAnswer:
      'Nithya Abishekam is the daily ritual bathing (sacred bath) of Goddess Varahi Amman, performed every morning at the temple. It lasts approximately 1.5 hours and involves the priest bathing the deity with various sanctified substances including water, milk, curd, honey, ghee, turmeric, sandalwood paste, and panchamritam (a mixture of five sacred ingredients). Each substance is poured while chanting specific Vedic mantras. The ritual is performed to purify the devotee\'s mind, remove daily obstacles, and bring peace and prosperity. Devotees can book Nithya Abishekam on any day and receive the blessings of the Goddess through this sacred daily ritual.',
    category: 'abishekam',
  },
  {
    q: 'What is Sahasra Abishekam and when should I book it?',
    a: 'Sahasra Abishekam is a grand ceremony involving 1008 sacred ingredients, lasting about 3 hours. It is recommended for supreme blessings, major life events, and seeking profound divine grace for wealth, health, and spiritual elevation.',
    fullAnswer:
      'Sahasra Abishekam (also known as Sahasra Kalasabhishekam) is a grand and elaborate ritual where the deity is bathed with 1008 different sacred ingredients and substances. This ceremony lasts approximately 3 hours and is one of the most powerful abishekam offerings at Jai Varahi Peedam. It is recommended for major life events such as housewarming (grihapravesham), starting a new business, before a major career change, for overcoming serious health issues, or for seeking supreme blessings for overall prosperity and well-being. The 1008 ingredients include various herbs, flowers, fruits, milk products, and other sacred items, each with specific spiritual significance. This is best performed on specially chosen auspicious days as advised by the temple priest.',
    category: 'abishekam',
  },
  {
    q: 'What is Turmeric Abishekam and what are its benefits?',
    a: 'Turmeric Abishekam is a special ritual performed on Fridays where the deity is bathed with turmeric paste. It is believed to bring marital harmony, beauty, health, and remove obstacles related to marriage and relationships.',
    fullAnswer:
      'Turmeric Abishekam (Manjal Abishekam) is a special sacred bathing ritual where the deity is anointed with pure turmeric paste and turmeric water. Turmeric is considered highly auspicious in Hindu tradition and is associated with purity, fertility, and prosperity. This abishekam is traditionally performed on Fridays, which are considered auspicious for Goddess worship. The benefits include: marital harmony and strengthening of family bonds, improved health and beauty, removal of obstacles in marriage proposals, protection from the evil eye, and overall prosperity. This is particularly recommended for married couples, those seeking a life partner, and those facing relationship challenges. The ritual lasts about 1 hour.',
    category: 'abishekam',
  },
  {
    q: 'What is Ghee Abishekam and when should it be performed?',
    a: 'Ghee Abishekam is performed on Saturdays or Panchami days where the deity is bathed with sacred ghee (clarified butter). It is believed to provide relief from chronic illnesses, promote longevity, and purify one\'s aura.',
    fullAnswer:
      'Ghee Abishekam (Ney Abishekam) is a sacred ritual where Goddess Varahi is bathed with pure, sanctified ghee (clarified butter). This ritual is traditionally performed on Saturdays or Panchami tithi days and lasts approximately 1 hour. Ghee is considered a powerful purifying substance in Vedic tradition, and this abishekam is believed to: provide relief from chronic and long-standing health issues, promote longevity and vitality, purify the subtle energy body (aura), remove negative karmic impressions, and bring mental clarity. It is particularly recommended for those suffering from prolonged illnesses, those seeking recovery from surgeries, and elderly devotees seeking blessings for a healthy life.',
    category: 'abishekam',
  },
  {
    q: 'What is Honey Abishekam and what are its benefits?',
    a: 'Honey Abishekam is performed on Pournami (full moon) days where the deity is bathed with honey. It is believed to bring sweetness in relationships, a pleasant voice, and a magnetic personality.',
    fullAnswer:
      'Honey Abishekam (Then Abishekam) is a sweet and sacred ritual where Goddess Varahi is bathed with pure honey combined with other sweet substances. This ritual is traditionally performed on Pournami (full moon) days and lasts about 1 hour. Honey is considered a sacred substance that represents sweetness, purity, and divine nectar. The benefits of Honey Abishekam include: sweetness in relationships and family interactions, improved communication skills and a pleasant voice, a magnetic and attractive personality, removal of bitterness in relationships, and attracting positive friendships and alliances. This abishekam is particularly recommended for those facing communication challenges, relationship issues, or seeking to improve their social and professional interactions.',
    category: 'abishekam',
  },
  {
    q: 'What is Milk Abishekam and when should it be performed?',
    a: 'Milk Abishekam is performed on Mondays or Ashtami days where the deity is bathed with milk. It is believed to bring mental peace, remove sins, and promote positive thoughts.',
    fullAnswer:
      'Milk Abishekam (Pal Abishekam) is a gentle and purifying ritual where Goddess Varahi is bathed with fresh, pure milk. This ritual is traditionally performed on Mondays (associated with Shiva and the Moon) or Ashtami tithi days and lasts about 1 hour. Milk is considered a sattvic (pure) substance that represents nourishment, compassion, and purity. The benefits include: mental peace and calmness, removal of past karmic sins, positive and uplifting thoughts, emotional healing, strengthening of the mind-body connection, and improved family harmony. This abishekam is particularly recommended for those experiencing stress, anxiety, mental turmoil, or seeking emotional healing and spiritual renewal.',
    category: 'abishekam',
  },

  // ── Archana Services ──
  {
    q: 'What is Varahi Sahasranamam Archana and what are its benefits?',
    a: 'Varahi Sahasranamam Archana is the chanting of the 1008 names of Goddess Varahi with flower offerings. Lasting about 45 minutes, it is best performed on Panchami or Fridays for victory over enemies, protection from evil eye, and success in endeavors.',
    fullAnswer:
      'Varahi Sahasranamam Archana is a powerful devotional ritual where the 1008 sacred names of Goddess Varahi are chanted with devotion while offering flowers to the deity. This ritual lasts approximately 45 minutes and is considered one of the most effective ways to invoke the Goddess\'s blessings. The 1008 names describe various aspects, attributes, and powers of Varahi Devi. It is best performed on Panchami tithi or Fridays. The benefits include: victory over enemies and competitors, protection from the evil eye and negative energies, success in legal and professional matters, enhanced spiritual growth, removal of obstacles in important endeavors, and overall divine protection. Devotees can book this archana for specific purposes or as a regular spiritual practice.',
    category: 'archana',
  },
  {
    q: 'What is Varahi Ashtothram Archana?',
    a: 'Varahi Ashtothram Archana is the chanting of the 108 names of Goddess Varahi with flower offerings. It is a shorter ritual (about 30 minutes) suitable for regular worship, offering protection, peace, and prosperity.',
    fullAnswer:
      'Varahi Ashtothram Archana is a devotional ritual where the 108 sacred names (Ashtothram) of Goddess Varahi are chanted with flower offerings. The Ashtothram is shorter than the Sahasranamam (which has 1008 names) and is therefore more suitable for regular or weekly worship. The ritual lasts approximately 30 minutes. Each of the 108 names represents a different aspect of the Goddess\'s divine nature. The benefits include: daily protection from negative influences, peace of mind, prosperity in daily life, and a deeper connection with the Divine Mother. This archana can be performed on any day and is ideal for devotees who wish to maintain regular spiritual practice.',
    category: 'archana',
  },
  {
    q: 'What is Katkamala Archana?',
    a: 'Katkamala Archana is a special flower garland offering ritual performed at the temple. It involves offering a beautifully crafted garland to the Goddess while chanting sacred mantras for blessings and protection.',
    fullAnswer:
      'Katkamala Archana is a special floral offering ritual where a beautifully crafted garland (mala) of fresh flowers is offered to Goddess Varahi Amman. The term "Katkamala" refers to the traditional art of flower garlanding used in temple worship. The priest performs the archana by offering the garland to the deity while chanting specific mantras, invoking the Goddess\'s blessings upon the devotee. This ritual is considered highly auspicious and is believed to bring the devotee closer to the Divine Mother. It is often performed on special occasions, festivals, or as a fulfillment of a vow (nerthikadan). The fragrance and beauty of the fresh flowers symbolize the devotee\'s devotion and love for the Goddess.',
    category: 'archana',
  },
  {
    q: 'What is Mahalakshmi Ashtothram Archana?',
    a: 'Mahalakshmi Ashtothram Archana is the chanting of 108 names of Goddess Mahalakshmi with flower offerings. It is performed at Jai Varahi Peedam for devotees seeking wealth, prosperity, abundance, and financial well-being.',
    fullAnswer:
      'Mahalakshmi Ashtothram Archana is a devotional ritual where the 108 sacred names of Goddess Mahalakshmi, the goddess of wealth and prosperity, are chanted with flower offerings. Although the main deity at Jai Varahi Peedam is Goddess Varahi, this archana is offered to invoke the blessings of the Lakshmi aspect of the Divine Mother. The ritual lasts approximately 30 minutes and is particularly recommended for those seeking financial stability, business growth, career success, and overall abundance. The 108 names of Lakshmi Devi describe her various forms and attributes related to prosperity, fortune, and well-being. Devotees can book this archana alongside Varahi worship for comprehensive blessings.',
    category: 'archana',
  },

  // ── Homam & Fire Rituals ──
  {
    q: 'What are the different types of Homams (fire rituals) performed at Jai Varahi Peedam, and what are their benefits?',
    a: 'The temple performs various homams including Panchami Homam, Pournami Homam, Ashtami Homam, Amavasai Homam, Varahi Sahasra Homam, and Navagraha Homam, each dedicated to specific outcomes like protection, wealth, health, and planetary peace.',
    fullAnswer:
      'Jai Varahi Peedam conducts several powerful homams (fire rituals) based on Vedic traditions. The key homams include: (1) Panchami Homam – performed on Panchami tithi for protection from enemies, legal issues, and negative forces; (2) Pournami Homam – on full moon days for overall well-being, family harmony, and spiritual upliftment; (3) Ashtami Homam – performed on Ashtami tithi for removing obstacles and gaining strength; (4) Amavasai Homam – on new moon days for ancestral blessings and karmic cleansing; (5) Varahi Sahasra Homam – a grand ritual with 1008 offerings, conducted for supreme blessings, wealth, and removal of major obstacles; (6) Navagraha Homam – to pacify planetary doshas and bring balance in life. Each homam is performed by trained priests with precise chanting of mantras and offerings into the sacred fire.',
    category: 'homam',
  },
  {
    q: 'What is Panchami Homam and when should I perform it?',
    a: 'Panchami Homam is a powerful fire ritual performed on the Panchami tithi (5th lunar day) dedicated to Goddess Varahi. It is ideal for protection from enemies, resolving legal disputes, removing negative influences, and gaining victory in court cases.',
    fullAnswer:
      'Panchami Homam is one of the most significant and powerful fire rituals at Jai Varahi Peedam, performed on the sacred Panchami tithi (the 5th day after the new or full moon). This homam is specifically dedicated to invoking the protective and warrior aspect of Goddess Varahi. The ritual involves offering ghee, herbs, grains, and other sacred items into the fire while chanting Varahi mantras and the Panchami-specific hymns. The benefits include: powerful protection from enemies and negative forces, resolution of legal disputes and court cases, removal of black magic or evil eye effects, victory in competitive situations, overcoming obstacles in career and business, and enhanced courage and confidence. Devotees facing legal issues, workplace challenges, or those who feel threatened by negative energies are particularly encouraged to perform this homam.',
    category: 'homam',
  },
  {
    q: 'What is Pournami Homam and what are its benefits?',
    a: 'Pournami Homam is performed on the full moon day for overall well-being, family harmony, spiritual growth, and the removal of negative energy. The full moon amplifies the spiritual benefits of the fire ritual.',
    fullAnswer:
      'Pournami Homam is a sacred fire ritual performed on the Pournami (full moon) day each month. The full moon is considered a time of heightened spiritual energy, making it ideal for homam performances. The ritual involves offering various sacred substances into the fire while chanting mantras dedicated to Goddess Varahi and the divine energies prevalent during the full moon. The benefits include: overall family well-being and harmony, spiritual upliftment and growth, removal of accumulated negative energy, enhanced mental clarity and peace, fulfillment of sincere wishes, and strengthening of positive planetary influences. This homam is suitable for all devotees and can be performed monthly or on specific Pournami days that are astrologically significant.',
    category: 'homam',
  },
  {
    q: 'What is Ashtami Homam?',
    a: 'Ashtami Homam is performed on the Ashtami tithi (8th lunar day) for removing obstacles, gaining strength, and seeking the fierce protective blessings of the Divine Mother. It is especially powerful for overcoming challenges.',
    fullAnswer:
      'Ashtami Homam is a fire ritual performed on the Ashtami tithi (the 8th day after the new or full moon). Ashtami is associated with the fierce and powerful forms of the Divine Mother, including Durga and Kali. At Jai Varahi Peedam, this homam is performed to invoke the protective and strength-giving aspect of Goddess Varahi. The benefits include: removal of stubborn obstacles and hurdles, gaining physical and mental strength, protection from accidents and mishaps, overcoming deep-seated fears and anxieties, and empowerment during difficult life transitions. This homam is particularly recommended for those facing persistent challenges, health issues, or major life changes.',
    category: 'homam',
  },
  {
    q: 'What is Amavasai Homam and why is it important?',
    a: 'Amavasai Homam is performed on the new moon day (Amavasai) for ancestral blessings, karmic cleansing, and removing family-related obstacles. It is considered highly important for performing ancestral rites (Pitru Tharpanam).',
    fullAnswer:
      'Amavasai Homam is a significant fire ritual performed on Amavasai (the new moon day), which occurs once every month. Amavasai is considered a powerful day for connecting with ancestors (Pitrus) and performing karmic cleansing rituals. The homam involves offering sesame seeds, rice, ghee, and other sacred items into the fire while chanting mantras for ancestral peace and karmic resolution. The benefits include: blessings from departed ancestors, removal of ancestral karmic burdens (Pitru Dosha), resolution of family disputes and issues, clearing of obstacles in marriage and childbirth, and overall family prosperity and harmony. The most significant Amavasai for this purpose is Aadi Amavasai (in August), when special homams and tharpanam rituals are conducted. Devotees experiencing recurring family issues, delays in marriage, or lack of progeny are advised to perform this homam.',
    category: 'homam',
  },
  {
    q: 'Can I perform a Varahi Homam for specific personal or professional goals such as career growth, property disputes, or legal issues?',
    a: 'Yes, devotees can book Varahi Homam with specific sankalpams for career advancement, property resolution, legal protection, and other personal or professional needs. Please discuss your requirements with the temple priest during booking.',
    fullAnswer:
      'Absolutely. Varahi Homam is highly effective for addressing specific life challenges. Devotees can choose from various homams and specify a sankalpam (sacred intention) that outlines their particular goal—whether it is overcoming a career hurdle, resolving a property dispute, gaining favor in a legal case, or seeking protection from adversaries. During the homam, the priest chants mantras with the devotee\'s name, gothram, and the specific intention, directing the fire offerings to invoke Varahi\'s grace. For best results, it is recommended to consult the temple priest to select the appropriate homam and date. You can provide your details during online booking or speak directly to the temple team at +91 90928 78389 for personalized guidance.',
    category: 'homam',
  },
  {
    q: 'What is Varahi Sahasra Homam?',
    a: 'Varahi Sahasra Homam is a grand fire ritual where 1008 offerings are made into the sacred fire. It is the most powerful homam at the temple, conducted for supreme blessings, removal of major obstacles, wealth, and spiritual elevation.',
    fullAnswer:
      'Varahi Sahasra Homam (also known as Sahasra Kundam Homam) is the most elaborate and powerful fire ritual performed at Jai Varahi Peedam. In this grand ceremony, 1008 different offerings (sahasra means 1000) are made into the sacred fire while chanting the complete set of Varahi mantras. The offerings include a wide variety of sacred items such as ghee, grains, herbs, flowers, fruits, and other auspicious substances. This homam typically lasts several hours and requires multiple priests to perform. It is conducted for: supreme blessings of Goddess Varahi, removal of major life obstacles and blockages, immense wealth and prosperity, profound spiritual elevation and enlightenment, and protection from severe negative influences. This homam is reserved for significant life events and is performed on the most auspicious days as determined by the temple astrologers.',
    category: 'homam',
  },

  // ── Annadhanam ──
  {
    q: 'What is Annadhanam and how can I sponsor it at Jai Varahi Peedam?',
    a: 'Annadhanam is the sacred offering of food to devotees visiting the temple. At Jai Varahi Peedam, Nithya Maha Annadhanam Seva serves wholesome vegetarian meals to hundreds of devotees daily at 12:30 PM. You can sponsor a day\'s meal through the donation page.',
    fullAnswer:
      'Annadhanam (Anna = food, Dhanam = charity) is the sacred act of offering free food to devotees, visitors, and the needy. It is considered one of the highest forms of charity (Dharma) in Hindu tradition, as it nourishes both body and soul. At Jai Varahi Peedam, the Nithya Maha Annadhanam Seva serves pure, clean, and wholesome vegetarian meals (Prasadam) to hundreds of devotees daily at 12:30 PM, promptly after the noon poojas. Devotees can sponsor Annadhanam by: (1) Sponsoring a full day\'s meal through the payment/donation page on the website; (2) Contacting the temple directly at +91 90928 78389 to arrange sponsorship; (3) Making a donation specifically marked for Annadhanam. Sponsors earn the immense spiritual merit of feeding fellow devotees and receive the blessings of Goddess Sri Kottai Varahi Amman. This is especially popular during the Ashada Navarathiri festival when thousands of devotees visit the temple.',
    category: 'annadhanam',
  },
  {
    q: 'What is Nithya Maha Annadhanam Seva?',
    a: 'Nithya Maha Annadhanam Seva is the daily food donation program at Jai Varahi Peedam where hundreds of devotees are served wholesome vegetarian meals at 12:30 PM. It is a continuous, daily charitable service, not just for festivals.',
    fullAnswer:
      'Nithya Maha Annadhanam Seva (Nithya = daily, Maha = great, Annadhanam = food charity, Seva = service) is the daily food donation program at Jai Varahi Peedam. Unlike festival-specific food distribution, this is a continuous, daily service that operates every day the temple is open. The program serves hundreds of devotees, pilgrims, and visitors with clean, pure, and wholesome vegetarian meals served on traditional banana leaves. The food is prepared with devotion in the temple kitchen, offered to the Goddess first as naivedyam, and then distributed as Prasadam. The service starts promptly at 12:30 PM. Devotees can participate in this meritorious service by sponsoring a day\'s meal, contributing towards monthly food supplies, or making a general donation earmarked for Annadhanam. Every contribution directly feeds visitors who come seeking the Goddess\'s blessings.',
    category: 'annadhanam',
  },
  {
    q: 'How can I sponsor Annadhanam during the Ashada Navarathiri festival?',
    a: 'During Ashada Navarathiri, the number of devotees increases significantly, and additional Annadhanam sponsorships are needed. You can sponsor by visiting the payment page, selecting "Annadhanam" as the purpose, or contacting the temple at +91 90928 78389.',
    fullAnswer:
      'The Ashada Navarathiri festival (typically in July-August) attracts thousands of devotees to Jai Varahi Peedam, making Annadhanam sponsorship especially important during this period. The temple serves meals to all visiting devotees throughout the 11-day festival. To sponsor Annadhanam during Ashada Navarathiri: (1) Visit the website\'s payment/donation page and specify "Ashada Navarathiri Annadhanam" in the purpose or message field; (2) Contact the temple administration at +91 90928 78389 to coordinate sponsorship for specific days; (3) Visit the temple in person and make a donation at the temple office. Sponsors are often recognized during the festival and receive special blessings from the Goddess. The temple provides transparency about how the funds are used for food preparation. Given the high demand, early booking is recommended.',
    category: 'annadhanam',
  },

  // ── Go Seva (Cow Service) ──
  {
    q: 'What is Go Seva and how can I participate?',
    a: 'Go Seva is the sacred service of caring for cows, considered a compassionate spiritual offering in Hindu tradition. At Jai Varahi Peedam, you can participate through Cow Adoption, Cow Donation, Cow Maintenance, or Cow Pooja.',
    fullAnswer:
      'Go Seva (cow service) is a sacred spiritual practice in Hindu tradition where devotees serve and care for cows, which are revered as gentle mothers and sacred beings. At Jai Varahi Peedam, devotees can participate in Go Seva through four offerings: (1) Cow Adoption — sponsor the lifetime feed, medical care, and maintenance of a temple cow; (2) Cow Donation — contribute funds towards acquiring new cows or supporting goshala construction; (3) Cow Maintenance — contribute towards daily fodder, nutritious feed, cleaning, and veterinary care; (4) Cow Pooja (Nandhini Pooja) — perform direct worship of cows with turmeric and offerings on Fridays and Mattu Pongal. All Go Seva contributions support the temple\'s goshala (cow shelter) and are considered highly meritorious. Devotees receive regular updates and monthly archana blessings for their seva.',
    category: 'goseva',
  },
  {
    q: 'Tell me about the Goshala (cow shelter) at Jai Varahi Peedam. How can I support it?',
    a: 'The temple maintains a Goshala with several cows that are cared for with love and respect. You can support through cow adoption, donation for feed and medical care, or by participating in Cow Pooja. Your contributions help sustain this sacred service.',
    fullAnswer:
      'The Goshala at Jai Varahi Peedam is home to a number of cows, which are treated as divine beings and provided with proper shelter, nutritious feed, and regular veterinary care. The temple believes that serving cows (Go Seva) brings immense spiritual merit and helps in the fulfillment of wishes. You can support the Goshala in the following ways: (1) Cow Adoption – sponsor a cow for a year, covering its feed, maintenance, and medical expenses; (2) Cow Donation – contribute funds towards the construction of better shelters or the purchase of additional cows; (3) Cow Maintenance – donate towards daily fodder, cleaning supplies, and healthcare; (4) Cow Pooja – participate in the worship of cows on specific days like Fridays and Mattu Pongal. All donors receive updates and blessings from the temple. To contribute, you can use the online donation page or contact the temple directly.',
    category: 'goseva',
  },
  {
    q: 'What is Cow Pooja (Nandhini Pooja)?',
    a: 'Cow Pooja (Nandhini Pooja) is a ritual where cows are worshipped with turmeric, kumkum, flowers, and lamps. It is performed at the temple on Fridays and Mattu Pongal to honor the sacred cow as a divine being.',
    fullAnswer:
      'Cow Pooja, also known as Nandhini Pooja (named after the sacred cow Nandhini), is a beautiful ritual where the temple cows are worshipped as divine beings. The ceremony involves: applying turmeric and kumkum to the cows, decorating them with flower garlands, offering them special feed (including fruits, vegetables, and jaggery), lighting lamps before them, and performing pradakshina (circumambulation). The ritual is performed on Fridays (considered auspicious for Goddess worship) and on Mattu Pongal (the Tamil festival of cattle). Devotees can participate in the Cow Pooja by booking this service through the temple. The benefits include: fulfillment of wishes, removal of obstacles, blessings of the Divine Mother through her sacred animals, and accumulation of great spiritual merit (punya).',
    category: 'goseva',
  },

  // ── Kosala (Goshala) Donations ──
  {
    q: 'What is Kosala (Goshala) and what is the purpose of Kosala donations at Jai Varahi Peedam?',
    a: 'Kosala (Goshala) is the sacred cow shelter maintained at Jai Varahi Peedam as part of its charitable activities. Donations support nutritious fodder, clean water, veterinary care, shelter maintenance, and daily Go Pooja rituals for the cows.',
    fullAnswer:
      'Kosala (also referred to as Goshala) is the sacred cow shelter maintained as a core part of Jai Varahi Peedam\'s charitable and spiritual activities alongside temple worship, astrology (Jothidam), homams, and Varahi Upasana. The purpose of the Kosala is to provide lifelong care, food, shelter, and medical treatment for cows while preserving the traditional values of Go Seva (service to cows). Every contribution supports the daily operation and welfare of the cows, including: nutritious green fodder and cattle feed, clean drinking water, veterinary care and medicines, shelter maintenance and cleanliness, care for aged, rescued, and non-milking cows, daily Go Pooja and Goshala rituals, and the staff who care for the animals. These donations help ensure that the cows receive continuous care throughout their lives at the temple.',
    category: 'kosala',
  },
  {
    q: 'What are the different types of Kosala (Goshala) donations available at Jai Varahi Peedam?',
    a: 'Devotees can contribute through General Goshala Donation, Go Seva (daily fodder), Go Pooja Sponsorship, Go Dhanam (cow welfare donation), and Festival Goshala Seva during special occasions like Ashada Navarathiri.',
    fullAnswer:
      'Jai Varahi Peedam offers several types of Kosala (Goshala) donations for devotees who wish to support cow welfare: (1) General Goshala Donation – supports the overall maintenance, cleaning, and operations of the cow shelter; (2) Go Seva – helps provide daily nutritious fodder, cattle feed, and clean water for the cows; (3) Go Pooja Sponsorship – supports the daily worship of cows, a traditional act of devotion that brings peace and prosperity to the sponsor\'s family; (4) Go Dhanam – a donation made specifically in support of cow welfare and religious service, considered highly meritorious; (5) Festival Goshala Seva – special contributions during temple festivals such as Ashada Navarathiri, which may include feeding cows, supporting Annadhanam, and participation in Varahi Homam with family Sankalpam prayers. Devotees can choose any of these options based on their preference and capacity.',
    category: 'kosala',
  },
  {
    q: 'What is the spiritual significance of Kosala (Goshala) donations and Go Seva?',
    a: 'According to Hindu tradition, serving cows is considered an act of compassion and dharma. Go Pooja is believed to bring peace, prosperity, and divine blessings. Feeding cows is regarded as a sacred charitable act that brings family well-being, health, success, and spiritual merit.',
    fullAnswer:
      'Kosala (Goshala) donations and Go Seva (service to cows) hold deep spiritual significance in Hindu tradition. The cow is revered as a gentle mother (Gomatha) and a symbol of selfless giving, providing milk, dung (fuel), and labor without expecting anything in return. Serving cows is considered an act of compassion and dharma that purifies the mind and heart. Go Pooja (cow worship) is believed to bring peace, prosperity, and divine blessings to the family. Feeding cows is regarded as a sacred charitable act, and many devotees perform Go Seva seeking family well-being, health, success, and spiritual merit (punya). During major celebrations such as Ashada Navarathiri, the Kosala Seva is integrated into special devotional offerings, allowing devotees to combine charity with worship. These beliefs are rooted in Hindu tradition and represent sacred teachings that have been passed down through generations.',
    category: 'kosala',
  },

  // ── Donations ──
  {
    q: 'How can I make a donation to Jai Varahi Peedam?',
    a: 'You can make a secure online donation to Jai Varahi Peedam through our payment page using Razorpay, accepting all major credit/debit cards and UPI payments. Donations support temple maintenance, community service, and spiritual programs.',
    fullAnswer:
      'Jai Varahi Peedam accepts secure online donations through our dedicated payment portal, powered by Razorpay (a trusted Indian payment gateway). You can contribute using credit/debit cards (Visa, Mastercard, RuPay), UPI payments (Google Pay, PhonePe, Paytm), net banking, and wallets. All transactions are encrypted and secure. Donations support temple maintenance, community welfare projects, social development programs, and the continuation of free spiritual services. Donors receive a digital receipt and can optionally provide their contact details for follow-up. For large donations or corporate sponsorships, you can also contact the temple directly at +91 90928 78389 or email varahikottai@gmail.com. Your contribution helps sustain the sacred space and its humanitarian mission.',
    category: 'donation',
  },
  {
    q: 'Is my donation tax-deductible?',
    a: 'Donations to Jai Varahi Peedam may qualify for tax deductions under Section 80G of the Indian Income Tax Act. Please contact the temple for official donation receipts and tax documentation.',
    fullAnswer:
      'Donations made to Jai Varahi Peedam may be eligible for tax deductions under Section 80G of the Indian Income Tax Act, subject to the provisions and exemptions granted to the organization. Devotees and donors should contact the temple administration directly at +91 90928 78389 or email varahikottai@gmail.com to obtain official donation receipts and tax documentation. The temple provides digital and physical receipts upon request. Please note that tax deductibility depends on the donor\'s residential status and the specific provisions applicable at the time of donation. It is advisable to consult with a tax professional for personalized guidance.',
    category: 'donation',
  },
  {
    q: 'Can I make a donation in memory of a loved one?',
    a: 'Yes, you can make a donation in memory of a departed loved one. The temple will perform special prayers for the departed soul and include the name in the sankalpam during the next ritual. Please mention the purpose when donating.',
    fullAnswer:
      'Yes, Jai Varahi Peedam accepts donations made in memory of departed loved ones. When making a donation, you can specify the name of the departed soul and your relationship to them. The temple will: (1) Include the departed soul\'s name in the sankalpam during the next available pooja or homam; (2) Perform special prayers for the peace of the departed soul; (3) Offer the spiritual merit of the donation for the benefit of the departed. This is considered a highly meritorious act that brings blessings to both the donor and the departed soul. You can make this donation through the online payment page (mentioning the purpose in the message field) or by contacting the temple directly at +91 90928 78389.',
    category: 'donation',
  },

  // ── Temple Trust & Transparency ──
  {
    q: 'Is Jai Varahi Peedam operated as a registered charitable trust?',
    a: 'Jai Varahi Peedam operates its temple, goshala, educational, and social welfare activities as a structured charitable initiative. For specific registration and legal documentation, devotees should contact the temple administration directly.',
    fullAnswer:
      "Jai Varahi Peedam runs its temple worship, Sri Varahi Jothida Vidyalayam, Goshala (Kosala), and community welfare programs (Annadhanam, medical camps, education support) as an organized charitable initiative under the guidance of Swamy Pallur Varahidhasan. For devotees or donors who require official registration numbers, trust deed information, or 80G tax-exemption documentation, it is best to contact the temple administration directly at +91 90928 78389 or varahikottai@gmail.com — the team can share the exact legal and registration details along with an official donation receipt.",
    category: 'trust',
  },
  {
    q: 'How does Jai Varahi Peedam ensure transparency in how donations are used?',
    a: 'Donations are collected through a secure, traceable payment gateway (Razorpay), digital receipts are issued, and devotees can request clarification on how their specific contribution — such as Annadhanam or Goshala seva — was used.',
    fullAnswer:
      "Jai Varahi Peedam aims to be transparent about how devotee contributions are used. Online donations are processed through Razorpay, a regulated Indian payment gateway, which provides a digital trail and receipt for every transaction. Devotees can specify the purpose of their donation (e.g., Annadhanam, Goshala/Kosala, general temple maintenance, or a specific pooja/homam sankalpam), and the temple applies contributions accordingly. For sponsorships like a day's Annadhanam or a Goshala cow adoption, sponsors can follow up directly with the temple office for updates. Devotees seeking a detailed breakdown of fund usage, especially for large or corporate donations, can request this directly from the temple administration.",
    category: 'trust',
  },
  {
    q: 'Where can I get an official receipt for my donation or seva sponsorship?',
    a: 'Digital receipts are generated automatically for online payments made via the website. For official trust receipts or 80G documentation, contact the temple office by phone or email.',
    fullAnswer:
      "When you make an online donation or book a paid seva (such as Sahasra Abishekam materials or a Goshala sponsorship) through the Jai Varahi Peedam website, a digital payment receipt is generated automatically via the Razorpay gateway. If you need an official temple receipt — for example, for 80G tax-deduction purposes or as proof of a specific dedication (such as a donation made in memory of a loved one) — contact the temple administration at +91 90928 78389 or varahikottai@gmail.com with your payment details, and the team will issue the appropriate documentation.",
    category: 'trust',
  },

  // ── Online Booking ──
  {
    q: 'How do I book a temple service or pooja online?',
    a: 'To book a temple service online, visit the Services page, select your preferred ritual category and specific pooja, click "Book Now", fill in your details, and submit. You will receive a booking ID and confirmation receipt.',
    fullAnswer:
      'Booking a temple service or pooja online at Jai Varahi Peedam is a simple process: Visit the Services page at jaivarahi.org/services. Browse the service categories: Abishekam Services, Archana Services, Homam Rituals, Special Occasions, Special Pooja, and Gomatha Pooja Services. Click on the service card for your preferred ritual. You can use the "Book via WhatsApp" button or the "Book Now" link on each card. Alternatively, use the booking form on the same page where you can fill in your name, phone number, service type, preferred date, and additional details. After submission, the temple team will verify your booking and contact you to confirm the ritual schedule. You will receive a booking ID and confirmation. For personalized assistance, you can also call +91 90928 78389.',
    category: 'booking',
  },
  {
    q: 'Can I reschedule or cancel my booking?',
    a: 'Yes, you can reschedule or cancel your booking by contacting the temple team directly via phone or WhatsApp at +91 90928 78389 at least 24 hours before your preferred date.',
    fullAnswer:
      'Yes, bookings for temple services can be rescheduled or cancelled by contacting the temple team directly. Please call or WhatsApp the temple at +91 90928 78389 at least 24 hours before your preferred date to request a reschedule or cancellation. The temple team will assist you with finding an alternative date that suits your schedule. For rescheduling, please provide your booking ID and the new preferred date and time slot. For cancellations, the temple will process any applicable refunds according to their policy. During major festivals and high-demand periods, rescheduling requests are subject to availability.',
    category: 'booking',
  },
  {
    q: 'What information do I need to provide when booking a pooja?',
    a: 'You need to provide your full name, phone number, email address, city, Gothram, Nakshatram, Rasi, family members for Sankalpam, preferred date and time, and any special requests.',
    fullAnswer: 'When booking a temple service or pooja at Jai Varahi Peedam, you need to provide the following information: (1) Full name of the primary devotee; (2) Phone number (10-digit mobile number); (3) Email address (optional but recommended for confirmation); (4) City; (5) Gothram (e.g., Kashyapa, Atri); (6) Nakshatram (birth star, e.g., Aswini, Bharani); (7) Rasi (zodiac sign, e.g., Mesha, Rishabha); (8) Family members who will be included in the Sankalpam (sacred intention) chanting; (9) Preferred date for the ritual; (10) Preferred time slot (morning 7:00 AM–11:30 AM or evening 4:30 PM–8:00 PM); and (11) Any special requests or notes. All information is kept confidential and used solely for the purpose of conducting your ritual.',
    category: 'booking',
  },
  {
    q: 'Are there any payments required for booking temple services?',
    a: 'General temple service bookings are registered free of charge. If a specific service requires items or sponsorships, the temple team will provide details when confirming your booking via phone.',
    fullAnswer: 'General temple service bookings (poojas, homams, abishekam, archana) are registered free of charge through the online booking system. The temple does not charge a direct fee for booking these sacred rituals. However, if a particular service requires specific items (such as 1008 ingredients for Sahasra Abishekam, special homam materials, or goshala supplies), the temple team will discuss the details and any associated costs when confirming your booking via phone. Devotees are welcome to make voluntary donations to support the temple\'s maintenance and social service initiatives through the separate donation page. The temple ensures transparency in all communications regarding any required offerings.',
    category: 'booking',
  },
  {
    q: 'How can I receive prasadam from the temple? Can prasadam be sent to out-of-town devotees?',
    a: 'Prasadam is distributed at the temple after each pooja. Out-of-town devotees can request prasadam to be sent via courier by contacting the temple office and covering the shipping charges.',
    fullAnswer:
      'Prasadam (sacred offerings) is available to all visitors after the completion of each pooja. Typically, it includes items like vibhuti (sacred ash), kumkum, and sometimes food offerings (like sweet pongal or ladoo). For devotees who cannot visit the temple, the temple administration offers the facility to send prasadam through courier services. To request this, you need to contact the temple office via phone or email, provide your shipping address, and pay the applicable courier charges. The temple will arrange for the prasadam to be packed and dispatched within a few days. This service is especially popular during festivals and on special occasions like Varahi Jayanthi. Please note that perishable items like food cannot be sent long distances; only dry prasadam items are couriered.',
    category: 'booking',
  },
  {
    q: 'Can NRI or overseas devotees book poojas for family members in India?',
    a: 'Yes, NRI and overseas devotees can book poojas online or by phone/email, providing the beneficiary\'s name, gothram, and nakshatram details so the ritual is performed with the correct sankalpam even without being physically present.',
    fullAnswer:
      "Jai Varahi Peedam regularly supports devotees living abroad who wish to sponsor rituals for themselves or family members in India. NRI and overseas devotees can book any pooja, homam, or abishekam through the website's online booking form, or by contacting the temple via WhatsApp/phone at +91 90928 78389 or email at varahikottai@gmail.com. When booking remotely, it helps to provide the beneficiary's full name, Gothram, Nakshatram, and Rasi so the priest can include them accurately in the sankalpam. After the ritual, the temple can share updates, and dry prasadam items can be couriered internationally on request (subject to shipping charges and customs regulations of the destination country). This makes it possible for devotees anywhere in the world to receive the Goddess's blessings through the temple.",
    category: 'booking',
  },
  {
    q: 'Does Jai Varahi Peedam perform poojas for devotees who cannot be physically present?',
    a: 'Yes, devotees can book a pooja, homam, or archana remotely by phone, WhatsApp, or the online form, with the priest performing the ritual on their behalf using their name, gothram, and specific sankalpam.',
    fullAnswer:
      "Jai Varahi Peedam accommodates devotees who cannot travel to the temple by allowing them to sponsor rituals remotely. After booking online, by phone, or via WhatsApp at +91 90928 78389, devotees provide their name, Gothram, Nakshatram, Rasi, and the specific intention (sankalpam) for the ritual. The temple priest then performs the pooja, homam, or archana on the devotee's behalf on the scheduled date, including their name and intention in the sacred chanting. While the devotee cannot witness the ritual live unless it coincides with a livestreamed festival on the temple's YouTube channel, dry prasadam can be requested for courier delivery afterward.",
    category: 'booking',
  },

  // ── Astrology (Jothidam) ──
  {
    q: 'What is Jothidam (astrology) guidance offered at Jai Varahi Peedam?',
    a: 'Sri Varahi Jothida Vidyalayam, founded by Swamy Pallur Varahidhasan, offers expert Vedic astrology services including Panchangam, Horoscope analysis, Kochara, Match Making, and Muhurtham (auspicious timing) in Vellore.',
    fullAnswer: 'Sri Varahi Jothida Vidyalayam is the astrological wing of Jai Varahi Peedam, founded by the esteemed Swamy Pallur Varahidhasan. Located in Katpadi, Vellore, Tamil Nadu, it offers comprehensive Vedic astrology services to guide devotees through life\'s challenges and opportunities. The services include: (1) Panchangam — daily calendar with auspicious times, horai, nakshatra details, and planetary positions; (2) Horoscope — personalized reports with planetary positions, dasa periods, and life predictions; (3) Kochara — planetary positions, nakshatra paadha saaram, lagnam timings, and sub-planetary influences; (4) Match Making — zodiac compatibility analysis, papasamyam assessment, and horoscope matching for marriage; (5) Muhurtham — auspicious time selection for marriage, housewarming, business openings, and naming ceremonies. The astrology services combine traditional Vedic wisdom with practical guidance.',
    category: 'astrology',
  },
  {
    q: 'What is Panchangam and how is it used at Sri Varahi Jothida Vidyalayam?',
    a: 'Panchangam is a daily astrological calendar that provides auspicious times, horai (24-hour planetary timings), nakshatra details, sunrise/sunset, Rahu Kaalam, Emaganda Kaalam, Kuligai, and Muhurtham timings based on Horai and Gowri calculations.',
    fullAnswer:
      'Panchangam (Pancha = five, Angam = parts) is a comprehensive daily astrological calendar that forms the foundation of Vedic timekeeping. At Sri Varahi Jothida Vidyalayam, the Panchangam provides: daily auspicious and inauspicious time windows, Horai (24-hour planetary hour timings) for each day, nakshatra (birth star) details and their planetary lords, sunrise and sunset times, Rahu Kaalam (inauspicious period), Emaganda Kaalam (another inauspicious window), Kuligai (specific time for certain activities), and Muhurtham timings (auspicious windows) based on Horai and Gowri calculations. The Panchangam is used by the astrologers to determine the best times for conducting poojas, homams, weddings, housewarmings, and other important events. Devotees can consult the Vidyalayam for daily Panchangam readings and personalized guidance.',
    category: 'astrology',
  },
  {
    q: 'What is Kochara (Jothidam) and how does it affect my life?',
    a: 'Kochara (Jothidam) refers to the study of planetary positions and their influence on an individual\'s life. It includes analyzing daily planetary movements, nakshatra paadha saaram, lagnam timings, and sub-planetary influences to predict life events.',
    fullAnswer:
      'Kochara (also spelled Kocharam) is a branch of Vedic astrology that focuses on the analysis of planetary positions and their transit (movement) through the zodiac. At Sri Varahi Jothida Vidyalayam, Kochara analysis includes: assessment of daily planetary positions and their influence, nakshatra paadha saaram (analysis of birth star quarters), lagnam timings (rising sign calculations), and sub-planetary influences (sub-lords and their effects). Saturn\'s Kocharam (Kandaga, Ezharai, and Ashtama Sani) is particularly important, as it represents periods of challenge and transformation. The astrologers at the Vidyalayam provide detailed Kochara reports that help devotees understand the current planetary influences on their life and suggest appropriate remedial measures, including specific poojas or homams, to mitigate negative effects and enhance positive ones.',
    category: 'astrology',
  },
  {
    q: 'What is Horoscope matching (Match Making) for marriage?',
    a: 'Horoscope matching is the Vedic astrology process of comparing two individuals\' birth charts to assess marriage compatibility. It checks zodiac compatibility, papasamyam (dosha assessment), and overall match quality before marriage.',
    fullAnswer:
      'Horoscope matching (also known as Jathagam Porutham or Match Making) is a traditional Vedic astrology service offered at Sri Varahi Jothida Vidyalayam. The process involves: (1) Detailed analysis of both individuals\' birth charts (Janma Patrikai); (2) Assessment of Dina Porutham (day compatibility), Gana Porutham (nature compatibility), Mahendra Porutham (prosperity), Stree-Dheerga Porutham (longevity), and other key compatibility factors; (3) Papasamyam assessment — evaluation of negative planetary influences and doshas (flaws) in the match; (4) Star compatibility analysis — checking the compatibility of the couple\'s nakshatras (birth stars); (5) Overall match percentage and recommendation. The astrologer provides a comprehensive report along with recommendations for any remedial poojas or homams if the match has doshas. This service helps ensure a harmonious and prosperous married life.',
    category: 'astrology',
  },
  {
    q: 'What is Muhurtham and how do I select an auspicious date for events?',
    a: 'Muhurtham is the selection of an auspicious time for important events like marriage, housewarming, business opening, or naming ceremony. At Sri Varahi Jothida Vidyalayam, astrologers calculate the best Muhurtham based on your birth chart and the event type.',
    fullAnswer:
      'Muhurtham (also spelled Muhurta) is the process of selecting the most auspicious date and time for important life events to ensure success and divine blessings. At Sri Varahi Jothida Vidyalayam, Muhurtham selection is done carefully considering: (1) The nature of the event (marriage, housewarming, business opening, naming ceremony, etc.); (2) The birth charts of the individuals involved; (3) Lunar phase (tithi), day of the week, and nakshatra; (4) Planetary positions and their strength; (5) Panchangam calculations including Rahu Kaalam, Yamagandam, and other inauspicious periods; (6) Lagnam (ascendant) suitability for the event. The astrologer recommends a specific date and time window that is most favorable for the intended event. Booking a Muhurtham consultation in advance is recommended, especially for wedding dates, as popular dates fill up quickly.',
    category: 'astrology',
  },
  {
    q: 'How do I book an astrology consultation?',
    a: 'You can book an astrology consultation at Sri Varahi Jothida Vidyalayam by calling +91 90928 78389 or +91 95002 06199, or by emailing varahikottai@gmail.com. Visit our Vidyalayam page for detailed service information.',
    fullAnswer: 'To book an astrology consultation at Sri Varahi Jothida Vidyalayam, you can contact the temple through multiple channels: Call us directly at +91 90928 78389 or +91 95002 06199 during temple hours. You can also email your birth details and queries to varahikottai@gmail.com for detailed astrological analysis and recommendations. For in-person consultations, you can visit the Vidyalayam at the temple premises in Arumparuthi, Katpadi, Vellore. When booking, please have your birth details ready (date, time, and place of birth) for accurate horoscope analysis. Our experienced astrologers will provide personalized guidance based on your birth chart and planetary positions.',
    category: 'astrology',
  },
  {
    q: 'What is Sri Varahi Jothida Vidyalayam and what services does it offer?',
    a: 'Sri Varahi Jothida Vidyalayam is the astrology and education wing of Jai Varahi Peedam, founded by Swamy Pallur Varahidhasan. It offers Vedic astrology services, Panchangam, horoscope analysis, match making, muhurtham, and also conducts spiritual courses and workshops.',
    fullAnswer:
      'Sri Varahi Jothida Vidyalayam is the educational and astrological division of Jai Varahi Peedam, established by founder Swamy Pallur Varahidhasan in Katpadi, Vellore. The name "Vidyalayam" means "school" or "place of learning," reflecting its mission to educate and guide devotees through Vedic wisdom. The Vidyalayam offers: (1) Vedic astrology services including Panchangam, Horoscope, Kochara, Match Making, and Muhurtham; (2) Astrology courses for beginners and advanced learners; (3) Workshops on Varahi worship and spiritual practices; (4) Spiritual retreats and meditation programs; (5) Educational guidance based on astrological principles. The Vidyalayam combines traditional Vedic knowledge with practical, actionable guidance for modern life. Swamy Pallur Varahidhasan personally oversees the astrological services, drawing on decades of experience.',
    category: 'vidyalayam',
  },
  {
    q: 'Does Sri Varahi Jothida Vidyalayam offer any astrology or spiritual courses?',
    a: 'Yes, the Vidyalayam conducts astrology courses for beginners and advanced learners, as well as workshops on Varahi worship, Vedic traditions, meditation, and spiritual practices. Contact the temple for course schedules and registration.',
    fullAnswer:
      'Sri Varahi Jothida Vidyalayam offers a variety of educational programs for those interested in deepening their knowledge of Vedic astrology and spirituality. The courses include: (1) Beginner Astrology Course — covering the basics of Panchangam, nakshatras, zodiac signs, and planetary influences; (2) Advanced Astrology Course — in-depth study of horoscope analysis, dasa systems, Kochara, and predictive techniques; (3) Varahi Worship Workshop — learning the proper methods of chanting Varahi mantras, performing simple poojas, and understanding the philosophical significance of Varahi; (4) Meditation and Spiritual Retreats — conducted periodically to help devotees deepen their spiritual practice; (5) Vedic Wisdom Seminars — talks by eminent scholars on topics like Vedic cosmology, the Sapta Matrikas, and the role of the Goddess in modern life. Interested individuals can contact the temple administration for course schedules, fees, and registration details.',
    category: 'vidyalayam',
  },

  // ── Astrology Education & Courses (Sri Varahi Jothida Vidyalayam) ──
  {
    q: 'What astrology courses are offered at Sri Varahi Jothida Vidyalayam?',
    a: 'Sri Varahi Jothida Vidyalayam offers structured astrology training across three levels: Basic Astrology (planets, zodiac signs, horoscope preparation), Intermediate Astrology (horoscope analysis, planetary combinations, Dasha-Bhukti, transit predictions), and Advanced Astrology (predictive techniques, marriage analysis, career prediction, health astrology, timing of events, remedies).',
    fullAnswer:
      'Sri Varahi Jothida Vidyalayam provides comprehensive and structured astrology education for students at all levels. The courses are designed to take a student from complete beginner to professional-level proficiency. The course structure includes: (1) Basic Astrology — introduction to the nine planets (Navagrahas), twelve zodiac signs (Rasis), houses (Bhavas), and horoscope preparation (Janma Patrika); (2) Intermediate Astrology — in-depth horoscope analysis, planetary combinations (Yogas), Dasha and Bhukti systems, transit (Gochara) predictions, and the interpretation of planetary aspects; (3) Advanced Astrology — advanced predictive techniques, marriage analysis (including compatibility factors), career prediction (professional success timing), health astrology (diagnosing health issues from the chart), timing of events through Dasha systems, and appropriate remedial measures including homams and poojas. Each level builds on the previous one, ensuring a thorough understanding of Vedic astrology principles.',
    category: 'vidyalayamCourses',
  },
  {
    q: 'Who can join the astrology classes at Sri Varahi Jothida Vidyalayam?',
    a: 'The classes are open to beginners with no astrology background, spiritual seekers, students interested in Vedic astrology, practicing astrologers who want advanced training, and people wishing to become professional astrologers.',
    fullAnswer:
      'Sri Varahi Jothida Vidyalayam welcomes students from all backgrounds who have a sincere interest in learning Vedic astrology. The courses are designed to accommodate: (1) Beginners with no prior astrology knowledge — the basic course starts from fundamentals and requires no prerequisites; (2) Spiritual seekers who wish to understand the cosmic principles governing life; (3) Students interested in Vedic astrology as a complementary field of study; (4) Practicing astrologers who want to advance their skills with advanced techniques and traditional wisdom; (5) People wishing to become professional astrologers — the comprehensive curriculum prepares students for professional practice. The Vidyalayam\'s teaching approach combines traditional Guru-shishya (teacher-student) methodology with modern educational techniques, ensuring that students not only learn the technical aspects but also develop the intuitive and spiritual dimensions of astrological practice.',
    category: 'vidyalayamCourses',
  },
  {
    q: 'Does Sri Varahi Jothida Vidyalayam teach numerology, Vastu, and palmistry?',
    a: 'Yes, in addition to Vedic astrology, the Vidyalayam also offers instruction in Numerology (name analysis, birth number analysis, lucky numbers, name correction), Vastu Shastra (residential and commercial Vastu principles and remedies), and Palmistry (reading palm lines, mounts, personality and life predictions).',
    fullAnswer:
      'Sri Varahi Jothida Vidyalayam provides a holistic education in the allied sciences of Vedic wisdom. Beyond traditional astrology, the following subjects are taught: (1) Numerology — name numerology analysis, birth number and destiny number analysis, lucky numbers and colors, and name correction for personal and business success; (2) Vastu Shastra — principles of Vastu for homes and businesses, site and building evaluation, Vastu remedies and corrections for existing buildings, and commercial Vastu for business prosperity; (3) Palmistry (Hasta Samudrika) — reading the major and minor lines of the palm (life line, head line, heart line, fate line), analysis of mounts and their significance, personality assessment through hand shape and finger proportions, and life predictions based on palm features. These subjects complement the astrology curriculum and provide students with a comprehensive toolkit for holistic guidance.',
    category: 'vidyalayamCourses',
  },

  // ── Astrology Prediction Services (Consultation) ──
  {
    q: 'What personal astrology prediction services are offered at Sri Varahi Jothida Vidyalayam?',
    a: 'The Vidyalayam offers detailed personal horoscope analysis for personality, strengths, and future guidance; career and business prediction; marriage prediction and compatibility; health astrology; finance and wealth prediction; and dosha analysis with remedies.',
    fullAnswer:
      'Sri Varahi Jothida Vidyalayam provides comprehensive astrology prediction and consultation services for individuals seeking guidance on various aspects of life. The consultation services include: (1) Personal Horoscope Analysis — detailed birth chart reading covering personality traits, strengths and weaknesses, and future guidance based on planetary positions and Dasha periods; (2) Career & Business Prediction — analysis of job opportunities, business growth potential, timing of promotions, career changes, and professional success; (3) Marriage Prediction — marriage timing analysis, relationship compatibility (Porutham/Kundali Matching), and relationship guidance for harmonious married life; (4) Health Astrology — identification of health-related planetary influences, predisposition to ailments, and suggested spiritual remedies and precautions; (5) Finance & Wealth Prediction — income prospects, favorable investment periods, wealth yogas (combinations) in the chart, and financial planning guidance; (6) Dosha Analysis — identification and analysis of various planetary doshas. Each consultation is personalized and includes practical recommendations.',
    category: 'vidyalayamPredictions',
  },
  {
    q: 'What is Dosha Analysis and what planetary doshas can be identified at Sri Varahi Jothida Vidyalayam?',
    a: 'Dosha Analysis is the identification of negative planetary influences in a birth chart. The Vidyalayam analyzes Rahu Dosha, Ketu Dosha, Sani Dosha (Saturn afflictions), Chevvai Dosha (Mars dosha / Manglik), and other doshas, along with recommended Pariharam (remedial) measures.',
    fullAnswer:
      'Dosha Analysis is a specialized astrological service at Sri Varahi Jothida Vidyalayam that identifies negative planetary influences (doshas) in an individual\'s birth chart. Key doshas that are analyzed include: (1) Rahu Dosha — afflictions caused by Rahu (the north lunar node) that can cause confusion, obsession, or sudden upheavals; (2) Ketu Dosha — afflictions caused by Ketu (the south lunar node) that can lead to detachment, spiritual crises, or unexpected losses; (3) Sani Dosha (Saturn Dosha) — afflictions caused by Saturn\'s position, including Sani Dasa (Saturn period), Ashtama Sani (Saturn\'s transit over the 8th house), and Ezharai Sani (Saturn\'s transit over the 7th house); (4) Chevvai Dosha (Manglik Dosha / Mars Dosha) — affliction caused by Mars in certain houses, traditionally associated with marital challenges; (5) Other doshas including Naga Dosha, Graha Dosha, and Kalathra Dosha. For each identified dosha, the astrologer recommends specific pariharam (remedial measures) which may include performing specific homams, poojas, mantra chanting, fasting, charity, or gemstone recommendations.',
    category: 'dosha',
  },
  {
    q: 'What remedial measures (Pariharam) are recommended for planetary doshas?',
    a: 'Based on the specific dosha identified, the Vidyalayam recommends appropriate homams (fire rituals), poojas, mantra chanting, fasting, charity, and gemstone remedies. Each pariharam is tailored to the individual\'s chart and the specific planetary affliction.',
    fullAnswer:
      'At Sri Varahi Jothida Vidyalayam, the astrologers recommend specific remedial measures (Pariharam) based on the doshas identified in the individual\'s birth chart. The remedies are designed to pacify malefic planetary influences and strengthen benefic ones. Common remedial measures include: (1) Homams (fire rituals) — specific homams for different doshas such as Navagraha Homam (for general planetary peace), Rahu Ketu Homam (for nodal afflictions), Sani Homam (for Saturn-related issues), and Mangal Homam (for Mars dosha); (2) Poojas and Archana — special poojas at the temple with specific mantras to appease afflicted planets; (3) Mantra chanting — recommended number of mala (108 repetitions) of specific planetary mantras on prescribed days; (4) Fasting — observing fasts on specific days associated with the afflicted planet (e.g., Tuesday for Mars, Saturday for Saturn); (5) Charity (Daanam) — donating specific items associated with the planet (e.g., black sesame seeds, black cloth for Saturn; wheat, jaggery for Sun); (6) Gemstone recommendations — wearing specific gemstones (ratnas) associated with benefic planets after proper testing. All recommendations are provided with guidance on proper procedure and duration.',
    category: 'dosha',
  },
  {
    q: 'Does Sri Varahi Jothida Vidyalayam offer Vastu consultation services?',
    a: 'Yes, the Vidyalayam offers Vastu consultation for residential properties, commercial buildings, and site evaluation. Vastu principles are applied to create harmonious living and working environments that promote health, wealth, and happiness.',
    fullAnswer:
      'Sri Varahi Jothida Vidyalayam provides comprehensive Vastu Shastra consultation services for both residential and commercial properties. Vastu Shastra is the ancient Indian science of architecture and spatial geometry that creates harmony between the built environment and natural forces. The Vastu consultation services include: (1) Residential Vastu — analysis of existing homes with recommendations for corrections and remedies, Vastu-compliant design for new constructions, room placement guidance (kitchen, bedroom, pooja room, etc.), and direction analysis for main entrance, windows, and doors; (2) Commercial Vastu — Vastu analysis for offices, shops, factories, and business establishments, recommendations for improved business flow and prosperity, and employee productivity enhancement through Vastu corrections; (3) Site and Building Evaluation — assessment of land plots and existing buildings for Vastu compliance before purchase or construction. Each Vastu consultation includes a detailed report with specific, actionable recommendations that can be implemented with minimal disruption.',
    category: 'numerovastu',
  },
  {
    q: 'Does Sri Varahi Jothida Vidyalayam provide numerology consultation?',
    a: 'Yes, the Vidyalayam offers numerology consultation including personal name analysis, business name analysis, name correction recommendations, lucky numbers, and birth number analysis for personal and professional guidance.',
    fullAnswer:
      'Sri Varahi Jothida Vidyalayam provides numerology consultation services for individuals and businesses seeking guidance through the science of numbers. Numerology is based on the principle that numbers have vibrational frequencies that influence our lives. The numerology services include: (1) Personal Name Analysis — analyzing the numerical value of your name to assess its compatibility with your birth number and destiny number; (2) Lucky Number Analysis — identifying your personal lucky numbers for important decisions, dates, and choices; (3) Name Correction — recommendations for modifying spellings or adding/removing letters to align your name\'s vibration with your personal numerology; (4) Business and Brand Numerology — analyzing business names for commercial success, selecting auspicious launch dates, and ensuring brand name compatibility with the business owner\'s numerology; (5) Birth Number and Destiny Number Analysis — understanding your life path, challenges, and opportunities based on your date of birth. The consultation includes a detailed report with practical recommendations.',
    category: 'numerovastu',
  },

  // ── Events & Festivals ──
  {
    q: 'What is Ashada Navarathiri and when is it celebrated?',
    a: 'Ashada Navarathiri is an eleven-night divine festival dedicated to Goddess Varahi, celebrated during the Ashada month (June-July) with special poojas, abhishekam, homams, and cultural programs at Jai Varahi Peedam.',
    fullAnswer: 'Ashada Navarathiri is an eleven-night sacred festival dedicated to Goddess Varahi Amman, celebrated during the Ashada month (typically June-July) as per the Tamil calendar. At Jai Varahi Peedam in Arumparuthi, Vellore, this auspicious festival features daily special poojas, elaborate abhishekam (sacred bathing), homams (fire rituals), spiritual discourses, cultural programs, and community gatherings. Each night is dedicated to different aspects of the Divine Mother, with special rituals performed by experienced temple priests. The festival culminates in a grand celebration with devotees from across Tamil Nadu and beyond. Devotees can book special pooja packages for the eleven nights through the temple\'s online booking system. The calendar page provides detailed dates and schedules.',
    category: 'events',
  },
  {
    q: 'What is Asta Varahi Dharshanam?',
    a: 'Asta Varahi Dharshanam is a grand two-day spiritual celebration at Jai Varahi Peedam featuring powerful Varahi rituals, spiritual discourses, cultural programs, tree planting, and community service initiatives.',
    fullAnswer: 'Asta Varahi Dharshanam is a grand two-day spiritual celebration organized by Jai Varahi Peedam, bringing together devotees from across the world to experience the divine presence of Sri Kottai Varahi Amman. This significant event features powerful Vedic rituals, spiritual discourses by eminent scholars, cultural performances, and impactful community service initiatives including tree planting drives and food distribution. The event has successfully planted 1000+ trees, welcomed 5000+ visitors, provided food supplies to 750+ families, hosted 50 local vendor stalls, and engaged 100+ dedicated volunteers. The celebration combines spiritual upliftment with social welfare, reflecting the temple\'s dual mission of devotion and service.',
    category: 'events',
  },
  {
    q: 'What is Asta Varahi 2.0?',
    a: 'Asta Varahi 2.0 is a three-day spiritual celebration that builds on the success of Asta Varahi Dharshanam. It features spiritual discourses, cultural performances, community service, and a grand gathering of devotees and scholars.',
    fullAnswer:
      'Asta Varahi 2.0 is the expanded, three-day sequel to the highly successful Asta Varahi Dharshanam event. This grand celebration features: (1) Powerful Vedic rituals and homams dedicated to Goddess Varahi; (2) Spiritual discourses and lectures by eminent scholars, Swamijis, and spiritual leaders; (3) Cultural performances including devotional music, dance, and traditional arts; (4) Community service initiatives including tree planting, food distribution, and health camps; (5) Exhibition stalls showcasing local crafts, products, and spiritual literature; (6) A grand gathering of thousands of devotees from across Tamil Nadu and beyond. The event typically includes guest speakers, scheduled activities across multiple days, and a venue equipped with all necessary facilities. Details about the next Asta Varahi 2.0 event are announced on the temple website and social media channels.',
    category: 'events',
  },
  {
    q: 'What are Amavasai and Pournami poojas?',
    a: 'Amavasai (new moon day) and Pournami (full moon day) are highly auspicious lunar days for temple worship. Amavasai is especially important for ancestral rites (Pitru Tharpanam), while Pournami is ideal for spiritual awakening and wealth blessings.',
    fullAnswer: 'Amavasai (Amavasya) and Pournami are two of the most spiritually significant lunar days in the Hindu calendar, both observed with special reverence at Jai Varahi Peedam. Amavasai, the new moon day, is considered highly auspicious for performing ancestral rites (Pitru Tharpanam) and is believed to bring blessings from departed ancestors. It occurs once every month, and the most significant Amavasai is the Aadi Amavasai (in August) for ancestral worship. Pournami, the full moon day, is considered the ideal time for spiritual awakening, meditation, and receiving the full blessings of the Divine Mother. At Jai Varahi Peedam, special poojas and homams are conducted on both these days, and devotees can book participation through the temple\'s calendar and booking system. The monthly calendar lists all Amavasai and Pournami dates with detailed schedules.',
    category: 'events',
  },
  {
    q: 'What is Varahi Jayanthi and how is it celebrated at the temple?',
    a: 'Varahi Jayanthi is the auspicious day marking the appearance of Goddess Varahi. It is celebrated with grand abhishekam, homams, and special poojas, attracting many devotees. The date typically falls in the Tamil month of Aadi (July-August).',
    fullAnswer:
      'Varahi Jayanthi is the sacred day commemorating the divine appearance of Goddess Varahi. According to traditional calendars, it usually falls on the Shukla Paksha Panchami (5th day of the waxing moon) in the Tamil month of Aadi (July-August). At Jai Varahi Peedam, this festival is celebrated with great fervor and devotion. The day begins with a special abhishekam using 1008 sacred items, followed by elaborate alankaram (decoration) of the deity. A grand homam is performed, and thousands of devotees participate in chanting the Varahi Sahasranamam. The temple organizes cultural programs, spiritual discourses, and community feasts. Many devotees observe fasting and offer special poojas on this day. The exact date is announced in the temple calendar and on social media platforms well in advance.',
    category: 'events',
  },
  {
    q: 'What festivals and events are celebrated at Jai Varahi Peedam throughout the year?',
    a: 'The temple celebrates Ashada Navarathiri (11 nights in July-August), Asta Varahi Dharshanam, Asta Varahi 2.0, Varahi Jayanthi, monthly Panchami and Pournami festivals, Aadi Amavasai, Navaratri, and special occasions like Mattu Pongal and Tamil New Year.',
    fullAnswer:
      'Jai Varahi Peedam celebrates a rich calendar of festivals and events throughout the year. The major events include: (1) Ashada Navarathiri — an 11-night festival in the Tamil month of Aadi (July-August) with daily poojas, homams, and cultural programs; (2) Asta Varahi Dharshanam — a grand 2-day spiritual celebration; (3) Asta Varahi 2.0 — an expanded 3-day version of the Dharshanam; (4) Varahi Jayanthi — the appearance day of Goddess Varahi; (5) Monthly Panchami and Pournami festivals with special homams and poojas; (6) Aadi Amavasai — the most important Amavasai for ancestral rites; (7) Navaratri (Sharadha Navarathiri) — the 9-night festival in the Tamil month of Purattasi; (8) Mattu Pongal — the Tamil festival of cattle with special Cow Pooja; (9) Tamil New Year (Puthandu) — celebrated with special poojas. The temple\'s interactive calendar page provides detailed dates and schedules for all events.',
    category: 'events',
  },
  {
    q: 'What is the Ashada Navarathiri schedule like?',
    a: 'The Ashada Navarathiri festival includes 11 days of special rituals including daily abhishekam, homams, special archana, evening cultural programs, spiritual discourses, and the grand Nithya Maha Annadhanam Seva. The festival culminates with a special pooja on the final day.',
    fullAnswer:
      'The Ashada Navarathiri festival at Jai Varahi Peedam follows a detailed 11-day schedule: Each day begins with early morning abhishekam (special sacred bath) for Goddess Varahi, followed by alankaram (decoration) with different themes each day. Mid-morning features special homams (Panchami Homam, Pournami Homam, or Ashtami Homam depending on the tithi). At 12:30 PM, the Nithya Maha Annadhanam Seva serves meals to hundreds of devotees. The evening session (from 4:30 PM) includes special archana, deeparadhana, and cultural programs such as devotional music, dance performances, and spiritual discourses by eminent scholars. Guru blessings are given by Swamy Pallur Varahidhasan on specific days. The 11th and final day features a grand celebration with mahaa homam, special abhishekam, and distribution of prasadam to all devotees. The detailed schedule with exact dates and timings is published on the website\'s calendar page.',
    category: 'events',
  },
  {
    q: 'Are there any special Ashada Navarathiri packages for devotees?',
    a: 'Yes, the temple offers special Ashada Navarathiri packages that include a combination of poojas, homams, and abhishekam across the 11-day festival. These packages are designed to give devotees comprehensive participation in the festival.',
    fullAnswer:
      'Jai Varahi Peedam offers special Ashada Navarathiri packages that allow devotees to participate in the full festival experience. These packages typically include: (1) Daily participation in the morning abhishekam and archana for all 11 days; (2) Inclusion in the sankalpam (sacred intention) for all homams performed during the festival; (3) Sponsorship of Annadhanam for a specific day; (4) Special prasadam from the festival; (5) Guru blessings from Swamy Pallur Varahidhasan. The packages are designed to be affordable and accessible to devotees from all economic backgrounds. Devotees can also customize their participation by booking individual services for specific days. For detailed information about the packages and pricing, devotees can visit the Ashada Navarathiri page on the website or contact the temple administration.',
    category: 'events',
  },

  // ── Varahi Philosophy ──
  {
    q: 'What is the significance of the boar-faced form of Goddess Varahi?',
    a: 'The boar-faced form of Goddess Varahi symbolizes the Divine Mother\'s fierce protective power, strength, and her role as the one who lifts devotees from darkness (like Lord Varaha lifting Earth from the cosmic ocean).',
    fullAnswer:
      'The boar-faced form (Varahi/Vārāhī) of the Divine Mother symbolizes fierce protective power, unmatched strength, and the sacred act of lifting devotees from the darkness of ignorance. This form represents the boar incarnation of Lord Vishnu (Varaha), who descended to restore cosmic balance by lifting Mother Earth (Bhudevi) from the cosmic ocean. Just as the boar dives deep and emerges with the Earth, Goddess Varahi dives into the depths of her devotee\'s heart to remove obstacles, fears, and negative energies, emerging to bestow courage, clarity, and divine protection. The boar imagery also represents digging deep into the subconscious to unearth spiritual treasures and the unstoppable force of divine will.',
    category: 'veedu',
  },
  {
    q: 'What is the difference between Varahi Pooja and other Shakti poojas?',
    a: 'Varahi Pooja focuses on the guardian and protector aspect of the Divine Mother, emphasizing discipline, surrender, and spiritual responsibility, unlike other Shakti poojas that may focus on prosperity or other attributes.',
    fullAnswer:
      'Varahi Pooja differs from other Shakti (Divine Mother) poojas in its emphasis and spiritual approach. While other forms of Shakti worship—such as Lakshmi Puja (prosperity), Durga Puja (victory over evil), or Kali Puja (destruction of negativity)—focus on specific attributes, Varahi worship centers on the guardian and protector aspect of the Divine Mother. Varahi Amma is a Gupta Devata (secret/sacred deity), meaning her worship requires deeper spiritual discipline, sincerity, and surrender rather than ritual display or external offerings. The focus is on inner transformation, mental discipline, and developing a direct spiritual bond with the Divine Mother. Varahi is particularly revered for protection from enemies, black magic, negative energies, and for granting victory over obstacles, courage in difficult situations, and spiritual clarity. This makes Varahi Pooja especially suited for devotees seeking protection, strength, and a disciplined spiritual path.',
    category: 'veedu',
  },
  {
    q: 'Why is Varahi called a Gupta Devata (secret deity)?',
    a: 'Varahi is called a Gupta Devata because her worship has traditionally been kept secret and revealed only to sincere, disciplined devotees. Unlike more widely publicized deities, Varahi responds to inner sincerity and surrender rather than external display or ritual complexity.',
    fullAnswer:
      'Goddess Varahi is referred to as a Gupta Devata (secret/sacred deity) in Tantric and Vedic traditions because her worship methods and mantras were traditionally transmitted directly from Guru to disciple in a confidential manner, rather than being openly published. This secrecy serves several purposes: (1) It ensures that the sacred knowledge is received by those who are genuinely ready and respectful; (2) It protects the power of the mantras from misuse; (3) It emphasizes that Varahi worship is about inner transformation rather than external show. Unlike more widely publicized deities whose worship may involve elaborate public ceremonies, Varahi Amma is believed to respond to the devotee\'s inner sincerity, surrender, and disciplined practice. This is why Jai Varahi Peedam, under the guidance of Swamy Pallur Varahidhasan, focuses on authentic, disciplined worship rather than commercialized rituals.',
    category: 'veedu',
  },
  {
    q: 'What is the relationship between Goddess Varahi and Lord Varaha?',
    a: 'Goddess Varahi is the Shakti (divine feminine power) of Lord Varaha, the boar incarnation of Lord Vishnu who lifted the Earth from the cosmic ocean. She embodies his protective and restorative power in female form.',
    fullAnswer:
      'Goddess Varahi is the divine feminine counterpart (Shakti) of Lord Varaha, who is the third incarnation (avatar) of Lord Vishnu. According to Hindu cosmology, when the Earth (Bhudevi) was dragged into the cosmic ocean by the demon Hiranyaksha, Lord Vishnu took the form of Varaha (a divine boar) and dove into the ocean, lifting the Earth on his tusks and restoring cosmic balance. Varahi embodies the same protective, lifting, and restorative power of Lord Varaha, but in feminine form. She is thus associated with: protection of devotees from the "cosmic ocean" of troubles and negativity, lifting devotees from darkness to light, restoration of dharma (righteousness), and the fierce, unstoppable power of divine will. As one of the Sapta Matrikas (seven divine mothers), Varahi represents the shakti of Lord Varaha, just as the other Matrikas represent the shaktis of Brahma, Shiva, and other major deities.',
    category: 'veedu',
  },
  {
    q: 'Who are the Sapta Matrikas?',
    a: 'The Sapta Matrikas are the seven divine mother goddesses in Hindu tradition: Brahmani, Vaishnavi, Maheshwari, Indrani, Kaumari, Varahi, and Chamundi (or Narasimhi). Varahi is the fifth Matrika, representing the Shakti of Lord Varaha.',
    fullAnswer:
      'The Sapta Matrikas (Sapta = seven, Matrikas = divine mothers) are a group of seven goddesses who are manifestations of the divine feminine power (Shakti) of major Hindu deities. They are: (1) Brahmani — Shakti of Lord Brahma; (2) Vaishnavi — Shakti of Lord Vishnu; (3) Maheshwari — Shakti of Lord Shiva; (4) Indrani — Shakti of Lord Indra; (5) Kaumari — Shakti of Lord Kartikeya (Muruga); (6) Varahi — Shakti of Lord Varaha (the boar incarnation of Vishnu); (7) Chamundi (or Narasimhi) — Shakti of Goddess Durga (or Lord Narasimha). The Sapta Matrikas are worshipped together as protectors of the universe, and their temples are found throughout South India, especially in Tamil Nadu. Varahi is unique among the Matrikas for her boar-faced form and her association with both protection and the esoteric traditions of Tantra.',
    category: 'veedu',
  },

  // ── Social Welfare ──
  {
    q: 'What social welfare activities does Jai Varahi Peedam conduct?',
    a: 'The temple runs food distribution programs, medical camps, tree planting drives, and educational support for underprivileged children, alongside its spiritual services.',
    fullAnswer:
      'Jai Varahi Peedam is deeply committed to social welfare and community development as an integral part of its spiritual mission. Key activities include: (1) Annadanam (free food distribution) – daily offering of meals to devotees and the needy, with special drives during festivals; (2) Medical camps – periodic health check-up camps in collaboration with local doctors; (3) Environmental initiatives – tree planting and maintenance of green spaces in and around the temple; (4) Educational support – providing scholarships, books, and stationery to children from economically weaker sections; (5) Disaster relief – extending aid during natural calamities like floods and cyclones. These activities are funded through donations and volunteer efforts. The temple believes that serving humanity is a form of worshipping the Divine Mother, and it encourages devotees to participate in these initiatives.',
    category: 'social',
  },
  {
    q: 'How can I volunteer or contribute my time and skills at Jai Varahi Peedam?',
    a: 'Devotees can volunteer for temple maintenance, event management, community service projects, and Go Seva. You can contact the temple administration to express your interest and availability.',
    fullAnswer:
      'Jai Varahi Peedam welcomes volunteers who wish to contribute their time, skills, and energy to the temple\'s activities. Volunteer opportunities include: (1) Temple maintenance – helping with cleaning, gardening, and general upkeep; (2) Event management – assisting during festivals, cultural programs, and community gatherings; (3) Community service – participating in food distribution drives, medical camps, and tree planting initiatives; (4) Go Seva – helping with the care of cows at the goshala, including feeding and cleaning. Volunteers can also offer their professional skills like photography, videography, content writing, or teaching in the Vidyalayam. Interested individuals can contact the temple office by phone or email, stating their availability and areas of interest. The temple appreciates every contribution, big or small, and ensures volunteers are guided and supported in their service.',
    category: 'social',
  },

  // ── Online Services & Social Media ──
  {
    q: 'Can I watch temple rituals and poojas online through live streaming?',
    a: 'Yes, the temple occasionally streams special events and major festivals on its YouTube channel @kottaivarahiTV. You can subscribe to receive updates and watch live sessions.',
    fullAnswer:
      'Jai Varahi Peedam is active on YouTube with its official channel "Kottai Varahi TV" (@kottaivarahiTV). The temple live streams major festivals, special homams, and significant rituals for the benefit of devotees who cannot visit in person. Events like Asta Varahi Dharshanam, Ashada Navarathiri, and Pournami Homam are often broadcast live. The channel also features recorded videos of past events, spiritual discourses, and devotional songs. To stay notified, devotees can subscribe to the channel and turn on notifications. Additionally, the temple may share live updates on its Instagram and Facebook pages. For a schedule of upcoming live streams, please check the temple\'s website or social media announcements.',
    category: 'online',
  },
  {
    q: 'What can I find on the Kottai Varahi TV YouTube channel?',
    a: 'The Kottai Varahi TV YouTube channel (@kottaivarahiTV) features recordings and livestreams of temple festivals, homams, and special poojas, along with devotional and spiritual content related to Jai Varahi Peedam.',
    fullAnswer:
      "Kottai Varahi TV is the official YouTube channel of Jai Varahi Peedam, found at @kottaivarahiTV. It serves as the temple's video archive and livestreaming platform, featuring recordings of major festivals such as Ashada Navarathiri, Asta Varahi Dharshanam, and Varahi Jayanthi, along with homams, abhishekam ceremonies, and other devotional content connected to the temple's activities. Devotees who cannot travel to Vellore can subscribe to the channel to stay informed about upcoming livestreams and watch previously recorded ceremonies. For the most current video library and livestream schedule, it's best to visit the channel directly on YouTube.",
    category: 'media',
  },
  {
    q: "What kind of updates does Jai Varahi Peedam share on Instagram?",
    a: "The temple's Instagram page (@jai_varahi_peedam) shares visual updates from daily rituals, festival highlights, and announcements about upcoming events and services.",
    fullAnswer:
      "Jai Varahi Peedam's Instagram page, @jai_varahi_peedam, is used to share visual glimpses of temple life — photos and short videos from daily and special poojas, festival highlights such as Ashada Navarathiri and Asta Varahi Dharshanam, Goshala and Go Seva moments, and announcements about upcoming events and services. It's a convenient way for devotees, especially those following from outside Vellore, to stay visually connected to the temple between visits. For the latest posts and stories, devotees can follow the account directly.",
    category: 'media',
  },
  {
    q: 'Can I message Jai Varahi Peedam directly on Facebook or Instagram?',
    a: 'Yes, you can send a message through the temple\'s Facebook page (PallurVarahiDhasan) or Instagram page (jai_varahi_peedam). For urgent requests, calling +91 90928 78389 is faster and more reliable.',
    fullAnswer:
      "Devotees can reach out to Jai Varahi Peedam through direct messages on Facebook (PallurVarahiDhasan) or Instagram (jai_varahi_peedam) for general questions, and the team monitors these channels along with the website and phone lines. However, since social media response times can vary depending on volume and the team's schedule, devotees with time-sensitive needs — such as booking a pooja for a specific upcoming date, an urgent prayer request, or festival-related sponsorship — are encouraged to call or WhatsApp +91 90928 78389 or email varahikottai@gmail.com for the fastest response.",
    category: 'media',
  },
  {
    q: 'Does Jai Varahi Peedam have a mobile app for online services?',
    a: 'Currently, the temple offers its services through the website jaivarahi.org, which is fully mobile-responsive. Devotees can access all online services, booking, and donations through their mobile browsers.',
    fullAnswer:
      'Jai Varahi Peedam\'s website (https://www.jaivarahi.org/) is fully responsive and optimized for mobile devices, allowing devotees to access all services from their smartphones. Through the mobile website, devotees can: (1) Book temple services and poojas; (2) Make secure donations; (3) View the temple calendar; (4) Access the FAQ section; (5) Read about Varahi philosophy and spirituality; (6) Contact the temple administration. The website works seamlessly on all major mobile browsers. While there is currently no dedicated mobile app, the mobile-responsive website provides the same functionality. The temple is also active on social media platforms including Facebook, Instagram, and YouTube, where devotees can follow for updates and live streams.',
    category: 'online',
  },

  // ── Accommodation & Travel ──
  {
    q: 'Are there any hotels or accommodation options near Jai Varahi Peedam for out-of-town devotees?',
    a: 'Yes, there are several budget and mid-range hotels available in Katpadi and Vellore city, approximately 3-5 km from the temple. The temple administration can assist with recommendations upon request.',
    fullAnswer:
      'For out-of-town devotees, there are multiple accommodation options near Jai Varahi Peedam. Budget hotels and lodges are available in Katpadi town, about 3 km away, with room rates starting from ₹500 per night. Vellore city, about 8 km away, offers a wider range of options including 3-star hotels and serviced apartments. Some popular choices include Hotel Gowri Krishna, Hotel Windsor Castle, and various budget lodges near the Vellore bus stand. The temple administration can provide contact details of nearby accommodations upon request. Devotees are advised to book in advance during major festivals, as rooms fill up quickly. Additionally, the temple may arrange simple dormitory-style accommodation for groups with prior notice.',
    category: 'accommodation',
  },
  {
    q: 'What is the nearest airport to Jai Varahi Peedam?',
    a: 'The nearest airport is Chennai International Airport (MAA), approximately 150 km away. From Chennai, you can take a train to Katpadi Junction or a bus/taxi to Vellore. The nearest domestic airport is in Bangalore (BLR), about 200 km away.',
    fullAnswer:
      'The nearest major airport to Jai Varahi Peedam is Chennai International Airport (MAA), which is approximately 150 km (about 3-4 hours by road). From Chennai airport, you can: (1) Take a taxi or bus directly to Katpadi/Vellore; (2) Take a train from Chennai Central or Chennai Egmore to Katpadi Junction (KPD), which is the nearest railway station (about 3 km from the temple). The second nearest major airport is Kempegowda International Airport in Bangalore (BLR), approximately 200 km away (about 4-5 hours by road). For international devotees, Chennai Airport is the most convenient entry point, with regular flights from major cities worldwide. From either airport, you can hire a taxi or use public transport to reach the temple. The temple administration can assist with travel guidance upon request.',
    category: 'accommodation',
  },
  {
    q: 'What is the nearest railway station to Jai Varahi Peedam?',
    a: 'The nearest railway station is Katpadi Junction (KPD), which is approximately 3 km from the temple. Katpadi is well-connected to Chennai, Bangalore, and other major cities. From the station, you can take an auto-rickshaw or taxi to the temple.',
    fullAnswer:
      'Katpadi Junction (station code: KPD) is the nearest railway station to Jai Varahi Peedam, located just 3 km away (about 10 minutes by auto-rickshaw). Katpadi is a major railway junction on the Chennai-Bangalore main line, with frequent trains from both cities. Key connections include: Chennai Central to Katpadi (about 2.5-3 hours), Bangalore City to Katpadi (about 3-4 hours), and trains from other major cities like Coimbatore, Madurai, Tiruchirappalli, and Hyderabad. From Katpadi station, devotees can easily find auto-rickshaws or taxis to reach the temple. The temple is well-known in the area, and most local drivers will know the location. If you\'re arriving by train, it\'s recommended to alight at Katpadi Junction rather than Vellore Cantonment, as Katpadi is closer to the temple.',
    category: 'accommodation',
  },

  // ── Additional: FAQ for new topics ──
  {
    q: 'Is there a sacred tree (Sthala Vriksham) at the temple and what is its significance?',
    a: 'The temple premises have a sacred neem or banyan tree that is considered auspicious. Devotees often perform pradakshina (circumambulation) around it for blessings. Specific details can be obtained from temple priests.',
    fullAnswer:
      'Yes, Jai Varahi Peedam has a sacred tree, traditionally a neem or banyan, which is revered as a Sthala Vriksham. Such trees are often associated with temple deities and are believed to house divine energies. Devotees perform pradakshina (circumambulation) around the tree as a mark of respect, and some offer prayers for specific wishes. The tree is also used as a place for meditation and quiet reflection. During festivals, the tree may be decorated with flowers and lamps. For more detailed information about the particular tree species, its age, and associated legends, visitors are encouraged to speak with the temple priests, who can share the oral traditions of the temple.',
    category: 'temple',
  },
  {
    q: 'Are non-Hindus allowed to visit Jai Varahi Peedam and participate in rituals?',
    a: 'Yes, the temple welcomes people of all faiths to visit and experience the spiritual atmosphere. However, entry into the inner sanctum may be restricted for non-Hindus; please check with temple staff.',
    fullAnswer:
      'Jai Varahi Peedam is open to everyone, irrespective of their religion or background. The temple believes in universal spirituality and encourages all visitors to seek peace and blessings. Non-Hindus are welcome to explore the temple premises, view the deity from a distance, participate in cultural events, and enjoy the serene environment. However, as per traditional practices, entry into the innermost sanctum (garbhagriha) for the purpose of performing rituals may be limited to Hindus who follow the required purity codes. For specific rituals like touching the idol or participating in sankalpam, prior permission and guidance from the temple priests are required. It is best to enquire at the temple office upon arrival.',
    category: 'temple',
  },
  {
    q: 'Are mobile phones allowed inside the temple? What are the rules regarding their use?',
    a: 'Mobile phones are allowed but must be kept on silent mode. Photography and video recording are strictly prohibited inside the inner sanctum and during pooja times. Please respect the sanctity of the space.',
    fullAnswer:
      'Devotees are permitted to carry mobile phones into the temple premises, but they must be switched to silent or vibration mode. Using phones to make calls, play music, or take photos/videos inside the sanctum or during pooja is strictly prohibited, as it disturbs the spiritual atmosphere. Photography of the deity is not allowed under any circumstances. Outside the main shrine, in the courtyard or common areas, you may take photos for personal remembrance, but please avoid disturbing others. The temple management kindly requests all visitors to be mindful and respectful, and to keep phone usage to a minimum while on the premises.',
    category: 'temple',
  },
  {
    q: 'What is the best time to visit Jai Varahi Peedam for a peaceful experience?',
    a: 'The best time for a peaceful visit is early morning (6:30 AM to 9:00 AM) when the temple opens and the morning rituals are performed. Weekdays are generally less crowded than weekends and festival days.',
    fullAnswer:
      'For a peaceful and less crowded experience, the best time to visit Jai Varahi Peedam is early morning between 6:30 AM and 9:00 AM, when the temple opens and the morning abhishekam and archana rituals are being performed. The atmosphere is serene, and you can observe the rituals up close. Weekdays (Monday to Thursday) are generally less crowded compared to weekends (Friday to Sunday). Fridays, Panchami days, Pournami, and Amavasai tend to have more devotees. If you wish to avoid crowds entirely, it is best to avoid major festival days such as Ashada Navarathiri, Asta Varahi Dharshanam, and Varahi Jayanthi, unless you specifically want to participate in the festive celebrations. The evening session (4:30 PM to 6:00 PM) is also relatively peaceful on weekdays.',
    category: 'temple',
  },
  {
    q: 'Does Jai Varahi Peedam have any publications, books, or spiritual literature available?',
    a: 'The temple may have spiritual literature and publications available for devotees. Please inquire at the temple office or contact the administration for information about available books, pamphlets, or digital resources.',
    fullAnswer:
      'Jai Varahi Peedam, through its Sri Varahi Jothida Vidyalayam and the guidance of Swamy Pallur Varahidhasan, may offer spiritual literature and publications for the benefit of devotees. These may include: (1) Booklets on Varahi worship procedures and mantras; (2) Pamphlets explaining the significance of various poojas and festivals; (3) Calendars and Panchangam publications; (4) Digital resources available on the website. For specific information about available publications, devotees are encouraged to visit the temple office or contact the administration at +91 90928 78389 or varahikottai@gmail.com. The temple\'s website (jaivarahi.org) also contains a wealth of information about Varahi philosophy, worship methods, and the temple\'s activities.',
    category: 'general',
  },
  {
    q: 'How can I stay updated about Jai Varahi Peedam events and announcements?',
    a: 'You can stay updated by visiting the website, following the temple on social media (Facebook, Instagram, YouTube), subscribing to the YouTube channel @kottaivarahiTV, or contacting the temple to join any announcement groups.',
    fullAnswer:
      'Jai Varahi Peedam keeps devotees informed through multiple channels: (1) Website — regularly updated with event information, calendar, and news at https://www.jaivarahi.org/; (2) Facebook — follow "PallurVarahiDhasan" for updates and event announcements; (3) Instagram — follow "jai_varahi_peedam" for visual updates and stories; (4) YouTube — subscribe to "Kottai Varahi TV" (@kottaivarahiTV) for live streams and recorded videos; (5) Phone — call +91 90928 78389 for direct inquiries; (6) Email — send your request to varahikottai@gmail.com to be added to the mailing list. The temple also makes announcements during festivals and events. For the most timely updates, especially during festival seasons, social media and the website calendar are the best resources.',
    category: 'general',
  },

  // ── Calendar & Tithi ──
  {
    q: 'How do I use the temple calendar on the Jai Varahi Peedam website?',
    a: 'The interactive calendar on the website shows all monthly events including Amavasai, Pournami, Panchami, Ashtami, and special festivals. You can navigate by month, click on any date for event details, and find direct links to book services.',
    fullAnswer:
      'The Jai Varahi Peedam website features an interactive calendar page at jaivarahi.org/calendar that displays all temple events throughout the year. To use the calendar: (1) Navigate to the Calendar page using the main menu; (2) The default view shows the current month with all events marked; (3) Use the month navigation arrows to browse previous or future months; (4) Click on any highlighted date to see event details including the event name, description in English and Tamil, category (Amavasai, Pournami, Panchami, Ashtami, etc.), and time; (5) Each event includes social media links to Facebook, Instagram, and YouTube for more information; (6) You can book services for specific dates by visiting the Services page. The calendar is updated regularly with all astrologically significant days and special festival dates.',
    category: 'calendar',
  },
  {
    q: 'What are the Tamil months and their significance?',
    a: 'The Tamil calendar has 12 months: Chithirai (Apr-May), Vaikasi (May-Jun), Aani (Jun-Jul), Aadi (Jul-Aug), Avani (Aug-Sep), Purattasi (Sep-Oct), Aippasi (Oct-Nov), Karthigai (Nov-Dec), Margazhi (Dec-Jan), Thai (Jan-Feb), Maasi (Feb-Mar), and Panguni (Mar-Apr). Each month has special significance for different rituals.',
    fullAnswer:
      'The Tamil calendar (Tamil Panchangam) follows the solar cycle and consists of 12 months, each with unique spiritual significance: (1) Chithirai (April-May) — Tamil New Year begins, Chithirai Pournami and Chithirai Amavasai are observed; (2) Vaikasi (May-June) — Vaikasi Visakam (Lord Murugan\'s birthday), Vaikasi Pournami is significant; (3) Aani (June-July) — Aani Amavasai and Aani Pournami are observed; (4) Aadi (July-August) — Highly significant for Amman (Goddess) worship, Aadi Amavasai is the most important for ancestral rites, Ashada Navarathiri festival occurs in this month; (5) Avani (August-September) — Avani Avittam (Upakarma), Avani Pournami is observed; (6) Purattasi (September-October) — Mahalaya Amavasai, Navaratri festival; (7) Aippasi (October-November) — Deepavali (Lakshmi Puja), Aippasi Amavasai; (8) Karthigai (November-December) — Karthigai Deepam festival, Karthigai Pournami; (9) Margazhi (December-January) — Month of bhajans and music, early morning spiritual practices; (10) Thai (January-February) — Thai Amavasya important for Pitru Tharpanam, Thai Pongal festival; (11) Maasi (February-March) — Maasi Magam Theerthavari (seaside temple festivals); (12) Panguni (March-April) — Panguni Uthiram, significant for marriage and spiritual unions.',
    category: 'calendar',
  },
  {
    q: 'What is Amavasai (new moon day) and why is it important at Jai Varahi Peedam?',
    a: 'Amavasai (Amavasya) is the new moon day, occurring once every month. It is considered highly auspicious for performing ancestral rites (Pitru Tharpanam) and special poojas. The temple conducts special Amavasai poojas every month with specific significance.',
    fullAnswer:
      'Amavasai (Amavasya) is the new moon day (theerpirai, the dark moon phase) that occurs once every Tamil month. It is considered one of the most spiritually significant days in the Hindu calendar for connecting with ancestors (Pitrus) and performing karmic cleansing rituals. At Jai Varahi Peedam, special Amavasai poojas are conducted each month at 6:00 AM, with each month\'s Amavasai having specific significance: (1) Thai Amavasya — important for Pitru Tharpanam (ancestral rites); (2) Maasi Amavasya — Maasi Magam Theerthavari (seaside temple festivals); (3) Panguni Amavasya — regular monthly observance; (4) Chithirai Amavasya — Tamil New Year month; (5) Vaikasi Amavasya — regular observance; (6) Aani Amavasya — regular observance; (7) Aadi Amavasya — the most significant Amavasai for ancestral worship, falling in the month of Aadi; (8) Avani Amavasya — regular observance; (9) Purattasi Amavasya — Mahalaya Amavasya, very important for ancestors; (10) Aippasi Amavasya — Deepavali (Lakshmi Puja) associated; (11) Karthigai Amavasya — regular observance; (12) Margazhi Amavasya — start of Margazhi month of bhajans.',
    category: 'calendar',
  },
  {
    q: 'What is Pournami (full moon day) and what is its significance?',
    a: 'Pournami (full moon day) occurs once every month and is considered highly auspicious for spiritual practices, meditation, and receiving the full blessings of the Divine Mother. The temple conducts special Pournami poojas and homams on this day.',
    fullAnswer:
      'Pournami (full moon day, also spelled Pournima) is the day when the moon is fully illuminated, occurring once every Tamil month. Pournami is considered a time of heightened spiritual energy, making it ideal for spiritual practices, meditation, and receiving the full blessings of the Divine Mother. At Jai Varahi Peedam, special Pournami poojas and homams are conducted each month at 6:00 AM. Each Pournami has specific significance: (1) Maasi Pournami — regular monthly observance; (2) Panguni Pournami — Panguni Uthiram, important for marriages and spiritual unions; (3) Chithirai Pournami — Tamil New Year month; (4) Vaikasi Pournami — Vaikasi Visakam (Lord Murugan\'s birthday); (5) Aani Pournami — regular observance; (6) Aadi Pournami — very significant for Amman (Goddess) worship; (7) Avani Pournami — Avani Avittam (Upakarma for Brahmins); (8) Purattasi Pournami — regular observance; (9) Aippasi Pournami — regular observance; (10) Karthigai Pournami — Karthigai Deepam festival; (11) Margazhi Pournami — month of bhajans and music; (12) Thai Pournami — regular observance. Pournami Homam and Milk/Honey Abishekam are especially recommended on this day.',
    category: 'calendar',
  },
  {
    q: 'What is Panchami tithi and why is it important for Varahi worship?',
    a: 'Panchami is the 5th lunar day (tithi), considered the most sacred day for worshipping Goddess Varahi. The temple conducts Panchami poojas twice per month — on Valarpirai (waxing moon) Panchami and Theipirai (waning moon) Panchami — with special Panchami Homam.',
    fullAnswer:
      'Panchami is the 5th lunar day (tithi) in the Hindu calendar and is considered the most sacred and powerful day for worshipping Goddess Varahi. The temple observes Panchami poojas twice each month: (1) Valarpirai Panchami (Shukla Paksha Panchami) — Panchami during the waxing moon phase, which is the most auspicious for Varahi worship and the date of Varahi Jayanthi; (2) Theipirai Panchami (Krishna Paksha Panchami) — Panchami during the waning moon phase, also significant for seeking protection. On Panchami days, the temple conducts special Panchami Homam, which is a powerful fire ritual dedicated to invoking the protective and warrior aspect of Goddess Varahi. The benefits of Panchami worship include: protection from enemies and negative forces, resolution of legal disputes, victory in competitive situations, removal of obstacles, and enhanced courage. Devotees are encouraged to attend temple on these days or book Panchami Homam online.',
    category: 'calendar',
  },
  {
    q: 'What is Ashtami tithi and its significance at the temple?',
    a: 'Ashtami is the 8th lunar day, associated with the fierce and powerful forms of the Divine Mother. The temple conducts special Ashtami poojas twice per month, ideal for removing obstacles, gaining strength, and seeking protection.',
    fullAnswer:
      'Ashtami is the 8th lunar day (tithi) in the Hindu calendar, traditionally associated with the fierce and powerful forms of the Divine Mother including Durga and Kali. The temple observes Ashtami poojas twice each month: (1) Valarpirai Ashtami (Shukla Paksha Ashtami) — during the waxing moon phase; (2) Theipirai Ashtami (Krishna Paksha Ashtami) — during the waning moon phase. Ashtami is considered ideal for removing stubborn obstacles, gaining physical and mental strength, protection from accidents and mishaps, overcoming deep-seated fears, and empowerment during difficult life transitions. Milk Abishekam is especially recommended on Ashtami days. Devotees facing persistent challenges, health issues, or major life changes are encouraged to participate in Ashtami poojas at the temple.',
    category: 'calendar',
  },
  {
    q: 'What is Ayilyam Nakshatram and Sarpa Shanti Homam?',
    a: 'Ayilyam Nakshatram is the birth star (nakshatra) associated with serpents (Naga Devatas). The temple conducts Sarpa Shanti Homam on Ayilyam days each month to pacify Naga Dosha and seek blessings for progeny, health, and protection from serpent-related afflictions.',
    fullAnswer:
      'Ayilyam Nakshatram (also known as Ashlesha) is the 9th nakshatra (birth star) in Vedic astrology, associated with the serpent deity (Naga Devata). On days when the moon transits Ayilyam Nakshatram, the temple conducts Sarpa Shanti Homam, a special fire ritual to pacify serpent-related planetary afflictions (Naga Dosha). The Ayilyam Nakshatram occurs approximately once per month, and the temple follows the calendar of these dates. The benefits of participating in Sarpa Shanti Homam include: relief from Naga Dosha (serpent afflictions in the birth chart), blessings for progeny and removal of obstacles to childbirth, protection from serpent-related fears and karmic issues, resolving Kalathra Dosha (marriage-related afflictions), and overall health and protection. Devotees can check the temple calendar for Ayilyam dates and book participation in the Sarpa Shanti Homam.',
    category: 'calendar',
  },
  {
    q: 'What special events are marked on the temple calendar throughout the year?',
    a: 'The temple calendar includes monthly Amavasai and Pournami poojas, bi-monthly Panchami and Ashtami poojas, monthly Ayilyam Nakshatram Sarpa Shanti Homam, and major festivals like Ashada Navarathiri, Asta Varahi Dharshanam, Asta Varahi 2.0, Varahi Jayanthi, Navaratri, and Tamil festival days.',
    fullAnswer:
      'The Jai Varahi Peedam calendar is rich with regular and special events throughout the year. Regular monthly events include: (1) Amavasai Pooja — special pooja on the new moon day (12 times per year, each named after the Tamil month); (2) Pournami Pooja — special pooja on the full moon day (12 times per year); (3) Valarpirai Panchami Pooja — Panchami during waxing moon (12 times per year); (4) Theipirai Panchami Pooja — Panchami during waning moon (12 times per year); (5) Valarpirai Ashtami Pooja — Ashtami during waxing moon (12 times per year); (6) Theipirai Ashtami Pooja — Ashtami during waning moon (12 times per year); (7) Ayilyam Nakshatram & Sarpa Shanti Homam — approximately 12 times per year. Major annual festivals include: Ashada Navarathiri (11-night festival in July-August), Asta Varahi Dharshanam (2-day celebration), Asta Varahi 2.0 (3-day celebration), Varahi Jayanthi (appearance day of Goddess Varahi), Navaratri (Sharadha Navarathiri in September-October), Aadi Amavasai (most important new moon for ancestral rites), Mattu Pongal (cattle festival in January), and Tamil New Year (Puthandu in April). The interactive calendar on the website provides exact dates and details for all events.',
    category: 'calendar',
  },
  {
    q: 'How can I stay updated about Jai Varahi Peedam events and announcements?',
    a: 'You can stay updated by visiting the website, following the temple on social media (Facebook, Instagram, YouTube), subscribing to the YouTube channel @kottaivarahiTV, or contacting the temple to join any announcement groups.',
    fullAnswer:
      'Jai Varahi Peedam keeps devotees informed through multiple channels: (1) Website — regularly updated with event information, calendar, and news at https://www.jaivarahi.org/; (2) Facebook — follow "PallurVarahiDhasan" for updates and event announcements; (3) Instagram — follow "jai_varahi_peedam" for visual updates and stories; (4) YouTube — subscribe to "Kottai Varahi TV" (@kottaivarahiTV) for live streams and recorded videos; (5) Phone — call +91 90928 78389 for direct inquiries; (6) Email — send your request to varahikottai@gmail.com to be added to the mailing list. The temple also makes announcements during festivals and events. For the most timely updates, especially during festival seasons, social media and the website calendar are the best resources.',
    category: 'general',
  },

  // ── 1. Astrology: Planetary Dosha Analysis (Kochara) ──
  {
    q: 'What is Kandaga, Ezharai, and Ashtama Sani in Saturn\'s Kocharam?',
    a: 'Kandaga Sani is Saturn\'s transit over the 4th house (6 months), Ezharai Sani is Saturn\'s transit over the 7th house (2.5 years), and Ashtama Sani is Saturn\'s transit over the 8th house (2.5 years). Each brings specific challenges and spiritual lessons.',
    fullAnswer: 'Saturn\'s Kocharam (transit) is one of the most important astrological influences analyzed at Sri Varahi Jothida Vidyalayam. The three key phases are: (1) Kandaga Sani — Saturn transits the 4th house from the natal Moon, lasting about 6 months. This period can bring challenges related to home, family, vehicles, and emotional stability. It is considered relatively mild but requires caution. (2) Ezharai Sani — Saturn transits the 7th house from the natal Moon, lasting about 2.5 years. This phase affects partnerships, marriage, business relationships, and public life. It can bring delays in marriage or challenges in existing relationships. (3) Ashtama Sani — Saturn transits the 8th house from the natal Moon, lasting about 2.5 years. This is considered the most challenging phase, bringing obstacles, health issues, financial strains, and karmic tests. The astrologers at the Vidyalayam provide detailed analysis of each phase and recommend specific remedial measures including Sani Homam, Abishekam, and charitable acts to mitigate negative effects.',
    category: 'astrology',
  },
  {
    q: 'What specific homams are recommended for different planetary doshas?',
    a: 'The Vidyalayam recommends Sani Homam for Saturn afflictions, Rahu Ketu Homam for nodal doshas, Mangal Homam for Mars dosha, Navagraha Homam for general planetary peace, and specific nakshatra homams for birth star afflictions.',
    fullAnswer: 'Sri Varahi Jothida Vidyalayam provides specific homam recommendations based on the planetary dosha identified in the birth chart. The key recommendations include: (1) Sani Homam (also called Sani Bhagavan Homam) — recommended for those experiencing Sani Dasa, Ashtama Sani, Ezharai Sani, or Kandaga Sani. This homam pacifies Saturn\'s malefic effects and invokes blessings for patience, discipline, and karmic resolution. (2) Rahu Ketu Homam — recommended for those with Rahu or Ketu doshas, experiencing Rahu Dasa or Ketu Dasa, or suffering from Naga Dosha. This homam clarifies confusion, removes obstacles, and protects from sudden upheavals. (3) Mangal Homam (Chevvai Homam) — recommended for those with Manglik Dosha (Mars in 1st, 2nd, 4th, 7th, 8th, or 12th house), especially for marriage-related challenges. (4) Navagraha Homam — recommended for general planetary peace, before major life events, or when multiple planets are afflicted. (5) Sarpa Shanti Homam — recommended for Naga Dosha, Ayilyam Nakshatram afflictions, and Kalathra Dosha. Each homam is performed with specific mantras, offerings, and sankalpam tailored to the individual\'s chart.',
    category: 'dosha',
  },
  {
    q: 'What is the difference between Sani Dasa, Ashtama Sani, and Ezharai Sani?',
    a: 'Sani Dasa is Saturn\'s major planetary period (19 years) in the Vimshottari Dasa system. Ashtama Sani is Saturn\'s transit over the 8th house (2.5 years). Ezharai Sani is Saturn\'s transit over the 7th house (2.5 years). They are different astrological calculations affecting different life areas.',
    fullAnswer: 'Sani Dasa, Ashtama Sani, and Ezharai Sani are three distinct astrological influences that are often confused. Sani Dasa (Saturn period) is a major planetary period in the Vimshottari Dasa system, lasting 19 years. It is calculated based on the Moon\'s position at birth and represents a significant phase of life where Saturn\'s energy is predominant. Ashtama Sani is a transit phenomenon where Saturn transits the 8th house from the natal Moon, lasting 2.5 years. It is known for bringing health challenges, financial strain, and obstacles. Ezharai Sani is another transit where Saturn passes through the 7th house from the natal Moon, also lasting 2.5 years, affecting relationships and partnerships. The astrologers at the Vidyalayam analyze both Dasa and transit influences to provide comprehensive guidance. For example, a person might be in a favorable Sani Dasa (if Saturn is well-placed) but simultaneously experiencing Ashtama Sani transit, requiring different remedial approaches.',
    category: 'astrology',
  },

  // ── 2. Ritual Timing Details ──
  {
    q: 'What are the specific auspicious days and times for performing different abishekams at the temple?',
    a: 'Nithya Abishekam is performed daily at 7:00 AM. Sahasra Abishekam is best on special auspicious days. Turmeric Abishekam on Fridays. Ghee Abishekam on Saturdays/Panchami. Honey Abishekam on Pournami. Milk Abishekam on Mondays/Ashtami. All abishekams start at 7:00 AM sharp.',
    fullAnswer: 'Each abishekam at Jai Varahi Peedam has specific recommended days and timings for maximum spiritual benefit: (1) Nithya Abishekam — performed daily at 7:00 AM, lasting 1.5 hours. This is the regular morning ritual and can be booked on any day. (2) Sahasra Abishekam — recommended on specially chosen auspicious days (Muhurtham) as advised by the temple priest. It lasts 3 hours starting at 7:00 AM. (3) Turmeric Abishekam (Manjal Abishekam) — best performed on Fridays between 7:00 AM and 8:00 AM. Fridays are considered auspicious for Goddess worship. (4) Ghee Abishekam (Ney Abishekam) — ideal on Saturdays or Panchami tithi days, starting at 7:00 AM. (5) Honey Abishekam (Then Abishekam) — best performed on Pournami (full moon) days, starting at 7:00 AM. (6) Milk Abishekam (Pal Abishekam) — recommended on Mondays or Ashtami tithi days, starting at 7:00 AM. For all abishekams, morning is considered the most auspicious time (Brahma Muhurtham). Devotees should arrive at least 15 minutes before the scheduled time. Evening abishekams (5:00 PM) can be arranged for specific requests with prior coordination.',
    category: 'abishekam',
  },
  {
    q: 'What are the auspicious timings (Muhurtham) for performing Panchami, Pournami, and Ashtami rituals?',
    a: 'Panchami rituals are best performed during the morning hours (7:00 AM-11:30 AM). Pournami rituals are ideal from sunrise to noon. Ashtami rituals are powerful during the early morning or evening twilight hours. The temple follows the Panchangam for exact timings.',
    fullAnswer: 'The auspicious timings for performing rituals on specific tithis at Jai Varahi Peedam are based on the traditional Panchangam: (1) Panchami Rituals (Panchami Homam, Panchami Abishekam) — The most auspicious time is during the morning session (7:00 AM to 11:30 AM), as Panchami tithi is considered most powerful in the forenoon. The temple performs Panchami Homam at 7:00 AM sharp. Valarpirai Panchami (waxing moon) is especially powerful for invoking Goddess Varahi\'s protective blessings. (2) Pournami Rituals (Pournami Homam, Honey/Milk Abishekam) — Pournami is considered powerful from sunrise to noon. The temple conducts Pournami Homam at 7:00 AM. The full moon\'s energy is at its peak during this window, making mantras and offerings more potent. (3) Ashtami Rituals (Ashtami Homam, Milk Abishekam) — Ashtami is powerful during the early morning (7:00 AM) and also during the evening twilight (Sandhya Kaalam, around 5:30 PM-6:30 PM). The temple primarily schedules Ashtami rituals in the morning. These timings are calculated based on the traditional Panchangam, and devotees are advised to check the temple calendar or consult the priests for exact Muhurtham on specific dates.',
    category: 'calendar',
  },
  {
    q: 'What is the monthly cycle of Amavasai and Pournami and how does it affect temple worship?',
    a: 'Amavasai (new moon) occurs once every 29.5 days, when the moon is between the Earth and Sun. Pournami (full moon) occurs 14-15 days later. Each Tamil month has one Amavasai and one Pournami, with specific names and significance for temple worship.',
    fullAnswer: 'The monthly lunar cycle at Jai Varahi Peedam follows the traditional Hindu calendar (Panchangam). The cycle works as follows: (1) The lunar month consists of approximately 29.5 days, divided into two fortnights — Shukla Paksha (waxing moon, Valarpirai) and Krishna Paksha (waning moon, Theipirai). (2) Amavasai (new moon) occurs at the end of Krishna Paksha, when the moon is not visible. This day is considered ideal for ancestral rites (Pitru Tharpanam) and karmic cleansing. The temple conducts special Amavasai poojas at 6:00 AM on the exact Amavasai day. (3) Pournami (full moon) occurs at the end of Shukla Paksha, when the moon is fully illuminated. This day is ideal for spiritual practices, meditation, and Goddess worship. The temple conducts Pournami poojas and homams at 6:00 AM. (4) Each Tamil month\'s Amavasai and Pournami have unique names (e.g., Aadi Amavasai, Thai Amavasai, Maasi Pournami, Panguni Pournami) and specific spiritual significance. The temple calendar lists all these dates throughout the year, and devotees can plan their visits accordingly.',
    category: 'calendar',
  },

  // ── 3. Goshala Operations ──
  {
    q: 'What is the daily operational schedule of the Goshala (cow shelter) at Jai Varahi Peedam?',
    a: 'The Goshala operates daily with morning feeding at 6:00 AM, cleaning and health check at 7:00 AM, mid-day feeding at 12:00 PM, rest period, evening feeding at 5:00 PM, and final check at 7:00 PM. The cows are cared for by dedicated staff.',
    fullAnswer: 'The Goshala (Kosala) at Jai Varahi Peedam follows a structured daily routine to ensure the well-being of all cows: (1) 6:00 AM — Morning feeding with nutritious green fodder, cattle feed, and clean drinking water. The fodder is sourced fresh daily. (2) 7:00 AM — Morning cleaning of the shelter, including removal of waste, fresh bedding, and a general health check by the caretaker. Any signs of illness are noted. (3) 9:00 AM — Morning Go Pooja (Nandhini Pooja) performed by temple priests, applying turmeric and kumkum to the cows. (4) 12:00 PM — Mid-day feeding with additional fodder and nutritional supplements. (5) 12:30 PM to 4:00 PM — Rest period for the cows in a shaded, ventilated area. (6) 5:00 PM — Evening feeding with fresh fodder and water. (7) 6:00 PM — Evening cleaning and preparation for the night. (8) 7:00 PM — Final health check, secure closure of the shelter. The cows receive regular veterinary visits, and any medical needs are addressed promptly. The Goshala is staffed by dedicated caretakers who live nearby and monitor the cows round the clock.',
    category: 'goseva',
  },
  {
    q: 'What specific feeding and veterinary care procedures are followed at the Goshala?',
    a: 'The Goshala provides a balanced diet of green fodder, dry fodder, cattle feed, and mineral supplements. Cows receive regular veterinary check-ups, vaccinations, and prompt medical treatment. Aged and rescued cows receive special care and nutrition.',
    fullAnswer: 'The Goshala at Jai Varahi Peedam follows comprehensive feeding and veterinary care procedures: (1) Feeding: Cows are fed a balanced diet consisting of green fodder (grass, maize, sorghum), dry fodder (hay, straw), cattle feed (nutritionally balanced mixture), mineral supplements and salt licks, and clean drinking water available at all times. Feeding is done three times daily (6:00 AM, 12:00 PM, 5:00 PM). (2) Veterinary Care: Regular monthly check-ups by a qualified veterinarian, vaccinations as per schedule (including Foot and Mouth Disease, Brucellosis), deworming every 3 months, and immediate medical attention for any illness or injury. (3) Special Care for Aged and Rescued Cows: Older cows receive softer feed, additional nutritional supplements, and more frequent health monitoring. Rescued cows are quarantined initially, given a health assessment, and gradually integrated into the herd. (4) Hygiene: Daily cleaning of the shelter, proper drainage for waste, regular disinfection, and pest control measures. (5) Records: Each cow has a health record card documenting feed intake, medical history, vaccinations, and veterinary visits.',
    category: 'goseva',
  },

  // ── 4. Festival Scheduling Details ──
  {
    q: 'What is the detailed daily schedule of the Ashada Navarathiri festival?',
    a: 'The Ashada Navarathiri festival runs for 11 days with a structured daily schedule: 6:00 AM Abishekam, 8:30 AM Alankaram, 10:00 AM Special Homam, 12:30 PM Annadhanam, 4:30 PM Evening Archana, 6:00 PM Cultural Programs, 7:30 PM Deeparadhana, 8:00 PM Prasadam Distribution.',
    fullAnswer: 'The Ashada Navarathiri festival at Jai Varahi Peedam follows a meticulously planned 11-day schedule with specific rituals timed throughout the day: (1) 6:00 AM — Temple opens with Suprabhatham (waking the deity). (2) 6:30 AM — Special Abishekam (sacred bath) of Goddess Varahi, using different sacred ingredients each day (milk, ghee, honey, turmeric, sandalwood, etc.). (3) 8:30 AM — Alankaram (decoration) of the deity with different themes and floral arrangements each day. (4) 9:00 AM — Special Archana including Varahi Sahasranamam chanting. (5) 10:00 AM — Daily Special Homam (Panchami Homam, Pournami Homam, Ashtami Homam, or Amavasai Homam depending on the tithi). (6) 12:00 PM — Noon Pooja with Naivedyam (food offering). (7) 12:30 PM — Nithya Maha Annadhanam Seva serving meals to hundreds of devotees. (8) 4:30 PM — Temple reopens for evening session. (9) 5:00 PM — Evening Archana and Deeparadhana. (10) 6:00 PM — Cultural Programs including devotional music, Bharatanatyam, spiritual discourses, and Harikatha. (11) 7:30 PM — Grand Deeparadhana (lamp offering). (12) 8:00 PM — Prasadam distribution. (13) 8:30 PM — Temple closes. On the 11th and final day, a grand Mahaa Homam is performed with 1008 offerings.',
    category: 'events',
  },
  {
    q: 'What is the expanded programming for Asta Varahi 2.0?',
    a: 'Asta Varahi 2.0 is a 3-day event featuring Vedic rituals, guest speakers, cultural performances, tree planting, food distribution, health camps, and exhibition stalls. Day 1 focuses on rituals and inauguration, Day 2 on discourses and cultural programs, Day 3 on community service and grand finale.',
    fullAnswer: 'Asta Varahi 2.0 is a grand 3-day spiritual celebration that expands on the original Asta Varahi Dharshanam. The detailed programming includes: Day 1 (Inauguration & Rituals): Morning — Maha Ganapathi Homam and Varahi Moola Mantra Homam; Afternoon — Inaugural ceremony with lamp lighting; Evening — Keynote address by Swamy Pallur Varahidhasan, cultural performances, and thematic exhibitions. Day 2 (Spiritual Discourses & Culture): Morning — Panchami Homam and Sahasra Abishekam; Afternoon — Lectures by eminent scholars on Sapta Matrikas, Varahi worship, and Vedic wisdom; Evening — Devotional music concert, Bharatanatyam performance, and spiritual drama. Day 3 (Community Service & Grand Finale): Morning — Tree planting drive (500+ saplings), free medical camp, and blood donation camp; Afternoon — Mahaa Homam with 1008 offerings, distribution of food supplies to 750+ families; Evening — Valedictory session, cultural performances by local artists, grand Deeparadhana, and Prasadam distribution. The event also features 50+ vendor stalls showcasing local crafts, organic products, and spiritual literature.',
    category: 'events',
  },

  // ── 5. Practical Information ──
  {
    q: 'What are the accommodation options and approximate costs near Jai Varahi Peedam?',
    a: 'Budget lodges near Katpadi start at ₹500-800 per night. Mid-range hotels in Vellore cost ₹1,200-2,500 per night. 3-star hotels range from ₹2,500-4,500. The temple may arrange dormitory-style accommodation for groups with prior notice at nominal rates.',
    fullAnswer: 'For out-of-town devotees, accommodation options near Jai Varahi Peedam span various budgets: (1) Budget Lodges — available in Katpadi town (3 km), rates ₹500-800 per night, basic amenities including fan, attached bathroom, and drinking water. Examples: Sri Balaji Lodge, Katpadi Lodge. (2) Mid-Range Hotels — in Vellore city (8 km), rates ₹1,200-2,500 per night, including AC rooms, restaurant, TV, and WiFi. Examples: Hotel Gowri Krishna (₹1,500-2,500), Hotel Windsor Castle (₹1,800-3,000). (3) 3-Star Hotels — rates ₹2,500-4,500 per night, with full amenities including multi-cuisine restaurant, room service, and parking. (4) Temple Accommodation — the temple may arrange simple dormitory-style accommodation for groups of 10+ with prior notice at nominal rates (₹200-500 per person). Advance booking is strongly recommended during festival seasons (Ashada Navarathiri, Asta Varahi events) when rooms fill up quickly. The temple administration can provide contact details of nearby accommodations upon request.',
    category: 'accommodation',
  },
  {
    q: 'What are the transportation options and approximate costs to reach Jai Varahi Peedam?',
    a: 'From Katpadi Junction railway station, auto-rickshaws cost ₹50-80 (10 min). From Vellore bus stand, taxis cost ₹200-300. From Chennai airport, prepaid taxis cost ₹3,000-4,000, trains from Chennai Central to Katpadi cost ₹100-500. From Bangalore, trains cost ₹200-800.',
    fullAnswer: 'Transportation options to reach Jai Varahi Peedam with approximate costs: (1) From Katpadi Junction Railway Station (KPD, 3 km): Auto-rickshaw — ₹50-80 (10 minutes); Taxi — ₹100-150. (2) From Vellore Bus Stand (8 km): Auto-rickshaw — ₹150-200 (20 minutes); Taxi — ₹200-300. (3) From Chennai International Airport (MAA, 150 km): Prepaid taxi — ₹3,000-4,000 (3-4 hours); Bus from Koyambedu to Vellore — ₹200-400; Train from Chennai Central to Katpadi — ₹100-500 (2.5-3 hours, multiple daily trains including Chennai-Bangalore express trains). (4) From Bangalore/Kempegowda Airport (BLR, 200 km): Prepaid taxi — ₹4,000-5,500 (4-5 hours); Train from Bangalore City to Katpadi — ₹200-800 (3-4 hours, trains like Shatabdi, Brindavan, Lalbagh). (5) Local Transport: Auto-rickshaws are readily available for short trips. Taxis can be hired for full-day sightseeing (₹1,500-2,500 per day). The temple premises have free parking for private vehicles.',
    category: 'accommodation',
  },
  {
    q: 'What are the live streaming schedules and platforms for temple events?',
    a: 'Major festivals are live-streamed on the Kottai Varahi TV YouTube channel (@kottaivarahiTV). Pournami Homam streams at 7:00 AM on Pournami days. Asta Varahi events stream all 3 days. Ashada Navarathiri streams daily at 6:00 AM and 6:00 PM. Instagram stories provide real-time updates.',
    fullAnswer: 'Jai Varahi Peedam offers live streaming of major events through multiple platforms: (1) YouTube (Kottai Varahi TV @kottaivarahiTV): Pournami Homam — live every Pournami day at 7:00 AM; Ashada Navarathiri — daily live streaming at 6:00 AM (morning abishekam) and 6:00 PM (evening cultural programs); Asta Varahi Dharshanam & Asta Varahi 2.0 — full 2-3 day live coverage; Varahi Jayanthi — live from 7:00 AM; Aadi Amavasai — live at 6:00 AM. (2) Instagram (@jai_varahi_peedam): Real-time story updates during festivals, behind-the-scenes content, short clips of rituals, and announcement posts. (3) Facebook (PallurVarahiDhasan): Event pages, photo albums, and video recordings of past events. Devotees can subscribe to the YouTube channel and turn on notifications to receive alerts for upcoming live streams. Recorded videos of past events are also available on the channel. Streaming schedules are announced on the website calendar and social media platforms at least one week in advance.',
    category: 'online',
  },

  // ── 6. Spiritual Practices ──
  {
    q: 'What are the guidelines for chanting Varahi mantras at home?',
    a: 'Varahi mantras should be chanted with proper pronunciation and devotion. The basic Varahi Beeja Mantra is "Om Aim Hreem Kleem Chamundayai Vichche" chanted 108 times daily. Morning (Brahma Muhurtham) is ideal. Initiation from a Guru is recommended for advanced mantras.',
    fullAnswer: 'For devotees who wish to practice Varahi mantra chanting at home, the following guidelines are recommended: (1) Basic Mantra — The Varahi Beeja Mantra "Om Aim Hreem Kleem Chamundayai Vichche" can be chanted by anyone with devotion. Chant 108 times (one mala) daily, preferably in the morning (Brahma Muhurtham, 4:30 AM-6:00 AM). (2) Preparation — Bathe before chanting, wear clean clothes (preferably yellow or red), face east or north, and sit on a clean mat (preferably wool or silk). (3) Procedure — Begin with a prayer to Ganesha and your Guru, chant the mantra clearly with proper pronunciation, use a rudraksha or sphatika mala for counting, and conclude with a prayer for forgiveness. (4) Advanced Mantras — The Varahi Sahasranamam (1008 names) and Varahi Dhyana Mantram require proper initiation (Deeksha) from a qualified Guru like Swamy Pallur Varahidhasan. Uninitiated chanting of advanced mantras may not yield desired results. (5) Additional Practices — Light a ghee lamp, offer red flowers or turmeric, and maintain a vegetarian diet on chanting days. Consistency is more important than duration — even 15 minutes of sincere chanting daily brings benefits. (6) Precautions — Avoid chanting during impurity (menstruation, mourning), keep the mantra confidential, and do not chant for harmful intentions.',
    category: 'veedu',
  },
  {
    q: 'What meditation practices are specific to Varahi worship?',
    a: 'Varahi meditation (Dhyana) involves visualizing the Goddess\'s boar-faced form, chanting her mantras, and focusing on the Ajna Chakra (third eye). The Varahi Dhyana Slokam describes her form in detail. Regular practice develops inner strength, courage, and spiritual protection.',
    fullAnswer: 'Meditation on Goddess Varahi (Varahi Dhyana) is a powerful spiritual practice that helps devotees connect with the Goddess\'s protective energy. The following practices are recommended: (1) Varahi Dhyana Visualization — Sit in a comfortable meditation posture, close your eyes, and visualize Goddess Varahi as described in the Dhyana Slokam: boar-faced, dark complexioned, adorned with red garments and ornaments, seated on a lotus, holding a staff (danda), a plough (langala), a conch (sankha), and a club (gada). Visualize her surrounded by a brilliant red or golden aura. (2) Chakra Focus — Varahi meditation is associated with the Ajna Chakra (third eye/ brow chakra). Focus your attention between the eyebrows while chanting the Varahi Beeja Mantra. This helps awaken inner vision and intuition. (3) Breathing Practice — Inhale deeply while visualizing golden light entering through the crown, hold the breath while visualizing the Goddess\'s form in the heart center, exhale while chanting "Om Varahyai Namah." (4) Duration — Start with 10-15 minutes daily, gradually increasing to 30 minutes. Morning hours (Brahma Muhurtham, 4:30 AM-6:00 AM) are most effective. (5) Benefits — Regular practice develops inner strength, courage, mental clarity, spiritual protection, and a deeper connection with the Divine Mother. It helps overcome fears, negative thoughts, and mental obstacles.',
    category: 'veedu',
  },
  {
    q: 'What disciplines are required for worshipping Varahi as a Gupta Devata (secret deity)?',
    a: 'Varahi worship as a Gupta Devata requires: initiation from a qualified Guru, strict confidentiality of mantras, regular sadhana (daily practice), vegetarian diet, purity of body and mind, celibacy during intensive practice, and sincere devotion without expectation of material rewards.',
    fullAnswer: 'Worshipping Goddess Varahi as a Gupta Devata (secret/sacred deity) requires specific disciplines and preparations: (1) Guru Initiation (Deeksha) — The most important requirement is proper initiation from a qualified Guru like Swamy Pallur Varahidhasan. The Guru transmits the mantra\'s power (mantra shakti) and provides guidance on the correct practice. (2) Confidentiality (Gopaniyam) — The mantra and practice methods should be kept confidential and not shared with unqualified persons. This protects the mantra\'s power and respects the sacred tradition. (3) Regular Sadhana — Daily practice at the same time and place is essential. Consistency is more important than duration. Morning Brahma Muhurtham (4:30 AM-6:00 AM) is ideal. (4) Purity — Maintain physical purity through daily bathing, clean clothing, and a vegetarian diet. Avoid alcohol, tobacco, and non-vegetarian food. (5) Discipline — Celibacy (brahmacharya) is recommended during intensive practice periods. Moderation in all activities is encouraged. (6) Mental Attitude — Approach the practice with sincerity, humility, and surrender (bhakti). Avoid performing the practice for material gains, harming others, or ego gratification. (7) Seva — Participate in temple service and community welfare as a form of practical spirituality. (8) Study — Regularly study scriptures related to Varahi worship, Devi Mahatmyam, and the Guru\'s teachings.',
    category: 'veedu',
  },

  // ── 7. Administrative Details ──
  {
    q: 'How does the booking confirmation process work after I submit a pooja booking?',
    a: 'After submitting your booking online, the temple team reviews it within 24-48 hours. You will receive a WhatsApp or phone call confirmation with the exact date and time. A booking ID is generated for reference. Final confirmation is sent via SMS or email.',
    fullAnswer: 'The booking confirmation process at Jai Varahi Peedam follows these steps: (1) Online Submission — You submit the booking form on the Services page with your details, preferred service, and date. (2) Acknowledgment — You receive an immediate on-screen confirmation with a reference number. (3) Review by Temple Team — The temple administration reviews your booking within 24-48 hours (during regular working days). They check the availability of priests, materials, and the suitability of the requested date. (4) Contact for Confirmation — A temple representative calls or WhatsApp messages you at the phone number provided, confirming the exact date and time for the ritual. They may also discuss any specific requirements (such as ingredients for Sahasra Abishekam) and associated costs. (5) Booking ID — A unique booking ID is generated and shared with you for all future correspondence. (6) Final Confirmation — A final confirmation message is sent via SMS or email 24 hours before the scheduled ritual. (7) Walk-in Procedure — For devotees who visit the temple directly, the priest can perform the ritual on the same day depending on availability. It is always recommended to book in advance, especially during festival seasons and on auspicious days like Panchami, Pournami, and Amavasai.',
    category: 'booking',
  },
  {
    q: 'How are prasadam shipping procedures handled for out-of-town devotees?',
    a: 'Prasadam is packed in sealed containers with temple stickers. Out-of-town devotees can request courier delivery by contacting the temple office, providing their address, and paying the shipping charges. Dry prasadam items are shipped; perishable items are not.',
    fullAnswer: 'The prasadam shipping procedure for out-of-town devotees is as follows: (1) Request — Contact the temple office via phone (+91 90928 78389) or email (varahikottai@gmail.com) to request prasadam delivery. Provide your full name, shipping address, phone number, and the specific prasadam you wish to receive. (2) Types of Prasadam Available — Vibhuti (sacred ash), Kumkum (vermilion), Sandalwood paste, Tulsi (holy basil) leaves, Dry prasadam items (sweet pongal powder, ladoo, etc. — when available, must be non-perishable). (3) Packaging — Prasadam items are packed in clean, sealed containers with temple stickers for authenticity. (4) Shipping Charges — The temple charges actual courier costs based on weight and destination. Domestic shipping within India typically costs ₹50-200 depending on location. (5) Dispatch — Prasadam is dispatched within 3-5 working days of receiving the request and payment. The courier tracking number is shared with the devotee. (6) Important Note — Perishable food items (fresh prasadam, cooked meals) cannot be shipped long distances. Only dry, non-perishable items are couriered. During major festivals, prasadam items may be in high demand, and advance booking is recommended.',
    category: 'booking',
  },
  {
    q: 'What tax documentation does the temple provide for donations?',
    a: 'The temple provides official donation receipts for all contributions. Donations may be eligible for tax deduction under Section 80G of the Indian Income Tax Act. Donors should contact the temple administration for receipts and tax documentation specific to their donation.',
    fullAnswer: 'For tax documentation related to donations at Jai Varahi Peedam: (1) Donation Receipt — Every donation, whether online or offline, is acknowledged with an official receipt. Online donations through the payment page generate an automatic digital receipt with the transaction details. (2) 80G Certificate — If the temple is registered under Section 80G of the Income Tax Act, donations may be eligible for tax deduction. Donors should contact the temple administration at varahikottai@gmail.com or +91 90928 78389 to confirm the 80G status and obtain the necessary certificate. (3) Information Required for Receipts — Full name as per PAN card, complete postal address, PAN card number (for donations above ₹2,000), phone number, email address, and donation amount and date. (4) Receipt Delivery — Physical receipts can be mailed to your address upon request. Digital receipts are sent via email within 7 working days. (5) Annual Statement — For regular donors, the temple may provide an annual consolidated statement of donations for tax filing purposes. Please note that tax deductibility depends on the donor\'s residential status and the specific provisions applicable at the time of donation. It is advisable to consult with a tax professional for personalized guidance.',
    category: 'donation',
  },
  {
    q: 'Can NRI or overseas devotees book poojas for family members in India?',
    a: 'Yes, NRI and overseas devotees can book poojas online for their family members in India. The sankalpam will include the names of both the sponsor and the family members. Payment can be made through the secure online portal using international cards.',
    fullAnswer: 'Jai Varahi Peedam welcomes bookings from NRI and overseas devotees who wish to perform poojas for their family members in India. The process is: (1) Online Booking — Visit the Services page and fill in the booking form with the details of the family members who will be physically present at the temple. (2) Sankalpam — The priest will include the names of both the sponsor (NRI devotee) and the family members in the sankalpam (sacred intention) chanting. (3) Payment — International credit/debit cards (Visa, Mastercard, RuPay) are accepted through the secure Razorpay payment gateway. The payment is processed in Indian Rupees (INR), and the applicable exchange rate will apply. (4) Coordination — The temple team will coordinate with the family members in India to confirm the date and time of the ritual. (5) Live Participation — If available, the NRI devotee can join the ritual via video call or watch the live stream on YouTube. (6) Feedback — Photos and videos of the ritual can be shared with the NRI devotee upon request. The temple administration is experienced in handling overseas bookings and ensures smooth coordination.',
    category: 'booking',
  },

  // ── 8. Historical Context ──
  {
    q: 'What is the detailed history of Jai Varahi Peedam and its founding?',
    a: 'Jai Varahi Peedam was founded by Swamy Pallur Varahidhasan in Arumparuthi, Katpadi, Vellore, Tamil Nadu. What began as a small shrine dedicated to Goddess Varahi has grown into a fully developed temple complex with daily rituals, festivals, goshala, and community service programs spanning decades.',
    fullAnswer: 'Jai Varahi Peedam has a rich history rooted in the spiritual vision of its founder, Swamy Pallur Varahidhasan. The temple was established in the early 2000s in the Kottai (fort) area of Arumparuthi, Katpadi, Vellore. The location was chosen for its spiritual significance and accessibility to devotees from Vellore and surrounding districts. What began as a modest shrine with basic facilities has grown through the grace of Goddess Varahi and the dedication of devotees into a comprehensive spiritual center. Key milestones in the temple\'s development include: (1) Initial establishment of the main shrine of Sri Kottai Varahi Amman. (2) Construction of the temple complex with garbhagriha (sanctum), mandapam (hall), and prakaram (circumambulation path). (3) Establishment of Sri Varahi Jothida Vidyalayam for astrology services and education. (4) Development of the Goshala (cow shelter) for Go Seva. (5) Initiation of major festivals including Ashada Navarathiri and Asta Varahi Dharshanam. (6) Launch of the website and online booking system for global devotees. (7) Community service programs including Annadhanam, medical camps, and tree planting drives. The temple continues to grow under the guidance of Swamy Pallur Varahidhasan, attracting devotees from across Tamil Nadu, India, and abroad.',
    category: 'general',
  },

  // ── 9. Media & Social Media Presence ──
  {
    q: 'What can I find on the Kottai Varahi TV YouTube channel?',
    a: 'The Kottai Varahi TV YouTube channel (@kottaivarahiTV) features live streams of major festivals, recorded poojas, spiritual discourses by Swamy Pallur Varahidhasan, devotional songs, and event highlights. Subscribe for notifications on upcoming live streams.',
    fullAnswer: 'The Kottai Varahi TV YouTube channel is the official video platform of Jai Varahi Peedam, offering a rich collection of spiritual content: (1) Live Streams — Major festivals including Ashada Navarathiri (11-day live coverage), Asta Varahi Dharshanam, Asta Varahi 2.0, Pournami Homam, and Varahi Jayanthi are streamed live. (2) Recorded Poojas — Videos of special homams, abishekams, and archana ceremonies for viewing at any time. (3) Spiritual Discourses — Talks by Swamy Pallur Varahidhasan on Varahi worship, Vedic wisdom, astrology, and spiritual philosophy. (4) Devotional Songs — Varahi Malai (devotional hymns), bhajans, and kirtans dedicated to Goddess Varahi. (5) Event Highlights — Short clips and highlights from major events, including cultural performances, community service activities, and festival moments. (6) Announcements — Important announcements about upcoming events, schedule changes, and new services. Devotees can subscribe to the channel and click the bell icon to receive notifications for new uploads and live streams.',
    category: 'media',
  },
  {
    q: 'What kind of updates does Jai Varahi Peedam share on Instagram?',
    a: 'The temple\'s Instagram account (@jai_varahi_peedam) shares daily photos of temple rituals, festival highlights, short video clips of poojas, behind-the-scenes content, event announcements, and inspirational spiritual quotes.',
    fullAnswer: 'Jai Varahi Peedam\'s Instagram account (@jai_varahi_peedam) provides visual updates and spiritual content for devotees: (1) Daily Rituals — Photos and short videos of morning abishekam, evening deeparadhana, and daily poojas. (2) Festival Highlights — Real-time stories and posts during major festivals like Ashada Navarathiri, Asta Varahi, and Varahi Jayanthi, including behind-the-scenes preparation. (3) Event Announcements — Posts announcing upcoming events, dates, and schedules. (4) Spiritual Content — Inspirational quotes from Swamy Pallur Varahidhasan, short teachings on Varahi philosophy, and explanations of rituals. (5) Community Service — Photos and updates from Annadhanam, medical camps, tree planting drives, and other social welfare activities. (6) Devotee Experiences — Occasionally sharing testimonials and experiences of devotees (with permission). Followers can send direct messages for inquiries about bookings, donations, and general information. The account is updated regularly and provides an accessible way to stay connected with the temple.',
    category: 'media',
  },
  {
    q: 'Can I message Jai Varahi Peedam directly on Facebook or Instagram?',
    a: 'Yes, you can send direct messages to the temple on Facebook (PallurVarahiDhasan) and Instagram (@jai_varahi_peedam). The temple team responds to inquiries about bookings, events, donations, and general information during working hours.',
    fullAnswer: 'Jai Varahi Peedam is active on both Facebook and Instagram and welcomes direct messages from devotees: (1) Facebook — Follow the page "PallurVarahiDhasan" and send a direct message. Common inquiries answered include booking requests, event schedules, donation procedures, and general information about the temple. (2) Instagram — Follow @jai_varahi_peedam and send a direct message. The temple responds to questions about rituals, festival dates, and spiritual guidance. (3) Response Time — Messages are typically answered within 24-48 hours during regular working days. During festival periods, response times may be longer due to high volume. (4) For Urgent Inquiries — For time-sensitive matters, it is recommended to call the temple directly at +91 90928 78389 or +91 95002 06199 during temple hours (6:30 AM-12:30 PM and 4:30 PM-8:30 PM). (5) Email — For detailed inquiries, email varahikottai@gmail.com. The team aims to respond to emails within 48-72 hours. Social media is a convenient way to stay updated and ask basic questions, but for booking confirmations and specific ritual details, phone or email communication is preferred.',
    category: 'media',
  },

  // ── 10. Trust & Temple Management ──
  {
    q: 'How is Jai Varahi Peedam managed and what is the temple\'s organizational structure?',
    a: 'Jai Varahi Peedam is managed under the spiritual guidance of Swamy Pallur Varahidhasan, with a dedicated team of priests, administrators, and volunteers. The temple operates with transparency in all financial and operational matters.',
    fullAnswer: 'Jai Varahi Peedam is organized with a clear management structure to ensure smooth operations and transparency: (1) Spiritual Leadership — Swamy Pallur Varahidhasan serves as the founder and spiritual head, guiding all religious activities, astrology services, and spiritual teachings. (2) Temple Administration — A dedicated team manages daily operations including pooja scheduling, event coordination, and devotee services. (3) Priests — Trained Vedic priests perform daily rituals, special homams, and festival ceremonies following traditional procedures. (4) Support Staff — Caretakers manage the temple premises, Goshala, and Annadhanam services. (5) Volunteers — Devotees volunteer during festivals and special events, assisting with crowd management, prasadam distribution, and community service. (6) Online Services — The website and social media are managed to provide online booking, donations, and information to global devotees. (7) Transparency — The temple maintains records of all donations and expenditures, and provides receipts for all contributions. The temple\'s mission is to serve devotees with authenticity, integrity, and devotion, ensuring that all activities are conducted in accordance with traditional Vedic principles.',
    category: 'trust',
  },
  {
    q: 'How does Jai Varahi Peedam ensure transparency in donations and financial matters?',
    a: 'The temple provides official receipts for all donations, maintains detailed financial records, and offers updates on how funds are utilized for temple maintenance, community service, and spiritual programs. Donors can contact the administration for specific inquiries.',
    fullAnswer: 'Jai Varahi Peedam is committed to transparency in all financial matters: (1) Official Receipts — Every donation, whether online or in-person, is acknowledged with an official receipt containing the date, amount, donor name, and purpose. (2) Online Payment Security — Online donations are processed through Razorpay, a trusted Indian payment gateway with end-to-end encryption. No sensitive financial information is stored by the temple. (3) Fund Utilization — Donations are used for specific purposes as designated by the donor: temple maintenance, pooja materials, Annadhanam (food distribution), Goshala (cow shelter) operations, community welfare programs, and festival expenses. (4) Accountability — The temple administration maintains detailed ledgers of all income and expenditure. (5) Donor Queries — Donors can contact the temple at +91 90928 78389 or varahikottai@gmail.com for any questions regarding their donations or fund utilization. (6) Annual Reporting — The temple provides periodic updates to devotees about major projects and activities funded through donations. (7) No Pressure — The temple does not pressure devotees for donations. All contributions are voluntary and appreciated. The temple believes that transparency builds trust and encourages continued support for its spiritual and humanitarian mission.',
    category: 'trust',
  },
]

/**
 * Page-specific FAQ subsets for targeted AEO/GEO optimization.
 * Each array contains Q&A pairs relevant to a specific page.
 */
export const pageFaqs = {
  home: [
    allFaqs.find((f) => f.q === 'What is Jai Varahi Peedam?'),
    allFaqs.find((f) => f.q === 'Who is Goddess Varahi?'),
    allFaqs.find((f) => f.q === 'What are the temple timings at Jai Varahi Peedam?'),
    allFaqs.find((f) => f.q === 'How do I book a temple service or pooja online?'),
    allFaqs.find((f) => f.q === 'How can I make a donation to Jai Varahi Peedam?'),
    allFaqs.find((f) => f.q === 'What is Annadhanam and how can I sponsor it at Jai Varahi Peedam?'),
  ],
  about: [
    allFaqs.find((f) => f.q === 'What is Jai Varahi Peedam?'),
    allFaqs.find((f) => f.q === 'What is the meaning of "Jai Varahi" and why is the temple called Jai Varahi Peedam?'),
    allFaqs.find((f) => f.q === 'Who is Swamy Pallur Varahidhasan?'),
    allFaqs.find((f) => f.q === "What is Swamy Pallur Varahidhasan's approach to spiritual teaching?"),
    allFaqs.find((f) => f.q === 'What is the history of Sri Kottai Varahi Amman Temple?'),
    allFaqs.find((f) => f.q === 'What is the mission and vision of Jai Varahi Peedam under Swamy Pallur Varahidhasan?'),
    allFaqs.find((f) => f.q === 'What is the significance of the boar-faced form of Goddess Varahi?'),
    allFaqs.find((f) => f.q === 'What is the difference between Varahi Pooja and other Shakti poojas?'),
    allFaqs.find((f) => f.q === 'How can I make a donation to Jai Varahi Peedam?'),
    allFaqs.find((f) => f.q === 'What social welfare activities does Jai Varahi Peedam conduct?'),
  ],
  founder: [
    allFaqs.find((f) => f.q === 'Who is Swamy Pallur Varahidhasan?'),
    allFaqs.find((f) => f.q === "What is Swamy Pallur Varahidhasan's approach to spiritual teaching?"),
    allFaqs.find((f) => f.q === 'Does Swamy Pallur Varahidhasan personally perform poojas and homams at the temple?'),
    allFaqs.find((f) => f.q === 'Can devotees meet Swamy Pallur Varahidhasan in person for guidance?'),
    allFaqs.find((f) => f.q === 'What is the mission and vision of Jai Varahi Peedam under Swamy Pallur Varahidhasan?'),
    allFaqs.find((f) => f.q === 'What is the relationship between Jai Varahi Peedam and Sri Varahi Jothida Vidyalayam?'),
    allFaqs.find((f) => f.q === 'Is Jai Varahi Peedam operated as a registered charitable trust?'),
  ],
  services: [
    allFaqs.find((f) => f.q === 'How do I book a temple service or pooja online?'),
    allFaqs.find((f) => f.q === 'What information do I need to provide when booking a pooja?'),
    allFaqs.find((f) => f.q === 'Are there any payments required for booking temple services?'),
    allFaqs.find((f) => f.q === 'Can I reschedule or cancel my booking?'),
    allFaqs.find((f) => f.q === 'What are the different types of Abishekam offered?'),
    allFaqs.find((f) => f.q === 'What is the significance of Panchami and Pournami for Varahi worship?'),
    allFaqs.find((f) => f.q === 'What is Go Seva and how can I participate?'),
    allFaqs.find((f) => f.q === 'What are the different types of Homams (fire rituals) performed at Jai Varahi Peedam, and what are their benefits?'),
    allFaqs.find((f) => f.q === 'What special poojas are available for birthdays, weddings, and other life events?'),
    allFaqs.find((f) => f.q === 'What is Varahi Sahasranamam Archana and what are its benefits?'),
    allFaqs.find((f) => f.q === 'Can NRI or overseas devotees book poojas for family members in India?'),
    allFaqs.find((f) => f.q === 'Does Jai Varahi Peedam perform poojas for devotees who cannot be physically present?'),
  ],
  payment: [
    allFaqs.find((f) => f.q === 'How can I make a donation to Jai Varahi Peedam?'),
    allFaqs.find((f) => f.q === 'Is my donation tax-deductible?'),
    allFaqs.find((f) => f.q === 'Can I reschedule or cancel my booking?'),
    allFaqs.find((f) => f.q === 'Can I make a donation in memory of a loved one?'),
    allFaqs.find((f) => f.q === 'What is Annadhanam and how can I sponsor it at Jai Varahi Peedam?'),
    allFaqs.find((f) => f.q === 'Is Jai Varahi Peedam operated as a registered charitable trust?'),
    allFaqs.find((f) => f.q === 'How does Jai Varahi Peedam ensure transparency in how donations are used?'),
    allFaqs.find((f) => f.q === 'Where can I get an official receipt for my donation or seva sponsorship?'),
  ],
  calendar: [
    allFaqs.find((f) => f.q === 'What are Amavasai and Pournami poojas?'),
    allFaqs.find((f) => f.q === 'What are the temple timings at Jai Varahi Peedam?'),
    allFaqs.find((f) => f.q === 'How do I book a temple service or pooja online?'),
    allFaqs.find((f) => f.q === 'What festivals and events are celebrated at Jai Varahi Peedam throughout the year?'),
    allFaqs.find((f) => f.q === 'What is the best time to visit Jai Varahi Peedam for a peaceful experience?'),
  ],
  vidyalayam: [
    allFaqs.find((f) => f.q === 'What is Jothidam (astrology) guidance offered at Jai Varahi Peedam?'),
    allFaqs.find((f) => f.q === 'What is Sri Varahi Jothida Vidyalayam and what services does it offer?'),
    allFaqs.find((f) => f.q === 'How do I book an astrology consultation?'),
    allFaqs.find((f) => f.q === 'What is Panchangam and how is it used at Sri Varahi Jothida Vidyalayam?'),
    allFaqs.find((f) => f.q === 'What is Kochara (Jothidam) and how does it affect my life?'),
    allFaqs.find((f) => f.q === 'What is Horoscope matching (Match Making) for marriage?'),
    allFaqs.find((f) => f.q === 'What is Muhurtham and how do I select an auspicious date for events?'),
    allFaqs.find((f) => f.q === 'Does Sri Varahi Jothida Vidyalayam offer any astrology or spiritual courses?'),
    allFaqs.find((f) => f.q === 'What astrology courses are offered at Sri Varahi Jothida Vidyalayam?'),
    allFaqs.find((f) => f.q === 'Who can join the astrology classes at Sri Varahi Jothida Vidyalayam?'),
    allFaqs.find((f) => f.q === 'Does Sri Varahi Jothida Vidyalayam teach numerology, Vastu, and palmistry?'),
    allFaqs.find((f) => f.q === 'What personal astrology prediction services are offered at Sri Varahi Jothida Vidyalayam?'),
    allFaqs.find((f) => f.q === 'What is Dosha Analysis and what planetary doshas can be identified at Sri Varahi Jothida Vidyalayam?'),
    allFaqs.find((f) => f.q === 'What remedial measures (Pariharam) are recommended for planetary doshas?'),
    allFaqs.find((f) => f.q === 'Does Sri Varahi Jothida Vidyalayam provide numerology consultation?'),
    allFaqs.find((f) => f.q === 'Does Sri Varahi Jothida Vidyalayam offer Vastu consultation services?'),
    allFaqs.find((f) => f.q === 'How can I make a donation to Jai Varahi Peedam?'),
    allFaqs.find((f) => f.q === 'What is Kosala (Goshala) and what is the purpose of Kosala donations at Jai Varahi Peedam?'),
    allFaqs.find((f) => f.q === 'What is the relationship between Jai Varahi Peedam and Sri Varahi Jothida Vidyalayam?'),
  ],
  whoIsVarahi: [
    allFaqs.find((f) => f.q === 'Who is Goddess Varahi?'),
    allFaqs.find((f) => f.q === 'What is Varahi Pooja and what are its benefits?'),
    allFaqs.find((f) => f.q === 'What is the significance of the boar-faced form of Goddess Varahi?'),
    allFaqs.find((f) => f.q === 'What is the difference between Varahi Pooja and other Shakti poojas?'),
    allFaqs.find((f) => f.q === 'Why is Varahi called a Gupta Devata (secret deity)?'),
    allFaqs.find((f) => f.q === 'What is the relationship between Goddess Varahi and Lord Varaha?'),
    allFaqs.find((f) => f.q === 'Who are the Sapta Matrikas?'),
  ],
  ashadaNavarathiri: [
    allFaqs.find((f) => f.q === 'What is Ashada Navarathiri and when is it celebrated?'),
    allFaqs.find((f) => f.q === 'What is the Ashada Navarathiri schedule like?'),
    allFaqs.find((f) => f.q === 'Are there any special Ashada Navarathiri packages for devotees?'),
    allFaqs.find((f) => f.q === 'How do I book a temple service or pooja online?'),
    allFaqs.find((f) => f.q === 'What are the temple timings at Jai Varahi Peedam?'),
    allFaqs.find((f) => f.q === 'What is the significance of Panchami and Pournami for Varahi worship?'),
    allFaqs.find((f) => f.q === 'What is Annadhanam and how can I sponsor it at Jai Varahi Peedam?'),
    allFaqs.find((f) => f.q === 'How can I sponsor Annadhanam during the Ashada Navarathiri festival?'),
  ],
  astaVarahi: [
    allFaqs.find((f) => f.q === 'What is Asta Varahi Dharshanam?'),
    allFaqs.find((f) => f.q === 'What is Asta Varahi 2.0?'),
    allFaqs.find((f) => f.q === 'How can I make a donation to Jai Varahi Peedam?'),
    allFaqs.find((f) => f.q === 'How do I book a temple service or pooja online?'),
    allFaqs.find((f) => f.q === 'What social welfare activities does Jai Varahi Peedam conduct?'),
    allFaqs.find((f) => f.q === 'What is Kosala (Goshala) and what is the purpose of Kosala donations at Jai Varahi Peedam?'),
  ],
  varahiMalai: [
    allFaqs.find((f) => f.q === 'Who is Goddess Varahi?'),
    allFaqs.find((f) => f.q === 'What is the significance of the boar-faced form of Goddess Varahi?'),
    allFaqs.find((f) => f.q === 'What is Varahi Pooja and what are its benefits?'),
  ],
  sriBalaManthiram: [
    allFaqs.find((f) => f.q === 'Who is Goddess Varahi?'),
    allFaqs.find((f) => f.q === 'Why is Varahi called a Gupta Devata (secret deity)?'),
  ],
  uchchishtaGanapati: [
    allFaqs.find((f) => f.q === 'Who is Goddess Varahi?'),
    allFaqs.find((f) => f.q === 'Who are the Sapta Matrikas?'),
  ],
  bookPooja: [
    allFaqs.find((f) => f.q === 'How do I book a temple service or pooja online?'),
    allFaqs.find((f) => f.q === 'What information do I need to provide when booking a pooja?'),
    allFaqs.find((f) => f.q === 'Are there any payments required for booking temple services?'),
    allFaqs.find((f) => f.q === 'Can I reschedule or cancel my booking?'),
    allFaqs.find((f) => f.q === 'How can I receive prasadam from the temple? Can prasadam be sent to out-of-town devotees?'),
    allFaqs.find((f) => f.q === 'Can NRI or overseas devotees book poojas for family members in India?'),
  ],
  media: [
    allFaqs.find((f) => f.q === 'Can I watch temple rituals and poojas online through live streaming?'),
    allFaqs.find((f) => f.q === 'What can I find on the Kottai Varahi TV YouTube channel?'),
    allFaqs.find((f) => f.q === 'What kind of updates does Jai Varahi Peedam share on Instagram?'),
    allFaqs.find((f) => f.q === 'Can I message Jai Varahi Peedam directly on Facebook or Instagram?'),
    allFaqs.find((f) => f.q === 'How can I stay updated about Jai Varahi Peedam events and announcements?'),
    allFaqs.find((f) => f.q === 'What are the contact details of Jai Varahi Peedam?'),
  ],
}

/**
 * HowTo data for AEO — step-by-step guides that search engines can surface
 * as rich results and that generative AI models can reference.
 */
export const howToData = {
  bookPooja: {
    name: 'How to Book a Temple Pooja at Jai Varahi Peedam',
    description:
      'Follow these 5 simple steps to book your sacred Varahi Pooja, Homam, or Abishekam online at Jai Varahi Peedam in Vellore.',
    totalTime: 'PT10M',
    tool: ['Web browser', 'Phone or email for confirmation'],
    step: [
      {
        url: 'https://jaivarahi.org/services#step1',
        name: 'Select Your Service',
        text: 'Visit the Services page and choose your preferred ritual category (Abishekam, Archana, Homam, Special Pooja, or Go Seva) along with the specific pooja or homam you wish to book.',
        image: 'https://jaivarahi.org/assets/img/services/booking-step1.jpg',
        position: 1,
      },
      {
        url: 'https://jaivarahi.org/services#step2',
        name: 'Enter Contact Details',
        text: 'Fill in your full name, 10-digit phone number, email address, and city in the booking wizard.',
        image: 'https://jaivarahi.org/assets/img/services/booking-step2.jpg',
        position: 2,
      },
      {
        url: 'https://jaivarahi.org/services#step3',
        name: 'Provide Divine Details',
        text: 'Enter your Gothram, Nakshatram (birth star), Rasi (zodiac sign), and the names of family members to be included in the Sankalpam chanting.',
        image: 'https://jaivarahi.org/assets/img/services/booking-step3.jpg',
        position: 3,
      },
      {
        url: 'https://jaivarahi.org/services#step4',
        name: 'Choose Date and Time',
        text: 'Select your preferred date and time slot — Morning (7:00 AM–11:30 AM) or Evening (4:30 PM–8:00 PM).',
        image: 'https://jaivarahi.org/assets/img/services/booking-step4.jpg',
        position: 4,
      },
      {
        url: 'https://jaivarahi.org/services#step5',
        name: 'Review and Submit',
        text: 'Review all your details, submit the booking, and download your confirmation receipt with the booking ID. The temple team will contact you to confirm.',
        image: 'https://jaivarahi.org/assets/img/services/booking-step5.jpg',
        position: 5,
      },
    ],
  },
  donateOnline: {
    name: 'How to Donate Online to Jai Varahi Peedam',
    description:
      'Make a secure online donation to support Jai Varahi Peedam temple services, community welfare, and social development programs.',
    totalTime: 'PT5M',
    step: [
      {
        url: 'https://jaivarahi.org/payment#step1',
        name: 'Visit the Donation Page',
        text: 'Go to the Jai Varahi Peedam payment page at jaivarahi.org/payment.',
        position: 1,
      },
      {
        url: 'https://jaivarahi.org/payment#step2',
        name: 'Enter Donation Details',
        text: 'Enter your full name, city, 10-digit phone number, and the donation amount in rupees.',
        position: 2,
      },
      {
        url: 'https://jaivarahi.org/payment#step3',
        name: 'Complete Secure Payment',
        text: 'Click "Make Donation" and complete the secure payment via Razorpay using your preferred method (cards, UPI, net banking, or wallet).',
        position: 3,
      },
      {
        url: 'https://jaivarahi.org/payment#step4',
        name: 'Receive Confirmation',
        text: 'After successful payment, you will receive a confirmation message. Contact the temple for an official receipt if needed.',
        position: 4,
      },
    ],
  },
  sponsorAnnadhanam: {
    name: 'How to Sponsor Annadhanam at Jai Varahi Peedam',
    description:
      'Sponsor the daily Annadhanam (free food donation) program at Jai Varahi Peedam and earn the blessings of feeding hundreds of devotees.',
    totalTime: 'PT5M',
    step: [
      {
        url: 'https://jaivarahi.org/payment',
        name: 'Visit the Donation Page',
        text: 'Go to the Jai Varahi Peedam donation page at jaivarahi.org/payment.',
        position: 1,
      },
      {
        url: 'https://jaivarahi.org/payment',
        name: 'Select Annadhanam Purpose',
        text: 'Enter your full name, city, phone number, and donation amount. In the message field, specify "Annadhanam sponsorship" and the preferred date.',
        position: 2,
      },
      {
        url: 'https://jaivarahi.org/payment',
        name: 'Complete Payment',
        text: 'Complete the secure payment via Razorpay. The temple team will contact you to confirm the sponsorship details.',
        position: 3,
      },
    ],
  },
}

/**
 * SEO / AEO helper — generates schema.org FAQPage JSON-LD structured data
 * from any array of FAQ objects (e.g. allFaqs, or a pageFaqs[...] subset).
 *
 * Usage in a page <head> (Next.js example):
 *   import { generateFaqJsonLd } from '@/data/faqData'
 *   <script
 *     type="application/ld+json"
 *     dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFaqJsonLd(pageFaqs.services)) }}
 *   />
 *
 * Google and generative answer engines use this markup to surface direct
 * answers in rich results, People Also Ask, and AI-generated citations.
 */
export function generateFaqJsonLd(faqs) {
  const validFaqs = (faqs || []).filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: validFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.fullAnswer || faq.a,
      },
    })),
  }
}

/**
 * SEO / AEO helper — generates schema.org HowTo JSON-LD structured data
 * from a howToData entry (e.g. howToData.bookPooja).
 *
 * Usage:
 *   import { generateHowToJsonLd, howToData } from '@/data/faqData'
 *   <script
 *     type="application/ld+json"
 *     dangerouslySetInnerHTML={{ __html: JSON.stringify(generateHowToJsonLd(howToData.bookPooja)) }}
 *   />
 */
export function generateHowToJsonLd(howTo) {
  if (!howTo) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name,
    description: howTo.description,
    totalTime: howTo.totalTime,
    tool: howTo.tool ? howTo.tool.map((t) => ({ '@type': 'HowToTool', name: t })) : undefined,
    step: howTo.step.map((s) => ({
      '@type': 'HowToStep',
      position: s.position,
      name: s.name,
      text: s.text,
      url: s.url,
      image: s.image,
    })),
  }
}

/**
 * SEO helper — generates schema.org Organization / Place of Worship JSON-LD
 * for the temple itself, using only the contact and location facts already
 * established elsewhere in this file. Fill in any placeholder marked TODO
 * once confirmed (e.g. exact GPS coordinates, sameAs social URLs already
 * present below are taken from the contact FAQ above).
 *
 * Usage: place once on the homepage <head>.
 */
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HinduTemple',
    name: 'Jai Varahi Peedam (Sri Kottai Varahi Amman Temple)',
    url: 'https://www.jaivarahi.org/',
    telephone: ['+91-90928-78389', '+91-95002-06199'],
    email: 'varahikottai@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Sri Kottai Varahi Amman Temple Street, Arumparuthi',
      addressLocality: 'Katpadi, Vellore',
      addressRegion: 'Tamil Nadu',
      postalCode: '632106',
      addressCountry: 'IN',
    },
    sameAs: [
      'https://www.youtube.com/@kottaivarahiTV',
      'https://www.instagram.com/jai_varahi_peedam',
      'https://www.facebook.com/PallurVarahiDhasan',
    ],
    founder: {
      '@type': 'Person',
      name: 'Swamy Pallur Varahidhasan',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '06:30',
        closes: '12:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '16:30',
        closes: '20:30',
      },
    ],
  }
}