import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config';
import { AuditSession, AuditResponse, AuditFinding } from '../types';

export const auditService = {
  getAudits: async (): Promise<AuditSession[]> => {
    try {
      return await apiClient.get<AuditSession[]>(ENDPOINTS.AUDITS.BASE);
    } catch (e) {
      console.warn("Using mock audits");
      return mockAudits;
    }
  },

  getPendingAudits: async (): Promise<AuditSession[]> => {
    try {
      return await apiClient.get<AuditSession[]>(`${ENDPOINTS.AUDITS.BASE}?status=submitted`);
    } catch (e) {
      return mockAudits.filter(a => a.status === 'submitted');
    }
  },

  getAuditById: async (id: string): Promise<AuditSession | null> => {
    try {
      return await apiClient.get<AuditSession>(`${ENDPOINTS.AUDITS.BASE}/${id}`);
    } catch (e) {
      return mockAudits.find(a => a.id === id) || null;
    }
  },

  startAudit: async (checklistId: string, workplaceId: string, auditorId: string): Promise<AuditSession> => {
     // POST /api/audits
     const newAudit: AuditSession = {
         id: `a-${Date.now()}`,
         checklistId,
         workplaceId,
         auditorId,
         status: 'in_progress',
         responses: [],
         photoEvidence: [],
         findings: [],
         overallCompliance: 100,
         riskLevel: 'Green',
         score: 0,
         xpEarned: 0,
         startTime: new Date().toISOString(),
         createdAt: new Date().toISOString(),
         workplaceName: 'Assembly Line A', // Mock
         checklistName: 'Daily 5S' // Mock
     };
     mockAudits.push(newAudit);
     return newAudit;
  },

  saveResponse: async (auditId: string, response: AuditResponse): Promise<void> => {
    // PATCH /api/audits/:id/response
    const audit = mockAudits.find(a => a.id === auditId);
    if (audit) {
        const existingIdx = audit.responses.findIndex(r => r.itemId === response.itemId);
        if (existingIdx >= 0) {
            audit.responses[existingIdx] = response;
        } else {
            audit.responses.push(response);
        }
    }
  },

  submitAudit: async (auditId: string, responses: AuditResponse[], findings: AuditFinding[], score: number, risk: "Green"|"Yellow"|"Red"): Promise<AuditSession> => {
    const audit = mockAudits.find(a => a.id === auditId);
    if (!audit) throw new Error("Audit not found");
    
    audit.status = 'submitted';
    audit.responses = responses;
    audit.findings = findings;
    audit.overallCompliance = score;
    audit.riskLevel = risk;
    audit.score = score;
    audit.endTime = new Date().toISOString();

    return audit;
  },

  approveAudit: async (id: string, reviewerId: string, comments: string): Promise<AuditSession> => {
    const audit = mockAudits.find(a => a.id === id);
    if (audit) {
        audit.status = 'approved';
    }
    return await apiClient.put<AuditSession>(`${ENDPOINTS.AUDITS.BASE}/${id}${ENDPOINTS.AUDITS.APPROVE}`, {
      reviewerId,
      comments,
      status: 'approved'
    });
  },

  rejectAudit: async (id: string, reviewerId: string, feedback: string): Promise<AuditSession> => {
    const audit = mockAudits.find(a => a.id === id);
    if (audit) {
        audit.status = 'rejected';
    }
    return audit!;
  }
};

const mockAudits: AuditSession[] = [
  {
    id: 'a1',
    checklistId: 't1',
    checklistName: 'Daily 5S Audit',
    workplaceId: 'wp-1',
    workplaceName: 'Assembly Line A',
    auditorId: 'u2',
    auditorName: 'John Operator',
    status: 'submitted',
    responses: [],
    photoEvidence: [],
    findings: [],
    overallCompliance: 92,
    riskLevel: 'Green',
    score: 92,
    xpEarned: 150,
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() - 86000000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'a2',
    checklistId: 't1',
    checklistName: 'Daily 5S Audit',
    workplaceId: 'wp-3',
    workplaceName: 'Warehouse Dispatch',
    auditorId: 'u2',
    auditorName: 'John Operator',
    status: 'approved',
    responses: [],
    photoEvidence: [],
    findings: [
       { itemId: 'i3', severity: 'Major', description: 'Oil leak near forklift area', approved: true }
    ],
    overallCompliance: 65,
    riskLevel: 'Red',
    score: 65,
    xpEarned: 100,
    startTime: new Date(Date.now() - 172800000).toISOString(),
    endTime: new Date(Date.now() - 172000000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  }
];
