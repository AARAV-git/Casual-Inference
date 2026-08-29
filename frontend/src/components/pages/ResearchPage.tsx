'use client';

import { useEffect, useState } from 'react';
import { getHypotheses, getMethodology, getExperimentsWriteup, getFindings } from '@/lib/api/research';
import CausalGraph3D from '@/components/CausalGraph3D';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Beaker, FileText, Lightbulb } from 'lucide-react';

export default function ResearchPage() {
  const [hypotheses, setHypotheses] = useState<Array<{ id: string; text: string }>>([]);
  const [methodology, setMethodology] = useState('');
  const [experiments, setExperiments] = useState('');
  const [findings, setFindings] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [h, m, e, f] = await Promise.all([getHypotheses(), getMethodology(), getExperimentsWriteup(), getFindings()]);
      setHypotheses(h);
      setMethodology(m);
      setExperiments(e);
      setFindings(f);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-grid-line rounded-lg p-4">
        <CausalGraph3D mode="static" />
      </div>

      <div className="bg-surface border border-grid-line rounded-lg p-4">
        <h3 className="font-heading text-sm font-semibold mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-intervention-amber" /> Research Hypotheses</h3>
        <div className="space-y-2">
          {hypotheses.map((h) => (
            <div key={h.id} className="flex items-start gap-3 p-3 rounded-lg bg-bg border border-grid-line">
              <span className="font-stat text-xs text-intervention-amber mt-0.5 shrink-0">{h.id}</span>
              <p className="text-sm text-text-primary">{h.text}</p>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="findings" className="w-full">
        <TabsList className="bg-surface border border-grid-line">
          <TabsTrigger value="findings" className="data-[state=active]:bg-signal-teal data-[state=active]:text-bg"><FileText className="w-3 h-3 mr-1" /> Findings</TabsTrigger>
          <TabsTrigger value="methodology" className="data-[state=active]:bg-signal-teal data-[state=active]:text-bg"><BookOpen className="w-3 h-3 mr-1" /> Methodology</TabsTrigger>
          <TabsTrigger value="experiments" className="data-[state=active]:bg-signal-teal data-[state=active]:text-bg"><Beaker className="w-3 h-3 mr-1" /> Experiments</TabsTrigger>
        </TabsList>
        <TabsContent value="findings" className="mt-4 bg-surface border border-grid-line rounded-lg p-6">
          <div className="prose prose-invert prose-sm max-w-none [&_h1]:font-heading [&_h1]:text-lg [&_h1]:text-text-primary [&_h2]:font-heading [&_h2]:text-base [&_h2]:text-text-primary [&_h3]:font-heading [&_h3]:text-sm [&_h3]:text-text-primary [&_p]:text-text-primary/80 [&_table]:text-sm [&_th]:text-text-muted [&_td]:text-text-primary [&_td]:font-stat [&_td]:text-xs [&_strong]:text-signal-teal [&_code]:font-stat [&_code]:text-xs">
            <ReactMarkdown>{findings}</ReactMarkdown>
          </div>
        </TabsContent>
        <TabsContent value="methodology" className="mt-4 bg-surface border border-grid-line rounded-lg p-6">
          <div className="prose prose-invert prose-sm max-w-none [&_h1]:font-heading [&_h1]:text-lg [&_h1]:text-text-primary [&_h2]:font-heading [&_h2]:text-base [&_h2]:text-text-primary [&_h3]:font-heading [&_h3]:text-sm [&_h3]:text-text-primary [&_p]:text-text-primary/80 [&_table]:text-sm [&_th]:text-text-muted [&_td]:text-text-primary [&_td]:font-stat [&_td]:text-xs [&_strong]:text-signal-teal [&_code]:font-stat [&_code]:text-xs">
            <ReactMarkdown>{methodology}</ReactMarkdown>
          </div>
        </TabsContent>
        <TabsContent value="experiments" className="mt-4 bg-surface border border-grid-line rounded-lg p-6">
          <div className="prose prose-invert prose-sm max-w-none [&_h1]:font-heading [&_h1]:text-lg [&_h1]:text-text-primary [&_h2]:font-heading [&_h2]:text-base [&_h2]:text-text-primary [&_h3]:font-heading [&_h3]:text-sm [&_h3]:text-text-primary [&_p]:text-text-primary/80 [&_table]:text-sm [&_th]:text-text-muted [&_td]:text-text-primary [&_td]:font-stat [&_td]:text-xs [&_strong]:text-signal-teal [&_code]:font-stat [&_code]:text-xs">
            <ReactMarkdown>{experiments}</ReactMarkdown>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}