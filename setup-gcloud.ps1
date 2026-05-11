# VoteSmart AI — Google Cloud Setup Script
# Run this ONCE before first deployment
# Project: vote-495216

$PROJECT_ID = "vote-495216"
$REGION = "asia-south1"
$GEMINI_KEY = "AIzaSyD-ToyXKYHAKqOyZRRw-JUAmHsvyT8ITFo"

Write-Host "Setting up Google Cloud for VoteSmart AI..." -ForegroundColor Cyan

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
Write-Host "Enabling APIs..." -ForegroundColor Yellow
gcloud services enable `
  cloudbuild.googleapis.com `
  run.googleapis.com `
  containerregistry.googleapis.com `
  secretmanager.googleapis.com

# Store Gemini API key in Secret Manager
Write-Host "Storing Gemini API key in Secret Manager..." -ForegroundColor Yellow
$GEMINI_KEY | gcloud secrets create gemini-api-key --data-file=- 2>$null
if (-not $?) {
  # Secret already exists — update it
  $GEMINI_KEY | gcloud secrets versions add gemini-api-key --data-file=-
}

# Grant Cloud Build access to Secret Manager
$PROJECT_NUMBER = (gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding gemini-api-key `
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor"

# Grant Cloud Build permission to deploy to Cloud Run
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" `
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" `
  --role="roles/iam.serviceAccountUser"

Write-Host ""
Write-Host "Setup complete! Now run:" -ForegroundColor Green
Write-Host "  gcloud builds submit --config=cloudbuild.yaml ." -ForegroundColor White
Write-Host ""
Write-Host "Or connect your GitHub repo for automatic deploys:" -ForegroundColor Green
Write-Host "  https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID" -ForegroundColor White
