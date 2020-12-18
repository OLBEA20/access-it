from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes import databases

origins = ["http://localhost:3000"]

application = FastAPI()
application.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=[""],
)
application.include_router(databases)
