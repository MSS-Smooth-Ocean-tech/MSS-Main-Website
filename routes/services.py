from fastapi import APIRouter, Request
from main import templates

router = APIRouter()

@router.get("/services", name="services_home")
async def services_home(request: Request):
    return templates.TemplateResponse(request, "pages/services/services_home.html", {"request": request})

@router.get("/bpo-services", name="bpo_services")
async def bpo_services(request: Request):
    return templates.TemplateResponse(request, "pages/services/bpo_services.html", {"request": request})

@router.get("/technology-services", name="technology_services")
async def technology(request: Request):
    return templates.TemplateResponse(request, "pages/services/technology_services.html", {"request": request})
