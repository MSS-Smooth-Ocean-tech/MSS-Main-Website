from fastapi import APIRouter, Request, Depends, Form, UploadFile, File
from fastapi.responses import RedirectResponse
import datetime
import re
import uuid
import urllib.parse
from pydantic import BaseModel
from firebase_admin import storage
from main import templates
from tools.auth import require_login
from tools.firebase_utils import update_firestore_data, get_firestore_data
from firebase_admin import firestore

class ReorderRequest(BaseModel):
    slugs: list[str]

router = APIRouter()

def enrich_blogs_with_profiles(blogs_list):
    if not blogs_list:
        return []
    unique_emails = set(b.get("added_by") for b in blogs_list if b.get("added_by"))
    profiles_map = {}
    for email in unique_emails:
        doc = get_firestore_data(f"USERS/maritimesupports.com/PUBLIC_PROFILE/{email}")
        if doc and "name" in doc:
            profiles_map[email] = doc
    for b in blogs_list:
        email = b.get("added_by")
        if email in profiles_map:
            b["author_name"] = profiles_map[email].get("name", "")
            b["author_pfp"] = profiles_map[email].get("pfp_url", "")
    return blogs_list

### Main Blog Routes
@router.get("/resources", name="blogs")
async def blogs(request: Request):
    doc = get_firestore_data("WEBSITE_CONTENTS/BLOGS")
    blogs_list = doc.get("data", []) if doc else []
    blogs_list = enrich_blogs_with_profiles(blogs_list)
    return templates.TemplateResponse("pages/resources/blogs.html", {"request": request, "blogs": blogs_list})

@router.get("/resources/{slug}", name="blog_detailed")
async def blog_detailed(request: Request, slug: str):
    doc = get_firestore_data("WEBSITE_CONTENTS/BLOGS")
    blogs_list = doc.get("data", []) if doc else []
    
    current_blog = next((b for b in blogs_list if b.get("slug") == slug), None)
    if not current_blog:
        return RedirectResponse(url="/resources", status_code=302)
        
    current_blog = enrich_blogs_with_profiles([current_blog])[0]
        
    return templates.TemplateResponse("pages/resources/blog_detailed.html", {"request": request, "blog": current_blog})

### Admin Blog Routes (REQUIRE LOGIN - TO BE IMPLEMENTED)
## Manage Blog Routes
@router.get("/manage_blogs", name="manage_blogs_page")
async def manage_blogs_page(request: Request, user: dict = Depends(require_login)):
    doc = get_firestore_data("WEBSITE_CONTENTS/BLOGS")
    blogs_list = doc.get("data", []) if doc else []
    blogs_list = enrich_blogs_with_profiles(blogs_list)
    return templates.TemplateResponse("admin/blog/manage.html", {"request": request, "blogs": blogs_list})

@router.post("/api/reorder_blogs")
async def reorder_blogs(request: Request, data: ReorderRequest, user: dict = Depends(require_login)):
    try:
        doc = get_firestore_data("WEBSITE_CONTENTS/BLOGS")
        blogs_list = doc.get("data", []) if doc else []
        
        blog_map = {b.get("slug"): b for b in blogs_list if b.get("slug")}
        ordered_blogs = [blog_map[slug] for slug in data.slugs if slug in blog_map]
        
        expected_slugs = set(data.slugs)
        for b in blogs_list:
            if b.get("slug") not in expected_slugs:
                ordered_blogs.append(b)

        success = update_firestore_data("WEBSITE_CONTENTS/BLOGS", {"data": ordered_blogs})
        if success:
            return {"status": "success"}
        return {"status": "error", "message": "Failed to update Firestore"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/api/latest_blogs")
async def latest_blogs(exclude_slug: str = None):
    try:
        doc = get_firestore_data("WEBSITE_CONTENTS/BLOGS")
        blogs_list = doc.get("data", []) if doc else []
        
        if exclude_slug:
            blogs_list = [b for b in blogs_list if b.get("slug") != exclude_slug]
            
        blogs_list = enrich_blogs_with_profiles(blogs_list[:3])
        return {"status": "success", "data": blogs_list}
    except Exception as e:
        return {"status": "error", "message": str(e)}

## Add/Edit Blog Routes
@router.get("/add_blog", name="add_blog_page")
async def add_blog_page(request: Request, user: dict = Depends(require_login)):
    return templates.TemplateResponse("admin/blog/add.html", {"request": request})

@router.post("/add_blog", name="add_blog_submit")
async def add_blog_submit(
    request: Request,
    title: str = Form(...),
    summary: str = Form(...),
    canvas_data: str = Form(...),
    cover_image: UploadFile = File(None),
    user: dict = Depends(require_login)
):
    try:
        # Generate URL friendly slug and ensure 100% uniqueness with a UUID tail
        slug_base = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
        unique_tail = str(uuid.uuid4().hex)[:6]
        slug = f"{slug_base}-{unique_tail}"

        image_url = ""
        if cover_image and cover_image.filename:
            bucket = storage.bucket("smooth-ocean.firebasestorage.app")
            extension = cover_image.filename.split('.')[-1]
            unique_name = f"blog_covers/{uuid.uuid4().hex}.{extension}"
            blob = bucket.blob(unique_name)
            
            # Generate permanent Firebase validation token
            new_token = uuid.uuid4().hex
            blob.metadata = {"firebaseStorageDownloadTokens": new_token}
            
            cover_image.file.seek(0)
            blob.upload_from_file(cover_image.file, content_type=cover_image.content_type)
            
            image_url = f"https://firebasestorage.googleapis.com/v0/b/smooth-ocean.firebasestorage.app/o/{urllib.parse.quote(unique_name, safe='')}?alt=media&token={new_token}"

        blog_data = {
            "slug": slug,
            "title": title,
            "summary": summary,
            "body": canvas_data,
            "cover_image": image_url,
            "added_by": user.get("email", "Unknown"),
            "added_on": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

        doc = get_firestore_data("WEBSITE_CONTENTS/BLOGS")
        blogs_list = doc.get("data", []) if doc else []
        blogs_list.insert(0, blog_data)

        success = update_firestore_data("WEBSITE_CONTENTS/BLOGS", {"data": blogs_list})
        if not success:
            return templates.TemplateResponse("admin/blog/add.html", {
                "request": request, 
                "error": "Failed to save blog to database."
            })

        return RedirectResponse(url="/manage_blogs", status_code=302)
    except Exception as e:
        return templates.TemplateResponse("admin/blog/add.html", {
            "request": request, 
            "error": f"An error occurred: {str(e)}"
        })

@router.get("/edit_blog/{slug}", name="edit_blog_page")
async def edit_blog_page(request: Request, slug: str, user: dict = Depends(require_login)):
    doc = get_firestore_data("WEBSITE_CONTENTS/BLOGS")
    blogs_list = doc.get("data", []) if doc else []
    
    blog_to_edit = next((b for b in blogs_list if b.get("slug") == slug), None)
    
    if not blog_to_edit:
        return RedirectResponse(url="/manage_blogs", status_code=302)
        
    return templates.TemplateResponse("admin/blog/add.html", {"request": request, "blog": blog_to_edit, "edit_mode": True})

@router.post("/edit_blog/{slug}", name="edit_blog_submit")
async def edit_blog_submit(
    request: Request,
    slug: str,
    title: str = Form(...),
    summary: str = Form(...),
    canvas_data: str = Form(...),
    cover_image: UploadFile = File(None),
    user: dict = Depends(require_login)
):
    try:
        doc = get_firestore_data("WEBSITE_CONTENTS/BLOGS")
        blogs_list = doc.get("data", []) if doc else []
        
        idx = -1
        for i, b in enumerate(blogs_list):
            if b.get("slug") == slug:
                idx = i
                break
                
        if idx == -1:
            return templates.TemplateResponse("admin/blog/add.html", {
                "request": request, 
                "error": "Blog not found.",
                "edit_mode": True
            })
            
        blogs_list[idx]["title"] = title
        blogs_list[idx]["summary"] = summary
        blogs_list[idx]["body"] = canvas_data
        
        if cover_image and cover_image.filename:
            bucket = storage.bucket("smooth-ocean.firebasestorage.app")
            extension = cover_image.filename.split('.')[-1]
            unique_name = f"blog_covers/{uuid.uuid4().hex}.{extension}"
            blob = bucket.blob(unique_name)
            
            # Generate permanent Firebase validation token
            new_token = uuid.uuid4().hex
            blob.metadata = {"firebaseStorageDownloadTokens": new_token}
            
            cover_image.file.seek(0)
            blob.upload_from_file(cover_image.file, content_type=cover_image.content_type)
            
            image_url = f"https://firebasestorage.googleapis.com/v0/b/smooth-ocean.firebasestorage.app/o/{urllib.parse.quote(unique_name, safe='')}?alt=media&token={new_token}"
            blogs_list[idx]["cover_image"] = image_url
        
        success = update_firestore_data("WEBSITE_CONTENTS/BLOGS", {"data": blogs_list})
        if not success:
            return templates.TemplateResponse("admin/blog/add.html", {
                "request": request, 
                "error": "Failed to update blog.",
                "edit_mode": True,
                "blog": blogs_list[idx]
            })

        return RedirectResponse(url="/manage_blogs", status_code=302)
    except Exception as e:
        return templates.TemplateResponse("admin/blog/add.html", {
            "request": request, 
            "error": f"An error occurred: {str(e)}",
            "edit_mode": True
        })

@router.post("/delete_blog/{slug}", name="delete_blog")
async def delete_blog(request: Request, slug: str, user: dict = Depends(require_login)):
    try:
        doc = get_firestore_data("WEBSITE_CONTENTS/BLOGS")
        blogs_list = doc.get("data", []) if doc else []
        
        updated_blogs_list = [b for b in blogs_list if b.get("slug") != slug]
        
        update_firestore_data("WEBSITE_CONTENTS/BLOGS", {"data": updated_blogs_list})
    except Exception as e:
        print(f"Delete Error: {str(e)}")
        
    return RedirectResponse(url="/manage_blogs", status_code=302)