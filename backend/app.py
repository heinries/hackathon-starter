"""Stage 1: a local Flask API for questionnaire capture in SQLite."""

from contextlib import closing
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import sqlite3

from flask import Flask, jsonify, request

app = Flask(__name__)
app.config['DATABASE'] = Path(__file__).resolve().parent / 'data' / 'hackathon.db'


def validate_submission(data):
    """Normalize form fields and reject invalid JSON values."""
    if not isinstance(data, dict):
        raise ValueError('Send a valid JSON object with Content-Type: application/json.')

    required = ('first_name', 'last_name', 'email', 'zip_code')
    optional = ('phone', 'service_reason', 'additional_information')
    cleaned = {}
    for field in required + optional:
        value = data.get(field, '')
        if not isinstance(value, str):
            raise ValueError(f'{field} must be a string.')
        cleaned[field] = value.strip()
        if field in required and not cleaned[field]:
            raise ValueError(f'{field} is required.')

    if not re.fullmatch(r'[^\s@]+@[^\s@]+', cleaned['email']):
        raise ValueError('Email must be a valid email address.')
    if not re.fullmatch(r'[0-9]{5}', cleaned['zip_code']):
        raise ValueError('ZIP code must contain exactly 5 digits.')

    # These example choices match questionnaire.html; update both together.
    reasons = ('', 'information', 'assistance', 'volunteer', 'other')
    if cleaned['service_reason'] not in reasons:
        raise ValueError('service_reason must match a questionnaire option.')
    interests = data.get('interests', [])
    choices = ('community', 'transportation', 'emergency_preparedness', 'events', 'other')
    if not isinstance(interests, list) or any(
        not isinstance(item, str) or item not in choices for item in interests
    ):
        raise ValueError('interests must be a list of questionnaire topic values.')
    cleaned['interests'] = list(dict.fromkeys(interests))

    for field in ('email_updates', 'sms_updates'):
        value = data.get(field, False)
        if not isinstance(value, bool):
            raise ValueError(f'{field} must be a JSON boolean (true or false).')
        cleaned[field] = value
    return cleaned


def store_submission(data):
    """Create storage when needed and insert one validated submission."""
    database = Path(app.config['DATABASE'])
    database.parent.mkdir(parents=True, exist_ok=True)
    # SQLite's transaction context commits/rolls back but does not close connections.
    with closing(sqlite3.connect(database)) as connection:
        with connection:
            connection.execute('''
                CREATE TABLE IF NOT EXISTS questionnaire_submissions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    first_name TEXT NOT NULL,
                    last_name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    zip_code TEXT NOT NULL,
                    service_reason TEXT NOT NULL,
                    interests TEXT NOT NULL,
                    additional_information TEXT NOT NULL,
                    email_updates INTEGER NOT NULL CHECK (email_updates IN (0, 1)),
                    sms_updates INTEGER NOT NULL CHECK (sms_updates IN (0, 1)),
                    created_at TEXT NOT NULL
                )
            ''')
            cursor = connection.execute('''
                INSERT INTO questionnaire_submissions (
                    first_name, last_name, email, phone, zip_code, service_reason,
                    interests, additional_information, email_updates, sms_updates,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data['first_name'], data['last_name'], data['email'], data['phone'],
                data['zip_code'], data['service_reason'], json.dumps(data['interests']),
                data['additional_information'], int(data['email_updates']),
                int(data['sms_updates']), datetime.now(timezone.utc).isoformat(),
            ))
            submission_id = cursor.lastrowid
    return submission_id


@app.get('/api/health')
def health():
    """Report that the API is running."""
    return jsonify(status='ok', service='hackathon-starter'), 200


@app.post('/api/questionnaire')
def submit_questionnaire():
    """Validate JSON and store questionnaire data without sending notifications."""
    try:
        data = validate_submission(request.get_json(silent=True))
    except ValueError as error:
        return jsonify(status='error', message=str(error)), 400

    try:
        submission_id = store_submission(data)
    except (sqlite3.Error, OSError):
        app.logger.exception('Unable to store questionnaire submission')
        return jsonify(status='error', message='Unable to save submission. Try again later.'), 500

    return jsonify(
        status='success',
        message='Questionnaire submitted successfully.',
        submission_id=submission_id,
    ), 201


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
