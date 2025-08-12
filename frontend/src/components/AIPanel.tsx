import { useEffect, useState } from 'react';
import {
  aiRequest,
  suggestTasks,
  summarizeMeeting,
  generateTimeline,
  reviewCode,
  getAIHistory,
} from '@/api/ai';

interface AIPanelProps {
  workspaceId: string;
}

interface AIHistoryItem {
  id: string;
  type: string;
  request: any;
  response: any;
  createdAt: string;
}

export default function AIPanel({ workspaceId }: AIPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [transcript, setTranscript] = useState('');
  const [context, setContext] = useState('');
  const [goals, setGoals] = useState('');
  const [code, setCode] = useState('');
  const [history, setHistory] = useState<AIHistoryItem[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    (async () => {
      const h = await getAIHistory(workspaceId);
      setHistory(h);
    })();
  }, [workspaceId]);

  async function run<T>(label: string, fn: () => Promise<T>) {
    try {
      setLoading(label);
      const res: any = await fn();
      const text = res?.content || res?.text || JSON.stringify(res, null, 2);
      setResult(text);
      const h = await getAIHistory(workspaceId);
      setHistory(h);
    } catch (e: any) {
      setResult(`Error: ${e?.message || 'Unknown error'}`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="w-96 border-l bg-white h-full flex flex-col">
      <div className="p-3 border-b font-semibold">AI Assistant</div>
      <div className="p-3 space-y-4 overflow-auto">
        <div>
          <div className="text-sm font-medium mb-1">General Prompt</div>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} className="w-full border rounded p-2 text-sm" placeholder="Ask anything about your workspace..." />
          <button disabled={!!loading} onClick={() => run('request', () => aiRequest(workspaceId, { prompt }))} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">Run</button>
        </div>

        <div>
          <div className="text-sm font-medium mb-1">Suggest Tasks</div>
          <textarea value={context} onChange={e => setContext(e.target.value)} rows={3} className="w-full border rounded p-2 text-sm" placeholder="Provide context (e.g., meeting notes, goals)..." />
          <button disabled={!!loading} onClick={() => run('suggest', () => suggestTasks(workspaceId, { context }))} className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50">Suggest</button>
        </div>

        <div>
          <div className="text-sm font-medium mb-1">Summarize Meeting</div>
          <textarea value={transcript} onChange={e => setTranscript(e.target.value)} rows={3} className="w-full border rounded p-2 text-sm" placeholder="Paste meeting transcript..." />
          <button disabled={!!loading} onClick={() => run('summary', () => summarizeMeeting(workspaceId, { transcript }))} className="mt-2 px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 disabled:opacity-50">Summarize</button>
        </div>

        <div>
          <div className="text-sm font-medium mb-1">Generate Timeline</div>
          <textarea value={goals} onChange={e => setGoals(e.target.value)} rows={3} className="w-full border rounded p-2 text-sm" placeholder="Outline project goals..." />
          <button disabled={!!loading} onClick={() => run('timeline', () => generateTimeline(workspaceId, { goals }))} className="mt-2 px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700 disabled:opacity-50">Generate</button>
        </div>

        <div>
          <div className="text-sm font-medium mb-1">Code Review</div>
          <textarea value={code} onChange={e => setCode(e.target.value)} rows={5} className="w-full border rounded p-2 text-sm font-mono" placeholder="Paste code for review..." />
          <button disabled={!!loading} onClick={() => run('review', () => reviewCode(workspaceId, { code }))} className="mt-2 px-3 py-1 bg-rose-600 text-white rounded text-sm hover:bg-rose-700 disabled:opacity-50">Review</button>
        </div>

        <div>
          <div className="text-sm font-medium mb-1">Result</div>
          <pre className="w-full border rounded p-2 text-xs bg-gray-50 whitespace-pre-wrap">{result}</pre>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Recent AI Activity</div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {history.map((h) => (
              <div key={h.id} className="border rounded p-2 text-xs">
                <div className="font-medium">{h.type}</div>
                <div className="text-gray-600">{new Date(h.createdAt).toLocaleString()}</div>
              </div>
            ))}
            {history.length === 0 && <div className="text-xs text-gray-500">No AI activity yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}