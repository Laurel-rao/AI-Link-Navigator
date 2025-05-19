# Use official Python 3.9 slim image as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file to the working directory
COPY requirements.txt ./

# Install any needed packages specified in requirements.txt
# Also, install build-essential for Pillow and other C-extension packages
# Install common fonts that might be used by Pillow for CAPTCHA if specific fonts aren't bundled
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    # Add libraries for Pillow image formats if needed during Pillow installation
    # libjpeg62-turbo-dev \
    # zlib1g-dev \
    # libpng-dev \
    # A common font package that PIL might fall back to or use:
    fonts-dejavu-core \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the rest of the application code to the working directory
COPY . .

# Make port 5002 available to the world outside this container
EXPOSE 5002

# Define environment variables (can be overridden by docker-compose)
ENV FLASK_APP=app.py
ENV FLASK_ENV=development
# Note: FLASK_RUN_HOST and FLASK_RUN_PORT are for the 'flask run' command.
# Since we run 'python app.py' directly, and app.py specifies host/port,
# these are not strictly needed here but are good for documentation if using 'flask run'.

# Command to run the application
CMD ["python", "app.py"] 