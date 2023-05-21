import logging
import threading

local = threading.local()


class RequestFilter(logging.Filter):
    def filter(self, record):
        request = getattr(local, 'request', None)
        if request:
            record.ip = request.META.get('REMOTE_ADDR')
            record.user = request.user.username
        else:
            record.ip = '-'
            record.user = '-'
        return True


class LogRequestMiddleware:
    """
    A middleware that stores request object into the thread local storage,
    so that logging filter can access it and populate necessary information to the logs
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        setattr(local, 'request', request)
        return self.get_response(request)
