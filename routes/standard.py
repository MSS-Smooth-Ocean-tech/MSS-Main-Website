from fastapi import APIRouter, Request
from main import templates

router = APIRouter()

@router.get("/")
async def homepage(request: Request): # Renders templates/homepage.html
    return templates.TemplateResponse("pages/homepage.html", {"request": request})

@router.get("/partners")
async def partners(request: Request):
    return templates.TemplateResponse("pages/partners.html", {"request": request})

@router.get("/about")
async def about(request: Request):
    return templates.TemplateResponse("pages/about.html", {"request": request})

@router.get("/get-quote")
async def get_quote(request: Request):
    return templates.TemplateResponse("pages/get_quote.html", {"request": request})

@router.get("/privacy")
async def privacy(request: Request):
    return templates.TemplateResponse("pages/privacy.html", {"request": request})
