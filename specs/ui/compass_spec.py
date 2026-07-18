from specify import ObjectBehavior
from src.domain.location import Location
from src.domain.velib_station import VelibStation
from src.ui.compass import Compass


class CompassSpec(ObjectBehavior):
    """Spec for Compass UI component"""

    def _let(self):
        self._describe(Compass)

    def it_should_be_constructed_with_target_location(self):
        target_location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(target_location=target_location)
        self._get_wrapped_object()._should_be_an_instance_of(Compass)

    def it_should_store_target_location(self):
        target_location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(target_location=target_location)
        self._get_wrapped_object().target_location._should_be_like(target_location)

    def it_should_have_current_user_location_property(self):
        target_location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(target_location=target_location)
        self._get_wrapped_object().current_user_location._should_be_like(None)

    def it_should_allow_setting_current_user_location(self):
        target_location = Location(latitude=48.8566, longitude=2.3522)
        user_location = Location(latitude=48.8584, longitude=2.2945)
        self._be_constructed_with(target_location=target_location)
        self._get_wrapped_object().current_user_location = user_location
        self._get_wrapped_object().current_user_location._should_be_like(user_location)

    def it_should_have_calculate_direction_method(self):
        target_location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(target_location=target_location)
        self._get_wrapped_object().calculate_direction._should_be_callable()

    def it_should_calculate_direction_between_0_and_360(self):
        target_location = Location(latitude=48.8566, longitude=2.3622)
        self._be_constructed_with(target_location=target_location)
        user_location = Location(latitude=48.8566, longitude=2.3522)
        self._get_wrapped_object().current_user_location = user_location
        direction = self._get_wrapped_object().calculate_direction()
        (0 <= direction <= 360)._should_be_like(True)

    def it_should_calculate_distance_to_target(self):
        target_location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(target_location=target_location)
        user_location = Location(latitude=48.8584, longitude=2.2945)
        self._get_wrapped_object().current_user_location = user_location
        distance = self._get_wrapped_object().distance_to_target
        distance._should_be_like(target_location.distance_to(user_location))

    def it_should_have_render_method(self):
        target_location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(target_location=target_location)
        self._get_wrapped_object().render._should_be_callable()

    def it_should_have_html_representation(self):
        target_location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(target_location=target_location)
        html = self._get_wrapped_object().render()
        "compass" in html._should_be_like(True)

    def it_should_show_direction_to_station(self):
        station_location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(target_location=station_location)
        user_location = Location(latitude=48.8566, longitude=2.3422)
        self._get_wrapped_object().current_user_location = user_location
        direction = self._get_wrapped_object().calculate_direction()
        # Should point west (270 degrees) since station is west of user
        (265 <= direction <= 275)._should_be_like(True)
