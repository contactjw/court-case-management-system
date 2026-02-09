export interface Case {
  id: number;
  caseNumber: string;
  title: string;
  status: string;
  filingDate: string;
  assignedJudgeName: string;

  assignedJudgeId?: number;
}

export interface CreateCaseRequest {
  caseNumber: string;
  title: string;
  assignedJudgeId: number | null;
}

export interface CaseParty {
  partyId: number;
  fullName: string;
  role: string;
}

export interface Hearing {
  id: number;
  description: string;
  hearingDate: string;
  location: string;
}

export interface CaseDetail {
  id: number;
  caseNumber: string;
  title: string;
  status: string;
  filingDate: string;
  createdDate: string;
  lastModifiedDate?: string;
  assignedJudgeName: string;
  parties: CaseParty[];
  hearings: Hearing[];
}
