from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return f"{user.pk}{user.is_active}{timestamp}"   

email_verification_token_generator = AccountActivationTokenGenerator()


def sendAccountActivationEmail(user, request):
    subject = "Activate Your EngMemo account Now"
    context = {"domain": get_current_site(request),
               "user": user.username,
               "email": user.email,
               "uid": urlsafe_base64_encode(force_bytes(user.pk)),
               "token": email_verification_token_generator.make_token(user),
               "protocol": "https" if request.is_secure() else 'http'
               }
    html_content = render_to_string("accountActivation.html", context)
    email = EmailMultiAlternatives(subject=subject, to=[user.email])
    email.attach_alternative(html_content, "text/html")
    return email.send()
    
    
    