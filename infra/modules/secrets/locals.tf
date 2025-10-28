locals {
  secret_name = "${var.name_prefix}-${var.env}"
  secret_json = jsonencode(var.secrets)
}