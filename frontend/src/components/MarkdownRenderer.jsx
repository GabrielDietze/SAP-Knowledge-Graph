import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const STORAGE_MARKER = '/storage/v1/object/public/attachments/';

function fileIcon(url) {
  const ext = url.split('.').pop().toLowerCase().split('?')[0];
  if (ext === 'pdf') return '📄';
  if (['xml', 'xsd', 'xslt'].includes(ext)) return '📋';
  if (['json', 'yaml', 'yml'].includes(ext)) return '📊';
  if (['csv'].includes(ext)) return '📊';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';
  if (['xls', 'xlsx'].includes(ext)) return '📗';
  if (['doc', 'docx'].includes(ext)) return '📘';
  if (['ppt', 'pptx'].includes(ext)) return '📙';
  if (['txt', 'log'].includes(ext)) return '📃';
  return '📎';
}

export const mdComponents = {
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt || ''}
      style={{
        maxWidth: '100%',
        borderRadius: 6,
        margin: '8px 0',
        display: 'block',
        border: '1px solid #1e293b',
      }}
    />
  ),
  a: ({ href, children }) => {
    if (href?.includes(STORAGE_MARKER)) {
      const raw = href.split('/').pop();
      const filename = decodeURIComponent(raw.replace(/^\d+-/, ''));
      const label = typeof children === 'string' && children !== href ? children : filename;
      return (
        <a
          href={href}
          download={filename}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'inline-flex' }}
        >
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-sm border border-[#334155] hover:border-slate-500 transition-colors cursor-pointer">
            <span>{fileIcon(href)}</span>
            <span className="truncate max-w-[280px]">{label}</span>
            <span className="text-slate-500 text-xs shrink-0">↓</span>
          </span>
        </a>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
        {children}
      </a>
    );
  },
};

const components = mdComponents;

export default function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
