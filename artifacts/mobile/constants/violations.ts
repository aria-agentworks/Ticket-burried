export type ViolationType = "parking" | "camera" | "bank" | "airline" | "hoa";
export type CaseStatus =
  | "analysing"
  | "analysed"
  | "confirmed"
  | "submitted"
  | "won"
  | "lost"
  | "withdrawn";
export type DefenceStrength = "strong" | "moderate" | "weak";
export type Recommendation = "fight" | "negotiate" | "pay";

export interface Defence {
  title: string;
  strength: DefenceStrength;
  explanation: string;
  evidenceNeeded: string;
}

export interface CaseAnalysis {
  successProbability: number;
  confidenceLevel: "high" | "medium" | "low";
  primaryDefence: string;
  defences: Defence[];
  recommendation: Recommendation;
  recommendationReason: string;
  appealLetter: string;
  submissionMethod: string;
  deadlineDays: number;
}

export interface Case {
  id: string;
  violationType: ViolationType;
  status: CaseStatus;
  fineAmount: number;
  notes: string;
  createdAt: string;
  meta: Record<string, string>;
  analysis?: CaseAnalysis;
  recoveredAmount?: number;
}

export const VIOLATION_TYPES: Record<
  ViolationType,
  {
    id: ViolationType;
    label: string;
    iconName: string;
    avgSuccessRate: number;
    avgFine: number;
    color: string;
    description: string;
    fields: Array<{
      key: string;
      label: string;
      placeholder: string;
      required?: boolean;
      type?: "text" | "select";
      options?: string[];
    }>;
  }
> = {
  parking: {
    id: "parking",
    label: "Parking Ticket",
    iconName: "map-pin",
    avgSuccessRate: 32,
    avgFine: 65,
    color: "#F59E0B",
    description: "Fight parking citations with jurisdiction-specific defences",
    fields: [
      { key: "plate", label: "License Plate", placeholder: "e.g. ABC 1234", required: true },
      { key: "issueDate", label: "Issue Date", placeholder: "MM/DD/YYYY", required: true },
      { key: "violationCode", label: "Violation Code", placeholder: "e.g. CVC 22500" },
      { key: "officerBadge", label: "Officer Badge #", placeholder: "Optional" },
      { key: "location", label: "Location", placeholder: "Street where ticketed" },
    ],
  },
  camera: {
    id: "camera",
    label: "Traffic Camera",
    iconName: "camera",
    avgSuccessRate: 28,
    avgFine: 158,
    color: "#EF4444",
    description: "Contest red-light and speed camera violations",
    fields: [
      { key: "intersection", label: "Intersection / Camera ID", placeholder: "e.g. Main & Oak, Cam #147", required: true },
      {
        key: "cameraType",
        label: "Camera Type",
        placeholder: "Select type",
        required: true,
        type: "select",
        options: ["Red Light", "Speed"],
      },
      { key: "speedAlleged", label: "Speed Alleged", placeholder: "e.g. 45 in a 35 zone" },
      {
        key: "wereYouDriving",
        label: "Were you driving?",
        placeholder: "Select",
        type: "select",
        options: ["Yes", "No - different driver", "Not sure"],
      },
    ],
  },
  bank: {
    id: "bank",
    label: "Bank / Card Fee",
    iconName: "credit-card",
    avgSuccessRate: 71,
    avgFine: 34,
    color: "#10B981",
    description: "Recover overdraft, NSF, and late payment fees",
    fields: [
      { key: "bankName", label: "Bank Name", placeholder: "e.g. Chase, Bank of America", required: true },
      {
        key: "feeType",
        label: "Fee Type",
        placeholder: "Select fee type",
        required: true,
        type: "select",
        options: ["Overdraft", "NSF / Returned Item", "Late Payment", "Monthly Fee", "Other"],
      },
      { key: "feeDate", label: "Fee Date", placeholder: "MM/DD/YYYY" },
      {
        key: "accountType",
        label: "Account Type",
        placeholder: "Select",
        type: "select",
        options: ["Checking", "Savings", "Credit Card"],
      },
      {
        key: "optedInOverdraft",
        label: "Did you opt into overdraft protection?",
        placeholder: "Select",
        type: "select",
        options: ["Yes", "No", "Not sure"],
      },
    ],
  },
  airline: {
    id: "airline",
    label: "Airline Disruption",
    iconName: "navigation",
    avgSuccessRate: 54,
    avgFine: 420,
    color: "#3B82F6",
    description: "Claim EU261 / US DOT compensation for delays & cancellations",
    fields: [
      { key: "flightNumber", label: "Flight Number", placeholder: "e.g. AA 1234", required: true },
      { key: "flightDate", label: "Flight Date", placeholder: "MM/DD/YYYY", required: true },
      { key: "origin", label: "Origin Airport", placeholder: "e.g. LAX" },
      { key: "destination", label: "Destination Airport", placeholder: "e.g. LHR" },
      {
        key: "disruptionType",
        label: "What happened?",
        placeholder: "Select",
        required: true,
        type: "select",
        options: ["Delay 2-3hrs", "Delay 3hrs+", "Cancellation", "Denied Boarding"],
      },
      { key: "reasonGiven", label: "Reason Given by Airline", placeholder: "e.g. weather, crew, mechanical" },
    ],
  },
  hoa: {
    id: "hoa",
    label: "HOA Fine",
    iconName: "home",
    avgSuccessRate: 41,
    avgFine: 120,
    color: "#8B5CF6",
    description: "Challenge HOA fines using CC&R procedural defences",
    fields: [
      { key: "hoaName", label: "HOA Name", placeholder: "e.g. Sunset Ridge HOA", required: true },
      { key: "violationDescription", label: "Violation Description", placeholder: "What they cited you for", required: true },
      { key: "fineDate", label: "Fine Date", placeholder: "MM/DD/YYYY" },
      { key: "propertyAddress", label: "Property Address", placeholder: "Your property address" },
      {
        key: "warningGiven",
        label: "Were you given a warning first?",
        placeholder: "Select",
        type: "select",
        options: ["Yes", "No", "Not sure"],
      },
    ],
  },
};

export const STATUS_CONFIG: Record<
  CaseStatus,
  { label: string; color: string; bg: string }
> = {
  analysing: { label: "Analysing", color: "#B45309", bg: "#FEF3C7" },
  analysed: { label: "Ready to Fight", color: "#1D4ED8", bg: "#DBEAFE" },
  confirmed: { label: "Appeal Ready", color: "#6D28D9", bg: "#EDE9FE" },
  submitted: { label: "Submitted", color: "#374151", bg: "#F3F4F6" },
  won: { label: "Won", color: "#065F46", bg: "#D1FAE5" },
  lost: { label: "Lost", color: "#991B1B", bg: "#FEE2E2" },
  withdrawn: { label: "Withdrawn", color: "#6B7280", bg: "#F9FAFB" },
};

const MOCK_ANALYSES: Record<ViolationType, Partial<CaseAnalysis>> = {
  parking: {
    primaryDefence: "Improper signage — the posted restriction was ambiguous or not clearly visible from the approach",
    defences: [
      {
        title: "Defective or Obscured Signage",
        strength: "strong",
        explanation: "If the posted sign was damaged, blocked by foliage, or not visible from the direction of approach, the citation is legally defective.",
        evidenceNeeded: "Photo of the sign from driver's perspective at time of parking",
      },
      {
        title: "Expired Parking Meter Malfunction",
        strength: "moderate",
        explanation: "If the meter was malfunctioning, many jurisdictions require the officer to note it. A working meter that failed gives grounds for dismissal.",
        evidenceNeeded: "Meter receipt if available, or testimony of malfunction",
      },
      {
        title: "Medical or Emergency Stop",
        strength: "moderate",
        explanation: "An unexpected medical necessity or emergency can justify a momentary parking violation.",
        evidenceNeeded: "Medical documentation or witness statement",
      },
      {
        title: "Ticket Issued Outside Restriction Window",
        strength: "strong",
        explanation: "If the ticket was issued outside the legally posted hours, it must be dismissed.",
        evidenceNeeded: "Photo of sign showing restriction hours vs. exact ticket timestamp",
      },
    ],
    recommendation: "fight",
    recommendationReason:
      "Parking tickets have a strong dismissal rate for procedural issues. Even one valid defence is typically enough for a hearing officer to rule in your favour.",
    submissionMethod: "Online portal",
    deadlineDays: 30,
  },
  camera: {
    primaryDefence: "Camera calibration records may show the device was not properly certified at time of violation",
    defences: [
      {
        title: "Camera Calibration / Certification",
        strength: "strong",
        explanation: "All traffic cameras must be regularly calibrated and certified. You can request these records — if they were overdue, the evidence is inadmissible.",
        evidenceNeeded: "FOIA/public records request for calibration logs",
      },
      {
        title: "Owner vs. Driver Liability",
        strength: "strong",
        explanation: "In many states, camera tickets are civil penalties on the vehicle owner, not the driver. If someone else was driving, you may be entitled to name them.",
        evidenceNeeded: "Signed declaration identifying the actual driver",
      },
      {
        title: "Yellow Light Timing",
        strength: "moderate",
        explanation: "Federal guidelines require minimum yellow light duration based on speed limit. Cameras at intersections with short yellows are legally challengeable.",
        evidenceNeeded: "Intersection timing records via FOIA request",
      },
    ],
    recommendation: "fight",
    recommendationReason:
      "Camera tickets have the highest technical challenge rate. Calibration and owner-liability defences succeed frequently without requiring in-person hearings.",
    submissionMethod: "Mail or online portal",
    deadlineDays: 21,
  },
  bank: {
    primaryDefence: "As a first-time customer in good standing, you are entitled to a courtesy waiver under the bank's own published policy",
    defences: [
      {
        title: "First-Time Courtesy Waiver",
        strength: "strong",
        explanation: "Most major banks have an unpublished policy to waive the first overdraft or NSF fee per year for customers in good standing. A direct, polite request almost always succeeds.",
        evidenceNeeded: "Account history showing no prior waivers",
      },
      {
        title: "Regulation E Violation",
        strength: "strong",
        explanation: "Federal law (Reg E) prohibits charging overdraft fees on ATM and one-time debit card transactions unless you specifically opted in. If you didn't opt in, the fee is illegal.",
        evidenceNeeded: "Signed opt-in form — bank must produce it or refund the fee",
      },
      {
        title: "Bank Processing Order Manipulation",
        strength: "moderate",
        explanation: "Banks that reorder transactions to maximize fees (high-to-low processing) have been subject to class action suits and regulatory action. Document the order.",
        evidenceNeeded: "Bank statement showing transaction processing order",
      },
    ],
    recommendation: "fight",
    recommendationReason:
      "Bank fees have the highest waiver success rate of any category. A single phone call or written demand typically results in full reversal within days.",
    submissionMethod: "Phone call or written demand",
    deadlineDays: 60,
  },
  airline: {
    primaryDefence: "Under EU261/2004 or US DOT regulations, you are entitled to compensation based on the delay duration and route distance",
    defences: [
      {
        title: "EU261 Statutory Entitlement",
        strength: "strong",
        explanation: "For flights departing from or arriving in the EU (on EU carriers), delays of 3+ hours entitle you to €250–€600 compensation. Cancellations trigger the same rights.",
        evidenceNeeded: "Boarding pass, booking confirmation, and flight status record",
      },
      {
        title: "US DOT Involuntary Bumping",
        strength: "strong",
        explanation: "If you were denied boarding on an oversold flight, US DOT requires 4x the one-way fare (up to $1,550) in compensation — airlines must pay if they don't offer it.",
        evidenceNeeded: "Denial of boarding documentation",
      },
      {
        title: "Extraordinary Circumstances Defence Rebuttal",
        strength: "moderate",
        explanation: "Airlines often claim 'extraordinary circumstances' to avoid EU261 payouts. Technical faults, crew issues, and ATC delays within their network are NOT extraordinary — they are still liable.",
        evidenceNeeded: "Delay reason documentation and ATC logs if available",
      },
    ],
    recommendation: "fight",
    recommendationReason:
      "Airlines routinely deny valid compensation claims hoping passengers won't push back. A formal written demand with the correct legal citation succeeds in the majority of cases.",
    submissionMethod: "Email / airline claims portal",
    deadlineDays: 180,
  },
  hoa: {
    primaryDefence: "The HOA failed to follow mandatory notice and cure procedures required by your state's HOA statute before imposing a fine",
    defences: [
      {
        title: "Failure to Provide Opportunity to Cure",
        strength: "strong",
        explanation: "Most state HOA laws require a written notice and a minimum period to correct the violation before a fine can be levied. If skipped, the fine is procedurally void.",
        evidenceNeeded: "All written communications from HOA prior to fine",
      },
      {
        title: "CC&R Ambiguity",
        strength: "moderate",
        explanation: "If the CC&R provision being enforced is vague or unclear, courts routinely hold that ambiguities must be construed against the HOA (the drafter).",
        evidenceNeeded: "Copy of the relevant CC&R section",
      },
      {
        title: "Selective Enforcement",
        strength: "moderate",
        explanation: "If other residents have committed the same violation without penalty, the HOA's selective enforcement against you is discriminatory and challengeable.",
        evidenceNeeded: "Photos or witness statements of similar violations not fined",
      },
      {
        title: "Fine Exceeds Statutory Limit",
        strength: "strong",
        explanation: "Many states cap HOA fines. If the imposed fine exceeds the statutory maximum, you are entitled to a reduction as a matter of law.",
        evidenceNeeded: "Your state's HOA statute and the fine amount",
      },
    ],
    recommendation: "fight",
    recommendationReason:
      "HOA procedural errors are extremely common. A formal dispute letter citing the specific statutory violations often results in full waiver to avoid the cost of a hearing.",
    submissionMethod: "Certified mail to HOA board",
    deadlineDays: 30,
  },
};

export function generateMockAnalysis(
  violationType: ViolationType,
  fineAmount: number
): CaseAnalysis {
  const template = MOCK_ANALYSES[violationType];
  const baseProbability = VIOLATION_TYPES[violationType].avgSuccessRate;
  const probability = Math.min(
    95,
    Math.max(15, baseProbability + Math.floor(Math.random() * 30) - 10)
  );
  const confidence =
    probability > 60 ? "high" : probability > 40 ? "medium" : "low";

  const appealLetter = generateAppealLetter(violationType, fineAmount, template);

  return {
    successProbability: probability,
    confidenceLevel: confidence,
    primaryDefence: template.primaryDefence!,
    defences: template.defences!,
    recommendation: template.recommendation!,
    recommendationReason: template.recommendationReason!,
    appealLetter,
    submissionMethod: template.submissionMethod!,
    deadlineDays: template.deadlineDays!,
  };
}

function generateAppealLetter(
  type: ViolationType,
  amount: number,
  template: Partial<CaseAnalysis>
): string {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const headers: Record<ViolationType, string> = {
    parking: "RE: Formal Appeal of Parking Citation",
    camera: "RE: Formal Contest of Traffic Camera Violation",
    bank: "RE: Request for Fee Reversal",
    airline: "RE: Formal Claim for Compensation",
    hoa: "RE: Formal Dispute of HOA Fine",
  };

  const bodies: Record<ViolationType, string> = {
    parking: `I am writing to formally appeal the above-referenced parking citation issued on the date noted. After careful review, I respectfully submit that this citation should be dismissed on the following grounds:\n\n1. ${template.defences?.[0]?.title}: ${template.defences?.[0]?.explanation}\n\n2. ${template.defences?.[1]?.title}: ${template.defences?.[1]?.explanation}\n\nBased on the foregoing, I respectfully request that this citation be dismissed in its entirety. I am prepared to present additional evidence at a hearing if required.`,
    camera: `I am writing to formally contest the above-referenced camera-issued violation. I dispute the validity of this citation on the following legal and technical grounds:\n\n1. ${template.defences?.[0]?.title}: ${template.defences?.[0]?.explanation}\n\n2. ${template.defences?.[1]?.title}: ${template.defences?.[1]?.explanation}\n\nI respectfully request all calibration and certification records for the issuing camera device, and ask that this matter be reviewed and dismissed.`,
    bank: `I am writing to formally request the reversal of a fee of $${amount} charged to my account. I am a valued customer and request this reversal on the following grounds:\n\n1. ${template.defences?.[0]?.title}: ${template.defences?.[0]?.explanation}\n\n2. ${template.defences?.[1]?.title}: ${template.defences?.[1]?.explanation}\n\nI have maintained my account in good standing and respectfully request a one-time courtesy reversal of this fee. I look forward to your prompt response.`,
    airline: `Dear Customer Relations Department,\n\nI am writing to formally claim compensation for the disruption to my flight. Pursuant to applicable regulations, I am entitled to compensation on the following basis:\n\n1. ${template.defences?.[0]?.title}: ${template.defences?.[0]?.explanation}\n\n2. ${template.defences?.[1]?.title}: ${template.defences?.[1]?.explanation}\n\nI request that you confirm receipt of this claim and process the applicable compensation within 14 days. Should you fail to respond, I reserve the right to escalate to the relevant regulatory authority.`,
    hoa: `I am writing to formally dispute the fine of $${amount} imposed by the Association. After reviewing applicable state law and the Association's governing documents, I respectfully submit that this fine must be rescinded on the following grounds:\n\n1. ${template.defences?.[0]?.title}: ${template.defences?.[0]?.explanation}\n\n2. ${template.defences?.[1]?.title}: ${template.defences?.[1]?.explanation}\n\nI request that the Board review this matter at its earliest convenience and confirm in writing the rescission of this fine.`,
  };

  return `${date}\n\nTo Whom It May Concern,\n\n${headers[type]}\n\n${bodies[type]}\n\nThank you for your attention to this matter.\n\nRespectfully,\n[Your Name]\n[Your Address]\n[Your Contact Information]`;
}
