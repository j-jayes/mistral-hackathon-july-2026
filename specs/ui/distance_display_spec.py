from specify import ObjectBehavior
from src.ui.distance_display import DistanceDisplay


class DistanceDisplaySpec(ObjectBehavior):
    """Spec for DistanceDisplay UI component"""

    def _let(self):
        self._describe(DistanceDisplay)

    def it_should_be_constructed_without_arguments(self):
        self._be_constructed_with()
        self._get_wrapped_object()._should_be_an_instance_of(DistanceDisplay)

    def it_should_have_distance_property(self):
        self._be_constructed_with()
        self._get_wrapped_object().distance._should_be_like(None)

    def it_should_allow_setting_distance(self):
        self._be_constructed_with()
        self._get_wrapped_object().distance = 150.5
        self._get_wrapped_object().distance._should_be_like(150.5)

    def it_should_have_units_property(self):
        self._be_constructed_with()
        self._get_wrapped_object().units._should_be_like("meters")

    def it_should_allow_setting_units(self):
        self._be_constructed_with()
        self._get_wrapped_object().units = "km"
        self._get_wrapped_object().units._should_be_like("km")

    def it_should_have_render_method(self):
        self._be_constructed_with()
        self._get_wrapped_object().render._should_be_callable()

    def it_should_have_html_representation(self):
        self._be_constructed_with()
        self._get_wrapped_object().distance = 150.5
        html = self._get_wrapped_object().render()
        "distance" in html._should_be_like(True)

    def it_should_display_distance_correctly_in_meters(self):
        self._be_constructed_with()
        self._get_wrapped_object().distance = 150.5
        self._get_wrapped_object().units = "meters"
        html = self._get_wrapped_object().render()
        "150.5" in html._should_be_like(True)
        "m" in html._should_be_like(True)

    def it_should_display_distance_correctly_in_km(self):
        self._be_constructed_with()
        self._get_wrapped_object().distance = 1500.5
        self._get_wrapped_object().units = "km"
        html = self._get_wrapped_object().render()
        "1.50" in html._should_be_like(True)
        "km" in html._should_be_like(True)

    def it_should_handle_none_distance_gracefully(self):
        self._be_constructed_with()
        self._get_wrapped_object().distance = None
        html = self._get_wrapped_object().render()
        "distance" in html._should_be_like(True)
