locals {
  region = "eu-east-1"

  service_name = "${var.service_name}-${var.app_name}"
  env_service_name = "${var.env}-${local.service_name}"
  backend_domain = "${var.service_name}.${var.domain_name}"

  secret_keys = [
    "OPENAI_API_KEY", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", 
    "GOOGLE_REDIRECT_URI", "JWT_PRIVATE_KEY", "JWT_PUBLIC_KEY",
    "JWT_ALGORITHM", "JWT_AUDIENCE", "JWT_ISSUER"
  ]

  tags = {
    Environment = var.env
    Service     = local.service_name
    ManagedBy   = "Terraform"
  }
}