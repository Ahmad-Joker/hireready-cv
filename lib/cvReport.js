const STOP_WORDS = new Set([
  "and",
  "for",
  "the",
  "with",
  "junior",
  "senior",
  "mid",
  "level",
  "role",
  "manager",
  "specialist",
  "assistant",
]);

const ROLE_KEYWORDS = [
  {
    match: ["marketing", "social media", "content"],
    keywords: [
      "content strategy",
      "social media",
      "campaign",
      "copywriting",
      "analytics",
      "seo",
      "meta ads",
    ],
  },
  {
    match: ["developer", "frontend", "backend", "software", "engineer"],
    keywords: [
      "javascript",
      "react",
      "api",
      "testing",
      "git",
      "performance",
      "debugging",
    ],
  },
  {
    match: ["data", "analyst", "business intelligence"],
    keywords: [
      "excel",
      "sql",
      "dashboard",
      "analysis",
      "reporting",
      "visualization",
      "insights",
    ],
  },
  {
    match: ["sales", "account"],
    keywords: [
      "pipeline",
      "crm",
      "lead generation",
      "targets",
      "negotiation",
      "client relationships",
    ],
  },
  {
    match: ["customer", "support", "service"],
    keywords: [
      "customer support",
      "tickets",
      "communication",
      "resolution",
      "satisfaction",
      "documentation",
    ],
  },
];

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function countWords(text) {
  return (text.match(/\b[\w'-]+\b/g) || []).length;
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function getRoleKeywords(targetRole) {
  const role = targetRole.toLowerCase();
  const mapped = ROLE_KEYWORDS.find((group) =>
    group.match.some((keyword) => role.includes(keyword))
  );
  const roleWords = role
    .split(/[^a-z0-9+#]+/i)
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  return Array.from(new Set([...(mapped?.keywords || []), ...roleWords])).slice(0, 10);
}

function scoreLength(wordCount) {
  if (wordCount >= 450 && wordCount <= 900) return 92;
  if (wordCount >= 300 && wordCount < 450) return 78;
  if (wordCount > 900 && wordCount <= 1200) return 74;
  if (wordCount >= 180) return 58;
  return 34;
}

function makeProblem(text) {
  return text;
}

export function generateCvReport({
  text,
  targetRole = "",
  country = "General",
  experienceLevel = "Junior",
  fileName = "",
}) {
  const rawText = text || "";
  const normalizedText = rawText.toLowerCase();
  const wordCount = countWords(rawText);
  const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(rawText);
  const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(rawText);
  const hasSkills = hasAny(normalizedText, [
    /(^|\n|\s)(skills|technical skills|core skills|key skills)(\s|:)/i,
  ]);
  const hasExperience = hasAny(normalizedText, [
    /(^|\n|\s)(experience|work experience|employment|internship|projects)(\s|:)/i,
  ]);
  const hasEducation = hasAny(normalizedText, [
    /(^|\n|\s)(education|university|degree|bachelor|college|school)(\s|:)/i,
  ]);
  const achievementMatches = rawText.match(/\b\d+(\.\d+)?\s?%|\b\d{2,}\b/g) || [];
  const achievementCount = achievementMatches.length;
  const roleKeywords = getRoleKeywords(targetRole);
  const matchedKeywords = roleKeywords.filter((keyword) =>
    normalizedText.includes(keyword.toLowerCase())
  );
  const missingKeywords = roleKeywords.filter(
    (keyword) => !matchedKeywords.includes(keyword)
  );

  const lengthScore = scoreLength(wordCount);
  const contactScore = hasEmail && hasPhone ? 100 : hasEmail || hasPhone ? 62 : 20;
  const structureScore = clamp(
    ((hasSkills ? 1 : 0) + (hasExperience ? 1 : 0) + (hasEducation ? 1 : 0)) *
      33.34
  );
  const keywordScore = roleKeywords.length
    ? clamp((matchedKeywords.length / roleKeywords.length) * 100)
    : 70;
  const achievementScore =
    achievementCount >= 5 ? 94 : achievementCount >= 3 ? 82 : achievementCount >= 1 ? 62 : 30;
  const atsScore = clamp(lengthScore * 0.3 + contactScore * 0.25 + structureScore * 0.45);
  const overallScore = clamp(
    atsScore * 0.35 + keywordScore * 0.25 + achievementScore * 0.2 + lengthScore * 0.2
  );

  const topProblems = [];
  const suggestedImprovements = [];

  if (wordCount < 300) {
    topProblems.push(makeProblem("The CV is short and may not give recruiters enough evidence."));
    suggestedImprovements.push("Add more detail to relevant projects, internships, coursework, or work experience.");
  } else if (wordCount > 900) {
    topProblems.push(makeProblem("The CV is long and may be harder for recruiters to scan quickly."));
    suggestedImprovements.push("Trim repeated details and keep the strongest achievements for the target role.");
  }

  if (!hasEmail || !hasPhone) {
    topProblems.push(makeProblem("The contact details appear incomplete."));
    suggestedImprovements.push("Include a clear email address and phone number near the top of the CV.");
  }

  if (!hasSkills) {
    topProblems.push(makeProblem("A clear skills section was not detected."));
    suggestedImprovements.push("Add a dedicated skills section with role-specific technical and practical skills.");
  }

  if (!hasExperience) {
    topProblems.push(makeProblem("An experience, internship, or projects section was not clearly detected."));
    suggestedImprovements.push("Add an experience or projects section that shows relevant responsibilities and results.");
  }

  if (!hasEducation) {
    topProblems.push(makeProblem("An education section was not clearly detected."));
    suggestedImprovements.push("Add education details, including degree, university, graduation year, or relevant coursework.");
  }

  if (missingKeywords.length) {
    topProblems.push(
      makeProblem("The CV is missing some keywords connected to the selected target role.")
    );
    suggestedImprovements.push("Add relevant role keywords naturally where they match your real experience.");
  }

  if (achievementCount < 3) {
    topProblems.push(makeProblem("The CV does not include enough measurable achievements."));
    suggestedImprovements.push("Add numbers, percentages, volume, growth, savings, reach, or time saved where possible.");
  }

  const finalProblems = topProblems.slice(0, 3);
  const finalImprovements = Array.from(new Set(suggestedImprovements)).slice(0, 5);

  return {
    generated: true,
    fileName,
    targetRole,
    country,
    experienceLevel,
    extractedTextPreview: rawText.slice(0, 600),
    checks: {
      wordCount,
      hasEmail,
      hasPhone,
      hasSkills,
      hasExperience,
      hasEducation,
      achievementCount,
      matchedKeywords,
    },
    scores: [
      { label: "Overall CV Score", score: overallScore, accent: "#2563EB" },
      { label: "ATS Score", score: atsScore, accent: "#10B981" },
      { label: "Keyword Match", score: keywordScore, accent: "#2563EB" },
      { label: "Structure Score", score: structureScore, accent: "#10B981" },
    ],
    summary:
      overallScore >= 80
        ? `Your CV is in a strong place for ${targetRole || "the selected role"}, with clear structure and useful signals for ${country} applications.`
        : `Your CV has useful content, but it can improve for ${targetRole || "the selected role"} by strengthening structure, keywords, and measurable results.`,
    topProblems: finalProblems.length
      ? finalProblems
      : ["No major rule-based issues were detected in this basic review."],
    missingKeywords: missingKeywords.length ? missingKeywords : ["No major keyword gaps detected"],
    suggestedImprovements: finalImprovements.length
      ? finalImprovements
      : ["Keep tailoring the CV to each job description before applying."],
  };
}
