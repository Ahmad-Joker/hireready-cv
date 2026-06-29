"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import ScoreCard from "../../components/ScoreCard";
import { reportData } from "../../lib/reportData";

const storageKey = "hireready-cv-report";

function getStoredReport() {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export default function ReportPage() {
  const [report, setReport] = useState(reportData);
  const [isGenerated, setIsGenerated] = useState(false);

  useEffect(() => {
    const storedReport = getStoredReport();

    if (storedReport?.scores?.length) {
      setReport(storedReport);
      setIsGenerated(true);
    }
  }, []);

  return (
    <>
      <Navbar />
      <main className="px-4 py-14 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-action shadow-sm">
              {isGenerated ? "Rule-based report" : "Sample report"}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-ink sm:text-5xl">
              {isGenerated ? "Your CV Report" : "Sample CV Report"}
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              {isGenerated
                ? "This report uses extracted PDF text and transparent rules. No AI or backend processing is used."
                : "This preview uses illustrative data to show how your CV analysis will appear."}
            </p>
          </div>

          {isGenerated ? (
            <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="font-bold text-ink">File</p>
                  <p className="mt-1 break-words">{report.fileName || "Uploaded CV"}</p>
                </div>
                <div>
                  <p className="font-bold text-ink">Target role</p>
                  <p className="mt-1">{report.targetRole || "General role"}</p>
                </div>
                <div>
                  <p className="font-bold text-ink">Country</p>
                  <p className="mt-1">{report.country || "General"}</p>
                </div>
                <div>
                  <p className="font-bold text-ink">Experience level</p>
                  <p className="mt-1">{report.experienceLevel || "Junior"}</p>
                </div>
              </div>
            </article>
          ) : null}

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {report.scores.map((item) => (
              <ScoreCard key={item.label} {...item} />
            ))}
          </div>

          {isGenerated ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Words", report.checks?.wordCount ?? 0],
                ["Contact", report.checks?.hasEmail && report.checks?.hasPhone ? "Email + phone" : "Incomplete"],
                ["Sections", [
                  report.checks?.hasSkills ? "Skills" : null,
                  report.checks?.hasExperience ? "Experience" : null,
                  report.checks?.hasEducation ? "Education" : null,
                ].filter(Boolean).join(", ") || "Needs structure"],
                ["Measurable results", report.checks?.achievementCount ?? 0],
              ].map(([label, value]) => (
                <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
                  <p className="mt-2 text-lg font-black text-ink">{value}</p>
                </article>
              ))}
            </div>
          ) : null}

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-tight text-ink">Summary</h2>
              <p className="mt-4 leading-7 text-slate-600">{report.summary}</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-tight text-ink">Top Problems</h2>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-600">
                {report.topProblems.map((problem) => (
                  <li key={problem} className="pl-1 leading-7">{problem}</li>
                ))}
              </ol>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-tight text-ink">
                {isGenerated ? "Missing Role Keywords" : "Missing Keywords"}
              </h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {report.missingKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-bold text-action"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-tight text-ink">Suggested Improvements</h2>
              <ul className="mt-4 space-y-3 text-slate-600">
                {report.suggestedImprovements.map((improvement) => (
                  <li key={improvement} className="flex gap-3 leading-7">
                    <span className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-success text-xs font-black text-white">
                      ✓
                    </span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          {isGenerated ? (
            <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-tight text-ink">Extracted Text Preview</h2>
              <p className="mt-4 max-h-40 overflow-hidden rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {report.extractedTextPreview}
              </p>
            </article>
          ) : null}

          <article className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative bg-slate-50 p-6 sm:p-8">
              <div className="absolute inset-x-8 top-6 h-20 rounded-2xl bg-white/60 blur-sm" aria-hidden="true" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-ink">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                    <path d="M7 10V8a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M6 10h12v9H6v-9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="mt-5 text-2xl font-black tracking-tight text-ink">
                  Full Detailed Report Locked
                </h2>
                <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                  Coming soon: rewritten bullet points, section-by-section feedback, recruiter-style recommendations, and country-specific advice.
                </p>
                <div className="mt-6">
                  <Button disabled>Unlock Full Report Soon</Button>
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
