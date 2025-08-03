from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from repositories.post_repository import router as post_router
from repositories.member_repository import router as member_router
from repositories.show_repository import router as show_router

from fastapi.staticfiles import StaticFiles


app = FastAPI()

app.mount("/images", StaticFiles(directory="./images"), name="images")
# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(post_router,  prefix="/api") 
app.include_router(member_router, prefix="/api")
app.include_router(show_router, prefix="/api") 

@app.get("/")
def root():
    return {"message": "Welcome to Auto Agent Evaluation API"}