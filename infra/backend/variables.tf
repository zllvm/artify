variable "service_name" {
  description = "Application that we want to deploy"
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
  default     = 80
}

variable "app_port" {
  description = "Container port"
  type        = number
  default     = 3001
}

variable "base_url" {
  description = "Base URL for the application"
  type        = string
}

variable "frontend_url" {
  description = "Frontend URL for the application"
  type        = string
}

variable "desired_count" {
  description = "Desired count of tasks"
  type        = number
  default     = 1
}

variable "api_domain_name" {
  description = "Api domain name"
  type        = string
}

variable "health_endpoint" {
  description = "Api domain name"
  type        = string
  default     = "/api/health"
}
