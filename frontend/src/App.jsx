import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  
  // 새로 추가된 상태: 저장된 리포트 목록과 서랍 열림/닫힘 상태
  const [savedReports, setSavedReports] = useState([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // 앱이 처음 켜질 때 LocalStorage에서 저장된 데이터 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('travel_reports')
    if (saved) {
      setSavedReports(JSON.parse(saved))
    }
  }, [])

  const handleSearch = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setResult(null)
    setError('')
    setIsDrawerOpen(false) // 검색할 땐 서랍 닫기

    try {
      const response = await fetch('http://localhost:8000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_prompt: prompt }),
      })

      if (!response.ok) throw new Error('서버와 연결할 수 없습니다.')

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('여행지를 찾는 중 문제가 발생했어요. 조금 다르게 다시 입력해 볼까요?')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 리포트 저장 함수
  const handleSave = () => {
    // 중복 저장 방지용 간단한 검사
    const isAlreadySaved = savedReports.some(
      (report) => report.destination === result.destination && report.catchphrase === result.catchphrase
    )

    if (isAlreadySaved) {
      alert('이미 서랍에 저장된 여행지입니다! 🗂️')
      return
    }

    const newReport = { ...result, id: Date.now() }
    const updatedReports = [newReport, ...savedReports]
    
    setSavedReports(updatedReports)
    localStorage.setItem('travel_reports', JSON.stringify(updatedReports))
    alert('내 서랍에 안전하게 저장되었습니다! 🗂️')
  }

  // 리포트 삭제 함수
  const handleDelete = (id) => {
    const updatedReports = savedReports.filter(report => report.id !== id)
    setSavedReports(updatedReports)
    localStorage.setItem('travel_reports', JSON.stringify(updatedReports))
  }

  // 리포트를 그려주는 컴포넌트 함수
  const renderReportCard = (reportData, isSavedCard = false) => (
    <div className="report-card" key={reportData.id || 'current'}>
      <div className="report-header">
        <h2>"{reportData.catchphrase}"</h2>
        <h3 className="destination">📍 [{reportData.country}] {reportData.destination}</h3>
      </div>

      <div className="report-body">
        <section className="report-section">
          <h4>왜 이곳인가요? (Why)</h4>
          <p>{reportData.why}</p>
        </section>

        <section className="report-section">
          <h4>여기서 꼭 해봐야 할 것 (What to do)</h4>
          <ul>
            {reportData.what_to_do.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="report-section highlight">
          <h4>💬 사람들의 진짜 이야기 (Social Proof)</h4>
          <p>{reportData.social_proof}</p>
        </section>

        <div className="report-footer">
          <div className="footer-item"><strong>⏰ 추천 타이밍:</strong> {reportData.best_timing}</div>
          <div className="footer-item"><strong>🎵 추천 BGM:</strong> {reportData.bgm}</div>
        </div>
        
        {/* 버튼 영역 (검색 결과일 땐 '저장', 서랍 안일 땐 '삭제') */}
        <div className="action-buttons">
          {!isSavedCard ? (
            <button className="save-button" onClick={handleSave}>💾 이 리포트 저장하기</button>
          ) : (
            <button className="delete-button" onClick={() => handleDelete(reportData.id)}>🗑️ 서랍에서 삭제</button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="container">
      <header className="header">
        <h1>AI 여행 감성 큐레이터</h1>
        <p>지금 당신의 기분이나 원하는 여행의 무드를 자유롭게 적어주세요.</p>
        
        {/* 네비게이션 버튼 */}
        <div className="nav-buttons">
          <button 
            className={`nav-btn ${!isDrawerOpen ? 'active' : ''}`} 
            onClick={() => setIsDrawerOpen(false)}
          >
            🔍 새 여행지 찾기
          </button>
          <button 
            className={`nav-btn ${isDrawerOpen ? 'active' : ''}`} 
            onClick={() => setIsDrawerOpen(true)}
          >
            🗂️ 내 서랍 ({savedReports.length})
          </button>
        </div>
      </header>

      <main className="main-content">
        {!isDrawerOpen ? (
          /* --- 검색 화면 --- */
          <>
            <div className="search-box">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 퇴사하고 일주일 동안 아무도 모르는 해외 시골에서 멍때리고 싶어."
                rows={3}
                className="search-input"
              />
              <button onClick={handleSearch} disabled={loading} className="search-button">
                {loading ? 'AI가 전 세계를 탐색 중입니다...' : '나만의 여행지 찾기'}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {result && !loading && renderReportCard(result, false)}
          </>
        ) : (
          /* --- 내 서랍 화면 --- */
          <div className="drawer-container">
            <h2 className="drawer-title">내가 저장한 여행지</h2>
            {savedReports.length === 0 ? (
              <p className="empty-message">아직 저장된 여행지가 없습니다. 새로운 취향을 검색해 보세요!</p>
            ) : (
              <div className="saved-list">
                {savedReports.map(report => renderReportCard(report, true))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App