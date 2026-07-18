from specify import ObjectBehavior
from src.services.orientation_service import OrientationService


class OrientationServiceSpec(ObjectBehavior):
    """Spec for OrientationService"""

    def _let(self):
        self._describe(OrientationService)

    def it_should_be_constructed_without_arguments(self):
        self._be_constructed_with()
        self._get_wrapped_object()._should_be_an_instance_of(OrientationService)

    def it_should_have_get_current_heading_method(self):
        self._be_constructed_with()
        callable(self._get_wrapped_object().get_current_heading)._should_be_like(True)

    def it_should_return_heading_between_0_and_360(self):
        self._be_constructed_with()
        # Mock the browser API for testing
        heading = self._get_wrapped_object().get_current_heading()
        # Heading should be between 0 and 360 degrees
        (0 <= heading <= 360)._should_be_like(True)

    def it_should_have_start_listening_method(self):
        self._be_constructed_with()
        callable(self._get_wrapped_object().start_listening)._should_be_like(True)

    def it_should_have_stop_listening_method(self):
        self._be_constructed_with()
        callable(self._get_wrapped_object().stop_listening)._should_be_like(True)

    def it_should_have_on_heading_change_callback_property(self):
        self._be_constructed_with()
        callback = lambda h: None
        self._get_wrapped_object().on_heading_change = callback
        self._get_wrapped_object().on_heading_change._should_be_like(callback)
