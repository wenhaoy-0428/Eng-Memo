import os
LOGS_DIR = 'logs/'
os.makedirs(LOGS_DIR, exist_ok=True)

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'EngMemo.logging.LogRequestMiddleware'
]

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        "simple": {
            "format": "{levelname} {asctime} {ip} {funcName} {user} {message}",
            "style": "{",
        },
    },
    'filters': {
        'require_debug_false': {
            "()": "django.utils.log.RequireDebugFalse",
        },
        'request_filter': {
            '()': 'EngMemo.logging.RequestFilter',
        }
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOGS_DIR + 'api.log',
            'maxBytes': 1024 * 1024,  # 1 MB
            'backupCount': 5,  # Number of backup log files to keep
            'formatter': 'simple',
            'filters': ['require_debug_false', 'request_filter'],
        },
    },
    'loggers': {
        'api_log': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
