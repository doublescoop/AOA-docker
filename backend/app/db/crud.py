from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from datetime import date, datetime, timezone
from app.db import models, schemas
from typing import List

# ==================================
# User CRUD
# ==================================

def get_user(db: Session, user_id: int):
    """
    Get a single user by their ID.
    """
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    """
    Get a single user by their email address.
    """
    return db.query(models.User).filter(models.User.email == email).first()



def get_users(db: Session, skip: int = 0, limit: int = 100):
    """
    Get a list of users, with pagination.
    """
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    """
    Create a new user.
    """
    db_user = models.User(**user.model_dump())
    db.add(db_user)
    return db_user

# ==================================
# DailyLog CRUD
# ==================================

def get_daily_log(db: Session, user_id: int, log_date: date):
    """
    Get a single daily log for a user on a specific date.
    """
    return db.query(models.DailyLog).filter(
        models.DailyLog.user_id == user_id,
        models.DailyLog.log_date == log_date
    ).first()


def get_daily_logs_by_user(db: Session, *, user_id: int, skip: int = 0, limit: int = 100) -> List[models.DailyLog]:
    """Get a list of daily logs for a single user, with pagination."""
    return (
        db.query(models.DailyLog)
        .filter(models.DailyLog.user_id == user_id)
        .order_by(models.DailyLog.log_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_daily_log(db: Session, user_id: int, log: schemas.DailyLogCreate):
    """
    Create a new daily log (check-in).
    """
    db_log = models.DailyLog(
        **log.model_dump(),
        user_id=user_id
    )
    db.add(db_log)
    return db_log


def checkout_daily_log(db: Session, db_log: models.DailyLog, log_checkout: schemas.DailyLogCheckout):
    """
    Update a daily log via checkout. Different from edit_daily_log Sets checkout_time to now. 
    """
    update_data = log_checkout.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_log, key, value)
    
    db_log.checkout_time = datetime.now(timezone.utc)
    
    return db_log


def edit_daily_log(db: Session, db_log: models.DailyLog, log_update: schemas.DailyLogRead):
    """
    Edit a daily log.
    """
    update_data = log_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_log, key, value)

    # @TODO: could add a edited_at time here. 
    return db_log
