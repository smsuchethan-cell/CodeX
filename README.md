# NagaraIQ — Predictive Civic Intelligence Platform

A pothole in Koramangala gets fixed in 3 days. The same pothole in Yelahanka takes 47 days.
NagaraIQ finds that pattern — and exposes it.

Built for Build for Bengaluru 2.0 · Civic-tech & Governance · PS 4.4

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🚀 Overview

NagaraIQ is an AI-powered civic complaint platform designed to expose patterns of administrative bias and inefficiency in municipal governance. The platform provides two distinct interfaces:

### 👨‍💼 For Ward Officers (Authority View)
- Real-time complaint dashboard with auto-prioritization
- AI-powered urgency scoring (0-100)
- Geographic visualization of complaint density
- 7-day complaint forecasting
- Performance metrics and analytics
- Batch resolution management

### 🧑‍💻 For Journalists & Citizens (Public View)
- Bias detection heatmap showing ignored wards
- Fake resolution detector using NLP
- Auto-generated investigation briefs with RTI templates
- Comparative ward analytics
- Export reports in multiple formats

---

## ✨ Features

### 📷 Smart Classification
- **Image + Text Analysis**: Dual-input system using CLIP and DistilBERT
- **Auto-Detection**: Automatically categorizes issues (pothole, drainage, streetlight, etc.)
- **Confidence Scoring**: Shows AI confidence level for each classification

### ⚡ Urgency & Prioritization
- **ML-Based Urgency Scoring**: Assigns 0–100 priority automatically
- **Historical Context**: Considers complaint history and patterns
- **Real-time Re-ranking**: Updates priorities as new complaints arrive

### 🗺️ Geographic Intelligence
- **Live Complaint Density Heatmap**: Ward-level visualization
- **Hotspot Detection**: Identifies problem clusters
- **Distribution Analysis**: Compare complaint patterns across wards

### 🚨 Bias Detection Engine
- **Resolution Bias Detector**: Flags unfair resolution patterns between wards
- **Time-to-Resolution Analysis**: Identifies systemic delays
- **Statistical Significance Testing**: Ensures findings are statistically valid

### 🚨 Fake Resolution Detection
- **Duplicate Detection**: Identifies re-filed complaints with similar issues
- **Text Similarity Analysis**: Uses semantic matching to find pattern
- **Confidence Scoring**: Provides likelihood of fake resolution

### 📅 Complaint Forecasting
- **7-Day Prediction**: Forecasts complaint volume for next week
- **Ward-Level Forecasting**: Specific predictions per ward
- **Trend Analysis**: Identifies emerging problem areas

### 📤 Export & Reporting
- **Multiple Formats**: JSON, CSV, PDF exports
- **RTI Templates**: Pre-filled Right-to-Information templates
- **Investigation Briefs**: AI-generated analysis documents

### 🔐 Enterprise Features
- Role-based access control (Citizen, Ward Officer, Admin, Journalist)
- JWT authentication with token refresh
- Rate limiting and DDoS protection
- Request tracking with unique IDs

---

## 🛠 Technology Stack

### Backend
- **Framework**: FastAPI (async Python web framework)
- **Database**: PostgreSQL (relational data)
- **Caching**: Redis (for performance optimization)
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT (Python-Jose)

### AI/ML
- **Text Classification**: DistilBERT (HuggingFace Transformers)
- **Image Classification**: CLIP ViT-B/32 (OpenAI)
- **Clustering**: Scikit-learn
- **Data Processing**: Pandas, NumPy

### Frontend
- **UI Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand + Immer
- **Data Fetching**: Axios with custom interceptors
- **Maps**: Leaflet.js
- **Charts**: Recharts & Chart.js
- **Icons**: Lucide React
- **Routing**: React Router v7

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **API Documentation**: Swagger/OpenAPI (FastAPI)
- **Logging**: Python logging + Sentry integration
- **Monitoring**: Health check endpoints

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 12+
- Redis 6+ (optional, for caching)

### Local Development Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd Predictive-Civic-Intelligence-Platform
```

#### 2. Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# Then run migrations (if applicable)
python -m alembic upgrade head

# Start backend server
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file if needed
cp .env.example .env

# Start development server
npm run dev
```

#### 4. Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs
- **Database**: localhost:5432 (via PostgreSQL client)

---

## 📁 Project Structure

```
Predictive-Civic-Intelligence-Platform/
├── backend/
│   ├── auth.py                 # Authentication & JWT
│   ├── config.py               # Configuration management
│   ├── database.py             # Database setup & connection pooling
│   ├── exceptions.py           # Custom exceptions
│   ├── main.py                 # FastAPI application
│   ├── utils.py                # Utility functions
│   ├── data/                   # CSV data files
│   ├── ml/                     # ML/AI models
│   │   ├── classifier.py       # Text classification
│   │   ├── image_classifier.py # Image classification
│   │   ├── clustering.py       # Geographic clustering
│   │   ├── bias_detector.py    # Bias detection
│   │   ├── fake_resolution.py  # Duplicate detection
│   │   ├── forecaster.py       # Time-series forecasting
│   │   └── urgency_scorer.py   # Urgency calculation
│   ├── models/                 # ORM models
│   │   ├── complaint.py        # Complaint model
│   │   └── user.py             # User model
│   ├── routers/                # API endpoints
│   │   ├── complaints.py       # Complaint endpoints
│   │   ├── bias.py             # Bias detection endpoints
│   │   ├── hotspots.py         # Hotspot endpoints
│   │   ├── forecast.py         # Forecast endpoints
│   │   ├── image.py            # Image analysis endpoints
│   │   ├── users.py            # User endpoints
│   │   └── compare.py          # Comparison endpoints
│   ├── schemas/                # Pydantic schemas
│   │   ├── complaint_schema.py
│   │   ├── forecast_schema.py
│   │   ├── hotspot_schema.py
│   │   ├── bias_schema.py
│   │   └── image_schema.py
│   └── services/               # Business logic services
│       ├── complaint_service.py
│       ├── bias_service.py
│       ├── forecast_service.py
│       ├── hotspot_service.py
│       ├── image_service.py
│       └── pipeline.py
├── frontend/
│   ├── src/
│   │   ├── api/                # API client configuration
│   │   ├── assets/             # Static assets
│   │   ├── components/         # React components
│   │   │   ├── common/         # Shared components (ErrorBoundary, Loading, etc.)
│   │   │   ├── BiasTable.tsx
│   │   │   ├── ComplaintForm.tsx
│   │   │   ├── ForecastChart.tsx
│   │   │   ├── HotspotMap.tsx
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── Navbar.tsx
│   │   ├── pages/              # Page components
│   │   │   ├── BiasPage.tsx
│   │   │   ├── ComparePage.tsx
│   │   │   ├── ComplaintPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ForecastPage.tsx
│   │   │   ├── InvestigatePage.tsx
│   │   │   └── TriagePage.tsx
│   │   ├── utils/              # Frontend utilities
│   │   │   ├── apiClient.ts    # Axios configuration
│   │   │   ├── hooks.ts        # Custom React hooks
│   │   │   ├── store.ts        # Zustand store
│   │   │   └── formatting.ts   # Utility functions
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   │   ├── bengaluru_wards.geojson
│   │   └── manifest.json
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── README.md
├── .env.example                # Environment variables template
├── docker-compose.yml          # Docker composition
├── Dockerfile.backend          # Backend Docker image
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

---

## 📚 API Documentation

### Core Endpoints

#### Complaints
```
GET    /api/complaints/complaints              # List complaints
POST   /api/complaints/complaints              # Create complaint
GET    /api/complaints/complaints/{id}         # Get complaint details
PUT    /api/complaints/complaints/{id}         # Update complaint
DELETE /api/complaints/complaints/{id}         # Delete complaint
```

#### Bias Detection
```
GET    /api/bias/analysis                      # Get bias analysis
GET    /api/bias/stats                         # Get bias statistics
GET    /api/bias/heatmap                       # Get heatmap data
```

#### Hotspots
```
GET    /api/hotspots/hotspots                  # List hotspots
GET    /api/hotspots/geojson                   # Get GeoJSON for mapping
```

#### Forecasting
```
GET    /api/forecast/forecast?days=7           # Get forecast
GET    /api/forecast/forecast/{ward}?days=7    # Get ward forecast
```

#### Image Analysis
```
POST   /api/image/analyze                      # Upload & analyze image
```

#### Users
```
POST   /api/users/login                        # User login
POST   /api/users/register                     # User registration
POST   /api/users/logout                       # User logout
GET    /api/users/me                           # Get current user
PUT    /api/users/me                           # Update profile
```

### Response Format

All endpoints return standardized JSON responses:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "error": null,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Rate Limiting
- Default: 100 requests per 60 seconds
- Configurable via `RATE_LIMIT_REQUESTS` and `RATE_LIMIT_WINDOW_SECONDS`

---

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and update:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=nagaraiq

# API
API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000

# Authentication
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Features
FEATURE_IMAGE_UPLOAD=true
FEATURE_BIAS_DETECTION=true
FEATURE_FORECASTING=true
```

---

## 🧪 Testing

### Backend Tests
```bash
pytest backend/tests/
pytest --cov=backend  # With coverage report
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 📊 Performance Optimization

- **Caching**: Redis for expensive queries
- **Database Indexing**: Optimized queries with proper indexes
- **GZIP Compression**: Enabled for all API responses
- **Connection Pooling**: PostgreSQL connection pooling
- **CDN**: Frontend assets cached in browser

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -d nagaraiq

# Reset migrations
python -m alembic downgrade base
python -m alembic upgrade head
```

### Model Loading Issues
- Ensure internet connection for downloading models
- Check disk space for model files
- Verify PyTorch installation: `python -c "import torch; print(torch.__version__)"`

### Frontend Build Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Python: PEP 8 (use Black formatter)
- TypeScript: ESLint configuration
- Commit messages: Conventional Commits

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- Built for Build for Bengaluru 2.0 hackathon
- Uses OpenAI CLIP, HuggingFace Transformers, and other open-source projects
- Inspired by civic-tech initiatives worldwide

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check existing documentation
- Review API docs at `/api/docs`

---

## 🔗 Links

- **API Documentation**: http://localhost:8000/api/docs
- **GitHub**: [Repository URL]
- **Live Demo**: [Demo URL if available]

---

**Last Updated**: January 2024
**Version**: 1.0.0

⚙️ Getting Started

1. Clone the Repository

git clone https://github.com/Varshinibhargav-17/Predictive-Civic-Intelligence-Platform.git
cd Predictive-Civic-Intelligence-Platform

---

2. Backend Setup

cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm

Pre-download ML models:

python -c "
from transformers import pipeline, CLIPModel
pipeline('zero-shot-classification', model='cross-encoder/nli-distilroberta-base')
CLIPModel.from_pretrained('openai/clip-vit-base-patch32')
print('Models ready.')
"

---

3. Database Setup

createdb nagaraiq
python data/load_csv.py
uvicorn main:app --reload --port 8000

---

4. Frontend Setup

cd ../frontend
npm install
npm run dev

👉 App runs at: http://localhost:5173
👉 API docs: http://localhost:8000/docs

---

🧪 Testing Image Classification

curl -X POST -F "file=@pothole.jpg" http://127.0.0.1:8000/classify-image

Example response:

{
  "predicted_category": "Road & Potholes",
  "confidence": 0.74,
  "needs_manual_confirmation": false
}

---

📊 Dataset

- 1000 civic complaints across 25 Bengaluru wards
- 30 real complaints + 970 synthetic

Key Insight:

- Affluent wards: ~6.9 days resolution
- Non-affluent wards: ~70.4 days resolution

👉 Bias is measurable and visible.

---

🎯 Demo

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/docs

---

📌 Why This Matters

NagaraIQ doesn't just track complaints—it reveals systemic bias in civic governance and empowers both officials and citizens with actionable insights.

---
