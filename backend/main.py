from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from tavily import TavilyClient
import os
from dotenv import load_dotenv
import json

# 1. 환경 변수(.env) 로드
load_dotenv()

# 2. API 클라이언트 초기화
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

# 3. FastAPI 앱 생성 및 CORS 설정 (리액트와 통신하기 위해 필수!)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # 리액트 개발 서버 주소 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. 프론트엔드에서 받을 데이터 구조 정의
class UserRequest(BaseModel):
    user_prompt: str

# 5. 여행지 추천 API 엔드포인트 (POST /api/recommend)
@app.post("/api/recommend")
async def get_recommendation(request: UserRequest):
    user_text = request.user_prompt
    
    # [Web-RAG 1단계] 유저 문장에서 검색 키워드 추출
    query_response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "사용자의 문장을 바탕으로 여행지 후기를 찾기 위한 구체적인 구글 검색어 1개를 도출해. (예: 해외 조용한 소도시 여행지 블로그 후기). 다른 말 없이 검색어만 반환해."},
            {"role": "user", "content": user_text}
        ]
    )
    search_query = query_response.choices[0].message.content.strip()
    
    # [Web-RAG 2단계] Tavily 실시간 웹 검색 (최신 블로그/정보 수집)
    search_result = tavily_client.search(query=search_query, search_depth="basic", max_results=3)
    context_text = "\n".join([f"- {result['content']}" for result in search_result['results']])
    
    # [Web-RAG 3 & 4단계] 프롬프트 증강 및 최종 JSON 생성
    system_prompt = f"""
    당신은 최고의 '여행 큐레이션 전문가'입니다.
    사용자의 취향과 [참고 데이터]를 바탕으로 전 세계에서 딱 한 곳의 여행지를 추천하고, 반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 불가합니다.
    
    [참고 데이터]
    {context_text}
    
    [JSON 출력 형식]
    {{
      "catchphrase": "여행지와 감성을 조합한 한 줄 헤드카피",
      "country": "국가 이름",
      "destination": "구체적인 스팟 또는 도시",
      "why": "이곳이 취향 저격인 이유 (3~4줄)",
      "what_to_do": ["감성 활동 1", "감성 활동 2", "감성 활동 3"],
      "social_proof": "[참고 데이터]를 바탕으로 한 실제 사람들의 평가 요약",
      "best_timing": "무드가 극대화되는 구체적인 타이밍",
      "bgm": "어울리는 음악 장르"
    }}
    """
    
    final_response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={ "type": "json_object" }, # 무조건 JSON으로 뱉게 강제
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_text}
        ]
    )
    
    # AI가 만든 JSON 문자열을 파이썬 딕셔너리로 변환하여 프론트로 전달
    return json.loads(final_response.choices[0].message.content)