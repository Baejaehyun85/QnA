// 질문과 답변을 저장할 배열
let questions = [];

// DOM 요소
const questionForm = document.getElementById('questionForm');
const questionsList = document.getElementById('questionsList');

// 폼 제출 이벤트 처리
questionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 폼 데이터 가져오기
    const subject = document.getElementById('subject').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    
    // 새 질문 객체 생성
    const question = {
        id: Date.now(),
        subject: subject,
        title: title,
        content: content,
        answers: [],
        timestamp: new Date().toLocaleString()
    };
    
    // 질문 배열에 추가
    questions.unshift(question);
    
    // 화면 업데이트
    renderQuestions();
    
    // 폼 초기화
    questionForm.reset();
});

// 질문 목록 렌더링
function renderQuestions() {
    questionsList.innerHTML = '';
    
    questions.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.className = 'question-item';
        questionElement.innerHTML = `
            <div class="question-header">
                <span class="question-subject">${question.subject}</span>
                <span class="question-date">${question.timestamp}</span>
            </div>
            <div class="question-title">${question.title}</div>
            <div class="question-content">${question.content}</div>
            <div class="answers" id="answers-${question.id}">
                ${renderAnswers(question.answers)}
            </div>
            <div class="answer-form">
                <textarea id="answer-input-${question.id}" placeholder="답변을 작성해주세요"></textarea>
                <button onclick="submitAnswer(${question.id})">답변 등록</button>
            </div>
        `;
        questionsList.appendChild(questionElement);
    });
}

// 답변 렌더링
function renderAnswers(answers) {
    return answers.map(answer => `
        <div class="answer-item">
            <div class="answer-content">${answer.content}</div>
            <div class="answer-date">${answer.timestamp}</div>
        </div>
    `).join('');
}

// 답변 제출
function submitAnswer(questionId) {
    const answerInput = document.getElementById(`answer-input-${questionId}`);
    const content = answerInput.value.trim();
    
    if (content) {
        // 해당 질문 찾기
        const question = questions.find(q => q.id === questionId);
        if (question) {
            // 답변 추가
            question.answers.push({
                content: content,
                timestamp: new Date().toLocaleString()
            });
            
            // 화면 업데이트
            renderQuestions();
            
            // 입력창 초기화
            answerInput.value = '';
        }
    }
}

// 로컬 스토리지에서 데이터 불러오기
function loadFromLocalStorage() {
    const savedQuestions = localStorage.getItem('questions');
    if (savedQuestions) {
        questions = JSON.parse(savedQuestions);
        renderQuestions();
    }
}

// 로컬 스토리지에 데이터 저장
function saveToLocalStorage() {
    localStorage.setItem('questions', JSON.stringify(questions));
}

// 데이터 변경시 자동 저장
function autoSave() {
    saveToLocalStorage();
}

// 페이지 로드시 데이터 불러오기
window.addEventListener('load', loadFromLocalStorage);

// 데이터 변경 감지 및 저장
const observer = new MutationObserver(autoSave);
observer.observe(questionsList, { subtree: true, childList: true });
