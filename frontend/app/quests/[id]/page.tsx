import { notFound } from 'next/navigation';
import QuestDetailContent from '@/components/quests/QuestDetailContent';
import { fetchQuest } from '@/lib/api/quests';

interface QuestDetailPageProps {
  params: {
    id: string;
  };
}

export default async function QuestDetailPage({ params }: QuestDetailPageProps) {
  const questId = Number.parseInt(params.id, 10);

  if (Number.isNaN(questId)) {
    notFound();
  }

  try {
    const quest = await fetchQuest(questId);

    if (!quest) {
      notFound();
    }

    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <QuestDetailContent quest={quest} />
        </div>
      </main>
    );
  } catch (error) {
    console.error('Failed to fetch quest:', error);
    notFound();
  }
}

export const dynamic = 'force-dynamic';
