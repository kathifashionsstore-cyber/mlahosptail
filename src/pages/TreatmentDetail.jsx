import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { useApp } from "../context/AppContext";
import DetailTemplate from "../components/DetailTemplate";

export function TreatmentDetail() {
  const { slug } = useParams();
  const { treatments } = useApp();
  const [treatment, setTreatment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedTreatment = treatments.find((item) => item.slug === slug);
    if (cachedTreatment) {
      setTreatment(cachedTreatment);
      setLoading(false);
      return;
    }

    const fetchTreatment = async () => {
      try {
        const treatmentQuery = query(collection(db, "treatments"), where("slug", "==", slug), limit(1));
        const querySnap = await getDocs(treatmentQuery);
        if (!querySnap.empty) {
          setTreatment({ id: querySnap.docs[0].id, ...querySnap.docs[0].data() });
        }
      } catch (error) {
        console.error("Failed to fetch treatment procedure:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTreatment();
  }, [slug, treatments]);

  if (loading) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[50vh] bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-[#1E7FC2] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-450 mt-4 font-bold text-xs uppercase tracking-widest">Loading details...</p>
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="pt-32 text-center py-20 min-h-[50vh] bg-slate-50 dark:bg-slate-950">
        <h2 className="text-2xl font-bold text-[#0B3C5D] dark:text-slate-100 font-serif">Treatment Not Found</h2>
        <Link to="/treatments" className="mt-4 inline-block text-[#1E7FC2] font-bold hover:underline">
          &larr; Back to all treatments
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{treatment.name} | Amulya Hospital</title>
        <meta name="description" content={treatment.shortDescription || treatment.description} />
      </Helmet>
      <DetailTemplate item={treatment} type="treatment" />
    </>
  );
}

export default TreatmentDetail;
