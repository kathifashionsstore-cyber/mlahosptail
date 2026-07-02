// ============================================================
// conditionExpander.js
// Utility to dynamically expand condition data into full sitemap template schemas.
// Ensures that all 40 conditions have high-fidelity condition detail content.
// ============================================================

const FALLBACK_BONE_IMGS = [
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=800&q=80"
];

const CLUSTER_METRICS = {
  "bone-health": {
    theme: "Stronger Bones, Active Lifetimes",
    icon: "Activity",
    desc: "bone and metabolic joint structures",
    prevention: [
      "Ensure adequate daily intake of calcium and Vitamin D.",
      "Incorporate weight-bearing exercises like walking or light jogging.",
      "Avoid smoking and limit alcohol consumption to prevent bone thinning.",
      "Get periodic bone mineral density (DEXA) screenings after age 50."
    ],
    whenToSeeDoctor: [
      "A bone fractures after minor pressure or a low-impact fall.",
      "You notice a loss of height or development of a stooped posture.",
      "Persistent dull bone aching that is worse at night.",
      "Sudden, localized spinal pain without trauma."
    ]
  },
  "joint-pain": {
    theme: "Relieve Joint Stiffness, Regain Freedom",
    icon: "Activity",
    desc: "articular cartilage and joint capsule function",
    prevention: [
      "Maintain a healthy weight to reduce load on weight-bearing joints.",
      "Stay active with low-impact exercises like cycling or swimming.",
      "Strengthen the muscles surrounding your major joints (quads, glutes).",
      "Avoid keeping joints in static, awkward positions for long periods."
    ],
    whenToSeeDoctor: [
      "Joint pain that persists for more than 3-4 weeks despite rest.",
      "Visible swelling, redness, or warmth in or around the joint.",
      "The joint regularly locks, catches, or feels like it's giving way.",
      "Inability to bear weight on the affected limb."
    ]
  },
  "spine": {
    theme: "Restoring Spine Health & Comfort",
    icon: "Activity",
    desc: "vertebral alignment and spinal nerve pathways",
    prevention: [
      "Practice proper lifting techniques — bend at the knees, not the waist.",
      "Maintain strong abdominal and core muscles to support your lower back.",
      "Use ergonomic seating and avoid slouching at your desk.",
      "Change postures frequently and avoid prolonged sitting."
    ],
    whenToSeeDoctor: [
      "Severe back or neck pain that radiates into your arms or legs.",
      "Numbness, tingling, or 'pins-and-needles' in your hands or feet.",
      "Weakness in your legs, leading to foot drop or balance loss.",
      "New bowel or bladder control issues (requires emergency triage)."
    ]
  },
  "trauma": {
    theme: "Emergency Orthopaedic Rescue & Recovery",
    icon: "Siren",
    desc: "fractures and skeletal trauma reconstruction",
    prevention: [
      "Remove home tripping hazards like loose rugs, poor lighting, or clutter.",
      "Wear appropriate protective gear during sports or physical activities.",
      "Use safety harnesses and proper ladders when working at heights.",
      "Maintain good bone density to prevent fragility fractures."
    ],
    whenToSeeDoctor: [
      "A limb appears deformed, bent, or abnormally aligned.",
      "Inability to move a joint or bear weight immediately following an injury.",
      "Bone fragments are visible or skin is broken near a fracture.",
      "Numbness or coldness in the fingers or toes below an injury."
    ]
  },
  "sports": {
    theme: "Get Back in the Game, Pain-Free",
    icon: "Activity",
    desc: "ligaments, tendons, and athletic joint stability",
    prevention: [
      "Always warm up and stretch properly before playing sports.",
      "Incorporate agility, balance, and flexibility work into your training.",
      "Wear supportive, sport-specific footwear in good condition.",
      "Allow adequate rest days between high-intensity training sessions."
    ],
    whenToSeeDoctor: [
      "You hear or feel a distinct 'pop' in a joint during activity.",
      "Rapid swelling within 1-2 hours of a twisting injury.",
      "A feeling of joint instability or sliding during pivot movements.",
      "Pain that interferes with athletic participation or training."
    ]
  },
  "foot": {
    theme: "Steps Toward Pain-Free Mobility",
    icon: "Footprints",
    desc: "foot alignment and plantar fascia support",
    prevention: [
      "Wear well-fitting shoes with good arch support and cushioning.",
      "Avoid walking barefoot on hard surfaces, especially if you have flat feet.",
      "Gently stretch your calves and Achilles tendons daily.",
      "Rotate your footwear and avoid wearing worn-out shoes."
    ],
    whenToSeeDoctor: [
      "Sharp pain in the heel during your first steps in the morning.",
      "Progressive flattening of the arch accompanied by inner ankle pain.",
      "Swelling or pain that prevents comfortable walking in normal shoes.",
      "Numbness or tingling on the bottom of the foot."
    ]
  },
  "pediatric": {
    theme: "Gentle, Specialized Pediatric Bone Care",
    icon: "Activity",
    desc: "growth plates and congenital skeletal development",
    prevention: [
      "Encourage children to engage in active, safe physical play to build bones.",
      "Ensure proper nutrition with adequate calcium and sunshine exposure.",
      "Have pediatric gait anomalies evaluated early by a specialist.",
      "Follow pediatric casting and bracing protocols strictly to prevent relapse."
    ],
    whenToSeeDoctor: [
      "A child begins limping or refuses to stand or walk.",
      "Asymmetrical limb appearance, shoulder heights, or skin folds.",
      "Joint pain or swelling in a child following minor trauma.",
      "A child toe-walks or shows progressive inward rolling of feet."
    ]
  }
};

export function expandCondition(condition, index, allConditionsList = []) {
  const cluster = condition.cluster || "bone-health";
  const metrics = CLUSTER_METRICS[cluster] || CLUSTER_METRICS["bone-health"];
  const slug = condition.slug || condition.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Determine meta fields
  const metaTitle = condition.metaTitle || `${condition.name} Treatment in Narasaraopet | Amulya Hospital`;
  const metaDescription = condition.metaDescription || `Expert diagnosis and treatment for ${condition.name} — from advanced conservative therapies to precision surgical repairs at Amulya Hospital.`;

  // Determine Hero Fields
  const heroHeadline = condition.heroHeadline || metrics.theme;
  const heroSubheading = condition.heroSubheading || `Comprehensive care, advanced diagnostics, and personalized rehabilitation plans for ${condition.name}.`;

  // Determine overview / description
  const description = condition.description || `${condition.name} is a common clinical condition affecting the ${metrics.desc}. It can lead to persistent discomfort, joint stiffness, and restricted mobility if left untreated. Our specialists focus on identifying the root cause to restore full movement.`;

  // Determine symptoms
  const symptoms = condition.symptoms && condition.symptoms.length > 0
    ? condition.symptoms
    : [
        `Persistent aching or sharp pain in the affected area`,
        `Morning stiffness or joint tightness that worsens after periods of rest`,
        `Reduced flexibility, range of motion, or difficulty performing normal actions`,
        `Localized swelling, tenderness, or warmth over the affected joint or bone`
      ];

  // Determine causes
  const causes = condition.causes && condition.causes.length > 0
    ? condition.causes
    : [
        `Natural wear-and-tear or degeneration of bone and joint structures over time`,
        `Micro-trauma or cumulative strain from repetitive activities or occupational stress`,
        `Prior mechanical injuries, sprains, or trauma that weakened the joint tissue`,
        `Insufficient muscle conditioning, leading to poor support around joint capsules`
      ];

  // Determine diagnosis
  const diagnosis = condition.diagnosis && condition.diagnosis.length > 0
    ? condition.diagnosis
    : [
        `Detailed clinical evaluation and muscle function tests by an orthopaedic surgeon`,
        `High-resolution digital X-rays to assess bone structures and joint spacing`,
        `MRI or CT scans to visualize soft tissue, cartilage, ligaments, or nerves`,
        `Blood tests to rule out systemic metabolic or autoimmune inflammatory causes`
      ];

  // Determine treatment options
  const treatmentOptions = condition.treatmentOptions || {
    nonSurgical: [
      `Custom physical therapy focused on core, joint, or limb strengthening`,
      `Targeted medications to control inflammation, pain, or support bone remodeling`,
      `Supportive orthotics, splints, or braces to reduce mechanical joint stress`,
      `Guided lifestyle adjustments, including weight offloading and low-impact exercise`
    ],
    surgical: [
      `Minimally invasive arthroscopic (keyhole) repair of damaged ligaments or cartilage`,
      `Swiss AO-standard internal fixation (plates, rods, screws) for fracture stability`,
      `Joint resurfacing or total joint replacement for advanced, bone-on-bone cases`
    ]
  };

  // Determine Why Choose Us
  const whyChooseUs = condition.whyChooseUs && condition.whyChooseUs.length > 0
    ? condition.whyChooseUs
    : [
        `33+ Years of clinical orthopaedic leadership in Andhra Pradesh since 1992`,
        `Senior UK-trained surgeon Dr. Chadalavada Aravinda Babu`,
        `Advanced operating suites utilizing Swiss AO fixation standards`,
        `Active post-treatment physical therapy and recovery programs`
      ];

  // Determine Prevention & Self Care
  const prevention = condition.prevention && condition.prevention.length > 0
    ? condition.prevention
    : metrics.prevention;

  // Determine When to See Doctor
  const whenToSeeDoctor = condition.whenToSeeDoctor && condition.whenToSeeDoctor.length > 0
    ? condition.whenToSeeDoctor
    : metrics.whenToSeeDoctor;

  // Determine FAQs
  const faqs = condition.faqs && condition.faqs.length > 0
    ? condition.faqs
    : [
        {
          question: `What is the first step in treating ${condition.name}?`,
          answer: `The first step is a comprehensive clinical assessment. Our specialists review your symptoms and physical alignment, typically followed by digital X-ray screening to confirm the diagnosis.`
        },
        {
          question: `Does ${condition.name} always require surgical intervention?`,
          answer: `No. In fact, the majority of cases are successfully managed using non-surgical conservative treatments such as physical therapy, muscle strengthening, braces, and medication. Surgery is only recommended if conservative care does not provide relief.`
        },
        {
          question: `How long does recovery take for ${condition.name}?`,
          answer: `Recovery timelines vary depending on whether you undergo conservative or surgical care, but most patients experience significant functional improvement and pain relief within 4 to 8 weeks.`
        }
      ];

  // Determine related conditions
  const relatedConditions = condition.relatedConditions && condition.relatedConditions.length > 0
    ? condition.relatedConditions
    : allConditionsList
        .filter((c) => c.cluster === cluster && c.slug !== slug)
        .slice(0, 3)
        .map((c) => ({ name: c.name, slug: c.slug }));

  return {
    ...condition,
    id: condition.id || slug,
    slug,
    name: condition.name,
    category: "orthopaedics",
    categoryId: "orthopaedics",
    cluster,
    metaTitle,
    metaDescription,
    heroHeadline,
    heroSubheading,
    description,
    types: condition.types || null,
    causes,
    symptoms,
    diagnosis,
    treatmentOptions,
    whyChooseUs,
    prevention,
    whenToSeeDoctor,
    galleryImages: condition.galleryImages || FALLBACK_BONE_IMGS,
    faqs,
    relatedConditions,
    relatedDoctorIds: condition.relatedDoctorIds || ["dr-aravinda-babu"],
    isActive: true,
    order: index + 1
  };
}
