'use client';

import React, { useState, ChangeEvent } from 'react';
import MDEditor, { MDEditorProps } from '@uiw/react-md-editor';
import style from './MdEditor.module.scss';

// Define interface for video component props
interface VideoComponentProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src?: string; // Make src optional to match expected type
}

const MarkdownEditor: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(
    '# Пример Markdown\n\nВведите ваш текст здесь...',
  );

  // Function to handle MD file upload
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>): void => {
        if (e.target?.result) {
          setMarkdown(e.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  // Function to save MD file
  const handleSave = (): void => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'edited-markdown.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="markdown-editor-container">
      <h2>Редактор Markdown</h2>
      <input
        type="file"
        accept=".md"
        onChange={handleFileUpload}
        style={{ marginBottom: '10px' }}
      />
      <MDEditor
        value={markdown}
        onChange={(value: string | undefined) => setMarkdown(value || '')}
        preview="live"
        height={400}
        visibleDragbar={true}
        previewOptions={{
          components: {
            video: ({ src, ...props }: VideoComponentProps) =>
              src ? <video controls src={src} style={{ maxWidth: '100%' }} {...props} /> : null,
          },
        }}
      />
      <button onClick={handleSave} style={{ marginTop: '10px' }}>
        Сохранить как MD-файл
      </button>
    </div>
  );
};

export default MarkdownEditor;
