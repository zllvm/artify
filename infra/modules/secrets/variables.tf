variable "name_prefix" {
  description = "Prefix for resource names, e.g. 'artify'"
  type        = string
}

variable "secrets" {
  description = "Map of secret key -> secret value"
  type        = map(string)
  default     = {}
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "kms_policy_json" {
  description = "Optional custom KMS key policy JSON"
  type        = string
  default     = null
}

variable "use_custom_kms" {
  description = "Whether to create and use a customer-managed KMS key"
  type        = bool
  default     = false
}

variable "allowed_principal_arn" {
  description = "ARN of the IAM role or user allowed to read this secret"
  type        = string
  default     = null
}

variable "description" {
  description = "Optional description for the Secrets Manager secret"
  type        = string
  default     = null
}