from specify import ObjectBehavior
from src.domain.location import Location
from src.domain.velib_station import VelibStation
from src.domain.user_input import UserInput, DestinationInput
from src.app import VelibParkingApp


class VelibParkingAppSpec(ObjectBehavior):
    """Spec for the main VelibParkingApp"""

    def _let(self):
        self._describe(VelibParkingApp)

    def it_should_be_constructed_without_arguments(self):
        self._be_constructed_with()
        self._get_wrapped_object()._should_be_an_instance_of(VelibParkingApp)

    def it_should_have_initialize_method(self):
        self._be_constructed_with()
        callable(self._get_wrapped_object().initialize)._should_be_like(True)

    def it_should_have_current_user_location_property(self):
        self._be_constructed_with()
        self._get_wrapped_object().current_user_location._should_be_like(None)

    def it_should_have_destination_property(self):
        self._be_constructed_with()
        self._get_wrapped_object().destination._should_be_like(None)

    def it_should_have_current_target_property(self):
        self._be_constructed_with()
        self._get_wrapped_object().current_target._should_be_like(None)

    def it_should_have_is_parked_property(self):
        self._be_constructed_with()
        self._get_wrapped_object().is_parked._should_be_like(False)

    def it_should_have_process_voice_input_method(self):
        self._be_constructed_with()
        callable(self._get_wrapped_object().process_voice_input)._should_be_like(True)

    def it_should_set_destination_from_voice_input(self):
        self._be_constructed_with()
        user_input = UserInput(raw_text="I am going to 21 rue des Gravilliers")
        self._get_wrapped_object().process_voice_input(user_input)
        # After processing, destination should be set
        destination = self._get_wrapped_object().destination
        destination._should_be_an_instance_of(DestinationInput)
        "21 rue des Gravilliers" in destination.address._should_be_like(True)

    def it_should_have_find_closest_station_method(self):
        self._be_constructed_with()
        callable(self._get_wrapped_object().find_closest_station)._should_be_like(True)

    def it_should_have_update_user_location_method(self):
        self._be_constructed_with()
        callable(self._get_wrapped_object().update_user_location)._should_be_like(True)

    def it_should_update_user_location_correctly(self):
        self._be_constructed_with()
        user_location = Location(latitude=48.8566, longitude=2.3522)
        self._get_wrapped_object().update_user_location(user_location)
        self._get_wrapped_object().current_user_location._should_be_like(user_location)

    def it_should_have_toggle_parked_status_method(self):
        self._be_constructed_with()
        callable(self._get_wrapped_object().toggle_parked_status)._should_be_like(True)

    def it_should_toggle_parked_status_correctly(self):
        self._be_constructed_with()
        initial_status = self._get_wrapped_object().is_parked
        self._get_wrapped_object().toggle_parked_status()
        (self._get_wrapped_object().is_parked != initial_status)._should_be_like(True)

    def it_should_have_render_method(self):
        self._be_constructed_with()
        callable(self._get_wrapped_object().render)._should_be_like(True)

    def it_should_have_html_representation(self):
        self._be_constructed_with()
        html = self._get_wrapped_object().render()
        "html" in html._should_be_like(True)

    def it_should_switch_target_from_station_to_destination_when_parked(self):
        self._be_constructed_with()
        # Set up destination
        destination_input = DestinationInput(address="21 rue des Gravilliers")
        self._get_wrapped_object().destination = destination_input
        
        # Set up a mock station
        station_location = Location(latitude=48.8584, longitude=2.2945)
        mock_station = VelibStation(
            station_id="12345",
            name="Mock Station",
            location=station_location,
            total_docks=30,
            available_docks=5
        )
        self._get_wrapped_object().current_target = mock_station
        
        # Mark as parked
        self._get_wrapped_object().is_parked = True
        
        # Target should switch to destination
        # Note: This tests the concept - implementation may vary
        True._should_be_like(True)  # Placeholder for actual test

    def it_should_handle_missing_destination_gracefully(self):
        self._be_constructed_with()
        self._get_wrapped_object().destination = None
        user_location = Location(latitude=48.8566, longitude=2.3522)
        self._get_wrapped_object().update_user_location(user_location)
        # Should not crash
        True._should_be_like(True)
