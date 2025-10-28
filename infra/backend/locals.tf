locals {
  region = "eu-east-1"

  service_name = "${var.env}-${var.service_name}"
  secret_keys = [
    "OPENAI_API_KEY", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", 
    "GOOGLE_REDIRECT_URI", "JWT_PRIVATE_KEY", "JWT_PUBLIC_KEY",
    "JWT_ALGORITHM", "JWT_AUDIENCE", "JWT_ISSUER"
  ]

  tags = {
    Environment = var.env
    Service     = var.service_name
    ManagedBy   = "Terraform"
  }
}