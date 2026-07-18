from specify import ObjectBehavior
from src.domain.user_input import UserInput, DestinationInput
from src.services.llm_service import LLMService


class LLMServiceSpec(ObjectBehavior):
    """Spec for LLMService using small Mistral model"""

    def _let(self):
        self._describe(LLMService)

    def it_should_be_constructed_without_arguments(self):
        self._be_constructed_with()
        self._get_wrapped_object()._should_be_an_instance_of(LLMService)

    def it_should_have_extract_destination_method(self):
        self._be_constructed_with()
        self._get_wrapped_object().extract_destination._should_be_callable()

    def it_should_extract_destination_from_simple_address(self):
        self._be_constructed_with()
        user_input = UserInput(raw_text="I am going to 21 rue des Gravilliers")
        destination = self._get_wrapped_object().extract_destination(user_input)
        destination._should_be_an_instance_of(DestinationInput)
        destination.address._should_be_like("21 rue des Gravilliers")

    def it_should_extract_destination_from_complex_query(self):
        self._be_constructed_with()
        user_input = UserInput(raw_text="Can you find me a velib station near Eiffel Tower?")
        destination = self._get_wrapped_object().extract_destination(user_input)
        destination._should_be_an_instance_of(DestinationInput)
        "Eiffel Tower" in destination.address._should_be_like(True)

    def it_should_extract_destination_from_french_text(self):
        self._be_constructed_with()
        user_input = UserInput(raw_text="Je vais au 21 rue des Gravilliers")
        destination = self._get_wrapped_object().extract_destination(user_input)
        destination._should_be_an_instance_of(DestinationInput)
        "21 rue des Gravilliers" in destination.address._should_be_like(True)

    def it_should_have_model_name_property(self):
        self._be_constructed_with()
        model_name = self._get_wrapped_object().model_name
        "mistral" in model_name._should_be_like(True)

    def it_should_have_is_ready_property(self):
        self._be_constructed_with()
        self._get_wrapped_object().is_ready._should_be_like(True)
