from fastapi import APIRouter, Request, Response, HTTPException, status, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from pydantic import BaseModel
from typing import List
import json
import os

from tools.auth import require_login, is_superuser, clear_auth_cache, create_session_cookie
from tools.firebase_utils import get_firestore_data, update_firestore_data, firestore
from fastapi.templating import Jinja2Templates

admin_router = APIRouter()
templates = Jinja2Templates(directory="templates")

# --- LOGIN / LOGOUT ROUTES ---

class LoginRequest(BaseModel):
    idToken: str

@admin_router.get("/login")
def login_page(request: Request):
    try:
        require_login(request)
        return RedirectResponse(url="/admin")
    except HTTPException:
        pass  # Not logged in
        
    tenant_id = os.getenv("TENANT_ID", '3b890fcd-f838-4aab-83d7-25fb8bc60c9d')
    return templates.TemplateResponse("admin/login.html", {"request": request, "tenant_id": tenant_id})

@admin_router.post("/login")
def login(data: LoginRequest):
    id_token = data.idToken
    if not id_token:
        raise HTTPException(status_code=400, detail="Missing ID Token")

    session_cookie = create_session_cookie(id_token)
    if not session_cookie:
        raise HTTPException(status_code=401, detail="Invalid ID Token")

    response = JSONResponse(content={"message": "Login successful"})
    response.set_cookie(
        key="__session",
        value=session_cookie,
        httponly=True,
        secure=False,  # Set to True in production on HTTPS
        samesite="lax"
    )
    return response

@admin_router.post("/logout")
@admin_router.get("/logout")
def logout():
    response = RedirectResponse(url="/login", status_code=302)
    response.delete_cookie("__session")
    return response


# --- ADMIN PANEL ROUTES ---

def require_admin(request: Request, user: dict = Depends(require_login)):
    email = user.get('email')
    provider_id = user.get('firebase', {}).get('sign_in_provider')

    if not is_superuser(email, provider_id):
        if "application/json" in request.headers.get("accept", ""):
            raise HTTPException(status_code=403, detail="Unauthorized")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return user


class UserAddRequest(BaseModel):
    provider: str
    email: str
    admin: bool = False

class UserRemoveRequest(BaseModel):
    provider: str
    email: str

class UserConfigUpdate(BaseModel):
    provider: str
    email: str
    admin: bool


@admin_router.get("/admin", name="admin_users")
def admin_panel(request: Request, user: dict = Depends(require_admin)):
    """Render the admin panel page"""
    return templates.TemplateResponse("admin/admin.html", {"request": request})

@admin_router.get("/admin/users")
def get_admin_users(user: dict = Depends(require_admin)):
    """Fetch admin users from USERS/maritimesupports.com in Firebase"""
    try:
        users_data = get_firestore_data('USERS/maritimesupports.com')

        if not users_data:
            return {
                'google.com': [],
                'microsoft.com': []
            }
        return users_data
    except Exception as e:
        print(f"Error fetching admin users: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.post("/admin/users/add")
def add_admin_user(data: UserAddRequest, user: dict = Depends(require_admin)):
    """Add a user to USERS/maritimesupports.com"""
    try:
        provider = data.provider
        email = data.email
        is_admin = data.admin

        if not provider or not email:
            raise HTTPException(status_code=400, detail='Provider and email are required')

        if provider not in ['google.com', 'microsoft.com']:
            raise HTTPException(status_code=400, detail='Invalid provider. Only google.com and microsoft.com are supported.')

        users_data = get_firestore_data('USERS/maritimesupports.com')
        if not users_data:
            users_data = {}

        if provider not in users_data:
            users_data[provider] = []

        for u in users_data[provider]:
            if u.get('email') == email:
                raise HTTPException(status_code=400, detail='User already exists')

        users_data[provider].append({
            'email': email,
            'admin': is_admin,
        })

        update_firestore_data('USERS/maritimesupports.com', users_data)
        clear_auth_cache()

        return {"success": True, "message": "User added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error adding user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.post("/admin/users/remove")
def remove_admin_user(data: UserRemoveRequest, user: dict = Depends(require_admin)):
    """Remove a user from USERS/maritimesupports.com"""
    try:
        provider = data.provider
        email = data.email

        users_data = get_firestore_data('USERS/maritimesupports.com')

        if not users_data or provider not in users_data:
            raise HTTPException(status_code=404, detail='No users found')

        users_data[provider] = [
            u for u in users_data[provider]
            if u.get('email') != email
        ]

        update_firestore_data('USERS/maritimesupports.com', users_data)
        clear_auth_cache()

        return {'success': True, 'message': 'User removed successfully'}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error removing user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.post("/admin/users/config/update")
def update_user_config(data: UserConfigUpdate, user: dict = Depends(require_admin)):
    """Update configuration (admin status) for a specific user"""
    try:
        provider = data.provider
        email = data.email

        db_fs = firestore.client()
        doc_ref = db_fs.collection('USERS').document('maritimesupports.com')
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail='No users found')

        users_data = doc.to_dict()

        if provider not in users_data:
            raise HTTPException(status_code=404, detail='Provider not found')

        user_found = False
        for u in users_data[provider]:
            if u.get('email') == email:
                u['admin'] = data.admin
                user_found = True
                break

        if not user_found:
            raise HTTPException(status_code=404, detail="User not found")

        update_firestore_data('USERS/maritimesupports.com', users_data)
        clear_auth_cache()

        return {"success": True, "message": "Configuration updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating user config: {e}")
        raise HTTPException(status_code=500, detail=str(e))
