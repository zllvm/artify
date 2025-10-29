variable "service_name" {
  description = "Application that we want to deploy"
  type        = string
}

variable "app_name" {
  description = "Application name"
  type        = string
}

variable "env" {
  description = "Application env"
  type        = string
  default     = "dev"
}
