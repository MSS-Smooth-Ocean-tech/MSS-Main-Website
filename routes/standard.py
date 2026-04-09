from fastapi import APIRouter, Request
from main import templates

router = APIRouter()

@router.get("/partners", name="partners")
async def partners(request: Request):
    return templates.TemplateResponse("pages/partners.html", {"request": request})

@router.get("/about", name="about")
async def about(request: Request):
    return templates.TemplateResponse("pages/about.html", {"request": request})

@router.get("/get-quote", name="get_quote")
@router.get("/contact", name="contact")
async def get_quote(request: Request):
    return templates.TemplateResponse("pages/get_quote.html", {"request": request})

@router.get("/privacy", name="privacy")
async def privacy(request: Request):
    return templates.TemplateResponse("pages/privacy.html", {"request": request})
