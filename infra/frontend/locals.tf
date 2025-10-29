locals {
  region = "eu-east-1"

  service_name = "${var.service_name}-${var.app_name}"
  env_service_name = "${var.env}-${local.service_name}"
  
  tags = {
    Environment = var.env
    Service     = local.service_name
    ManagedBy   = "Terraform"
  }
}