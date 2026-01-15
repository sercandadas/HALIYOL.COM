from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="HALIYOL API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "customer"
    phone: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    company_name: Optional[str] = None
    service_areas: Optional[List[str]] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    is_banned: Optional[bool] = None

class CarpetItem(BaseModel):
    carpet_type: str
    width: float
    length: float

class OrderCreate(BaseModel):
    carpets: List[CarpetItem]
    special_notes: Optional[str] = None
    city: str
    district: str
    address: str
    phone: str

class OrderStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class OrderAssign(BaseModel):
    company_id: str

class CarpetEntry(BaseModel):
    carpet_type: str
    area: float  # m2 cinsinden

class CompanyUpdateOrder(BaseModel):
    carpets: List[CarpetEntry]  # Firma tarafından girilen gerçek halı bilgileri

# ============== TURKEY LOCATION DATA ==============

TURKEY_LOCATIONS = {
    "İstanbul": ["Kadıköy", "Beşiktaş", "Üsküdar", "Fatih", "Bakırköy", "Şişli", "Beyoğlu", "Maltepe", "Ataşehir", "Kartal", "Pendik", "Tuzla", "Sarıyer", "Beylikdüzü", "Esenyurt", "Küçükçekmece", "Bağcılar", "Bahçelievler", "Güngören", "Esenler"],
    "Ankara": ["Çankaya", "Keçiören", "Mamak", "Yenimahalle", "Etimesgut", "Sincan", "Altındağ", "Pursaklar", "Gölbaşı", "Polatlı"],
    "İzmir": ["Konak", "Karşıyaka", "Bornova", "Buca", "Bayraklı", "Çiğli", "Gaziemir", "Balçova", "Narlıdere", "Karabağlar"],
    "Bursa": ["Osmangazi", "Nilüfer", "Yıldırım", "Gürsu", "Kestel", "Mudanya", "Gemlik", "İnegöl"],
    "Antalya": ["Muratpaşa", "Kepez", "Konyaaltı", "Aksu", "Döşemealtı", "Alanya", "Manavgat", "Serik"],
    "Adana": ["Seyhan", "Yüreğir", "Çukurova", "Sarıçam", "Ceyhan", "Kozan"],
    "Konya": ["Selçuklu", "Meram", "Karatay", "Çumra", "Akşehir", "Ereğli"],
    "Gaziantep": ["Şahinbey", "Şehitkamil", "Oğuzeli", "Nizip", "İslahiye"],
    "Mersin": ["Mezitli", "Yenişehir", "Toroslar", "Akdeniz", "Tarsus", "Erdemli"],
    "Kayseri": ["Melikgazi", "Kocasinan", "Talas", "Hacılar", "İncesu"],
}

CARPET_PRICES = {
    "normal": 100,
    "shaggy": 130,
    "silk": 250,
    "antique": 500
}

# ============== AUTH HELPERS ==============

async def get_current_user(request: Request) -> dict:
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user.get("is_banned"):
        raise HTTPException(status_code=403, detail="Account is banned")
    
    return user

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

# ============== AUTH ROUTES ==============

@api_router.post("/auth/session")
async def process_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    async with httpx.AsyncClient() as client_http:
        resp = await client_http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        oauth_data = resp.json()
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    session_token = oauth_data.get("session_token", f"sess_{uuid.uuid4().hex}")
    
    existing_user = await db.users.find_one({"email": oauth_data["email"]}, {"_id": 0})
    
    if existing_user:
        if existing_user.get("is_banned"):
            raise HTTPException(status_code=403, detail="Account is banned")
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": oauth_data.get("name", existing_user.get("name")), "picture": oauth_data.get("picture", existing_user.get("picture"))}}
        )
    else:
        new_user = {"user_id": user_id, "email": oauth_data["email"], "name": oauth_data.get("name", "User"), "picture": oauth_data.get("picture"), "role": "customer", "is_banned": False, "created_at": datetime.now(timezone.utc).isoformat()}
        await db.users.insert_one(new_user)
    
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({"user_id": user_id, "session_token": session_token, "expires_at": expires_at.isoformat(), "created_at": datetime.now(timezone.utc).isoformat()})
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    response.set_cookie(key="session_token", value=session_token, httponly=True, secure=True, samesite="none", path="/", max_age=7*24*60*60)
    return {"user": user, "session_token": session_token}

@api_router.post("/auth/register")
async def register(user_data: UserCreate, response: Response):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = hash_password(user_data.password)
    
    new_user = {"user_id": user_id, "email": user_data.email, "name": user_data.name, "password_hash": hashed_pw, "role": user_data.role, "phone": user_data.phone, "city": user_data.city, "district": user_data.district, "address": user_data.address, "is_banned": False, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.users.insert_one(new_user)
    new_user.pop("_id", None)
    
    if user_data.role == "company" and user_data.company_name:
        company_profile = {"user_id": user_id, "company_name": user_data.company_name, "email": user_data.email, "phone": user_data.phone, "city": user_data.city or "", "districts": user_data.service_areas or [], "address": user_data.address, "is_active": True, "total_area_washed": 0.0, "created_at": datetime.now(timezone.utc).isoformat()}
        await db.companies.insert_one(company_profile)
    
    session_token = f"sess_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({"user_id": user_id, "session_token": session_token, "expires_at": expires_at.isoformat(), "created_at": datetime.now(timezone.utc).isoformat()})
    
    response.set_cookie(key="session_token", value=session_token, httponly=True, secure=True, samesite="none", path="/", max_age=7*24*60*60)
    user_response = {k: v for k, v in new_user.items() if k != "password_hash"}
    return {"user": user_response, "session_token": session_token}

@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or "password_hash" not in user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.get("is_banned"):
        raise HTTPException(status_code=403, detail="Account is banned")
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    session_token = f"sess_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({"user_id": user["user_id"], "session_token": session_token, "expires_at": expires_at.isoformat(), "created_at": datetime.now(timezone.utc).isoformat()})
    
    response.set_cookie(key="session_token", value=session_token, httponly=True, secure=True, samesite="none", path="/", max_age=7*24*60*60)
    user_response = {k: v for k, v in user.items() if k != "password_hash"}
    return {"user": user_response, "session_token": session_token}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return {k: v for k, v in user.items() if k != "password_hash"}

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# ============== LOCATION ROUTES ==============

@api_router.get("/locations/cities")
async def get_cities():
    return {"cities": list(TURKEY_LOCATIONS.keys())}

@api_router.get("/locations/districts/{city}")
async def get_districts(city: str):
    if city not in TURKEY_LOCATIONS:
        raise HTTPException(status_code=404, detail="City not found")
    return {"districts": TURKEY_LOCATIONS[city]}

@api_router.get("/locations/all")
async def get_all_locations():
    return {"locations": TURKEY_LOCATIONS}

# ============== PRICING ROUTES ==============

@api_router.get("/pricing")
async def get_pricing():
    return {"prices": CARPET_PRICES}

@api_router.post("/pricing/calculate")
async def calculate_price(data: dict):
    carpets = data.get("carpets", [])
    total_area = 0
    total_price = 0
    details = []
    
    for carpet in carpets:
        carpet_type = carpet.get("carpet_type", "normal")
        area = float(carpet.get("area", 0))
        if carpet_type not in CARPET_PRICES:
            continue
        price = area * CARPET_PRICES[carpet_type]
        total_area += area
        total_price += price
        details.append({"carpet_type": carpet_type, "area": area, "price": price})
    
    return {"details": details, "total_area": total_area, "total_price": total_price}

# ============== ORDER ROUTES ==============

@api_router.post("/orders")
async def create_order(order_data: OrderCreate, request: Request):
    user = await get_current_user(request)
    
    carpet_details = []
    for carpet in order_data.carpets:
        area = carpet.width * carpet.length
        carpet_details.append({"carpet_type": carpet.carpet_type, "width": carpet.width, "length": carpet.length, "area": area})
    
    order = {
        "order_id": f"ORD-{uuid.uuid4().hex[:8].upper()}",
        "customer_id": user["user_id"],
        "customer_name": user.get("name", ""),
        "customer_phone": order_data.phone,
        "customer_email": user.get("email", ""),
        "customer_address": order_data.address,
        "city": order_data.city,
        "district": order_data.district,
        "carpets": carpet_details,  # Müşteri tahmini bilgisi
        "actual_carpets": [],  # Firma tarafından girilecek gerçek bilgi
        "actual_total_area": 0,
        "actual_total_price": 0,
        "discount_percentage": 0,
        "discount_amount": 0,
        "final_price": 0,
        "carpet_count": len(carpet_details),
        "special_notes": order_data.special_notes,
        "status": "pending",
        "company_id": None,
        "company_name": None,
        "notified_companies": [],
        "rejected_by": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "assigned_at": None,
        "pickup_date": None,
        "washing_date": None,
        "delivery_date": None,
        "cancelled_at": None,
        "cancel_reason": None
    }
    
    await db.orders.insert_one(order)
    order.pop("_id", None)
    
    companies = await db.companies.find({"city": order_data.city, "is_active": True}, {"_id": 0}).to_list(100)
    if companies:
        notified = [c["user_id"] for c in companies]
        await db.orders.update_one({"order_id": order["order_id"]}, {"$set": {"notified_companies": notified}})
        order["notified_companies"] = notified
    
    return order

@api_router.get("/orders")
async def get_orders(request: Request):
    user = await get_current_user(request)
    
    if user["role"] == "customer":
        orders = await db.orders.find({"customer_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    elif user["role"] == "company":
        company = await db.companies.find_one({"user_id": user["user_id"]}, {"_id": 0})
        if company:
            orders = await db.orders.find(
                {"$or": [{"company_id": user["user_id"]}, {"status": "pending", "city": company.get("city"), "rejected_by": {"$ne": user["user_id"]}}]},
                {"_id": 0}
            ).sort("created_at", -1).to_list(100)
        else:
            orders = []
    elif user["role"] == "admin":
        orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    else:
        orders = []
    
    return {"orders": orders}

@api_router.get("/orders/pool")
async def get_order_pool(request: Request):
    user = await get_current_user(request)
    if user["role"] not in ["company", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if user["role"] == "company":
        company = await db.companies.find_one({"user_id": user["user_id"]}, {"_id": 0})
        if not company:
            return {"orders": []}
        orders = await db.orders.find({"status": "pending", "city": company.get("city"), "rejected_by": {"$ne": user["user_id"]}}, {"_id": 0}).sort("created_at", -1).to_list(100)
    else:
        orders = await db.orders.find({"status": "pending"}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    return {"orders": orders}

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, request: Request):
    user = await get_current_user(request)
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if user["role"] == "customer" and order["customer_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return order

@api_router.post("/orders/{order_id}/accept")
async def accept_order(order_id: str, request: Request):
    user = await get_current_user(request)
    if user["role"] != "company":
        raise HTTPException(status_code=403, detail="Only companies can accept orders")
    
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order["status"] != "pending":
        raise HTTPException(status_code=400, detail="Order already assigned")
    
    company = await db.companies.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")
    
    await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {"company_id": user["user_id"], "company_name": company["company_name"], "status": "assigned", "assigned_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return await db.orders.find_one({"order_id": order_id}, {"_id": 0})

@api_router.post("/orders/{order_id}/reject")
async def reject_order(order_id: str, request: Request):
    user = await get_current_user(request)
    if user["role"] != "company":
        raise HTTPException(status_code=403, detail="Only companies can reject orders")
    
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    await db.orders.update_one({"order_id": order_id}, {"$addToSet": {"rejected_by": user["user_id"]}})
    return {"message": "Order rejected"}

@api_router.post("/orders/{order_id}/cancel")
async def cancel_order(order_id: str, request: Request):
    user = await get_current_user(request)
    body = await request.json()
    reason = body.get("reason", "")
    
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Müşteri kendi siparişini, admin herhangi bir siparişi iptal edebilir
    if user["role"] == "customer" and order["customer_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if user["role"] not in ["customer", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Müşteri sadece halı alınmadan önce iptal edebilir (pending veya assigned)
    if user["role"] == "customer" and order["status"] not in ["pending", "assigned"]:
        raise HTTPException(status_code=400, detail="Halı alındıktan sonra iptal edilemez")
    
    if order["status"] in ["delivered", "cancelled"]:
        raise HTTPException(status_code=400, detail="Cannot cancel this order")
    
    await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {"status": "cancelled", "cancelled_at": datetime.now(timezone.utc).isoformat(), "cancel_reason": reason}}
    )
    
    return await db.orders.find_one({"order_id": order_id}, {"_id": 0})

@api_router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, status_update: OrderStatusUpdate, request: Request):
    user = await get_current_user(request)
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if user["role"] == "company" and order.get("company_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if user["role"] not in ["company", "admin"]:
        raise HTTPException(status_code=403, detail="Only companies or admins can update status")
    
    update_data = {"status": status_update.status}
    
    if status_update.status == "picked_up":
        update_data["pickup_date"] = datetime.now(timezone.utc).isoformat()
    elif status_update.status == "washing":
        update_data["washing_date"] = datetime.now(timezone.utc).isoformat()
    elif status_update.status == "delivered":
        update_data["delivery_date"] = datetime.now(timezone.utc).isoformat()
    
    await db.orders.update_one({"order_id": order_id}, {"$set": update_data})
    return await db.orders.find_one({"order_id": order_id}, {"_id": 0})

@api_router.post("/orders/{order_id}/assign")
async def admin_assign_order(order_id: str, assign_data: OrderAssign, request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    company = await db.companies.find_one({"user_id": assign_data.company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {"company_id": assign_data.company_id, "company_name": company["company_name"], "status": "assigned", "assigned_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return await db.orders.find_one({"order_id": order_id}, {"_id": 0})

@api_router.post("/orders/{order_id}/update-carpets")
async def update_order_carpets(order_id: str, carpet_data: CompanyUpdateOrder, request: Request):
    """Firma tarafından gerçek halı bilgilerini girme"""
    user = await get_current_user(request)
    
    if user["role"] not in ["company", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if user["role"] == "company" and order.get("company_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Gerçek halı bilgilerini hesapla
    actual_carpets = []
    total_area = 0
    total_price = 0
    
    for carpet in carpet_data.carpets:
        if carpet.carpet_type not in CARPET_PRICES:
            continue
        price = carpet.area * CARPET_PRICES[carpet.carpet_type]
        actual_carpets.append({
            "carpet_type": carpet.carpet_type,
            "area": carpet.area,
            "price": price
        })
        total_area += carpet.area
        total_price += price
    
    # Yeni üye indirimi kontrolü (1000 TL ve üzeri için %10)
    discount_amount = 0
    discount_percentage = 0
    final_price = total_price
    
    if total_price >= 1000:
        # Müşterinin bu ilk siparişi mi kontrol et
        customer_id = order.get("customer_id")
        if customer_id:
            completed_orders_count = await db.orders.count_documents({
                "customer_id": customer_id,
                "status": "delivered"
            })
            
            # İlk sipariş ise %10 indirim uygula
            if completed_orders_count == 0:
                discount_percentage = 10
                discount_amount = total_price * 0.10
                final_price = total_price - discount_amount
    
    await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {
            "actual_carpets": actual_carpets,
            "actual_total_area": total_area,
            "actual_total_price": total_price,
            "discount_percentage": discount_percentage,
            "discount_amount": discount_amount,
            "final_price": final_price
        }}
    )
    
    # Firma istatistiklerini güncelle
    if order.get("company_id"):
        await db.companies.update_one(
            {"user_id": order["company_id"]},
            {"$inc": {"total_area_washed": total_area}}
        )
    
    return await db.orders.find_one({"order_id": order_id}, {"_id": 0})

# ============== COMPANY ROUTES ==============

@api_router.get("/company/profile")
async def get_company_profile(request: Request):
    user = await get_current_user(request)
    if user["role"] != "company":
        raise HTTPException(status_code=403, detail="Not a company account")
    company = await db.companies.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")
    return company

@api_router.get("/company/stats")
async def get_company_stats(request: Request):
    user = await get_current_user(request)
    if user["role"] != "company":
        raise HTTPException(status_code=403, detail="Not a company account")
    
    company = await db.companies.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")
    
    total_orders = await db.orders.count_documents({"company_id": user["user_id"]})
    pending_orders = await db.orders.count_documents({"company_id": user["user_id"], "status": {"$in": ["assigned", "picked_up", "washing", "ready"]}})
    completed_orders = await db.orders.count_documents({"company_id": user["user_id"], "status": "delivered"})
    pool_orders = await db.orders.count_documents({"status": "pending", "city": company.get("city"), "rejected_by": {"$ne": user["user_id"]}})
    
    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
        "pool_orders": pool_orders,
        "total_area_washed": company.get("total_area_washed", 0)
    }

@api_router.get("/company/reports")
async def get_company_reports(request: Request, period: str = "daily", start: Optional[str] = None, end: Optional[str] = None):
    """Firma raporları - günlük/haftalık/aylık/yıllık veya tarih aralığı"""
    user = await get_current_user(request)
    if user["role"] != "company":
        raise HTTPException(status_code=403, detail="Not a company account")
    
    now = datetime.now(timezone.utc)
    
    # Tarih aralığı verilmişse onu kullan
    if start and end:
        try:
            start_date = datetime.fromisoformat(start.replace('Z', '+00:00'))
            end_date = datetime.fromisoformat(end.replace('Z', '+00:00'))
        except:
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = now
    else:
        if period == "daily":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "weekly":
            start_date = now - timedelta(days=now.weekday())
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "monthly":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif period == "yearly":
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now
    
    # Tamamlanan siparişleri getir
    orders = await db.orders.find({
        "company_id": user["user_id"],
        "status": "delivered",
        "delivery_date": {"$gte": start_date.isoformat(), "$lte": end_date.isoformat()}
    }, {"_id": 0}).to_list(1000)
    
    # Halı türüne göre m2 ve fiyat hesapla
    carpet_stats = {"normal": {"area": 0, "price": 0}, "shaggy": {"area": 0, "price": 0}, "silk": {"area": 0, "price": 0}, "antique": {"area": 0, "price": 0}}
    total_area = 0
    total_price = 0
    total_orders = len(orders)
    
    for order in orders:
        for carpet in order.get("actual_carpets", []):
            carpet_type = carpet.get("carpet_type", "normal")
            area = carpet.get("area", 0)
            price = carpet.get("price", 0)
            if carpet_type in carpet_stats:
                carpet_stats[carpet_type]["area"] += area
                carpet_stats[carpet_type]["price"] += price
            total_area += area
            total_price += price
    
    return {
        "period": period,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "total_orders": total_orders,
        "total_area": total_area,
        "total_price": total_price,
        "carpet_stats": carpet_stats
    }

# ============== ADMIN ROUTES ==============

@api_router.get("/admin/stats")
async def get_admin_stats(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "pending"})
    active_orders = await db.orders.count_documents({"status": {"$in": ["assigned", "picked_up", "washing", "ready"]}})
    completed_orders = await db.orders.count_documents({"status": "delivered"})
    cancelled_orders = await db.orders.count_documents({"status": "cancelled"})
    total_customers = await db.users.count_documents({"role": "customer"})
    total_companies = await db.companies.count_documents({})
    
    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "active_orders": active_orders,
        "completed_orders": completed_orders,
        "cancelled_orders": cancelled_orders,
        "total_customers": total_customers,
        "total_companies": total_companies
    }

@api_router.get("/admin/reports")
async def get_admin_reports(request: Request, period: str = "daily", company_id: Optional[str] = None, start: Optional[str] = None, end: Optional[str] = None):
    """Admin raporları - günlük/haftalık/aylık/yıllık veya tarih aralığı, firma bazlı filtreleme"""
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    now = datetime.now(timezone.utc)
    
    # Tarih aralığı verilmişse onu kullan
    if start and end:
        try:
            start_date = datetime.fromisoformat(start.replace('Z', '+00:00'))
            end_date = datetime.fromisoformat(end.replace('Z', '+00:00'))
        except:
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = now
    else:
        if period == "daily":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "weekly":
            start_date = now - timedelta(days=now.weekday())
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "monthly":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif period == "yearly":
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now
    
    # Query oluştur
    query = {"status": "delivered", "delivery_date": {"$gte": start_date.isoformat(), "$lte": end_date.isoformat()}}
    if company_id:
        query["company_id"] = company_id
    
    orders = await db.orders.find(query, {"_id": 0}).to_list(1000)
    
    # Halı türüne göre m2 ve fiyat hesapla
    carpet_stats = {"normal": {"area": 0, "price": 0}, "shaggy": {"area": 0, "price": 0}, "silk": {"area": 0, "price": 0}, "antique": {"area": 0, "price": 0}}
    total_area = 0
    total_price = 0
    total_orders = len(orders)
    
    # Firma bazlı istatistikler
    company_stats = {}
    
    for order in orders:
        company_id_order = order.get("company_id")
        company_name = order.get("company_name", "Bilinmeyen")
        
        if company_id_order and company_id_order not in company_stats:
            company_stats[company_id_order] = {
                "name": company_name, 
                "total_area": 0, 
                "total_price": 0,
                "order_count": 0, 
                "carpet_stats": {"normal": {"area": 0, "price": 0}, "shaggy": {"area": 0, "price": 0}, "silk": {"area": 0, "price": 0}, "antique": {"area": 0, "price": 0}}
            }
        
        if company_id_order:
            company_stats[company_id_order]["order_count"] += 1
        
        for carpet in order.get("actual_carpets", []):
            carpet_type = carpet.get("carpet_type", "normal")
            area = carpet.get("area", 0)
            price = carpet.get("price", 0)
            
            if carpet_type in carpet_stats:
                carpet_stats[carpet_type]["area"] += area
                carpet_stats[carpet_type]["price"] += price
                if company_id_order:
                    company_stats[company_id_order]["carpet_stats"][carpet_type]["area"] += area
                    company_stats[company_id_order]["carpet_stats"][carpet_type]["price"] += price
            
            total_area += area
            total_price += price
            if company_id_order:
                company_stats[company_id_order]["total_area"] += area
                company_stats[company_id_order]["total_price"] += price
    
    return {
        "period": period,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "total_orders": total_orders,
        "total_area": total_area,
        "total_price": total_price,
        "carpet_stats": carpet_stats,
        "company_stats": list(company_stats.values())
    }

@api_router.get("/admin/companies")
async def get_all_companies(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    companies = await db.companies.find({}, {"_id": 0}).to_list(1000)
    return {"companies": companies}

@api_router.get("/admin/users")
async def get_all_users(request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return {"users": users}

@api_router.patch("/admin/users/{user_id}")
async def update_user(user_id: str, user_update: UserUpdate, request: Request):
    admin = await get_current_user(request)
    if admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {k: v for k, v in user_update.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"user_id": user_id}, {"$set": update_data})
    
    return await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, request: Request):
    admin = await get_current_user(request)
    if admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.get("role") == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete admin users")
    
    await db.users.delete_one({"user_id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    if user.get("role") == "company":
        await db.companies.delete_one({"user_id": user_id})
    
    return {"message": "User deleted successfully"}

@api_router.post("/admin/users/{user_id}/ban")
async def ban_user(user_id: str, request: Request):
    admin = await get_current_user(request)
    if admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.get("role") == "admin":
        raise HTTPException(status_code=400, detail="Cannot ban admin users")
    
    await db.users.update_one({"user_id": user_id}, {"$set": {"is_banned": True}})
    await db.user_sessions.delete_many({"user_id": user_id})
    return {"message": "User banned successfully"}

@api_router.post("/admin/users/{user_id}/unban")
async def unban_user(user_id: str, request: Request):
    admin = await get_current_user(request)
    if admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    await db.users.update_one({"user_id": user_id}, {"$set": {"is_banned": False}})
    return {"message": "User unbanned successfully"}

@api_router.patch("/admin/companies/{user_id}")
async def update_company(user_id: str, request: Request):
    admin = await get_current_user(request)
    if admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    body = await request.json()
    company = await db.companies.find_one({"user_id": user_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    update_data = {}
    if "is_active" in body:
        update_data["is_active"] = body["is_active"]
    if "company_name" in body:
        update_data["company_name"] = body["company_name"]
    
    if update_data:
        await db.companies.update_one({"user_id": user_id}, {"$set": update_data})
    
    return await db.companies.find_one({"user_id": user_id}, {"_id": 0})

# ============== ROOT ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "HALIYOL API - Halı Yıkama Platformu"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
