export interface Case {
  id: number;
  caseNumber: string;
  title: string;
  status: string;
  filingDate: string;
  assignedJudgeName: string;

  assignedJudgeId?: number;

  isEditing?: boolean;
}

export interface CreateCaseRequest {
  caseNumber: string;
  title: string;
  assignedJudgeId: number;
}
