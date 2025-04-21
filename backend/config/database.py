import motor.motor_asyncio
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# MongoDB connection string
MONGO_URI = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "egarage_db")

# Create client
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

# Collections
user_collection = db["users"]
role_collection = db["roles"]
service_collection = db["services"]
booking_collection = db["bookings"]
review_collection = db["reviews"]
notification_collection = db["notifications"]
notification_preferences_collection = db["notification_preferences"]
token_collection = db["tokens"]  # For password reset and email verification tokens
contact_message_collection = db["contact_messages"]  # For contact form messages
payment_collection = db["payments"]  # For payment records

# Create indexes for improved query performance
async def create_indexes():
    # User email index (unique)
    await user_collection.create_index("email", unique=True)
    
    # Token indexes
    await token_collection.create_index("token", unique=True)
    await token_collection.create_index("expires")  # For efficient expiration queries
    
    # Service indexes
    await service_collection.create_index("serviceProviderId")
    
    # Booking indexes
    await booking_collection.create_index("user_id")
    await booking_collection.create_index("service_provider_id")
    await booking_collection.create_index("service_id")
    await booking_collection.create_index("booking_date")
    await booking_collection.create_index("status")
    
    # Review indexes
    await review_collection.create_index("serviceId")
    await review_collection.create_index("serviceProviderId")
    
    # Notification indexes
    await notification_collection.create_index("user_id")
    await notification_collection.create_index("is_read")
    
    # Notification preferences index
    await notification_preferences_collection.create_index("service_provider_id", unique=True)
    
    # Contact message index
    await contact_message_collection.create_index("email")
    await contact_message_collection.create_index("created_at")
    
    # Payment indexes
    await payment_collection.create_index("user_id")
    await payment_collection.create_index("payment_id")
    await payment_collection.create_index("invoice_number", unique=True)
    await payment_collection.create_index("payment_status")
    await payment_collection.create_index("created_at")

state_collection = db["states"]
city_collection = db["cities"]
category_collection = db["categories"]
sub_category_collection= db["sub_categories"]
product_collection = db["products"]
service_provider_collection = db["service_providers"]
area_collection = db["areas"]


def get_db():
    # Replace with your actual DB session logic
    pass