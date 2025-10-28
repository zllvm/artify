variable "service_name" {
  description = "Application that we want to deploy"
  type        = string
}

variable "env" {
  description = "Application env"
  type        = string
  default     = "dev"
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  sensitive   = true
  type        = string
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  sensitive   = true
  type        = string
}

variable "google_redirect_uri" {
  description = "Google OAuth Redirect URI"
  type        = string
}

variable "openai_api_key" {
  description = "OpenAI API Key"
  sensitive   = true
  type        = string
}

variable "jwt_private_key" {
  description = "JWT Private Key"
  sensitive   = true
  type        = string
}

variable "jwt_public_key" {
  description = "JWT Public Key"
  type        = string
}