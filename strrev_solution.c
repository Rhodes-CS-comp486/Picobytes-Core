#include <string.h>

void strrev(char *dest, const char *src) {
  int len = strlen(src);
  for (int i = 0; i < len; i++) {
    dest[i] = src[len - i - 1];
  }
  dest[len] = '\0';
}

// Test program
#include <stdio.h>
#include <assert.h>

void do_test(char *input, char *expected) {
  char actual[256];
  
  strrev(actual, input);
  assert(strcmp(expected, actual) == 0);
}

void run_tests() {
  do_test("", "");
  do_test("!", "!");
   
  /* non-palindromic strings */
  do_test("o_O", "O_o");   
  do_test("live", "evil");
 
  /* palindromic strings */
  do_test("tacocat", "tacocat");
  do_test("step on no pets", "step on no pets");
  
  printf("All tests passed!\n");
}

int main() {
  run_tests();
  return 0;
} 