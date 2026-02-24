#!/bin/bash

LANGUAGE=$1
FILE=$2

cd /workspace

case "$LANGUAGE" in
  python)
    python3 "$FILE"
    ;;
  javascript)
    node "$FILE"
    ;;
  java)
    javac Main.java && java Main
    ;;
  cpp)
    g++ main.cpp -o main && ./main
    ;;
  c)
    gcc main.c -o main && ./main
    ;;
  go)
    go run main.go
    ;;
  rust)
    rustc main.rs && ./main
    ;;
  php)
    php main.php
    ;;
  ruby)
    ruby main.rb
    ;;
  csharp)
    mcs main.cs && mono main.exe
    ;;
  *)
    echo "Unsupported language"
    exit 1
    ;;
esac
