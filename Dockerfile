FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY game /app/game
COPY database /app/database
COPY backend /app/backend

ENV PYTHONPATH=/app
EXPOSE 8000

CMD ["uvicorn", "backend.fastAPICode:fastAPICode", "--host", "0.0.0.0", "--port", "8000"]
