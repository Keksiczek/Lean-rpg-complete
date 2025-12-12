"use client";

import { useMemo, useState } from "react";
import { API_BASE_URL } from "@/src/constants";
import { TenantError } from "@/src/components/TenantError";
import { TenantLoadingSkeleton } from "@/src/components/TenantLoadingSkeleton";
import { useTenant } from "@/src/hooks/useTenant";

const ANSWERS = ["Compliant", "Needs Improvement", "Not Applicable", "Escalate"];

export function LPAGame() {
  const { config, isLoading, error, refreshConfig } = useTenant();
  const lpaAudits = useMemo(() => config?.lpaTemplates ?? [], [config?.lpaTemplates]);

  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [resultMessage, setResultMessage] = useState<string>("");
  const [answers, setAnswers] = useState<string[]>([]);

  const selectedAudit = useMemo(
    () => lpaAudits.find((audit) => audit.id === selectedAuditId) ?? null,
    [lpaAudits, selectedAuditId]
  );

  const resetAudit = () => {
    setSelectedAuditId(null);
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setResultMessage("");
  };

  const handleStartAudit = (auditId: string) => {
    setSelectedAuditId(auditId);
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setResultMessage("");
  };

  const handleAnswer = async (answer: string) => {
    if (!selectedAudit) return;
    const question = selectedAudit.questions[currentQuestion];
    const isCorrect = ANSWERS[0] === answer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setAnswers((prev) => [...prev, answer]);

    try {
      await fetch(`${API_BASE_URL}/api/lpa/${selectedAudit.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, answer }),
      });
    } catch (err) {
      console.warn("Unable to validate LPA answer", err);
    }

    if (currentQuestion + 1 < selectedAudit.questions.length) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      const totalQuestions = selectedAudit.questions.length;
      const xpEarned = Math.round((score + (isCorrect ? 1 : 0)) / totalQuestions * selectedAudit.xpReward);
      setResultMessage(`Quiz complete! Score: ${score + (isCorrect ? 1 : 0)}/${totalQuestions}. XP: ${xpEarned}`);
    }
  };

  if (isLoading) return <TenantLoadingSkeleton />;
  if (error) return <TenantError error={error} onRetry={() => refreshConfig()} />;

  if (!lpaAudits.length) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold">Layered Process Audits</h2>
        <p className="text-sm text-gray-600 mt-2">No LPA templates configured for this tenant.</p>
      </div>
    );
  }

  if (selectedAudit) {
    const totalQuestions = selectedAudit.questions.length;
    const question = selectedAudit.questions[currentQuestion];
    const progress = Math.round(((currentQuestion + (resultMessage ? 1 : 0)) / totalQuestions) * 100);

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
            onClick={resetAudit}
          >
            ← Back to list
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4 text-sm text-gray-700">
            <span>
              Question {Math.min(currentQuestion + 1, totalQuestions)} / {totalQuestions}
            </span>
            <span>XP Reward: {selectedAudit.xpReward}</span>
          </div>

          {!resultMessage ? (
            <div className="space-y-4">
              <p className="text-lg font-semibold">{question.question}</p>
              <div className="grid md:grid-cols-2 gap-3">
                {ANSWERS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="border rounded-lg p-3 text-left hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full">
                <div
                  className="h-3 rounded-full bg-blue-500"
                  style={{ width: `${progress}%` }}
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg font-semibold">{resultMessage}</p>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={resetAudit}
              >
                Start another audit
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Layered Process Audits</h2>
        <p className="text-sm text-gray-600">Launch a quiz from the available templates.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lpaAudits.map((audit) => (
          <button
            key={audit.id}
            type="button"
            onClick={() => handleStartAudit(audit.id)}
            className="text-left bg-white border rounded-lg p-4 shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <h3 className="text-lg font-semibold mb-1">{audit.title}</h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{audit.description}</p>
            <div className="text-xs text-gray-500 flex gap-4">
              <span>Frequency: {audit.frequency}</span>
              <span>XP: {audit.xpReward}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
