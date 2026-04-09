from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse

# ── Create the FastAPI app ──
app = FastAPI()

# ── Serve everything in /static folder as static files ──
app.mount("/static", StaticFiles(directory="static"), name="static") # Access them in HTML as /static/css/..., /static/js/..., etc.

# ── Point to the folder where your HTML templates live ──
templates = Jinja2Templates(directory="templates")

# ── Template tags ──
from tools.template_tags import get_certificate_status, get_certificate_images
templates.env.globals["certificate_status"] = get_certificate_status # Note: we dont use '()' here because we want to use it as a function in the template, otherwise it will be called immediately and return the value which wont change if we add '()' to the function call in the template.
templates.env.globals["certificate_images"] = get_certificate_images()

# ── ROUTES ──
from routes.services import router as services_router
from routes.blog import router as blog_router
from routes.standard import router as standard_router

@app.exception_handler(401)
async def unauthorized_handler(request: Request, exc: HTTPException):
    if "application/json" in request.headers.get("accept", ""):
        return JSONResponse(status_code=401, content={"error": "Unauthorized"})
    return RedirectResponse(url="/login")

@app.get("/", name="homepage")
async def homepage(request: Request): # Renders templates/homepage.html
    return templates.TemplateResponse("pages/homepage.html", {"request": request})

app.include_router(standard_router)
app.include_router(services_router)
app.include_router(blog_router)

@app.get("/health", name="health")
async def health(request: Request):
    return {"status": "ok"}