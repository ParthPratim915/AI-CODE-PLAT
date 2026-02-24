'use client';

import Editor from '@monaco-editor/react';
import { EditorProps } from './editor.types';

export default function CodeEditor({ language, value, onChange }: EditorProps) {
  return (
    <Editor
      height="400px"
      language={language}
      value={value}
      theme="vs-dark"
      onChange={(val) => onChange(val ?? '')}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
      }}
    />
  );
}
