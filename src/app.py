"""
VelibParkingApp - Main application class.
Web app for iPhone that helps find the closest Velib dock with available parking spots.
"""

from typing import Optional, List, Callable, Dict, Any
from datetime import datetime
from .domain.location import Location
from .domain.velib_station import VelibStation
from .domain.user_input import UserInput, DestinationInput
from .services.geolocation_service import GeolocationService
from .services.orientation_service import OrientationService
from .services.voice_input_service import VoiceInputService
from .services.llm_service import LLMService
from .services.velib_service import VelibService
from .ui.compass import Compass
from .ui.distance_display import DistanceDisplay
from .ui.voice_input_button import VoiceInputButton


class VelibParkingApp:
    """
    Main application class for Velib Parking App.
    
    Coordinates all services and UI components to provide the complete functionality.
    """
    
    def __init__(self):
        """Initialize the Velib Parking App."""
        # Initialize services
        self._geolocation_service = GeolocationService()
        self._orientation_service = OrientationService()
        self._voice_input_service = VoiceInputService()
        self._llm_service = LLMService()
        self._velib_service = VelibService()
        
        # Initialize UI components
        self._compass = Compass()
        self._distance_display = DistanceDisplay()
        self._voice_input_button = VoiceInputButton()
        
        # State
        self._current_user_location: Optional[Location] = None
        self._destination: Optional[DestinationInput] = None
        self._current_target: Optional[VelibStation] = None
        self._is_parked: bool = False
        self._is_initialized: bool = False
        
        # Event callbacks
        self._on_state_change: Optional[Callable[[], None]] = None
        
        # Setup event handlers
        self._setup_event_handlers()
    
    def initialize(self) -> None:
        """
        Initialize the app and start all services.
        """
        if self._is_initialized:
            return
        
        # Start geolocation
        self._geolocation_service.start_watching_position()
        
        # Start orientation
        self._orientation_service.start_listening()
        
        # Setup voice input callbacks
        self._voice_input_service.on_transcript = self._handle_transcript
        self._voice_input_service.on_error = self._handle_voice_error
        
        # Setup geolocation callbacks
        self._geolocation_service.on_location_change = self._handle_location_change
        self._geolocation_service.on_error = self._handle_geolocation_error
        
        # Setup orientation callbacks
        self._orientation_service.on_heading_change = self._handle_heading_change
        
        # Setup Velib service callbacks
        self._velib_service.on_stations_updated = self._handle_stations_updated
        self._velib_service.on_error = self._handle_velib_error
        
        # Get initial location
        self.update_user_location(self._geolocation_service.get_current_location())
        
        self._is_initialized = True
        
        # Trigger initial state change
        if self._on_state_change:
            self._on_state_change()
    
    @property
    def current_user_location(self) -> Optional[Location]:
        """Get the current user location."""
        return self._current_user_location
    
    @property
    def destination(self) -> Optional[DestinationInput]:
        """Get the current destination."""
        return self._destination
    
    @destination.setter
    def destination(self, value: Optional[DestinationInput]) -> None:
        """Set the destination."""
        self._destination = value
        if self._on_state_change:
            self._on_state_change()
    
    @property
    def current_target(self) -> Optional[VelibStation]:
        """Get the current target (station or destination)."""
        return self._current_target
    
    @current_target.setter
    def current_target(self, value: Optional[VelibStation]) -> None:
        """Set the current target."""
        self._current_target = value
        if self._current_target:
            self._compass.target_location = self._current_target.location
        else:
            self._compass.target_location = None
        if self._on_state_change:
            self._on_state_change()
    
    @property
    def is_parked(self) -> bool:
        """Check if the user has parked."""
        return self._is_parked
    
    @is_parked.setter
    def is_parked(self, value: bool) -> None:
        """Set the parked status."""
        self._is_parked = value
        self._update_target_based_on_parked_status()
        if self._on_state_change:
            self._on_state_change()
    
    @property
    def on_state_change(self) -> Optional[Callable[[], None]]:
        """Get the state change callback."""
        return self._on_state_change
    
    @on_state_change.setter
    def on_state_change(self, callback: Optional[Callable[[], None]]) -> None:
        """Set the state change callback."""
        self._on_state_change = callback
    
    def _setup_event_handlers(self) -> None:
        """Setup internal event handlers."""
        pass
    
    def _handle_transcript(self, transcript: str) -> None:
        """
        Handle transcript from voice input.
        
        Args:
            transcript: The recognized text from voice input
        """
        # Create user input and process it
        user_input = UserInput(raw_text=transcript)
        self.process_voice_input(user_input)
    
    def _handle_voice_error(self, error: str) -> None:
        """
        Handle voice input errors.
        
        Args:
            error: Error message
        """
        print(f"Voice input error: {error}")
    
    def _handle_location_change(self, location: Location) -> None:
        """
        Handle location changes.
        
        Args:
            location: New user location
        """
        self.update_user_location(location)
    
    def _handle_geolocation_error(self, error: str) -> None:
        """
        Handle geolocation errors.
        
        Args:
            error: Error message
        """
        print(f"Geolocation error: {error}")
    
    def _handle_heading_change(self, heading: float) -> None:
        """
        Handle device heading changes.
        
        Args:
            heading: New device heading in degrees
        """
        self._compass.current_heading = heading
        if self._on_state_change:
            self._on_state_change()
    
    def _handle_stations_updated(self, stations: List[VelibStation]) -> None:
        """
        Handle station data updates.
        
        Args:
            stations: Updated list of Velib stations
        """
        # Find the closest station with available docks
        if self._current_user_location:
            closest_station = self._velib_service.find_closest_station_with_available_docks(
                self._current_user_location
            )
            if closest_station:
                self.current_target = closest_station
        
        if self._on_state_change:
            self._on_state_change()
    
    def _handle_velib_error(self, error: str) -> None:
        """
        Handle Velib service errors.
        
        Args:
            error: Error message
        """
        print(f"Velib service error: {error}")
    
    def update_user_location(self, location: Location) -> None:
        """
        Update the user's current location.
        
        Args:
            location: New user location
        """
        self._current_user_location = location
        self._compass.current_user_location = location
        
        # Update distance display if we have a target
        if self._current_target and self._current_user_location:
            self._distance_display.distance = self._current_user_location.distance_to(
                self._current_target.location
            )
        
        # Find closest station with available docks
        if not self._is_parked:
            closest_station = self._velib_service.find_closest_station_with_available_docks(
                self._current_user_location
            )
            if closest_station:
                self.current_target = closest_station
        
        if self._on_state_change:
            self._on_state_change()
    
    def process_voice_input(self, user_input: UserInput) -> None:
        """
        Process voice input to extract destination.
        
        Args:
            user_input: UserInput object with raw text
        """
        # Use LLM service to extract destination
        destination = self._llm_service.extract_destination(user_input)
        self.destination = destination
        
        # Reset parked status when new destination is set
        self.is_parked = False
        
        # Find closest station to destination
        if destination and self._current_user_location:
            self._find_station_for_destination()
        
        if self._on_state_change:
            self._on_state_change()
    
    def _find_station_for_destination(self) -> None:
        """
        Find the closest station with available docks to the destination.
        """
        if not self._current_user_location:
            return
            
        # In a real implementation, we would geocode the destination address
        # to get its location, then find the closest station to that location.
        # For demo purposes, we'll just find the closest station to the user.
        
        closest_station = self._velib_service.find_closest_station_with_available_docks(
            self._current_user_location
        )
        
        if closest_station:
            self.current_target = closest_station
    
    def find_closest_station(self) -> Optional[VelibStation]:
        """
        Find the closest Velib station with available docks.
        
        Returns:
            Closest VelibStation with available docks, or None
        """
        if not self._current_user_location:
            return None
            
        return self._velib_service.find_closest_station_with_available_docks(
            self._current_user_location
        )
    
    def toggle_parked_status(self) -> None:
        """
        Toggle the parked status.
        
        When parked, the target switches from the station to the destination.
        """
        self.is_parked = not self._is_parked
    
    def _update_target_based_on_parked_status(self) -> None:
        """
        Update the target based on whether the user is parked or not.
        
        If parked: target becomes the destination
        If not parked: target becomes the closest station with available docks
        """
        if self._is_parked and self._destination:
            # In a real implementation, we would geocode the destination address
            # For demo, we can't set a location for the destination input,
            # so we'll just keep the current station as target
            pass
        else:
            # Find closest station with available docks
            if self._current_user_location:
                closest_station = self._velib_service.find_closest_station_with_available_docks(
                    self._current_user_location
                )
                if closest_station:
                    self.current_target = closest_station
    
    def render(self) -> str:
        """
        Render the complete app as HTML.
        
        Returns:
            Complete HTML representation of the app
        """
        # Render all UI components
        compass_html = self._compass.render()
        distance_html = self._distance_display.render()
        voice_button_html = self._voice_input_button.render()
        
        html = f'''
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Velib Parking Guide</title>
            <style>
                {self._get_css()}
            </style>
        </head>
        <body>
            <div class="app-container">
                <header class="app-header">
                    <h1>🚲 Velib Parking Guide</h1>
                    <p>Find the closest station with available docks</p>
                </header>
                
                <main class="app-main">
                    {compass_html}
                    {distance_html}
                </main>
                
                <footer class="app-footer">
                    {voice_button_html}
                </footer>
            </div>
            
            <script>
                {self._get_javascript()}
            </script>
        </body>
        </html>
        '''
        
        return html
    
    def _get_css(self) -> str:
        """
        Get complete CSS for the app.
        
        Returns:
            Complete CSS string for the app
        """
        return f'''
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }}
        
        .app-container {{
            max-width: 100%;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }}
        
        .app-header {{
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
        }}
        
        .app-header h1 {{
            color: #667eea;
            font-size: 24px;
        }}
        
        .app-main {{
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }}
        
        .app-footer {{
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            text-align: center;
            margin-top: auto;
        }}
        
        {self._compass.get_css()}
        {self._distance_display.get_css()}
        {self._voice_input_button.get_css()}
        '''
    
    def _get_javascript(self) -> str:
        """
        Get complete JavaScript for the app.
        
        Returns:
            Complete JavaScript string for the app
        """
        return f'''
        // Initialize services when page loads
        document.addEventListener('DOMContentLoaded', function() {{
            // Connect voice button to voice input service
            const voiceButton = document.querySelector('.voice-input-button');
            if (voiceButton) {{
                voiceButton.addEventListener('click', function() {{
                    // Toggle recording state
                    const isRecording = voiceButton.classList.contains('recording');
                    
                    if (isRecording) {{
                        voiceButton.classList.remove('recording');
                        // In production: voiceInputService.stopRecording();
                    }} else {{
                        voiceButton.classList.add('recording');
                        // In production: voiceInputService.startRecording();
                        
                        // Simulate receiving transcript after 2 seconds
                        setTimeout(function() {{
                            voiceButton.classList.remove('recording');
                            alert('Voice input received! In production, this would process your destination.');
                        }}, 2000);
                    }}
                }});
            }}
        }});
        
        {self._voice_input_button.get_javascript()}
        '''
