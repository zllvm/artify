locals {
  region = "eu-east-1"

  tags = {
    Environment = var.env
    Service     = var.service_name
    ManagedBy   = "Terraform"
  }
}