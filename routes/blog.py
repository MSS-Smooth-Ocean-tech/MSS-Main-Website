from fastapi import APIRouter, Request, Depends, Form
from fastapi.responses import RedirectResponse
import datetime
import re
import uuid
from pydantic import BaseModel
from main import templates
from firebase_admin import firestore
class ReorderRequest(BaseModel):
    slugs: list[str]

router = APIRouter()

### Main Blog Routes
@router.get("/resources", name="blogs")
async def blogs(request: Request):
    return templates.TemplateResponse("pages/resources/blogs.html", {"request": request})

@router.get("/resources/{slug}", name="blog_detailed")
async def blog_detailed(request: Request, slug: str):
    return templates.TemplateResponse("pages/resources/blog_detailed.html", {"request": request, "slug": slug})
### Admin Blog Routes (REQUIRE LOGIN - TO BE IMPLEMENTED)
## Manage Blog Routes
## Add/Edit Blog Routes
