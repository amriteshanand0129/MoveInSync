# 🚗 Carpooling System Backend  

This is the **backend server** for the **Carpooling System**, a ride-sharing platform that allows users to find, create, and join rides. The backend is built using **Node.js, Express, MongoDB**, and **WebSockets** for real-time updates.

---

## 📺 **Demo Video**
Watch the full project demonstration here:  
🔗 [Video Demo](https://drive.google.com/drive/folders/1TDNILCOFfVENKyc-CCbK3V-lNyYy4pZm?usp=drive_link)  

---

## 🚀 **Features**
✅ **User Authentication** (JWT-based authentication)  
✅ **Ride Management** (Create, join, and update rides)  
✅ **Real-time Ride Updates** (WebSocket integration)  
✅ **Ride Matching Algorithm** (Filters rides based on preferences, location proximity, and matching percentage)  
✅ **Rider Privacy** (Personal details hidden for other users)  
✅ **Emergency SOS Feature** (Notifies family members & authorities with the rider’s location)  

---

## 🛠️ **Tech Stack**
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (hosted on Atlas)
- **WebSocket:** `ws` for real-time communication  
- **Authentication:** JWT  

---

## ⚙️ **Setup & Installation**

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/amriteshanand0129/MoveInSync
cd backend
```

### **2️⃣ Install Dependencies**
```sh
npm install
```

### **3️⃣  Setup Environment Variables**
Create a .env file in the root directory and add the following:
```sh
PORT = 8080
DB_URL = your_database_url
SECRET = your_jwt_secret
```

### **4️⃣ Start the server**
```sh
npm start
```

The sever will be listening on PORT 8080.

### 🛰️ **API Endpoints**  ###

🔗 [View Documentation](https://documenter.getpostman.com/view/33774669/2sAYXEFJSi)