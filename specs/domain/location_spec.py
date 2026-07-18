from specify import ObjectBehavior
from src.domain.location import Location


class LocationSpec(ObjectBehavior):
    """Spec for Location domain model"""

    def _let(self):
        self._describe(Location)

    def it_should_be_constructed_with_latitude_and_longitude(self):
        self._be_constructed_with(latitude=48.8566, longitude=2.3522)
        self._get_wrapped_object()._should_be_an_instance_of(Location)

    def it_should_store_latitude_correctly(self):
        self._be_constructed_with(latitude=48.8566, longitude=2.3522)
        self._get_wrapped_object().latitude._should_be_like(48.8566)

    def it_should_store_longitude_correctly(self):
        self._be_constructed_with(latitude=48.8566, longitude=2.3522)
        self._get_wrapped_object().longitude._should_be_like(2.3522)

    def it_should_calculate_distance_to_another_location_in_meters(self):
        self._be_constructed_with(latitude=48.8566, longitude=2.3522)
        other_location = Location(latitude=48.8584, longitude=2.2945)
        distance = self._get_wrapped_object().distance_to(other_location)
        # Distance between Notre Dame and Eiffel Tower is approximately 4.2km
        distance._should_be_like(4200.0, delta=100)

    def it_should_calculate_bearing_to_another_location_in_degrees(self):
        self._be_constructed_with(latitude=48.8566, longitude=2.3522)
        # Location slightly to the east
        other_location = Location(latitude=48.8566, longitude=2.3622)
        bearing = self._get_wrapped_object().bearing_to(other_location)
        # Should be approximately 90 degrees (east)
        bearing._should_be_like(90.0, delta=5)

    def it_should_have_string_representation(self):
        self._be_constructed_with(latitude=48.8566, longitude=2.3522)
        str_repr = str(self._get_wrapped_object())
        str_repr._should_be_like("Location(latitude=48.8566, longitude=2.3522)")

    def it_should_be_equal_to_location_with_same_coordinates(self):
        self._be_constructed_with(latitude=48.8566, longitude=2.3522)
        other_location = Location(latitude=48.8566, longitude=2.3522)
        self._get_wrapped_object()._should_be_like(other_location)

    def it_should_not_be_equal_to_location_with_different_coordinates(self):
        self._be_constructed_with(latitude=48.8566, longitude=2.3522)
        other_location = Location(latitude=48.8584, longitude=2.2945)
        location = self._get_wrapped_object()
        (location == other_location)._should_be_like(False)
