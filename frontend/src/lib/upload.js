import { supabase } from './supabase';

const BUCKET = 'attachments';

export async function uploadFile(file, nodeId = 'general') {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${nodeId}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, name: file.name, mimeType: file.type };
}
