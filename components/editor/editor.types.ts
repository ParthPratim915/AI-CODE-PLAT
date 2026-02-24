export type SupportedLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'c'
  | 'csharp'
  | 'go'
  | 'php'
  | 'ruby';

export interface EditorProps {
  language: SupportedLanguage;
  value: string;
  onChange: (code: string) => void;
}
