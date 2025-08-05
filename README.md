🧠 Memory Farm

Memory Farm is a full-stack social memory journaling app built with React, Node.js, Express, and MongoDB. Users can log personal memories, choose emotions, mark them as public/private, follow others, and explore public memories from the community.

---

🚀 Live Demo

- Frontend (Netlify): https://your-site.netlify.app
- Backend (Railway): https://your-api.railway.app

---

🛠 Tech Stack

- Frontend: React + Tailwind CSS + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Auth: Cookie-based sessions (JWT + HTTPOnly cookies)
- Hosting: Netlify (frontend), Railway (backend)

---

📦 Folder Structure

memory-farm/
├── client/         # React frontend
├── server/         # Node.js/Express backend
├── README.md       # Project documentation

---

⚙️ Setup & Installation (Local Development)

🔐 Prerequisites:
- Node.js v18+
- MongoDB Atlas account
- Railway account (for backend hosting)
- Netlify account (for frontend hosting)

---

🧩 Step 1: Clone the repo

git clone https://github.com/your-username/memory-farm.git
cd memory-farm

---

💻 Step 2: Set up the Backend

cd server
npm install

Create a .env file in /server:

PORT=4000
MONGO_URI=your-mongodb-atlas-uri
JWT_SECRET=your-jwt-secret
EMAIL_FROM=your-gmail-address
EMAIL_PASS=your-gmail-app-password
CLIENT_URL=http://localhost:5173

Run the backend:

npm run dev

---

🌐 Step 3: Set up the Frontend

cd ../client
npm install

Create a .env file in /client:

VITE_API_URL=http://localhost:4000

Run the app:

npm run dev

Visit http://localhost:5173

---

🧪 Features

✅ User signup/login/logout with email verification  
✅ Private and public memories with emotion and color tags  
✅ Create, edit, delete memories  
✅ Report inappropriate content  
✅ View your profile and others’  
✅ Follow/unfollow users  
✅ Account settings: display name, bio, location, privacy  
✅ Full filtering by emotion  
✅ Responsive design (mobile-first)

---

📦 Deployment Notes

🌐 Frontend:
- Host on Netlify
- Build command: npm run build
- Publish directory: client/dist
- Add env variable:
  VITE_API_URL=https://your-api.railway.app
- Add _redirects file inside client/public:

/*    /index.html   200

---

⚙️ Backend:
- Host on Railway
- Add all .env variables via Railway's Environment tab
- Set CLIENT_URL to your Netlify frontend URL

---

👨‍💻 Contributors

Mahmoud Fawzy – https://github.com/MahmoudFawzy1992

---

📬 Contact

Have feedback or feature suggestions?  
Open an issue or email: mahmoud.fawzy1992.2@gmail.com

---

📄 License

This project is private and protected. Contact the owner for collaboration access.
