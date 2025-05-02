#!/usr/bin/env python3
"""Test script for the strrev validation issue."""

# Define the correct solution
correct_solution = """#include <string.h>

void strrev(char *dest, const char *src) {
  int len = strlen(src);
  for (int i = 0; i < len; i++) {
    dest[i] = src[len - i - 1];
  }
  dest[len] = '\\0';
}"""

# Function to normalize code for comparison
def normalize(code):
    """Remove all whitespace and lowercase to ensure consistent comparison."""
    return ''.join(code.lower().split())

# Simpler normalization just focusing on whitespace
def normalize_whitespace(code):
    """Normalize whitespace only."""
    return ' '.join(code.split())

# Check 1: Exact match with trimming
exact_solution = """#include <string.h> 
 
void strrev(char *dest, const char *src) { 
  int len = strlen(src); 
  for (int i = 0; i < len; i++) { 
    dest[i] = src[len - i - 1]; 
  } 
  dest[len] = '\\0'; 
}"""

print("Test 1 - Exact match with trimming:")
print(f"Match: {correct_solution.strip() == exact_solution.strip()}")

# Check 2: Normalized comparison
print("\nTest 2 - Normalized comparison (no whitespace):")
print(f"Match: {normalize(correct_solution) == normalize(exact_solution)}")

# Check 3: Whitespace-only normalization
print("\nTest 3 - Whitespace normalization:")
print(f"Match: {normalize_whitespace(correct_solution) == normalize_whitespace(exact_solution)}")

# Print the normalized versions for comparison
print("\nNormalized versions:")
print(f"Correct: {normalize(correct_solution)}")
print(f"Expected: {normalize(exact_solution)}")

print("\nWhitespace normalized versions:")
print(f"Correct: {normalize_whitespace(correct_solution)}")
print(f"Expected: {normalize_whitespace(exact_solution)}")

# Extract function signature for direct comparison
def extract_signature(code):
    """Extract just the function signature line."""
    lines = code.split('\n')
    for line in lines:
        if "void strrev" in line:
            return line.strip()
    return None

print("\nFunction signature comparison:")
print(f"Correct: {extract_signature(correct_solution)}")
print(f"Expected: {extract_signature(exact_solution)}") 