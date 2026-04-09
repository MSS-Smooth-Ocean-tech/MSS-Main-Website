import os
from fastapi import Request, HTTPException, status
from firebase_admin import auth
from tools.firebase_utils import get_firestore_data
from cachetools import TTLCache

# Cache for Firestore permissions doc (5 minutes)
perm_cache = TTLCache(maxsize=1, ttl=300)
# Cache for Session Cookies (5 minutes) to avoid check_revoked network calls every time
session_cache = TTLCache(maxsize=100, ttl=300)


def get_USERS_MSS():
    if 'USERS/maritimesupports.com' in perm_cache:
        allowed_users_doc = perm_cache['USERS/maritimesupports.com']
    else:
        allowed_users_doc = get_firestore_data('USERS/maritimesupports.com')
        if allowed_users_doc:
            perm_cache['USERS/maritimesupports.com'] = allowed_users_doc
    return allowed_users_doc


def clear_auth_cache():
    """Clear the permission cache to force fresh fetch from Firestore"""
    if 'USERS/maritimesupports.com' in perm_cache:
        del perm_cache['USERS/maritimesupports.com']


def get_current_user(request: Request):
    session_cookie = request.cookies.get("__session")
    if not session_cookie:
        return None

    # Check cache first
    if session_cookie in session_cache:
        return session_cache[session_cookie]

    try:
        # Verify the session cookie
        decoded_claims = auth.verify_session_cookie(
            session_cookie, check_revoked=True)

        # Cache the result
        session_cache[session_cookie] = decoded_claims
        return decoded_claims
    except auth.InvalidSessionCookieError:
        print("[Auth] Invalid session cookie.")
        return None
    except Exception as e:
        print(f"[Auth] Error verifying session cookie: {e}")
        return None


def require_login(request: Request):
    """
    Dependency to verify user and permissions against USERS/maritimesupports.com.
    """
    user = get_current_user(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        )

    email = user.get("email")
    uid = user.get("uid")
    provider_id = user.get("firebase", {}).get("sign_in_provider")

    print(f"Login Attempt: Email={email}, UID={uid}, Provider={provider_id}")

    allowed_users_doc = get_USERS_MSS()
    is_allowed = False

    if allowed_users_doc:
        # Check specific provider list
        if provider_id in allowed_users_doc:
            provider_allowed = allowed_users_doc[provider_id]
            if isinstance(provider_allowed, list):
                for user_obj in provider_allowed:
                    if isinstance(user_obj, dict):
                        if user_obj.get('email') == email:
                            is_allowed = True
                            break

    if not is_allowed:
        print(f"ACCESS DENIED for {email} ({uid}) via {provider_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied"
        )

    return user  # Authenticated and allowed


def is_superuser(email, provider_id):
    """
    Check if a user has admin privileges in USERS/maritimesupports.com for their specific provider
    """
    if not email or not provider_id:
        return False

    allowed_users_doc = get_USERS_MSS()
    if not allowed_users_doc:
        return False

    # Check only the specific provider
    if provider_id in allowed_users_doc:
        users = allowed_users_doc[provider_id]
        if isinstance(users, list):
            for user_obj in users:
                if isinstance(user_obj, dict):
                    if user_obj.get('email') == email:
                        return user_obj.get('admin', False)

    return False


def create_session_cookie(id_token: str, expires_in: int = 60 * 60 * 24 * 5):
    try:
        # Create the session cookie. This will also verify the ID token.
        session_cookie = auth.create_session_cookie(
            id_token, expires_in=expires_in)
        return session_cookie
    except auth.InvalidIdTokenError:
        return None
    except Exception as e:
        print(f"Error creating session cookie: {e}")
        return None
