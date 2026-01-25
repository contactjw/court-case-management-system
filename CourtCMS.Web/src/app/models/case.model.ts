export interface Case {
  id: number;
  caseNumber: string;
  title: string;
  status: string;
  filingDate: string;
  assignedJudgeName: string;
}

export interface CreateCaseRequest {
  caseNumber: string;
  title: string;
  assignedJudgeId: number;
}
