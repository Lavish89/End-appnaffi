// Sammelt alle Werkzeuge und ihre Kategorien an einer Stelle.
import type { MarketingTool } from './marketingTools';
import { MARKETING_TOOLS } from './marketingTools';
import { MORE_TOOLS } from './moreTools';

export type { MarketingTool, ToolValues } from './marketingTools';

export const ALL_TOOLS: MarketingTool[] = [...MARKETING_TOOLS, ...MORE_TOOLS];

// Kategorien in der Reihenfolge ihres ersten Auftretens
export const ALL_CATEGORIES: string[] = Array.from(new Set(ALL_TOOLS.map((t) => t.category)));
