from specify import ObjectBehavior
from src.domain.velib_station import VelibStation
from src.domain.location import Location


class VelibStationSpec(ObjectBehavior):
    """Spec for VelibStation domain model"""

    def _let(self):
        self._describe(VelibStation)

    def it_should_be_constructed_with_required_fields(self):
        location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(
            station_id="12345",
            name="Station Notre Dame",
            location=location,
            total_docks=30,
            available_docks=5,
            available_bikes=15
        )
        self._get_wrapped_object()._should_be_an_instance_of(VelibStation)

    def it_should_store_station_id(self):
        location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(
            station_id="12345",
            name="Station Notre Dame",
            location=location,
            total_docks=30,
            available_docks=5
        )
        self._get_wrapped_object().station_id._should_be_like("12345")

    def it_should_store_name(self):
        location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(
            station_id="12345",
            name="Station Notre Dame",
            location=location,
            total_docks=30,
            available_docks=5
        )
        self._get_wrapped_object().name._should_be_like("Station Notre Dame")

    def it_should_store_location(self):
        location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(
            station_id="12345",
            name="Station Notre Dame",
            location=location,
            total_docks=30,
            available_docks=5
        )
        self._get_wrapped_object().location._should_be_like(location)

    def it_should_store_total_docks(self):
        location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(
            station_id="12345",
            name="Station Notre Dame",
            location=location,
            total_docks=30,
            available_docks=5
        )
        self._get_wrapped_object().total_docks._should_be_like(30)

    def it_should_store_available_docks(self):
        location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(
            station_id="12345",
            name="Station Notre Dame",
            location=location,
            total_docks=30,
            available_docks=5
        )
        self._get_wrapped_object().available_docks._should_be_like(5)

    def it_should_store_available_bikes(self):
        location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(
            station_id="12345",
            name="Station Notre Dame",
            location=location,
            total_docks=30,
            available_docks=5,
            available_bikes=15
        )
        self._get_wrapped_object().available_bikes._should_be_like(15)

    def it_should_have_has_available_docks_property(self):
        location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(
            station_id="12345",
            name="Station Notre Dame",
            location=location,
            total_docks=30,
            available_docks=5
        )
        self._get_wrapped_object().has_available_docks._should_be_like(True)

    def it_should_have_has_available_docks_false_when_no_docks(self):
        location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(
            station_id="12345",
            name="Station Notre Dame",
            location=location,
            total_docks=30,
            available_docks=0
        )
        self._get_wrapped_object().has_available_docks._should_be_like(False)

    def it_should_calculate_distance_from_location(self):
        station_location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(
            station_id="12345",
            name="Station Notre Dame",
            location=station_location,
            total_docks=30,
            available_docks=5
        )
        user_location = Location(latitude=48.8584, longitude=2.2945)
        distance = self._get_wrapped_object().distance_from(user_location)
        distance._should_be_like(station_location.distance_to(user_location))

    def it_should_have_string_representation(self):
        location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(
            station_id="12345",
            name="Station Notre Dame",
            location=location,
            total_docks=30,
            available_docks=5
        )
        str_repr = str(self._get_wrapped_object())
        "12345" in str_repr._should_be_like(True)
        "Station Notre Dame" in str_repr._should_be_like(True)

    def it_should_be_equal_to_station_with_same_id(self):
        location = Location(latitude=48.8566, longitude=2.3522)
        self._be_constructed_with(
            station_id="12345",
            name="Station Notre Dame",
            location=location,
            total_docks=30,
            available_docks=5
        )
        other_station = VelibStation(
            station_id="12345",
            name="Different Name",
            location=Location(latitude=0, longitude=0),
            total_docks=10,
            available_docks=2
        )
        self._get_wrapped_object()._should_be_like(other_station)
