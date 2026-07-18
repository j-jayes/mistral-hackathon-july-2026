from specify import ObjectBehavior
from src.domain.user_input import UserInput, DestinationInput, VoiceInput


class UserInputSpec(ObjectBehavior):
    """Spec for UserInput domain model"""

    def _let(self):
        self._describe(UserInput)

    def it_should_be_constructed_with_raw_text(self):
        self._be_constructed_with(raw_text="I am going to 21 rue des Gravilliers")
        self._get_wrapped_object()._should_be_an_instance_of(UserInput)

    def it_should_store_raw_text(self):
        self._be_constructed_with(raw_text="I am going to 21 rue des Gravilliers")
        self._get_wrapped_object().raw_text._should_be_like("I am going to 21 rue des Gravilliers")


class DestinationInputSpec(ObjectBehavior):
    """Spec for DestinationInput domain model"""

    def _let(self):
        self._describe(DestinationInput)

    def it_should_be_constructed_with_address(self):
        self._be_constructed_with(address="21 rue des Gravilliers")
        self._get_wrapped_object()._should_be_an_instance_of(DestinationInput)

    def it_should_store_address(self):
        self._be_constructed_with(address="21 rue des Gravilliers")
        self._get_wrapped_object().address._should_be_like("21 rue des Gravilliers")

    def it_should_have_string_representation(self):
        self._be_constructed_with(address="21 rue des Gravilliers")
        str_repr = str(self._get_wrapped_object())
        "21 rue des Gravilliers" in str_repr._should_be_like(True)


class VoiceInputSpec(ObjectBehavior):
    """Spec for VoiceInput domain model"""

    def _let(self):
        self._describe(VoiceInput)

    def it_should_be_constructed_with_audio_data(self):
        self._be_constructed_with(audio_data=b"voice data", language="fr")
        self._get_wrapped_object()._should_be_an_instance_of(VoiceInput)

    def it_should_store_audio_data(self):
        self._be_constructed_with(audio_data=b"voice data", language="fr")
        self._get_wrapped_object().audio_data._should_be_like(b"voice data")

    def it_should_store_language(self):
        self._be_constructed_with(audio_data=b"voice data", language="fr")
        self._get_wrapped_object().language._should_be_like("fr")

    def it_should_default_to_french_language(self):
        self._be_constructed_with(audio_data=b"voice data")
        self._get_wrapped_object().language._should_be_like("fr")
