#!/usr/bin/env python3
"""Verify that the solution in the screenshot matches our expected solution."""

# The solution from the screenshot exactly as shown
screenshot_solution = """#include <string.h>

void strrev(char *dest, const char *src) {
    int len = strlen(src);
    for (int i = 0; i < len; i++) {
        dest[i] = src[len - i - 1];
    }
    dest[len] = '\\0';
}"""

# The expected correct solution from our reference
correct_solution = """#include <string.h> 
 
void strrev(char *dest, const char *src) { 
  int len = strlen(src); 
  for (int i = 0; i < len; i++) { 
    dest[i] = src[len - i - 1]; 
  } 
  dest[len] = '\\0'; 
}"""

def normalize(s):
    """Remove all whitespace and lowercase."""
    return ''.join(s.lower().split())

def normalize_whitespace(s):
    """Normalize whitespace only."""
    return ' '.join(s.split())

def normalize_exact(s):
    """Remove all newlines and spaces."""
    return s.replace('\n', '').replace(' ', '')

def compare_indent_style(s1, s2):
    """Compare the actual implementation logic, ignoring spacing/indentation."""
    lines1 = [line.strip() for line in s1.split('\n') if line.strip()]
    lines2 = [line.strip() for line in s2.split('\n') if line.strip()]
    return lines1 == lines2

# Compare using different methods
print("VERIFICATION OF SCREENSHOT SOLUTION")
print("=" * 50)
print("\nComparison Results:")
print("-" * 50)
print(f"Exact match: {screenshot_solution == correct_solution}")
print(f"Stripped match: {screenshot_solution.strip() == correct_solution.strip()}")
print(f"Normalized match: {normalize(screenshot_solution) == normalize(correct_solution)}")
print(f"Whitespace normalized match: {normalize_whitespace(screenshot_solution) == normalize_whitespace(correct_solution)}")
print(f"Exact normalized match: {normalize_exact(screenshot_solution) == normalize_exact(correct_solution)}")
print(f"Indent style match: {compare_indent_style(screenshot_solution, correct_solution)}")

# Print the normalized versions for comparison
print("\nNormalized versions for comparison:")
print("-" * 50)
print(f"Screenshot: {normalize(screenshot_solution)}")
print(f"Correct:    {normalize(correct_solution)}")

print("\nWhitespace normalized versions:")
print("-" * 50)
print(f"Screenshot: {normalize_whitespace(screenshot_solution)}")
print(f"Correct:    {normalize_whitespace(correct_solution)}")

print("\nExact normalized versions:")
print("-" * 50)
print(f"Screenshot: {normalize_exact(screenshot_solution)}")
print(f"Correct:    {normalize_exact(correct_solution)}")

# Line by line comparison
print("\nLine by line comparison:")
print("-" * 50)
screenshot_lines = [line.strip() for line in screenshot_solution.split('\n') if line.strip()]
correct_lines = [line.strip() for line in correct_solution.split('\n') if line.strip()]

for i, (line1, line2) in enumerate(zip(screenshot_lines, correct_lines)):
    match = line1 == line2
    print(f"Line {i+1}: {'MATCH' if match else 'DIFF'}")
    if not match:
        print(f"  Screenshot: {line1}")
        print(f"  Reference:  {line2}")

# Detailed character-by-character comparison of the original code
print("\nCharacter-by-character comparison:")
print("-" * 50)
for i, (c1, c2) in enumerate(zip(screenshot_solution, correct_solution)):
    if c1 != c2:
        # Get some context around the mismatch
        start = max(0, i - 10)
        end = min(len(screenshot_solution), i + 10)
        context = screenshot_solution[start:end]
        
        # Show the character codes for non-printable characters
        c1_display = f"'{c1}' (ord={ord(c1)})" if c1.isprintable() else f"ord={ord(c1)}"
        c2_display = f"'{c2}' (ord={ord(c2)})" if c2.isprintable() else f"ord={ord(c2)}"
        
        print(f"Difference at position {i}: {c1_display} vs {c2_display}")
        print(f"Context: '...{context}...'")

print("\nWould this solution pass with our custom validators?")
print("-" * 50)
custom_validation_methods = [
    screenshot_solution.strip() == correct_solution.strip(),
    normalize(screenshot_solution) == normalize(correct_solution),
    normalize_whitespace(screenshot_solution) == normalize_whitespace(correct_solution),
    normalize_exact(screenshot_solution) == normalize_exact(correct_solution),
    screenshot_solution.replace(' ', '').replace('\n', '') == correct_solution.replace(' ', '').replace('\n', ''),
    ''.join(screenshot_solution.split()) == ''.join(correct_solution.split())
]

if any(custom_validation_methods):
    print("✅ The solution WOULD PASS with at least one of our validation methods:")
    for i, method in enumerate(custom_validation_methods):
        if method:
            print(f"  - Method {i+1}: PASS")
        else:
            print(f"  - Method {i+1}: FAIL")
else:
    print("❌ The solution would NOT pass with any of our validation methods.")

print("\nSummary:")
print("-" * 50)
if any(custom_validation_methods):
    print("✅ The solution in the screenshot SHOULD NOW PASS with the updated validation.")
    print("   The modified validation scripts properly handle formatting differences.")
else:
    print("❌ The solutions still do NOT match with any validation method.")
    print("   Further investigation may be needed to determine the issue.") 