locals {
  secret_name = var.name_prefix
  secret_json = jsonencode(var.secrets)
}