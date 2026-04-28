document.addEventListener('DOMContentLoaded', () => {
    // Tab Navigation
    const navLinks = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked link
            link.classList.add('active');

            // Show target section
            const targetId = link.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Accordion Logic
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            // Toggle current item
            const isActive = item.classList.contains('active');
            
            // Close all items
            accordionItems.forEach(i => i.classList.remove('active'));

            // If it wasn't active before, open it
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Open first accordion item by default
    if (accordionItems.length > 0) {
        accordionItems[0].classList.add('active');
    }

    // Chatbot Logic
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatHistory = document.getElementById('chat-history');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');

    const responses = {
        'register': 'You can register to vote online, by mail, or in person at your local election office. Would you like me to guide you to the eligibility requirements?',
        'eligibility': 'To vote in federal elections, you must be a U.S. citizen, meet your state\'s residency requirements, and be 18 years old on or before Election Day.',
        'dates': 'Key dates: Registration deadline is October 15. Early voting starts October 20. Election Day is November 5.',
        'mail': 'For mail-in voting, you must request a ballot from your state election office. Once received, fill it out and mail it back or drop it at a designated dropbox before the deadline on November 5.',
        'where': 'You can find your polling place on your state\'s local election website or by checking the voter information card sent to you by mail.',
        'default': 'I am a simple interactive guide. I can help with registration, key dates, mail-in voting, and general eligibility. Could you rephrase your question?'
    };

    function addMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = isUser ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = text;
        
        msgDiv.appendChild(avatar);
        msgDiv.appendChild(content);
        
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function showTypingIndicator() {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot typing';
        msgDiv.id = 'typing-indicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = '<i class="fa-solid fa-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content typing-indicator';
        content.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        
        msgDiv.appendChild(avatar);
        msgDiv.appendChild(content);
        
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        return msgDiv;
    }

    function getBotResponse(input) {
        const lowerInput = input.toLowerCase();
        let matchedKey = 'default';
        
        for (const key in responses) {
            if (key !== 'default' && lowerInput.includes(key)) {
                matchedKey = key;
                break;
            }
        }
        
        return responses[matchedKey];
    }

    function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message
        addMessage(text, true);
        chatInput.value = '';

        // Show typing indicator
        const typingIndicator = showTypingIndicator();

        // Simulate network delay
        setTimeout(() => {
            typingIndicator.remove();
            const responseText = getBotResponse(text);
            addMessage(responseText, false);
        }, 1000);
    }

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chatInput.value = btn.textContent;
            handleSend();
        });
    });
});
