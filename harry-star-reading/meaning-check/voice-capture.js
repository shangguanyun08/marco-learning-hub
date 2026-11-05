/* Twenty-second microphone capture; all media tracks released on stop/cancel. */
(function(){
class VoiceCapture {
    callbacks;
    recorder = null;
    stream = null;
    timer;
    cancelled = false;
    stopping = false;
    constructor(callbacks) {
        this.callbacks = callbacks;
    }
    async start() {
        try {
            if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
                throw new Error("This browser cannot record audio. Open this page in Safari or Chrome, or use keyboard dictation below.");
            }
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (this.cancelled) {
                this.release();
                return;
            }
            const mimeType = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"].find(type => MediaRecorder.isTypeSupported(type));
            this.recorder = new MediaRecorder(this.stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 64000 });
            const chunks = [];
            this.recorder.ondataavailable = event => {
                if (event.data.size)
                    chunks.push(event.data);
            };
            this.recorder.onerror = () => this.fail("Recording was interrupted. Please tap Check and try again.");
            this.recorder.onstop = () => {
                this.release();
                if (this.cancelled)
                    return;
                const audio = new Blob(chunks, { type: this.recorder?.mimeType || chunks[0]?.type });
                if (!audio.size) {
                    this.fail("The recording was empty. Please tap Check and say the meaning again.");
                    return;
                }
                this.cancelled = true;
                this.callbacks.onStop(audio);
            };
            this.stream.getTracks().forEach(track => track.addEventListener("ended", () => {
                if (!this.stopping && !this.cancelled)
                    this.fail("The microphone was interrupted. Please try again.");
            }));
            this.recorder.start();
            this.timer = setTimeout(() => this.stop(), 20000);
            this.callbacks.onStart();
        }
        catch (error) {
            if (this.cancelled)
                return;
            const denied = error instanceof Error && ["NotAllowedError", "SecurityError"].includes(error.name);
            this.fail(denied
                ? "Allow microphone access for this page, then tap Check again. You can also use keyboard dictation below."
                : error instanceof Error && error.name === "NotFoundError"
                    ? "No microphone was found. You can use keyboard dictation or enter a short meaning below."
                    : error instanceof Error && error.name === "Error" ? error.message : "The microphone could not start. Please try again.");
        }
    }
    stop() {
        if (this.cancelled || this.stopping || !this.recorder)
            return;
        this.stopping = true;
        if (this.recorder.state !== "inactive")
            this.recorder.stop();
        this.release();
    }
    cancel() {
        this.cancelled = true;
        if (this.recorder?.state === "recording")
            this.recorder.stop();
        this.release();
    }
    release() {
        clearTimeout(this.timer);
        this.stream?.getTracks().forEach(track => track.stop());
    }
    fail(message) {
        if (this.cancelled)
            return;
        this.cancel();
        this.callbacks.onError(message);
    }
}

window.HarryMeaningVoiceCapture=VoiceCapture;
})();
