import sys
import django
from account.models import UserProfile
from django.contrib.auth.models import User

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')
# django.setup()


def create_user_profiles(dry_run=False):
    users = User.objects.all()

    for user in users:
        if not dry_run:
            UserProfile.objects.get_or_create(user=user)
        else:
            print(f"Creating UserProfile for user: {user.username} (Dry Run)")

    if not dry_run:
        print('User profiles created successfully!')
    else:
        print('Dry run completed. No changes were made.')


# Check if the script is run with a dry run flag
if "--dry-run" in sys.argv:
    create_user_profiles(dry_run=True)
else:
    create_user_profiles()
