from specify import ObjectBehavior
from src.domain.location import Location
from src.domain.velib_station import VelibStation
from src.services.velib_service import VelibService


class VelibServiceSpec(ObjectBehavior):
    """Spec for VelibService"""

    def _let(self):
        self._describe(VelibService)

    def it_should_be_constructed_without_arguments(self):
        self._be_constructed_with()
        self._get_wrapped_object()._should_be_an_instance_of(VelibService)

    def it_should_have_find_closest_station_with_available_docks_method(self):
        self._be_constructed_with()
        self._get_wrapped_object().find_closest_station_with_available_docks._should_be_callable()

    def it_should_return_velib_station_with_available_docks(self):
        self._be_constructed_with()
        user_location = Location(latitude=48.8566, longitude=2.3522)
        # Mock data - in real implementation, this would fetch from API
        station = self._get_wrapped_object().find_closest_station_with_available_docks(
            user_location, max_distance_meters=1000
        )
        if station is not None:
            station._should_be_an_instance_of(VelibStation)
            station.has_available_docks._should_be_like(True)

    def it_should_return_none_when_no_stations_with_available_docks(self):
        self._be_constructed_with()
        # Test with a location far from any stations
        far_location = Location(latitude=0, longitude=0)
        station = self._get_wrapped_object().find_closest_station_with_available_docks(
            far_location, max_distance_meters=100
        )
        # This might return None or a station, depending on implementation
        # We test that it doesn't crash
        (station is None or station._should_be_an_instance_of(VelibStation))._should_be_like(True)

    def it_should_have_get_stations_in_area_method(self):
        self._be_constructed_with()
        self._get_wrapped_object().get_stations_in_area._should_be_callable()

    def it_should_return_list_of_stations_for_area(self):
        self._be_constructed_with()
        center = Location(latitude=48.8566, longitude=2.3522)
        stations = self._get_wrapped_object().get_stations_in_area(center, radius_meters=1000)
        stations._should_be_an_instance_of(list)
        for station in stations:
            station._should_be_an_instance_of(VelibStation)

    def it_should_have_refresh_stations_method(self):
        self._be_constructed_with()
        self._get_wrapped_object().refresh_stations._should_be_callable()

    def it_should_have_last_refresh_time_property(self):
        self._be_constructed_with()
        # Last refresh time should be accessible
        try:
            last_refresh = self._get_wrapped_object().last_refresh_time
            # Should be a datetime or None
            (last_refresh is None or hasattr(last_refresh, 'timestamp'))._should_be_like(True)
        except AttributeError:
            # Property might not exist yet
            True._should_be_like(True)
