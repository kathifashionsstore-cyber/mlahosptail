// ============================================================
// hospitalData.js
// AMULYA NURSING HOME — SERVICES RESTUCTURED DATA FILE WITH 40 CONDITIONS
// ============================================================

export const siteSettingsData = {
  hospitalName: "Amulya Nursing Home",
  tagline: "Center for Trauma, Spine, Polio & Joint Replacements",
  logoUrl: "", 
  faviconUrl: "",
  themePrimaryColor: "#1E7FC2",
  themeAccentColor: "#D81F26",
  themeMode: "light",
  phoneNumbers: [
    { label: "Hospital", number: "+918647223625" },
    { label: "Pharmacy / Medical", number: "+918647228624" },
    { label: "Mobile / WhatsApp", number: "+917383085084" }
  ],
  whatsappNumber: "+917383085084",
  email: "amulyanursinghome@gmail.com",
  address: "Amulya Nursing Home, Guntur Road, Narasaraopet, Guntur District, Andhra Pradesh - 522601",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3830.6795281869477!2d80.05466531486071!3d16.23690698877752!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xb96a69964da6f9a8!2samulya+nursing+home+-+Orthopaedic+Hospital!5e0!3m2!1sen!2s!4v1481314941445",
  mapLat: 16.23690698877752,
  mapLng: 80.05466531486071,
  openingHours: {
    opd: "10:00 AM – 7:00 PM, Monday – Saturday",
    emergency: "24/7, All Days"
  },
  socialLinks: {
    instagram: "https://www.instagram.com/amulya_nursing_home/",
    facebook: "https://www.facebook.com/amulyanursinghome/",
    youtube: "",
    twitter: ""
  },
  footerCredit: "Website designed & developed by WayzenTech | +91 9398724704",
  installPromptEnabled: true,
  maintenanceMode: false
};

export const aboutContentData = {
  storyTitle: "Our Story",
  storyText: "Amulya Nursing Home opened its doors on the 8th of May, 1992, founded by Dr. Chadalavada Aravinda Babu. For over three decades it has anchored specialized joint replacement, trauma rescue, and deformity correction setups in Narasaraopet, serving Palnadu, Guntur, and Prakasam districts. It houses two operation theatres (one major laminar flow theatre and one minor procedure unit), digital X-ray imaging, C-arm intensifiers, and an in-house pharmacy, ensuring complete orthopaedic care under one roof.",
  missionText: "To do service for the Trauma & Emergency Services and to Eradicate Poliomyelitis.",
  visionText: "Detect, Prevent and Educate about Osteoarthritis.",
  founderMessage: "When I started Amulya Nursing Home in 1992, my goal was simple — to bring advanced orthopaedic and trauma care to the people of Narasaraopet without requiring them to travel hours to a bigger city. More than three decades later, that goal hasn't changed. Every patient gets the same care I'd want for my own family.",
  founderPhotoUrl: "",
  facilitiesList: [
    "Two Operation Theatres (one for minor procedures, one for major orthopaedic surgery)",
    "C-Arm Image Intensifier",
    "Laminar Air Flow Theatre",
    "Orthopaedic Fracture Table",
    "Dedicated Trauma & Surgical ICU",
    "Round-the-clock In-House Laboratory",
    "Round-the-clock In-House Pharmacy",
    "Dual Backup Generators",
    "Wheelchair-Accessible Infrastructure",
    "Ambulance Coordination"
  ],
  equipmentByRoom: [
    { room: "Operation Theatre", items: ["O.T. Table", "Lighting System", "Suction Apparatus", "Cautery", "Oxygen Cylinders", "Laminar Air Flow Theatre"] },
    { room: "Intensive Care Unit", items: ["Pulse Oximeter", "Suction Apparatus", "Oxygen Cylinder", "Tourniquet", "Fumigation Machine"] },
    { room: "Wards", items: ["BP Apparatus", "Thermometer", "Water Bed", "Weighing Machine", "Nebuliser"] },
    { room: "Lab / Radiology", items: ["Auto Analyser", "Centrifuge", "UPS Power Backup", "X-Ray 300 MA", "X-Ray 60 MA"] }
  ]
};

export const awardsData = [
  { title: "Dr. Yathirajulu Gold Medal for Orthopaedics", year: "", issuedBy: "Governor of Andhra Pradesh", imageUrl: "", order: 1, isActive: true }
];

export const statisticsData = [
  { label: "Years of Service", value: 33, suffix: "+", icon: "Calendar", order: 1, isActive: true },
  { label: "Successful Surgeries", value: 10000, suffix: "+", icon: "Activity", order: 2, isActive: true },
  { label: "Expert Doctors", value: 7, suffix: "", icon: "Stethoscope", order: 3, isActive: true },
  { label: "Happy Patients", value: 25000, suffix: "+", icon: "Smile", order: 4, isActive: true }
];

export const whyChooseUsData = [
  { icon: "ShieldCheck", title: "33+ Years of Trusted Care", description: "Three decades of specialized orthopaedic and trauma expertise in Narasaraopet, serving Palnadu, Guntur, and Prakasam districts.", order: 1, isActive: true },
  { icon: "Award", title: "UK-Trained Founder Surgeon", description: "Dr. Chadalavada Aravinda Babu, recipient of the Dr. Yathirajulu Gold Medal for Orthopaedics, trained at Queen Park Hospital, Manchester, UK.", order: 2, isActive: true },
  { icon: "Siren", title: "24/7 Emergency & Trauma Care", description: "Round-the-clock casualty services with a dedicated trauma ICU, never closed, never delayed.", order: 3, isActive: true },
  { icon: "Building2", title: "Complete In-House Infrastructure", description: "Two operation theatres, C-arm imaging, in-house laboratory, and 24-hour pharmacy — all under one roof.", order: 4, isActive: true },
  { icon: "HeartHandshake", title: "Insurance & Government Scheme Support", description: "Accepted at Aarogyasri, EHS, WJHS, and CM Relief Fund — our team helps you navigate coverage.", order: 5, isActive: true },
  { icon: "Users", title: "A Multi-Specialty Visiting Team", description: "Beyond orthopaedics, our visiting consultants cover pulmonology, dermatology, and general medicine.", order: 6, isActive: true }
];

export const departmentsData = [
  { name: "Orthopaedics & Joint Replacement", slug: "orthopaedics", icon: "Bone", description: "Comprehensive bone, joint, and mobility care, including knee and hip replacement.", order: 1, isActive: true },
  { name: "Spine Care", slug: "spine", icon: "Activity", description: "Spine surgery including modern minimally invasive (keyhole) techniques.", order: 2, isActive: true },
  { name: "Trauma & Emergency", slug: "trauma", icon: "Siren", description: "24/7 fracture and trauma management using advanced fixation systems.", order: 3, isActive: true },
  { name: "Specialty Institutional Programs", slug: "specialty-programs", icon: "HeartHandshake", description: "Polio correction and cerebral palsy orthopaedic support — part of our founding mission.", order: 4, isActive: true },
  { name: "General Orthopaedic Care", slug: "general-ortho", icon: "Footprints", description: "Sports injuries, arthritis management, diabetic foot care, and ligament reconstruction.", order: 5, isActive: true },
  { name: "Pulmonology", slug: "pulmonology", icon: "Wind", description: "Chest and respiratory consultation with our visiting pulmonologist.", order: 6, isActive: true },
  { name: "Dermatology", slug: "dermatology", icon: "Sparkles", description: "Skin, hair, and cosmetic dermatology consultation.", order: 7, isActive: true },
  { name: "General Medicine", slug: "general-medicine", icon: "Stethoscope", description: "Everyday general health concerns and outpatient care.", order: 8, isActive: true }
];

export const doctorsData = [
  {
    id: "dr-aravinda-babu",
    name: "Dr. Chadalavada Aravinda Babu",
    qualification: "M.B.B.S, M.S. (Ortho)",
    designation: "Founder & Chief Surgeon",
    specialization: ["Primary Joint Replacement", "Revision Joint Replacement", "Polio Correction Surgery", "Complex Skeletal Reconstruction", "Ilizarov Ring Fixations"],
    experienceYears: 33,
    languages: ["Telugu", "English"],
    photoUrl: "",
    bio: "Dr. Chadalavada Aravinda Babu founded Amulya Nursing Home in 1992. He completed his M.S. Orthopaedics at Queen Park Hospital, Manchester, UK, and was awarded the Dr. Yathirajulu Gold Medal. He is widely recognized for deformity correction and trauma salvage.",
    consultationTimings: "10:00 AM – 7:00 PM, Monday – Saturday",
    consultationDays: ["Mon","Tue","Wed","Thu","Fri","Sat"],
    department: "orthopaedics",
    awards: ["Dr. Yathirajulu Gold Medal for Orthopaedics"],
    order: 1,
    isActive: true,
    isFeaturedOnHome: true
  },
  {
    id: "dr-aditya",
    name: "Dr. Chadalavada Aditya",
    qualification: "M.S. (Ortho), F.I.S.S (Spine)",
    designation: "Senior Spine Consultant",
    specialization: ["Microdiscectomy", "Minimally Invasive Spine Surgery (MISS)", "Scoliosis Deformity Correction", "Spine Fusion & Fixation"],
    experienceYears: 8,
    languages: ["English", "Telugu"],
    photoUrl: "",
    bio: "Dr. Chadalavada Aditya is a fellowship-trained spine specialist. He coordinates the spine care wing at Amulya Nursing Home, focusing on MISS, discectomy, and spinal fusion procedures.",
    consultationTimings: "10:00 AM – 5:00 PM",
    consultationDays: ["Mon","Tue","Wed","Thu","Fri","Sat"],
    department: "spine",
    awards: [],
    order: 2,
    isActive: true,
    isFeaturedOnHome: true
  },
  {
    id: "dr-rambabu",
    name: "Dr. K. Rambabu",
    qualification: "M.B.B.S, D.A",
    designation: "Consultant Anaesthesiologist",
    specialization: ["Regional Anaesthesia", "Critical Care Medicine", "Pain Management Protocols"],
    experienceYears: 18,
    languages: ["Telugu", "English"],
    photoUrl: "",
    bio: "Dr. K. Rambabu directs critical care anesthesia protocols, managing the sterile operation theatre environments and acute pain management pathways.",
    consultationTimings: "24/7 emergency calls",
    consultationDays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    department: "trauma",
    awards: [],
    order: 3,
    isActive: true,
    isFeaturedOnHome: false
  },
  {
    id: "dr-krishna-mohan",
    name: "Dr. K. Krishna Mohan",
    qualification: "M.D. (TDD)",
    designation: "Visiting Pulmonologist",
    specialization: ["Chronic Asthma Management", "COPD Care", "Tuberculosis & Respiratory Infections"],
    experienceYears: 15,
    languages: ["Telugu", "English"],
    photoUrl: "",
    bio: "Dr. K. Krishna Mohan is a senior pulmonologist visiting weekly to manage chronic respiratory, chest, and asthma cases.",
    consultationTimings: "12:00 PM – 4:00 PM, Thursday",
    consultationDays: ["Thu"],
    department: "pulmonology",
    awards: [],
    order: 4,
    isActive: true,
    isFeaturedOnHome: false
  },
  {
    id: "dr-poornima-sridevi",
    name: "Dr. P. Poornima Sridevi",
    qualification: "M.D. (DVL)",
    designation: "Visiting Dermatologist",
    specialization: ["Cosmetic Dermatology", "Acne & Scarring Treatments", "Chronic Skin Diseases Management"],
    experienceYears: 12,
    languages: ["English", "Telugu"],
    photoUrl: "",
    bio: "Dr. P. Poornima Sridevi handles our dermatology and cosmetic skincare programs on visiting schedules.",
    consultationTimings: "10:30 AM – 2:00 PM, Saturday",
    consultationDays: ["Sat"],
    department: "dermatology",
    awards: [],
    order: 5,
    isActive: true,
    isFeaturedOnHome: false
  },
  {
    id: "dr-sk-galib",
    name: "Dr. SK. Galib",
    qualification: "M.D. (General Medicine)",
    designation: "Visiting Physician",
    specialization: ["Hypertension", "Diabetes Management", "Post-op Medical Management"],
    experienceYears: 14,
    languages: ["English", "Telugu"],
    photoUrl: "",
    bio: "Dr. SK. Galib provides general medicine consults, balancing metabolic parameters like blood sugar and pressure for pre-surgical and post-surgical cases.",
    consultationTimings: "10:00 AM – 7:00 PM",
    consultationDays: ["Mon","Tue","Wed","Thu","Fri","Sat"],
    department: "general-medicine",
    awards: [],
    order: 6,
    isActive: true,
    isFeaturedOnHome: false
  },
  {
    id: "dr-rama-mohan",
    name: "Dr. A. Rama Mohan",
    qualification: "M.B.B.S",
    designation: "Medical Officer",
    specialization: ["Admissions", "Diagnostics", "Casualty Stabilization"],
    experienceYears: 0,
    languages: ["English", "Telugu"],
    photoUrl: "",
    bio: "Dr. A. Rama Mohan is a General Medical Officer at Amulya Nursing Home, managing day-to-day admissions, diagnostics tracking, and casualty stabilization.",
    consultationTimings: "24/7 duty rotation",
    consultationDays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    department: "general-medicine",
    awards: [],
    order: 7,
    isActive: true,
    isFeaturedOnHome: false
  }
];

export const heroSlidesData = [
  { heading: "33+ Years of Trusted Orthopaedic Care", subheading: "Led by Dr. Chadalavada Aravinda Babu, Founder & Chief Orthopaedic Surgeon, MLA Narasaraopet", badgeText: "Since 1992", ctaText: "Book Appointment", ctaLink: "/book-appointment", imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=85", isPlaceholder: true, order: 1, isActive: true },
  { heading: "Total Knee & Hip Replacement", subheading: "Minimally invasive joint replacement surgery with advanced implant options", badgeText: "Orthopaedic Surgery", ctaText: "View Services", ctaLink: "/services/orthopaedics/knee-pain", imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1400&q=85", isPlaceholder: true, order: 2, isActive: true },
  { heading: "24/7 Trauma & Emergency Care", subheading: "Round-the-clock casualty services with in-house ICU, C-Arm imaging, and Swiss AO fixation systems", badgeText: "24/7 Emergency", ctaText: "Emergency Contact", ctaLink: "/contact", imageUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1400&q=85", isPlaceholder: true, order: 3, isActive: true },
  { heading: "Spine Surgery, Including Keyhole Techniques", subheading: "Led by Dr. Chadalavada Aditya, Fellowship-trained Spine Surgeon (FISS)", badgeText: "Spine Care", ctaText: "Learn More", ctaLink: "/services/orthopaedics/back-pain", imageUrl: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=1400&q=85", isPlaceholder: true, order: 4, isActive: true },
  { heading: "Our Founding Mission: Polio Deformity Correction", subheading: "Specialized care for polio correction and post-polio syndrome since 1992", badgeText: "Institutional Program", ctaText: "Learn More", ctaLink: "/services/orthopaedics/polio-deformity", imageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1400&q=85", isPlaceholder: true, order: 5, isActive: true }
];

export const serviceCategoriesData = [
  { name: "Orthopaedics, Spine & Trauma Care", slug: "orthopaedics", description: "Comprehensive bone, joint, spine, and skeletal trauma sitemap", order: 1, isActive: true }
];

// ============================================================
// TREATMENTS (DEPRECATED - Moved to Services)
// ============================================================
export const treatmentsData = [];

// ============================================================
// SERVICES (40 Condition Pages under Orthopaedics, Spine & Trauma Care)
// ============================================================
export const servicesData = [
  // --- 1. General Bone & Joint Health ---
  {
    name: "Osteoporosis",
    slug: "osteoporosis",
    category: "orthopaedics",
    categoryId: "orthopaedics",
    cluster: "bone-health",
    metaTitle: "Osteoporosis Treatment in Narasaraopet | Amulya Nursing Home",
    metaDescription: "Expert diagnosis and treatment for osteoporosis and weak bones — bone density testing, medication, and fracture prevention at Amulya Nursing Home.",
    heroHeadline: "Stronger Bones, Safer Years Ahead",
    heroSubheading: "Comprehensive osteoporosis screening and treatment to prevent fractures before they happen.",
    description: "Osteoporosis is a condition where bones become weak, brittle, and porous, making them much more likely to fracture — often from a minor fall or even a simple cough or bend. It develops silently over years as bone density decreases faster than the body can rebuild it, which is why it's often called a \"silent disease.\" Most people don't know they have osteoporosis until they suffer a fracture, commonly in the hip, spine, or wrist. Bone is living tissue that is constantly being broken down and rebuilt. In osteoporosis, the rebuilding process slows down while breakdown continues, leading to a net loss of bone mass and a weakened internal bone structure. Women, especially after menopause, are at significantly higher risk due to the drop in estrogen, which plays a key role in maintaining bone density. At Amulya Nursing Home, we focus on early detection through bone density screening, so we can intervene before a fracture occurs rather than only treating the aftermath.",
    types: [
      { name: "Primary Osteoporosis", detail: "Age-related, most common in postmenopausal women and older men" },
      { name: "Secondary Osteoporosis", detail: "Caused by another condition or medication (e.g., steroid use, thyroid disorders, kidney disease)" },
      { name: "Osteopenia", detail: "A milder, earlier-stage form of bone density loss that can progress to osteoporosis if untreated" }
    ],
    causes: [
      "Aging — bone density naturally decreases after age 30",
      "Menopause — drop in estrogen accelerates bone loss in women",
      "Family history of osteoporosis or fractures",
      "Long-term use of steroid medications",
      "Low calcium and vitamin D intake over many years",
      "Sedentary lifestyle with little weight-bearing exercise",
      "Smoking and excessive alcohol consumption",
      "Low body weight or small body frame",
      "Certain conditions — thyroid disorders, rheumatoid arthritis, celiac disease",
      "Early menopause or surgical removal of ovaries"
    ],
    symptoms: [
      "Often no symptoms until a fracture occurs",
      "Back pain caused by a collapsed or fractured vertebra",
      "Gradual loss of height over time",
      "Stooped posture (kyphosis)",
      "A bone that fractures much more easily than expected",
      "Brittle nails as a possible early indicator",
      "Receding gums in some cases"
    ],
    diagnosis: [
      "Bone Density Test (DEXA Scan) — The gold-standard test measuring bone mineral density, usually at the hip and spine",
      "X-rays — To check for existing fractures or visible bone thinning",
      "Blood Tests — To rule out secondary causes like thyroid or calcium/vitamin D deficiencies",
      "FRAX Score Assessment — Calculates 10-year fracture risk based on age, weight, and risk factors",
      "Physical Examination — Checking posture, height loss, and mobility"
    ],
    treatmentOptions: {
      nonSurgical: [
        "Calcium & Vitamin D Supplementation — Foundation of treatment to support bone rebuilding",
        "Bisphosphonate Medications — Slow down bone breakdown and reduce fracture risk",
        "Hormone-Related Therapy — For select postmenopausal women, under specialist guidance",
        "Weight-Bearing Exercise Program — Customized physiotherapy to strengthen bone and improve balance",
        "Fall-Prevention Counseling — Home safety assessment to reduce fracture risk"
      ],
      surgical: [
        "Vertebroplasty/Kyphoplasty — Minimally invasive cement injection to stabilize a fractured vertebra",
        "Fracture Fixation — Surgical stabilization of hip or wrist fractures using plates, screws, or rods",
        "Joint Replacement — In cases of severe joint damage from repeated fractures"
      ]
    },
    whyChooseUs: [
      "On-site DEXA bone density screening",
      "Specialists experienced in fragility fracture management",
      "Combined orthopaedic and rehabilitation approach",
      "Personalized fracture-risk assessment for every patient",
      "Swiss AO-standard fixation systems for fracture cases",
      "Dedicated physiotherapy for post-fracture recovery"
    ],
    prevention: [
      "Get adequate calcium (dairy, leafy greens) and vitamin D (sunlight, supplements)",
      "Engage in regular weight-bearing exercise — walking, light resistance training",
      "Avoid smoking and limit alcohol intake",
      "Remove fall hazards at home (loose rugs, poor lighting, clutter)",
      "Get a bone density test after age 50, or earlier if at risk",
      "Review medications with your doctor if you're on long-term steroids",
      "Maintain a healthy body weight"
    ],
    whenToSeeDoctor: [
      "You've had a fracture from a minor fall or bump",
      "You've noticeably lost height or developed a stooped posture",
      "You have a family history of osteoporosis or hip fracture",
      "You're postmenopausal and haven't had a bone density screening",
      "You're on long-term steroid medication",
      "You experience sudden, unexplained back pain"
    ],
    faqs: [
      { question: "Is osteoporosis only a women's disease?", answer: "No. While postmenopausal women are at higher risk due to hormonal changes, men can and do develop osteoporosis too, especially with aging, steroid use, or other underlying conditions." },
      { question: "Can osteoporosis be reversed?", answer: "Bone density lost to osteoporosis is difficult to fully reverse, but treatment can significantly slow further loss, rebuild some bone density, and dramatically reduce fracture risk." },
      { question: "At what age should I get a bone density test?", answer: "Generally recommended from age 50 for women (or earlier after menopause) and from age 60-65 for men, though it should be earlier if you have risk factors." },
      { question: "Does osteoporosis cause pain?", answer: "Osteoporosis itself is usually painless until a fracture occurs. Sudden back pain in older adults can sometimes indicate a vertebral compression fracture." },
      { question: "Can I still exercise if I have osteoporosis?", answer: "Yes, and you should — weight-bearing and resistance exercises actually help strengthen bone, though high-impact or high-fall-risk activities should be modified under guidance." },
      { question: "How long does osteoporosis medication need to be taken?", answer: "This varies by individual and medication type — typically several years, with periodic reassessment by your doctor." },
      { question: "Is a hip fracture from osteoporosis serious?", answer: "Yes, hip fractures in older adults are a major medical concern requiring prompt surgical fixation and structured rehabilitation to restore mobility and prevent complications." },
      { question: "Can diet alone prevent osteoporosis?", answer: "Diet is an important foundation, but for those already diagnosed, medication and monitoring are usually also necessary alongside good nutrition." }
    ],
    relatedDoctorIds: ["dr-aravinda-babu"],
    relatedConditions: [{ name: "Arthritis (Osteoarthritis)", slug: "arthritis-osteoarthritis" }, { name: "Fractures", slug: "fractures" }]
  },
  {
    name: "Arthritis (Osteoarthritis)",
    slug: "arthritis-osteoarthritis",
    category: "orthopaedics",
    categoryId: "orthopaedics",
    cluster: "bone-health",
    metaTitle: "Arthritis & Osteoarthritis Treatment in Narasaraopet | Amulya Nursing Home",
    metaDescription: "Advanced osteoarthritis care — from physiotherapy and pain management to joint replacement — at Amulya Nursing Home's Spine, Joint & Trauma Care center.",
    heroHeadline: "Move Freely Again — Without the Pain",
    heroSubheading: "Complete osteoarthritis care, from early management to advanced joint replacement.",
    description: "Osteoarthritis is the most common form of arthritis, caused by the gradual wear-and-tear of the protective cartilage that cushions the ends of bones within a joint. As this cartilage breaks down over time, bones begin to rub against each other, causing pain, stiffness, swelling, and reduced range of motion. It most commonly affects the knees, hips, hands, and spine. Unlike inflammatory forms of arthritis, osteoarthritis is primarily a mechanical and degenerative condition, though inflammation can still occur in and around the affected joint. It tends to develop slowly and worsen over years, often becoming more noticeable with age, prior joint injury, or repetitive joint stress. At Amulya Nursing Home, treatment is staged — starting with conservative management and escalating to joint replacement surgery only when non-surgical options no longer provide adequate relief.",
    types: [
      { name: "Mild (Early Stage)", detail: "Occasional stiffness, minor cartilage thinning visible on imaging" },
      { name: "Moderate", detail: "More frequent pain, visible joint space narrowing, some bone spurs" },
      { name: "Severe (Advanced)", detail: "Significant cartilage loss, bone-on-bone contact, major mobility limitation" }
    ],
    causes: [
      "Aging — cumulative joint wear over decades",
      "Obesity — extra weight increases load on weight-bearing joints",
      "Previous joint injury or surgery",
      "Repetitive stress from occupation or sports",
      "Joint malalignment (bow legs, knock knees)",
      "Genetics and family history",
      "Muscle weakness around the joint",
      "Gender — women are more commonly affected, especially after menopause"
    ],
    symptoms: [
      "Joint pain that worsens with activity and improves with rest",
      "Stiffness, especially in the morning or after sitting",
      "Swelling around the affected joint",
      "A grating or crackling sensation (crepitus) during movement",
      "Reduced range of motion",
      "Joint instability or a feeling of \"giving way\"",
      "Visible joint enlargement in advanced cases"
    ],
    diagnosis: [
      "Clinical Examination — Assessing pain, swelling, range of motion, and joint stability",
      "X-rays — To visualize joint space narrowing, bone spurs, and cartilage loss",
      "MRI — For detailed soft tissue and cartilage assessment in select cases",
      "Blood Tests — To rule out inflammatory arthritis (rheumatoid arthritis, gout)",
      "Joint Fluid Analysis — Occasionally used to rule out infection or crystal-induced arthritis"
    ],
    treatmentOptions: {
      nonSurgical: [
        "Physiotherapy & Exercise Therapy — Strengthening muscles around the joint to reduce load",
        "Weight Management — Reducing stress on weight-bearing joints",
        "Pain Management — Anti-inflammatory medication and topical treatments",
        "Intra-Articular Injections — Corticosteroid or viscosupplementation injections for symptom relief",
        "Bracing & Assistive Devices — Knee braces, walking aids to offload the joint"
      ],
      surgical: [
        "Arthroscopic Debridement — Keyhole cleanup of damaged cartilage fragments in select cases",
        "Partial (Unicondylar) Joint Replacement — For arthritis limited to one part of the joint",
        "Total Joint Replacement — Full resurfacing for advanced, bone-on-bone arthritis",
        "Osteotomy — Realigning bone to shift weight away from damaged cartilage in younger patients"
      ]
    },
    whyChooseUs: [
      "Dedicated joint replacement program with Total, Unicondylar, and Revision options",
      "Staged treatment approach — surgery is never the first or only option offered",
      "In-house physiotherapy and rehabilitation",
      "Experienced surgical team with strong post-operative recovery protocols",
      "Transparent discussion of risks, benefits, and alternatives before any surgery"
    ],
    prevention: [
      "Maintain a healthy weight to reduce joint stress",
      "Stay active with low-impact exercise — swimming, cycling, walking",
      "Strengthen muscles supporting major joints",
      "Avoid prolonged repetitive stress on any one joint",
      "Use proper footwear and joint-supportive techniques during activity",
      "Apply heat/cold therapy for symptom flare-ups",
      "Don't ignore early stiffness — early management slows progression"
    ],
    whenToSeeDoctor: [
      "Joint pain persisting longer than a few weeks",
      "Pain that interferes with daily activities or sleep",
      "Visible swelling, redness, or warmth around a joint",
      "A joint that feels unstable or \"locks\"",
      "Reduced ability to walk, climb stairs, or grip objects",
      "No relief from over-the-counter pain medication"
    ],
    faqs: [
      { question: "Is osteoarthritis the same as rheumatoid arthritis?", answer: "No. Osteoarthritis is a wear-and-tear, mechanical condition, while rheumatoid arthritis is an autoimmune disease where the body's immune system attacks joint tissue. They require different treatment approaches." },
      { question: "Can osteoarthritis be cured?", answer: "There's no cure that reverses cartilage damage, but symptoms can be very effectively managed, and joint replacement surgery can restore near-normal function in advanced cases." },
      { question: "Do I need surgery for arthritis?", answer: "Most people manage osteoarthritis successfully with non-surgical care for years. Surgery is considered only when pain and disability significantly affect quality of life despite conservative treatment." },
      { question: "Is walking bad for arthritic knees?", answer: "No — moderate walking is generally beneficial as it strengthens supporting muscles and maintains joint mobility, unless your doctor advises otherwise for your specific case." },
      { question: "How long does recovery take after joint replacement?", answer: "Most patients begin walking with support within a day or two, with significant recovery over 4-6 weeks and continued improvement over 3-6 months with physiotherapy." },
      { question: "Can young people get osteoarthritis?", answer: "Yes, particularly after a significant joint injury, repetitive joint stress, or due to joint malalignment, though it's more common with age." },
      { question: "Are injections a permanent solution?", answer: "Corticosteroid and viscosupplementation injections provide temporary relief, typically lasting weeks to months, and are often used alongside other treatments rather than as a standalone permanent fix." }
    ],
    relatedDoctorIds: ["dr-aravinda-babu"],
    relatedConditions: [{ name: "Knee Pain", slug: "knee-pain" }, { name: "Hip Pain", slug: "hip-pain" }]
  },
  {
    name: "Rheumatoid Arthritis",
    slug: "rheumatoid-arthritis",
    category: "orthopaedics",
    categoryId: "orthopaedics",
    cluster: "bone-health",
    metaTitle: "Rheumatoid Arthritis Treatment in Narasaraopet | Amulya Nursing Home",
    metaDescription: "Specialized care for rheumatoid arthritis — joint protection, medication management, and surgical correction for joint deformity.",
    heroHeadline: "Managing Rheumatoid Arthritis, Protecting Your Joints",
    heroSubheading: "Coordinated orthopaedic care to manage symptoms and prevent long-term joint damage.",
    description: "Rheumatoid arthritis (RA) is a chronic autoimmune condition in which the body's immune system mistakenly attacks the lining of the joints (the synovium), causing inflammation, pain, and progressive joint damage. Unlike osteoarthritis, RA is a systemic disease that can affect multiple joints simultaneously and symmetrically — often the hands, wrists, and feet first — and can also impact other organs. If left inadequately managed, the chronic inflammation can erode cartilage and bone, leading to joint deformity and significant disability over time. Early diagnosis and consistent treatment are critical to slowing disease progression and preserving joint function. Our orthopaedic team works alongside rheumatology management to address the joint-specific complications of RA — from preventive joint protection strategies to corrective surgery when deformity has already occurred.",
    causes: [
      "Autoimmune dysfunction — exact trigger often unclear",
      "Genetic predisposition and family history",
      "Gender — significantly more common in women",
      "Smoking — a strong modifiable risk factor",
      "Age — most commonly begins between 30-60 years",
      "Obesity, which may worsen joint stress and inflammation",
      "Environmental factors and certain infections as potential triggers"
    ],
    symptoms: [
      "Joint pain, swelling, and warmth, often symmetrical (both hands, both knees)",
      "Morning stiffness lasting more than 30 minutes",
      "Fatigue and general feeling of being unwell",
      "Joint deformity in advanced, poorly controlled disease",
      "Reduced grip strength and hand function",
      "Low-grade fever during flare-ups",
      "Small lumps (rheumatoid nodules) near joints in some patients"
    ],
    diagnosis: [
      "Blood Tests — Rheumatoid factor (RF), anti-CCP antibodies, inflammatory markers (ESR, CRP)",
      "X-rays — To assess joint erosion and damage progression",
      "Ultrasound/MRI — To detect early synovial inflammation not visible on X-ray",
      "Clinical Joint Assessment — Pattern and symmetry of joint involvement",
      "Coordination with Rheumatology — For systemic disease activity monitoring"
    ],
    treatmentOptions: {
      nonSurgical: [
        "Physiotherapy & Occupational Therapy — Maintaining joint mobility and hand function",
        "Splinting & Joint Support — Protecting inflamed joints during flares",
        "Activity Modification Guidance — Reducing strain on vulnerable joints",
        "Coordinated Medication Management — Working alongside rheumatology-prescribed disease-modifying therapy"
      ],
      surgical: [
        "Synovectomy — Removing severely inflamed joint lining to reduce damage",
        "Tendon Repair/Reconstruction — For tendon ruptures common in RA hands",
        "Joint Replacement — For joints with severe, irreversible damage (commonly knee, hip, hand joints)",
        "Joint Fusion — For severely unstable small joints where replacement isn't suitable"
      ]
    },
    whyChooseUs: [
      "Orthopaedic expertise specifically in RA-related joint complications",
      "Joint-preserving approach wherever possible",
      "Hand and small joint surgical experience",
      "Integrated physiotherapy for function preservation",
      "Long-term joint monitoring to catch deformity early"
    ],
    prevention: [
      "Stay consistent with prescribed medication, even during symptom-free periods",
      "Use splints or supports during flare-ups as advised",
      "Practice gentle range-of-motion exercises daily",
      "Avoid smoking, which worsens RA severity",
      "Balance rest and activity — avoid both overexertion and prolonged inactivity",
      "Apply heat for stiffness and cold for active swelling",
      "Get regular check-ups to monitor for early joint damage"
    ],
    whenToSeeDoctor: [
      "New, persistent joint swelling lasting more than a few weeks",
      "Symmetrical joint pain affecting both sides of the body",
      "Morning stiffness lasting longer than 30 minutes",
      "Visible joint deformity or loss of hand function",
      "Sudden worsening of joint pain despite ongoing treatment"
    ],
    faqs: [
      { question: "Is rheumatoid arthritis the same as old-age arthritis?", answer: "No, RA is an autoimmune disease that can begin at any adult age, unlike osteoarthritis which is primarily age-related wear and tear." },
      { question: "Can rheumatoid arthritis be cured?", answer: "There is currently no cure, but modern disease-modifying treatment combined with joint protection can control symptoms well and significantly slow joint damage." },
      { question: "Will I eventually need joint replacement?", answer: "Not necessarily — with early, consistent treatment, many people with RA avoid significant joint damage. Surgery is considered only when joints are already significantly affected." },
      { question: "Does RA only affect joints?", answer: "While joints are most visibly affected, RA is a systemic condition that can also involve the lungs, heart, eyes, and skin in some patients, which is why coordinated care with a rheumatologist matters." },
      { question: "Is exercise safe with rheumatoid arthritis?", answer: "Yes, gentle, low-impact exercise is generally recommended to maintain joint mobility and muscle strength, with adjustments during active flares." }
    ],
    relatedDoctorIds: ["dr-aravinda-babu"],
    relatedConditions: [{ name: "Arthritis (Osteoarthritis)", slug: "arthritis-osteoarthritis" }, { name: "Joint Pain", slug: "joint-pain" }]
  },
  {
    name: "Gout",
    slug: "gout",
    category: "orthopaedics",
    categoryId: "orthopaedics",
    cluster: "bone-health",
    metaTitle: "Gout Treatment in Narasaraopet | Amulya Nursing Home",
    metaDescription: "Fast relief and long-term management for gout attacks — diagnosis, treatment, and joint care at Amulya Nursing Home.",
    heroHeadline: "Quick Relief From Painful Gout Attacks",
    heroSubheading: "Rapid diagnosis and management to control flare-ups and prevent joint damage.",
    description: "Gout is a form of inflammatory arthritis caused by the buildup of uric acid crystals within a joint, most classically the big toe. It typically presents as sudden, intense pain, swelling, and redness in the affected joint, often striking at night and reaching peak severity within hours. Uric acid is a natural waste product, but when levels in the blood become too high (hyperugelemia), it can crystallize and deposit in joints, triggering an intense inflammatory response. Without management, gout can become recurrent and, over time, lead to chronic joint damage and visible uric acid deposits called tophi. At Amulya Nursing Home, we focus on both rapid relief during an acute attack and long-term strategies to prevent recurrence and protect joint health.",
    causes: [
      "High uric acid levels in the blood (hyperuricemia)",
      "Diet high in red meat, organ meats, and seafood",
      "Excessive alcohol consumption, especially beer",
      "Obesity and metabolic syndrome",
      "Family history of gout",
      "Certain medications (some diuretics)",
      "Kidney disease affecting uric acid excretion",
      "Dehydration"
    ],
    symptoms: [
      "Sudden, severe joint pain — classically the big toe",
      "Intense swelling, redness, and warmth in the joint",
      "Pain so severe that even light touch is unbearable",
      "Symptoms often peaking within 12-24 hours of onset",
      "Recurring attacks if untreated",
      "Visible lumps (tophi) under the skin in chronic, long-standing gout"
    ],
    diagnosis: [
      "Joint Fluid Analysis — Confirms uric acid crystals, the definitive diagnostic test",
      "Blood Test — Measuring serum uric acid levels",
      "X-rays — To check for joint damage in recurrent or long-standing cases",
      "Ultrasound — Can detect early crystal deposits and inflammation",
      "Clinical Pattern Assessment — Sudden onset and joint involvement pattern"
    ],
    treatmentOptions: {
      nonSurgical: [
        "Anti-Inflammatory Medication — To rapidly reduce pain and swelling",
        "Rest & Elevation — Minimizing joint stress during the flare",
        "Cold Therapy — Applied to reduce inflammation and discomfort",
        "Uric Acid-Lowering Medication — To prevent future attacks and crystal buildup",
        "Dietary Counseling — Identifying and reducing trigger foods"
      ],
      surgical: [
        "Tophi Removal — Surgical excision of large uric acid deposits affecting joint function"
      ]
    },
    whyChooseUs: [
      "Rapid-access OPD for acute gout flares",
      "In-house lab for quick uric acid and joint fluid testing",
      "Long-term management plans, not just flare-up treatment",
      "Dietary and lifestyle counseling included in care"
    ],
    prevention: [
      "Limit red meat, organ meats, and shellfish",
      "Reduce or avoid alcohol, especially beer",
      "Stay well-hydrated throughout the day",
      "Maintain a healthy body weight",
      "Take prescribed uric acid-lowering medication consistently, not just during flares",
      "Avoid crash dieting, which can temporarily raise uric acid levels"
    ],
    whenToSeeDoctor: [
      "Sudden, severe joint pain, especially in the big toe",
      "Recurring joint pain episodes",
      "Visible lumps near joints",
      "Fever accompanying joint pain (to rule out infection)",
      "Joint pain not improving with over-the-counter medication"
    ],
    faqs: [
      { question: "Is gout caused only by diet?", answer: "Diet is a major contributing factor, but genetics, kidney function, and body weight also significantly influence uric acid levels and gout risk." },
      { question: "How long does a gout attack last?", answer: "Without treatment, an attack can last several days to two weeks; with prompt treatment, symptoms typically improve much faster." },
      { question: "Can gout be permanently cured?", answer: "With consistent long-term uric acid management, attacks can be effectively prevented, though the underlying tendency typically needs ongoing management rather than a one-time cure." },
      { question: "Does gout only affect the big toe?", answer: "The big toe is the classic site, but gout can also affect ankles, knees, wrists, and other joints." }
    ],
    relatedDoctorIds: ["dr-aravinda-babu"],
    relatedConditions: [{ name: "Joint Pain", slug: "joint-pain" }, { name: "Arthritis (Osteoarthritis)", slug: "arthritis-osteoarthritis" }]
  },

  // Shell objects for the remaining 36 conditions (expanded programmatically by conditionExpander)
  { name: "Avascular Necrosis (AVN of Hip)", slug: "avn-hip", cluster: "bone-health" },
  { name: "Bone Tumors", slug: "bone-tumors", cluster: "bone-health" },
  { name: "Bone Infection (Osteomyelitis)", slug: "bone-infection", cluster: "bone-health" },
  { name: "Bow Legs & Knock Knees (Limb Deformity)", slug: "bow-legs-knock-knees", cluster: "bone-health" },

  // --- 2. Joint Pain Conditions ---
  { name: "Joint Pain (General)", slug: "joint-pain", cluster: "joint-pain" },
  { name: "Knee Pain", slug: "knee-pain", cluster: "joint-pain" },
  { name: "Hip Pain", slug: "hip-pain", cluster: "joint-pain" },
  { name: "Shoulder Pain", slug: "shoulder-pain", cluster: "joint-pain" },
  { name: "Frozen Shoulder", slug: "frozen-shoulder", cluster: "joint-pain" },
  { name: "Rotator Cuff Injury", slug: "rotator-cuff-injury", cluster: "joint-pain" },
  { name: "Meniscus Tear", slug: "meniscus-tear", cluster: "joint-pain" },

  // --- 3. Spine Conditions ---
  { name: "Back Pain", slug: "back-pain", cluster: "spine" },
  { name: "Neck Pain", slug: "neck-pain", cluster: "spine" },
  { name: "Slip Disc (Herniated Disc)", slug: "slip-disc", cluster: "spine" },
  { name: "Sciatica", slug: "sciatica", cluster: "spine" },
  { name: "Cervical Spondylosis", slug: "cervical-spondylosis", cluster: "spine" },
  { name: "Scoliosis", slug: "scoliosis", cluster: "spine" },
  { name: "Spinal Stenosis", slug: "spinal-stenosis", cluster: "spine" },
  { name: "Spondylolisthesis", slug: "spondylolisthesis", cluster: "spine" },

  // --- 4. Trauma & Fractures ---
  { name: "Fractures (General)", slug: "fractures", cluster: "trauma" },
  { name: "Stress Fractures", slug: "stress-fractures", cluster: "trauma" },
  { name: "Spinal Fractures", slug: "spinal-fractures", cluster: "trauma" },
  { name: "Open (Compound) Fractures", slug: "open-fractures", cluster: "trauma" },
  { name: "Pediatric Fractures", slug: "pediatric-fractures", cluster: "trauma" },
  { name: "Polytrauma / Multiple Injuries", slug: "polytrauma", cluster: "trauma" },

  // --- 5. Sports & Soft Tissue Injuries ---
  { name: "Sports Injury (General)", slug: "sports-injury", cluster: "sports" },
  { name: "ACL Tear & Ligament Injury", slug: "acl-tear", cluster: "sports" },
  { name: "Tennis Elbow", slug: "tennis-elbow", cluster: "sports" },
  { name: "Carpal Tunnel Syndrome", slug: "carpal-tunnel", cluster: "sports" },
  { name: "Whiplash Injury", slug: "whiplash-injury", cluster: "sports" },

  // --- 6. Foot & Ankle Conditions ---
  { name: "Flat Feet", slug: "flat-feet", cluster: "foot" },
  { name: "Plantar Fasciitis", slug: "plantar-fasciitis", cluster: "foot" },
  { name: "Heel Pain", slug: "heel-pain", cluster: "foot" },

  // --- 7. Pediatric & Congenital Orthopaedics ---
  { name: "Clubfoot", slug: "clubfoot", cluster: "pediatric" },
  { name: "Cerebral Palsy (Orthopaedic Care)", slug: "cerebral-palsy", cluster: "pediatric" },
  { name: "Polio Deformity Correction", slug: "polio-deformity", cluster: "pediatric" }
];

export const allTreatmentsData = [];

export const insurancePartnersData = [
  { name: "Dr. YSR Aarogyasri Scheme", logoUrl: "", order: 1, isActive: true },
  { name: "Employees Health Scheme (EHS)", logoUrl: "", order: 2, isActive: true },
  { name: "Working Journalists Health Scheme (WJHS)", logoUrl: "", order: 3, isActive: true },
  { name: "Chief Minister's Relief Fund (CMRF)", logoUrl: "", order: 4, isActive: true }
];

export const faqsData = [
  { question: "What are your OPD timings?", answer: "10:00 AM – 7:00 PM, Monday to Saturday. Emergency and casualty services run 24/7.", category: "General", order: 1, isActive: true },
  { question: "Is emergency care available at night?", answer: "Yes — our casualty department operates 24 hours a day, every day of the year.", category: "General", order: 2, isActive: true },
  { question: "Which insurance schemes do you accept?", answer: "We accept Dr. YSR Aarogyasri, Employees Health Scheme (EHS), Working Journalists Health Scheme (WJHS), CM Relief Fund, and multiple TPA tie-ups.", category: "Billing & Insurance", order: 3, isActive: true },
  { question: "How do I book an appointment?", answer: "Use the 'Book Appointment' button on our website, call +91 86472 23625, or message us on WhatsApp at +91 73830 85084.", category: "General", order: 4, isActive: true },
  { question: "Where is Amulya Nursing Home located?", answer: "Guntur Road, Narasaraopet, Guntur District, Andhra Pradesh - 522601, near Swathi Shopping Mall and Arvindababu Hospital.", category: "General", order: 5, isActive: true }
];

export const testimonialsData = [
  { patientName: "Patient (Knee Replacement)", rating: 5, reviewText: "Dr. Aravinda Babu and his team made my knee replacement recovery far smoother than I expected. The physiotherapy guidance after surgery made a real difference.", treatmentTaken: "Total Knee Replacement", isApproved: true, isFeaturedOnHome: true },
  { patientName: "Patient (Trauma Care)", rating: 5, reviewText: "Brought in after an accident late at night — the emergency team had us stabilized and assessed within minutes. Grateful for how quickly they responded.", treatmentTaken: "Fracture & Trauma Care", isApproved: true, isFeaturedOnHome: true }
];