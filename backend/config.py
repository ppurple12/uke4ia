from dotenv import load_dotenv
import os

load_dotenv()



MYSQL_USER = os.getenv("MYSQL_USER", "root")           # default "root" if not set
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")           # **no default, required**
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")            # default "sql"
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")           # default "3306"
MYSQL_DB = os.getenv("MYSQL_DB", "uk4ia")  # default DB name
POSTGRES_URI = os.getenv("POSTGRES_URI")