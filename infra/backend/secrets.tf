module "json_secret" {
  source = "../modules/secrets"
  name_prefix = var.service_name
  description = "Contains artify secrets"
  # secrets = {
  #   GOOGLE_CLIENT_ID = var.google_client_id
  #   GOOGLE_CLIENT_SECRET = var.google_client_secret
  #   GOOGLE_REDIRECT_URI = var.google_redirect_uri
  #   OPENAI_API_KEY = var.openai_api_key
  #   JWT_PRIVATE_KEY = var.jwt_private_key
  #   JWT_PUBLIC_KEY  = var.jwt_public_key
  # }

  tags = local.tags
}