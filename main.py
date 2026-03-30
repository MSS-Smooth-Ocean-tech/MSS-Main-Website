from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

# ── Create the FastAPI app ──
app = FastAPI()

# ── Serve everything in /static folder as static files ──
# Access them in HTML as /static/css/..., /static/js/..., etc.
app.mount("/static", StaticFiles(directory="static"), name="static")

# ── Point to the folder where your HTML templates live ──
templates = Jinja2Templates(directory="templates")

# ── ROUTES ──
@app.get("/")
async def homepage(request: Request): # Renders templates/homepage.html
    return templates.TemplateResponse("pages/homepage.html", {"request": request})

@app.get("/services")
async def services_home(request: Request):
    return templates.TemplateResponse("pages/services/services_home.html", {"request": request})
@app.get("/bpo-services")
async def bpo_services(request: Request):
    return templates.TemplateResponse("pages/services/bpo_services.html", {"request": request})
@app.get("/technology")
async def technology(request: Request):
    return templates.TemplateResponse("pages/services/technology_services.html", {"request": request})

@app.get("/case-studies")
async def case_studies(request: Request):
    return templates.TemplateResponse("pages/case_studies.html", {"request": request})

@app.get("/insights")
async def insights(request: Request):
    return templates.TemplateResponse("pages/insights.html", {"request": request})

@app.get("/industries")
async def industries(request: Request):
    return templates.TemplateResponse("pages/industries.html", {"request": request})

@app.get("/partners")
async def partners(request: Request):
    return templates.TemplateResponse("pages/partners.html", {"request": request})

@app.get("/about")
async def about(request: Request):
    return templates.TemplateResponse("pages/about.html", {"request": request})

@app.get("/insights/{slug}")
async def article_detail(request: Request, slug: str):
    return templates.TemplateResponse("pages/insights_detailed.html", {"request": request, "slug": slug})

@app.get("/case-studies/{slug}")
async def case_study_detail(request: Request, slug: str):
    return templates.TemplateResponse("pages/case_study_detailed.html", {"request": request, "slug": slug})

@app.get("/industries-overview")
async def industries_overview(request: Request):
    return templates.TemplateResponse("pages/industries_overview.html", {"request": request})

@app.get("/get-quote")
async def get_quote(request: Request):
    return templates.TemplateResponse("pages/get_quote.html", {"request": request})

@app.get("/security")
async def security(request: Request):
    return templates.TemplateResponse("pages/security.html", {"request": request})

@app.get("/privacy")
async def privacy(request: Request):
    return templates.TemplateResponse("pages/privacy.html", {"request": request})