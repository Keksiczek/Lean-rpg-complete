import type { AuditScene } from "@/types/audit";

export const AUDIT_SCENES: AuditScene[] = [
  {
    id: "assembly-line-1",
    name: "Assembly Line - Basic",
    imageUrl: "/images/audit/assembly-line-1.jpg",
    difficulty: "easy",
    timeLimit: 300,
    problems: [
      {
        id: "1",
        x: 100,
        y: 150,
        radius: 40,
        category: "seiri",
        description: "Old broken equipment on shelf",
      },
      {
        id: "2",
        x: 250,
        y: 200,
        radius: 35,
        category: "seiton",
        description: "Tools scattered on table",
      },
      {
        id: "3",
        x: 400,
        y: 180,
        radius: 45,
        category: "seiso",
        description: "Oil spill on floor",
      },
      {
        id: "4",
        x: 150,
        y: 350,
        radius: 40,
        category: "seiketsu",
        description: "No labels on containers",
      },
      {
        id: "5",
        x: 350,
        y: 320,
        radius: 35,
        category: "shitsuke",
        description: "Safety equipment not in place",
      },
    ],
  },
];
