import React from "react";
import AdminCollectionEditor from "./AdminCollectionEditor";
import ReviewsQueue from "./ReviewsQueue";

const activeOrderFields = [
  {
    name: "status",
    label: "Publishing Status",
    type: "select",
    default: "published",
    options: [
      { value: "published", label: "Published" },
      { value: "draft", label: "Draft" },
      { value: "archived", label: "Archived" },
    ],
  },
  { name: "order", label: "Order", type: "number", default: 1 },
  { name: "isActive", label: "Active", type: "checkbox", default: true, checkboxLabel: "Visible on public site" },
];

const treatmentStructureFields = [
  { name: "description", label: "Description", type: "textarea", wide: true, required: true },
  { name: "whyThisHappens", label: "Why This Happens", type: "textarea", wide: true },
  { name: "symptoms", label: "Symptoms", type: "lines", wide: true, help: "One item per line." },
  { name: "causes", label: "Causes", type: "lines", wide: true, help: "One item per line." },
  { name: "whatHospitalWillDo", label: "What Hospital Will Do", type: "textarea", wide: true },
  { name: "quickFacts", label: "Quick Facts JSON", type: "json", wide: true, default: [] },
  { name: "stepByStepAtHospital", label: "Step-by-Step At Hospital", type: "lines", wide: true },
  { name: "treatmentProcess", label: "Treatment Process", type: "textarea", wide: true },
  { name: "benefits", label: "Benefits", type: "lines", wide: true },
  { name: "recoveryTimeline", label: "Recovery Timeline JSON", type: "json", wide: true, default: [] },
  { name: "whatToDoAtHome", label: "Home Care Advice", type: "lines", wide: true },
  { name: "beforeAfterInfo", label: "Before/After JSON", type: "json", wide: true, default: { before: [], after: [] } },
  { name: "faqs", label: "FAQs JSON", type: "json", wide: true, default: [] },
];

const doctorsFields = [
  { name: "photoUrl", label: "Photo URL / Upload", type: "image", wide: true },
  { name: "name", label: "Doctor Name", type: "text", required: true },
  { name: "qualification", label: "Qualification", type: "text" },
  { name: "designation", label: "Designation", type: "text" },
  { name: "publicRole", label: "Public Role", type: "text" },
  { name: "specialization", label: "Specialization Tags", type: "csv", wide: true },
  { name: "experienceYears", label: "Experience Years", type: "number", default: 0 },
  { name: "availability", label: "Availability Badge", type: "text", default: "Available Today" },
  { name: "languages", label: "Languages", type: "csv" },
  { name: "bio", label: "Biography", type: "textarea", wide: true },
  { name: "consultationTimings", label: "Consultation Timings", type: "text" },
  { name: "consultationDays", label: "Consultation Days", type: "csv" },
  { name: "departmentId", label: "Department ID", type: "text" },
  { name: "awards", label: "Awards", type: "csv", wide: true },
  { name: "isFeaturedOnHome", label: "Featured On Home", type: "checkbox", default: false },
  ...activeOrderFields,
];

const treatmentsFields = [
  { name: "thumbnailUrl", label: "Thumbnail URL / Upload", type: "image", wide: true },
  { name: "name", label: "Treatment Name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true },
  { name: "departmentId", label: "Department ID", type: "text" },
  { name: "shortDescription", label: "Short Description", type: "textarea", wide: true },
  ...treatmentStructureFields,
  { name: "relatedDoctorIds", label: "Related Doctor IDs", type: "csv", wide: true },
  { name: "isFeaturedOnHome", label: "Featured On Home", type: "checkbox", default: false },
  ...activeOrderFields,
];

const servicesFields = [
  { name: "thumbnailUrl", label: "Thumbnail URL / Upload", type: "image", wide: true },
  { name: "heroImageUrl", label: "Hero Image URL / Upload", type: "image", wide: true },
  { name: "name", label: "Service Name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true },
  {
    name: "contentType",
    label: "Content Type",
    type: "select",
    default: "condition",
    options: [
      { value: "condition", label: "Condition" },
      { value: "service", label: "Service" },
      { value: "treatment", label: "Treatment" },
      { value: "symptom", label: "Symptom" },
    ],
  },
  { name: "categoryId", label: "Main Category ID", type: "text", default: "orthopaedics" },
  {
    name: "cluster",
    label: "Sub Category / Cluster",
    type: "select",
    default: "bone-health",
    options: [
      { value: "bone-health", label: "General Bone & Joint Health" },
      { value: "joint-pain", label: "Joint Pain Conditions" },
      { value: "spine", label: "Spine Conditions" },
      { value: "trauma", label: "Trauma & Fractures" },
      { value: "sports", label: "Sports & Soft Tissue Injuries" },
      { value: "foot", label: "Foot & Ankle Conditions" },
      { value: "pediatric", label: "Pediatric & Congenital Orthopaedics" },
      { value: "general", label: "General Services" },
    ],
  },
  { name: "icon", label: "Lucide Icon", type: "text", default: "Activity" },
  { name: "availability", label: "Availability", type: "text" },
  { name: "heroHeadline", label: "Hero Headline", type: "text", wide: true },
  { name: "heroSubheading", label: "Hero Subheading", type: "textarea", wide: true },
  { name: "shortDescription", label: "Short Description", type: "textarea", wide: true },
  ...treatmentStructureFields,
  { name: "diagnosis", label: "Diagnosis", type: "lines", wide: true },
  { name: "treatmentOptions", label: "Treatment Options JSON", type: "json", wide: true, default: { nonSurgical: [], surgical: [] } },
  { name: "prevention", label: "Prevention", type: "lines", wide: true },
  { name: "whenToSeeDoctor", label: "When To See Doctor", type: "lines", wide: true },
  { name: "relatedDoctorIds", label: "Related Doctor IDs", type: "csv", wide: true },
  { name: "relatedServiceSlugs", label: "Related Service Slugs", type: "csv", wide: true },
  { name: "galleryImages", label: "Gallery Image URLs", type: "lines", wide: true },
  { name: "seoTitle", label: "SEO Title", type: "text", wide: true },
  { name: "seoDescription", label: "SEO Description", type: "textarea", wide: true },
  { name: "seoKeywords", label: "SEO Keywords", type: "text", wide: true },
  { name: "publishDate", label: "Schedule Publish Date", type: "date" },
  { name: "expiryDate", label: "Schedule Expiry Date", type: "date" },
  ...activeOrderFields,
];

export function AdminDoctors() {
  return (
    <AdminCollectionEditor
      collectionName="doctors"
      title="Doctors"
      description="Manage doctor profiles, photos, specializations, timings, and home-page visibility."
      fields={doctorsFields}
      idField="name"
      previewPath={(item) => `/doctors/${item.id}`}
    />
  );
}

export function AdminTreatments() {
  return (
    <AdminCollectionEditor
      collectionName="treatments"
      title="Treatments"
      description="Manage the full 10+ heading treatment detail structure and public treatment cards."
      fields={treatmentsFields}
      idField="slug"
    />
  );
}

export function AdminServices() {
  return (
    <AdminCollectionEditor
      collectionName="services"
      title="Services"
      description="Manage hospital service pages, category assignment, icons, availability, and detail sections."
      fields={servicesFields}
      idField="slug"
      previewPath={(item) => `/services/${item.categoryId || "orthopaedics"}/${item.slug}`}
    />
  );
}

export function AdminServiceCategories() {
  return (
    <AdminCollectionEditor
      collectionName="serviceCategories"
      title="Service Categories"
      description="Manage service grouping chips and sections used on the Services page."
      fields={[
        { name: "name", label: "Name", type: "text", required: true },
        { name: "slug", label: "Slug", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea", wide: true },
        ...activeOrderFields,
      ]}
      idField="slug"
    />
  );
}

export function AdminGallery() {
  return (
    <AdminCollectionEditor
      collectionName="galleryImages"
      title="Premium Gallery"
      description="Manage one dynamic frontend gallery with categories, featured state, drag ordering, bulk upload, previews, and instant publishing."
      fields={[
        { name: "imageUrl", label: "Image URL / Upload", type: "image", wide: true },
        { name: "caption", label: "Caption", type: "text" },
        { name: "altText", label: "Alt Text", type: "text" },
        { name: "category", label: "Category", type: "text", default: "Hospital" },
        { name: "credit", label: "Credit / Event", type: "text" },
        { name: "isFeatured", label: "Featured Image", type: "checkbox", default: false },
        ...activeOrderFields,
      ]}
      idField="id"
      previewPath={(item) => item.imageUrl}
      bulkImageField="imageUrl"
      bulkDefaults={{ category: "Hospital", status: "published", caption: "" }}
    />
  );
}

export function AdminWelcomeBanner() {
  return (
    <AdminCollectionEditor
      collectionName="welcomeBanner"
      title="Welcome Banner"
      description="Control the first-visit splash screen, animation timing, background media, overlay, logo, credit, and publishing schedule."
      fields={[
        { name: "slot", label: "Banner Slot ID", type: "text", default: "main", required: true },
        { name: "backgroundImageUrl", label: "Background Image URL / Upload", type: "image", wide: true },
        { name: "backgroundVideoUrl", label: "Background Video URL", type: "text", wide: true },
        { name: "logoUrl", label: "Logo URL / Upload", type: "image", wide: true },
        { name: "kicker", label: "Kicker", type: "text", default: "Welcome to" },
        { name: "heading", label: "Heading", type: "text", default: "Amulya Nursing Home", required: true },
        { name: "subheading", label: "Sub Heading", type: "text", default: "Spine, Joint & Trauma Care" },
        { name: "tagline", label: "Tagline", type: "text", default: "Your Health, Our Commitment" },
        { name: "developerCredit", label: "Developer Credit", type: "text", default: "Website Designed & Developed by WayZenTech" },
        { name: "phoneNumber", label: "Phone Number", type: "text", default: "9398724704" },
        { name: "displayDurationSeconds", label: "Display Duration (seconds)", type: "number", default: 4 },
        {
          name: "displayFrequency",
          label: "Display Frequency",
          type: "select",
          default: "session",
          options: [
            { value: "session", label: "Once Per Browser Session" },
            { value: "firstVisit", label: "First Visit Only" },
            { value: "always", label: "Every Visit" },
          ],
        },
        {
          name: "animationStyle",
          label: "Animation Style",
          type: "select",
          default: "luxury-fade",
          options: [
            { value: "luxury-fade", label: "Luxury Fade" },
            { value: "zoom-glass", label: "Zoom Glass" },
            { value: "soft-rise", label: "Soft Rise" },
          ],
        },
        { name: "overlayColor", label: "Overlay Color", type: "text", default: "#06263A" },
        { name: "overlayOpacity", label: "Overlay Opacity (0 to 1)", type: "number", default: 0.64 },
        { name: "buttonText", label: "Button Text", type: "text", default: "Enter Website" },
        { name: "buttonLink", label: "Button Link", type: "text", default: "/" },
        { name: "publishDate", label: "Schedule Publish Date", type: "date" },
        { name: "expiryDate", label: "Schedule Expiry Date", type: "date" },
        ...activeOrderFields,
      ]}
      idField="slot"
      allowOrdering={false}
    />
  );
}

export function AdminBlog() {
  return (
    <AdminCollectionEditor
      collectionName="blogs"
      title="Blog"
      description="Manage health articles, rich text content, publication status, and thumbnails."
      fields={[
        { name: "thumbnailUrl", label: "Thumbnail URL / Upload", type: "image", wide: true },
        { name: "title", label: "Article Title", type: "text", required: true },
        { name: "slug", label: "Slug", type: "text", required: true },
        { name: "category", label: "Category", type: "text" },
        { name: "excerpt", label: "Excerpt", type: "textarea", wide: true },
        { name: "content", label: "Content", type: "textarea", wide: true },
        { name: "authorName", label: "Author Name", type: "text", default: "Amulya Nursing Home" },
        { name: "publishedAt", label: "Published At", type: "text" },
        { name: "views", label: "Views", type: "number", default: 0 },
        { name: "isPublished", label: "Published", type: "checkbox", default: true },
        { name: "order", label: "Order", type: "number", default: 1 },
      ]}
      idField="slug"
    />
  );
}

export function AdminReviewsQueue() {
  return <ReviewsQueue />;
}

export function AdminFestivalBanners() {
  return (
    <AdminCollectionEditor
      collectionName="festivalBanners"
      title="Festival Banners"
      description="Manage seasonal or festival banners with schedule, image, CTA, and active status."
      fields={[
        { name: "imageUrl", label: "Banner Image URL / Upload", type: "image", wide: true },
        { name: "title", label: "Title", type: "text", required: true },
        { name: "subtitle", label: "Subtitle", type: "textarea", wide: true },
        { name: "ctaText", label: "CTA Text", type: "text" },
        { name: "ctaLink", label: "CTA Link", type: "text" },
        { name: "startDate", label: "Start Date + Time", type: "datetime-local" },
        { name: "endDate", label: "End Date + Time", type: "datetime-local" },
        ...activeOrderFields,
      ]}
      idField="title"
    />
  );
}
