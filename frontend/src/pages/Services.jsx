import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Preloader from '../components/common/Preloader.jsx';
import Navbar from '../components/common/Navbar.jsx';
import MobileNav from '../components/common/MobileNav.jsx';
import Footer from '../components/common/Footer.jsx';
import FloatActions from '../components/common/FloatActions.jsx';
import SeoEnhanced from '../components/common/SeoEnhanced.jsx';
import DynamicCategoryFields from '../components/services/DynamicCategoryFields.jsx';
import { pageFaqs, howToData } from '../data/faqData.js';
import { submitServiceBooking, getActiveServices, getActiveCategories } from '../api/serviceBookingAPI.js';
import { validateFields, hasErrors, isValidEmail } from '../utils/formValidation';

// Specific Poojas configuration to drive both Cards and the Wizard Select
const SERVICES_DATA = {
  Abishekam: [
    {
      title: 'Nithya Abishekam',
      image: '/assets/img/services/nithya_abishekam.png',
      duration: '1.5 Hours',
      bestDay: 'Daily',
      benefits: 'Daily peace, removal of obstacles, mental clarity',
      thingsToBring: 'Coconut, Flowers, Milk, Honey, Fruits',
      dressCode: 'Traditional Dhoti/Saree',
      description: 'Daily sacred bathing ritual of the deity with chants.'
    },
    {
      title: 'Sahasra Abishekam',
      image: '/assets/img/services/sahasra_abishekam.png',
      duration: '3 Hours',
      bestDay: 'Special Auspicious Days',
      benefits: 'Supreme blessings, wealth prosperity, health rejuvenation',
      thingsToBring: '108 holy water pots, ghee, cardamoms, honey',
      dressCode: 'Traditional traditional attire',
      description: 'Grand bathing ceremony using 1008 ingredients and sacred waters.'
    },
    {
      title: 'Turmeric Abishekam',
      image: '/assets/img/god/Sri Bala.png',
      duration: '1 Hour',
      bestDay: 'Fridays',
      benefits: 'Marital harmony, beauty, health, obstacles clearance',
      thingsToBring: 'Pure turmeric powder, yellow flowers, coconuts',
      dressCode: 'Traditional yellow or green attire preferred',
      description: 'Sacred turmeric paste bath especially for divine feminine energy.'
    },
    {
      title: 'Ghee Abishekam',
      image: '/assets/img/god/Sri Bala.png',
      duration: '1 Hour',
      bestDay: 'Saturdays / Panchami',
      benefits: 'Relief from chronic illnesses, longevity, aura purification',
      thingsToBring: 'Cow ghee, incense, camphor',
      dressCode: 'Traditional attire',
      description: 'Pure melted cow ghee bath symbolizing purification and health.'
    },
    {
      title: 'Honey Abishekam',
      image: '/assets/img/god/Sri Bala.png',
      duration: '1 Hour',
      bestDay: 'Pournami',
      benefits: 'Sweetness in relationships, pleasant voice, magnetic personality',
      thingsToBring: 'Organic honey, fresh fruits',
      dressCode: 'Traditional attire',
      description: 'Natural honey bath representing sweetness, joy, and bonding.'
    },
    {
      title: 'Milk Abishekam',
      image: '/assets/img/god/Sri Bala.png',
      duration: '1 Hour',
      bestDay: 'Mondays / Ashtami',
      benefits: 'Calm mind, removal of sins, positive thoughts',
      thingsToBring: 'Raw cow milk, bilva leaves',
      dressCode: 'Traditional white attire preferred',
      description: 'Pure milk bath bringing mental peace and washing away negative karma.'
    }
  ],
  Archana: [
    {
      title: 'Varahi Sahasranamam',
      image: '/assets/img/god/varahi_devi_shrine.png',
      duration: '45 Mins',
      bestDay: 'Panchami / Fridays',
      benefits: 'Victory over enemies, protection from evil eye, success',
      thingsToBring: 'Kumkum, red flowers, betel leaves',
      dressCode: 'Traditional red or dark attire',
      description: 'Chanting the 1000 names of Sri Varahi Devi with kumkum archana.'
    },
    {
      title: 'Varahi Ashtothram',
      image: '/assets/img/god/varahi_devi_shrine.png',
      duration: '20 Mins',
      bestDay: 'Daily',
      benefits: 'Daily protection, confidence booster, safety during travel',
      thingsToBring: 'Fresh flowers, coconut, camphor',
      dressCode: 'Traditional attire',
      description: 'Recitation of the 108 names of Sri Varahi Devi.'
    },
    {
      title: 'Katkamala',
      image: '/assets/img/god/varahi_devi_illustration.png',
      duration: '1 Hour',
      bestDay: 'Ashtami / Pournami',
      benefits: 'Deep spiritual connection, protective energy shield, wisdom',
      thingsToBring: 'Panchamirtham, special garlands',
      dressCode: 'Traditional attire',
      description: 'Esoteric garland prayer chanting for protective divine armor.'
    },
    {
      title: 'Mahalakshmi Ashtothram',
      image: '/assets/img/varahi.png',
      duration: '25 Mins',
      bestDay: 'Fridays / Deepavali',
      benefits: 'Abundant wealth, domestic prosperity, business growth',
      thingsToBring: 'Lotus flowers, coins, sweets',
      dressCode: 'Traditional pink/gold attire',
      description: 'Archana chanting 108 names of Goddess Lakshmi for wealth.'
    }
  ],
  Homam: [
    {
      title: 'Panchami Homam',
      image: '/assets/img/god/homam_ritual.png',
      duration: '2.5 Hours',
      bestDay: 'Panchami Tithi',
      benefits: 'Removal of legal disputes, dynamic protection, wealth inflow',
      thingsToBring: 'Pomegranate fruits, red flowers, homam wood, ghee',
      dressCode: 'Traditional yellow/red attire',
      description: 'Powerful fire ritual dedicated to Sri Varahi Devi on Panchami.'
    },
    {
      title: 'Pournami Homam',
      image: '/assets/img/god/homam_ritual.png',
      duration: '3 Hours',
      bestDay: 'Full Moon Day',
      benefits: 'Spiritual awakening, family wellness, negative energy clearance',
      thingsToBring: 'White lotus, payasam, sandalwood powder',
      dressCode: 'Traditional white/yellow attire',
      description: 'Auspicious full moon fire ritual celebrating cosmic mother energy.'
    },
    {
      title: 'Ashtami Homam',
      image: '/assets/img/god/homam_ritual.png',
      duration: '2.5 Hours',
      bestDay: 'Ashtami Tithi',
      benefits: 'Warding off negative forces, healing from deep fears',
      thingsToBring: 'Black sesame seeds, lemons, red flowers',
      dressCode: 'Traditional dark blue/red attire',
      description: 'Intense protective homam performed on the 8th lunar phase.'
    },
    {
      title: 'Amavasai Homam',
      image: '/assets/img/god/homam_ritual.png',
      duration: '2.5 Hours',
      bestDay: 'New Moon Day',
      benefits: 'Ancestral blessings (Pithru), clearing past karma, peace of mind',
      thingsToBring: 'Sesame, black gram, coconuts',
      dressCode: 'Traditional simple attire',
      description: 'Sacred fire ceremony to appease ancestors and clear blockages.'
    }
  ],
  'Special Pooja': [
    {
      title: 'Birthday Pooja',
      image: '/assets/img/god/special_pooja.png',
      duration: '1 Hour',
      bestDay: 'Your Janma Nakshatra/Date',
      benefits: 'Good health in the coming year, longevity, educational success',
      thingsToBring: 'New clothes, sweets, coconut, fruits',
      dressCode: 'New traditional clothing',
      description: 'Blessing ritual performed on your birthday with special prayers.'
    },
    {
      title: 'Wedding Day Pooja',
      image: '/assets/img/god/special_pooja.png',
      duration: '1 Hour',
      bestDay: 'Your Anniversary Date',
      benefits: 'Marital longevity, understanding, family prosperity',
      thingsToBring: 'Garlands, fruits, coconut, sweets',
      dressCode: 'Wedding traditional attire',
      description: 'Special couples pooja renewing holy vows and seeking divine grace.'
    },
    {
      title: 'Shashtiabdhapoorthi',
      image: '/assets/img/god/special_pooja.png',
      duration: '4 Hours',
      bestDay: '60th Birthday Month',
      benefits: 'Longevity, healthy senior age, complete family gathering blessings',
      thingsToBring: 'As specified by temple priests (extended items list)',
      dressCode: 'Traditional wedding style wear',
      description: 'Grand 60th birthday ritual with holy water showers (Abishekam).'
    }
  ],
  'Go Seva': [
    {
      title: 'Cow Adoption',
      image: '/assets/img/god/go_seva_cow.png',
      duration: 'Yearly Support',
      bestDay: 'Any Day / Fridays',
      benefits: 'Clearing lifetime karmas, abundant Gomaatha blessings',
      thingsToBring: 'Devotional spirit',
      dressCode: 'Sober traditional attire',
      description: 'Sponsor and adopt a cow for its complete feed and medical care.'
    },
    {
      title: 'Cow Donation',
      image: '/assets/img/god/go_seva_cow.png',
      duration: 'One-time Seva',
      bestDay: 'Pournami / Panchami',
      benefits: 'Brings wealth, positive home environment, lineage blessing',
      thingsToBring: 'Fresh green grass or fodder donation amount',
      dressCode: 'Traditional attire',
      description: 'Contribute a cow or support purchasing milk cows for Goshala.'
    },
    {
      title: 'Cow Maintenance',
      image: '/assets/img/god/go_seva_cow.png',
      duration: 'Monthly Support',
      bestDay: 'Any Day',
      benefits: 'Relief from daily stresses, general prosperity and health',
      thingsToBring: 'Coconuts, bananas, green grass',
      dressCode: 'Simple traditional attire',
      description: 'Contribute towards monthly feed, green grass, and veterinary medicines.'
    },
    {
      title: 'Cow Pooja',
      image: '/assets/img/god/go_seva_cow.png',
      duration: '1 Hour',
      bestDay: 'Fridays / Mattu Pongal',
      benefits: 'Goddess Lakshmi blessings, clearing home vastu doshas',
      thingsToBring: 'Kumkum, turmeric, garlands, bananas',
      dressCode: 'Traditional yellow/pink clothing',
      description: 'Direct worship (Nandhini Pooja) of cows with turmeric and offerings.'
    }
  ]
};

const Services = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);

  // Popup Modal state
  const [modalService, setModalService] = useState(null);

  const DEFAULT_SERVICE_IMAGE = '/assets/img/varahi.png';
  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = DEFAULT_SERVICE_IMAGE;
  };

  // Wizard state
  const [bookingStep, setBookingStep] = useState(1);
  const [formData, setFormData] = useState({
    category: 'Abishekam',
    service: 'Nithya Abishekam',
    name: '',
    phone: '',
    email: '',
    city: '',
    gothram: '',
    nakshatram: '',
    rasi: '',
    familyMembersInput: '',
    familyMembers: [],
    date: '',
    time: 'Morning (7:00 AM - 11:30 AM)',
    message: '',
    // Dynamic category fields
    abishekam_type: '',
    sponsor_material: '',
    receive_prasadam: '',
    archana_name: '',
    number_of_names: '',
    offer_kumkum: '',
    flower_type: '',
    homam_purpose: '',
    people_attending: '',
    need_homa_prasadam: '',
    occasion: '',
    person_name: '',
    event_date: '',
    marriage_years: '',
    birthday_age: '',
    seva_type: '',
    donation_type: '',
    certificate_required: '',
    name_on_certificate: '',
  });

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Nav Items
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    {
      label: 'Ubasana',
      href: '#',
      children: [
        { label: 'Varahi Malai', href: '/varahimalai' },
        { label: 'Who is varahi ?', href: '/who_is_varahi' },
        { label: 'Uchchishta Ganapati', href: '/Uchchishta_Ganapati' },
        { label: 'Sri Bala manthiram', href: '/sri_bala_manthiram' },
      ],
    },
    {
      label: 'Kosala',
      href: '#',
      children: [
        { label: 'Donation', href: '/payment' },
        { label: 'Donation Archive', href: '/payment' },
      ],
    },
    {
      label: 'Jothidam',
      href: '#',
      children: [
        { label: 'Astrology prediction', href: '/Jothidam' },
        { label: 'Sri Varahi Jothida Vidyalayam', href: '/comingsoon' },
      ],
    },
    {
      label: 'Events',
      href: '#',
      children: [
        { label: 'Asta Varahi Dharshanam', href: '/astavarahi' },
        { label: 'Asta Varahi 2.0', href: '/astavarahi2' },
        { label: 'Ashada Navarathiri', href: '/ashada_navarathiri' },
      ],
    },
    { label: 'Blog', href: '/blog' },
    { label: 'Latest Updates', href: '/comingsoon' },
  ];

  // Auto-fill service when category changes
  useEffect(() => {
    setFormErrors({});
    if (SERVICES_DATA[formData.category]) {
      setFormData((prev) => ({
        ...prev,
        service: SERVICES_DATA[formData.category][0].title,
      }));
    }
  }, [formData.category]);

  // Fetch services and categories from backend
  const [backendServices, setBackendServices] = useState([]);
  const [backendCategories, setBackendCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          getActiveServices(),
          getActiveCategories(),
        ]);
        if (servicesRes.success) setBackendServices(servicesRes.data || []);
        if (categoriesRes.success) setBackendCategories(categoriesRes.data || []);
      } catch (err) {
        console.error('Failed to fetch services/categories:', err);
      }
    };
    fetchData();
  }, []);

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
    setActiveMobileDropdown(null);
  };

  const toggleMobileDropdown = (label) => {
    setActiveMobileDropdown((current) => (current === label ? null : label));
  };

  const getServicePurpose = (service) => {
    const purposes = {
      Abishekam: 'This sacred bathing ritual is performed to lovingly cleanse and honor the deity. Devotees seek inner peace, purification, health, and the removal of obstacles through the blessings of the abhishekam.',
      Archana: 'This offering is performed by chanting the divine names of the deity with flowers or kumkum. It helps devotees express devotion and seek protection, clarity, prosperity, and success in their personal and family life.',
      Homam: 'This fire ritual is performed to offer sacred materials into Agni while reciting powerful mantras. Devotees seek to clear negative influences, strengthen protection, resolve obstacles, and invite health, peace, and prosperity.',
      'Special Pooja': 'This personalized ritual is performed for an important life occasion or milestone. It helps devotees offer gratitude, seek divine guidance, and receive blessings for health, longevity, family harmony, and prosperity.',
      'Go Seva': 'This seva supports the care, food, shelter, and well-being of temple cows. Serving Gomatha is considered a compassionate spiritual offering that brings peace, prosperity, and positive blessings to the devotee and family.',
    };

    return purposes[service?.category] || 'This sacred service is performed with devotion to seek the divine blessings of Sri Varahi Devi and support the well-being of the devotee and family.';
  };

  // Helper to trigger booking from a card click
  const triggerBooking = (category, title) => {
    setFormData((prev) => ({
      ...prev,
      category: category,
      service: title,
    }));
    setBookingStep(1);
    setModalService(null);
    document.getElementById('svc-booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  // Add Family Member helper
  const addFamilyMember = () => {
    if (formData.familyMembersInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        familyMembers: [...prev.familyMembers, prev.familyMembersInput.trim()],
        familyMembersInput: '',
      }));
    }
  };

  // Remove Family Member helper
  const removeFamilyMember = (index) => {
    setFormData((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== index),
    }));
  };

  // Step Navigations
  const nextStep = () => {
    let errors = {};

    if (bookingStep === 1) {
      errors = validateFields(formData, {
        service: [{ rule: 'required', message: 'Please select a service.' }],
      });
    } else if (bookingStep === 2) {
      errors = validateFields(formData, {
        name: [{ rule: 'required', message: 'Name is required.' }],
        phone: [
          { rule: 'required', message: 'Phone Number is required.' },
{ rule: 'phone', message: 'Please enter a valid 10-15 digit phone number.' },
        ],
      });
      // Optional email format validation (only if provided)
      if (formData.email && formData.email.trim() && !isValidEmail(formData.email)) {
        errors.email = 'Please enter a valid email address.';
      }
    } else if (bookingStep === 3) {
      // Validate dynamic category fields
      const categoryErrors = {};
      if (formData.category === 'Abishekam') {
        if (!formData.abishekam_type) categoryErrors.abishekam_type = 'Please select abishekam type.';
      } else if (formData.category === 'Archana') {
        if (!formData.archana_name) categoryErrors.archana_name = 'Please enter the archana name.';
        if (!formData.number_of_names) categoryErrors.number_of_names = 'Please enter the number of names.';
      } else if (formData.category === 'Homam') {
        if (!formData.homam_purpose) categoryErrors.homam_purpose = 'Please select homam purpose.';
      } else if (formData.category === 'Special Pooja') {
        if (!formData.occasion) categoryErrors.occasion = 'Please select occasion.';
        if (!formData.event_date) categoryErrors.event_date = 'Please select the event date.';
      } else if (formData.category === 'Go Seva') {
        if (!formData.seva_type) categoryErrors.seva_type = 'Please select seva type.';
        if (formData.certificate_required === 'Yes' && !formData.name_on_certificate) {
          categoryErrors.name_on_certificate = 'Please enter the name for the certificate.';
        }
      }
      if (Object.keys(categoryErrors).length > 0) {
        setFormErrors(categoryErrors);
        setErrorMsg(Object.values(categoryErrors)[0]);
        return;
      }
    } else if (bookingStep === 4) {
      errors = validateFields(formData, {
        date: [{ rule: 'required', message: 'Please select your preferred date.' }],
      });
      if (formData.date) {
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          errors.date = 'Please select a future date.';
        }
      }
    }

    if (hasErrors(errors)) {
      setErrorMsg(Object.values(errors)[0]);
      return;
    }
    setErrorMsg('');
    setFormErrors({});
    setBookingStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setErrorMsg('');
    setFormErrors({});
    setBookingStep((prev) => prev - 1);
  };

  // Submit Booking Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields before submission
    const errors = validateFields(formData, {
      name: [{ rule: 'required', message: 'Name is required.' }],
      phone: [
        { rule: 'required', message: 'Phone Number is required.' },
        { rule: 'phone', message: 'Please enter a valid 10-digit phone number.' },
      ],
      email: [{ rule: 'custom', message: 'Please enter a valid email address.', param: (value) => !value || !value.trim() || isValidEmail(value) }],
      date: [{ rule: 'required', message: 'Please select your preferred date.' }],
    });

    if (hasErrors(errors)) {
      setErrorMsg(Object.values(errors)[0]);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Build dynamic metadata from category-specific fields
      const bookingMetadata = {};
      if (formData.category === 'Abishekam') {
        bookingMetadata.abishekam_type = formData.abishekam_type;
        bookingMetadata.sponsor_material = formData.sponsor_material;
        bookingMetadata.receive_prasadam = formData.receive_prasadam;
      } else if (formData.category === 'Archana') {
        bookingMetadata.archana_name = formData.archana_name;
        bookingMetadata.number_of_names = formData.number_of_names;
        bookingMetadata.offer_kumkum = formData.offer_kumkum;
        bookingMetadata.flower_type = formData.flower_type;
      } else if (formData.category === 'Homam') {
        bookingMetadata.homam_purpose = formData.homam_purpose;
        bookingMetadata.people_attending = formData.people_attending;
        bookingMetadata.need_homa_prasadam = formData.need_homa_prasadam;
      } else if (formData.category === 'Special Pooja') {
        bookingMetadata.occasion = formData.occasion;
        bookingMetadata.person_name = formData.person_name;
        bookingMetadata.event_date = formData.event_date;
        bookingMetadata.marriage_years = formData.marriage_years;
        bookingMetadata.birthday_age = formData.birthday_age;
      } else if (formData.category === 'Go Seva') {
        bookingMetadata.seva_type = formData.seva_type;
        bookingMetadata.donation_type = formData.donation_type;
        bookingMetadata.certificate_required = formData.certificate_required;
        bookingMetadata.name_on_certificate = formData.name_on_certificate;
      }

      const response = await submitServiceBooking({
        customer_name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        city: formData.city.trim() || null,
        service_type: `${formData.category} - ${formData.service}`,
        gothram: formData.gothram.trim() || null,
        nakshatram: formData.nakshatram.trim() || null,
        rasi: formData.rasi.trim() || null,
        family_members: formData.familyMembers.length > 0 ? formData.familyMembers : null,
        preferred_date: formData.date || null,
        preferred_time: formData.time || null,
        additional_details: formData.message.trim() || null,
        booking_metadata: bookingMetadata,
        // Payment-related fields
        service_amount: 0,
        donation_amount: 0,
        coupon_code: '',
        discount_amount: 0,
        gst_amount: 0,
        total_amount: 0,
      });

      if (response.success) {
        setBookingResult({
          bookingId: response.bookingNumber || response.bookingId || `SVC-${Date.now()}`,
          service: `${formData.category} - ${formData.service}`,
          date: formData.date,
          time: formData.time,
          name: formData.name,
          phone: formData.phone,
        });
        // Reset wizard state
        setFormData({
          category: 'Abishekam',
          service: 'Nithya Abishekam',
          name: '',
          phone: '',
          email: '',
          city: '',
          gothram: '',
          nakshatram: '',
          rasi: '',
          familyMembersInput: '',
          familyMembers: [],
          date: '',
          time: 'Morning (7:00 AM - 11:30 AM)',
          message: '',
          abishekam_type: '',
          sponsor_material: '',
          receive_prasadam: '',
          archana_name: '',
          number_of_names: '',
          offer_kumkum: '',
          flower_type: '',
          homam_purpose: '',
          people_attending: '',
          need_homa_prasadam: '',
          occasion: '',
          person_name: '',
          event_date: '',
          marriage_years: '',
          birthday_age: '',
          seva_type: '',
          donation_type: '',
          certificate_required: '',
          name_on_certificate: '',
        });
        setErrorMsg('');
        setFormErrors({});
        setBookingResult(null);
        setBookingStep(6);
      } else {
        setErrorMsg(response.message || 'Failed to submit booking. Please try again.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download Receipt helper
  const downloadReceipt = () => {
    if (!bookingResult) return;
    const element = document.createElement("a");
    const file = new Blob([
      `==========================================\n`,
      `        JAI VARAHI PEEDAM RECEIPT        \n`,
      `==========================================\n`,
      `Booking ID   : ${bookingResult.bookingId}\n`,
      `Service      : ${bookingResult.service}\n`,
      `Devotee Name : ${bookingResult.name}\n`,
      `Phone Number : ${bookingResult.phone}\n`,
      `Date         : ${bookingResult.date}\n`,
      `Time slot    : ${bookingResult.time}\n`,
      `Status       : PENDING CONFIRMATION\n`,
      `==========================================\n`,
      `Thank you for booking. Please present this\n`,
      `receipt during your visit. For assistance,\n`,
      `contact +91 9092878389.\n`,
      `==========================================\n`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Varahi_Pooja_Receipt_${bookingResult.bookingId}.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  // Accordion state
  const [activeFaq, setActiveFaq] = useState(null);
  const faqs = [
    { q: 'How do I book a temple service?', a: 'You can choose any service from the categories listed above, click "Book Now", which will take you to our booking wizard. Follow the steps, submit your details, and download your confirmation receipt. Our team will verify and contact you shortly.' },
    { q: 'Can I reschedule or cancel my booking?', a: 'Yes. You can contact the temple team directly via phone or WhatsApp (+91 9092878389) at least 24 hours prior to your preferred date to reschedule or cancel.' },
    { q: 'Are there any payments involved for these services?', a: 'Services listed here are sacred offerings. General bookings are registered free. If a service requires specific items or sponsorships, our team will details it when confirming via phone.' },
    { q: 'What are the general Temple timings?', a: 'The temple is open daily from 6:30 AM to 12:30 PM, and in the evening from 4:30 PM to 8:30 PM. On special occasions, festivals, and Panchami, timings may extend.' },
  ];

  return (
    <>
      <SeoEnhanced
        title="Temple Services | Jai Varahi Peedam"
        description="Book sacred temple services, poojas, homams, go seva support, and special event rituals at Jai Varahi Peedam."
        keywords="Varahi Pooja, Temple Services, Homam Booking, Abishekam, Go Seva, Panchami Homam, Pournami Homam, Vellore Temple"
        canonical="https://www.jaivarahi.org/services"
        ogTitle="Temple Services | Jai Varahi Peedam"
        ogDescription="Book sacred temple services, poojas, homams, go seva support, and special event rituals at Jai Varahi Peedam."
        ogImage="https://www.jaivarahi.org/assets/img/images_new/VARAHI%20LOGO.svg"
        ogUrl="https://www.jaivarahi.org/services"
        faqs={pageFaqs.services}
        howTo={howToData.bookPooja}
        author={{
          name: 'Swamy Pallur Varahidhasan',
          url: 'https://www.jaivarahi.org/about',
          jobTitle: 'Founder & Spiritual Head, Jai Varahi Peedam',
          description: 'Practitioner of Vedic traditions and Varahi Amman worship with decades of experience in performing sacred poojas, homams, and providing Jothidam (astrology) guidance.',
        }}
      />


      <Preloader autoHide />
      <Navbar items={navItems} onOpenMobile={() => setIsMobileOpen(true)} isMobileOpen={isMobileOpen} />
      <MobileNav
        items={navItems}
        isOpen={isMobileOpen}
        activeDropdown={activeMobileDropdown}
        onClose={closeMobileMenu}
        onToggleDropdown={toggleMobileDropdown}
      />

      <div
        className={`mobile-nav-overlay${isMobileOpen ? ' active' : ''}`}
        onClick={closeMobileMenu}
        role="presentation"
      />

      <main className="svc-page-bg">
        
        {/* 1. HERO SECTION */}
        <section className="svc-hero-section">
          <div className="hero-om-symbol">ॐ</div>
          <div className="svc-container text-center">
            <div className="m-auto-b20">
              <i className="fa-solid fa-bell swinging-bell"></i>
            </div>
            <h1 className="svc-hero-title">
              Sacred Temple Services
            </h1>
            <p className="svc-hero-subtitle">
              Receive Divine Blessings • Book Sacred Rituals Online
            </p>
            <div className="svc-assist-buttons">
              <a href="#svc-booking" className="svc-btn svc-btn-primary rounded-btn">
                <i className="fa-solid fa-hands-praying mr-8"></i> Book Now
              </a>
              <a href="#svc-categories-list" className="svc-btn svc-btn-outline rounded-btn svc-border-accent">
                <i className="fa-solid fa-gem mr-8"></i> Explore Services
              </a>
            </div>
            
            {/* Floating Diya Ornament */}
            <div className="floating-diya">
              🪔 <span className="svc-spec-label text-block-m10">Devoted Prayers & Offerings</span>
            </div>
          </div>
        </section>

        {/* 2. QUICK CATEGORIES */}
        <section className="svc-quick-nav-bar">
          <div className="svc-container svc-quick-nav-container">
            <span className="svc-quick-nav-label">Quick Navigation:</span>
            {[
              { label: '🪔 Abishekam', id: 'Abishekam' },
              { label: '🔥 Homam', id: 'Homam' },
              { label: '🌸 Archana', id: 'Archana' },
              { label: '🎉 Special Pooja', id: 'Special Pooja' },
              { label: '🐄 Go Seva', id: 'Go Seva' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                className="svc-quick-nav-btn"
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* 3. FEATURED SERVICES */}
        <section className="section-padding">
          <div className="svc-container">
            <div className="text-center m-b40">
              <span className="svc-featured-title-kicker">Today's Special Offering</span>
              <h2 className="section-title">Featured Divine Ritual</h2>
            </div>
            
            <div className="svc-featured-card">
              <div>
                <img src="/assets/img/god/homam.svg" alt="Panchami Homam" className="featured-img" onError={handleImageError} />
              </div>
              <div>
                <div className="flex-between">
                  <span className="svc-featured-badge">Most Auspicious</span>
                  <div className="svc-stars">★★★★★ <span className="svc-spec-label inline-ml5">(4.9/5)</span></div>
                </div>
                <h3 className="svc-featured-name">Panchami Homam</h3>
                <p className="featured-copy">
                  Performed in honor of Goddess Varahi Devi on every Panchami Tithi. This homam provides strong shielding from enemies, removal of evil eyes, and blessing for success in business and career.
                </p>
                <div className="svc-featured-specs">
                  <div>
                    <span className="svc-spec-label">Duration</span>
                    <strong className="svc-spec-val">2.5 Hours</strong>
                  </div>
                  <div>
                    <span className="svc-spec-label">Key Benefits</span>
                    <strong className="svc-spec-val-accent">Victory, Health</strong>
                  </div>
                  <div>
                    <span className="svc-spec-label">Best Day</span>
                    <strong className="svc-spec-val">Panchami Tithi</strong>
                  </div>
                </div>
                <div className="svc-btn-group">
                  <button
                    onClick={() => triggerBooking('Homam', 'Panchami Homam')}
                    className="svc-btn-book"
                  >
                    Book Now
                  </button>
                  <button
                    onClick={() => setModalService({
                      title: 'Panchami Homam',
                      category: 'Homam',
                      ...SERVICES_DATA['Homam'].find(s => s.title === 'Panchami Homam')
                    })}
                    className="svc-btn-details"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SERVICE CATEGORIES */}
        <section id="svc-categories-list" className="section-padding">
          <div className="svc-container">
            {Object.entries(SERVICES_DATA).map(([category, items]) => (
              <div key={category} id={`cat-${category}`} className="category-block">
                <div className="svc-categories-heading-box">
                  <h2 className="section-title color-accent">
                    <span className="mr-8">
                      {category === 'Abishekam' ? '🪔' : category === 'Homam' ? '🔥' : category === 'Archana' ? '🌸' : category === 'Special Pooja' ? '🎉' : '🐄'}
                    </span>
                    {category} Services
                  </h2>
                </div>
                
                <div className="svc-categories-grid">
                  {items.map((item) => (
                    <article key={item.title} className="puja-card">
                      <div className="puja-card-img-wrap">
                        <img src={item.image} alt={item.title} className="card-img" onError={handleImageError} />
                        <span className="puja-card-badge">
                          ★★★★★
                        </span>
                      </div>
                      <div className="puja-card-body">
                        <h3 className="puja-card-title">{item.title}</h3>
                        <p className="puja-card-desc">
                          {item.description}
                        </p>
                        
                        <div className="puja-card-meta">
                          <span>⏱ {item.duration}</span>
                          <span>📅 {item.bestDay}</span>
                        </div>
                        
                        <div className="svc-btn-group">
                          <button
                            onClick={() => triggerBooking(category, item.title)}
                            className="svc-btn-book"
                          >
                            Book Now
                          </button>
                          <button
                            onClick={() => setModalService({ ...item, category })}
                            className="svc-btn-details"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. GO SEVA SECTION */}
        <section id="cat-Go Seva" className="section-padding bg-dark">
          <div className="svc-container">
            <div className="text-center m-b40">
              <span className="svc-featured-title-kicker">Goshala Support</span>
              <h2 className="section-title">Sacred Go Seva</h2>
            </div>
            
            <div className="svc-goseva-grid">
              {[
                { title: 'Cow Adoption', img: '/assets/img/god/cow.svg', desc: 'Sponsor the lifetime feed, medical care, and maintenance of a temple cow. Receive regular seva updates and monthly archana blessings.' },
                { title: 'Cow Donation', img: '/assets/img/god/cow.svg', desc: 'Contribute funds towards acquiring new cows for our temple goshala or support goshala shelter construction and expansion.' },
                { title: 'Cow Maintenance', img: '/assets/img/god/cow.svg', desc: 'Contribute towards daily fodder, nutritious feed, cleaning, water facility management, and healthcare maintenance of local cows.' }
              ].map((seva) => (
                <div key={seva.title} className="svc-goseva-card">
                  <img src={seva.img} alt={seva.title} className="card-img" />
                  <div className="svc-goseva-card-body">
                    <h3 className="puja-card-title">🐄 {seva.title}</h3>
                    <p className="puja-card-desc">{seva.desc}</p>
                    <button
                      onClick={() => triggerBooking('Go Seva', seva.title)}
                      className="svc-btn svc-btn-primary"
                    >
                      Support Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. BOOKING WIZARD SECTION */}
        <section id="svc-booking" className="section-padding">
          <div className="svc-container svc-container-box">
            
            {bookingStep < 6 && (
              <>
                <h2 className="section-title text-center m-b8">Book a Temple Ritual</h2>
                <p className="svc-spec-label text-center m-b30">
                  Complete the quick steps to schedule your preferred services with the temple team.
                </p>

                {/* Progress Bar */}
                <div className="wizard-progress">
                  <div className="wizard-progress-bar" style={{ width: `${(bookingStep - 1) * 25}%` }}></div>
                  {[1, 2, 3, 4, 5].map((stepNum) => (
                    <div
                      key={stepNum}
                      className={`wizard-dot ${bookingStep === stepNum ? 'active' : bookingStep > stepNum ? 'completed' : ''}`}
                    >
                      {stepNum}
                    </div>
                  ))}
                </div>
              </>
            )}

            <form onSubmit={handleSubmit}>
              {/* STEP 1: CHOOSE SERVICE */}
              {bookingStep === 1 && (
                <div>
                  <h3 className="svc-wizard-heading">
                    Step 1: Select Your Service
                  </h3>
                  
                  <div className="form-group">
                    <label className="svc-spec-label m-b8">Service Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="svc-select-input"
                    >
                      {Object.keys(SERVICES_DATA).map((cat) => (
                        <option key={cat} value={cat} className="svc-optgroup">{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="svc-spec-label m-b8">Select Ritual/Pooja</label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className="svc-select-input"
                    >
                      {SERVICES_DATA[formData.category]?.map((item) => (
                        <option key={item.title} value={item.title} className="svc-optgroup">{item.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2: DEVOTEE CONTACT DETAILS */}
              {bookingStep === 2 && (
                <div>
                  <h3 className="svc-wizard-heading">
                    Step 2: Devotee Contact Information
                  </h3>

                  <div className="form-cols-2">
                    <div className="form-group">
                      <label className="svc-spec-label m-b8">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Primary devotee name"
                        className="svc-select-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="svc-spec-label m-b8">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile number"
                        className="svc-select-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-cols-2">
                    <div className="form-group">
                      <label className="svc-spec-label m-b8">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="yourname@domain.com"
                        className="svc-select-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="svc-spec-label m-b8">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="E.g. Vellore"
                        className="svc-select-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: CATEGORY-SPECIFIC FIELDS + DIVINE DETAILS */}
              {bookingStep === 3 && (
                <div>
                  <h3 className="svc-wizard-heading">
                    Step 3: Service Details & Divine Information
                  </h3>

                  {/* Dynamic Category Fields */}
                  <div style={{ marginBottom: 24, padding: 16, background: 'rgba(255,140,0,0.05)', borderRadius: 8, border: '1px solid rgba(255,140,0,0.1)' }}>
                    <h4 style={{ color: '#ff8c00', marginBottom: 12, fontSize: 14, fontWeight: 600 }}>
                      {formData.category}-Specific Details
                    </h4>
                    <DynamicCategoryFields
                      category={formData.category}
                      formData={formData}
                      onChange={setFormData}
                      errors={formErrors}
                    />
                  </div>

                  {/* Divine Details */}
                  <div style={{ marginTop: 24 }}>
                    <h4 style={{ color: '#f1f5f9', marginBottom: 16, fontSize: 16 }}>Divine Details (Gothram & Birth Star)</h4>
                    <div className="form-cols-3">
                      <div className="form-group">
                        <label className="svc-spec-label m-b8">Gothram</label>
                        <input
                          type="text"
                          name="gothram"
                          value={formData.gothram}
                          onChange={handleInputChange}
                          placeholder="E.g. Kashyapa"
                          className="svc-select-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="svc-spec-label m-b8">Nakshatram</label>
                        <input
                          type="text"
                          name="nakshatram"
                          value={formData.nakshatram}
                          onChange={handleInputChange}
                          placeholder="E.g. Aswini"
                          className="svc-select-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="svc-spec-label m-b8">Rasi</label>
                        <input
                          type="text"
                          name="rasi"
                          value={formData.rasi}
                          onChange={handleInputChange}
                          placeholder="E.g. Mesha"
                          className="svc-select-input"
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: 16 }}>
                      <label className="svc-spec-label m-b8">Family Members (for Sankalpam Chanting)</label>
                      <div className="flex-gap-10">
                        <input
                          type="text"
                          name="familyMembersInput"
                          value={formData.familyMembersInput}
                          onChange={handleInputChange}
                          placeholder="Enter name and press Add"
                          className="svc-select-input"
                        />
                        <button
                          type="button"
                          onClick={addFamilyMember}
                          className="svc-btn svc-btn-primary"
                        >
                          Add
                        </button>
                      </div>

                      {formData.familyMembers.length > 0 && (
                        <div className="svc-members-tag-box">
                          {formData.familyMembers.map((member, idx) => (
                            <span key={idx} className="svc-member-tag">
                              {member}
                              <button
                                type="button"
                                onClick={() => removeFamilyMember(idx)}
                                className="svc-member-remove-btn"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: PREFERRED SCHEDULE */}
              {bookingStep === 4 && (
                <div>
                  <h3 className="svc-wizard-heading">
                    Step 4: Select Schedule & Requests
                  </h3>

                  <div className="form-cols-2">
                    <div className="form-group">
                      <label className="svc-spec-label m-b8">Preferred Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="svc-select-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="svc-spec-label m-b8">Preferred Time Slot</label>
                      <select
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="svc-select-input"
                      >
                        <option value="Morning (7:00 AM - 11:30 AM)">Morning (7:00 AM - 11:30 AM)</option>
                        <option value="Evening (4:30 PM - 8:00 PM)">Evening (4:30 PM - 8:00 PM)</option>
                        <option value="Special Festival Hours">Special Festival Hours</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="svc-spec-label m-b8">Special Requests / Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Write notes about custom options or any other details..."
                      rows="3"
                      className="svc-text-area"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW */}
              {bookingStep === 5 && (
                <div>
                  <h3 className="svc-wizard-heading">
                    Step 5: Review & Submit Booking
                  </h3>

                  <div className="svc-review-box">
                    <div className="svc-review-item"><strong>Ritual Name:</strong> {formData.category} - {formData.service}</div>
                    <div className="svc-review-item"><strong>Devotee:</strong> {formData.name} ({formData.phone})</div>
                    {formData.email && <div className="svc-review-item"><strong>Email:</strong> {formData.email}</div>}
                    {formData.city && <div className="svc-review-item"><strong>City:</strong> {formData.city}</div>}
                    <div className="svc-review-item"><strong>Gothram:</strong> {formData.gothram || '—'} | <strong>Star:</strong> {formData.nakshatram || '—'} | <strong>Rasi:</strong> {formData.rasi || '—'}</div>
                    {formData.familyMembers.length > 0 && (
                      <div className="svc-review-item"><strong>Family Members:</strong> {formData.familyMembers.join(', ')}</div>
                    )}
                    <div className="svc-review-item"><strong>Date:</strong> {formData.date} | <strong>Time slot:</strong> {formData.time}</div>

                    {/* Category-specific review */}
                    {formData.category === 'Abishekam' && (
                      <>
                        <div className="svc-review-item"><strong>Abishekam Type:</strong> {formData.abishekam_type}</div>
                        <div className="svc-review-item"><strong>Sponsor Material:</strong> {formData.sponsor_material}</div>
                        <div className="svc-review-item"><strong>Receive Prasadam:</strong> {formData.receive_prasadam}</div>
                      </>
                    )}
                    {formData.category === 'Archana' && (
                      <>
                        <div className="svc-review-item"><strong>Archana Name:</strong> {formData.archana_name}</div>
                        <div className="svc-review-item"><strong>Number of Names:</strong> {formData.number_of_names}</div>
                        <div className="svc-review-item"><strong>Offer Kumkum:</strong> {formData.offer_kumkum}</div>
                        <div className="svc-review-item"><strong>Flower Type:</strong> {formData.flower_type}</div>
                      </>
                    )}
                    {formData.category === 'Homam' && (
                      <>
                        <div className="svc-review-item"><strong>Homam Purpose:</strong> {formData.homam_purpose}</div>
                        <div className="svc-review-item"><strong>People Attending:</strong> {formData.people_attending}</div>
                        <div className="svc-review-item"><strong>Need Homa Prasadam:</strong> {formData.need_homa_prasadam}</div>
                      </>
                    )}
                    {formData.category === 'Special Pooja' && (
                      <>
                        <div className="svc-review-item"><strong>Occasion:</strong> {formData.occasion}</div>
                        {formData.person_name && <div className="svc-review-item"><strong>Person Name:</strong> {formData.person_name}</div>}
                        {formData.event_date && <div className="svc-review-item"><strong>Event Date:</strong> {formData.event_date}</div>}
                        {formData.marriage_years && <div className="svc-review-item"><strong>Marriage Years:</strong> {formData.marriage_years}</div>}
                        {formData.birthday_age && <div className="svc-review-item"><strong>Birthday Age:</strong> {formData.birthday_age}</div>}
                      </>
                    )}
                    {formData.category === 'Go Seva' && (
                      <>
                        <div className="svc-review-item"><strong>Seva Type:</strong> {formData.seva_type}</div>
                        <div className="svc-review-item"><strong>Donation Type:</strong> {formData.donation_type}</div>
                        <div className="svc-review-item"><strong>Certificate Required:</strong> {formData.certificate_required}</div>
                        {formData.name_on_certificate && <div className="svc-review-item"><strong>Name on Certificate:</strong> {formData.name_on_certificate}</div>}
                      </>
                    )}

                    {formData.message && <div className="svc-review-item"><strong>Notes:</strong> {formData.message}</div>}
                  </div>
                </div>
              )}

              {/* STEP 6: CONFIRMATION (BOOKING SUCCESSFUL) */}
              {bookingStep === 6 && bookingResult && (
                <div className="text-center p-20">
                  <div className="svc-success-icon">✅</div>
                  <h3 className="section-title color-accent m-b10">Booking Successful</h3>
                  <p className="svc-spec-label m-b25">
                    Your booking request has been securely registered in the temple database.
                  </p>

                  <div className="svc-receipt-box">
                    <div className="svc-flex-between">
                      <span className="svc-spec-label">Booking ID:</span>
                      <strong>#{bookingResult.bookingId}</strong>
                    </div>
                    <div className="svc-flex-between">
                      <span className="svc-spec-label">Service:</span>
                      <strong>{bookingResult.service}</strong>
                    </div>
                    <div className="svc-flex-between">
                      <span className="svc-spec-label">Preferred Date:</span>
                      <strong>{bookingResult.date}</strong>
                    </div>
                    <div className="svc-flex-between">
                      <span className="svc-spec-label">Time:</span>
                      <strong>{bookingResult.time}</strong>
                    </div>
                    <div className="svc-flex-between-border">
                      <span className="svc-spec-label">Status:</span>
                      <span className="color-warning font-600">Pending Confirmation</span>
                    </div>
                  </div>

                  <div className="flex-gap-15 justify-center">
                    <button
                      type="button"
                      onClick={downloadReceipt}
                      className="svc-btn svc-btn-success"
                    >
                      📥 Download Receipt
                    </button>
                    <button
                      type="button"
                      onClick={() => { setBookingStep(1); setBookingResult(null); }}
                      className="svc-btn svc-btn-secondary"
                    >
                      Book Another Ritual
                    </button>
                  </div>
                </div>
              )}

              {/* Error messages */}
              {errorMsg && (
                <div className="error-alert">
                  {errorMsg}
                </div>
              )}

              {/* Navigation Action Buttons */}
              {bookingStep < 6 && (
                <div className="wizard-nav-buttons">
                  {bookingStep > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="svc-btn svc-btn-outline"
                    >
                      Previous
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {bookingStep < 5 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="svc-btn svc-btn-primary"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="svc-btn svc-btn-primary gradient-bg"
                    >
                      {isSubmitting ? 'Submitting Request...' : 'Submit Booking'}
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </section>

        {/* 7. TEMPLE INFORMATION */}
        <section className="section-padding bg-dark">
          <div className="svc-container svc-guideline-wrapper">
            <div>
              <span className="svc-featured-title-kicker">Guidelines & Conduct</span>
              <h2 className="section-title m-b20">Temple Guidelines</h2>
              <p className="guideline-copy">
                We welcome you to seek the divine blessings of Goddess Jai Varahi Devi. To maintain the purity, sanctity, and calm of our ashram, we request all devotees to kindly read and follow our simple guidelines.
              </p>
              <ul className="guideline-list">
                <li className="m-b8">Please wear clean, traditional Indian attire (Dhotis/Sarees/Salwars).</li>
                <li className="m-b8">Avoid footwear inside the inner sanctum of the deity.</li>
                <li className="m-b8">Maintain absolute silence and keep mobile phones on silent mode.</li>
                <li className="m-b8">For custom Sankalpam names, report to the desk 15 mins before your time.</li>
              </ul>
            </div>
            <div>
              <img src="/assets/img/god/varahi.png" alt="Varahi Peedam Temple" className="guideline-img" />
            </div>
          </div>
        </section>

        {/* 8. TESTIMONIALS */}
        <section className="section-padding">
          <div className="svc-container">
            <div className="text-center m-b40">
              <span className="svc-featured-title-kicker">Devotee Reviews</span>
              <h2 className="section-title">Devotee Testimonials</h2>
            </div>
            
            <div className="svc-testimonials-grid">
              {[
                { name: 'S. Karthik', loc: 'Vellore', stars: 5, quote: 'The birthday pooja was beautifully arranged. Our whole family felt peaceful and blessed throughout the day.' },
                { name: 'Meena R.', loc: 'Katpadi', stars: 5, quote: 'We booked Pournami homam and saw a clear positive change in our home atmosphere and focus.' },
                { name: 'Raghavan Family', loc: 'Chennai', stars: 5, quote: 'Goshala updates are highly transparent. Happy to support such a dharmic initiative.' }
              ].map((test, index) => (
                <div key={index} className="svc-testimonial-item">
                  <div className="svc-stars m-b15">
                    {Array.from({ length: test.stars }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="testimonial-quote">
                    "{test.quote}"
                  </p>
                  <div>
                    <strong className="testimonial-name">{test.name}</strong>
                    <span className="testimonial-loc">{test.loc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FAQ SECTION */}
        <section className="section-padding bg-dark">
          <div className="svc-container svc-assistance-box">
            <h2 className="section-title text-center m-b40">Frequently Asked Questions</h2>
            
            <div className="svc-faq-wrapper">
              {faqs.map((faq, i) => (
                <div key={i} className="faq-item">
                  <h3
                    className="faq-title"
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  >
                    <span>{faq.q}</span>
                    <span>{activeFaq === i ? '−' : '+'}</span>
                  </h3>
                  <div className={`faq-content ${activeFaq === i ? 'open' : ''}`}>
                    {faq.a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. TEMPLE CONTACT CTA */}
        <section className="section-padding bg-radial text-center">
          <div className="svc-container svc-assistance-box">
            <h2 className="section-title color-accent m-b15">Need Personal Assistance?</h2>
            <p className="assistance-copy">
              Our temple priests and volunteer staff are available daily to clarify pooja doubts, help customize family sankalpams, or assist you with any questions.
            </p>
            <div className="svc-assist-buttons">
              <a href="tel:+919092878389" className="svc-btn svc-btn-primary rounded-btn">
                📞 Call Team
              </a>
              <a href="https://wa.me/919092878389" className="svc-btn-whatsapp" target="_blank" rel="noreferrer">
                💬 WhatsApp Chat
              </a>
              <a href="mailto:info@jaivarahi.org" className="svc-btn svc-btn-outline rounded-btn">
                ✉️ Email Us
              </a>
            </div>
          </div>
        </section>

        {modalService && (
          <div
            className="svc-modal-overlay"
            role="presentation"
            onClick={(event) => {
              if (event.target === event.currentTarget) setModalService(null);
            }}
          >
            <div className="svc-modal-content svc-detail-modal" role="dialog" aria-modal="true" aria-labelledby="svc-detail-title">
              <button
                type="button"
                className="svc-modal-close-btn"
                onClick={() => setModalService(null)}
                aria-label="Close service details"
              >
                ×
              </button>

              <img
                src={modalService.image}
                alt={modalService.title}
                className="svc-detail-modal-image"
                onError={handleImageError}
              />
              <div className="svc-modal-body svc-detail-modal-body">
                <span className="svc-detail-category">{modalService.category}</span>
                <h2 id="svc-detail-title" className="svc-detail-title">{modalService.title}</h2>
                <p className="svc-detail-description">{modalService.description}</p>

                <div className="svc-detail-purpose">
                  <h3>Why this {modalService.category === 'Homam' ? 'Homam' : 'pooja'} is performed</h3>
                  <p>{getServicePurpose(modalService)}</p>
                </div>

                <div className="svc-detail-info-grid">
                  <div><span>Benefits</span><strong>{modalService.benefits}</strong></div>
                  <div><span>Duration</span><strong>{modalService.duration}</strong></div>
                  <div><span>Best day</span><strong>{modalService.bestDay}</strong></div>
                  <div><span>Things to bring</span><strong>{modalService.thingsToBring}</strong></div>
                  <div><span>Dress code</span><strong>{modalService.dressCode}</strong></div>
                </div>

                <div className="svc-detail-actions">
                  <button
                    type="button"
                    className="svc-btn svc-btn-primary rounded-btn"
                    onClick={() => triggerBooking(modalService.category, modalService.title)}
                  >
                    <i className="fa-solid fa-hands-praying mr-8" aria-hidden="true"></i>
                    Book Now
                  </button>
                  <button type="button" className="svc-btn svc-btn-outline rounded-btn" onClick={() => setModalService(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <FloatActions />
      <Footer />

    </>
  );
};

export default Services;

