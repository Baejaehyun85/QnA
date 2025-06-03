// 질문과 답변을 저장할 배열
let questions = [];

// DOM 요소
const questionForm = document.getElementById('questionForm');
const questionsList = document.getElementById('questionsList');

// 로딩 상태 표시 함수
function showLoading(element) {
    element.style.opacity = '0.5';
    element.style.pointerEvents = 'none';
}

function hideLoading(element) {
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
}

// 에러 메시지 표시 함수
function showError(message) {
    alert(message);
}

// 질문 목록 실시간 업데이트 리스너 설정
function setupRealtimeListener() {
    showLoading(questionsList);
    
    db.collection('questions')
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            hideLoading(questionsList);
            questionsList.innerHTML = '';
            
            if (snapshot.empty) {
                questionsList.innerHTML = '<p class="no-questions">아직 등록된 질문이 없습니다.</p>';
                return;
            }
            
            snapshot.forEach((doc) => {
                const question = { id: doc.id, ...doc.data() };
                renderQuestion(question);
            });
        }, (error) => {
            hideLoading(questionsList);
            console.error("실시간 업데이트 에러:", error);
            showError("질문 목록을 불러오는 중 오류가 발생했습니다.");
        });
}

// 폼 제출 이벤트 처리
questionForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    showLoading(questionForm);
    
    // 폼 데이터 가져오기
    const subject = document.getElementById('subject').value.trim();
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    
    try {
        // Firestore에 질문 추가
        await db.collection('questions').add({
            subject: subject,
            title: title,
            content: content,
            answers: [],
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // 폼 초기화
        questionForm.reset();
        hideLoading(questionForm);
        
        // 분석 이벤트 기록
        analytics.logEvent('question_created', {
            subject: subject
        });
    } catch (error) {
        hideLoading(questionForm);
        console.error("질문 등록 에러:", error);
        showError("질문 등록 중 오류가 발생했습니다.");
    }
});

// 단일 질문 렌더링
function renderQuestion(question) {
    const questionElement = document.createElement('div');
    questionElement.className = 'question-item';
    
    const timestamp = question.timestamp ? question.timestamp.toDate().toLocaleString() : '시간 정보 없음';
    
    questionElement.innerHTML = `
        <div class="question-header">
            <span class="question-subject">${escapeHtml(question.subject)}</span>
            <span class="question-date">${timestamp}</span>
        </div>
        <div class="question-title">${escapeHtml(question.title)}</div>
        <div class="question-content">${escapeHtml(question.content)}</div>
        <div class="answers" id="answers-${question.id}">
            ${renderAnswers(question.answers)}
        </div>
        <div class="answer-form">
            <textarea id="answer-input-${question.id}" placeholder="답변을 작성해주세요"></textarea>
            <button onclick="submitAnswer('${question.id}')">답변 등록</button>
        </div>
    `;
    questionsList.appendChild(questionElement);
}

// HTML 이스케이프 함수
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 답변 렌더링
function renderAnswers(answers = []) {
    if (!answers.length) {
        return '<p class="no-answers">아직 답변이 없습니다.</p>';
    }
    
    return answers.map(answer => `
        <div class="answer-item">
            <div class="answer-content">${escapeHtml(answer.content)}</div>
            <div class="answer-date">${answer.timestamp}</div>
        </div>
    `).join('');
}

// 답변 제출
async function submitAnswer(questionId) {
    const answerInput = document.getElementById(`answer-input-${questionId}`);
    const content = answerInput.value.trim();
    
    if (!content) {
        showError("답변 내용을 입력해주세요.");
        return;
    }
    
    const answerForm = answerInput.parentElement;
    showLoading(answerForm);
    
    try {
        const questionRef = db.collection('questions').doc(questionId);
        
        // 트랜잭션을 사용하여 답변 추가
        await db.runTransaction(async (transaction) => {
            const questionDoc = await transaction.get(questionRef);
            if (!questionDoc.exists) {
                throw new Error("질문을 찾을 수 없습니다.");
            }

            const answers = questionDoc.data().answers || [];
            answers.push({
                content: content,
                timestamp: new Date().toLocaleString()
            });

            transaction.update(questionRef, { answers: answers });
        });
        
        // 입력창 초기화
        answerInput.value = '';
        hideLoading(answerForm);
        
        // 분석 이벤트 기록
        analytics.logEvent('answer_created', {
            questionId: questionId
        });
    } catch (error) {
        hideLoading(answerForm);
        console.error("답변 등록 에러:", error);
        showError("답변 등록 중 오류가 발생했습니다.");
    }
}

// 페이지 로드시 실시간 리스너 설정
window.addEventListener('load', setupRealtimeListener);
