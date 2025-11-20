locals {
  region = "eu-east-1"

  service_name = "${var.service_name}-${var.app_name}"
  env_service_name = "${var.env}-${local.service_name}"
  domain = var.domain_name
  # domain = "${var.service_name}.${var.domain_name}"

   secret_keys = [
    "SENTRY_AUTH_TOKEN","SERVICE_CLIENT_ID","SERVICE_CLIENT_SECRET","HEALTH_CHECK_SECRET"
  ]


  tags = {
    Environment = var.env
    Service     = local.service_name
    ManagedBy   = "Terraform"
  }
}