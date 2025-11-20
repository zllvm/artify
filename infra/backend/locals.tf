locals {
  region = "eu-east-1"

  service_name = "${var.service_name}-${var.app_name}"
  env_service_name = "${var.env}-${local.service_name}"
  domain = var.domain_name
  # domain = "${var.service_name}.${var.domain_name}"

  secret_keys = [
    "OPENAI_API_KEY", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", 
    "GOOGLE_REDIRECT_URI", "JWT_PRIVATE_KEY", "JWT_PUBLIC_KEY",
    "JWT_ALGORITHM", "JWT_AUDIENCE", "JWT_ISSUER","PINTEREST_URL",
    "PINTEREST_CLIENT_ID", "PINTEREST_CLIENT_SECRET", "PINTEREST_REDIRECT_URI",
    "PINTEREST_TOKEN_URL","ADMIN_EMAILS","JWT_SERVICE_AUDIENCE","JWT_SERVICE_ISSUER",
    "JWT_SERVICE_EXPIRES_IN",
    "SERVICE_CLIENT_ID","SERVICE_CLIENT_SECRET",
    "HEALTH_CHECK_SECRET"
  ]

  tags = {
    Environment = var.env
    Service     = local.service_name
    ManagedBy   = "Terraform"
  }
}