variable "name_prefix" {
  description = "Prefix for resource names, e.g. 'artify'"
  type        = string
}

variable "env" {
  description = "Environment name (dev|staging|prod)"
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
