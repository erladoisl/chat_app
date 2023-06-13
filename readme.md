ChatApp
=============
This is an app for messaging between multiple users. Implemented based on Django user models. Messages are exchanged using a web-socket. The client part is implemented in React.

# Requirements
python 3.9.16

# Runing server part
Run from __chat_app__ folder:
1. `pip install -r requirements.txt`
2. `python manage.py migrate`
3. `python manage.py createsuperuser` and set username and password
4. `python manage.py runserver` and go to http://localhost:8000/admin/ to create another users


# Runing client part
Run from __chat-frontend__ folder:
1. `npm i`
2. `npm start`, go to http://localhost:3000/