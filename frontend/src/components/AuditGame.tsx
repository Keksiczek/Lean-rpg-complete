"use client";

import { useMemo, useState } from "react";
import { API_BASE_URL } from "@/src/constants";
import { TenantError } from "@/src/components/TenantError";
import { TenantLoadingSkeleton } from "@/src/components/TenantLoadingSkeleton";
import { useTenant } from "@/src/hooks/useTenant";

const difficultyOptions = ["all", "easy", "medium", "hard"] as const;

export function AuditGame() {
  const { config, isLoading, error, refreshConfig } = useTenant();
  const audits = useMemo(() => config?.auditTemplates ?? [], [config?.auditTemplates]);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<(typeof difficultyOptions)[number]>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [itemStatus, setItemStatus] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<string>("");

  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      const matchesDifficulty =
        difficultyFilter === "all" || audit.difficulty.toLowerCase() === difficultyFilter;
      const matchesCategory = categoryFilter === "all" || audit.category === categoryFilter;
      return matchesDifficulty && matchesCategory;
    });
  }, [audits, categoryFilter, difficultyFilter]);

  const selectedAudit = audits.find((audit) => audit.id === selectedAuditId) ?? null;

  const handleStartAudit = (auditId: string) => {
    setSelectedAuditId(auditId);
    setFeedback("");
    const audit = audits.find((entry) => entry.id === auditId);
    if (audit) {
      const initialStatus = audit.items.reduce<Record<string, boolean>>((acc, item) => {
        acc[item.id] = Boolean(item.status === "done");
        return acc;
      }, {});
      setItemStatus(initialStatus);
    }
  };

  const handleToggleItem = (itemId: string) => {
    setItemStatus((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const completedCount = useMemo(() => {
    return Object.values(itemStatus).filter(Boolean).length;
  }, [itemStatus]);

  const handleCompleteAudit = async () => {
    if (!selectedAudit) return;
    const payload = {
      auditId: selectedAudit.id,
      completedItems: Object.entries(itemStatus)
        .filter(([, done]) => done)
        .map(([id]) => id),
    };

    try {
      await fetch(`${API_BASE_URL}/api/audits/${selectedAudit.id}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setFeedback(`Audit complete! Earned ${selectedAudit.xpReward} XP.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save audit results";
      setFeedback(message);
    }
  };

  if (isLoading) return <TenantLoadingSkeleton />;
  if (error) return <TenantError error={error} onRetry={() => refreshConfig()} />;

  if (!audits.length) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold">Available Audits</h2>
        <p className="text-sm text-gray-600 mt-2">No audits configured for this tenant.</p>
      </div>
    );
  }

  if (selectedAudit) {
    const totalItems = selectedAudit.items.length || 1;
    const progress = Math.round((completedCount / totalItems) * 100);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{selectedAudit.title}</h2>
            <p className="text-sm text-gray-600">{selectedAudit.description}</p>
          </div>
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline"
            onClick={() => setSelectedAuditId(null)}
          >
            ← Back to list
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-600">Difficulty: {selectedAudit.difficulty}</p>
              <p className="text-sm text-gray-600">Category: {selectedAudit.category}</p>
            </div>
            <div className="text-sm font-semibold">XP Reward: {selectedAudit.xpReward}</div>
          </div>

          <div className="w-full bg-gray-100 h-3 rounded-full mb-4">
            <div
              className="h-3 rounded-full bg-green-500"
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <ul className="space-y-2">
            {selectedAudit.items.map((item) => (
              <li key={item.id} className="flex items-start gap-3 border rounded p-3">
                <input
                  type="checkbox"
                  checked={Boolean(itemStatus[item.id])}
                  onChange={() => handleToggleItem(item.id)}
                  className="mt-1"
                  aria-label={`Mark ${item.name} as complete`}
                />
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.status && (
                    <p className="text-xs text-gray-600">Status: {item.status}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-700">
              Progress: {completedCount}/{selectedAudit.items.length}
            </span>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleCompleteAudit}
            >
              Complete Audit
            </button>
          </div>
          {feedback && <p className="text-sm text-gray-700 mt-3">{feedback}</p>}
        </div>
      </div>
    );
  }

  const categories = Array.from(new Set(audits.map((audit) => audit.category)));

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Available Audits</h2>
          <p className="text-sm text-gray-600">Choose a template to start a checklist.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <label className="text-sm text-gray-700">
            Difficulty
            <select
              className="ml-2 border rounded px-2 py-1"
              value={difficultyFilter}
              onChange={(event) =>
                setDifficultyFilter(event.target.value as (typeof difficultyOptions)[number])
              }
            >
              {difficultyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-gray-700">
            Category
            <select
              className="ml-2 border rounded px-2 py-1"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">all</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAudits.map((audit) => (
          <button
            key={audit.id}
            type="button"
            onClick={() => handleStartAudit(audit.id)}
            className="text-left bg-white border rounded-lg p-4 shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <h3 className="text-lg font-semibold mb-1">{audit.title}</h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{audit.description}</p>
            <div className="text-xs text-gray-500 flex gap-4">
              <span>Difficulty: {audit.difficulty}</span>
              <span>Category: {audit.category}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
