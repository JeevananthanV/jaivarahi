/**
 * Vedic Astrology Data & Helper Utilities for Devotee Sankalpam
 * Jai Varahi Peedam, Vellore
 */

export const STAR_OPTIONS = [
  "Ashwini (அசுவினி)",
  "Bharani (பரணி)",
  "Krittika (கிருத்திகை)",
  "Rohini (ரோகிணி)",
  "Mrigashira (மிருகசீரிஷம்)",
  "Ardra (திருவாதிரை)",
  "Punarvasu (புனர்பூசம்)",
  "Pushya (பூசம்)",
  "Ashlesha (ஆயில்யம்)",
  "Magha (மகம்)",
  "Poorva Phalguni (பூரம்)",
  "Uttara Phalguni (உத்திரம்)",
  "Hasta (அஸ்தம்)",
  "Chitra (சித்திரை)",
  "Swati (சுவாதி)",
  "Vishakha (விசாகம்)",
  "Anuradha (அனுஷம்)",
  "Jyeshtha (கேட்டை)",
  "Moola (மூலம்)",
  "Poorva Ashadha (பூராடம்)",
  "Uttara Ashadha (உத்திராடம்)",
  "Shravana (திருவோணம்)",
  "Dhanishtha (அவிட்டம்)",
  "Shatabhisha (சதயம்)",
  "Poorva Bhadrapada (பூரட்டாதி)",
  "Uttara Bhadrapada (உத்திரட்டாதி)",
  "Revati (ரேவதி)"
];

export const RASI_OPTIONS = [
  "Mesham (மேஷம்)",
  "Rishabam (ரிஷபம்)",
  "Midhunam (மிதுனம்)",
  "Kadagam (கடகம்)",
  "Simmam (சிம்மம்)",
  "Kanni (கன்னி)",
  "Thulaam (துலாம்)",
  "Viruchigam (விருச்சிகம்)",
  "Dhanusu (தனுசு)",
  "Magaram (மகரம்)",
  "Kumbam (கும்பம்)",
  "Meenam (மீனம்)"
];

export const RELATIONSHIP_OPTIONS = [
  { value: "Self", label: "Self / குடும்ப தலைவர் (Head)" },
  { value: "Spouse", label: "Spouse / மனைவி/கணவர்" },
  { value: "Son", label: "Son / மகன்" },
  { value: "Daughter", label: "Daughter / மகள்" },
  { value: "Father", label: "Father / தந்தை" },
  { value: "Mother", label: "Mother / தாய்" },
  { value: "Brother", label: "Brother / சகோதரர்" },
  { value: "Sister", label: "Sister / சகோதரி" },
  { value: "Father-in-law", label: "Father-in-law / மாமனார்" },
  { value: "Mother-in-law", label: "Mother-in-law / மாமியார்" },
  { value: "Other", label: "Other Family Member / உறவினர்" }
];

export const GOTHRAM_SUGGESTIONS = [
  "Kasyapa (காசியப)",
  "Bharadwaja (பாரத்வாஜ)",
  "Vasishta (வசிஷ்ட)",
  "Vishwamitra (விஸ்வாமித்ர)",
  "Gouthama (கௌதம)",
  "Haritha (ஹரித)",
  "Srivatsa (ஸ்ரீவத்ச)",
  "Sandilya (சாண்டில்ய)",
  "Agastya (அகஸ்திய)",
  "Kaushika (கௌசிக)",
  "Koundinya (கௌண்டின்ய)",
  "Moudgalya (மௌத்கல்ய)",
  "Athreya (ஆத்ரேய)",
  "Jamadagni (ஜமதக்னி)",
  "Siva Gothram (சிவ கோத்ரம்)",
  "Vishnu Gothram (விஷ்ணு கோத்ரம்)"
];

/**
 * Intelligent mapping: 27 Stars to primary default Moon Sign (Rasi)
 */
export const STAR_TO_DEFAULT_RASI_MAP = {
  "Ashwini": "Mesham (மேஷம்)",
  "Bharani": "Mesham (மேஷம்)",
  "Krittika": "Mesham (மேஷம்)", // Padam 1 in Mesham, 2-4 in Rishabam
  "Rohini": "Rishabam (ரிஷபம்)",
  "Mrigashira": "Rishabam (ரிஷபம்)", // Padam 1-2 in Rishabam, 3-4 in Midhunam
  "Ardra": "Midhunam (மிதுனம்)",
  "Punarvasu": "Midhunam (மிதுனம்)", // Padam 1-3 in Midhunam, 4 in Kadagam
  "Pushya": "Kadagam (கடகம்)",
  "Ashlesha": "Kadagam (கடகம்)",
  "Magha": "Simmam (சிம்மம்)",
  "Poorva Phalguni": "Simmam (சிம்மம்)",
  "Uttara Phalguni": "Simmam (சிம்மம்)", // Padam 1 in Simmam, 2-4 in Kanni
  "Hasta": "Kanni (கன்னி)",
  "Chitra": "Kanni (கன்னி)", // Padam 1-2 in Kanni, 3-4 in Thulaam
  "Swati": "Thulaam (துலாம்)",
  "Vishakha": "Thulaam (துலாம்)", // Padam 1-3 in Thulaam, 4 in Viruchigam
  "Anuradha": "Viruchigam (விருச்சிகம்)",
  "Jyeshtha": "Viruchigam (விருச்சிகம்)",
  "Moola": "Dhanusu (தனுசு)",
  "Poorva Ashadha": "Dhanusu (தனுசு)",
  "Uttara Ashadha": "Dhanusu (தனுசு)", // Padam 1 in Dhanusu, 2-4 in Magaram
  "Shravana": "Magaram (மகரம்)",
  "Dhanishtha": "Magaram (மகரம்)", // Padam 1-2 in Magaram, 3-4 in Kumbam
  "Shatabhisha": "Kumbam (கும்பம்)",
  "Poorva Bhadrapada": "Kumbam (கும்பம்)", // Padam 1-3 in Kumbam, 4 in Meenam
  "Uttara Bhadrapada": "Meenam (மீனம்)",
  "Revati": "Meenam (மீனம்)"
};

/**
 * Derives the standard default Rasi from a given Star option string
 */
export function deriveRasiFromStar(starString) {
  if (!starString) return "";
  for (const [starKey, rasiVal] of Object.entries(STAR_TO_DEFAULT_RASI_MAP)) {
    if (starString.toLowerCase().includes(starKey.toLowerCase())) {
      return rasiVal;
    }
  }
  return "";
}

/**
 * Formats a clean, standardized Sankalpam Text for Priest Chanting or WhatsApp confirmation
 */
export function formatSankalpamChantingText(devotee) {
  if (!devotee) return "";
  
  let family = [];
  try {
    if (devotee.family_members) {
      family = typeof devotee.family_members === "string"
        ? JSON.parse(devotee.family_members)
        : devotee.family_members;
    } else if (devotee.parsedFamily) {
      family = devotee.parsedFamily;
    }
  } catch (e) {
    family = [];
  }

  const gothram = devotee.gothram || "சிவ கோத்ரம் / பொது";
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  let text = `🕉️ ஸ்ரீ கோட்டை வாராஹி பீடம் — நித்ய சங்கல்பம்\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📅 தேதி: ${dateStr}\n`;
  text += `🙏 கோத்ரம் (Gothram): ${gothram}\n`;
  text += `👤 குடும்பத் தலைவர் (Head): ${devotee.name} (${devotee.contact || "N/A"})\n`;
  
  if (devotee.father_name || devotee.mother_name) {
    text += `👪 பெற்றோர்: தந்தை: ${devotee.father_name || "-"} | தாய்: ${devotee.mother_name || "-"}\n`;
  }
  
  if (devotee.married_status === "married" && devotee.wedding_date) {
    text += `💍 திருமண நாள்: ${devotee.wedding_date.split("T")[0]}\n`;
  }

  text += `\n📜 சங்கல்ப அர்ச்சனை பெயர்கள் (Family Members):\n`;
  
  if (Array.isArray(family) && family.length > 0) {
    family.forEach((m, idx) => {
      const rel = m.relationship ? `[${m.relationship}] ` : "";
      const star = m.star || "தெரியவில்லை (Unknown)";
      const rasi = m.rasi || "-";
      text += `  ${idx + 1}. ${rel}${m.name || "பெயர் குறிப்பிடப்படவில்லை"} — ${star} | ${rasi}\n`;
    });
  } else {
    text += `  1. [Self] ${devotee.name}\n`;
  }

  if (devotee.note) {
    text += `\n🪔 பிரார்த்தனை / வேண்டுதல்:\n"${devotee.note}"\n`;
  }

  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `✨ ஸ்ரீ வாராஹி அம்பாள் அருள் பரிபூரணமாகக் கிடைக்கட்டும். ஓம் வாராஹ்யை நமஹ! 🙏\n`;

  return text;
}
