from specify import ObjectBehavior
from src.domain.location import Location
from src.services.geolocation_service import GeolocationService


class GeolocationServiceSpec(ObjectBehavior):
    """Spec for GeolocationService"""

    def _let(self):
        self._describe(GeolocationService)

    def it_should_be_constructed_without_arguments(self):
        self._be_constructed_with()
        self._get_wrapped_object()._should_be_an_instance_of(GeolocationService)

    def it_should_have_get_current_location_method(self):
        self._be_constructed_with()
        callable(self._get_wrapped_object().get_current_location)._should_be_like(True)

    def it_should_return_location_object_from_get_current_location(self):
        self._be_constructed_with()
        # Note: This will fail in test environment without browser, 
        # but we're testing the interface
        location = self._get_wrapped_object().get_current_location()
        location._should_be_an_instance_of(Location)
