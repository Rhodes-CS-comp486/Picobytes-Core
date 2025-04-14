from flask import Blueprint, jsonify, request, session
import sys
import os
import logging

# Fix import paths
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.coding_question_service import CodingQuestionService

# Create Blueprint
coding_questions_bp = Blueprint('coding_questions', __name__)
coding_question_service = CodingQuestionService()

logger = logging.getLogger(__name__)

@coding_questions_bp.route('/api/coding-questions', methods=['GET'])
def get_coding_questions():
    """
    Get all coding questions.
    """
    try:
        questions = coding_question_service.get_coding_questions()
        return jsonify({
            "questions": questions,
            "total_questions": len(questions)
        })
    except Exception as e:
        logger.error(f"Error fetching coding questions: {e}")
        return jsonify({"error": str(e)}), 500

@coding_questions_bp.route('/api/coding-questions/<int:qid>', methods=['GET'])
def get_coding_question(qid):
    """
    Get a specific coding question by ID.
    """
    try:
        question = coding_question_service.get_coding_question(qid)
        if question:
            return jsonify(question)
        else:
            return jsonify({"error": f"Question with ID {qid} not found"}), 404
    except Exception as e:
        logger.error(f"Error fetching coding question {qid}: {e}")
        return jsonify({"error": str(e)}), 500

@coding_questions_bp.route('/api/coding-questions/<int:qid>/submit', methods=['POST'])
def submit_coding_answer(qid):
    """
    Submit a solution to a coding question.
    """
    try:
        # Check if user is authenticated
        if 'user_id' not in session:
            return jsonify({"error": "User not authenticated"}), 401
            
        # Get user ID from session
        user_id = session.get('user_id')
        
        # Get submitted code from request
        data = request.get_json()
        if not data or 'code' not in data:
            return jsonify({"error": "Missing code submission"}), 400
            
        user_code = data.get('code')
        
        # Validate the submission
        validation_result = coding_question_service.validate_coding_submission(qid, user_code)
        
        # Return validation result
        return jsonify(validation_result)
        
    except Exception as e:
        logger.error(f"Error submitting answer for coding question {qid}: {e}")
        return jsonify({"error": str(e)}), 500

# Testing endpoint that doesn't require authentication
@coding_questions_bp.route('/api/coding-questions/<int:qid>/test', methods=['POST'])
def test_coding_answer(qid):
    """
    Test a solution to a coding question without requiring authentication.
    This is useful for testing during development or allowing guest users to try questions.
    """
    try:
        # Get submitted code from request
        data = request.get_json()
        if not data or 'code' not in data:
            return jsonify({"error": "Missing code submission"}), 400
            
        user_code = data.get('code')
        
        # Validate the submission
        validation_result = coding_question_service.validate_coding_submission(qid, user_code)
        
        # Return validation result
        return jsonify(validation_result)
        
    except Exception as e:
        logger.error(f"Error testing answer for coding question {qid}: {e}")
        return jsonify({"error": str(e)}), 500 