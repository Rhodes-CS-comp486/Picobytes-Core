#!/usr/bin/env python3
"""
Script to fix the strrev validation issue.

This script should be run in the same directory as the code_execution_service.py
file that needs to be updated.
"""

import os
import re
import shutil
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Define the correct solution that should be accepted - EXACTLY as shown in the screenshot
CORRECT_SOLUTION = """#include <string.h>

void strrev(char *dest, const char *src) {
    int len = strlen(src);
    for (int i = 0; i < len; i++) {
        dest[i] = src[len - i - 1];
    }
    dest[len] = '\\0';
}"""

def fix_code_execution_service():
    """Fix the strrev validation in code_execution_service.py."""
    # Path to the file
    file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 
                            "Picobytes/backend/services/code_execution_service.py")
    
    # Create a backup
    backup_path = file_path + ".bak"
    shutil.copy2(file_path, backup_path)
    logger.info(f"Created backup of original file: {backup_path}")
    
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Find the strrev_solution definition
        pattern = r'strrev_solution\s*=\s*""".*?"""'
        match = re.search(pattern, content, re.DOTALL)
        
        if match:
            # Replace the solution with the correct one (maintaining proper indentation)
            start_pos = match.start()
            end_pos = match.end()
            indentation = ""
            
            # Find the indentation before the line
            line_start = content.rfind('\n', 0, start_pos) + 1
            indentation = content[line_start:start_pos]
            
            # Prepare the correctly formatted solution with proper indentation
            formatted_solution = CORRECT_SOLUTION.replace('\n', '\n' + indentation)
            new_solution = f'strrev_solution = """{formatted_solution}"""'
            
            # Replace the solution
            modified_content = content[:start_pos] + new_solution + content[end_pos:]
            
            # Enhance the comparison logic to be more flexible
            # Find the is_exact_solution condition
            exact_pattern = r'is_exact_solution\s*=\s*\(.*?\)'
            exact_match = re.search(exact_pattern, modified_content, re.DOTALL)
            
            if exact_match:
                enhanced_comparison = """is_exact_solution = (
            normalize(code) == normalize(strrev_solution) or
            ' '.join(code.split()) == ' '.join(strrev_solution.split()) or
            code.strip() == strrev_solution.strip() or
            code.replace('\\n', '').replace(' ', '') == strrev_solution.replace('\\n', '').replace(' ', '') or
            # Additional check for the screenshot solution with 4-space indentation
            code.replace(' ', '').replace('\\n', '') == strrev_solution.replace(' ', '').replace('\\n', '')
        )"""
                modified_content = modified_content[:exact_match.start()] + enhanced_comparison + modified_content[exact_match.end():]
            
            # Write the modified content back to the file
            with open(file_path, 'w') as f:
                f.write(modified_content)
            
            logger.info(f"Successfully updated {file_path}")
            return True
        else:
            logger.error("Could not find strrev_solution definition in the file")
            return False
    
    except Exception as e:
        logger.error(f"Error updating file: {e}")
        # Restore from backup in case of error
        shutil.copy2(backup_path, file_path)
        logger.info("Restored original file from backup")
        return False

def fix_coding_question_service():
    """Fix the strrev validation in coding_question_service.py."""
    # Path to the file
    file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 
                            "Picobytes/backend/services/coding_question_service.py")
    
    # Create a backup
    backup_path = file_path + ".bak"
    shutil.copy2(file_path, backup_path)
    logger.info(f"Created backup of original file: {backup_path}")
    
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Find the exact_strrev_solution definition
        pattern = r'exact_strrev_solution\s*=\s*""".*?"""'
        match = re.search(pattern, content, re.DOTALL)
        
        if match:
            # Replace the solution with the correct one (maintaining proper indentation)
            start_pos = match.start()
            end_pos = match.end()
            indentation = ""
            
            # Find the indentation before the line
            line_start = content.rfind('\n', 0, start_pos) + 1
            indentation = content[line_start:start_pos]
            
            # Prepare the correctly formatted solution with proper indentation
            formatted_solution = CORRECT_SOLUTION.replace('\n', '\n' + indentation)
            new_solution = f'exact_strrev_solution = """{formatted_solution}"""'
            
            # Replace the solution
            modified_content = content[:start_pos] + new_solution + content[end_pos:]
            
            # Add an additional check that compares normalized code (remove all whitespace)
            add_check_pattern = r'clean_user\s*==\s*clean_exact\s*or\s*standard_clean_user\s*==\s*standard_clean_exact'
            add_check_match = re.search(add_check_pattern, modified_content)
            
            if add_check_match:
                enhanced_check = """clean_user == clean_exact or 
                standard_clean_user == standard_clean_exact or
                user_code.replace('\\n', '').replace(' ', '') == exact_strrev_solution.replace('\\n', '').replace(' ', '') or
                # Additional check specifically for the screenshot solution
                ''.join(user_code.split()) == ''.join(exact_strrev_solution.split())"""
                
                modified_content = modified_content[:add_check_match.start()] + enhanced_check + modified_content[add_check_match.end():]
            
            # Write the modified content back to the file
            with open(file_path, 'w') as f:
                f.write(modified_content)
            
            logger.info(f"Successfully updated {file_path}")
            return True
        else:
            logger.error("Could not find exact_strrev_solution definition in the file")
            return False
    
    except Exception as e:
        logger.error(f"Error updating file: {e}")
        # Restore from backup in case of error
        shutil.copy2(backup_path, file_path)
        logger.info("Restored original file from backup")
        return False

if __name__ == "__main__":
    logger.info("Starting strrev validation fix")
    
    # Fix both files
    success1 = fix_code_execution_service()
    success2 = fix_coding_question_service()
    
    if success1 and success2:
        logger.info("Successfully fixed strrev validation in both files")
    else:
        logger.error("Failed to update one or both files. Check the logs.") 