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
@app.get("/technology-services")
async def technology(request: Request):
    return templates.TemplateResponse("pages/services/technology_services.html", {"request": request})

@app.get("/resources")
async def blogs(request: Request):
    return templates.TemplateResponse("pages/resources/blogs.html", {"request": request})

@app.get("/resources/{slug}")
async def blog_detailed(request: Request, slug: str):
    return templates.TemplateResponse("pages/resources/blog_detailed.html", {"request": request, "slug": slug})

@app.get("/partners")
async def partners(request: Request):
    return templates.TemplateResponse("pages/partners.html", {"request": request})

@app.get("/about")
async def about(request: Request):
    return templates.TemplateResponse("pages/about.html", {"request": request})

@app.get("/get-quote")
async def get_quote(request: Request):
    return templates.TemplateResponse("pages/get_quote.html", {"request": request})

@app.get("/privacy")
async def privacy(request: Request):
    return templates.TemplateResponse("pages/privacy.html", {"request": request})