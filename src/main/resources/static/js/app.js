document.addEventListener("DOMContentLoaded", () => {
    // --- Elements ---
    const videoElem = document.getElementById("webcam-preview");
    const btnCamera = document.getElementById("btn-camera");
    const btnRecord = document.getElementById("btn-record");
    const btnDownload = document.getElementById("btn-download");
    const btnVoice = document.getElementById("btn-voice");
    
    const prompterContainer = document.getElementById("prompter-container");
    const dragHandle = document.getElementById("drag-handle");
    const prompterText = document.getElementById("prompter-text");
    
    const fontSizeInput = document.getElementById("font-size");
    const scrollSpeedInput = document.getElementById("scroll-speed");

    // --- State ---
    let stream = null;
    let mediaRecorder = null;
    let recordedChunks = [];
    let isRecording = false;
    let fileUrl = null;

    let isVoiceTracking = false;
    let recognition = null;
    
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;

    // --- Camera Initialization ---
    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoElem.srcObject = stream;
            btnCamera.classList.add('btn-success');
            btnCamera.classList.remove('btn-primary');
        } catch (err) {
            console.error("Error accessing camera: ", err);
            alert("Could not access the camera. Please ensure permissions are granted.");
        }
    }

    btnCamera.addEventListener('click', () => {
        if (!stream) {
            startCamera();
        } else {
            // Stop camera
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            videoElem.srcObject = null;
            btnCamera.classList.add('btn-primary');
            btnCamera.classList.remove('btn-success');
        }
    });

    // --- Video Recording ---
    btnRecord.addEventListener('click', () => {
        if (!stream) {
            alert("Please start the camera first!");
            return;
        }

        if (!isRecording) {
            // Start recording
            recordedChunks = [];
            let options = { mimeType: 'video/webm; codecs=vp9' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/webm; codecs=vp8' };
            }
            mediaRecorder = new MediaRecorder(stream, options);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                if (fileUrl) URL.revokeObjectURL(fileUrl);
                fileUrl = URL.createObjectURL(blob);
                
                // Show download button
                btnDownload.style.display = 'inline-block';
                
                // Reset button style
                btnRecord.innerHTML = '<i class="fa-solid fa-circle"></i> Record';
                btnRecord.classList.remove('recording');
            };

            mediaRecorder.start();
            isRecording = true;
            btnRecord.innerHTML = '<i class="fa-solid fa-stop"></i> Stop';
            btnRecord.classList.add('recording');
            btnDownload.style.display = 'none';
        } else {
            // Stop recording
            mediaRecorder.stop();
            isRecording = false;
        }
    });

    // --- Download Recording ---
    btnDownload.addEventListener('click', () => {
        if (fileUrl) {
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = fileUrl;
            // Add a proper timestamp to the file name
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            a.download = `AuraPrompter_${timestamp}.webm`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(fileUrl);
            fileUrl = null;
            btnDownload.style.display = 'none';
        }
    });

    // --- Voice Recognition & Tracking ---
    // Use Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            isVoiceTracking = true;
            btnVoice.classList.add('track-active');
            btnVoice.innerHTML = '<i class="fa-solid fa-microphone-lines"></i> Listening...';
        };

        recognition.onresult = (event) => {
            // We can scroll down slightly when speaking is detected
            // For a mature teleprompter, this would match exact words.
            // Here, we simply auto-scroll down relative to voice speed.
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    // Final sentence
                    prompterText.scrollBy({ top: 40, behavior: 'smooth' });
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            if (interimTranscript.length > 0) {
                // If they are speaking actively, bump the scroll slightly
                prompterText.scrollBy({ top: 2 * parseInt(scrollSpeedInput.value), behavior: 'smooth' });
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error: ", event.error);
        };

        recognition.onend = () => {
            // If it was stopped unintentionally, restart it
            if (isVoiceTracking) {
                try {
                    recognition.start();
                } catch(e) {}
            }
        };
    } else {
        btnVoice.disabled = true;
        btnVoice.title = "Voice API not supported in this browser.";
    }

    btnVoice.addEventListener('click', () => {
        if (!recognition) return;

        if (!isVoiceTracking) {
            recognition.start();
        } else {
            isVoiceTracking = false;
            recognition.stop();
            btnVoice.classList.remove('track-active');
            btnVoice.innerHTML = '<i class="fa-solid fa-microphone"></i> Track Voice';
        }
    });

    // --- Settings / Font Size ---
    fontSizeInput.addEventListener('input', (e) => {
        prompterText.style.fontSize = `${e.target.value}px`;
    });

    // --- Draggable Teleprompter Container ---
    dragHandle.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === dragHandle) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            // Allow dragging anywhere
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, prompterContainer);
        }
    }

    function setTranslate(xPos, yPos, el) {
        // Transform the element
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0) translateX(-50%)`;
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    // Attempt to start camera right away for best UX
    startCamera();
});
