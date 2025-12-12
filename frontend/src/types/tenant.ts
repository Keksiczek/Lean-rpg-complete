export interface TenantConfig {
  tenant: {
    id: string;
    slug: string;
    name: string;
    language: string;
    timezone: string;
    primaryColor: string;
    secondaryColor: string;
    leanMethodologies: string[];
  };
  factories: Array<{
    id: string;
    name: string;
    type: string;
    zones: Array<{
      id: string;
      name: string;
      coordinates: { x: number; y: number };
      status: string;
    }>;
    workshops: Array<{
      id: string;
      name: string;
      redTags: number;
      activeTraining: number;
    }>;
  }>;
  auditTemplates: Array<{
    id: string;
    title: string;
    description: string;
    difficulty: string;
    category: string;
    items: Array<{ id: string; name: string; status?: string }>;
    xpReward: number;
  }>;
  lpaTemplates: Array<{
    id: string;
    title: string;
    description: string;
    frequency: string;
    questions: Array<{ id: string; question: string; category: string }>;
    xpReward: number;
  }>;
}

export interface TenantContextType {
  config: TenantConfig | null;
  isLoading: boolean;
  error: Error | null;
  tenantSlug: string | null;
  language: string;
  setLanguage: (lang: string) => void;
  refreshConfig: () => Promise<void>;
}
