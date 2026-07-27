# ✈️ AI 여행 감성 큐레이터 (AI Travel Emotion Curator)

사용자의 기분과 취향을 문장으로 입력받아, 전 세계의 숨겨진 감성 여행지를 추천하고 매거진 형태의 리포트로 발행해 주는 웹 서비스입니다. 무거운 DB 없이 **Web-RAG(실시간 웹 검색 증강 생성)** 방식을 활용하여, 실제 블로그 후기와 최신 데이터를 기반으로 맞춤형 여행지를 제안합니다.

---

## 🛠 Tech Stack
* **Frontend:** React, Vite
* **Backend:** Python, FastAPI
* **AI & RAG:** OpenAI (GPT-4o-mini), Tavily Search API
* **Database:** 브라우저 LocalStorage (저장 기능)

---

## 🚀 시작하기 (Getting Started)

이 프로젝트를 로컬 환경에서 실행하기 위한 방법입니다. 프론트엔드와 백엔드 서버를 각각 실행해야 합니다.

### 📋 사전 준비 (Prerequisites)
* [Node.js](https://nodejs.org/) (Frontend 실행용)
* [Python 3.8+](https://www.python.org/) (Backend 실행용)
* OpenAI API Key
* Tavily API Key

---

### 1. 백엔드(Backend) 실행 방법

AI 엔진과 API가 통신하는 백엔드 서버를 먼저 세팅하고 실행합니다.

**① 백엔드 폴더로 이동 및 가상환경 생성**
```bash
cd backend
python -m venv venv
```

**② 가상환경 활성화**
* Mac / Linux:
```bash
source venv/bin/activate
```
* Windows (명령 프롬프트/파워쉘):
```bash
venv\Scripts\activate
```

**③ 필요 라이브러리 설치**
```bash
pip install fastapi uvicorn openai tavily-python python-dotenv
```

**④ 환경변수(.env) 설정**
`backend` 폴더 최상단에 `.env` 파일을 생성하고 아래와 같이 API 키를 입력합니다.
```env
OPENAI_API_KEY=당신의_OPENAI_API_KEY
TAVILY_API_KEY=당신의_TAVILY_API_KEY
```

**⑤ 백엔드 서버 실행**
```bash
uvicorn main:app --reload
```
> 백엔드 서버가 `http://localhost:8000` 에서 실행됩니다. API 테스트는 `http://localhost:8000/docs` (Swagger UI)에서 가능합니다.

---

### 2. 프론트엔드(Frontend) 실행 방법

사용자가 볼 수 있는 웹 화면을 실행합니다. 터미널을 **새로 하나 더 열어서** 진행해 주세요.

**① 프론트엔드 폴더로 이동**
```bash
cd frontend
```

**② 패키지 설치**
```bash
npm install
```

**③ 개발 서버 실행**
```bash
npm run dev
```
> 프론트엔드 서버가 `http://localhost:5173` 에서 실행됩니다. 브라우저에서 해당 주소로 접속하면 서비스를 이용할 수 있습니다!

---

## 💡 주요 기능 (Features)
* **자연어 기반 추천:** "바다 보면서 멍때리고 싶어" 같은 일상적인 문장으로 검색 가능
* **Web-RAG 기반 리뷰 요약:** AI가 지어낸 가짜 후기가 아닌, 실제 웹 검색을 통한 생생한 대중의 평가 반영
* **매거진 형태 리포트:** 큐레이션 이유, 추천 활동, 베스트 타이밍, 추천 BGM 제공
* **내 서랍 (로컬 저장소):** 마음에 드는 리포트를 브라우저에 저장하고 모아보는 기능
