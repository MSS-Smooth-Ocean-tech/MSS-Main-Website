from fastapi import APIRouter, Request
from main import templates

router = APIRouter()

@router.get("/resources", name="blogs")
async def blogs(request: Request):
    return templates.TemplateResponse("pages/resources/blogs.html", {"request": request})

@router.get("/resources/{slug}", name="blog_detailed")
async def blog_detailed(request: Request, slug: str):
    return templates.TemplateResponse("pages/resources/blog_detailed.html", {"request": request, "slug": slug})
