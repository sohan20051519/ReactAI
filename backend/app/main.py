from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Project Aurora Backend!"}

@app.post("/train")
async def train_model():
    # Placeholder for cloud-based training logic
    return {"message": "Cloud training job started."}
