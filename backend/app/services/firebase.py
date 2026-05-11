from __future__ import annotations

from typing import Any

from ..settings import settings


_firebase_app = None
_firestore_client = None


def get_firebase_status() -> dict[str, Any]:
    client = _get_firestore_client()
    return {
        'enabled': client is not None,
        'projectId': settings.firebase_project_id,
    }


def persist_trade_snapshot(trade: dict[str, Any], dashboard: dict[str, Any]) -> bool:
    client = _get_firestore_client()
    if client is None:
        return False

    try:
        client.collection('trades').document(str(trade['id'])).set({
            **trade,
            'createdAt': _server_timestamp(),
        })
        client.collection('portfolioSnapshots').add({
            'portfolioValue': dashboard.get('portfolioValue'),
            'cash': dashboard.get('cash'),
            'pnl': dashboard.get('pnl'),
            'profile': dashboard.get('profile'),
            'createdAt': _server_timestamp(),
        })
        return True
    except Exception:
        return False


def _get_firestore_client():
    global _firebase_app, _firestore_client

    if _firestore_client is not None:
        return _firestore_client

    if not settings.firebase_project_id or not settings.firebase_client_email or not settings.firebase_private_key:
        return None

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        if not firebase_admin._apps:
            credential = credentials.Certificate(
                {
                    'type': 'service_account',
                    'project_id': settings.firebase_project_id,
                    'client_email': settings.firebase_client_email,
                    'private_key': settings.firebase_private_key.replace('\\n', '\n'),
                    'token_uri': 'https://oauth2.googleapis.com/token',
                }
            )
            _firebase_app = firebase_admin.initialize_app(credential, {
                'projectId': settings.firebase_project_id,
                'databaseURL': settings.firebase_database_url,
            })

        _firestore_client = firestore.client()
        return _firestore_client
    except Exception:
        return None


def _server_timestamp() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat()
