locals {
  region = "eu-east-1"

  service_name = "${var.env}-${var.service_name}"
  tags = {
    Environment = var.env
    Service     = var.service_name
    ManagedBy   = "Terraform"
  }
}