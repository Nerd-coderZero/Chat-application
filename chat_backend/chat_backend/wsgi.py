import os
import sys

path = '/home/KJZERO/chat_backend/chat_backend'
if path not in sys.path:
    sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'chat_backend.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()