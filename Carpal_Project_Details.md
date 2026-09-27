# Carpal API Documentation

<img src="https://centrelocusdemo.cloud/centrelocus/wp-content/uploads/2024/02/CL-1.png" alt="Centrelocus Logo" width="120" height="120"> <img src="https://www.djangoproject.com/s/img/logos/django-logo-positive.png" alt="Django Logo" width="180" height="120" style="margin-left: 20px;"> <img src="https://www.python.org/static/community_logos/python-logo.png" alt="Python Logo" width="180" height="120" style="margin-left: 20px;"> <img src="https://wiki.postgresql.org/images/3/30/PostgreSQL_logo.3colors.120x120.png" alt="PostgreSQL Logo" width="120" height="120" style="margin-left: 20px;">

- Carpal is a Django REST Framework project that provides various APIs for the Carpal Web Platform. 
- The project is divided into several folders. Which folder contains which table is written below in the Database Schema section.

## Table of Contents
- [Create Virtual Environment](#create-virtual-environment)
- [Installation](#installation)
- [Database Schema](#database-schema)
- [Usage](#usage)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)


## Create Virtual Environment
1. **In Windows**
    ```bash
    python -m venv ."name"
    .name\Scripts\activate
    ```

2. **In macOS/Ubuntu**
    ```bash
    python3 -m venv ./name
    source ./name/bin/activate
    ```


## Installation
To run the project locally, follow these steps:


1. **Clone the repository:**
    ```bash
    git clone https://shiladityam@bitbucket.org/centrelocus/carpal-django.git
    ```

2. **Install the project dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3. **Apply database migrations:**
    ```bash
    python manage.py makemigrations app
    python manage.py migrate
    ```

4. **Run the development server:**
    ```bash
    python manage.py runserver
    ```

Now, the Carpal API should be running locally. You can access it at http://127.0.0.1:8000/.


## Database Schema