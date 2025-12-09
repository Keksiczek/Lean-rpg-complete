"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Quest } from '@/components/game/quest-card';

export default function QuestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questId = useMemo(() => {
    const value = params?.id;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!questId) return;
    const fetchQuest = async () => {
      try {
        const response = await api.get(`/api/quests/${questId}`);
        setQuest(response.data as Quest);
      } catch (err) {
        console.error('Unable to load quest detail', err);
        setError('Nepodařilo se načíst detail úkolu.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuest();
  }, [questId]);

  const handleSubmit = async () => {
    if (!questId || !submission.trim()) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await api.post('/api/submissions', {
        questId: Number(questId),
        content: submission,
      });
      setMessage('Úkol odeslán ke kontrole!');
      setTimeout(() => {
        router.push('/quests');
      }, 800);
    } catch (err) {
      console.error('Unable to submit quest', err);
      setError('Nepodařilo se odeslat řešení. Zkuste to prosím znovu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-700">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Načítám detail úkolu...</span>
      </div>
    );
  }

  if (!quest) {
    return (
      <Card title="Úkol nenalezen" description="Zkontrolujte prosím odkaz nebo se vraťte zpět na seznam úkolů.">
        <Link href="/quests" className="text-sm font-medium text-primary hover:underline">
          Zpět na seznam
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Detail questu</p>
          <h1 className="text-2xl font-semibold text-gray-900">{quest.title}</h1>
        </div>
        <Button variant="secondary" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Zpět
        </Button>
      </div>

      <Card>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{quest.baseXp} XP</Badge>
            {quest.leanConcept ? <Badge variant="outline">Lean: {quest.leanConcept}</Badge> : null}
          </div>
          <p className="text-gray-700">{quest.description}</p>
          {quest.briefText ? (
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold">Stručný příběh</p>
              <p className="mt-1 leading-relaxed">{quest.briefText}</p>
            </div>
          ) : null}
        </div>
      </Card>

      <Card title="Odevzdat řešení" description="Popište své řešení nebo přidejte odkaz na soubor.">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700" htmlFor="submission">
            Textové řešení
          </label>
          <textarea
            id="submission"
            className="w-full rounded-lg border border-gray-200 p-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-blue-100"
            rows={6}
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
            placeholder="Popište svůj postup, přínosy nebo přidejte odkaz na soubor."
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-green-600">{message}</p> : null}
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={submitting || !submission.trim()} className="inline-flex items-center gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Odeslat řešení
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
