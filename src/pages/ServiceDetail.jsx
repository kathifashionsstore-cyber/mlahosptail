import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { useApp } from "../context/AppContext";
import DetailTemplate from "../components/DetailTemplate";

export function ServiceDetail() {
  const { slug } = useParams();
  const { services, getImageUrl, settings } = useApp();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedService = services.find((item) => item.slug === slug);
    if (cachedService) {
      setService(cachedService);
      setLoading(false);
      return;
    }

    const fetchService = async () => {
      try {
        const serviceQuery = query(collection(db, "services"), where("slug", "==", slug), limit(1));
        const querySnap = await getDocs(serviceQuery);
        if (!querySnap.empty) {
          setService({ id: querySnap.docs[0].id, ...querySnap.docs[0].data() });
        }
      } catch (error) {
        console.error("Failed to load service detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [slug, services]);

  if (loading) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[50vh] bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-[#1E7FC2] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-450 mt-4 font-bold text-xs uppercase tracking-widest">Loading details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="pt-32 text-center py-20 min-h-[50vh] bg-slate-50 dark:bg-slate-950">
        <h2 className="text-2xl font-bold text-[#0B3C5D] dark:text-slate-100 font-serif">Service Not Found</h2>
        <Link to="/services" className="mt-4 inline-block text-[#1E7FC2] font-bold hover:underline">
          &larr; Back to all services
        </Link>
      </div>
    );
  }

  const fallbackOgImage = getImageUrl(
    "og-default-image",
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=600&q=80"
  );
  const serviceShareImage = getImageUrl(`service-thumb-${service.slug}`, service.thumbnailUrl || fallbackOgImage);

  return (
    <>
      <Helmet>
        <title>{service.seoTitle || service.metaTitle || `${service.name} Treatment | ${settings?.hospitalName || "Amulya Nursing Home"}`}</title>
        <meta name="description" content={service.seoDescription || service.metaDescription || service.shortDescription || service.description} />
        {service.seoKeywords && <meta name="keywords" content={service.seoKeywords} />}
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={service.seoTitle || service.name} />
        <meta property="og:description" content={service.seoDescription || service.shortDescription} />
        <meta property="og:image" content={serviceShareImage} />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={service.seoTitle || service.name} />
        <meta name="twitter:description" content={service.seoDescription || service.shortDescription} />
        <meta name="twitter:image" content={serviceShareImage} />

        {/* Canonical Link */}
        <link rel="canonical" href={window.location.href} />

        {/* FAQ Schema */}
        {service.faqs && service.faqs.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": service.faqs.map((faq) => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })}
          </script>
        )}

        {/* Medical Specialty Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "name": service.name,
            "description": service.shortDescription || service.description,
            "aspect": ["diagnosis", "treatment", "symptoms", "prevention"],
            "mainContentOfPage": {
              "@type": "WebPageElement",
              "cssSelector": "main"
            },
            "medicalAudience": "Patient"
          })}
        </script>
      </Helmet>
      <DetailTemplate item={service} type="service" />
    </>
  );
}

export default ServiceDetail;
