from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import schemas, crud
from app.db.db import get_db

router = APIRouter()

# When user creates an account after they fill in the first daily log. 
@router.post("/create-with-log", response_model=schemas.UserRead)
def create_user_with_log(
    *,
    db: Session = Depends(get_db),
    payload: schemas.UserCreateWithLog,
):
    """
    Create a user and their first log.
    """
    db_user = crud.get_user_by_email(db, email=payload.user_data.email)
    if db_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    try:
        db_user = crud.create_user(db, user=payload.user_data)
        db.flush() # Generate the user's ID before creating the log
        crud.create_daily_log(db, user_id=db_user.id, log=payload.log_data)
        db.commit() # commiting both the user and the log together 
    except Exception as e:  
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred during sign-up(did you answer all the questions?): {e}")
    db.refresh(db_user) # To get DB-generated fields like id and created_at
    return db_user 


@router.post("/", response_model=schemas.UserRead)
def create_user(
    *,
    db: Session = Depends(get_db),
    payload: schemas.UserCreate,
):
    """
    Create a user wihtout an initial log. 
    """
    db_user = crud.get_user_by_email(db, email=payload.email)
    if db_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    try:
        new_user = crud.create_user(db, user=payload)
        db.commit()
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred during sign-up: {e}")
    
    db.refresh(new_user)
    return new_user



@router.get("/{user_id}", response_model=schemas.UserRead)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get a user by their ID.
    """
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
