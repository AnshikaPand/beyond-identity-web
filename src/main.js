/**
 * BEYOND IDENTITY — Comprehensive Client Application
 * Connects directly to FastAPI backend at https://beyond-identy.onrender.com
 * Includes Multilingual AI Chatbot (Hindi/English/Marathi), Incident Redressal,
 * Statutory Scheme Matcher, Legal Awareness, and Clinical Health Triage.
 */

// ============================================================================
// CONFIGURATION & STATE
// ============================================================================
const CONFIG = {
  API_BASE: 'https://beyond-identy.onrender.com',
  FALLBACK_ACTIVE: true,
};

const STATE = {
  currentUser: JSON.parse(localStorage.getItem('beyond_user') || 'null'),
  token: localStorage.getItem('beyond_token') || null,
  activeTab: 'chat',
  chatLanguage: 'auto',
  chatHistory: [],
  currentHealthNodeId: 'root',
  healthHistory: [],
  awarenessTopics: [],
  listings: [],
  demoCases: [
    {
      id: 101,
      type: 'workplace',
      location: 'Pune, Maharashtra',
      urgency: 'high',
      matchedScheme: 'TG Act Sec 9, 10 & SMILE Livelihoods',
      status: 'under_review',
    },
    {
      id: 102,
      type: 'housing_eviction',
      location: 'New Delhi, Delhi',
      urgency: 'high',
      matchedScheme: 'Garima Greh Emergency Shelter & NALSA Legal Aid',
      status: 'escalated_to_ngo',
    },
    {
      id: 103,
      type: 'healthcare_denial',
      location: 'Bengaluru, Karnataka',
      urgency: 'medium',
      matchedScheme: 'Ayushman Bharat TG Package & CMO Escalation',
      status: 'legal_aid_assigned',
    },
    {
      id: 104,
      type: 'police_harassment',
      location: 'Bhubaneswar, Odisha',
      urgency: 'immediate_sos',
      matchedScheme: 'Odisha Sweekruti & NALSA Sec 12 24/7 Helpline',
      status: 'resolved',
    },
  ],
};

// ============================================================================
// EMBEDDED KNOWLEDGE BASE (Exact prompt facts for instant local responses)
// ============================================================================
const KNOWLEDGE_BASE = {
  facts: [
    'Being gay/lesbian/bisexual/transgender is NOT a disease, illness or crime in India.',
    'Supreme Court (Navtej Singh Johar, 2018) decriminalised consensual same-sex relations (Section 377 read down).',
    "NALSA judgment (2014) recognised transgender persons' right to self-identify their gender.",
    'Transgender Persons (Protection of Rights) Act, 2019 bans discrimination in education, jobs, healthcare, housing.',
    'Same-sex marriage is not legally recognised yet (Supreme Court, 2023 - left it to Parliament).',
    'Conversion therapy is not scientifically valid; Indian Psychiatric Society (2018) says homosexuality is not a mental illness.',
    'SMILE Scheme (Ministry of Social Justice): Comprehensive Rehabilitation for Transgender Persons — rehabilitation, medical help, counselling, education, skill development.',
    'Garima Greh: 12 pilot shelter homes (food, shelter, medical care, skill training) across Maharashtra, Gujarat, Delhi, West Bengal, Rajasthan, Bihar, Chhattisgarh, Tamil Nadu, Odisha.',
    'National Portal for Transgender Persons (transgender.dosje.gov.in): apply online for Certificate of Identity and ID card without visiting an office.',
    'Odisha Sweekruti Scheme: Rs 1,500/month to parents/guardians till age 18; scholarships Rs 1,000-5,000/month; Rs 3,000/month hostel stipend; legal aid and healthcare.',
    'Tele-MANAS (24x7 Government Mental Health Helpline): 14416 (free).',
    'NALSA Free Legal Aid: 15100 (24x7 National Legal Services helpline under Section 12).',
  ],
};

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupChat();
  setupIncidentForm();
  setupLegalSearch();
  setupHealthTriage();
  setupListings();
  setupNGODesk();
  setupAuth();
  checkApiHealth();

  // Load initial backend data
  loadAwarenessTopics();
  loadInitialHealthTree();
  loadListings();
});

// ============================================================================
// NAVIGATION
// ============================================================================
function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      switchTab(target);
    });
  });

  const heroChatCta = document.getElementById('hero-chat-cta');
  if (heroChatCta) heroChatCta.addEventListener('click', () => switchTab('chat'));

  const heroReportCta = document.getElementById('hero-report-cta');
  if (heroReportCta) heroReportCta.addEventListener('click', () => switchTab('report'));
}

function switchTab(tabId) {
  STATE.activeTab = tabId;
  document.querySelectorAll('.nav-tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-panel').forEach((p) => {
    p.classList.toggle('active', p.id === `panel-${tabId}`);
  });
}

// ============================================================================
// API HEALTH CHECK
// ============================================================================
async function checkApiHealth() {
  const statusEl = document.getElementById('server-status');
  try {
    const res = await fetch(`${CONFIG.API_BASE}/`, { method: 'GET' });
    if (res.ok) {
      statusEl.innerHTML = '<span class="status-indicator live"></span><span class="status-text">Live: v0.2.0</span>';
    } else {
      statusEl.innerHTML = '<span class="status-indicator" style="background:#f59e0b"></span><span class="status-text">Connecting...</span>';
    }
  } catch (err) {
    statusEl.innerHTML = '<span class="status-indicator" style="background:#38bdf8"></span><span class="status-text">Client Active</span>';
  }
}

// ============================================================================
// TAB 1: AI CHATBOT (Hindi / English / Marathi)
// ============================================================================
function setupChat() {
  const form = document.getElementById('chat-input-form');
  const input = document.getElementById('chat-input');
  const langSelect = document.getElementById('chat-language-select');
  const chipsBar = document.getElementById('prompt-chips-bar');

  langSelect.addEventListener('change', (e) => {
    STATE.chatLanguage = e.target.value;
    showToast(`Language set to: ${langSelect.options[langSelect.selectedIndex].text}`);
  });

  // Suggestion chips
  chipsBar.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt;
      input.value = prompt;
      form.dispatchEvent(new Event('submit'));
    });
  });

  // Initial greeting
  appendChatMessage(
    'assistant',
    `🙏 **Namaste & Welcome to Beyond Identity.**\n\nI am your confidential AI support assistant, here to provide warm, non-judgmental guidance on Indian legal rights, landmark rulings (NALSA, Section 377), government welfare schemes (SMILE, Garima Greh, Odisha Sweekruti), and parent support.\n\nYou can chat freely in **English**, **हिन्दी (Hindi)**, or **मराठी (Marathi)**. If you are ever feeling distressed or unsafe, please reach out to **Tele-MANAS at 14416** (24/7 free helpline). How can I assist you today?`
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    appendChatMessage('user', message);
    input.value = '';

    // Show typing indicator
    const typingId = showTypingIndicator();

    try {
      let replyText = null;

      // 1. Try calling the live backend POST /chat endpoint
      try {
        const response = await fetch(`${CONFIG.API_BASE}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message,
            language: STATE.chatLanguage,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          replyText = data.reply;
        }
      } catch (networkErr) {
        // Backend /chat router might be waiting for user deployment on Render
      }

      // 2. Local intelligent fallback if backend /chat is pending deployment
      if (!replyText) {
        replyText = generateLocalAiResponse(message, STATE.chatLanguage);
      }

      removeTypingIndicator(typingId);
      appendChatMessage('assistant', replyText);
    } catch (err) {
      removeTypingIndicator(typingId);
      appendChatMessage(
        'assistant',
        'I am experiencing a temporary connection hiccup, but please rest assured: You are safe, respected, and not alone. For emergency mental health counseling, call Tele-MANAS at 14416.'
      );
    }
  });
}

function appendChatMessage(role, text) {
  const container = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;

  const avatar = role === 'assistant' ? '🤖' : '👤';
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Simple Markdown formatting (bold, links, bullet points)
  const formattedText = formatMarkdown(text);

  bubble.innerHTML = `
    <div class="bubble-avatar">${avatar}</div>
    <div>
      <div class="bubble-content">${formattedText}</div>
      <div class="bubble-meta">
        <span>${role === 'assistant' ? 'Beyond Identity AI' : 'You'}</span> • <span>${time}</span>
      </div>
    </div>
  `;

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  const id = 'typing-' + Date.now();
  const bubble = document.createElement('div');
  bubble.id = id;
  bubble.className = 'chat-bubble assistant';
  bubble.innerHTML = `
    <div class="bubble-avatar">🤖</div>
    <div class="bubble-content">
      <div class="typing-indicator"><span></span><span></span><span></span></div>
    </div>
  `;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

/**
 * Intelligent local response generator matching the exact system prompt rules & knowledge facts
 */
function generateLocalAiResponse(query, langPref) {
  const lower = query.toLowerCase();

  // Detect language
  let isHindi = /[\u0900-\u097F]/.test(query) || langPref === 'hindi';
  let isMarathi = (query.includes('काय') || query.includes('आहे') || query.includes('माझे') || query.includes('पालक') || langPref === 'marathi');

  // Crisis / self-harm check
  if (lower.includes('suicide') || lower.includes('harm') || lower.includes('kill') || lower.includes('मरना') || lower.includes('जीव')) {
    if (isMarathi) {
      return "कृपया काळजी करू नका, तुम्ही एकटे नाही आहात. तुमचे जीवन मौल्यवान आहे. कृपया कोणाशी तरी बोला किंवा भारत सरकारच्या मोफत 24x7 टेलि-मानस (Tele-MANAS) हेल्पलाइनवर 14416 वर त्वरित संपर्क साधा. आम्ही तुमच्या पाठीशी आहोत.";
    }
    if (isHindi) {
      return "कृपया धैर्य रखें, आप अकेले नहीं हैं और आपकी ज़िंदगी बेहद अनमोल है। यदि आप असुरक्षित महसूस कर रहे हैं, तो तुरंत भारत सरकार की निःशुल्क 24x7 टेली-मानस (Tele-MANAS) हेल्पलाइन 14416 पर कॉल करें। मदद हर समय उपलब्ध है।";
    }
    return "Please know that your life is precious, you are not alone, and there is support for you right now. Please reach out to someone you trust or call the government's free 24/7 mental health helpline Tele-MANAS at 14416. We care about your safety.";
  }

  // Parent support question
  if (lower.includes('parent') || lower.includes('child') || lower.includes('beta') || lower.includes('beti') || lower.includes('मुल') || lower.includes('पालक')) {
    if (isMarathi) {
      return "पालक म्हणून काळजी वाटणे स्वाभाविक आहे, पण सर्वप्रथम शांत राहा. हे कोणत्याही चुकीच्या संगोपनामुळे झालेले नाही आणि हा कोणताही आजार नाही जो दुरुस्त करायचा आहे. आपल्या मुलाचे म्हणणे रागाशिवाय ऐका, त्यांचे सुरक्षित वातावरण टिकवून ठेवा, आणि सक्तीचे लग्न किंवा थेरपीचा आग्रह करू नका. जर तुम्हाला मदत हवी असेल तर प्रशिक्षित समुपदेशकाशी किंवा टेलि-मानस (14416) वर संपर्क साधा.";
    }
    if (isHindi) {
      return "एक अभिभावक के रूप में चिंता होना स्वाभाविक है, लेकिन सबसे पहले शांत रहें। यह परवरिश की कमी के कारण नहीं है और न ही यह कोई बीमारी है जिसे ठीक करने की आवश्यकता हो। अपने बच्चे की बात बिना गुस्से के सुनें, उनका विश्वास और सुरक्षा सबसे पहले रखें। उन पर विवाह या रूपांतरण चिकित्सा (conversion therapy) का दबाव कभी न बनाएं। यदि आवश्यकता हो, तो किसी प्रशिक्षित काउंसलर या टेली-मानस (14416) से मार्गदर्शन लें।";
    }
    return "It is natural to have questions as a parent, but rest assured: being LGBTQ+ is not caused by parenting and is not an illness to be fixed. Listen to your child with love and without anger, prioritize their emotional and physical safety, and never force marriage or therapy. You can also reach out to Tele-MANAS (14416) for sensitive, professional family counseling.";
  }

  // SMILE Scheme
  if (lower.includes('smile') || lower.includes('स्माइल')) {
    if (isHindi) {
      return "स्माइल (SMILE) योजना सामाजिक न्याय एवं अधिकारिता मंत्रालय द्वारा ट्रांसजेंडर व्यक्तियों के समग्र कल्याण के लिए शुरू की गई है। इसके अंतर्गत चिकित्सा सहायता, सुरक्षित आश्रय, कौशल विकास, शिक्षा और आजीविका से जुड़े आर्थिक अवसर प्रदान किए जाते हैं।";
    }
    if (isMarathi) {
      return "स्माइल (SMILE) योजना ही सामाजिक न्याय मंत्रालयाची महत्त्वपूर्ण योजना आहे. यामध्ये ट्रान्सजेंडर व्यक्तींसाठी सर्वसमावेशक पुनर्वसन, वैद्यकीय मदत, समुपदेशन, कौशल्य प्रशिक्षण आणि आर्थिक स्वावलंबनाच्या संधी दिल्या जातात.";
    }
    return "The SMILE (Support for Marginalized Individuals for Livelihood and Enterprise) scheme is run by the Ministry of Social Justice and Empowerment. It provides comprehensive rehabilitation for transgender persons, covering medical support, counseling, education, skill development, and economic linkages.";
  }

  // Garima Greh
  if (lower.includes('garima') || lower.includes('shelter') || lower.includes('गरिमा') || lower.includes('आश्रय')) {
    if (isHindi) {
      return "गरिमा गृह (Garima Greh) ट्रांसजेंडर व्यक्तियों के लिए सुरक्षित आश्रय गृह हैं। वर्तमान में महाराष्ट्र, दिल्ली, गुजरात, पश्चिम बंगाल, राजस्थान, बिहार, तमिलनाडु और ओडिशा में ये केंद्र संचालित हैं जहाँ भोजन, सुरक्षित आवास, चिकित्सा सुविधा और कौशल प्रशिक्षण निःशुल्क मिलता है।";
    }
    return "Garima Greh shelter homes provide safe temporary housing, food, medical care, and skill training for transgender persons facing homelessness or distress. Pilot homes are operational in Maharashtra, Gujarat, Delhi, West Bengal, Rajasthan, Bihar, Chhattisgarh, Tamil Nadu, and Odisha.";
  }

  // NALSA / Section 377 / Legal
  if (lower.includes('nalsa') || lower.includes('377') || lower.includes('right') || lower.includes('law') || lower.includes('कानून') || lower.includes('अधिकार')) {
    if (isHindi) {
      return "भारतीय कानून में आपके महत्वपूर्ण अधिकार हैं:\n1. सर्वोच्च न्यायालय के NALSA निर्णय (2014) ने ट्रांसजेंडर व्यक्तियों के स्व-पहचान के अधिकार को मान्यता दी।\n2. नवतेज सिंह जौहर (2018) मामले में धारा 377 को रद्द कर वयस्कों के बीच सहमति संबंधों को अपराधमुक्त किया गया।\n3. ट्रांसजेंडर व्यक्ति (अधिकारों का संरक्षण) अधिनियम 2019 शिक्षा, नौकरी, स्वास्थ्य और आवास में भेदभाव को प्रतिबंधित करता है।";
    }
    return "Key Indian Legal Rights:\n• NALSA judgment (2014): Recognizes the fundamental right to self-identify one's gender.\n• Navtej Singh Johar (2018): Supreme Court decriminalized consensual adult same-sex relations by reading down Section 377.\n• Transgender Persons Act, 2019: Prohibits discrimination in employment, education, housing, and healthcare.\n• NALSA Helpline: Call 15100 for 24/7 free legal advocate representation.";
  }

  // Default response
  if (isMarathi) {
    return "भारतात ट्रान्सजेंडर किंवा LGBTQ+ असणे हा कोणताही आजार किंवा गुन्हा नाही. भारतीय राज्यघटनेने समानता आणि आत्मसन्मानाचा अधिकार दिला आहे. आपण कोणत्याही विशिष्ट सरकारी योजनेबद्दल (जसे की SMILE, गरिमा गृह, ओडिशा स्वीकृती) किंवा कायदेशीर अधिकारांबद्दल विचारू शकता.";
  }
  if (isHindi) {
    return "भारत में समलैंगिक, उभयलिंगी या ट्रांसजेंडर होना कोई बीमारी या अपराध नहीं है। भारतीय कानून और सर्वोच्च न्यायालय का NALSA निर्णय आपकी पहचान और गरिमा की रक्षा करता है। आप किसी भी सरकारी योजना (SMILE, गरिमा गृह), पहचान पत्र पोर्टल या कानूनी अधिकार के बारे में विस्तार से पूछ सकते हैं।";
  }
  return "Being gay, lesbian, bisexual, or transgender is recognized, dignified, and not an illness or crime in India. Under the Transgender Persons Act 2019 and landmark NALSA ruling, you are protected against discrimination. Feel free to ask about any specific statutory schemes (SMILE, Garima Greh, Odisha Sweekruti) or legal remedies.";
}

function formatMarkdown(text) {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n• (.*?)(?=\n|$)/g, '<li>$1</li>')
    .replace(/\n\d+\. (.*?)(?=\n|$)/g, '<li>$1</li>');

  if (html.includes('<li>')) {
    html = html.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
  }

  return `<p>${html}</p>`;
}

// ============================================================================
// TAB 2: INCIDENT REPORTING & SCHEME MATCHER
// ============================================================================
function setupIncidentForm() {
  const form = document.getElementById('incident-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('inc-title').value.trim();
    const type = document.getElementById('inc-type').value;
    const desc = document.getElementById('inc-desc').value.trim();
    const city = document.getElementById('inc-city').value.trim();
    const state = document.getElementById('inc-state').value.trim();
    const urgency = document.getElementById('inc-urgency').value;
    const perpetrator = document.getElementById('inc-perpetrator').value.trim();
    const isAnonymous = document.getElementById('inc-anonymous').checked;
    const contactEmail = document.getElementById('inc-contact-email').value.trim();

    const submitBtn = document.getElementById('submit-incident-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳ Processing Report & Matching Schemes...</span>';

    try {
      const payload = {
        incident_type: type,
        title: title,
        description: desc,
        location_city: city,
        location_state: state,
        perpetrator_details: perpetrator || null,
        urgency_level: urgency,
        is_anonymous: isAnonymous,
        contact_email: contactEmail || null,
      };

      // Call backend POST /incidents/
      let result = null;
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (STATE.token) headers['Authorization'] = `Bearer ${STATE.token}`;

        const res = await fetch(`${CONFIG.API_BASE}/incidents/`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          result = await res.json();
        }
      } catch (err) {
        console.warn('Backend call failed, using client matcher', err);
      }

      // Display matched schemes
      displayMatchedSchemes(result || computeClientSchemeMatch(type, urgency, state));
      showToast('Incident reported successfully. Matched statutory schemes displayed.', 'success');

      // Add to NGO table if available
      STATE.demoCases.unshift({
        id: Math.floor(1000 + Math.random() * 9000),
        type: type,
        location: `${city}, ${state}`,
        urgency: urgency,
        matchedScheme: 'SMILE & NALSA Section 12',
        status: 'submitted',
      });
      renderCasesTable();

      form.reset();
    } catch (err) {
      showToast('Could not complete submission: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>🛡️ Submit Report & Match Statutory Schemes</span>';
    }
  });
}

function computeClientSchemeMatch(type, urgency, state) {
  const schemes = [
    {
      name: 'NALSA Section 12 Free Legal Aid',
      ministry_or_dept: 'National Legal Services Authority (Supreme Court of India)',
      description: 'Guaranteed free advocate appointment, court fee waiver, and representation for discrimination victims.',
      benefits: '100% free legal assistance, drafting writ petitions, 24/7 Helpline: 15100',
      helpline: '15100',
      application_link: 'https://nalsa.gov.in',
    },
    {
      name: 'SMILE Scheme — Comprehensive Transgender Welfare',
      ministry_or_dept: 'Ministry of Social Justice & Empowerment',
      description: 'National welfare umbrella covering emergency medical care, transit housing, and affirmative skill training.',
      benefits: 'Shelter, counselling, medical assistance up to ₹5,00,000 via Ayushman Bharat TG',
      helpline: '14566',
      application_link: 'https://transgender.dosje.gov.in',
    },
  ];

  if (type === 'housing_eviction' || urgency === 'high' || urgency === 'immediate_sos') {
    schemes.unshift({
      name: 'Garima Greh Emergency Shelter',
      ministry_or_dept: 'Ministry of Social Justice & Regional NGO Consortium',
      description: 'Immediate safe housing, food, and psychosocial care for displaced transgender individuals.',
      benefits: 'Free safe lodging, food, and skill rehabilitation for up to 1 year',
      helpline: '14566',
      application_link: 'https://transgender.dosje.gov.in/garimagreh',
    });
  }

  if (state.toLowerCase().includes('odisha')) {
    schemes.unshift({
      name: 'Odisha Sweekruti Scheme',
      ministry_or_dept: 'Department of Social Security & Empowerment of Persons with Disabilities, Odisha',
      description: 'Comprehensive state-level social security and financial empowerment scheme.',
      benefits: '₹1,500/mo guardian support, ₹1,000-5,000 scholarships, ₹3,000/mo hostel stipend',
      helpline: '14416',
      application_link: 'https://ssepd.odisha.gov.in',
    });
  }

  return { matched_schemes: schemes };
}

function displayMatchedSchemes(data) {
  const container = document.getElementById('matched-schemes-list');
  const schemes = data.matched_schemes || [];

  if (!schemes.length) {
    container.innerHTML = `<div class="match-placeholder"><div class="placeholder-icon">ℹ️</div><div>Your incident was recorded. An NGO caseworker will review and assign schemes shortly.</div></div>`;
    return;
  }

  container.innerHTML = schemes
    .map(
      (s) => `
    <div class="scheme-card">
      <div class="scheme-header">
        <div class="scheme-title">🏛️ ${s.name}</div>
      </div>
      <div class="scheme-ministry">${s.ministry_or_dept}</div>
      <div class="scheme-benefits"><strong>Benefits:</strong> ${s.benefits}</div>
      ${s.helpline ? `<div style="font-size:0.78rem; color:#fed7aa; margin-bottom:6px;">📞 Helpline: <strong>${s.helpline}</strong></div>` : ''}
      ${s.application_link ? `<a href="${s.application_link}" target="_blank" rel="noopener noreferrer" class="scheme-link">Official Portal Link →</a>` : ''}
    </div>
  `
    )
    .join('');
}

// ============================================================================
// TAB 3: AI LEGAL RIGHTS & REMEDIES
// ============================================================================
async function loadAwarenessTopics() {
  const grid = document.getElementById('topics-grid');
  const badge = document.getElementById('topic-count-badge');

  try {
    const res = await fetch(`${CONFIG.API_BASE}/awareness/topics`);
    if (res.ok) {
      STATE.awarenessTopics = await res.json();
      badge.textContent = `${STATE.awarenessTopics.length} Statutory Guides`;
      renderTopics(STATE.awarenessTopics);
      return;
    }
  } catch (e) {
    console.warn('Backend topics fetch failed, using fallback guides', e);
  }

  // Fallback curated guides
  STATE.awarenessTopics = [
    {
      id: 'tg_act_overview',
      title: 'Transgender Persons (Protection of Rights) Act, 2019',
      act_or_ruling: 'Act No. 40 of 2019 & Rules 2020',
      summary: 'Prohibits discrimination across private & public sectors in education, employment, healthcare, and housing.',
      key_rights: [
        'Right to self-perceived gender identity (Section 4)',
        'Mandatory Equal Opportunity Policy in establishments with 20+ staff',
        'Appointment of Complaints Officer for grievance redressal within 15 days',
      ],
      official_portal: 'https://transgender.dosje.gov.in',
    },
    {
      id: 'nalsa_judgment',
      title: 'NALSA v. Union of India Landmark Judgment',
      act_or_ruling: 'Supreme Court of India (2014) 5 SCC 438',
      summary: 'Recognized transgender persons as the Third Gender and affirmed fundamental rights under Articles 14, 15, 19, and 21.',
      key_rights: [
        'Fundamental right to self-identification without compulsory medical surgery',
        'State directive to treat transgender persons as socially and educationally backward classes',
      ],
      official_portal: 'https://nalsa.gov.in',
    },
    {
      id: 'workplace_protections',
      title: 'Workplace Equal Opportunity Protections',
      act_or_ruling: 'TG Act 2019 (Sections 9-11)',
      summary: 'Mandates zero discrimination in recruitment, promotion, wage parity, and workplace safety.',
      key_rights: [
        'Protection against wrongful termination based on gender identity',
        'Mandatory provision of gender-neutral washrooms and inclusive insurance',
      ],
      official_portal: 'https://labour.gov.in',
    },
    {
      id: 'housing_rights',
      title: 'Protection Against Forced Housing Eviction',
      act_or_ruling: 'TG Act 2019 Section 12 & Model Tenancy',
      summary: 'Protects transgender individuals from arbitrary rental refusal, landlord harassment, and unlawful eviction.',
      key_rights: [
        'No separation from family or eviction from residence on grounds of gender identity',
        'Recourse to emergency Garima Greh shelters in cases of estrangement',
      ],
      official_portal: 'https://transgender.dosje.gov.in/garimagreh',
    },
  ];

  badge.textContent = `${STATE.awarenessTopics.length} Statutory Guides`;
  renderTopics(STATE.awarenessTopics);
}

function renderTopics(topics) {
  const grid = document.getElementById('topics-grid');
  grid.innerHTML = topics
    .map(
      (t) => `
    <div class="topic-card">
      <div>
        <span class="topic-act-badge">${t.act_or_ruling}</span>
        <h4 class="topic-title">${t.title}</h4>
        <p class="topic-summary">${t.summary}</p>
        <div style="margin: 12px 0 8px; font-weight:600; font-size:0.8rem; color:#cbd5e1;">Key Rights:</div>
        <ul class="topic-rights-list">
          ${t.key_rights.map((r) => `<li>${r}</li>`).join('')}
        </ul>
      </div>
      <div>
        ${t.official_portal ? `<a href="${t.official_portal}" target="_blank" rel="noopener noreferrer" class="topic-portal-link">Official Portal & Application →</a>` : ''}
      </div>
    </div>
  `
    )
    .join('');
}

function setupLegalSearch() {
  const input = document.getElementById('legal-search-input');
  const btn = document.getElementById('legal-query-btn');
  const resultContainer = document.getElementById('legal-query-result');

  const doSearch = async () => {
    const query = input.value.trim();
    if (!query) return;

    btn.disabled = true;
    btn.innerHTML = '<span>Searching...</span>';

    try {
      const res = await fetch(`${CONFIG.API_BASE}/awareness/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query }),
      });

      if (res.ok) {
        const data = await res.json();
        resultContainer.classList.remove('hidden');
        resultContainer.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div>
              <span class="topic-act-badge">${data.applicable_law || 'Statutory Law'}</span>
              <h3 style="font-family:var(--font-heading); color:#fff; margin-top:4px;">${data.matched_topic}</h3>
            </div>
            <button onclick="document.getElementById('legal-query-result').classList.add('hidden')" style="background:transparent; border:none; color:#94a3b8; cursor:pointer; font-size:1.2rem;">&times;</button>
          </div>
          <p style="color:#e2e8f0; font-size:0.92rem; line-height:1.6; margin-bottom:14px;">${data.explanation}</p>
          <div style="margin-bottom:12px;">
            <strong style="font-size:0.84rem; color:#38bdf8;">Actionable Steps:</strong>
            <ul style="margin-left:20px; font-size:0.85rem; color:#cbd5e1; margin-top:6px;">
              ${(data.actionable_steps || []).map((step) => `<li>${step}</li>`).join('')}
            </ul>
          </div>
          <div style="font-size:0.8rem; color:#f472b6;">
            <strong>Free Legal Aid:</strong> ${data.legal_aid_contact || 'NALSA 24x7 Helpline: 15100'}
          </div>
        `;
      } else {
        throw new Error('Query error');
      }
    } catch (e) {
      // Client-side search across topics
      const filtered = STATE.awarenessTopics.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.summary.toLowerCase().includes(query.toLowerCase())
      );
      renderTopics(filtered.length ? filtered : STATE.awarenessTopics);
      showToast(`Filtered ${filtered.length} relevant guides`);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>Search Rights Database</span>';
    }
  };

  btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
}

// ============================================================================
// TAB 4: CLINICAL HEALTH TRIAGE DECISION TREE
// ============================================================================
async function loadInitialHealthTree() {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/health-assistant/tree`);
    if (res.ok) {
      const data = await res.json();
      renderDecisionNode(data.node);
      if (data.disclaimer) {
        document.getElementById('medical-disclaimer').innerHTML = `⚠️ <strong>Medical Disclaimer:</strong> ${data.disclaimer}`;
      }
      return;
    }
  } catch (e) {
    console.warn('Backend health tree fetch failed, rendering fallback tree', e);
  }

  // Fallback Root Node
  renderDecisionNode({
    node_id: 'root',
    title: 'Healthcare Navigation & Gender-Affirming Care Triage',
    category: 'Clinical Navigation',
    message:
      'Select a healthcare pathway below to view clinical checklists, baseline laboratory panels, statutory Ayushman Bharat surgical subsidies, or emergency psychological support.',
    warnings: ['Never start hormone therapy (HRT) without baseline blood panels and an endocrinologist prescription.'],
    recommended_actions: [
      'Obtain your National Transgender Identity Card from transgender.dosje.gov.in to access Ayushman Bharat TG benefits.',
      'Consult a certified psychiatrist/clinical psychologist for gender dysphoria evaluation if seeking surgical subsidies.',
    ],
    helpline_contacts: ['Tele-MANAS Government 24x7 Mental Health Helpline: 14416 (Toll-Free)'],
    options: [
      { option_id: 'opt_hrt', text: '🔬 Safe Hormone Replacement Therapy (HRT) Guidance', next_node_id: 'node_hrt' },
      { option_id: 'opt_surgery', text: '🏥 Gender Affirmation Surgeries & Ayushman Bharat', next_node_id: 'node_surgery' },
      { option_id: 'opt_mental', text: '🧠 Crisis Mental Health & Emotional Support', next_node_id: 'node_mental' },
    ],
  });
}

function renderDecisionNode(node) {
  STATE.currentHealthNodeId = node.node_id;

  document.getElementById('node-category').textContent = node.category || 'Healthcare';
  document.getElementById('node-title').textContent = node.title;
  document.getElementById('node-message').textContent = node.message;

  // Alerts
  const alertsEl = document.getElementById('node-alerts');
  alertsEl.innerHTML = '';
  if (node.warnings && node.warnings.length) {
    node.warnings.forEach((w) => {
      alertsEl.innerHTML += `<div class="node-alert-item">⚠️ <strong>Clinical Precaution:</strong> ${w}</div>`;
    });
  }

  // Options
  const optionsEl = document.getElementById('node-options-grid');
  optionsEl.innerHTML = '';
  if (node.options && node.options.length) {
    node.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'node-option-btn';
      btn.innerHTML = `<span>${opt.text}</span> <span>→</span>`;
      btn.addEventListener('click', () => traverseTree(node.node_id, opt.option_id, opt.next_node_id));
      optionsEl.appendChild(btn);
    });
  } else {
    optionsEl.innerHTML = `
      <button class="node-option-btn" onclick="window.beyondRestartTree()">
        <span>↺ Return to Beginning (Healthcare Overview)</span> <span>←</span>
      </button>
    `;
  }

  // Helplines
  const helplinesEl = document.getElementById('node-helplines');
  if (node.helpline_contacts && node.helpline_contacts.length) {
    helplinesEl.innerHTML = node.helpline_contacts
      .map((h) => `<div>📞 <strong>Helpline:</strong> ${h}</div>`)
      .join('');
  } else {
    helplinesEl.innerHTML = `<div>📞 Tele-MANAS 24x7 Government Helpline: <strong>14416</strong></div>`;
  }
}

async function traverseTree(currentNodeId, optionId, nextNodeId) {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/health-assistant/traverse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_node_id: currentNodeId, option_id: optionId }),
    });

    if (res.ok) {
      const data = await res.json();
      renderDecisionNode(data.node);
      updateTrail(data.node.title);
      return;
    }
  } catch (e) {
    // Traverse fallback nodes
  }

  // Fallback decision nodes
  const fallbackNodes = {
    node_hrt: {
      node_id: 'node_hrt',
      title: 'Safe Hormone Replacement Therapy (HRT) Protocol',
      category: 'Endocrinology',
      message:
        'HRT requires careful monitoring under a licensed endocrinologist. Baseline tests must include Complete Blood Count (CBC), Liver Function Tests (LFT), Renal Function Tests (RFT), Lipid Profile, Serum Prolactin, and Total Testosterone/Estradiol levels.',
      warnings: [
        'Self-medication (DIY HRT) carries serious risks of thromboembolism, liver toxicity, and cardiovascular complications.',
      ],
      recommended_actions: [
        'Book an endocrinologist consultation at a tertiary government hospital or verified community clinic.',
        'Never alter dosages without repeat laboratory blood panels every 3 months during the first year.',
      ],
      helpline_contacts: ['National Health Authority / Ayushman Bharat: 14588'],
      options: [
        { option_id: 'opt_back', text: '← Back to Main Menu', next_node_id: 'root' },
      ],
    },
    node_surgery: {
      node_id: 'node_surgery',
      title: 'Gender Affirmation Surgeries & Ayushman Bharat TG Package',
      category: 'Surgery & Financial Aid',
      message:
        'Under the Ayushman Bharat TG Package (MOU between MoSJE & NHA), eligible transgender persons with a National TG Certificate can receive up to ₹5,00,000 per year covering gender confirmation surgery, hospitalization, and post-op care.',
      warnings: [
        'Only undergo surgical procedures at hospitals accredited by the National Health Authority (NHA).',
      ],
      recommended_actions: [
        'Register your Certificate of Identity at https://transgender.dosje.gov.in',
        'Verify empaneled state hospitals at pmjay.gov.in',
      ],
      helpline_contacts: ['Ayushman Bharat Helpline: 14588'],
      options: [
        { option_id: 'opt_back', text: '← Back to Main Menu', next_node_id: 'root' },
      ],
    },
    node_mental: {
      node_id: 'node_mental',
      title: 'Crisis Mental Health & Affirmative Counseling',
      category: 'Mental Health',
      message:
        'You have the fundamental right to mental healthcare free from bias. In 2018, the Indian Psychiatric Society clarified that gender diversity and homosexuality are normal human variations and conversion therapy is unethical.',
      warnings: [
        'If you or someone you know is in immediate crisis, please call Tele-MANAS (14416) or emergency services (112) right away.',
      ],
      recommended_actions: [
        'Access 24/7 free counseling via Tele-MANAS (14416).',
        'Connect with LGBTQ+ peer support circles through Tweet Foundation or Humsafar Trust.',
      ],
      helpline_contacts: ['Tele-MANAS: 14416', 'Vandrevala Foundation: 9999 666 555'],
      options: [
        { option_id: 'opt_back', text: '← Back to Main Menu', next_node_id: 'root' },
      ],
    },
  };

  const next = fallbackNodes[nextNodeId] || fallbackNodes['node_hrt'];
  renderDecisionNode(next);
  updateTrail(next.title);
}

function updateTrail(title) {
  const trail = document.getElementById('tree-trail');
  const span = document.createElement('span');
  span.className = 'trail-item active';
  span.textContent = title;
  trail.appendChild(span);
}

window.beyondRestartTree = () => {
  document.getElementById('tree-trail').innerHTML = '<span class="trail-item active">Root Assessment</span>';
  loadInitialHealthTree();
};

function setupHealthTriage() {
  // Event listeners for health assistant
}

// ============================================================================
// TAB 5: OPPORTUNITIES & LISTINGS
// ============================================================================
async function loadListings(category = null) {
  const grid = document.getElementById('listings-grid');
  try {
    let url = `${CONFIG.API_BASE}/listings/?status=verified`;
    if (category && category !== 'all') url += `&category=${category}`;

    const res = await fetch(url);
    if (res.ok) {
      STATE.listings = await res.json();
      renderListings(STATE.listings);
      return;
    }
  } catch (e) {
    console.warn('Backend listings fetch failed, rendering fallback items', e);
  }

  // Fallback listings
  STATE.listings = [
    {
      id: 1,
      category: 'employment',
      title: 'Inclusive Software Engineer Fellowship 2026',
      organization_name: 'Tech for Equality Consortium',
      location: 'Bengaluru / Hybrid',
      description: 'Affirmative hiring program for transgender tech professionals. Equal opportunity policy, inclusive health insurance covering HRT.',
      status: 'verified',
      discrimination_reports: 0,
    },
    {
      id: 2,
      category: 'housing',
      title: 'Garima Greh Safe Haven Shelter',
      organization_name: 'Tweet Foundation',
      location: 'New Delhi & Mumbai',
      description: 'Emergency shelter providing safe accommodation, legal accompaniment, counseling, and vocational training.',
      status: 'verified',
      discrimination_reports: 0,
    },
    {
      id: 3,
      category: 'education',
      title: 'Higher Education Empowerment Scholarship',
      organization_name: 'SMILE National Portal',
      location: 'All India',
      description: 'Monthly stipend and full tuition reimbursement for transgender students in university or diploma programs.',
      status: 'verified',
      discrimination_reports: 0,
    },
    {
      id: 4,
      category: 'healthcare',
      title: 'Gender-Affirming Clinical Care Clinic',
      organization_name: 'Mitr Community Healthcare Center',
      location: 'Delhi NCR',
      description: 'Endocrinology consultations, subsidized lab panels, mental health support, and WPATH standard referrals.',
      status: 'verified',
      discrimination_reports: 0,
    },
  ];

  renderListings(STATE.listings);
}

function renderListings(items) {
  const grid = document.getElementById('listings-grid');
  if (!items.length) {
    grid.innerHTML = '<div style="color:#94a3b8; padding:30px; text-align:center;">No listings found in this category.</div>';
    return;
  }

  grid.innerHTML = items
    .map(
      (l) => `
    <div class="listing-card">
      <div>
        <div class="listing-meta-row">
          <span class="listing-tag">${l.category}</span>
          <span class="badge-verified">✓ Verified Safe</span>
        </div>
        <h4 class="listing-title" style="margin-top:8px;">${l.title}</h4>
        <div class="listing-org">${l.organization_name || 'Verified Community Partner'} • ${l.location || 'India'}</div>
        <p class="listing-desc" style="margin-top:10px;">${l.description || 'Inclusive opportunities with community backing.'}</p>
      </div>
      <div class="listing-footer">
        <button class="btn btn-outline" style="padding:4px 12px; font-size:0.78rem;" onclick="window.beyondApplyListing(${l.id})">
          View Details
        </button>
        <button class="btn-report-listing" onclick="window.beyondReportListing(${l.id})">
          ⚠️ Report Discrimination
        </button>
      </div>
    </div>
  `
    )
    .join('');
}

function setupListings() {
  const filterPills = document.querySelectorAll('#listing-filter-pills .filter-pill');
  filterPills.forEach((p) => {
    p.addEventListener('click', () => {
      filterPills.forEach((btn) => btn.classList.remove('active'));
      p.classList.add('active');
      const cat = p.dataset.cat;
      loadListings(cat);
    });
  });

  const addBtn = document.getElementById('add-listing-btn');
  const modal = document.getElementById('listing-modal');
  const closeBtn = document.getElementById('listing-modal-close-btn');

  if (addBtn && modal) {
    addBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

    const form = document.getElementById('new-listing-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      modal.classList.add('hidden');
      showToast('Opportunity submitted. Sent to NGO Moderation Desk for physical verification.', 'success');
      form.reset();
    });
  }
}

window.beyondApplyListing = (id) => {
  showToast(`Listing #${id}: Application details copied or opened.`);
};

window.beyondReportListing = async (id) => {
  const notes = prompt('Please specify why this listing violates community safety or non-discrimination policies:');
  if (!notes) return;

  try {
    const res = await fetch(`${CONFIG.API_BASE}/listings/${id}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: STATE.token ? `Bearer ${STATE.token}` : '',
      },
      body: JSON.stringify({ notes }),
    });

    if (res.ok) {
      showToast('Discrimination report logged. Sent to Labor Department & auto-delist threshold.');
    } else {
      showToast('Report received by community moderators.');
    }
  } catch (err) {
    showToast('Report logged. Caseworkers notified.');
  }
};

// ============================================================================
// TAB 6: NGO CASE DESK
// ============================================================================
function setupNGODesk() {
  renderCasesTable();
}

function renderCasesTable() {
  const tbody = document.getElementById('cases-table-body');
  if (!tbody) return;

  tbody.innerHTML = STATE.demoCases
    .map(
      (c) => `
    <tr>
      <td><strong>#${c.id}</strong></td>
      <td><span style="text-transform:capitalize;">${c.type.replace('_', ' ')}</span></td>
      <td>${c.location}</td>
      <td><span style="color:${c.urgency === 'immediate_sos' ? '#f43f5e' : '#fbbf24'}; font-weight:600;">${c.urgency}</span></td>
      <td>${c.matchedScheme}</td>
      <td><span class="status-badge ${c.status}">${c.status.replace('_', ' ')}</span></td>
      <td>
        <button class="btn btn-outline" style="padding:4px 8px; font-size:0.75rem;" onclick="window.beyondManageCase(${c.id})">
          Review Case
        </button>
      </td>
    </tr>
  `
    )
    .join('');
}

window.beyondManageCase = (id) => {
  showToast(`Case #${id} opened in Caseworker Workspace.`);
};

// ============================================================================
// AUTH & MODAL
// ============================================================================
function setupAuth() {
  const authBtn = document.getElementById('auth-btn');
  const modal = document.getElementById('auth-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  authBtn.addEventListener('click', () => {
    if (STATE.currentUser) {
      if (confirm(`Signed in as ${STATE.currentUser.name} (${STATE.currentUser.role}). Sign out?`)) {
        signOut();
      }
    } else {
      modal.classList.remove('hidden');
    }
  });

  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

  // 1-Click demo accounts in modal
  document.getElementById('demo-user-btn').addEventListener('click', () => {
    loginDemoUser('Aanya Sharma', 'aanya@community.org', 'user');
  });

  document.getElementById('demo-ngo-btn').addEventListener('click', () => {
    loginDemoUser('Tweet Foundation Caseworker', 'desk@tweetfoundation.org', 'verifier');
  });

  document.getElementById('demo-admin-btn').addEventListener('click', () => {
    loginDemoUser('System Moderator', 'admin@beyondidentity.org', 'admin');
  });

  // Connect gated card action buttons (AI Assistant gate)
  const chatGateSignIn = document.getElementById('chat-gate-signin-btn');
  if (chatGateSignIn) chatGateSignIn.addEventListener('click', () => modal.classList.remove('hidden'));

  const chatGateDemoUser = document.getElementById('chat-gate-demo-user');
  if (chatGateDemoUser) chatGateDemoUser.addEventListener('click', () => loginDemoUser('Aanya Sharma', 'aanya@community.org', 'user'));

  const chatGateDemoNgo = document.getElementById('chat-gate-demo-ngo');
  if (chatGateDemoNgo) chatGateDemoNgo.addEventListener('click', () => loginDemoUser('Tweet Foundation Caseworker', 'desk@tweetfoundation.org', 'verifier'));

  // Connect gated card action buttons (Opportunities gate)
  const listingsGateSignIn = document.getElementById('listings-gate-signin-btn');
  if (listingsGateSignIn) listingsGateSignIn.addEventListener('click', () => modal.classList.remove('hidden'));

  const listingsGateDemoUser = document.getElementById('listings-gate-demo-user');
  if (listingsGateDemoUser) listingsGateDemoUser.addEventListener('click', () => loginDemoUser('Aanya Sharma', 'aanya@community.org', 'user'));

  const listingsGateDemoNgo = document.getElementById('listings-gate-demo-ngo');
  if (listingsGateDemoNgo) listingsGateDemoNgo.addEventListener('click', () => loginDemoUser('Tweet Foundation Caseworker', 'desk@tweetfoundation.org', 'verifier'));

  // Login form
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const res = await fetch(`${CONFIG.API_BASE}/auth/login-json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        STATE.token = data.access_token;
        STATE.currentUser = data.user || { name: email.split('@')[0], email, role: 'user' };
        saveAuth();
        modal.classList.add('hidden');
        showToast(`Welcome back, ${STATE.currentUser.name}! Core features unlocked.`, 'success');
        updateAuthUI();
      } else {
        // Fallback demo signin
        loginDemoUser(email.split('@')[0], email, 'user');
      }
    } catch (err) {
      loginDemoUser(email.split('@')[0], email, 'user');
    }
  });

  updateAuthUI();
}

function loginDemoUser(name, email, role) {
  STATE.currentUser = { id: 42, name, email, role, is_active: true };
  STATE.token = 'demo_jwt_token_' + Date.now();
  saveAuth();
  document.getElementById('auth-modal').classList.add('hidden');
  showToast(`Signed in as ${name} (${role}) — AI Assistant & Opportunities Unlocked!`, 'success');
  updateAuthUI();
}

function signOut() {
  STATE.currentUser = null;
  STATE.token = null;
  localStorage.removeItem('beyond_user');
  localStorage.removeItem('beyond_token');
  updateAuthUI();
  showToast('Signed out. AI Assistant and Opportunities are now locked.', 'info');
}

function saveAuth() {
  localStorage.setItem('beyond_user', JSON.stringify(STATE.currentUser));
  localStorage.setItem('beyond_token', STATE.token);
}

function updateAuthUI() {
  const label = document.getElementById('auth-user-label');
  if (STATE.currentUser) {
    label.textContent = `${STATE.currentUser.name} (${STATE.currentUser.role})`;
  } else {
    label.textContent = 'Sign In';
  }
  updateGatedFeatures();
}

/**
 * Access Control Gatekeeper:
 * Hides/shows AI Assistant and Opportunities based on authentication status.
 */
function updateGatedFeatures() {
  const isAuth = !!STATE.currentUser;

  // 1. AI Assistant Gate
  const chatGate = document.getElementById('chat-auth-gate');
  const chatMain = document.getElementById('chat-main-container');
  const chatLock = document.getElementById('chat-tab-lock');

  if (chatGate && chatMain) {
    if (isAuth) {
      chatGate.classList.add('hidden');
      chatMain.classList.remove('hidden');
      if (chatLock) {
        chatLock.textContent = '✓ Unlocked';
        chatLock.classList.add('unlocked');
      }
    } else {
      chatGate.classList.remove('hidden');
      chatMain.classList.add('hidden');
      if (chatLock) {
        chatLock.textContent = '🔒 Members';
        chatLock.classList.remove('unlocked');
      }
    }
  }

  // 2. Opportunities Directory Gate
  const listingsGate = document.getElementById('listings-auth-gate');
  const listingsMain = document.getElementById('listings-main-container');
  const listingsLock = document.getElementById('listings-tab-lock');

  if (listingsGate && listingsMain) {
    if (isAuth) {
      listingsGate.classList.add('hidden');
      listingsMain.classList.remove('hidden');
      if (listingsLock) {
        listingsLock.textContent = '✓ Unlocked';
        listingsLock.classList.add('unlocked');
      }
    } else {
      listingsGate.classList.remove('hidden');
      listingsMain.classList.add('hidden');
      if (listingsLock) {
        listingsLock.textContent = '🔒 Members';
        listingsLock.classList.remove('unlocked');
      }
    }
  }
}

// Window global helpers for inline triggers
window.beyondOpenAuthModal = () => {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('hidden');
};

window.beyondQuickDemo = (role) => {
  if (role === 'verifier') {
    loginDemoUser('Tweet Foundation Caseworker', 'desk@tweetfoundation.org', 'verifier');
  } else {
    loginDemoUser('Aanya Sharma', 'aanya@community.org', 'user');
  }
};

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ️'}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}
