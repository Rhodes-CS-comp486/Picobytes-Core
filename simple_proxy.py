#!/usr/bin/env python3
"""
Simple proxy server to forward requests from the Picobytes-Core backend to the execute-test service.

This can help overcome network issues between the two services.
"""
from flask import Flask, request, jsonify
import requests
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# Target execute-test service URL
TARGET_URL = "http://localhost:5001"

@app.route('/')
def home():
    """Root endpoint, forwards to the execute-test service root."""
    try:
        response = requests.get(f"{TARGET_URL}/")
        return response.text, response.status_code
    except Exception as e:
        logging.error(f"Error forwarding request to root: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/submit', methods=['POST'])
def forward_submit():
    """Forward /submit requests to the execute-test service."""
    try:
        # Get the request data
        data = request.get_json()
        logging.info(f"Received submit request with {len(data['code'])} bytes of code")
        
        # Forward to the target service
        logging.info(f"Forwarding to {TARGET_URL}/submit")
        response = requests.post(f"{TARGET_URL}/submit", json=data)
        
        # Log the response
        logging.info(f"Received response with status {response.status_code}")
        
        # Return the response
        return response.json(), response.status_code
    except Exception as e:
        logging.error(f"Error forwarding submit request: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/encoded', methods=['POST'])
def forward_encoded():
    """Forward /encoded requests to the execute-test service."""
    try:
        # Get the request data
        data = request.get_json()
        logging.info(f"Received encoded request with data")
        
        # Forward to the target service
        logging.info(f"Forwarding to {TARGET_URL}/encoded")
        response = requests.post(f"{TARGET_URL}/encoded", json=data)
        
        # Log the response
        logging.info(f"Received response with status {response.status_code}")
        
        # Return the response
        return response.json(), response.status_code
    except Exception as e:
        logging.error(f"Error forwarding encoded request: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Use a different port (5002) to avoid conflicts
    logging.info("Starting proxy server on port 5002")
    app.run(host='0.0.0.0', port=5002, debug=True) 