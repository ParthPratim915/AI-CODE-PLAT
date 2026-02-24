import { SupportedLanguage } from '@/components/editor/editor.types';

const DEFAULTS: Record<SupportedLanguage, string> = {
  javascript: `function solution() {
  console.log("Hello World");
}`,

  typescript: `function solution(): void {
  console.log("Hello World");
}`,

  python: `def solution():
    print("Hello World")`,

  java: `class Main {
  public static void main(String[] args) {
    System.out.println("Hello World");
  }
}`,

  cpp: `#include <iostream>
using namespace std;

int main() {
  cout << "Hello World";
  return 0;
}`,

  c: `#include <stdio.h>

int main() {
  printf("Hello World");
  return 0;
}`,

  csharp: `using System;

class Program {
  static void Main() {
    Console.WriteLine("Hello World");
  }
}`,

  go: `package main
import "fmt"

func main() {
  fmt.Println("Hello World")
}`,

  php: `<?php
echo "Hello World";
?>`,

  ruby: `puts "Hello World"`,
};

export function getStarterCode(
  starter: Record<string, string> | undefined,
  language: SupportedLanguage
) {
  if (starter && starter[language]) return starter[language];
  return DEFAULTS[language];
}
