FROM node:18 AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM python:3.12-slim
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend from previous stage to backend static folder
COPY --from=frontend-builder /app/dist ./frontend_dist

# Expose backend port
EXPOSE 8000

# Run backend (make sure your FastAPI app serves /static)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]