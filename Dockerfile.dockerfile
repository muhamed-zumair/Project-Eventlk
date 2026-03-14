# 1. Use an official, lightweight Python runtime
FROM python:3.10-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy your code, .pkl files, and dataset into the container
# (We exclude the .env file later so your key doesn't leak!)
COPY . .

# 5. Expose the port the app runs on
EXPOSE 8000

# 6. Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]