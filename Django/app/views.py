""" 
Hay que instalar esto antes de ejecutar:
    - pip install django djangorestframework
    - pip install django-cors-headers
    - pip install google.generativeai
    - pip install dotenv
    - Arrancar el Servidor: python manage.py runserver 
"""

from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
import os
from dotenv import load_dotenv
import google.generativeai as gen_ai

# Load environment variables
load_dotenv()

GOOGLE_API_KEY = "AIzaSyBgMaYQkaDOv-4OGykVdXLPZcTrN9dM-WY"
GOOGLE_API_KEY1 = os.getenv("GOOGLE_API_KEY")

# Set up Google Gemini-Pro AI model
gen_ai.configure(api_key=GOOGLE_API_KEY1)
model = gen_ai.GenerativeModel("gemini-pro")

# Start chat session
chat_session = model.start_chat(history=[])


# Function to translate roles between Gemini-Pro and Streamlit terminology
def translate_role(user_role):
    if user_role == "model":
        return "assistant"
    else:
        return user_role


@csrf_exempt
def chatbot_view(request):
    if request.method == "GET":
        response_data = {
            "message": "Hola. Has realizado una solicitud GET a la página de inicio."
        }
        return JsonResponse(response_data)

    elif request.method == "POST":
        # Get user prompt from POST data
        user_prompt = request.POST.get("prompt", "")
        if user_prompt:
            # Send user's message to Gemini-Pro and get the response
            gemini_response = chat_session.send_message(user_prompt)

            # Return Gemini-Pro's response
            response_data = {"message": gemini_response.text}
        else:
            response_data = {
                "error": "No se proporcionó ningún prompt de usuario en la solicitud POST."
            }

        return JsonResponse(response_data)
    else:
        return HttpResponse(status=405)
