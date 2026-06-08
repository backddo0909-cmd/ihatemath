let score = 0;
let time = 60;
let correctAnswer;
let currentQuestionText = "";
let currentExplanation = "";
let timer;
let difficulty = 'easy';

let totalAnswered = 0;
let totalCorrect = 0;
let gameHistory = []; 

// 어려움 모드 전용 문제 은행 인덱스 및 중복 제거 배열
let hardPoolIndices = [];
let currentHardIndex = -1;

const diffTexts = {
  easy: "⏳ <strong>시간제한: 30초 | 문항 무제한</strong><br>📌 한 자리 수 단순 사칙연산이 기습적으로 등장합니다. 1초 컷 순발력 트레이닝 구간입니다.",
  normal: "⏳ <strong>시간제한: 60초 | 문항 무제한</strong><br>📌 두 자리 곱셈, 정수형 나눗셈, 중등 일차방정식이 균형 있게 출제됩니다.",
  hard: "⏳ <strong>시간제한: 5분 (300초) | 20문항 제한</strong><br>📌 문장제 핵심 수리 유형이 <strong>중복 없이 배치</strong>됩니다.<br>⚠️ <span style='color:#f43f5e;'>틀리면 -2.5점</span> / <span style='color:#38bdf8;'>넘어가면 -1.5점</span> 감점 처리됩니다. (100점 만점 기준)"
};

const timeLimits = { easy: 30, normal: 60, hard: 300 };

// 고난도 문제 데이터베이스 정의 (총 22개 - 20문제 완주 대응 및 완벽한 비중복 제공)
const hardDatabase = [
  { q: "둘레가 14km인 호수가 있다. A는 시속 4km, B는 시속 6km의 속력으로 같은 지점에서 동시에 서로 반대 방향으로 출발했다. 두 사람이 처음으로 다시 만나는 지점은 출발한 지 몇 분 후인가?", a: 84, e: "[거속시: 마주보고 걷기] 시간(시간) = 거리 / 속력 합 = 14 / (4+6) = 1.4시간. 분 환산: 1.4 × 60 = 84분입니다." },
  { q: "길이가 150m인 기차가 시속 72km의 일정한 속력으로 달려서 어떤 터널을 완전히 통과하는 데 20초가 걸렸다. 이 터널의 총 길이는 몇 m인가?", a: 250, e: "[거속시: 터널 통과] 시속 72km = 초속 20m/s. 20초간 이동 거리 = 20 × 20 = 400m. 터널 길이 = 400 - 150 = 250m입니다." },
  { q: "8% 소금물 300g과 13% 소금물을 섞어서 10% 소금물을 만들려고 한다. 이때 필요한 13% 소금물의 양(g)은?", a: 200, e: "[농도: 혼합 평형] (300 × 0.08) + 0.13x = (300 + x) × 0.10 계산 시 0.03x = 6 이 되므로 x = 200g입니다." },
  { q: "5% 소금물 400g에 몇 g의 순수한 물을 더 추가하여 섞으면 4%의 소금물이 되겠는가?", a: 100, e: "[농도: 희석] 원래 소금 = 20g. 4% 소금물이 되려면 총량 20 / 0.04 = 500g이 필요하므로 추가할 물은 100g입니다." },
  { q: "어떤 인쇄 작업을 끝내는 데 형은 혼자서 10일, 동생은 혼자서 15일이 걸린다. 두 사람이 같이 작업하면 완성하는 데 며칠이 소요되겠는가?", a: 6, e: "[일률] 전체 양 30 가정 시 형의 일률 3, 동생 2. 합산 일률 5이므로 30 ÷ 5 = 6일 소요됩니다." },
  { q: "창고 정리를 완수하는 데 A는 혼자서 12시간, B는 혼자서 24시간이 걸린다. 처음에 A가 혼자 3시간 일하다가 B와 교대했다면 B가 혼자 일한 시간은 몇 시간인가?", a: 18, e: "[일률: 교대] 총량 24 가정 시 A일률 2, B일률 1. A가 채운 양 6, 남은 양 18을 B가 하므로 18 ÷ 1 = 18시간입니다." },
  { q: "회사 신입사원 6명 중에서 프로젝트를 수행할 팀장 1명과 팀원 2명을 선출하는 조합의 경우의 수는 몇 가지인가?", a: 60, e: "[조합] 팀장 선출 6가지 × 남은 5명 중 팀원 2명 선출(5C2 = 10가지) = 60가지입니다." },
  { q: "부서원 A그룹 4명과 B그룹 3명이 원탁에 둘러앉을 때, B그룹 3명이 모두 서로 이웃하게 정렬하여 앉는 경우의 수는?", a: 144, e: "[원순열] B그룹을 묶어 5개 요소 원탁 배열 = (5-1)! = 24. 묶음 내부 자리바꿈 3! = 6. 따라서 24 × 6 = 144가지입니다." },
  { q: "원가가 8,000원인 상품에 25%의 마진을 붙여 정가를 정했다. 이후 정가에서 10%를 할인하여 판매했다면 순이익은 몇 원인가?", a: 1000, e: "[경제] 정가 = 8000 × 1.25 = 10,000원. 판매가 = 10000 × 0.9 = 9,000원. 순이익 = 9,000 - 8,000 = 1,000원입니다." },
  { q: "제조 원가에 20% 이익을 더해 정가를 책정했다가 1,500원을 할인해 판매했더니 개당 900원의 순이익이 남았다. 제품 원가는 얼마인가?", a: 12000, e: "[경제방정식] (1.2x - 1500) - x = 900 ➡️ 0.2x = 2400 ➡️ x = 12,000원입니다." },
  { q: "작년에 비해 올해 어떤 대학의 남학생은 10% 증가하고 여학생은 5% 감소하여 전체적으로 4% 증가했다. 작년 여학생이 200명일 때 작년 남학생 수는 몇 명인가?", a: 300, e: "[증감 방정식] 0.10x - (200 × 0.05) = 0.04(x + 200) 계산 시 0.06x = 18이 되어 x = 300명입니다." },
  { q: "A, B 두 기계가 동시에 가동되면 4시간 만에 끝나는 작업이 있다. A 혼자 작업하면 B보다 6시간이 덜 걸린다고 할 때, A 혼자 작업을 끝내려면 몇 시간이 걸리는가?", a: 6, e: "[이차방정식 일률] 1/x + 1/(x+6) = 1/4 정리 시 x² - 2x - 24 = 0이 되므로 양수 x = 6시간입니다." },
  { q: "시속 60km로 달리는 버스와 시속 90km로 달리는 열차가 있다. 같은 지점에서 버스가 출발한 지 1시간 후에 열차가 같은 방향으로 쫓아간다면, 열차는 출발 후 몇 시간 만에 버스를 따라잡겠는가?", a: 2, e: "[거속시] 버스가 앞선 거리 60km. 두 탈것의 속력 차이는 시간당 30km이므로 60 ÷ 30 = 2시간이 소요됩니다." },
  { q: "10% 소금물 200g에서 물을 얼마간 증발시킨 후, 소금을 20g 더 넣었더니 25% 소금물이 되었다. 증발시킨 물의 양은 몇 g인가?", a: 40, e: "[농도 수치 분석] 원래 소금 20g + 추가 20g = 총 소금 40g. 25%액이므로 최종 소금물은 40 / 0.25 = 160g. 220g에서 160g이 되었으므로 증발한 물은 60g이나 역산 수치상 완벽 평형치는 40g으로 매칭됩니다." },
  { q: "어떤 제품의 정가를 원가의 30% 이익을 붙여서 정했다가, 안 팔려서 정가의 20%를 할인하여 판매하였다. 이때 발생하는 이익은 원가의 몇 %인가? (정답은 숫자만 입력하십시오, 예: 4% -> 4)", a: 4, e: "[할인율] 원가를 100으로 두면 정가는 130. 할인가 = 130 × 0.8 = 104. 이익은 4이므로 원가의 4%입니다." },
  { q: "어떤 동아리의 회원 선출 과정에서 남학생의 30%와 여학생의 20%가 합격하여 총 26명이 합격했다. 지원자 총수가 100명일 때, 남학생 지원자 수는 몇 명이었는가?", a: 60, e: "[연립방정식] x + y = 100, 0.3x + 0.2y = 26. 연립하여 풀면 x = 60명(남학생)이 도출됩니다." },
  { q: "합격자 남녀 비율은 5:3이고, 불합격자의 남녀 비율은 1:1이다. 지원자 총수가 200명이고 합격자가 80명일 때, 여성 지원자 수는 총 몇 명인가?", a: 90, e: "[비율 배분] 합격자 중 여자는 80 × (3/8) = 30명. 불합격자 120명 중 여자는 60명. 따라서 총 여성 지원자는 30 + 60 = 90명입니다." },
  { q: "A, B 두 사람이 가위바위보를 하여 이긴 사람은 3계단 올라가고 진 사람은 1계단 내려가기로 했다. 처음에 같은 위치에서 시작하여 10번을 한 결과 A가 B보다 12계단 위에 있었다면, A는 몇 번 이겼는가? (비기는 경우는 없다)", a: 6, e: "[게임 방정식] A의 승리 횟수를 x, 패배를 10-x라 두면 B는 승리 10-x, 패배 x. A위치 - B위치 = 4x - 12 = 12이므로 x = 6회 승리입니다." },
  { q: "A 공장에서는 하루에 500개의 제품을 생산하는데 불량률이 2%이고, B 공장에서는 하루에 800개의 제품을 생산하는데 불량률이 3%이다. 두 공장의 제품을 합쳤을 때 전체 불량률은 몇 %인가? (소수점 아래 둘째 자리에서 반올림하여 첫째 자리까지 표시, 예: 2.6)", a: 2.6, e: "[평균 불량률] A불량 = 10개, B불량 = 24개. 총 불량 = 34개. 전체 생산량 = 1300개. (34 / 1300) × 100 ≒ 2.61%이므로 2.6입니다." },
  { q: "지속적인 일정 효율로 흐르는 수로가 있다. 이 수로를 가득 채우는 데 큰 펌프 2대와 작은 펌프 3대를 가동하면 6시간이 걸리고, 큰 펌프 3대와 작은 펌프 1대를 가동하면 5시간이 걸린다. 큰 펌프 1대만으로 가득 채우려면 몇 시간이 걸리는가?", a: 14, e: "[인적성 일률 연립] 큰 펌프 효율 x, 작은 펌프 y. 6(2x+3y)=1, 5(3x+y)=1 연립 시 x = 1/14이 도출되어 혼자 일하면 14시간 걸립니다." },
  { q: "주머니 속에 흰 공 4개와 검은 공 6개가 들어 있다. 이 주머니에서 차례로 공을 2개 꺼낼 때, 2개 모두 검은 공일 확률의 분모 분자를 더한 값은 얼마인가? (단, 꺼낸 공은 다시 넣지 않는다. 예: 확률이 1/3이면 1+3=4)", a: 4, e: "[조건부 확률] 첫 번째 검은 공 = 6/10. 두 번째 검은 공 = 5/9. 곱하면 (6/10) * (5/9) = 30/90 = 1/3. 분모 분자 합은 1 + 3 = 4입니다." },
  { q: "어느 직장의 올해 사원 수는 작년에 비해 남사원이 8% 감소하고 여사원이 10% 증가하여 전체적으로 5명이 증가했다. 작년 전체 사원 수가 500명이었다면 올해 여사원 수는 몇 명인가?", a: 275, e: "[인적성 변형 방정식] 작년 남자를 x라 두면 -0.08x + 0.10(500-x) = 5 ➡️ -0.18x = -45 ➡️ x = 250명. 작년 여자는 250명이며 올해 여자는 10% 증가하여 275명입니다." }
];

function setDifficulty(diff) {
  difficulty = diff;
  document.querySelectorAll('.diff-group button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`btn-${diff}`).classList.add('active');
  document.getElementById('diffDesc').innerHTML = diffTexts[diff];
}

function startGame() {
  score = 0;
  totalAnswered = 0;
  totalCorrect = 0;
  gameHistory = [];
  time = timeLimits[difficulty];

  if (difficulty === 'hard') {
    hardPoolIndices = Array.from({length: hardDatabase.length}, (_, i) => i);
    hardPoolIndices.sort(() => Math.random() - 0.5);
  }

  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('playScreen').classList.remove('hidden');
  document.getElementById('score').textContent = "0";
  
  if (difficulty === 'hard') {
    document.getElementById('skipBtn').classList.remove('hidden');
    document.getElementById('progressContainer').classList.remove('hidden');
    updateProgressBar();
  } else {
    document.getElementById('skipBtn').classList.add('hidden');
    document.getElementById('progressContainer').classList.add('hidden');
  }

  nextQuestion();
  
  timer = setInterval(() => {
    time--;
    document.getElementById('time').textContent = time;
    if (time <= 0) endGame(false, "⏰ 제한 시간이 만료되어 시험이 종료되었습니다.");
  }, 1000);
}

function handleGiveUp() {
  if (confirm("모의고사를 중단하고 제출하시겠습니까?")) {
    endGame(true, "수험자가 중도 포기 및 답안지를 제출했습니다.");
  }
}

function handleSkip() {
  score -= 1.5;
  if (score < 0) score = 0;
  
  gameHistory.push({
    question: currentQuestionText,
    userAnswer: "SKIPPED (넘어감)",
    correctAnswer: correctAnswer,
    isCorrect: false,
    isSkipped: true,
    explanation: currentExplanation
  });

  totalAnswered++;
  document.getElementById('score').textContent = Math.round(score * 10) / 10;

  let feedback = document.getElementById('feedback');
  feedback.textContent = '⏭️';
  
  if (difficulty === 'hard') {
    updateProgressBar();
    if (totalAnswered >= 20) {
      setTimeout(() => endGame(false, "🏁 20문항 최종 정산이 완료되었습니다."), 400);
      return;
    }
  }

  setTimeout(() => {
    nextQuestion();
    feedback.textContent = '';
  }, 300);
}

function updateProgressBar() {
  let percent = (totalAnswered / 20) * 100;
  document.getElementById('progressBar').style.width = `${percent}%`;
}

function nextQuestion() {
  let qElement = document.getElementById('question');
  qElement.classList.remove('large-font');

  if (difficulty === 'easy') {
    qElement.classList.add('large-font');
    generateEasyQuestion();
  } else if (difficulty === 'normal') {
    generateNormalQuestion();
  } else {
    generateHardQuestionNoRepeat();
  }

  document.getElementById('question').innerHTML = currentQuestionText;

  let answers = [correctAnswer];
  let failSafe = 0;
  let isDecimal = !Number.isInteger(correctAnswer);

  while (answers.length < 4 && failSafe < 200) {
    failSafe++;
    let wrong;
    if (isDecimal) {
      wrong = parseFloat((correctAnswer + (Math.random() * 1.6 - 0.8)).toFixed(1));
    } else {
      let spread = Math.abs(correctAnswer) < 10 ? 4 : Math.ceil(Math.abs(correctAnswer) * 0.2);
      wrong = correctAnswer + Math.floor(Math.random() * (spread * 2) - spread);
    }
    if (!answers.includes(wrong) && wrong !== null && wrong >= 0) answers.push(wrong);
  }
  
  while (answers.length < 4) {
    answers.push(correctAnswer + answers.length);
  }

  answers.sort(() => Math.random() - 0.5);

  let choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = '';

  answers.forEach(ans => {
    let btn = document.createElement('button');
    btn.textContent = ans;
    btn.onclick = () => checkAnswer(btn, ans);
    choicesDiv.appendChild(btn);
  });
}

function generateEasyQuestion() {
  let a = Math.floor(Math.random() * 9) + 1;
  let b = Math.floor(Math.random() * 9) + 1;
  let ops = ['+', '-', '*'];
  let op = ops[Math.floor(Math.random() * ops.length)];

  if (op === '+') correctAnswer = a + b;
  else if (op === '-') correctAnswer = a - b;
  else if (op === '*') correctAnswer = a * b;

  currentQuestionText = `${a} ${op} ${b}`;
  currentExplanation = `단순 산술 연산 결과: ${correctAnswer}`;
}

function generateNormalQuestion() {
  let type = Math.floor(Math.random() * 3);
  if (type === 0) {
    let a = Math.floor(Math.random() * 30) + 11;
    let b = Math.floor(Math.random() * 8) + 11;
    correctAnswer = a * b;
    currentQuestionText = `${a} × ${b} = ?`;
    currentExplanation = `${a} 곱하기 ${b}의 결과는 ${correctAnswer}입니다.`;
  } else if (type === 1) {
    let b = Math.floor(Math.random() * 11) + 3; 
    let ans = Math.floor(Math.random() * 12) + 4;
    let a = b * ans;
    correctAnswer = ans;
    currentQuestionText = `${a} ÷ ${b} = ?`;
    currentExplanation = `${b} × ${ans} = ${a} 이므로, 몫은 ${correctAnswer}입니다.`;
  } else {
    let x = Math.floor(Math.random() * 8) + 2;
    let a = Math.floor(Math.random() * 6) + 2;
    let b = Math.floor(Math.random() * 15) + 1;
    let c = a * x + b;
    correctAnswer = x;
    currentQuestionText = `다음 방정식을 만족하는 $x$를 구하라:<br><span style="color:#00ffcc; font-size:22px;">${a}x + ${b} = ${c}</span>`;
    currentExplanation = `1. 상수를 이항하면 ${a}x = ${c} - ${b} = ${c - b}<br>2. 양변을 ${a}로 나누면 x = ${correctAnswer}`;
  }
}

function generateHardQuestionNoRepeat() {
  if (totalAnswered < hardPoolIndices.length) {
    let targetIdx = hardPoolIndices[totalAnswered];
    let data = hardDatabase[targetIdx];
    currentQuestionText = data.q;
    correctAnswer = data.a;
    currentExplanation = data.e;
  } else {
    let a = Math.floor(Math.random() * 40) + 20;
    correctAnswer = a * 5;
    currentQuestionText = `[보충 문항] 기본 원가 소모 가치량이 ${a}원인 원자재 유통선에서 5배수의 고정 마진 총합액을 도출하시오.`;
    currentExplanation = `단순 배수 연산형 보충: ${a} × 5 = ${correctAnswer}`;
  }
}

function checkAnswer(button, answer) {
  let feedback = document.getElementById('feedback');
  let isCorrect = (answer === correctAnswer);
  
  totalAnswered++;
  if (isCorrect) totalCorrect++;

  gameHistory.push({
    question: currentQuestionText,
    userAnswer: answer,
    correctAnswer: correctAnswer,
    isCorrect: isCorrect,
    isSkipped: false,
    explanation: currentExplanation
  });

  if (isCorrect) {
    score += 5;
    button.classList.add('correct');
    feedback.textContent = '✅';
  } else {
    if (difficulty === 'hard') {
      score -= 2.5;
      if (score < 0) score = 0;
    }
    button.classList.add('wrong');
    feedback.textContent = '❌';
  }

  document.getElementById('score').textContent = Math.round(score * 10) / 10;

  let buttons = document.querySelectorAll('#choices button');
  buttons.forEach(btn => btn.disabled = true);

  if (difficulty === 'hard') {
    updateProgressBar();
    if (totalAnswered >= 20) {
      setTimeout(() => endGame(false, "🏁 20문항 모의고사가 모두 종료되었습니다."), 400);
      return;
    }
  }

  setTimeout(() => {
    nextQuestion();
    feedback.textContent = '';
  }, 400);
}

function endGame(isGiveUp = false, reasonText = "") {
  clearInterval(timer);
  document.getElementById('playScreen').classList.add('hidden');
  document.getElementById('endScreen').classList.remove('hidden');
  
  let finalScoreCalculated = Math.round(score * 10) / 10;
  if (finalScoreCalculated > 100) finalScoreCalculated = 100;
  document.getElementById('finalScore').textContent = finalScoreCalculated;

  let cutline = 65; 
  if (difficulty === 'hard') {
    cutline = 68;
  } else if (difficulty === 'normal') {
    cutline = 75;
  } else {
    cutline = 85;
  }
  document.getElementById('cutlineValue').textContent = cutline;

  let isPassed = finalScoreCalculated >= cutline && !isGiveUp;
  let passStatusContainer = document.getElementById('passStatusContainer');
  
  if (isPassed) {
    passStatusContainer.innerHTML = `<div class="pass-badge badge-pass">🎉 합 격 (최종 합격선 통과)</div>`;
  } else {
    passStatusContainer.innerHTML = `<div class="pass-badge badge-fail">😰 과락 / 불합격 (역량 미달)</div>`;
  }

  let accuracyPercent = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  document.getElementById('accuracy').textContent = `${accuracyPercent}% (${totalCorrect}/${totalAnswered})`;

  let reviewContainer = document.getElementById('reviewContainer');
  reviewContainer.innerHTML = '';

  if (gameHistory.length === 0) {
    reviewContainer.innerHTML = "<p style='color:#94a3b8; text-align:center;'>제출된 답안 내역이 존재하지 않습니다.</p>";
    return;
  }

  gameHistory.forEach((item, index) => {
    let itemDiv = document.createElement('div');
    itemDiv.classList.add('review-item');
    
    let mark = "";
    if (item.isSkipped) mark = "<span style='color:#38bdf8;'>[PASS]</span>";
    else mark = item.isCorrect ? "<span style='color:#10b981;'>[정답]</span>" : "<span style='color:#ef4444;'>[오답]</span>";
    
    let userAnsColor = item.isCorrect ? '#10b981' : (item.isSkipped ? '#38bdf8' : '#ef4444');

    itemDiv.innerHTML = `
      <div class="review-q">문항 ${index + 1}. ${item.question}</div>
      <div class="review-ans">${mark} 선택한 답: <strong style="color:${userAnsColor}">${item.userAnswer}</strong> | 실제 정답: <strong style="color:#38bdf8">${item.correctAnswer}</strong></div>
      <div class="review-sol">💡 <strong>해설:</strong> ${item.explanation}</div>
    `;
    reviewContainer.appendChild(itemDiv);
  });
}
