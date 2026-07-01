import { useApp } from "../context/AppContext";

const DEFAULT_SILHOUETTE = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80";

export function getDoctorPhoto(doctor, index = null, siteImages = {}) {
  if (!doctor) return DEFAULT_SILHOUETTE;

  // Priority 1: home-doctor-photo-${index} (if index is provided)
  if (index !== null) {
    const homeSlotKey = `home-doctor-photo-${index}`;
    if (siteImages?.[homeSlotKey]?.imageUrl) {
      return siteImages[homeSlotKey].imageUrl;
    }
  }

  // Priority 2: doctor-photo-${doctor.slug} or doctor-photo-${doctor.id}
  const slug = doctor.slug || doctor.id;
  if (slug) {
    const doctorSlotKey = `doctor-photo-${slug}`;
    if (siteImages?.[doctorSlotKey]?.imageUrl) {
      return siteImages[doctorSlotKey].imageUrl;
    }
  }

  // Priority 3: direct doctor.photoUrl
  if (doctor.photoUrl) {
    return doctor.photoUrl;
  }

  // Priority 4: Default silhouette placeholder
  return DEFAULT_SILHOUETTE;
}

export function useDoctorPhoto(doctor, index = null) {
  const { siteImages } = useApp();
  return getDoctorPhoto(doctor, index, siteImages);
}

export default useDoctorPhoto;
