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

variable "container_image" {
  type        = string
  description = "The Docker image URI for the backend"
}

variable "cpu" {
  description = "CPU units"
  type        = number
  default     = 256
}

variable "memory" {
  description = "Memory units"
  type        = number
  default     = 512
}

variable "container_port" {
  description = "Container port"
  type        = number
  default     = 3001
}

variable "backend_url" {
  description = "Backend URL for the application"
  type        = string
}

variable "jwt_public_key" {
  description = "ARN of the JWT public key secret"
  type        = string
}