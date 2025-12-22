from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base
from urllib.parse import quote_plus
from dotenv import load_dotenv
import os

load_dotenv()

# Priority: Standard DATABASE_URL (for Railway/Render)
# Fallback: Construct from separate variables (for Local)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    DB_HOST = os.getenv("MYSQL_HOST", "localhost")
    DB_PORT = os.getenv("MYSQL_PORT", "3306")
    DB_USER = os.getenv("MYSQL_USER", "root")
    DB_PASS = quote_plus(os.getenv("MYSQL_PASSWORD", ""))
    DB_NAME = os.getenv("MYSQL_DATABASE", "inventory")
    SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Handle Postgres protocol variation if needed by cloud providers
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
