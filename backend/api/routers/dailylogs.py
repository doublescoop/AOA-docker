from fastapi import APIRouter, Depends, HTTPException
from app.db import schemas, crud
from app.db.db import get_db
from sqlalchemy.orm import Session
from datetime import date
from typing import List, Optional

router = APIRouter()

# Since I don't have auth, I'm passing user_id as a path parameter. 
@router.post("/{user_id}", response_model=schemas.DailyLogRead)
def create_daily_log(
    *,
    db: Session = Depends(get_db),
    user_id: int, #comes from path parameter
    payload: schemas.DailyLogCreate,
):
    """
    Create a daily log (check-in) for a specific user.
    """
    existing_log = crud.get_daily_log(db, user_id=user_id, log_date=payload.log_date)
    if existing_log:
        raise HTTPException(status_code=400, detail="Daily log already exists for this date")
    # wrap the creation in a transaction 
    try:
        new_log = crud.create_daily_log(db, user_id=user_id, log=payload)
        db.commit()
    except Exception as e:
        db.rollback() 
        raise HTTPException(status_code=500, detail=f"An error occurred during check-in: {e}")
    
    db.refresh(new_log) # To get DB-generated fields like id and created_at
    return new_log


@router.patch("/{user_id}/{log_date}/checkout", response_model=schemas.DailyLogRead)
def checkout_daily_log(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    log_date: date,
    payload: schemas.DailyLogCheckout,
):
    """
    Updates a daily log with checkout info. Creates a new log if one doesn't exist for the date.
    """
    try:
        daily_log = crud.get_daily_log(db, user_id=user_id, log_date=log_date)
        if not daily_log:
            empty_log = schemas.DailyLogCreate(log_date=log_date)
            daily_log = crud.create_daily_log(db, user_id=user_id, log=empty_log)
        updated_log = crud.checkout_daily_log(db, db_log=daily_log, log_checkout=payload)
        db.commit() # commit once for ATOMIC transaction. If a new log was created, it will be INSERTED. The checkout update will be UPDATED.
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred during checkout: {e}")
    
    db.refresh(updated_log) # To get DB-generated fields like id and created_at
    return updated_log

# Edit a daily log. partial changes, so patch instead of put. 
@router.patch("/{user_id}/{log_date}", response_model=schemas.DailyLogRead)
def edit_daily_log(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    log_date: date,
    payload: schemas.DailyLogUpdate,
):
    """
    Edits a daily log.
    """
    try:
        db_log = crud.get_daily_log(db, user_id=user_id, log_date=log_date)
        if not db_log:
            raise HTTPException(status_code=404, detail="Log for this date is not found to be edited")
        edited_log = crud.edit_daily_log(db, db_log=db_log, log_update=payload)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred during editing: {e}")

    db.refresh(edited_log) # To get DB-generated fields like id and created_at
    return edited_log


@router.get("/{user_id}", response_model=List[schemas.DailyLogRead])
def get_all_daily_logs(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    skip: int = 0,
    limit: int = 100,
):
    """Gets a paginated list of all daily logs for a specific user."""
    logs = crud.get_daily_logs_by_user(db, user_id=user_id, skip=skip, limit=limit)
    if not logs:
        raise HTTPException(status_code=404, detail="No logs found for this user")
    return logs


@router.get("/{user_id}/{log_date}", response_model=Optional[schemas.DailyLogRead])
def get_daily_log_by_date(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    log_date: date,
):
    """
    Gets a single daily log for a specific user and date. Returns null if not found.
    """
    db_log = crud.get_daily_log(db, user_id=user_id, log_date=log_date)
    return db_log