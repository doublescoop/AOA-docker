from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.routers import users
from api.routers import dailylogs

app = FastAPI(title="AOA", description="AOA helps you being intentional about your attention, obsession, and agency every day.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return JSONResponse(content={"message": "Hello AOA"})


app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(dailylogs.router, prefix="/dailylogs", tags=["dailylogs"])
