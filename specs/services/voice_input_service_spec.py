from specify import ObjectBehavior
from src.domain.user_input import VoiceInput, UserInput
from src.services.voice_input_service import VoiceInputService


class VoiceInputServiceSpec(ObjectBehavior):
    """Spec for VoiceInputService using Mistral Vox"""

    def _let(self):
        self._describe(VoiceInputService)

    def it_should_be_constructed_without_arguments(self):
        self._be_constructed_with()
        self._get_wrapped_object()._should_be_an_instance_of(VoiceInputService)

    def it_should_have_start_recording_method(self):
        self._be_constructed_with()
        self._get_wrapped_object().start_recording._should_be_callable()

    def it_should_have_stop_recording_method(self):
        self._be_constructed_with()
        self._get_wrapped_object().stop_recording._should_be_callable()

    def it_should_have_is_recording_property(self):
        self._be_constructed_with()
        self._get_wrapped_object().is_recording._should_be_like(False)

    def it_should_have_on_transcript_callback_property(self):
        self._be_constructed_with()
        callback = lambda text: None
        self._get_wrapped_object().on_transcript = callback
        self._get_wrapped_object().on_transcript._should_be_like(callback)

    def it_should_have_on_error_callback_property(self):
        self._be_constructed_with()
        callback = lambda error: None
        self._get_wrapped_object().on_error = callback
        self._get_wrapped_object().on_error._should_be_like(callback)

    def it_should_have_supported_languages_property(self):
        self._be_constructed_with()
        languages = self._get_wrapped_object().supported_languages
        "fr" in languages._should_be_like(True)
        "en" in languages._should_be_like(True)

    def it_should_set_language_correctly(self):
        self._be_constructed_with()
        self._get_wrapped_object().language = "fr"
        self._get_wrapped_object().language._should_be_like("fr")
