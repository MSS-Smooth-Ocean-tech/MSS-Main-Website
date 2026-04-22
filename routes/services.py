from fastapi import APIRouter, Request
from main import templates

router = APIRouter()

@router.get("/services", name="services_home")
async def services_home(request: Request):
    return templates.TemplateResponse(request, "pages/services/services_home.html", {"request": request})

@router.get("/bpo-services", name="bpo_services")
async def bpo_services(request: Request):
    context = {"request": request}
    costs = {
        "North America": {"actual_cost": 3797, "updated_cost": 1500},
        "South America": {"actual_cost": 1052, "updated_cost": 750},
        "Europe": {"actual_cost": 2949, "updated_cost": 950},
        "North Africa": {"actual_cost": 544, "updated_cost": 500},
        "West Africa": {"actual_cost": 544, "updated_cost": 500},
        "East africa": {"actual_cost": 804.5, "updated_cost": 650},
        "Southern Africa": {"actual_cost": 974, "updated_cost": 750},
        "Middle East": {"actual_cost": 2808, "updated_cost": 950},
        "Singapore": {"actual_cost": 2548.25, "updated_cost": 950},
        "Malaysia": {"actual_cost": 744.5, "updated_cost": 650},
        "Thailand": {"actual_cost": 570, "updated_cost": 500},
        "Vietnam": {"actual_cost": 487, "updated_cost": 500},
        "Indonesia": {"actual_cost": 336.5, "updated_cost": 500},
        "Philippines": {"actual_cost": 380.25, "updated_cost": 500},
        "Russia": {"actual_cost": 1105.75, "updated_cost": 750},
        "Asian Sub continent": {"actual_cost": 222, "updated_cost": 250},
        "Australia": {"actual_cost": 4048, "updated_cost": 1500}
    }
    context.update({"costs": costs})
    return templates.TemplateResponse(request, "pages/services/bpo_services.html", context)

@router.get("/technology-services", name="technology_services")
async def technology(request: Request):
    return templates.TemplateResponse(request, "pages/services/technology_services.html", {"request": request})
