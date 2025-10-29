locals {
  region = "eu-east-1"

  service_name = "${var.service_name}-${var.app_name}"
  env_service_name = "${var.env}-${local.service_name}"

  secret_keys = [
    "JWT_PUBLIC_KEY", "JWT_ALGORITHM",
    "JWT_AUDIENCE", "JWT_ISSUER"
  ]

  tags = {
    Environment = var.env
    Service     = local.service_name
    ManagedBy   = "Terraform"
  }
}