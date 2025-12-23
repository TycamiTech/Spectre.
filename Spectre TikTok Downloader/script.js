const elements = {
    input: document.getElementById('tiktokUrl'),
    pasteBtn: document.getElementById('pasteBtn'),
    clearBtn: document.getElementById('clearBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    statusMessage: document.getElementById('statusMessage'),
    resultSection: document.getElementById('resultSection'),
    videoCover: document.getElementById('videoCover'),
    authorAvatar: document.getElementById('authorAvatar'),
    authorName: document.getElementById('authorName'),
    videoDesc: document.getElementById('videoDesc'),
    playCount: document.getElementById('playCount'),
    likeCount: document.getElementById('likeCount'),
    downloadNoWm: document.getElementById('downloadNoWm'),
    downloadAudio: document.getElementById('downloadAudio'),
    cursorDot: document.querySelector('.cursor-dot'),
    cursorOutline: document.querySelector('.cursor-outline')
};

// Cursor Logic
// Cursor Logic
let cursorX = 0, cursorY = 0;
let outlineX = 0, outlineY = 0;

window.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;

    elements.cursorDot.style.left = `${cursorX}px`;
    elements.cursorDot.style.top = `${cursorY}px`;
});

function animateCursor() {
    // Lerp: a + (b - a) * t
    const speed = 0.15;

    outlineX += (cursorX - outlineX) * speed;
    outlineY += (cursorY - outlineY) * speed;

    elements.cursorOutline.style.left = `${outlineX}px`;
    elements.cursorOutline.style.top = `${outlineY}px`;

    requestAnimationFrame(animateCursor);
}
animateCursor();

// Input interaction
elements.input.addEventListener('input', () => {
    if (elements.input.value.length > 0) {
        elements.pasteBtn.classList.add('hidden');
        elements.clearBtn.classList.remove('hidden');
    } else {
        elements.pasteBtn.classList.remove('hidden');
        elements.clearBtn.classList.add('hidden');
    }
    elements.statusMessage.textContent = '';
});

elements.pasteBtn.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        elements.input.value = text;
        elements.input.dispatchEvent(new Event('input'));
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
    }
});

elements.clearBtn.addEventListener('click', () => {
    elements.input.value = '';
    elements.input.dispatchEvent(new Event('input'));
    elements.resultSection.classList.remove('show');
    setTimeout(() => elements.resultSection.classList.add('hidden'), 500);
});

// Download Logic
elements.downloadBtn.addEventListener('click', handleDownload);

async function handleDownload() {
    const url = elements.input.value.trim();

    if (!url) {
        showError('Please paste a TikTok link first.');
        return;
    }

    if (!isValidTikTokUrl(url)) {
        showError('Invalid TikTok URL. Please check and try again.');
        return;
    }

    setLoading(true);
    elements.statusMessage.textContent = '';
    elements.resultSection.classList.remove('show');
    elements.resultSection.classList.add('hidden');

    try {
        // Using tikwm.com public API
        // Note: This API handles cross-origin requests usually, but might require a proxy in some environments.
        const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.code === 0) {
            displayResult(data.data);
        } else {
            showError(data.msg || 'Could not fetch video. Please make sure the link is correct and public.');
        }

    } catch (error) {
        console.error(error);
        showError('Network error. Please try again later.');
    } finally {
        setLoading(false);
    }
}

function isValidTikTokUrl(url) {
    const regex = /tiktok\.com/i;
    return regex.test(url);
}

function setLoading(isLoading) {
    if (isLoading) {
        elements.downloadBtn.classList.add('loading');
        elements.downloadBtn.disabled = true;
    } else {
        elements.downloadBtn.classList.remove('loading');
        elements.downloadBtn.disabled = false;
    }
}

function showError(msg) {
    elements.statusMessage.textContent = msg;
    elements.statusMessage.style.color = '#ff4444';
}

function displayResult(data) {
    // Populate Data
    elements.videoCover.src = data.cover;
    elements.authorAvatar.src = data.author.avatar;
    elements.authorName.textContent = data.author.nickname;
    elements.videoDesc.textContent = data.title;
    elements.playCount.textContent = formatNumber(data.play_count);
    elements.likeCount.textContent = formatNumber(data.digg_count);

    // Set Download Links with Direct Download Logic
    setupDownloadButton(elements.downloadNoWm, data.play, `tiktok_${data.id}.mp4`, 'Download Video');
    setupDownloadButton(elements.downloadAudio, data.music, `tiktok_${data.id}.mp3`, 'Download Audio');

    // Show Section
    elements.resultSection.classList.remove('hidden');
    // Allow reflow
    void elements.resultSection.offsetWidth;
    elements.resultSection.classList.add('show');
}

function setupDownloadButton(btnElement, url, filename, defaultText) {
    // Reset button state
    btnElement.href = url;
    btnElement.innerHTML = btnElement.innerHTML.replace(/Downloading\.\.\.|Download (Video|Audio)/, defaultText);
    btnElement.style.pointerEvents = 'auto';
    btnElement.style.opacity = '1';

    // Remove old event listeners by cloning
    const newBtn = btnElement.cloneNode(true);
    btnElement.parentNode.replaceChild(newBtn, btnElement);

    // Update reference in elements object might be needed if we rely on global reference, 
    // but here we can just target the new node or update our elements object.
    // To be safe/simple, let's update the global elements reference:
    if (btnElement.id === 'downloadNoWm') elements.downloadNoWm = newBtn;
    if (btnElement.id === 'downloadAudio') elements.downloadAudio = newBtn;

    newBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const originalContent = newBtn.innerHTML;
        const loadingContent = `<span class="btn-loader" style="width: 16px; height: 16px; border-color: #000; border-bottom-color: transparent; display: inline-block;"></span> Downloading...`;

        newBtn.innerHTML = loadingContent;
        newBtn.style.pointerEvents = 'none'; // Prevent double click

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = filename;

            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: Try to open in new tab/window which usually triggers download for some browsers
            window.open(url, '_blank');
        } finally {
            newBtn.innerHTML = originalContent;
            newBtn.style.pointerEvents = 'auto';
        }
    });
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num;
}
