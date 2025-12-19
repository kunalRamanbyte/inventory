from fastapi import FastAPI, Depends, HTTPException, Query, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import models
import pandas as pd
import io
from deps import get_db, init_db
from pydantic import BaseModel
from auth import get_current_user

app = FastAPI(title="Inventory Management API")

# Enable CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    quantity: int

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/items", response_model=List[Item])
def read_items(db: Session = Depends(get_db)):
    return db.query(models.Item).all()

@app.post("/api/items", response_model=Item)
def create_item(item: ItemCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_item = models.Item(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/api/items/search", response_model=List[Item])
def search_items(q: str = Query(...), db: Session = Depends(get_db)):
    return db.query(models.Item).filter(
        (models.Item.name.ilike(f"%{q}%")) | 
        (models.Item.description.ilike(f"%{q}%"))
    ).all()

@app.put("/api/items/{item_id}", response_model=Item)
def update_item(item_id: int, item_update: ItemCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    for key, value in item_update.model_dump().items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@app.post("/api/items/upload")
async def upload_items(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload an Excel file.")
    
    try:
        content = await file.read()
        df = pd.read_excel(io.BytesIO(content))
        
        # Validate columns
        required_cols = {'name', 'price', 'quantity'}
        if not required_cols.issubset(set(df.columns.str.lower())):
             raise HTTPException(status_code=400, detail=f"Missing required columns. Required: {required_cols}")

        # Normalize column names to lowercase
        df.columns = df.columns.str.lower()
        
        items_added = 0
        for _, row in df.iterrows():
            db_item = models.Item(
                name=str(row['name']),
                description=str(row.get('description', '')),
                price=float(row['price']),
                quantity=int(row['quantity'])
            )
            db.add(db_item)
            items_added += 1
        
        db.commit()
        return {"message": f"Successfully uploaded {items_added} items"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.delete("/api/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
