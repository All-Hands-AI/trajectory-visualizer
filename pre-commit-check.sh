#!/bin/bash

echo "Running TypeScript compiler..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "TypeScript compiler failed. Please fix the errors before committing."
  exit 1
fi

echo "Running tests..."
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Please fix the failing tests before committing."
  exit 1
fi

echo "All checks passed! You can now commit your changes."
exit 0