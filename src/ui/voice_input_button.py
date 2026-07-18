"""
VoiceInputButton UI component for Velib Parking App.
Button for triggering voice input.
"""

from typing import Optional, Callable


class VoiceInputButton:
    """
    Voice input button UI component.
    
    Button that starts/stop voice recording for destination input.
    """
    
    def __init__(self):
        """Initialize the voice input button."""
        self._is_recording: bool = False
        self._label: str = "Speak destination"
        self._on_click: Optional[Callable[[], None]] = None
        self._icon: str = "🎤"  # Microphone emoji
    
    @property
    def is_recording(self) -> bool:
        """Check if currently recording."""
        return self._is_recording
    
    @is_recording.setter
    def is_recording(self, value: bool) -> None:
        """Set the recording state."""
        self._is_recording = value
    
    @property
    def label(self) -> str:
        """Get the button label."""
        return self._label
    
    @label.setter
    def label(self, value: str) -> None:
        """Set the button label."""
        self._label = value
    
    @property
    def on_click(self) -> Optional[Callable[[], None]]:
        """Get the click callback."""
        return self._on_click
    
    @on_click.setter
    def on_click(self, callback: Optional[Callable[[], None]]) -> None:
        """Set the click callback."""
        self._on_click = callback
    
    @property
    def icon(self) -> str:
        """Get the button icon."""
        return self._icon
    
    @icon.setter
    def icon(self, value: str) -> None:
        """Set the button icon."""
        self._icon = value
    
    def render(self) -> str:
        """
        Render the voice input button as HTML.
        
        Returns:
            HTML representation of the voice input button
        """
        button_class = "voice-input-button"
        if self._is_recording:
            button_class += " recording"
        
        icon = "🎤" if not self._is_recording else "⏹️"
        label = "Recording..." if self._is_recording else self._label
        
        html = f'''
        <button class="{button_class}" onclick="{self._get_onclick_js()}">
            <span class="voice-button-icon">{icon}</span>
            <span class="voice-button-label">{label}</span>
        </button>
        '''
        
        return html
    
    def _get_onclick_js(self) -> str:
        """
        Get the JavaScript for the onclick handler.
        
        Returns:
            JavaScript code to execute on click
        """
        if self._on_click:
            return "voiceInputButtonOnClick()"  # Will be handled by JavaScript
        return ""
    
    def get_css(self) -> str:
        """
        Get CSS styles for the voice input button.
        
        Returns:
            CSS string for styling the voice input button
        """
        return '''
        .voice-input-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .voice-input-button:hover {
            background: #45a049;
            transform: scale(1.05);
        }
        
        .voice-input-button.recording {
            background: #f44336;
            animation: pulse 1s infinite;
        }
        
        .voice-input-button:disabled {
            background: #cccccc;
            cursor: not-allowed;
        }
        
        .voice-button-icon {
            font-size: 20px;
        }
        
        .voice-button-label {
            font-weight: bold;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        '''
    
    def get_javascript(self) -> str:
        """
        Get JavaScript code for the voice input button functionality.
        
        Returns:
            JavaScript code for voice input functionality
        """
        return '''
        function voiceInputButtonOnClick() {
            // This function would be connected to the voice input service
            console.log("Voice input button clicked");
            // Toggle recording state
            const button = event.target.closest('.voice-input-button');
            const isRecording = button.classList.contains('recording');
            
            if (isRecording) {
                // Stop recording
                button.classList.remove('recording');
                console.log("Recording stopped");
            } else {
                // Start recording
                button.classList.add('recording');
                console.log("Recording started");
            }
        }
        '''
