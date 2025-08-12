import { useEffect, useState } from 'react';
import { Attachment, getItemAttachments, uploadAttachment, deleteAttachment } from '@/api/files';

interface AttachmentListProps {
  itemId: string;
}

export default function AttachmentList({ itemId }: AttachmentListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getItemAttachments(itemId);
      setAttachments(data);
    })();
  }, [itemId]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const att = await uploadAttachment(itemId, file);
      setAttachments(prev => [att, ...prev]);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function onDelete(id: string) {
    await deleteAttachment(id);
    setAttachments(prev => prev.filter(a => a.id !== id));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="px-3 py-1 bg-gray-200 rounded cursor-pointer text-sm">
          {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" className="hidden" onChange={onUpload} disabled={uploading} />
        </label>
      </div>

      <div className="space-y-2">
        {attachments.map((att) => (
          <div key={att.id} className="flex items-center justify-between border rounded p-2 text-sm">
            <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {att.originalName}
            </a>
            <button className="text-red-600 hover:underline" onClick={() => onDelete(att.id)}>Delete</button>
          </div>
        ))}
        {attachments.length === 0 && <div className="text-xs text-gray-500">No attachments</div>}
      </div>
    </div>
  );
}