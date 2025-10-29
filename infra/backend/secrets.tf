module "json_secret" {
  source = "../modules/secrets"
  name_prefix = local.env_service_name
  description = "Contains artify secrets"
  
  tags = local.tags
}