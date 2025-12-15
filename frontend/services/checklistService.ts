import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config';
import { ChecklistTemplate } from '../types';

export const checklistService = {
  getTemplates: async (): Promise<ChecklistTemplate[]> => {
    try {
      return await apiClient.get<ChecklistTemplate[]>(ENDPOINTS.AUDITS.CHECKLIST_TEMPLATES);
    } catch (e) {
      console.warn("Using mock templates");
      return mockTemplates;
    }
  },

  getTemplateById: async (id: string): Promise<ChecklistTemplate | null> => {
    try {
      return await apiClient.get<ChecklistTemplate>(`${ENDPOINTS.AUDITS.CHECKLIST_TEMPLATES}/${id}`);
    } catch (e) {
      return mockTemplates.find(t => t.id === id) || null;
    }
  },

  createTemplate: async (template: Partial<ChecklistTemplate>): Promise<ChecklistTemplate> => {
    return await apiClient.post<ChecklistTemplate>(ENDPOINTS.AUDITS.CHECKLIST_TEMPLATES, template);
  },

  updateTemplate: async (id: string, updates: Partial<ChecklistTemplate>): Promise<ChecklistTemplate> => {
    return await apiClient.put<ChecklistTemplate>(`${ENDPOINTS.AUDITS.CHECKLIST_TEMPLATES}/${id}`, updates);
  },

  deleteTemplate: async (id: string): Promise<void> => {
    return await apiClient.delete(`${ENDPOINTS.AUDITS.CHECKLIST_TEMPLATES}/${id}`);
  },

  cloneTemplate: async (id: string): Promise<ChecklistTemplate> => {
    // In real API: POST /api/audits/checklist-templates/:id/clone
    const template = mockTemplates.find(t => t.id === id);
    if (!template) throw new Error("Template not found");
    const newTemplate = {
      ...template,
      id: `t-${Date.now()}`,
      name: `${template.name} (Copy)`,
      version: 1,
      isPublished: false,
      createdAt: new Date().toISOString()
    };
    mockTemplates.push(newTemplate);
    return newTemplate;
  },

  publishTemplate: async (id: string, isPublished: boolean): Promise<ChecklistTemplate> => {
    return await apiClient.put<ChecklistTemplate>(`${ENDPOINTS.AUDITS.CHECKLIST_TEMPLATES}/${id}`, { isPublished });
  }
};

const mockTemplates: ChecklistTemplate[] = [
  {
    id: 't1',
    name: 'Daily 5S Audit',
    description: 'Standard daily check for production zones',
    category: '5S',
    version: 1,
    isPublic: true,
    isPublished: true,
    createdBy: 'u1',
    tenantId: 'magna',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 45,
    items: [
      { id: 'i1', question: 'Are walkways clear of obstructions?', expected_answer: 'Yes', scoring_weight: 5, guidance: 'Check all yellow lines.', photo_required: false, category: 'Sort' },
      { id: 'i2', question: 'Are tools in their designated shadow boards?', expected_answer: 'Yes', scoring_weight: 3, guidance: 'Look for missing tools.', photo_required: true, category: 'Set in Order' },
      { id: 'i3', question: 'Is the floor free of oil/debris?', expected_answer: 'Yes', scoring_weight: 5, guidance: 'Safety hazard.', photo_required: true, category: 'Shine' }
    ]
  },
  {
    id: 't2',
    name: 'Safety Walk',
    description: 'Weekly safety inspection',
    category: 'Safety',
    version: 2,
    isPublic: true,
    isPublished: true,
    createdBy: 'u1',
    tenantId: 'magna',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 12,
    items: [
      { id: 's1', question: 'Are fire exits unblocked?', expected_answer: 'Yes', scoring_weight: 10, guidance: 'Critical safety check.', photo_required: true, category: 'Safety' },
      { id: 's2', question: 'Is PPE available and used?', expected_answer: 'Yes', scoring_weight: 5, guidance: 'Glasses and shoes.', photo_required: false, category: 'Safety' }
    ]
  }
];
