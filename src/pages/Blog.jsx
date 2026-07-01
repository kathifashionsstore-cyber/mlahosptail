import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, increment, limit, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { useApp } from "../context/AppContext";
import { Helmet } from "react-helmet-async";
import { Calendar, Eye, User, BookOpen, ChevronLeft } from "lucide-react";

export function Blog() {
  const { slug } = useParams();
  const { getImageUrl } = useApp();
  const [blogs, setBlogs] = useState([]);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = ["Bone Health", "Arthritis", "Back Pain", "Exercise Guides", "Recovery Tips"];

  // Fetch blogs list
  const fetchBlogs = async () => {
    try {
      const q = query(collection(db, "blogs"), where("isPublished", "==", true), orderBy("publishedAt", "desc"));
      const querySnap = await getDocs(q);
      setBlogs(querySnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    } catch (err) {
      console.error("Failed to load blog articles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setBlog(null);

    if (slug) {
      // Detail View
      const fetchBlogDetail = async () => {
        try {
          const q = query(collection(db, "blogs"), where("slug", "==", slug), where("isPublished", "==", true), limit(1));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            const blogData = { id: querySnap.docs[0].id, ...querySnap.docs[0].data() };
            setBlog(blogData);

            // Increment views count in Firestore
            const blogDocRef = doc(db, "blogs", blogData.id);
            await updateDoc(blogDocRef, {
              views: increment(1),
            });
          }
        } catch (err) {
          console.error("Failed to fetch blog article detail:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchBlogDetail();
    } else {
      // List View
      fetchBlogs();
    }
  }, [slug]);

  // Filter list
  const filteredBlogs =
    activeCategory === "all" ? blogs : blogs.filter((b) => b.category === activeCategory);

  const getFormattedDate = (timestamp) => {
    if (!timestamp) return "Recent";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-[#1E7FC2] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 mt-4 font-semibold">Loading health articles...</p>
      </div>
    );
  }

  // --- DETAIL VIEW ---
  if (slug && blog) {
    const pubDate = getFormattedDate(blog.publishedAt);
    const metaTitle = blog.seoTitle || `${blog.title} | Amulya Hospital Blog`;
    const metaDescription = blog.seoDescription || blog.excerpt || "Read health articles from Amulya Nursing Home.";

    return (
      <div className="pt-24 min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
        <Helmet>
          <title>{metaTitle}</title>
          <meta name="description" content={metaDescription} />
        </Helmet>

        <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 space-y-6">
          {/* Back breadcrumb */}
          <Link
            to="/blog"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-[#1E7FC2] transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Articles</span>
          </Link>

          {/* Article Panel: Single Centered Article Card */}
          <article className="bg-white dark:bg-slate-900 rounded-[26px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-md p-6 md:p-10 space-y-6">
            {/* Category + Date styled as Eyebrow label above the title */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-[10px] uppercase font-extrabold tracking-widest text-[#D81F26]">
                <span>{blog.category}</span>
                <span>•</span>
                <span>{pubDate}</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-[#0B3C5D] dark:text-white font-serif leading-tight">
                {blog.title}
              </h1>

              {/* Meta stats */}
              <div className="flex items-center space-x-4 text-xs font-semibold text-slate-450 pt-1 border-b pb-4">
                <span className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5" />
                  <span>By {blog.authorName || "Amulya Medical Desk"}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{blog.views || 0} Views</span>
                </span>
              </div>
            </div>

            {/* Main banner image */}
            {(blog.thumbnailUrl || getImageUrl(`blog-featured-${blog.slug}`, "")) && (
              <div className="h-64 md:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                <img src={getImageUrl(`blog-featured-${blog.slug}`, blog.thumbnailUrl)} alt={blog.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Rich text Content */}
            <div
              className="prose prose-slate dark:prose-invert max-w-none text-xs md:text-sm leading-relaxed text-slate-700 dark:text-slate-305 font-medium whitespace-pre-wrap pt-2"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </article>
        </div>
      </div>
    );
  }

  if (slug && !blog) {
    return (
      <div className="pt-32 text-center py-20 min-h-[50vh]">
        <h2 className="text-2xl font-bold text-[#0B3C5D] dark:text-slate-105 font-serif">Article Not Found</h2>
        <Link to="/blog" className="mt-4 inline-block text-[#1E7FC2] font-bold hover:underline">
          &larr; Back to all articles
        </Link>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="pt-24 min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* 1. Header Banner */}
      <section className="premium-banner text-white py-16 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-3 relative z-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#D81F26]">Health Resources</span>
          <h1 className="text-3xl md:text-5xl font-extrabold font-serif tracking-tight">Amulya Health Blog</h1>
          <p className="text-sm md:text-base text-slate-200 max-w-2xl font-medium">
            Read clinical insights, preventative guidelines, and bone health advice from our chief surgeons.
          </p>
        </div>
      </section>

      {/* 2. Category Selector */}
      <section className="py-6 bg-[#F4F9FC] dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-2.5 justify-center">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                activeCategory === "all"
                  ? "bg-[#1E7FC2] text-white shadow-md"
                  : "bg-[#E7F3FA] text-[#1E7FC2] hover:bg-[#1E7FC2] hover:text-white"
              }`}
            >
              All Articles
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-[#1E7FC2] text-white shadow-md"
                    : "bg-[#E7F3FA] text-[#1E7FC2] hover:bg-[#1E7FC2] hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Blogs List: Rebuilt to Services card style */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
        {filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((b) => {
              const pubDate = getFormattedDate(b.publishedAt);
              return (
                <div
                  key={b.id}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[14px] overflow-hidden shadow-md flex flex-col justify-between group hover:shadow-[0_20px_45px_rgba(11,60,93,0.14)] transition-all duration-200"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="h-52 bg-slate-100 relative overflow-hidden">
                      <img
                        src={getImageUrl(`blog-featured-${b.slug}`, b.thumbnailUrl || "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=600&q=80")}
                        alt={b.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-4 left-4 bg-[#D81F26] text-white text-[9px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                        {b.category}
                      </span>
                    </div>

                    {/* text body */}
                    <div className="p-6 space-y-2 text-left">
                      <span className="text-[9px] font-bold text-slate-400 block">{pubDate}</span>
                      <h3 className="text-lg font-bold text-[#0B3C5D] dark:text-white font-serif leading-tight line-clamp-2">
                        {b.title}
                      </h3>
                      <p className="text-xs text-[#5C6E7A] dark:text-slate-450 font-semibold leading-relaxed line-clamp-3">
                        {b.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* footer with red read more link */}
                  <div className="px-6 pb-6 pt-3 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span>OPD Resource</span>
                    <Link
                      to={`/blog/${b.slug}`}
                      className="text-[#D81F26] hover:underline flex items-center space-x-0.5"
                    >
                      <span>Read More ➜</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 font-semibold text-xs bg-[#F4F9FC] dark:bg-slate-900/20 border rounded-2xl max-w-md mx-auto">
            No health articles found in this category currently.
          </div>
        )}
      </section>
    </div>
  );
}

export default Blog;
