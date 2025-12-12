"use client";

import { createContext } from "react";
import type { TenantContextType } from "@/src/types/tenant";

export const TenantContext = createContext<TenantContextType | undefined>(undefined);
