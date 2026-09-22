// PDF.js Worker Setup
if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const ADMIN_IDENTIFIERS = ["7153199002", "8933809355", "admin@gmail.com", "suufiyaan@gmail.com"];

let currentUser = JSON.parse(localStorage.getItem('auth_user')) || null;

// Real Databases
let quizzes = JSON.parse(localStorage.getItem('quizzes_db')) || [];
let lessons = JSON.parse(localStorage.getItem('lessons_db')) || [];
let studentAttempts = JSON.parse(localStorage.getItem('attempts_db')) || [];
let isAdminUser = false;

// Check session on load
window.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        applyUserSession();
    } else {
        document.getElementById('bottom-nav').classList.add('hidden');
        navigateTo('screen-auth');
    }
});

function handleGoogleLogin() {
    let email = prompt("Google Email keessan galchaa:", "barataa@gmail.com");
    if (!email) return;
    let name = email.split('@')[0];
    currentUser = {
        id: email,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        username: email,
        provider: 'Google'
    };
    localStorage.setItem('auth_user', JSON.stringify(currentUser));
    applyUserSession();
}

function handleTelegramLogin() {
    let tgId = prompt("Telegram User ID keessan galchaa:", "7153199002");
    if (!tgId) return;
    currentUser = {
        id: String(tgId),
        name: "Suufiyaan BJICS",
        username: "@suufiyaan_" + tgId.slice(-4),
        provider: 'Telegram'
    };
    localStorage.setItem('auth_user', JSON.stringify(currentUser));
    applyUserSession();
}

function logoutUser() {
    if (confirm("Ba'uu (Logout) barbaadduu?")) {
        localStorage.removeItem('auth_user');
        currentUser = null;
        document.getElementById('bottom-nav').classList.add('hidden');
        location.reload();
    }
}

function applyUserSession() {
    if (!currentUser) return;

    isAdminUser = ADMIN_IDENTIFIERS.includes(String(currentUser.id)) || 
                  ADMIN_IDENTIFIERS.includes(String(currentUser.username));

    document.getElementById('home-user-name').innerText = currentUser.name;
    document.getElementById('profile-full-name').innerText = currentUser.name;
    document.getElementById('home-avatar').innerText = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('profile-avatar').innerText = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('input-name').value = currentUser.name;
    document.getElementById('input-username').value = currentUser.username;

    if (isAdminUser) {
        document.getElementById('admin-badge').classList.remove('hidden');
        document.getElementById('nav-admin').classList.remove('hidden');
        document.getElementById('admin-home-actions').classList.remove('hidden');
        document.getElementById('admin-add-quiz-btn').classList.remove('hidden');
        document.getElementById('admin-add-lesson-btn').classList.remove('hidden');
        document.getElementById('home-role-tag').innerHTML = 'Bulchaa • <span class="text-purple-600 font-bold">Admin</span>';
        document.getElementById('profile-role-status').innerHTML = 'Bulchaa • <span class="text-purple-600 font-bold">Admin</span>';
    } else {
        document.getElementById('admin-badge').classList.add('hidden');
        document.getElementById('nav-admin').classList.add('hidden');
        document.getElementById('admin-home-actions').classList.add('hidden');
        document.getElementById('admin-add-quiz-btn').classList.add('hidden');
        document.getElementById('admin-add-lesson-btn').classList.add('hidden');
        document.getElementById('home-role-tag').innerHTML = 'Barataa • <span class="text-emerald-500 font-bold">Online</span>';
        document.getElementById('profile-role-status').innerHTML = 'Barataa • <span class="text-emerald-500 font-bold">Online</span>';
    }

    // Hide Login screen and SHOW Bottom Nav
    document.getElementById('screen-auth').classList.remove('active');
    document.getElementById('bottom-nav').classList.remove('hidden');

    renderSubjectsList();
    renderLessonsList();
    updateRealProfileStats();
    renderLeaderboard();
    navigateTo('screen-home');
}

function navigateTo(screenId) {
    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    if (screenId === 'screen-quiz-play' || screenId === 'screen-auth') {
        document.getElementById('bottom-nav').classList.add('hidden');
    } else {
        if (currentUser) {
            document.getElementById('bottom-nav').classList.remove('hidden');
        }
    }

    if (screenId === 'screen-categories') renderSubjectsList();
    if (screenId === 'screen-lessons') renderLessonsList();
    if (screenId === 'screen-leaderboard') renderLeaderboard();
    if (screenId === 'screen-admin') renderStudentsTracker();
    if (screenId === 'screen-profile') updateRealProfileStats();
    window.scrollTo(0, 0);
}

// Render Quizzes
function renderSubjectsList(filterText = "") {
    let container = document.getElementById('quizzes-container');
    container.innerHTML = "";

    let list = quizzes.filter(q => q.title.toLowerCase().includes(filterText.toLowerCase()));

    if (list.length === 0) {
        container.innerHTML = `
            <div class="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3 shadow-sm">
                <div class="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-xl">
                    <i class="fa-solid fa-file-circle-question"></i>
                </div>
                <h3 class="font-bold text-xs text-slate-800">Qormaanni hin argamne</h3>
                <p class="text-[11px] text-slate-500">Bulchaan qormaata yeroo maxxansu asitti argattu.</p>
            </div>
        `;
        return;
    }

    const now = new Date().getTime();

    list.forEach((quiz, idx) => {
        let startTime = quiz.start_time ? new Date(quiz.start_time).getTime() : 0;
        let endTime = quiz.end
_time ? new Date(quiz.end_time).getTime() : Infinity;

        let isUpcoming = startTime > now;
        let isExpired = now > endTime;

        let statusBadge = isUpcoming ? `<span class="bg-amber-100 text-amber-700 text-[9px] font-extrabold px-2 py-0.5 rounded-md">⏳ Hin Jalqabne</span>` :
                          isExpired ? `<span class="bg-slate-200 text-slate-600 text-[9px] font-extrabold px-2 py-0.5 rounded-md">⛔ Xumurameera</span>` :
                          `<span class="bg-emerald-100 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded-md">🟢 Banaa dha</span>`;

        let deleteBtn = isAdminUser ? 
            `<button onclick="deleteQuiz(${idx}); event.stopPropagation();" class="bg-red-100 text-red-600 px-3 py-1 rounded-xl font-bold text-[10px] hover:bg-red-200"><i class="fa-solid fa-trash"></i></button>` : 
            `<i class="fa-solid fa-chevron-right text-xs text-slate-400"></i>`;

        let item = document.createElement('div');
        item.className = "bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer hover:border-emerald-500 transition active:scale-98";
        item.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                    <i class="fa-solid ${quiz.icon || 'fa-book text-blue-600'}"></i>
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <h3 class="font-bold text-xs text-slate-900">${quiz.title}</h3>
                        ${statusBadge}
                    </div>
                    <p class="text-[10px] text-slate-500">${quiz.questions.length} gaaffilee • ${quiz.time_limit_minutes || 15} daqiiqaa</p>
                </div>
            </div>
            ${deleteBtn}
        `;
        item.onclick = function() {
            if (isUpcoming) {
                alert(`⏳ Qormaanni kun hin jalqabne! Sa'aatii: ${new Date(quiz.start_time).toLocaleString()} irratti banama.`);
                return;
            }
            if (isExpired) {
                alert("⛔ Yeroon qormaata kanaa xumurameera!");
                return;
            }
            startQuiz(idx);
        };
        container.appendChild(item);
    });
}

function filterQuizzesList() {
    let q = document.getElementById('quiz-search-input').value;
    renderSubjectsList(q);
}

// Render Lessons
function renderLessonsList(filterText = "") {
    let container = document.getElementById('lessons-list-container');
    container.innerHTML = "";

    let list = lessons.filter(l => l.title.toLowerCase().includes(filterText.toLowerCase()));

    if (list.length === 0) {
        container.innerHTML = `
            <div class="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3 shadow-sm">
                <div class="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-xl">
                    <i class="fa-solid fa-book-open"></i>
                </div>
                <h3 class="font-bold text-xs text-slate-800">Barnoonni hin argamne</h3>
            </div>
        `;
        return;
    }

    list.forEach((l, idx) => {
        let deleteBtn = isAdminUser ? `<button onclick="deleteLesson(${idx}); event.stopPropagation();" class="text-red-500 text-[11px] font-bold"><i class="fa-solid fa-trash"></i> Haqi</button>` : "";
        let item = document.createElement('div');
        item.className = "bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-2";
        item.innerHTML = `
            <div class="flex items-center justify-between">
                <h3 class="font-bold text-xs text-blue-700">${l.title}</h3>
                ${deleteBtn}
            </div>
            <p class="text-xs text-slate-700 leading-relaxed whitespace-pre-line">${l.content}</p>
            ${l.media_url ? `
                <a href="${l.media_url}" target="_blank" class="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Faayila Saaqi
                </a>
            ` : ''}
        `;
        container.appendChild(item);
    });
}

function filterLessonsList() {
    let q = document.getElementById('lesson-search-input').value;
    renderLessonsList(q);
}

// Render Leaderboard
function renderLeaderboard() {
    let container = document.getElementById('leaderboard-container');
    container.innerHTML = "";

    if (studentAttempts.length === 0) {
        container.innerHTML = `<div class="bg-white p-6 rounded-2xl text-center text-xs text-slate-500">Hanga ammaatti barataan qorame hin jiru.</div>`;
        return;
    }

    let sorted = [...studentAttempts].sort((a, b) => b.score_percentage - a.score_percentage);

    sorted.forEach((item, index) => {
        let medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`;
        let div = document.createElement('div');
        div.className = "bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between shadow-sm text-xs";
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="font-black text-sm w-6 text-center">${medal}</span>
                <div>
                    <h4 class="font-bold text-slate-900">${item.student_name}</h4>
                    <span class="text-[10px] text-slate-400">${item.quiz_title}</span>
                </div>
            </div>
            <div class="text-right">
                <span class="font-black text-emerald-600 text-sm">${item.score_percentage}%</span>
                <span class="text-[10px] block text-slate-400">${item.score_display}</span>
            </div>
        `;
        container.appendChild(div);
    });
}

// Quiz Play
let activeQuizIdx = 0;
let activeQIdx = 0;
let quizTimerTotalSeconds = 0;
let quizTimerInterval = null;
let activeQuizAnswers = {};

function startQuiz(idx) {
    activeQuizIdx = idx;
    activeQIdx = 0;
    activeQuizAnswers = {};

    let targetQuiz = quizzes[activeQuizIdx];
    let minutes = targetQuiz.time_limit_minutes || 15;
    quizTimerTotalSeconds = minutes * 60;

    navigateTo('screen-quiz-play');
    loadQuizQuestion();
    startTimerCountdown();
}

function confirmExitQuiz() {
    if (confirm("Qormaata keessaa ba'uu barbaadduu?")) {
        clearInterval(quizTimerInterval);
        finishQuizAndSubmit();
    }
}

function startTimerCountdown() {
    clearInterval(quizTimerInterval);
    updateTimerDisplay();

    quizTimerInterval = setInterval(() => {
        quizTimerTotalSeconds--;
        updateTimerDisplay();

        if (quizTimerTotalSeconds <= 0) {
            clearInterval(quizTimerInterval);
            alert("⏰ Yeroon qormaataa xumurameera!");
            finishQuizAndSubmit();
        }
    }, 1000);
}

function updateTimerDisplay() {
    let m = Math.floor(quizTimerTotalSeconds / 60);
    let s = quizTimerTotalSeconds % 60;
    document.getElementById('quiz-timer').innerText = 
        `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function loadQuizQuestion() {
    let qList = quizzes[activeQuizIdx].questions;
    let q = qList[activeQIdx];

    document.getElementById('quiz-title-header').innerText = "Qormaata " + quizzes[activeQuizIdx].title;
    document.getElementById('quiz-counter').innerText = `Gaaffii ${activeQIdx + 1} / ${qList.length}`;
    document.getElementById('quiz-question-text').innerText = q.q;

    let percent = ((activeQIdx + 1) / qList.length) * 100;
    document.getElementById('quiz-progress-bar').style.width = percent + "%";

    let optBox = document.getElementById('quiz-options-container');
    optBox.innerHTML = "";

    q.options.forEach((opt, oIdx) => {
        let isSel = activeQuizAnswers[activeQIdx] === oIdx;
        let btn = document.createElement('button');
        btn.className = "w-full p-4 border rounded-2xl text-xs font-semibold flex items-center justify-between transition " + (isSel ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm' : 'border-slate-200 bg-white text-slate-700');
        btn.innerHTML = '<span>' + opt + '</span><div class="w-4 h-4 rounded-full border ' + (isSel ? 'border-4 border-blue-600 bg-white' : 'border-slate-300') + '"></div>';
        btn.onclick = function() { selectQuizOption(oIdx); };
        optBox.appendChild(btn);
    });

    let nextBtn = document.getElementById('btn-next-quiz');
    nextBtn.innerText = (activeQIdx === qList.length - 1) ? "Xumuri & Galchi" : "Itti Aanu →";
}

function selectQuizOption(oIdx) {
    activeQuizAnswers[activeQIdx] = oIdx;
    loadQuizQuestion();
}

function nextQuestion() {
    let qList = quizzes[activeQuizIdx].questions;
    if (activeQIdx < qList.length - 1) {
        activeQIdx++;
        loadQuizQuestion();
    } else {
        clearInterval(quizTimerInterval);
        finishQuizAndSubmit();
    }
}

function prevQuestion() {
    if (activeQIdx > 0) {
        activeQIdx--;
        loadQuizQuestion();
    }
}

function finishQuizAndSubmit() {
    clearInterval(quizTimerInterval);
    let qList = quizzes[activeQuizIdx].questions;
    let correct = 0;
    let resultsList = [];

    qList.forEach((q, idx) => {
        let ans = activeQuizAnswers[idx];
        let isCorr = ans === q.corr;
        if (isCorr) correct++;
        resultsList.push({ 
            text: `${idx + 1}. ${isCorr ? 'Sirrii' : 'Dogoggora'} (Deebii kee: ${ans !== undefined ? String.fromCharCode(65 + ans) : 'Hin deebifamne'})`, 
            correct: isCorr 
        });
    });

    let percent = Math.round((correct / qList.length) * 100);

    document.getElementById('result-score-text').innerText = `${correct} / ${qList.length}`;
    document.getElementById('result-percent-text').innerText = `${percent}%`;

    let rank = percent >= 80 ? "Ol'aanaa 👑" : percent >= 50 ? "Gaarii 👍" : "Laafaa ⚠️";
    document.getElementById('result-rank-tag').innerText = `Sadarkaa: ${rank}`;

    document.getElementById('detail-quiz-title').innerText = `${quizzes[activeQuizIdx].title} • ${qList.length} gaaffilee`;
    document.getElementById('detail-score-text').innerText = `${correct} / ${qList.length}`;
    document.getElementById('detail-percent-circle').innerText = `${percent}%`;
    document.getElementById('detail-rank-text').innerText = rank;

    let detailedContainer = document.getElementById('detail-answers-list');
    detailedContainer.innerHTML = "";
    resultsList.forEach(r => {
        let d = document.createElement('div');
        d.className = "p-3.5 flex items-center justify-between " + (r.correct ? '' : 'text-red-600 font-semibold bg-red-50/50');
        d.innerHTML = '<span>' + r.text + '</span><i class="fa-solid ' + (r.correct ? 'fa-circle-check text-emerald-500' : 'fa-circle-xmark text-red-500') + ' text-base"></i>';
        detailedContainer.appendChild(d);
    });

    const realAttempt = {
        student_id: currentUser ? currentUser.id : "guest",
        student_name: currentUser ? currentUser.name : "Barataa",
        username: currentUser ? currentUser.username : "N/A",
        quiz_title: quizzes[activeQuizIdx].title,
        score_display: `${correct}/${qList.length}`,
        score_percentage: percent,
        date: new Date().toLocaleString()
    };

    studentAttempts.unshift(realAttempt);
    localStorage.setItem('attempts_db', JSON.stringify(studentAttempts));

    updateRealProfileStats();
    navigateTo('screen-quiz-result');
}

function updateRealProfileStats() {
    if (!currentUser) return;
    let myAttempts = studentAttempts.filter(a => String(a.student_id) === String(currentUser.id));
    
    if (myAttempts.length === 0) {
        document.getElementById('profile-stat-count').innerText = "0";
        document.getElementById('profile-stat-score').innerText = "0%";
        document.getElementById('profile-stat-rank').innerText = "-";
        return;
    }

    let totalQuizzesTaken = myAttempts.length;
    let sumPercentage = myAttempts.reduce((acc, curr) => acc + curr.score_percentage, 0);
    let avgPercentage = Math.round(sumPercentage / totalQuizzesTaken);

    let rankLabel = avgPercentage >= 80 ? "👑 Ol'aanaa" : avgPercentage >= 50 ? "👍 Gaarii" : "⚠️ Laafaa";

    document.getElementById('profile-stat-count').innerText = String(totalQuizzesTaken);
    document.getElementById('profile-stat-score').innerText = `${avgPercentage}%`;
    document.getElementById('profile-stat-rank').innerText = rankLabel;
}

// Delete Controls
function deleteQuiz(idx) {
    if (confirm("Qormaata kana haquu barbaadduu?")) {
        quizzes.splice(idx, 1);
        localStorage.setItem('quizzes_db', JSON.stringify(quizzes));
        renderSubjectsList();
    }
}

function deleteLesson(idx) {
    if (confirm("Barnoota kana haquu barbaadduu?")) {
        lessons.splice(idx, 1);
        localStorage.setItem('lessons_db', JSON.stringify(lessons));
        renderLessonsList();
    }
}

function deleteStudentAttempt(idx) {
    if (confirm("Ragaa qormaata barataa kanaa haquu barbaadduu?")) {
        studentAttempts.splice(idx, 1);
        localStorage.setItem('attempts_db', JSON.stringify(studentAttempts));
        renderStudentsTracker();
        renderLeaderboard();
        updateRealProfileStats();
    }
}

function clearAllRealAttempts() {
    if (confirm("Ragaa barattoota qoramanii HUNDA haquu barbaadduu?")) {
        studentAttempts = [];
        localStorage.removeItem('attempts_db');
        renderStudentsTracker();
        renderLeaderboard();
        updateRealProfileStats();
    }
}

function renderStudentsTracker() {
    let container = document.getElementById('admin-students-list');
    container.innerHTML = "";

    if (studentAttempts.length === 0) {
        container.innerHTML = `
            <div class="bg-white border border-slate-200 p-6 rounded-2xl text-center text-xs text-slate-500">
                <i class="fa-solid fa-users-slash text-2xl text-slate-300 block mb-2"></i>
                Hanga ammaatti barataan tokkollee qormaata hin fudhanne.
            </div>
        `;
        return;
    }

    studentAttempts.forEach((att, idx) => {
        let item = document.createElement('div');
        item.className = "bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs shadow-sm";
        item.innerHTML = `
            <div>
                <p class="font-extrabold text-slate-900">${att.student_name} <span class="font-normal text-slate-400 text-[10px]">(${att.username})</span></p>
                <p class="text-[10px] text-slate-500">${att.quiz_title} • <span class="text-slate-400 font-mono">${att.date}</span></p>
            </div>
            <div class="flex items-center gap-3">
                <div class="text-right">
                    <span class="font-bold text-blue-600 text-sm">${att.score_display}</span>
                    <span class="text-[10px] block font-extrabold ${att.score_percentage >= 75 ? 'text-emerald-600' : 'text-amber-600'}">${att.score_percentage}%</span>
                </div>
                <button onclick="deleteStudentAttempt(${idx})" class="text-red-500 hover:text-red-700 p-1"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        container.appendChild(item);
    });
}

function exportResultsToCSV() {
    if (studentAttempts.length === 0) {
        alert("Ragaan export ta'u hin jiru!");
        return;
    }
    let csv = "Maqaa,Username,Qormaata,Qabxii,Dhibbeentaa,Guyyaa\n";
    studentAttempts.forEach(r => {
        csv += `"${r.student_name}","${r.username}","${r.quiz_title}","${r.score_display}","${r.score_percentage}%","${r.date}"\n`;
    });
    let blob = new Blob([csv], { type: 'text/csv' });
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = `Oromiyaa_AI_Results_${Date.now()}.csv`;
    a.click();
}

function switchAdminTab(tab) {
    document.getElementById('admin-quiz-section').classList.add('hidden');
    document.getElementById('admin-lesson-section').classList.add('hidden');
    document.getElementById('admin-students-section').classList.add('hidden');

    document.getElementById('btn-admin-quiz').className = "text-xs font-bold text-slate-400 pb-1 flex-1";
    document.getElementById('btn-admin-lesson').className = "text-xs font-bold text-slate-400 pb-1 flex-1";
    document.getElementById('btn-admin-students').className = "text-xs font-bold text-slate-400 pb-1 flex-1";

    if (tab === 'quiz') {
        document.getElementById('admin-quiz-section').classList.remove('hidden');
        document.getElementById('btn-admin-quiz').className = "text-xs font-bold text-purple-600 border-b-2 border-purple-600 pb-1 flex-1";
    } else if (tab === 'lesson') {
        document.getElementById('admin-lesson-section').classList.remove('hidden');
        document.getElementById('btn-admin-lesson').className = "text-xs font-bold text-purple-600 border-b-2 border-purple-600 pb-1 flex-1";
    } else if (tab === 'students') {
        document.getElementById('admin-students-section').classList.remove('hidden');
        document.getElementById('btn-admin-students').className = "text-xs font-bold text-purple-600 border-b-2 border-purple-600 pb-1 flex-1";
    }
}

function setQuizCreationMethod(method) {
    if (method === 'ai') {
        document.getElementById('box-create-ai').classList.remove('hidden');
        document.getElementById('box-create-manual').classList.add('hidden');
        document.getElementById('btn-method-ai').className = "flex-1 py-2 rounded-xl bg-purple-700 text-white shadow-sm transition";
        document.getElementById('btn-method-manual').className = "flex-1 py-2 rounded-xl text-purple-900 transition";
    } else {
        document.getElementById('box-create-ai').classList.add('hidden');
        document.getElementById('box-create-manual').classList.remove('hidden');
        document.getElementById('btn-method-manual').className = "flex-1 py-2 rounded-xl bg-purple-700 text-white shadow-sm transition";
        document.getElementById('btn-method-ai').className = "flex-1 py-2 rounded-xl text-purple-900 transition";
    }
}

async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(" ") + " ";
    }
    return fullText.trim();
}

async function extractTextFromImage(file) {
    const result = await Tesseract.recognize(file, 'eng');
    return result.data.text.trim();
}

async function generateAIQuizSmart() {
    let topic = document.getElementById('ai-topic-title').value.trim();
    let desiredCount = parseInt(document.getElementById('ai-q-count').value) || 10;
    let timerMinutes = parseInt(document.getElementById('ai-timer-minutes').value) || 15;
    let startTime = document.getElementById('ai-start-time').value;
    let endTime = document.getElementById('ai-end-time').value;
    let rawText = document.getElementById('ai-raw-text').value.trim();

    let pdfInput = document.getElementById('ai-pdf-file');
    let imgInput = document.getElementById('ai-image-file');

    if (!topic) {
        alert("Maaloo mata-duree qormaataa galchaa!");
        return;
    }

    let btn = document.getElementById('btn-run-ai');
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> AI'n Qormaata Qopheessaa Jira...`;
    btn.disabled = true;

    if (pdfInput.files && pdfInput.files[0]) {
        try {
            let text = await extractTextFromPDF(pdfInput.files[0]);
            if (text.length > 30) rawText += " " + text;
        } catch(e) { console.error(e); }
    }

    if (imgInput.files && imgInput.files[0]) {
        try {
            let text = await extractTextFromImage(imgInput.files[0]);
            if (text.length > 20) rawText += " " + text;
        } catch(e) { console.error(e); }
    }

    let sentences = [];
    if (rawText.length > 20) {
        sentences = rawText.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 15);
    }

    let generatedQuestions = [];
    for (let i = 0; i < desiredCount; i++) {
        let qText = "";
        let optionA = "";
        let optionB = "";
        let optionC = "";
        let optionD = "";

        if (sentences.length > i) {
            let keyPart = sentences[i].substring(0, 75);
            qText = `Qabiyyee dhiyaate keessatti: '${keyPart}...' kan jedhu maal agarsiisa?`;
            optionA = `A. ${sentences[i].substring(0, 45)}`;
            optionB = `B. Yaada faallaa kanaa calaqqisa`;
            optionC = `C. Dogoggora yaadaa uuma`;
            optionD = `D. Qabiyyee kana wajjin wal hin simatu`;
        } else {
            let templates = [
                `Mata-duree '${topic}' ilaalchisee sadarkaa ${i + 1}ffaa irratti wanti beekamuu qabu kam?`,
                `Faayidaan bu'uuraa '${topic}' barattootaaf qabu maali?`,
                `'${topic}' keessatti qabxiin xiyyeeffannoo guddaa barbaadu kam?`,
                `Adeemsa '${topic}' hojiirra oolchuuf wanti dursa barbaachisu maali?`,
                `Bu'aan qorannoo '${topic}' maaliin mirkanaa'a?`
            ];
            qText = templates[i % templates.length];
            optionA = `A. Beekumsa fi ogummaa ${topic} gabbifachuu`;
            optionB = `B. Yaada faallaa qofa hordofuu`;
            optionC = `C. Qajeelfama malee adeemuu`;
            optionD = `D. Faayidaa dhabuu`;
        }

        generatedQuestions.push({
            q: qText,
            options: [optionA, optionB, optionC, optionD],
            corr: 0
        });
    }

    const newQuiz = {
        title: topic,
        time_limit_minutes: timerMinutes,
        start_time: startTime || null,
        end_time: endTime || null,
        icon: "fa-robot text-purple-600",
        questions: generatedQuestions
    };

    quizzes.unshift(newQuiz);
    localStorage.setItem('quizzes_db', JSON.stringify(quizzes));

    if (rawText) {
        lessons.unshift({
            title: `Barnoota: ${topic}`,
            content: rawText.substring(0, 1500) + (rawText.length > 1500 ? "..." : ""),
            media_type: "text",
            media_url: ""
        });
        localStorage.setItem('lessons_db', JSON.stringify(lessons));
    }

    btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> AI'n Qormaata Uumi & Maxxansi`;
    btn.disabled = false;

    alert(`🎉 AI'n qormaata '${topic}' gaaffilee ${desiredCount} fi yeroo ${timerMinutes} daqiiqaa qabu uumeera!`);
    navigateTo('screen-categories');
}

function saveManualQuiz() {
    let title = document.getElementById('manual-quiz-title').value.trim();
    let timerMinutes = parseInt(document.getElementById('manual-timer-minutes').value) || 15;
    let startTime = document.getElementById('manual-start-time').value;
    let endTime = document.getElementById('manual-end-time').value;
    let qText = document.getElementById('manual-q-text').value.trim();
    let opts = document.getElementById('manual-opts').value.split(',').map(o => o.trim());
    let corr = parseInt(document.getElementById('manual-corr').value) || 0;

    if(!title || !qText || opts.length < 2) {
        alert("Maaloo mata-duree, gaaffii fi filannoowwan hunda guutaa!");
        return;
    }

    let existing = quizzes.find(q => q.title.toLowerCase() === title.toLowerCase());
    if (existing) {
        existing.questions.push({ q: qText, options: opts, corr: corr });
        existing.time_limit_minutes = timerMinutes;
        existing.start_time = startTime || null;
        existing.end_time = endTime || null;
    } else {
        quizzes.unshift({
            title: title,
            time_limit_minutes: timerMinutes,
            start_time: startTime || null,
            end_time: endTime || null,
            icon: "fa-file-lines text-blue-600",
            questions: [{ q: qText, options: opts, corr: corr }]
        });
    }

    localStorage.setItem('quizzes_db', JSON.stringify(quizzes));
    alert("✅ Qormaanni haaraan galmaa'eera!");
    navigateTo('screen-categories');
}

function saveLesson() {
    let title = document.getElementById('lesson-title').value.trim();
    let content = document.getElementById('lesson-content').value.trim();
    let mType = document.getElementById('lesson-media-type').value;
    let mUrl = document.getElementById('lesson-media-url').value.trim();

    if(!title || !content) {
        alert("Maaloo mata-duree fi qabiyyee galchaa!");
        return;
    }

    lessons.unshift({ title: title, content: content, media_type: mType, media_url: mUrl });
    localStorage.setItem('lessons_db', JSON.stringify(lessons));
    alert("✅ Barnoonni haaraan maxxanfameera!");
    navigateTo('screen-lessons');
}

function saveProfile() {
    let name = document.getElementById('input-name').value;
    let user = document.getElementById('input-username').value;
    if (currentUser) {
        currentUser.name = name;
        currentUser.username = user;
        localStorage.setItem('auth_user', JSON.stringify(currentUser));
    }
    document.getElementById('home-user-name').innerText = name;
    document.getElementById('profile-full-name').innerText = name;
    alert("✅ Profile kee hifadhameera!");
    navigateTo('screen-profile');
}
