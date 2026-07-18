from specify import ObjectBehavior
from src.ui.voice_input_button import VoiceInputButton


class VoiceInputButtonSpec(ObjectBehavior):
    """Spec for VoiceInputButton UI component"""

    def _let(self):
        self._describe(VoiceInputButton)

    def it_should_be_constructed_without_arguments(self):
        self._be_constructed_with()
        self._get_wrapped_object()._should_be_an_instance_of(VoiceInputButton)

    def it_should_have_is_recording_property(self):
        self._be_constructed_with()
        self._get_wrapped_object().is_recording._should_be_like(False)

    def it_should_allow_setting_is_recording(self):
        self._be_constructed_with()
        self._get_wrapped_object().is_recording = True
        self._get_wrapped_object().is_recording._should_be_like(True)

    def it_should_have_on_click_callback_property(self):
        self._be_constructed_with()
        callback = lambda: None
        self._get_wrapped_object().on_click = callback
        self._get_wrapped_object().on_click._should_be_like(callback)

    def it_should_have_render_method(self):
        self._be_constructed_with()
        self._get_wrapped_object().render._should_be_callable()

    def it_should_have_html_representation(self):
        self._be_constructed_with()
        html = self._get_wrapped_object().render()
        "button" in html._should_be_like(True)

    def it_should_show_microphone_icon_when_not_recording(self):
        self._be_constructed_with()
        self._get_wrapped_object().is_recording = False
        html = self._get_wrapped_object().render()
        "microphone" in html._should_be_like(True)

    def it_should_show_recording_indicator_when_recording(self):
        self._be_constructed_with()
        self._get_wrapped_object().is_recording = True
        html = self._get_wrapped_object().render()
        "recording" in html._should_be_like(True)

    def it_should_have_label_property(self):
        self._be_constructed_with()
        self._get_wrapped_object().label = "Speak destination"
        self._get_wrapped_object().label._should_be_like("Speak destination")

    def it_should_display_label_in_html(self):
        self._be_constructed_with()
        self._get_wrapped_object().label = "Speak destination"
        html = self._get_wrapped_object().render()
        "Speak destination" in html._should_be_like(True)
