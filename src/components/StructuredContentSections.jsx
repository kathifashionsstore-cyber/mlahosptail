import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Check, ChevronDown, Home, Info, ListChecks, ShieldCheck } from "lucide-react";

function SectionCard({ title, icon: Icon = Info, children }) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 p-6 md:p-8 shadow-sm space-y-4">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-50 font-serif flex items-center space-x-2">
        <Icon className="w-5.5 h-5.5 text-primary" />
        <span>{title}</span>
      </h2>
      {children}
    </section>
  );
}

function BulletList({ items, markerClass = "text-primary" }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start space-x-2 text-sm font-semibold text-slate-600 dark:text-slate-350 leading-relaxed">
          <span className={`${markerClass} mt-0.5`}>-</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Faqs({ faqs }) {
  const [activeFaq, setActiveFaq] = useState(null);

  if (!faqs?.length) return null;

  return (
    <SectionCard title="Frequently Asked Questions" icon={Info}>
      <div className="space-y-2.5">
        {faqs.map((faq, idx) => {
          const isOpen = activeFaq === idx;
          return (
            <div key={idx} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setActiveFaq(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-850 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition text-sm md:text-base"
              >
                <span>{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-250 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 text-sm font-medium text-slate-550 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

export function StructuredContentSections({ item, itemType = "Treatment" }) {
  const displayName = item?.name || itemType;
  const beforeItems = item?.beforeAfterInfo?.before || [];
  const afterItems = item?.beforeAfterInfo?.after || [];

  return (
    <div className="space-y-8">
      {item.description && (
        <SectionCard title={`What Is ${displayName}`} icon={Activity}>
          <p className="text-sm md:text-base text-slate-650 dark:text-slate-350 leading-relaxed font-medium whitespace-pre-line">
            {item.description}
          </p>
        </SectionCard>
      )}

      {item.whyThisHappens && (
        <SectionCard title="Why Does This Happen" icon={Info}>
          <p className="text-sm md:text-base text-slate-650 dark:text-slate-350 leading-relaxed font-medium whitespace-pre-line">
            {item.whyThisHappens}
          </p>
        </SectionCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {item.symptoms?.length > 0 && (
          <SectionCard title="Symptoms to Watch For" icon={ListChecks}>
            <BulletList items={item.symptoms} markerClass="text-red-500" />
          </SectionCard>
        )}

        {item.causes?.length > 0 && (
          <SectionCard title="Common Causes" icon={ShieldCheck}>
            <BulletList items={item.causes} markerClass="text-primary-light" />
          </SectionCard>
        )}
      </div>

      {item.whatHospitalWillDo && (
        <SectionCard title="What Amulya Nursing Home Will Do" icon={ShieldCheck}>
          <p className="text-sm md:text-base text-slate-650 dark:text-slate-350 leading-relaxed font-medium whitespace-pre-line">
            {item.whatHospitalWillDo}
          </p>
        </SectionCard>
      )}

      {item.quickFacts?.length > 0 && (
        <SectionCard title="Treatment Quick Facts" icon={Info}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {item.quickFacts.map((fact, idx) => (
              <div key={idx} className="rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 p-4">
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">{fact.label}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{fact.value}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {item.stepByStepAtHospital?.length > 0 && (
        <SectionCard title="Step-by-Step Process at Our Hospital" icon={ListChecks}>
          <ol className="space-y-3">
            {item.stepByStepAtHospital.map((step, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-sm font-semibold text-slate-650 dark:text-slate-350 leading-relaxed">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary dark:text-primary-light flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </SectionCard>
      )}

      {item.benefits?.length > 0 && (
        <SectionCard title="Benefits & Expected Outcomes" icon={Check}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {item.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-355">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {item.recoveryTimeline?.length > 0 && (
        <SectionCard title="Recovery Timeline" icon={Activity}>
          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8 py-2">
            {item.recoveryTimeline.map((entry, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[31px] top-1 w-4.5 h-4.5 bg-primary dark:bg-primary-light rounded-full border-4 border-white dark:border-slate-900" />
                <span className="text-xs uppercase font-extrabold tracking-wider text-primary dark:text-primary-light block">
                  {entry.phase}
                </span>
                <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {entry.detail}
                </h3>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {item.whatToDoAtHome?.length > 0 && (
        <SectionCard title="What You Can Do at Home" icon={Home}>
          <BulletList items={item.whatToDoAtHome} markerClass="text-brand-green" />
        </SectionCard>
      )}

      {(beforeItems.length > 0 || afterItems.length > 0) && (
        <SectionCard title="Before & After: What to Know" icon={Info}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {beforeItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Before</h3>
                <BulletList items={beforeItems} markerClass="text-primary" />
              </div>
            )}
            {afterItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">After</h3>
                <BulletList items={afterItems} markerClass="text-brand-green" />
              </div>
            )}
          </div>
        </SectionCard>
      )}

      <Faqs faqs={item.faqs} />
    </div>
  );
}

export default StructuredContentSections;
