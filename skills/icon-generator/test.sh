#!/bin/bash

echo "🧪 Testing Icon Generator Skill"
echo "================================"

# Test 1: Basic generation
echo ""
echo "Test 1: Basic rocket icon..."
node generate.js "rocket icon" test-output/test1.svg

# Test 2: Tron style
echo ""
echo "Test 2: Tron-style CPU icon..."
node generate.js "CPU processor chip, tron style, cyan" test-output/test2.svg

# Test 3: Cloud icon
echo ""
echo "Test 3: Cloud icon..."
node generate.js "cloud storage icon" test-output/test3.svg

# Test 4: Minimal style
echo ""
echo "Test 4: Minimal gear icon..."
node generate.js "settings gear, minimal, single color" test-output/test4.svg

echo ""
echo "✅ All tests complete!"
echo "Check test-output/ for generated icons"
